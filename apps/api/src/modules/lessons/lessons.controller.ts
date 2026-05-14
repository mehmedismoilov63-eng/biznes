import { Body, Controller, Get, Inject, NotFoundException, Param, Post } from "@nestjs/common";
import { LessonStatus } from "@prisma/client";
import { getCurrentUserId, toGroupDto, toLessonDto, toPersonDto, type GroupDto, type LessonDto, type PersonDto } from "../db-utils";
import { PrismaService } from "../database/prisma.service";

type HomeFeedResponse = {
  mySite: unknown;
  continueWatching: LessonDto[];
  newest: LessonDto[];
  popular: LessonDto[];
  myGroups: GroupDto[];
  newPeople: PersonDto[];
};

@Controller("lessons")
export class LessonsController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async list(): Promise<LessonDto[]> {
    const myId = getCurrentUserId();
    const me = await this.prisma.user.findUnique({ where: { id: myId }, select: { sectionId: true } });
    const lessons = await this.prisma.lesson.findMany({
      where: { status: LessonStatus.PUBLISHED, ...(me?.sectionId ? { sectionId: me.sectionId } : {}) },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: {
        uploadedBy: { include: { profile: true } },
        progress: { where: { userId: myId } },
      },
    });

    return lessons.map((lesson) => toLessonDto(lesson));
  }

  @Get("feed/home")
  async homeFeed(): Promise<HomeFeedResponse> {
    const myId = getCurrentUserId();
    const me = await this.prisma.user.findUnique({ where: { id: myId }, select: { sectionId: true } });
    const sectionId = me?.sectionId ?? null;

    const [lessonRows, groups, users, promo] = await Promise.all([
      this.prisma.lesson.findMany({
        where: { status: LessonStatus.PUBLISHED, ...(sectionId ? { sectionId } : {}) },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        include: {
          uploadedBy: { include: { profile: true } },
          progress: { where: { userId: myId } },
        },
      }),
      this.prisma.groupChat.findMany({
        where: { memberships: { some: { userId: myId } } },
        include: { memberships: true },
        orderBy: { updatedAt: "desc" },
      }),
      sectionId
        ? this.prisma.user.findMany({
            where: { id: { not: myId }, sectionId },
            include: { profile: true },
            orderBy: { createdAt: "desc" },
            take: 12,
          })
        : Promise.resolve([]),
      this.prisma.promoVideo.findFirst({
        where: { userId: myId, status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const mappedLessons = lessonRows.map((lesson) => toLessonDto(lesson));

    return {
      mySite: promo,
      continueWatching: mappedLessons.filter((lesson) => lesson.progress > 0),
      newest: mappedLessons.filter((lesson) => lesson.isNew),
      popular: [...mappedLessons].sort((a, b) => b.views - a.views),
      myGroups: groups.map((group) => toGroupDto(group)),
      newPeople: users.map((user, index) => toPersonDto(user, index < 2)),
    };
  }

  @Get(":id")
  async getOne(@Param("id") id: string): Promise<LessonDto> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        uploadedBy: { include: { profile: true } },
        progress: { where: { userId: getCurrentUserId() } },
      },
    });

    if (!lesson) {
      throw new NotFoundException("Dars topilmadi");
    }

    return toLessonDto(lesson);
  }

  @Post(":id/progress")
  async saveProgress(@Param("id") id: string, @Body() body: { positionSeconds?: unknown }): Promise<LessonDto> {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) throw new NotFoundException("Dars topilmadi");

    const rawPosition = typeof body.positionSeconds === "number" && Number.isFinite(body.positionSeconds) ? body.positionSeconds : 0;
    const positionSeconds = Math.max(0, Math.min(Math.round(rawPosition), lesson.durationSeconds ?? rawPosition));
    await this.prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: getCurrentUserId(), lessonId: id } },
      update: { positionSeconds, completed: lesson.durationSeconds ? positionSeconds >= lesson.durationSeconds : false },
      create: { userId: getCurrentUserId(), lessonId: id, positionSeconds },
    });

    return this.getOne(id);
  }
}
