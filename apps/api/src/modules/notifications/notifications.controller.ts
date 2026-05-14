import { Controller, Get, Inject, Param, Post } from "@nestjs/common";
import { getCurrentUserId } from "../db-utils";
import { PrismaService } from "../database/prisma.service";

type NotificationDto = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
};

@Controller("notifications")
export class NotificationsController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async list(): Promise<NotificationDto[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId: getCurrentUserId() },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
    }));
  }

  @Post(":id/read")
  async markRead(@Param("id") id: string): Promise<NotificationDto> {
    const notification = await this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });

    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
    };
  }

  @Post("read-all")
  async markAllRead(): Promise<{ updated: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId: getCurrentUserId(), readAt: null },
      data: { readAt: new Date() },
    });

    return { updated: result.count };
  }
}
