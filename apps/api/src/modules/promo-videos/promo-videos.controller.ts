import { Controller, Get, Inject, NotFoundException, Param, Post } from "@nestjs/common";
import { Prisma, PromoStatus } from "@prisma/client";
import { createToken, getCurrentUserId, readLocaleText } from "../db-utils";
import { PrismaService } from "../database/prisma.service";

type PromoDto = {
  id: string;
  title: string;
  description: string;
  hlsManifestPath: string | null;
  thumbnailPath: string | null;
  sourcePath: string | null;
  durationSeconds: number | null;
  isShareable: boolean;
  shareToken: string | null;
  shareUrl?: string;
};

@Controller()
export class PromoVideosController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("me/promo-videos")
  async mine(): Promise<PromoDto[]> {
    const videos = await this.prisma.promoVideo.findMany({
      where: { userId: getCurrentUserId(), status: PromoStatus.PUBLISHED },
      orderBy: { createdAt: "desc" },
    });

    return videos.map((video) => this.toPromoDto(video));
  }

  @Get("me/promo-videos/:id")
  async getMine(@Param("id") id: string): Promise<PromoDto> {
    const video = await this.prisma.promoVideo.findFirst({ where: { id, userId: getCurrentUserId() } });
    if (!video) throw new NotFoundException("Promo video topilmadi");
    return this.toPromoDto(video);
  }

  @Post("me/promo-videos/:id/enable-sharing")
  async enableSharing(@Param("id") id: string): Promise<PromoDto> {
    const current = await this.prisma.promoVideo.findFirst({ where: { id, userId: getCurrentUserId() } });
    if (!current) throw new NotFoundException("Promo video topilmadi");

    const video = await this.prisma.promoVideo.update({
      where: { id },
      data: { isShareable: true, shareToken: current.shareToken ?? createToken("promo-share") },
    });

    return this.toPromoDto(video, true);
  }

  @Post("me/promo-videos/:id/disable-sharing")
  async disableSharing(@Param("id") id: string): Promise<PromoDto> {
    const current = await this.prisma.promoVideo.findFirst({ where: { id, userId: getCurrentUserId() } });
    if (!current) throw new NotFoundException("Promo video topilmadi");

    const video = await this.prisma.promoVideo.update({
      where: { id },
      data: { isShareable: false },
    });

    return this.toPromoDto(video);
  }

  @Get("share/promo/:token")
  async publicShare(@Param("token") token: string): Promise<PromoDto> {
    const video = await this.prisma.promoVideo.findFirst({
      where: { shareToken: token, isShareable: true, status: PromoStatus.PUBLISHED },
    });
    if (!video) throw new NotFoundException("Share video topilmadi");
    return this.toPromoDto(video, true);
  }

  private toPromoDto(video: {
    id: string;
    titles: Prisma.JsonValue;
    descriptions: Prisma.JsonValue;
    hlsManifestPath: string | null;
    thumbnailPath: string | null;
    sourcePath: string | null;
    durationSeconds: number | null;
    isShareable: boolean;
    shareToken: string | null;
  }, includeShareUrl = false): PromoDto {
    const dto: PromoDto = {
      id: video.id,
      title: readLocaleText(video.titles),
      description: readLocaleText(video.descriptions),
      hlsManifestPath: video.hlsManifestPath,
      thumbnailPath: video.thumbnailPath,
      sourcePath: video.sourcePath,
      durationSeconds: video.durationSeconds,
      isShareable: video.isShareable,
      shareToken: video.shareToken,
    };

    if (includeShareUrl && video.shareToken) {
      dto.shareUrl = `https://biznesjon.uz/share/promo/${video.shareToken}`;
    }

    return dto;
  }
}
