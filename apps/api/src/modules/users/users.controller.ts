import { Body, Controller, Delete, Get, Inject, Param, Post, Query } from "@nestjs/common";
import { getCurrentUserId, toLessonDto, toPersonDto, type LessonDto, type PersonDto } from "../db-utils";
import { PrismaService } from "../database/prisma.service";

type UsernameCheckResponse = {
  available: boolean;
  suggestions: string[];
};

@Controller()
export class UsersController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("me")
  async getMe(): Promise<unknown> {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: getCurrentUserId() },
      include: { profile: true, promoVideos: true },
    });
  }

  @Post("me")
  async updateMe(@Body() body: {
    firstName?: unknown;
    lastName?: unknown;
    username?: unknown;
    sectionId?: unknown;
    industryId?: unknown;
    language?: unknown;
    businessName?: unknown;
    city?: unknown;
    bio?: unknown;
  }): Promise<{
    id: string; phone: string; role: string; language: string;
    industryId: string | null; sectionId: string | null;
    profile: { firstName: string; lastName: string; username: string; businessName: string | null; city: string | null; bio: string | null; avatarPath: string | null } | null;
  }> {
    const current = await this.prisma.user.findUniqueOrThrow({
      where: { id: getCurrentUserId() },
      include: { profile: true },
    });
    const firstName = this.resolveText(body.firstName, current.profile?.firstName ?? "Biznesjon");
    const lastName = this.resolveText(body.lastName, current.profile?.lastName ?? "User");
    const username = this.resolveUsername(body.username, current.profile?.username ?? current.id);

    const sectionId = typeof body.sectionId === "string" && body.sectionId.trim() ? body.sectionId.trim() : current.sectionId;
    const language = typeof body.language === "string" && body.language.trim() ? body.language.trim() : current.language;

    const businessName = typeof body.businessName === "string" ? body.businessName.trim().slice(0, 80) || null : current.profile?.businessName ?? null;
    const city = typeof body.city === "string" ? body.city.trim().slice(0, 60) || null : current.profile?.city ?? null;
    const bio = typeof body.bio === "string" ? body.bio.trim().slice(0, 200) || null : current.profile?.bio ?? null;

    let resolvedIndustryId = current.industryId;
    if (typeof body.industryId === "string" && body.industryId.trim()) {
      resolvedIndustryId = body.industryId.trim();
    } else if (sectionId && sectionId !== current.sectionId) {
      const section = await this.prisma.section.findUnique({ where: { id: sectionId } });
      if (section) resolvedIndustryId = section.industryId;
    }

    const user = await this.prisma.user.update({
      where: { id: getCurrentUserId() },
      data: {
        sectionId,
        industryId: resolvedIndustryId,
        language,
        profile: {
          upsert: {
            create: { firstName, lastName, username, businessName, city, bio },
            update: { firstName, lastName, username, businessName, city, bio },
          },
        },
      },
      include: { profile: true },
    });

    return {
      id: user.id,
      phone: user.phone,
      role: user.role,
      language: user.language,
      industryId: user.industryId,
      sectionId: user.sectionId,
      profile: user.profile ? {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        username: user.profile.username,
        businessName: user.profile.businessName,
        city: user.profile.city,
        bio: user.profile.bio,
        avatarPath: user.profile.avatarPath,
      } : null,
    };
  }

  @Post("me/avatar")
  async uploadAvatar(@Body() body: { avatarPath?: unknown }): Promise<PersonDto> {
    const avatarPath = typeof body.avatarPath === "string" && body.avatarPath.trim() ? body.avatarPath.trim() : null;
    const profile = await this.prisma.userProfile.update({
      where: { userId: getCurrentUserId() },
      data: { avatarPath },
      include: { user: true },
    });

    return toPersonDto({
      id: profile.userId,
      sectionId: profile.user.sectionId,
      profile,
    });
  }

  @Delete("me/avatar")
  async deleteAvatar(): Promise<PersonDto> {
    return this.uploadAvatar({ avatarPath: null });
  }

  @Get("me/saved-lessons")
  async savedLessons(): Promise<LessonDto[]> {
    const rows = await this.prisma.savedLesson.findMany({
      where: { userId: getCurrentUserId() },
      orderBy: { createdAt: "desc" },
      include: {
        lesson: {
          include: {
            uploadedBy: { include: { profile: true } },
            progress: { where: { userId: getCurrentUserId() } },
          },
        },
      },
    });

    return rows.map((row) => toLessonDto(row.lesson));
  }

  @Post("me/saved-lessons/:id")
  async saveLesson(@Param("id") id: string): Promise<{ lessonId: string; saved: true }> {
    await this.prisma.savedLesson.upsert({
      where: { userId_lessonId: { userId: getCurrentUserId(), lessonId: id } },
      update: {},
      create: { userId: getCurrentUserId(), lessonId: id },
    });

    return { lessonId: id, saved: true };
  }

  @Get("users")
  async getUsers(@Query("q") query?: string): Promise<PersonDto[]> {
    const myId = getCurrentUserId();
    const me = await this.prisma.user.findUnique({ where: { id: myId }, select: { sectionId: true } });

    if (!me?.sectionId) return [];

    const q = query?.trim().replace(/^@/, "");

    if (q) {
      const users = await this.prisma.user.findMany({
        where: {
          id: { not: myId },
          sectionId: me.sectionId,
          profile: {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { username: { contains: q, mode: "insensitive" } },
              { businessName: { contains: q, mode: "insensitive" } },
            ],
          },
        },
        include: { profile: true },
        take: 50,
      });
      return users.map((user, index) => toPersonDto(user, index < 2));
    }

    const users = await this.prisma.user.findMany({
      where: { id: { not: myId }, sectionId: me.sectionId },
      include: { profile: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return users.map((u, i) => toPersonDto(u, i < 2));
  }

  @Get("users/by-username/:username")
  async getByUsername(@Param("username") username: string): Promise<PersonDto | null> {
    const normalized = username.replace(/^@/, "");
    const user = await this.prisma.user.findFirst({
      where: { profile: { username: normalized } },
      include: { profile: true },
    });

    return user ? toPersonDto(user, true) : null;
  }

  @Get("users/check-username")
  async checkUsername(@Query("username") username?: string): Promise<UsernameCheckResponse> {
    const raw = (username ?? "").replace(/^@/, "").toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!raw || raw.length < 3 || raw.length > 20) {
      return { available: false, suggestions: [] };
    }

    const existing = await this.prisma.userProfile.findUnique({ where: { username: raw } });
    if (!existing) {
      return { available: true, suggestions: [] };
    }

    const suggestions = await this.generateSuggestions(raw);
    return { available: false, suggestions };
  }

  private async generateSuggestions(base: string): Promise<string[]> {
    const candidates = [`${base}1`, `${base}2`, `${base}3`, `${base}_uz`, `${base}2025`];
    const available: string[] = [];

    for (const candidate of candidates) {
      if (available.length >= 3) break;
      const exists = await this.prisma.userProfile.findUnique({ where: { username: candidate } });
      if (!exists) available.push(candidate);
    }

    return available;
  }

  private resolveText(value: unknown, fallback: string): string {
    return typeof value === "string" && value.trim() ? value.trim().slice(0, 60) : fallback;
  }

  private resolveUsername(value: unknown, fallback: string): string {
    if (typeof value !== "string") return fallback;
    const username = value.trim().replace(/^@/, "").toLowerCase().replace(/[^a-z0-9._-]+/g, "");
    return username.length >= 3 ? username.slice(0, 32) : fallback;
  }
}
