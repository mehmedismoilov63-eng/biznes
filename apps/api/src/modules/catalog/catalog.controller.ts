import { Controller, Get, Inject, Query } from "@nestjs/common";
import { LessonStatus } from "@prisma/client";
import { readLocaleText, toPersonDto } from "../db-utils";
import { PrismaService } from "../database/prisma.service";

type CatalogIndustryDto = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  isOpen: boolean;
};

type CatalogSectionDto = {
  id: string;
  industryId: string;
  slug: string;
  name: string;
  icon: string | null;
};

type SearchResultItem = {
  type: "lesson" | "person" | "group";
  id: string;
  title: string;
  subtitle: string;
  icon?: string | null;
};

type SearchResponse = {
  lessons: SearchResultItem[];
  people: SearchResultItem[];
  groups: SearchResultItem[];
};

@Controller("catalog")
export class CatalogController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("industries")
  async getIndustries(): Promise<CatalogIndustryDto[]> {
    const industries = await this.prisma.industry.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return industries.map((industry) => ({
      id: industry.id,
      slug: industry.slug,
      name: readLocaleText(industry.names),
      icon: industry.icon,
      isOpen: industry.isOpen,
    }));
  }

  @Get("sections")
  async getSections(): Promise<CatalogSectionDto[]> {
    const sections = await this.prisma.section.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return sections.map((section) => ({
      id: section.id,
      industryId: section.industryId,
      slug: section.slug,
      name: readLocaleText(section.names),
      icon: section.icon,
    }));
  }

  @Get("search")
  async search(@Query("q") query?: string): Promise<SearchResponse> {
    const q = (query ?? "").trim();
    if (!q || q.length < 2) return { lessons: [], people: [], groups: [] };

    const [lessons, users, groups] = await Promise.all([
      this.prisma.lesson.findMany({
        where: {
          status: LessonStatus.PUBLISHED,
          OR: [
            { tags: { has: q.toLowerCase() } },
          ],
        },
        orderBy: { viewCount: "desc" },
        take: 5,
        include: { uploadedBy: { include: { profile: true } } },
      }),
      this.prisma.user.findMany({
        where: {
          profile: {
            OR: [
              { username: { contains: q, mode: "insensitive" } },
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { businessName: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
            ],
          },
        },
        include: { profile: true },
        take: 5,
      }),
      this.prisma.groupChat.findMany({
        where: {
          visibility: "PUBLIC",
          deletedAt: null,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
    ]);

    return {
      lessons: lessons.map((lesson) => ({
        type: "lesson" as const,
        id: lesson.id,
        title: readLocaleText(lesson.titles),
        subtitle: readLocaleText(lesson.descriptions).slice(0, 80),
        icon: null,
      })),
      people: users.map((user) => {
        const p = toPersonDto(user);
        return { type: "person" as const, id: user.id, title: p.name, subtitle: `@${p.username}${p.city ? ` · ${p.city}` : ""}`, icon: p.avatarPath };
      }),
      groups: groups.map((group) => ({
        type: "group" as const,
        id: group.id,
        title: group.name,
        subtitle: group.description ?? "",
        icon: null,
      })),
    };
  }
}
