import { Body, Controller, Get, Inject, Param, Post } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { createToken, DEFAULT_LOCALE, getCurrentUserId, hashPassword, readLocaleText, toLessonDto, toPersonDto } from "../db-utils";
import { PrismaService } from "../database/prisma.service";

type AdminDashboard = {
  users: number;
  lessons: number;
  promoVideos: number;
  messagesToday: number;
};

type AdminLessonBody = {
  title?: unknown;
  description?: unknown;
  sectionId?: unknown;
  durationSeconds?: unknown;
  videoFileName?: unknown;
};

type AdminPromoBody = AdminLessonBody & {
  userId?: unknown;
};

type AdminPromoResponse = {
  id: string;
  title: string;
  description: string;
  sourcePath: string | null;
  hlsManifestPath: string | null;
  thumbnailPath: string | null;
  durationSeconds: number | null;
  isShareable: boolean;
  shareToken: string | null;
  shareUrl: string | null;
  userId: string;
  status: string;
};

@Controller("admin")
export class AdminController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("dashboard")
  async dashboard(): Promise<AdminDashboard> {
    const [users, lessons, promoVideos, messagesToday] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.lesson.count(),
      this.prisma.promoVideo.count(),
      this.prisma.directMessage.count({
        where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      }),
    ]);

    return { users, lessons, promoVideos, messagesToday };
  }

  @Post("users/:id/reset-password")
  async resetPassword(@Param("id") id: string): Promise<{ userId: string; temporaryPassword: string }> {
    const temporaryPassword = createToken("Temp").slice(0, 14);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: hashPassword(temporaryPassword) },
    });

    await this.audit("USER_PASSWORD_RESET", `user:${id}`, { temporaryPasswordShown: true });
    return { userId: id, temporaryPassword };
  }

  @Post("lessons")
  async createLesson(@Body() body: AdminLessonBody): Promise<ReturnType<typeof toLessonDto>> {
    const sectionId = typeof body.sectionId === "string" && body.sectionId ? body.sectionId : "section_food";
    const section = await this.prisma.section.findUniqueOrThrow({ where: { id: sectionId } });
    const title = this.resolveText(body.title, "Yangi professional dars");
    const description = this.resolveText(body.description, "Admin panel orqali yuklangan video dars.");
    const durationSeconds = typeof body.durationSeconds === "number" ? Math.max(1, Math.round(body.durationSeconds)) : 1200;
    const lessonId = createToken("lesson");

    const lesson = await this.prisma.lesson.create({
      data: {
        id: lessonId,
        industryId: section.industryId,
        sectionId: section.id,
        uploadedById: getCurrentUserId(),
        titles: this.localeText(title),
        descriptions: this.localeText(description),
        hlsManifestPath: `/storage/videos/${lessonId}/master.m3u8`,
        thumbnailPath: `/storage/videos/${lessonId}/thumbnail.webp`,
        sourcePath: this.resolveStoragePath(body.videoFileName, `${lessonId}.mp4`),
        durationSeconds,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
      include: {
        uploadedBy: { include: { profile: true } },
        progress: { where: { userId: getCurrentUserId() } },
      },
    });

    await this.audit("LESSON_CREATED", `lesson:${lesson.id}`, { title: readLocaleText(lesson.titles) });
    return toLessonDto(lesson);
  }

  @Post("promo-videos")
  async attachPromoVideo(@Body() body: AdminPromoBody): Promise<AdminPromoResponse> {
    const userId = typeof body.userId === "string" && body.userId ? body.userId : "user_1";
    const title = this.resolveText(body.title, "Yangi Mening saytim videosi");
    const description = this.resolveText(body.description, "Mijoz biznesi haqida professional video.");
    const promoId = createToken("promo");
    const promo = await this.prisma.promoVideo.create({
      data: {
        id: promoId,
        userId,
        uploadedById: getCurrentUserId(),
        titles: this.localeText(title),
        descriptions: this.localeText(description),
        hlsManifestPath: `/storage/promo-videos/${promoId}/master.m3u8`,
        thumbnailPath: `/storage/promo-videos/${promoId}/thumbnail.webp`,
        sourcePath: this.resolveStoragePath(body.videoFileName, `${promoId}.mp4`),
        durationSeconds: typeof body.durationSeconds === "number" ? Math.max(1, Math.round(body.durationSeconds)) : 180,
        status: "PUBLISHED",
        isShareable: true,
        shareToken: createToken("promo-share"),
      },
    });

    await this.audit("PROMO_VIDEO_ATTACHED", `promo:${promo.id}`, { userId });
    return {
      id: promo.id,
      title,
      description,
      sourcePath: promo.sourcePath,
      hlsManifestPath: promo.hlsManifestPath,
      thumbnailPath: promo.thumbnailPath,
      durationSeconds: promo.durationSeconds,
      isShareable: promo.isShareable,
      shareToken: promo.shareToken,
      shareUrl: promo.shareToken ? `https://biznesjon.uz/share/promo/${promo.shareToken}` : null,
      userId,
      status: promo.status,
    };
  }

  @Post("messages/direct")
  async sendDirectMessage(@Body() body: { userId?: unknown; text?: unknown }): Promise<{ ok: true; messageId: string }> {
    const userId = typeof body.userId === "string" && body.userId ? body.userId : "";
    const text = typeof body.text === "string" && body.text.trim() ? body.text.trim() : "";
    if (!userId || !text) throw new Error("userId va text majburiy");

    const message = await this.prisma.directMessage.create({
      data: { senderId: getCurrentUserId(), receiverId: userId, type: "TEXT", text, status: "SENT" },
    });

    await this.prisma.notification.create({
      data: {
        userId,
        type: "DIRECT_MESSAGE",
        title: "Biznesjon jamoasidan xabar",
        body: text.slice(0, 100),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await this.audit("ADMIN_DIRECT_MESSAGE", `user:${userId}`, { messageId: message.id });
    return { ok: true, messageId: message.id };
  }

  @Post("announcements")
  async sendAnnouncement(@Body() body: { title?: unknown; text?: unknown }): Promise<{ ok: true; count: number }> {
    const title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : "Biznesjon e'loni";
    const text = typeof body.text === "string" && body.text.trim() ? body.text.trim() : "";
    if (!text) throw new Error("E'lon matni majburiy");

    const users = await this.prisma.user.findMany({ select: { id: true } });
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        type: "ADMIN_ANNOUNCEMENT" as const,
        title,
        body: text,
        expiresAt,
      })),
    });

    await this.audit("ADMIN_ANNOUNCEMENT", "all-users", { title, userCount: users.length });
    return { ok: true, count: users.length };
  }

  @Get("industries-tree")
  async industriesTree(): Promise<unknown[]> {
    const [industries, sections, userCounts] = await Promise.all([
      this.prisma.industry.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
      this.prisma.section.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
      this.prisma.user.groupBy({ by: ["sectionId"], _count: { id: true } }),
    ]);

    const countMap = new Map<string, number>(
      userCounts.map((r) => [r.sectionId ?? "", r._count.id]),
    );

    return industries.map((ind) => ({
      id: ind.id,
      name: readLocaleText(ind.names),
      icon: ind.icon,
      sections: sections
        .filter((s) => s.industryId === ind.id)
        .map((s) => ({
          id: s.id,
          name: readLocaleText(s.names),
          icon: s.icon,
          userCount: countMap.get(s.id) ?? 0,
        })),
    }));
  }

  @Get("users")
  async users(): Promise<ReturnType<typeof toPersonDto>[]> {
    const users = await this.prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return users.map((user) => toPersonDto(user));
  }

  @Get("users/by-section/:sectionId")
  async usersBySection(@Param("sectionId") sectionId: string): Promise<ReturnType<typeof toPersonDto>[]> {
    const users = await this.prisma.user.findMany({
      where: { sectionId },
      include: { profile: true },
      orderBy: { createdAt: "desc" },
    });

    return users.map((user) => toPersonDto(user));
  }

  @Get("audit-logs")
  async auditLogs(): Promise<unknown[]> {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  private resolveText(value: unknown, fallback: string): string {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }

  private localeText(value: string): Record<string, string> {
    return {
      [DEFAULT_LOCALE]: value,
      "uz-Cyrl": value,
      ru: value,
      en: value,
    };
  }

  private resolveStoragePath(value: unknown, fallback: string): string {
    const resolved = this.resolveText(value, fallback);
    if (resolved.startsWith("http://") || resolved.startsWith("https://")) return resolved;
    if (resolved.startsWith("/storage/")) return resolved;
    return `/storage/uploads/${resolved}`;
  }

  private async audit(action: string, target: string, metadata: Record<string, unknown>): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorId: getCurrentUserId(),
        action,
        target,
        metadata: metadata as Prisma.InputJsonValue,
      },
    });
  }
}
