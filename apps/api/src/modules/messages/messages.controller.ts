import { Body, Controller, Delete, ForbiddenException, Get, Inject, NotFoundException, Param, Post } from "@nestjs/common";
import { MessageType, Prisma } from "@prisma/client";
import { getCurrentUserId, normalizeText, toMessageDto, toPersonDto, type MessageDto, type PersonDto } from "../db-utils";
import { PrismaService } from "../database/prisma.service";

type ThreadDto = {
  id: string;
  user: PersonDto;
  lastMessage: string;
  unread: number;
};

type ThreadDetailDto = {
  id: string;
  user: PersonDto;
  messages: MessageDto[];
};

type UserWithProfile = Prisma.UserGetPayload<{ include: { profile: true } }>;

const DEFAULT_MESSAGE_TYPE = MessageType.TEXT;

@Controller("messages")
export class MessagesController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("threads")
  async getThreads(): Promise<ThreadDto[]> {
    const myId = getCurrentUserId();

    const messages = await this.prisma.directMessage.findMany({
      where: {
        OR: [{ senderId: myId }, { receiverId: myId }],
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    const seenPartners = new Set<string>();
    const partnersOrdered: string[] = [];
    const lastMessageMap = new Map<string, (typeof messages)[0]>();

    for (const msg of messages) {
      const partnerId = msg.senderId === myId ? msg.receiverId : msg.senderId;
      if (!seenPartners.has(partnerId)) {
        seenPartners.add(partnerId);
        partnersOrdered.push(partnerId);
        lastMessageMap.set(partnerId, msg);
      }
    }

    if (partnersOrdered.length === 0) return [];

    const users = await this.prisma.user.findMany({
      where: { id: { in: partnersOrdered } },
      include: { profile: true },
    });

    const unreadCounts = await this.prisma.directMessage.groupBy({
      by: ["senderId"],
      where: { receiverId: myId, readAt: null, deletedAt: null, senderId: { in: partnersOrdered } },
      _count: { id: true },
    });
    const unreadMap = new Map(unreadCounts.map((r) => [r.senderId, r._count.id]));

    const userMap = new Map(users.map((u) => [u.id, u]));

    return partnersOrdered
      .map((partnerId) => {
        const user = userMap.get(partnerId);
        if (!user) return null;
        const last = lastMessageMap.get(partnerId)!;
        return {
          id: partnerId,
          user: toPersonDto(user, true),
          lastMessage: last.text ?? last.type.toLowerCase(),
          unread: unreadMap.get(partnerId) ?? 0,
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);
  }

  @Get("threads/:id")
  async getThread(@Param("id") id: string): Promise<ThreadDetailDto> {
    const user = await this.resolveThreadUser(id);
    const myId = getCurrentUserId();

    const messages = await this.prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: user.id },
          { senderId: user.id, receiverId: myId },
        ],
        deletedAt: null,
      },
      include: {
        replyTo: { include: { sender: { include: { profile: true } } } },
        reactions: { select: { userId: true, emoji: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return {
      id: user.id,
      user: toPersonDto(user, true),
      messages: messages.map((message) => toMessageDto(message)),
    };
  }

  @Post("threads/:id/read")
  async markRead(@Param("id") id: string): Promise<{ ok: true }> {
    const myId = getCurrentUserId();
    const user = await this.resolveThreadUser(id);

    await this.prisma.directMessage.updateMany({
      where: { senderId: user.id, receiverId: myId, readAt: null, deletedAt: null },
      data: { readAt: new Date() },
    });

    return { ok: true };
  }

  @Post("threads/:id")
  async send(
    @Param("id") id: string,
    @Body() body: { text?: unknown; type?: unknown; mediaPath?: unknown; replyToId?: unknown },
  ): Promise<MessageDto> {
    const myId = getCurrentUserId();
    const user = await this.resolveThreadUser(id);

    const type = this.resolveMessageType(body.type);
    const text = normalizeText(body.text);
    const mediaPath = typeof body.mediaPath === "string" && body.mediaPath.trim() ? body.mediaPath.trim() : null;
    const replyToId = typeof body.replyToId === "string" && body.replyToId.trim() ? body.replyToId.trim() : null;

    if (!text && !mediaPath) {
      throw new NotFoundException("Xabar matni yoki media kerak");
    }

    const message = await this.prisma.directMessage.create({
      data: {
        senderId: myId,
        receiverId: user.id,
        type,
        text,
        mediaPath,
        replyToId,
      },
      include: {
        replyTo: { include: { sender: { include: { profile: true } } } },
        reactions: { select: { userId: true, emoji: true } },
      },
    });

    return toMessageDto(message);
  }

  @Post(":msgId/reactions")
  async toggleReaction(
    @Param("msgId") msgId: string,
    @Body() body: { emoji?: unknown },
  ): Promise<{ ok: true }> {
    const myId = getCurrentUserId();
    const emoji = typeof body.emoji === "string" ? body.emoji.trim() : "";
    if (!emoji) throw new NotFoundException("Emoji kerak");

    const existing = await this.prisma.messageReaction.findUnique({
      where: { messageId_userId_emoji: { messageId: msgId, userId: myId, emoji } },
    });

    if (existing) {
      await this.prisma.messageReaction.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.messageReaction.create({ data: { messageId: msgId, userId: myId, emoji } });
    }

    return { ok: true };
  }

  @Delete(":msgId")
  async deleteMessage(@Param("msgId") msgId: string): Promise<{ ok: true }> {
    const myId = getCurrentUserId();
    const msg = await this.prisma.directMessage.findUnique({ where: { id: msgId } });
    if (!msg || msg.senderId !== myId) {
      throw new ForbiddenException("Faqat o'z xabaringizni o'chirish mumkin");
    }
    await this.prisma.directMessage.update({ where: { id: msgId }, data: { deletedAt: new Date() } });
    return { ok: true };
  }

  private async resolveThreadUser(id: string): Promise<UserWithProfile> {
    const myId = getCurrentUserId();

    let user: UserWithProfile | null = null;

    if (id.startsWith("thread_")) {
      const index = Math.max(0, Number(id.replace("thread_", "")) - 1);
      const users = await this.prisma.user.findMany({
        where: { id: { not: myId } },
        include: { profile: true },
        orderBy: { createdAt: "asc" },
      });
      user = users[index] ?? null;
    } else {
      user =
        (await this.prisma.user.findFirst({
          where: { OR: [{ id }, { profile: { username: id } }] },
          include: { profile: true },
        })) ?? null;
    }

    if (!user) throw new NotFoundException("Foydalanuvchi topilmadi");
    if (user.id === myId) throw new ForbiddenException("O'zingizga xabar yubora olmaysiz");

    return user;
  }

  private resolveMessageType(value: unknown): MessageType {
    if (typeof value !== "string") return DEFAULT_MESSAGE_TYPE;
    return Object.values(MessageType).includes(value as MessageType) ? (value as MessageType) : DEFAULT_MESSAGE_TYPE;
  }
}
