import { BadRequestException, NotFoundException } from "@nestjs/common";

const OTP_TTL_SECONDS = 300;
const MIN_GROUP_NAME_LENGTH = 3;
const MAX_GROUP_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 4000;
const DEFAULT_POSITION_SECONDS = 0;
const ID_RADIX = 36;
const ID_SLICE_START = 2;
const ID_SLICE_END = 10;

export type CurrentUserRecord = typeof currentUser;
export type LessonRecord = (typeof lessons)[number];
export type PersonRecord = (typeof people)[number];
export type GroupRecord = (typeof groups)[number];
export type PromoVideoRecord = (typeof promoVideos)[number];
export type NotificationRecord = (typeof notifications)[number];

export type DirectMessageRecord = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
  createdAt: string;
  status: "SENT" | "READ";
};

export type ThreadRecord = {
  id: string;
  user: PersonRecord;
  lastMessage: string;
  unread: number;
  updatedAt: string;
};

export type GroupMessageRecord = {
  id: string;
  groupId: string;
  sender: Pick<PersonRecord, "id" | "name" | "username">;
  text: string;
  createdAt: string;
};

const currentUser = {
  id: "user_1",
  phone: "+998901234567",
  role: "USER",
  language: "uz-Latn",
  industryId: "industry-3",
  sectionId: "section-1",
  profile: {
    firstName: "Bekzod",
    lastName: "Olimov",
    username: "bekzod_o",
    businessName: "Kofe Lab",
    city: "Toshkent",
    bio: "5 yil restoran biznesi. 3 ta filial. Spesialist: F&B operations.",
  },
};

const lessons = [
  {
    id: "lesson_1",
    title: "Restoran biznesini noldan boshlash: 7 ta asosiy qadam",
    description: "Bozorni o'rganish, joy tanlash, konseptsiya, jamoa, hujjatlar va birinchi oy operatsiyalari.",
    durationSeconds: 1122,
    views: 12400,
    sectionId: "section-1",
    author: "Bekzod Olimov",
    progress: 0.42,
    positionSeconds: 471,
    isNew: true,
  },
  {
    id: "lesson_2",
    title: "Kafe uchun menu dizayn: narxlash psixologiyasi",
    description: "Menu dizayni, narx anchoring va mijoz qaroriga ta'sir qiluvchi omillar.",
    durationSeconds: 735,
    views: 8200,
    sectionId: "section-1",
    author: "Nilufar Rahimova",
    progress: 0,
    positionSeconds: 0,
    isNew: true,
  },
  {
    id: "lesson_3",
    title: "Mijozni xizmatga oshib qoldirish - 12 ta texnika",
    description: "Xizmat sifati orqali qaytuvchi mijozlar ulushini oshirish.",
    durationSeconds: 1388,
    views: 18900,
    sectionId: "section-1",
    author: "Aziz Karimov",
    progress: 0,
    positionSeconds: 0,
    isNew: false,
  },
];

const people = [
  {
    id: "user_1",
    name: "Bekzod Olimov",
    username: "bekzod_o",
    businessName: "Kofe Lab",
    city: "Toshkent",
    sectionId: "section-1",
    online: true,
  },
  {
    id: "user_2",
    name: "Nilufar Rahimova",
    username: "nilufar_r",
    businessName: "Beauty Studio N",
    city: "Samarqand",
    sectionId: "section-2",
    online: true,
  },
  {
    id: "user_3",
    name: "Aziz Karimov",
    username: "aziz",
    businessName: "Karimov Auto",
    city: "Toshkent",
    sectionId: "section-4",
    online: false,
  },
];

const groups = [
  {
    id: "group_1",
    name: "Toshkent kafe egalari",
    description: "Tajriba almashish, mijozlar, yetkazib beruvchilar",
    visibility: "PUBLIC",
    members: 184,
    unread: 12,
    joined: true,
  },
  {
    id: "group_2",
    name: "F&B Marketing UZ",
    description: "Restoran va kafe uchun reklama strategiyalari",
    visibility: "PUBLIC",
    members: 67,
    unread: 3,
    joined: true,
  },
];

const promoVideos = [
  {
    id: "promo_1",
    title: "Kofe Lab - siz uchun professional kofe tajribasi",
    description: "5 yillik tajriba, 3 filial, har kuni 800+ mijoz. Professional Mening saytim videosi.",
    durationSeconds: 144,
    isShareable: true,
    shareToken: "kofe-lab-bekzod",
    owner: people[0],
  },
];

const notifications = [
  {
    id: "notif_1",
    type: "PROMO_VIDEO_PUBLISHED",
    title: "Mening saytim videosi tayyor",
    body: "Kofe Lab videosi profilingizga biriktirildi.",
    readAt: null as string | null,
    createdAt: new Date().toISOString(),
  },
];

const threads: ThreadRecord[] = people.map((user, index) => ({
  id: `thread_${index + 1}`,
  user,
  lastMessage: index === 0 ? "Bugun kelolasizmi?" : "Rahmat, juda foydali bo'ldi",
  unread: index === 0 ? 2 : 0,
  updatedAt: new Date().toISOString(),
}));

const threadMessages = new Map<string, DirectMessageRecord[]>(
  threads.map((thread) => [
    thread.id,
    [
      {
        id: `${thread.id}_m1`,
        from: "them",
        text: "Salom, vaqtingiz bormi?",
        time: "10:14",
        createdAt: new Date().toISOString(),
        status: "READ",
      },
      {
        id: `${thread.id}_m2`,
        from: "me",
        text: "Salom! Ha, eshitaman.",
        time: "10:15",
        createdAt: new Date().toISOString(),
        status: "READ",
      },
    ],
  ]),
);

const groupMessages = new Map<string, GroupMessageRecord[]>(
  groups.map((group) => [
    group.id,
    [
      {
        id: `${group.id}_gm1`,
        groupId: group.id,
        sender: pickSender(people[1]),
        text: "Bugun yangi yetkazib beruvchi bo'yicha tajriba almashamiz.",
        createdAt: new Date().toISOString(),
      },
    ],
  ]),
);

function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(ID_RADIX).slice(ID_SLICE_START, ID_SLICE_END)}`;
}

function currentIso(): string {
  return new Date().toISOString();
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function normalizeQuery(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function requireText(value: unknown, field: string, maxLength: number = MAX_MESSAGE_LENGTH): string {
  if (typeof value !== "string") {
    throw new BadRequestException(`${field} string bo'lishi kerak`);
  }

  const text = value.trim();
  if (!text) {
    throw new BadRequestException(`${field} bo'sh bo'lmasligi kerak`);
  }

  if (text.length > maxLength) {
    throw new BadRequestException(`${field} juda uzun`);
  }

  return text;
}

function pickSender(person: PersonRecord): Pick<PersonRecord, "id" | "name" | "username"> {
  return {
    id: person.id,
    name: person.name,
    username: person.username,
  };
}

function findThreadOrThrow(id: string): ThreadRecord {
  const thread = threads.find((item) => item.id === id);
  if (!thread) {
    throw new NotFoundException("Thread topilmadi");
  }

  return thread;
}

function findGroupOrThrow(id: string): GroupRecord {
  const group = groups.find((item) => item.id === id);
  if (!group) {
    throw new NotFoundException("Guruh topilmadi");
  }

  return group;
}

function findPromoOrThrow(id: string): PromoVideoRecord {
  const promo = promoVideos.find((item) => item.id === id);
  if (!promo) {
    throw new NotFoundException("Promo video topilmadi");
  }

  return promo;
}

export function getCurrentUser(): CurrentUserRecord {
  return currentUser;
}

export function getLessons(): LessonRecord[] {
  return lessons;
}

export function getLessonFeed(): {
  mySite: PromoVideoRecord;
  continueWatching: LessonRecord[];
  newest: LessonRecord[];
  popular: LessonRecord[];
  myGroups: GroupRecord[];
  newPeople: PersonRecord[];
} {
  return {
    mySite: promoVideos[0],
    continueWatching: lessons.filter((lesson) => lesson.progress > 0),
    newest: lessons.filter((lesson) => lesson.isNew),
    popular: [...lessons].sort((a, b) => b.views - a.views),
    myGroups: groups.filter((group) => group.joined),
    newPeople: people,
  };
}

export function findLesson(id: string): LessonRecord | null {
  return lessons.find((lesson) => lesson.id === id) ?? null;
}

export function saveLessonProgress(id: string, positionSeconds: unknown): LessonRecord {
  const lesson = lessons.find((item) => item.id === id);
  if (!lesson) {
    throw new NotFoundException("Dars topilmadi");
  }

  const position = typeof positionSeconds === "number" && Number.isFinite(positionSeconds) ? positionSeconds : DEFAULT_POSITION_SECONDS;
  const clampedPosition = Math.max(DEFAULT_POSITION_SECONDS, Math.min(position, lesson.durationSeconds));
  lesson.positionSeconds = clampedPosition;
  lesson.progress = lesson.durationSeconds > 0 ? Number((clampedPosition / lesson.durationSeconds).toFixed(4)) : 0;
  return lesson;
}

export function listUsers(query?: string): PersonRecord[] {
  const q = normalizeQuery(query);
  if (!q) return people;

  return people.filter(
    (user) =>
      user.name.toLowerCase().includes(q) ||
      user.username.toLowerCase().includes(q) ||
      user.businessName.toLowerCase().includes(q),
  );
}

export function findUserByUsername(username: string): PersonRecord | null {
  const normalized = username.replace(/^@/, "").toLowerCase();
  return people.find((user) => user.username.toLowerCase() === normalized) ?? null;
}

export function listThreads(): ThreadRecord[] {
  return [...threads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getThread(id: string): { id: string; user: PersonRecord; messages: DirectMessageRecord[] } {
  const thread = findThreadOrThrow(id);
  return {
    id,
    user: thread.user,
    messages: threadMessages.get(id) ?? [],
  };
}

export function sendDirectMessage(id: string, textValue: unknown): DirectMessageRecord {
  const text = requireText(textValue, "text");
  const thread = findThreadOrThrow(id);
  const createdAt = currentIso();
  const message: DirectMessageRecord = {
    id: createId("msg"),
    from: "me",
    text,
    time: formatTime(new Date()),
    createdAt,
    status: "SENT",
  };

  const messages = threadMessages.get(id) ?? [];
  messages.push(message);
  threadMessages.set(id, messages);
  thread.lastMessage = text;
  thread.unread = 0;
  thread.updatedAt = createdAt;
  return message;
}

export function listGroups(): GroupRecord[] {
  return groups;
}

export function searchGroups(query?: string): GroupRecord[] {
  const q = normalizeQuery(query);
  const publicGroups = groups.filter((group) => group.visibility === "PUBLIC");
  if (!q) return publicGroups;

  return publicGroups.filter((group) => group.name.toLowerCase().includes(q) || group.description.toLowerCase().includes(q));
}

export function createGroup(body: { name?: unknown; description?: unknown; visibility?: unknown }): GroupRecord {
  const name = requireText(body.name, "name", MAX_GROUP_NAME_LENGTH);
  if (name.length < MIN_GROUP_NAME_LENGTH) {
    throw new BadRequestException("name kamida 3 belgi bo'lishi kerak");
  }

  const description =
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim().slice(0, MAX_DESCRIPTION_LENGTH)
      : "";
  const visibility = body.visibility === "PRIVATE" ? "PRIVATE" : "PUBLIC";
  const group: GroupRecord = {
    id: createId("group"),
    name,
    description,
    visibility,
    members: 1,
    unread: 0,
    joined: true,
  };

  groups.unshift(group);
  groupMessages.set(group.id, []);
  return group;
}

export function createGroupInvite(id: string): { groupId: string; token: string; url: string } {
  findGroupOrThrow(id);
  const token = `invite_${id}_${createId("token")}`;
  return {
    groupId: id,
    token,
    url: `/groups/join/${token}`,
  };
}

export function joinGroup(token: string): { ok: true; token: string; group: GroupRecord } {
  const groupId = token.split("_").slice(1, 3).join("_");
  const group = findGroupOrThrow(groupId);

  if (!group.joined) {
    group.joined = true;
    group.members += 1;
  }

  return { ok: true, token, group };
}

export function getGroupMessages(id: string): { group: GroupRecord; messages: GroupMessageRecord[] } {
  const group = findGroupOrThrow(id);
  return {
    group,
    messages: groupMessages.get(id) ?? [],
  };
}

export function sendGroupMessage(id: string, textValue: unknown): GroupMessageRecord {
  const group = findGroupOrThrow(id);
  const text = requireText(textValue, "text");
  const message: GroupMessageRecord = {
    id: createId("gmsg"),
    groupId: id,
    sender: pickSender(people[0]),
    text,
    createdAt: currentIso(),
  };

  const messages = groupMessages.get(id) ?? [];
  messages.push(message);
  groupMessages.set(id, messages);
  group.unread = 0;
  return message;
}

export function listPromoVideos(): PromoVideoRecord[] {
  return promoVideos;
}

export function getPromoVideo(id: string): PromoVideoRecord | null {
  return promoVideos.find((video) => video.id === id) ?? null;
}

export function enablePromoSharing(id: string): PromoVideoRecord & { shareUrl: string } {
  const promo = findPromoOrThrow(id);
  promo.isShareable = true;
  return {
    ...promo,
    shareUrl: `https://biznesjon.uz/share/promo/${promo.shareToken}`,
  };
}

export function disablePromoSharing(id: string): PromoVideoRecord {
  const promo = findPromoOrThrow(id);
  promo.isShareable = false;
  return promo;
}

export function findPublicPromo(token: string): PromoVideoRecord | null {
  const promo = promoVideos.find((video) => video.shareToken === token) ?? null;
  return promo?.isShareable ? promo : null;
}

export function listNotifications(): NotificationRecord[] {
  return notifications;
}

export function markNotificationRead(id: string): NotificationRecord {
  const notification = notifications.find((item) => item.id === id);
  if (!notification) {
    throw new NotFoundException("Bildirishnoma topilmadi");
  }

  notification.readAt = currentIso();
  return notification;
}

export function markAllNotificationsRead(): NotificationRecord[] {
  const readAt = currentIso();
  notifications.forEach((notification) => {
    notification.readAt = notification.readAt ?? readAt;
  });
  return notifications;
}

export function createOtpToken(phone: unknown): { otpToken: string; expiresIn: number; message: string } {
  const safePhone = typeof phone === "string" && phone.trim() ? phone.trim() : "phone";
  return {
    otpToken: `otp_${Buffer.from(safePhone).toString("base64url")}`,
    expiresIn: OTP_TTL_SECONDS,
    message: "OTP SMS yuborildi",
  };
}

export function verifyOtp(code: unknown): { ok: boolean; user: CurrentUserRecord; accessToken: string } {
  const value = typeof code === "string" ? code.trim() : "";
  return {
    ok: value.length === 6,
    user: currentUser,
    accessToken: "dev-access-token",
  };
}
