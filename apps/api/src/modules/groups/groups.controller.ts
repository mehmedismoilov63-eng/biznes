import { Body, Controller, Delete, ForbiddenException, Get, Inject, NotFoundException, Param, Patch, Post, Query } from "@nestjs/common";
import { GroupRole, GroupVisibility, MessageType, Prisma } from "@prisma/client";
import { createToken, getCurrentUserId, GROUP_MAX_MEMBERS, normalizeText, toGroupDto, toMessageDto, type GroupDto, type MessageDto } from "../db-utils";
import { PrismaService } from "../database/prisma.service";

@Controller("groups")
export class GroupsController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async mine(): Promise<GroupDto[]> {
    const groups = await this.prisma.groupChat.findMany({
      where: { memberships: { some: { userId: getCurrentUserId() } }, deletedAt: null },
      include: { memberships: true },
      orderBy: { updatedAt: "desc" },
    });

    return groups.map((group) => toGroupDto(group));
  }

  @Get("search")
  async search(@Query("q") query?: string): Promise<GroupDto[]> {
    const myId = getCurrentUserId();
    const me = await this.prisma.user.findUniqueOrThrow({ where: { id: myId }, select: { sectionId: true } });

    if (!me.sectionId) return [];

    // Find users in same section to filter groups by their ownership
    const sameSectionOwnerIds = await this.prisma.user
      .findMany({ where: { sectionId: me.sectionId }, select: { id: true } })
      .then((users) => users.map((u) => u.id));

    const q = query?.trim();
    const groups = await this.prisma.groupChat.findMany({
      where: {
        ownerId: { in: sameSectionOwnerIds },
        visibility: GroupVisibility.PUBLIC,
        deletedAt: null,
        ...(q
          ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }
          : {}),
      },
      include: { memberships: true },
      take: 50,
    });

    return groups.map((group) => toGroupDto(group));
  }

  @Post()
  async create(@Body() body: { name?: unknown; description?: unknown; visibility?: unknown }): Promise<GroupDto> {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (name.length < 3 || name.length > 50) {
      throw new NotFoundException("Guruh nomi 3-50 belgi bo'lishi kerak");
    }

    const description = typeof body.description === "string" ? body.description.trim().slice(0, 200) : null;
    const visibility = body.visibility === GroupVisibility.PRIVATE ? GroupVisibility.PRIVATE : GroupVisibility.PUBLIC;
    const group = await this.prisma.groupChat.create({
      data: {
        ownerId: getCurrentUserId(),
        name,
        description,
        visibility,
        memberCount: 1,
        memberships: {
          create: { userId: getCurrentUserId(), role: GroupRole.OWNER },
        },
      },
      include: { memberships: true },
    });

    return toGroupDto(group);
  }

  @Post(":id/join")
  async joinById(@Param("id") id: string): Promise<GroupDto> {
    await this.requireSameSection(id);
    const group = await this.findGroup(id);
    const alreadyJoined = group.memberships.some((m) => m.userId === getCurrentUserId());
    if (!alreadyJoined) {
      if (group.memberCount >= GROUP_MAX_MEMBERS) throw new NotFoundException("Guruh limiti to'lgan");
      await this.prisma.groupMembership.create({
        data: { groupId: id, userId: getCurrentUserId(), role: GroupRole.MEMBER },
      });
      await this.prisma.groupChat.update({ where: { id }, data: { memberCount: { increment: 1 } } });
    }
    const updated = await this.findGroup(id);
    return toGroupDto(updated);
  }

  @Post(":id/leave")
  async leaveById(@Param("id") id: string): Promise<{ ok: true }> {
    await this.prisma.groupMembership.deleteMany({ where: { groupId: id, userId: getCurrentUserId() } });
    await this.prisma.groupChat.update({ where: { id }, data: { memberCount: { decrement: 1 } } });
    return { ok: true };
  }

  @Post(":id/invites")
  async createInvite(@Param("id") id: string): Promise<{ groupId: string; token: string; url: string }> {
    await this.findGroup(id);
    const invite = await this.prisma.groupInvite.create({
      data: { groupId: id, token: createToken(`invite_${id}`) },
    });

    return { groupId: id, token: invite.token, url: `/groups/join/${invite.token}` };
  }

  @Get("invite/:token")
  async getInvite(@Param("token") token: string): Promise<{ token: string; group: GroupDto }> {
    const invite = await this.prisma.groupInvite.findUnique({
      where: { token },
      include: { group: { include: { memberships: true } } },
    });
    if (!invite || invite.group.deletedAt) throw new NotFoundException("Invite topilmadi");
    return { token, group: toGroupDto(invite.group) };
  }

  @Post("join/:token")
  async join(@Param("token") token: string): Promise<{ ok: true; token: string; group: GroupDto }> {
    const invite = await this.prisma.groupInvite.findUnique({
      where: { token },
      include: { group: { include: { memberships: true } } },
    });
    if (!invite || invite.group.deletedAt) throw new NotFoundException("Invite topilmadi");

    await this.requireSameSection(invite.groupId);

    const alreadyJoined = invite.group.memberships.some((m) => m.userId === getCurrentUserId());
    if (!alreadyJoined && invite.group.memberCount >= GROUP_MAX_MEMBERS) throw new NotFoundException("Guruh limiti to'lgan");

    if (!alreadyJoined) {
      await this.prisma.groupMembership.create({
        data: { groupId: invite.groupId, userId: getCurrentUserId(), role: GroupRole.MEMBER },
      });
      await this.prisma.groupChat.update({ where: { id: invite.groupId }, data: { memberCount: { increment: 1 } } });
    }
    const group = await this.findGroup(invite.groupId);
    return { ok: true, token, group: toGroupDto(group) };
  }

  @Get(":id/messages")
  async messages(@Param("id") id: string): Promise<{ group: GroupDto; messages: MessageDto[] }> {
    await this.requireSameSection(id);
    const group = await this.findGroup(id);
    const msgs = await this.prisma.groupMessage.findMany({
      where: { groupId: id, deletedAt: null },
      include: {
        sender: { include: { profile: true } },
        replyTo: { include: { sender: { include: { profile: true } } } },
        reactions: { select: { userId: true, emoji: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return { group: toGroupDto(group), messages: msgs.map((m) => toMessageDto({ ...m, status: "SENT" })) };
  }

  @Post(":id/messages")
  async send(@Param("id") id: string, @Body() body: { text?: unknown; type?: unknown; mediaPath?: unknown; replyToId?: unknown }): Promise<MessageDto> {
    await this.requireSameSection(id);
    const text = normalizeText(body.text);
    const mediaPath = typeof body.mediaPath === "string" && body.mediaPath.trim() ? body.mediaPath.trim() : null;
    const replyToId = typeof body.replyToId === "string" && body.replyToId.trim() ? body.replyToId.trim() : null;
    const type = typeof body.type === "string" && Object.values(MessageType).includes(body.type as MessageType) ? (body.type as MessageType) : MessageType.TEXT;
    if (!text && !mediaPath) throw new NotFoundException("Xabar matni yoki media kerak");

    const message = await this.prisma.groupMessage.create({
      data: { groupId: id, senderId: getCurrentUserId(), type, text, mediaPath, replyToId },
      include: {
        replyTo: { include: { sender: { include: { profile: true } } } },
        reactions: { select: { userId: true, emoji: true } },
      },
    });

    return toMessageDto({ ...message, status: "SENT" });
  }

  @Post(":id/messages/:msgId/reactions")
  async toggleGroupReaction(@Param("id") id: string, @Param("msgId") msgId: string, @Body() body: { emoji?: unknown }): Promise<{ ok: true }> {
    const myId = getCurrentUserId();
    const emoji = typeof body.emoji === "string" ? body.emoji.trim() : "";
    if (!emoji) throw new NotFoundException("Emoji kerak");
    const existing = await this.prisma.groupMessageReaction.findUnique({
      where: { messageId_userId_emoji: { messageId: msgId, userId: myId, emoji } },
    });
    if (existing) {
      await this.prisma.groupMessageReaction.delete({ where: { id: existing.id } });
    } else {
      await this.prisma.groupMessageReaction.create({ data: { messageId: msgId, userId: myId, emoji } });
    }
    return { ok: true };
  }

  @Get(":id/members")
  async getMembers(@Param("id") id: string): Promise<{ userId: string; name: string; avatarPath: string | null; role: string }[]> {
    await this.requireSameSection(id);
    const memberships = await this.prisma.groupMembership.findMany({
      where: { groupId: id },
      include: { user: { include: { profile: true } } },
      orderBy: { joinedAt: "asc" },
    });
    return memberships.map((m) => ({
      userId: m.userId,
      name: m.user.profile ? `${m.user.profile.firstName} ${m.user.profile.lastName}` : "Foydalanuvchi",
      avatarPath: m.user.profile?.avatarPath ?? null,
      role: m.role,
    }));
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() body: { name?: unknown; description?: unknown; visibility?: unknown; avatarPath?: unknown },
  ): Promise<GroupDto> {
    const myId = getCurrentUserId();
    const membership = await this.prisma.groupMembership.findUnique({
      where: { groupId_userId: { groupId: id, userId: myId } },
    });
    if (!membership || (membership.role !== GroupRole.OWNER && membership.role !== GroupRole.ADMIN)) {
      throw new ForbiddenException("Faqat admin o'zgartirish mumkin");
    }
    const data: { name?: string; description?: string | null; visibility?: GroupVisibility; avatarPath?: string } = {};
    if (typeof body.name === "string" && body.name.trim().length >= 3) data.name = body.name.trim().slice(0, 50);
    if (typeof body.description === "string") data.description = body.description.trim().slice(0, 200) || null;
    if (body.visibility === GroupVisibility.PRIVATE || body.visibility === GroupVisibility.PUBLIC) data.visibility = body.visibility;
    if (typeof body.avatarPath === "string" && body.avatarPath.trim()) data.avatarPath = body.avatarPath.trim();
    const group = await this.prisma.groupChat.update({ where: { id }, data, include: { memberships: true } });
    return toGroupDto(group);
  }

  @Delete(":id/members/:userId")
  async kickMember(@Param("id") id: string, @Param("userId") targetId: string): Promise<{ ok: true }> {
    const myId = getCurrentUserId();
    if (targetId === myId) throw new ForbiddenException("O'zingizni chiqarib bo'lmaydi");
    const membership = await this.prisma.groupMembership.findUnique({
      where: { groupId_userId: { groupId: id, userId: myId } },
    });
    if (!membership || (membership.role !== GroupRole.OWNER && membership.role !== GroupRole.ADMIN)) {
      throw new ForbiddenException("Faqat admin chiqarish mumkin");
    }
    await this.prisma.groupMembership.deleteMany({ where: { groupId: id, userId: targetId } });
    await this.prisma.groupChat.update({ where: { id }, data: { memberCount: { decrement: 1 } } });
    return { ok: true };
  }

  @Delete(":id/messages/:msgId")
  async deleteGroupMessage(@Param("id") id: string, @Param("msgId") msgId: string): Promise<{ ok: true }> {
    const myId = getCurrentUserId();
    const msg = await this.prisma.groupMessage.findUnique({ where: { id: msgId } });
    if (!msg) throw new NotFoundException("Xabar topilmadi");
    if (msg.senderId !== myId) {
      const membership = await this.prisma.groupMembership.findUnique({
        where: { groupId_userId: { groupId: id, userId: myId } },
      });
      if (!membership || (membership.role !== GroupRole.OWNER && membership.role !== GroupRole.ADMIN)) {
        throw new ForbiddenException("Faqat o'z xabaringizni o'chirish mumkin");
      }
    }
    await this.prisma.groupMessage.update({ where: { id: msgId }, data: { deletedAt: new Date() } });
    return { ok: true };
  }

  private async requireSameSection(groupId: string): Promise<void> {
    const myId = getCurrentUserId();
    const [me, group] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: myId }, select: { sectionId: true } }),
      this.prisma.groupChat.findUniqueOrThrow({ where: { id: groupId }, select: { ownerId: true } }),
    ]);
    const owner = await this.prisma.user.findUnique({ where: { id: group.ownerId }, select: { sectionId: true } });

    if (!me.sectionId || me.sectionId !== owner?.sectionId) {
      throw new ForbiddenException("Faqat bir xil bo'limdagi guruhlarga kirish mumkin");
    }
  }

  private async findGroup(id: string): Promise<Prisma.GroupChatGetPayload<{ include: { memberships: true } }>> {
    return this.prisma.groupChat.findUniqueOrThrow({ where: { id }, include: { memberships: true } });
  }
}
