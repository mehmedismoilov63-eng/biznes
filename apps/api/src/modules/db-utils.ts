import { createHash, randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { getCurrentUserId } from "./user-context";

export { getCurrentUserId };
export const CURRENT_USER_ID = "user_1";
export const ADMIN_USER_ID = "user_admin";
export const DEFAULT_LOCALE = "uz-Latn";
export const PASSWORD_SALT = "biznesjon-dev";
export const OTP_CODE = "123456";
export const OTP_TTL_SECONDS = 300;
export const MESSAGE_MAX_LENGTH = 4000;
export const GROUP_MAX_MEMBERS = 200;

const SECONDS_PER_MINUTE = 60;
const ID_HEX_BYTES = 8;

export type PersonDto = {
  id: string;
  name: string;
  username: string;
  businessName: string;
  city: string;
  sectionId: string | null;
  avatarPath: string | null;
  online: boolean;
  bio: string | null;
};

export type LessonDto = {
  id: string;
  title: string;
  description: string;
  durationSeconds: number;
  duration: string;
  views: number;
  sectionId: string;
  author: string;
  sourcePath: string | null;
  hlsManifestPath: string | null;
  thumbnailPath: string | null;
  progress: number;
  positionSeconds: number;
  isNew: boolean;
};

export type GroupDto = {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  members: number;
  joined: boolean;
  unread: number;
  avatarPath: string | null;
  myRole: string | null;
};

export type ReactionDto = { emoji: string; count: number; byMe: boolean };

export type MessageDto = {
  id: string;
  from: "me" | "them";
  senderName: string | null;
  type: string;
  text: string | null;
  mediaPath: string | null;
  replyToId: string | null;
  replyToText: string | null;
  replyToSender: string | null;
  reactions: ReactionDto[];
  status: string;
  createdAt: string;
  time: string;
};

type UserWithProfile = {
  id: string;
  sectionId: string | null;
  lastActiveAt?: Date | null;
  profile: {
    firstName: string;
    lastName: string;
    username: string;
    businessName: string | null;
    city: string | null;
    avatarPath: string | null;
    bio: string | null;
  } | null;
};

type LessonWithProgress = {
  id: string;
  titles: Prisma.JsonValue;
  descriptions: Prisma.JsonValue;
  durationSeconds: number | null;
  viewCount: number;
  sectionId: string;
  sourcePath: string | null;
  hlsManifestPath: string | null;
  thumbnailPath: string | null;
  publishedAt: Date | null;
  uploadedBy?: UserWithProfile | null;
  progress?: Array<{ positionSeconds: number; completed: boolean }>;
};

type GroupWithMemberships = {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  memberCount: number;
  avatarPath?: string | null;
  memberships?: Array<{ userId: string; role: string }>;
};

export function hashPassword(password: string): string {
  return createHash("sha256").update(`${PASSWORD_SALT}:${password}`).digest("hex");
}

export function createToken(prefix: string): string {
  return `${prefix}_${randomBytes(ID_HEX_BYTES).toString("hex")}`;
}

export function readLocaleText(value: Prisma.JsonValue, locale: string = DEFAULT_LOCALE): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const record = value as Record<string, unknown>;
  const localized = record[locale] ?? record[DEFAULT_LOCALE] ?? record.en ?? Object.values(record)[0];
  return typeof localized === "string" ? localized : "";
}

export function formatDuration(totalSeconds: number | null): string {
  const seconds = Math.max(0, totalSeconds ?? 0);
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const rest = seconds % SECONDS_PER_MINUTE;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function toPersonDto(user: UserWithProfile, online = false): PersonDto {
  const profile = user.profile;
  return {
    id: user.id,
    name: profile ? `${profile.firstName} ${profile.lastName}` : "Biznesjon user",
    username: profile?.username ?? user.id,
    businessName: profile?.businessName ?? "",
    city: profile?.city ?? "",
    sectionId: user.sectionId,
    avatarPath: profile?.avatarPath ?? null,
    online,
    bio: profile?.bio ?? null,
  };
}

export function toLessonDto(lesson: LessonWithProgress, locale: string = DEFAULT_LOCALE): LessonDto {
  const durationSeconds = lesson.durationSeconds ?? 0;
  const progress = lesson.progress?.[0];
  const positionSeconds = progress?.positionSeconds ?? 0;
  const author = lesson.uploadedBy ? toPersonDto(lesson.uploadedBy).name : "Biznesjon";

  return {
    id: lesson.id,
    title: readLocaleText(lesson.titles, locale),
    description: readLocaleText(lesson.descriptions, locale),
    durationSeconds,
    duration: formatDuration(durationSeconds),
    views: lesson.viewCount,
    sectionId: lesson.sectionId,
    author,
    sourcePath: lesson.sourcePath,
    hlsManifestPath: lesson.hlsManifestPath,
    thumbnailPath: lesson.thumbnailPath,
    progress: durationSeconds > 0 ? Number((positionSeconds / durationSeconds).toFixed(4)) : 0,
    positionSeconds,
    isNew: Boolean(lesson.publishedAt && Date.now() - lesson.publishedAt.getTime() < 14 * 24 * 60 * 60 * 1000),
  };
}

export function toGroupDto(group: GroupWithMemberships): GroupDto {
  const userId = getCurrentUserId();
  const membership = group.memberships?.find((m) => m.userId === userId);
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    visibility: group.visibility,
    members: group.memberCount,
    joined: Boolean(membership),
    unread: 0,
    avatarPath: group.avatarPath ?? null,
    myRole: membership?.role ?? null,
  };
}

export function toMessageDto(message: {
  id: string;
  senderId: string;
  type: string;
  text: string | null;
  mediaPath: string | null;
  replyToId: string | null;
  status?: string;
  createdAt: Date;
  sender?: { profile: { firstName: string; lastName: string } | null } | null;
  replyTo?: { text: string | null; sender?: { profile: { firstName: string; lastName: string } | null } | null } | null;
  reactions?: { userId: string; emoji: string }[];
}): MessageDto {
  const myId = getCurrentUserId();
  const reactionMap = new Map<string, { count: number; byMe: boolean }>();
  for (const r of message.reactions ?? []) {
    const prev = reactionMap.get(r.emoji) ?? { count: 0, byMe: false };
    reactionMap.set(r.emoji, { count: prev.count + 1, byMe: prev.byMe || r.userId === myId });
  }
  const reactions: ReactionDto[] = Array.from(reactionMap.entries()).map(([emoji, v]) => ({ emoji, ...v }));

  return {
    id: message.id,
    from: message.senderId === myId ? "me" : "them",
    senderName: message.sender?.profile
      ? `${message.sender.profile.firstName} ${message.sender.profile.lastName}`
      : null,
    type: message.type,
    text: message.text,
    mediaPath: message.mediaPath,
    replyToId: message.replyToId,
    replyToText: message.replyTo?.text ?? null,
    replyToSender: message.replyTo?.sender?.profile
      ? `${message.replyTo.sender.profile.firstName} ${message.replyTo.sender.profile.lastName}`
      : null,
    reactions,
    status: message.status ?? "SENT",
    createdAt: message.createdAt.toISOString(),
    time: message.createdAt.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", hour12: false }),
  };
}

export function normalizeText(value: unknown, maxLength: number = MESSAGE_MAX_LENGTH): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text ? text.slice(0, maxLength) : null;
}
