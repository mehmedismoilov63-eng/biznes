"use client";

import {
  Bell,
  BookOpen,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Globe,
  Handshake,
  Home,
  Image as ImageIcon,
  Link,
  LockKeyhole,
  LogOut,
  MessageSquare,
  Mic,
  MonitorSmartphone,
  MoreHorizontal,
  Pause,
  Phone,
  Play,
  Plus,
  Save,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  Star,
  UploadCloud,
  User,
  Users,
  Video,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { gradients, groups, lessons, people, sections, type Group, type Lesson, type Person } from "../lib/mock-data";

const API_ORIGIN = "http://127.0.0.1:4000";
const API_BASE_URL = `${API_ORIGIN}/api/v1`;
const TOAST_TIMEOUT_MS = 2600;
const MAX_CHAT_MESSAGE_LENGTH = 4000;
const BYTES_IN_MEBIBYTE = 1024 * 1024;
const MAX_AVATAR_SIZE_BYTES = 5 * BYTES_IN_MEBIBYTE;
const MAX_MESSAGE_MEDIA_SIZE_BYTES = 25 * BYTES_IN_MEBIBYTE;
const MAX_ADMIN_VIDEO_SIZE_BYTES = 500 * BYTES_IN_MEBIBYTE;
const DEFAULT_PROGRESS = 0.43;
const PROGRESS_STEP = 0.08;
const COMPLETE_PROGRESS = 1;
const MIN_PROGRESS = 0;
const PERCENT_MULTIPLIER = 100;
const ID_RADIX = 36;
const ID_SLICE_START = 2;
const ID_SLICE_END = 9;
const SECONDS_PER_MINUTE = 60;

type Route =
  | { name: "home" }
  | { name: "lessons"; section?: string }
  | { name: "player"; lessonId: string }
  | { name: "mysite" }
  | { name: "people" }
  | { name: "groups" }
  | { name: "groupChat"; groupId: string }
  | { name: "messages"; threadId?: string }
  | { name: "settings" }
  | { name: "admin" }
  | { name: "profile"; personId?: string };

type SimpleRouteName = Exclude<Route["name"], "player" | "groupChat">;
type ToastTone = "success" | "info" | "error";
type SettingsTab = "profile" | "language" | "business" | "notifications" | "privacy" | "theme" | "devices";
type MessageFrom = "me" | "them";
type AuthMode = "login" | "register" | "otp";

type Toast = {
  id: string;
  message: string;
  tone: ToastTone;
};

type AppNotification = {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
};

type ChatMessage = {
  id: string;
  from: MessageFrom;
  kind: "TEXT" | "IMAGE" | "VIDEO" | "VIDEO_NOTE" | "VOICE";
  text: string;
  mediaName?: string;
  mediaPath?: string;
  time: string;
  status: "sent" | "read";
};

type ThreadState = {
  id: string;
  person: Person;
  messages: ChatMessage[];
  lastMessage: string;
  unread: number;
};

type GroupMessage = {
  id: string;
  from: MessageFrom;
  author: string;
  kind: ChatMessage["kind"];
  text: string;
  mediaName?: string;
  mediaPath?: string;
  time: string;
};

type SettingsState = {
  firstName: string;
  lastName: string;
  username: string;
  language: string;
  section: string;
  publicProfile: boolean;
  showOnline: boolean;
  lessonNotifications: boolean;
  messageNotifications: boolean;
  darkTheme: boolean;
};

type PlayerPrefs = {
  playing: boolean;
  speed: number;
  quality: string;
  captions: boolean;
};

type ShareState = {
  enabled: boolean;
  copied: boolean;
};

type AuthState = {
  mode: AuthMode;
  phone: string;
  password: string;
  code: string;
  otpToken: string;
  loading: boolean;
  error: string | null;
};

type ApiPerson = {
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

type ApiLesson = {
  id: string;
  title: string;
  description: string;
  duration: string;
  durationSeconds: number;
  views: number;
  sectionId: string;
  author: string;
  sourcePath: string | null;
  hlsManifestPath: string | null;
  thumbnailPath: string | null;
  progress: number;
  isNew: boolean;
};

type ApiGroup = {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  members: number;
  unread: number;
  joined: boolean;
};

type ApiMessage = {
  id: string;
  from: MessageFrom;
  type: ChatMessage["kind"];
  text: string | null;
  mediaPath: string | null;
  time: string;
  status: string;
};

type ApiThread = {
  id: string;
  user: ApiPerson;
  lastMessage: string;
  unread: number;
};

type ApiPromoVideo = {
  id: string;
  title: string;
  description: string;
  sourcePath: string | null;
  hlsManifestPath: string | null;
  thumbnailPath: string | null;
  durationSeconds: number | null;
  isShareable: boolean;
  shareToken: string | null;
  shareUrl?: string | null;
};

type ApiUpload = {
  path: string;
  originalName: string;
  mimeType: string;
  size: number;
};

type AdminDraft = {
  title: string;
  description: string;
  durationSeconds: number;
  videoFileName: string;
  userId: string;
};

type ApiRequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
};

const iconMap = {
  home: Home,
  lessons: BookOpen,
  mysite: Star,
  people: Handshake,
  groups: Users,
  messages: MessageSquare,
  profile: User,
  settings: Settings,
  admin: UploadCloud,
};

const speedOptions = [1, 1.25, 1.5, 2] as const;
const qualityOptions = ["720p", "1080p", "Auto"] as const;

const settingsTabs: Array<{ id: SettingsTab; label: string; icon: typeof Settings }> = [
  { id: "profile", label: "Profil", icon: User },
  { id: "language", label: "Til", icon: Globe },
  { id: "business", label: "Soha va bo'lim", icon: Handshake },
  { id: "notifications", label: "Bildirishnomalar", icon: Bell },
  { id: "privacy", label: "Maxfiylik", icon: Shield },
  { id: "theme", label: "Tema", icon: Settings },
  { id: "devices", label: "Faol qurilmalar", icon: MonitorSmartphone },
];

function createSimpleRoute(name: SimpleRouteName): Route {
  return { name };
}

function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(ID_RADIX).slice(ID_SLICE_START, ID_SLICE_END)}`;
}

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

function formatViews(value: number): string {
  return value > 1000 ? `${(value / 1000).toFixed(1)}K` : String(value);
}

function formatProgress(value: number | undefined): string {
  const progress = Math.round((value ?? MIN_PROGRESS) * PERCENT_MULTIPLIER);
  return `${progress}%`;
}

function formatDurationSeconds(value: number | null | undefined): string {
  const safeValue = Math.max(MIN_PROGRESS, value ?? MIN_PROGRESS);
  const minutes = Math.floor(safeValue / SECONDS_PER_MINUTE);
  const seconds = Math.floor(safeValue % SECONDS_PER_MINUTE);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function normalizeMessage(value: string): string {
  return value.trim().slice(0, MAX_CHAT_MESSAGE_LENGTH);
}

function resolveMediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("data:") || path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_ORIGIN}${path}`;
}

function getCurrentTime(): string {
  return new Date().toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function createInitialThreads(): ThreadState[] {
  return people.map((person, index) => ({
    id: `thread_${index + 1}`,
    person,
    unread: index === 0 ? 2 : 0,
    lastMessage: index === 0 ? "Bugun gaplashamizmi?" : "Rahmat, juda foydali bo'ldi",
    messages: [
      {
        id: createId("msg"),
        from: "them",
        kind: "TEXT",
        text: "Salom, yangi dars bo'yicha fikringiz qanday?",
        time: "10:14",
        status: "read",
      },
      {
        id: createId("msg"),
        from: "me",
        kind: "TEXT",
        text: "Juda foydali. Ayniqsa subtitle tanlash qulay.",
        time: "10:18",
        status: "read",
      },
    ],
  }));
}

function createInitialGroupMessages(): Record<string, GroupMessage[]> {
  return groups.reduce<Record<string, GroupMessage[]>>((acc, group) => {
    acc[group.id] = [
      {
        id: createId("gmsg"),
        from: "them",
        author: "Nilufar Rahimova",
        kind: "TEXT",
        text: `${group.name} bo'yicha bugun tajriba almashamiz.`,
        time: "09:40",
      },
    ];
    return acc;
  }, {});
}

async function requestJson<T>(path: string, options: ApiRequestOptions = {}): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: { "Content-Type": "application/json" },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function requestUpload(path: "avatar" | "message-media" | "admin-video", file: File): Promise<ApiUpload | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/uploads/${path}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ApiUpload;
  } catch {
    return null;
  }
}

async function copyText(value: string): Promise<boolean> {
  try {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return false;
    }

    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function apiPersonToPerson(person: ApiPerson, index = 0): Person {
  return {
    id: person.id,
    name: person.name,
    handle: person.username,
    business: person.businessName,
    city: person.city,
    section: "food",
    avatarColor: index % gradients.length,
    online: person.online,
    bio: person.bio ?? undefined,
    avatarPath: person.avatarPath ?? undefined,
  };
}

function apiLessonToLesson(lesson: ApiLesson, index = 0): Lesson {
  return {
    id: lesson.id,
    title: lesson.title,
    duration: lesson.duration,
    views: lesson.views,
    section: "food",
    author: lesson.author,
    grad: index % gradients.length,
    description: lesson.description,
    sourcePath: lesson.sourcePath ?? lesson.hlsManifestPath ?? undefined,
    hlsManifestPath: lesson.hlsManifestPath ?? undefined,
    thumbnailPath: lesson.thumbnailPath ?? undefined,
    progress: lesson.progress,
    isNew: lesson.isNew,
  };
}

function apiGroupToGroup(group: ApiGroup, index = 0): Group {
  return {
    id: group.id,
    name: group.name,
    description: group.description ?? "",
    members: group.members,
    public: group.visibility === "PUBLIC",
    unread: group.unread,
    lastMessage: group.description ?? "Guruhga kirish",
    lastTime: "hozir",
    iconColor: index % gradients.length,
  };
}

function apiMessageToChatMessage(message: ApiMessage): ChatMessage {
  return {
    id: message.id,
    from: message.from,
    kind: message.type,
    text: message.text ?? "",
    mediaPath: message.mediaPath ?? undefined,
    mediaName: message.mediaPath ? message.mediaPath.split("/").pop() : undefined,
    time: message.time,
    status: message.status === "READ" ? "read" : "sent",
  };
}

function Avatar({ name, color = 0, size = "md", online = false, src }: { name: string; color?: number; size?: string; online?: boolean; src?: string }): ReactElement {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return <div className={cx("av", `av-c${color % gradients.length}`, size !== "md" && size, online && "av-online")}>{src ? <img className="av-img" src={resolveMediaUrl(src)} alt="" /> : initials || "B"}</div>;
}

function LessonThumb({ lesson, compact = false }: { lesson: Lesson; compact?: boolean }): ReactElement {
  return (
    <div className={cx("lesson-thumb", compact && "continue-thumb")}>
      <div className="lesson-thumb-gradient" style={{ background: gradients[lesson.grad % gradients.length] }} />
      <div className="lesson-thumb-bg" />
      {!compact ? <div className="lesson-thumb-label">VIDEO - {lesson.duration}</div> : null}
      <div className="lesson-duration">{lesson.duration}</div>
      {lesson.progress ? <div className="lesson-progress" style={{ width: formatProgress(lesson.progress) }} /> : null}
    </div>
  );
}

function LessonCard({
  lesson,
  onOpen,
  onSave,
}: {
  lesson: Lesson;
  onOpen: (lesson: Lesson) => void;
  onSave: (lesson: Lesson) => void;
}): ReactElement {
  function handleSave(event: MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    onSave(lesson);
  }

  return (
    <article className="lesson-card" role="button" tabIndex={0} onClick={() => onOpen(lesson)}>
      <LessonThumb lesson={lesson} />
      <div className="lesson-body">
        <h3 className="lesson-title">{lesson.title}</h3>
        <div className="lesson-meta">
          <span>{lesson.author}</span>
          <span className="lesson-meta-dot" />
          <span>{formatViews(lesson.views)} ko'rilgan</span>
          {lesson.isNew ? <span className="badge-new">Yangi</span> : null}
        </div>
        <div className="inline-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleSave}>
            <Bookmark size={13} /> Saqlash
          </button>
        </div>
      </div>
    </article>
  );
}

function ContinueCard({ lesson, onOpen }: { lesson: Lesson; onOpen: (lesson: Lesson) => void }): ReactElement {
  return (
    <button type="button" className="continue-card" onClick={() => onOpen(lesson)}>
      <LessonThumb lesson={lesson} compact />
      <div className="continue-body">
        <div>
          <h4 className="continue-title">{lesson.title}</h4>
          <div className="continue-meta">
            {formatProgress(lesson.progress)} ko'rilgan - {lesson.author}
          </div>
        </div>
        <div className="continue-bar">
          <div className="continue-bar-fill" style={{ width: formatProgress(lesson.progress) }} />
        </div>
      </div>
    </button>
  );
}

function SectionBlock({
  title,
  children,
  icon,
  onShowAll,
}: {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  onShowAll?: () => void;
}): ReactElement {
  return (
    <section className="section">
      <div className="section-head">
        <h2 className="section-title">
          <span className="section-title-icon">{icon}</span>
          {title}
        </h2>
        {onShowAll ? (
          <button type="button" className="section-link" onClick={onShowAll}>
            Hammasini ko'rish <ChevronRight size={12} />
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function PersonCard({
  person,
  onOpen,
  onMessage,
  onMore,
}: {
  person: Person;
  onOpen: (person: Person) => void;
  onMessage: (person: Person) => void;
  onMore: (person: Person) => void;
}): ReactElement {
  const section = sections.find((item) => item.id === person.section);

  function handleMessage(event: MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    onMessage(person);
  }

  function handleMore(event: MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    onMore(person);
  }

  return (
    <article className="person-card" role="button" tabIndex={0} onClick={() => onOpen(person)}>
      <div className="person-head">
        <Avatar name={person.name} color={person.avatarColor} size="lg" online={person.online} src={person.avatarPath} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="person-name">{person.name}</div>
          <div className="person-handle">@{person.handle}</div>
        </div>
      </div>
      <p className="person-biz">
        {person.business} - {person.city}
      </p>
      {section ? (
        <div className="person-tags">
          <span className="tag tag-brand">{section.name}</span>
        </div>
      ) : null}
      <div className="person-actions">
        <button type="button" className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={handleMessage}>
          <MessageSquare size={14} /> Xabar
        </button>
        <button type="button" className="btn btn-ghost btn-sm btn-icon" onClick={handleMore}>
          <MoreHorizontal size={16} />
        </button>
      </div>
    </article>
  );
}

function GroupCard({
  group,
  onOpen,
  onInvite,
}: {
  group: Group;
  onOpen: (group: Group) => void;
  onInvite: (group: Group) => void;
}): ReactElement {
  function handleInvite(event: MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    onInvite(group);
  }

  return (
    <article className="group-card" role="button" tabIndex={0} onClick={() => onOpen(group)}>
      <Avatar name={group.name} color={group.iconColor} size="lg" />
      <div className="group-meta">
        <div className="group-name">{group.name}</div>
        <div className="group-last">{group.lastMessage}</div>
        <div className="group-count">
          {group.members} a'zo - {group.public ? "Public" : "Private"} - {group.lastTime}
        </div>
      </div>
      {group.unread > 0 ? <div className="group-unread">{group.unread}</div> : null}
      <button type="button" className="btn btn-secondary btn-sm" onClick={handleInvite}>
        <Link size={13} /> Invite
      </button>
    </article>
  );
}

function HomeScreen({
  appLessons,
  appGroups,
  promoVideo,
  openLesson,
  openGroup,
  inviteGroup,
  saveLesson,
  go,
  copyShare,
}: {
  appLessons: Lesson[];
  appGroups: Group[];
  promoVideo: ApiPromoVideo | null;
  openLesson: (lesson: Lesson) => void;
  openGroup: (group: Group) => void;
  inviteGroup: (group: Group) => void;
  saveLesson: (lesson: Lesson) => void;
  go: (route: Route) => void;
  copyShare: () => void;
}): ReactElement {
  const continueLessons = appLessons.filter((lesson) => lesson.progress);
  const newLessons = appLessons.filter((lesson) => lesson.isNew);
  const popularLessons = [...appLessons].sort((a, b) => b.views - a.views).slice(0, 4);
  const promoTitle = promoVideo?.title ?? "Kofe Lab - siz uchun professional kofe tajribasi";
  const promoDesc = promoVideo?.description ?? "Jamoa tomonidan tayyorlangan professional video sizning biznesingiz haqida. Mehmonlar bilan ulashing, profilingizdan ko'rsating.";

  return (
    <div className="content-inner">
      <div className="hero-mysite">
        <div>
          <div className="eyebrow">
            <Star size={11} /> Mening saytim
          </div>
          <h1 className="hero-mysite-title">{promoTitle}</h1>
          <p className="hero-mysite-desc">{promoDesc}</p>
          <div className="hero-mysite-actions">
            <button type="button" className="btn btn-primary" onClick={() => go({ name: "mysite" })}>
              <Play size={14} /> Tomosha qilish
            </button>
            <button type="button" className="btn btn-secondary" onClick={copyShare}>
              <Share2 size={14} /> Ulashish
            </button>
          </div>
        </div>
        <button type="button" className="hero-mysite-preview" onClick={() => go({ name: "mysite" })}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.5), transparent 60%), radial-gradient(circle at 70% 70%, rgba(244,114,182,0.35), transparent 60%), #1a1d23",
            }}
          />
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <div className="player-canvas-icon">
              <Play size={28} />
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 10, left: 12, color: "white", fontSize: 11, fontWeight: 500 }}>
            {formatDurationSeconds(promoVideo?.durationSeconds)} - Mening saytim
          </div>
        </button>
      </div>

      <SectionBlock title="Davom ettirish" icon={<Play size={11} />} onShowAll={() => go({ name: "lessons" })}>
        <div className="continue-strip">
          {continueLessons.map((lesson) => (
            <ContinueCard key={lesson.id} lesson={lesson} onOpen={openLesson} />
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title="Yangi darslar" icon={<Star size={11} />} onShowAll={() => go({ name: "lessons" })}>
        <div className="row">
          {newLessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} onOpen={openLesson} onSave={saveLesson} />
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title="Mashhur darslar" icon={<Bookmark size={11} />} onShowAll={() => go({ name: "lessons" })}>
        <div className="row">
          {popularLessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} onOpen={openLesson} onSave={saveLesson} />
          ))}
        </div>
      </SectionBlock>

      <SectionBlock title="Mening guruhlarim" icon={<Users size={11} />} onShowAll={() => go({ name: "groups" })}>
        <div className="row-tight">
          {appGroups.map((group) => (
            <GroupCard key={group.id} group={group} onOpen={openGroup} onInvite={inviteGroup} />
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}

function LessonsScreen({
  appLessons,
  initialSection,
  openLesson,
  saveLesson,
}: {
  appLessons: Lesson[];
  initialSection?: string;
  openLesson: (lesson: Lesson) => void;
  saveLesson: (lesson: Lesson) => void;
}): ReactElement {
  const [filter, setFilter] = useState(initialSection ?? "all");
  const filtered = filter === "all" ? appLessons : appLessons.filter((lesson) => lesson.section === filter);

  return (
    <div className="content-inner">
      <div className="page-head">
        <h1 className="page-title">Darslar</h1>
        <p className="page-sub">Oziq-ovqat sohasidagi professional darslar - audio o'zbekcha - subtitle 4 tilda</p>
      </div>
      <div className="chip-bar" style={{ marginBottom: 24 }}>
        <button type="button" className={cx("chip", filter === "all" && "active")} onClick={() => setFilter("all")}>
          Hammasi
        </button>
        {sections.slice(0, 5).map((section) => (
          <button
            type="button"
            key={section.id}
            className={cx("chip", filter === section.id && "active")}
            onClick={() => setFilter(section.id)}
          >
            {section.name}
          </button>
        ))}
      </div>
      <div className="row">
        {filtered.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} onOpen={openLesson} onSave={saveLesson} />
        ))}
      </div>
    </div>
  );
}

function PlayerScreen({
  lesson,
  related,
  prefs,
  onPrefsChange,
  onProgress,
  onOpenLesson,
}: {
  lesson: Lesson;
  related: Lesson[];
  prefs: PlayerPrefs;
  onPrefsChange: (value: PlayerPrefs) => void;
  onProgress: (lesson: Lesson, progress: number) => void;
  onOpenLesson: (lesson: Lesson) => void;
}): ReactElement {
  const progress = Math.max(lesson.progress ?? DEFAULT_PROGRESS, MIN_PROGRESS);
  const lessonMediaUrl = resolveMediaUrl(lesson.sourcePath ?? lesson.hlsManifestPath);

  function togglePlaying(): void {
    onPrefsChange({ ...prefs, playing: !prefs.playing });
  }

  function cycleSpeed(): void {
    const currentIndex = speedOptions.indexOf(prefs.speed as (typeof speedOptions)[number]);
    const nextSpeed = speedOptions[(currentIndex + 1) % speedOptions.length];
    onPrefsChange({ ...prefs, speed: nextSpeed });
  }

  function cycleQuality(): void {
    const currentIndex = qualityOptions.indexOf(prefs.quality as (typeof qualityOptions)[number]);
    const nextQuality = qualityOptions[(currentIndex + 1) % qualityOptions.length];
    onPrefsChange({ ...prefs, quality: nextQuality });
  }

  function toggleCaptions(): void {
    onPrefsChange({ ...prefs, captions: !prefs.captions });
  }

  function advanceProgress(): void {
    const next = Math.min((lesson.progress ?? progress) + PROGRESS_STEP, COMPLETE_PROGRESS);
    onProgress(lesson, next);
  }

  return (
    <div className="content-inner">
      <div className="player-wrap">
        <div>
          <div className="player">
            {lessonMediaUrl ? (
              <video className="player-video" src={lessonMediaUrl} poster={resolveMediaUrl(lesson.thumbnailPath)} controls />
            ) : (
              <div
                className="player-canvas"
                style={{
                  background:
                    "radial-gradient(circle at 30% 40%, rgba(99,102,241,0.45), transparent 50%), radial-gradient(circle at 70% 60%, rgba(139,92,246,0.3), transparent 50%), #0a0c10",
                }}
              >
                <button type="button" className="player-canvas-icon" onClick={togglePlaying}>
                  {prefs.playing ? <Pause size={36} /> : <Play size={36} />}
                </button>
              </div>
            )}
            {prefs.captions ? <div className="player-subtitle">Restoran biznesini boshlashda eng muhim narsa - bozorni o'rganish</div> : null}
            <div className="player-controls">
              <button type="button" className="player-timeline" onClick={advanceProgress} aria-label="Progressni oldinga surish">
                <div className="player-timeline-fill" style={{ width: formatProgress(progress) }}>
                  <div className="player-timeline-thumb" />
                </div>
              </button>
              <div className="player-bar">
                <button type="button" className="player-btn" onClick={togglePlaying}>
                  {prefs.playing ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <div className="player-time">{formatProgress(progress)} / {lesson.duration}</div>
                <div className="player-spacer" />
                <button type="button" className="player-btn player-btn-wide" onClick={cycleSpeed}>
                  {prefs.speed}x
                </button>
                <button type="button" className="player-btn player-btn-wide" onClick={cycleQuality}>
                  {prefs.quality}
                </button>
                <button type="button" className={cx("player-btn", "player-btn-wide", prefs.captions && "active")} onClick={toggleCaptions}>
                  CC
                </button>
              </div>
            </div>
          </div>
          <div className="player-meta">
            <h1>{lesson.title}</h1>
            <div className="player-meta-row">
              <Avatar name={lesson.author} color={lesson.grad} size="sm" />
              <span style={{ fontWeight: 500, color: "var(--text)" }}>{lesson.author}</span>
              <span>-</span>
              <span>{lesson.views.toLocaleString("en")} ko'rilgan</span>
              <span>-</span>
              <span>{lesson.duration}</span>
            </div>
            <p className="player-desc">{lesson.description || "Ushbu darsda biznesni professional rivojlantirish uchun amaliy ko'nikmalar bosqichma-bosqich tushuntiriladi."}</p>
          </div>
        </div>
        <aside className="lesson-sidebar">
          <div className="lesson-sidebar-title">Shu bo'limdan</div>
          {related.map((item) => (
            <button type="button" key={item.id} className="lesson-sidebar-item" onClick={() => onOpenLesson(item)}>
              <LessonThumb lesson={item} compact />
              <div>
                <div className="lesson-sidebar-name">{item.title}</div>
                <div className="lesson-sidebar-meta">{item.author}</div>
              </div>
            </button>
          ))}
        </aside>
      </div>
    </div>
  );
}

function PeopleScreen({
  appPeople,
  openProfile,
  openMessage,
  showMore,
}: {
  appPeople: Person[];
  openProfile: (person: Person) => void;
  openMessage: (person: Person) => void;
  showMore: (person: Person) => void;
}): ReactElement {
  return (
    <div className="content-inner">
      <div className="page-head">
        <h1 className="page-title">Tadbirkorlar</h1>
        <p className="page-sub">O'z sohangizdagi va boshqa tadbirkorlar bilan tanishing</p>
      </div>
      <div className="row">
        {appPeople.map((person) => (
          <PersonCard key={person.id} person={person} onOpen={openProfile} onMessage={openMessage} onMore={showMore} />
        ))}
      </div>
    </div>
  );
}

function GroupsScreen({
  appGroups,
  openGroup,
  inviteGroup,
  createGroupAction,
}: {
  appGroups: Group[];
  openGroup: (group: Group) => void;
  inviteGroup: (group: Group) => void;
  createGroupAction: () => void;
}): ReactElement {
  return (
    <div className="content-inner">
      <div className="page-head page-head-actions">
        <div>
          <h1 className="page-title">Guruhlar</h1>
          <p className="page-sub">Public va private guruh chatlar - Telegram-style organik hamjamiyat</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={createGroupAction}>
          <Plus size={14} /> Guruh yaratish
        </button>
      </div>
      <div className="row-tight">
        {appGroups.map((group) => (
          <GroupCard key={group.id} group={group} onOpen={openGroup} onInvite={inviteGroup} />
        ))}
      </div>
    </div>
  );
}

function renderMessageContent(message: Pick<ChatMessage, "kind" | "text" | "mediaName" | "mediaPath">): ReactElement {
  const mediaUrl = resolveMediaUrl(message.mediaPath);

  if (message.kind === "IMAGE") {
    return (
      <div className="message-media">
        {mediaUrl ? <img src={mediaUrl} alt={message.mediaName ?? "Rasm"} /> : null}
        <span>{message.text || message.mediaName || "Rasm"}</span>
      </div>
    );
  }

  if (message.kind === "VOICE") {
    return (
      <div className="message-voice">
        <Mic size={16} />
        {mediaUrl ? <audio controls src={mediaUrl} /> : <span>{message.text || "Ovozli xabar"}</span>}
      </div>
    );
  }

  if (message.kind === "VIDEO_NOTE") {
    return (
      <div className="message-video-note">
        {mediaUrl ? <video controls src={mediaUrl} /> : <Video size={18} />}
        <span>{message.text || "Aylanacha video"}</span>
      </div>
    );
  }

  if (message.kind === "VIDEO") {
    return (
      <div className="message-media">
        {mediaUrl ? <video controls src={mediaUrl} /> : <Video size={16} />}
        <span>{message.text || message.mediaName || "Video xabar"}</span>
      </div>
    );
  }

  return <>{message.text}</>;
}

function GroupChatScreen({
  group,
  messages,
  draft,
  onDraftChange,
  onSend,
  onSendMedia,
  onBack,
  onInvite,
}: {
  group: Group;
  messages: GroupMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onSendMedia: (kind: ChatMessage["kind"], file?: File) => void;
  onBack: () => void;
  onInvite: (group: Group) => void;
}): ReactElement {
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  }

  return (
    <div className="chat-app has-active">
      <div className="chat-pane">
        <div className="chat-head">
          <button type="button" className="btn btn-ghost btn-icon" onClick={onBack}>
            <ChevronLeft size={18} />
          </button>
          <Avatar name={group.name} color={group.iconColor} />
          <div className="chat-head-info">
            <div className="chat-head-name">{group.name}</div>
            <div className="chat-head-status">{group.members} a'zo - {group.public ? "public" : "private"}</div>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onInvite(group)}>
            <Link size={13} /> Invite
          </button>
        </div>
        <div className="chat-stream">
          <div className="chat-day">
            <span>Bugun</span>
          </div>
          {messages.map((message) => (
            <div key={message.id} className={cx("chat-msg", message.from === "me" && "self")}>
              {message.from === "them" ? <Avatar name={message.author} color={1} size="sm" /> : null}
              <div>
                {message.from === "them" ? <div className="chat-msg-sender">{message.author}</div> : null}
                <div className="chat-msg-bubble">{renderMessageContent(message)}</div>
                <div className="chat-msg-time">{message.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <label className="chat-tool">
            <ImageIcon size={16} />
            <input type="file" accept="image/*" onChange={(event) => onSendMedia("IMAGE", event.target.files?.[0])} />
          </label>
          <label className="chat-tool">
            <Mic size={16} />
            <input type="file" accept="audio/*" onChange={(event) => onSendMedia("VOICE", event.target.files?.[0])} />
          </label>
          <label className="chat-tool">
            <Video size={16} />
            <input type="file" accept="video/*" onChange={(event) => onSendMedia("VIDEO_NOTE", event.target.files?.[0])} />
          </label>
          <textarea
            className="chat-input-field"
            placeholder="Guruhga xabar yozing..."
            rows={1}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="button" className="chat-send" disabled={!normalizeMessage(draft)} onClick={onSend}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessagesScreen({
  threads,
  activeThreadId,
  draft,
  query,
  onQueryChange,
  onDraftChange,
  onSelect,
  onSend,
  onSendMedia,
  onBackToList,
}: {
  threads: ThreadState[];
  activeThreadId: string;
  draft: string;
  query: string;
  onQueryChange: (value: string) => void;
  onDraftChange: (value: string) => void;
  onSelect: (threadId: string) => void;
  onSend: () => void;
  onSendMedia: (kind: ChatMessage["kind"], file?: File) => void;
  onBackToList: () => void;
}): ReactElement {
  const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? threads[0];
  const filtered = threads.filter((thread) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return thread.person.name.toLowerCase().includes(q) || thread.person.business.toLowerCase().includes(q);
  });

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  }

  return (
    <div className="chat-app has-active">
      <div className="chat-list">
        <div className="chat-list-head">
          <h2>Xabarlar</h2>
        </div>
        <div className="chat-list-search">
          <Search size={15} />
          <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Kontakt qidirish" />
        </div>
        <div className="chat-list-items">
          {filtered.map((thread) => (
            <button
              type="button"
              key={thread.id}
              className={cx("chat-list-item", thread.id === activeThread.id && "active")}
              onClick={() => onSelect(thread.id)}
            >
              <Avatar name={thread.person.name} color={thread.person.avatarColor} online={thread.person.online} src={thread.person.avatarPath} />
              <div>
                <div className="chat-list-item-name">{thread.person.name}</div>
                <div className="chat-list-item-msg">{thread.lastMessage}</div>
              </div>
              <div className="chat-list-item-meta">
                <div className="chat-list-item-time">hozir</div>
                {thread.unread > 0 ? <div className="chat-list-item-badge">{thread.unread}</div> : null}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="chat-pane">
        <div className="chat-head">
          <button type="button" className="btn btn-ghost btn-icon chat-mobile-back" onClick={onBackToList}>
            <ChevronLeft size={18} />
          </button>
          <Avatar name={activeThread.person.name} color={activeThread.person.avatarColor} online={activeThread.person.online} src={activeThread.person.avatarPath} />
          <div className="chat-head-info">
            <div className="chat-head-name">{activeThread.person.name}</div>
            <div className="chat-head-status">{activeThread.person.online ? "onlayn" : "offline"}</div>
          </div>
        </div>
        <div className="chat-stream">
          <div className="chat-day">
            <span>Bugun</span>
          </div>
          {activeThread.messages.map((message) => (
            <div key={message.id} className={cx("chat-msg", message.from === "me" && "self")}>
              {message.from === "them" ? <Avatar name={activeThread.person.name} color={activeThread.person.avatarColor} size="sm" src={activeThread.person.avatarPath} /> : null}
              <div>
                <div className="chat-msg-bubble">{renderMessageContent(message)}</div>
                <div className="chat-msg-time">
                  {message.time} {message.from === "me" ? <Check size={10} /> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <label className="chat-tool">
            <ImageIcon size={16} />
            <input type="file" accept="image/*" onChange={(event) => onSendMedia("IMAGE", event.target.files?.[0])} />
          </label>
          <label className="chat-tool">
            <Video size={16} />
            <input type="file" accept="video/*" onChange={(event) => onSendMedia("VIDEO", event.target.files?.[0])} />
          </label>
          <label className="chat-tool">
            <Mic size={16} />
            <input type="file" accept="audio/*" onChange={(event) => onSendMedia("VOICE", event.target.files?.[0])} />
          </label>
          <label className="chat-tool video-note">
            <Video size={16} />
            <input type="file" accept="video/*" onChange={(event) => onSendMedia("VIDEO_NOTE", event.target.files?.[0])} />
          </label>
          <textarea
            className="chat-input-field"
            placeholder="Xabar yozing..."
            rows={1}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="button" className="chat-send" disabled={!normalizeMessage(draft)} onClick={onSend}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsScreen({
  settings,
  activeTab,
  onActiveTabChange,
  onSettingsChange,
  onSave,
  onLogout,
}: {
  settings: SettingsState;
  activeTab: SettingsTab;
  onActiveTabChange: (tab: SettingsTab) => void;
  onSettingsChange: (settings: SettingsState) => void;
  onSave: () => void;
  onLogout: () => void;
}): ReactElement {
  function renderPanel(): ReactElement {
    if (activeTab === "profile") {
      return (
        <>
          <h3 className="settings-h">Profil</h3>
          <div className="settings-sub">Telefon boshqa foydalanuvchilarga ko'rinmaydi. Username 3-20 belgi.</div>
          <div className="settings-form-grid">
            <label className="form-field">
              <span>Ism</span>
              <input className="input-field" value={settings.firstName} onChange={(event) => onSettingsChange({ ...settings, firstName: event.target.value })} />
            </label>
            <label className="form-field">
              <span>Familiya</span>
              <input className="input-field" value={settings.lastName} onChange={(event) => onSettingsChange({ ...settings, lastName: event.target.value })} />
            </label>
            <label className="form-field">
              <span>Username</span>
              <input className="input-field" value={settings.username} onChange={(event) => onSettingsChange({ ...settings, username: event.target.value })} />
            </label>
          </div>
        </>
      );
    }

    if (activeTab === "language") {
      return (
        <>
          <h3 className="settings-h">Til</h3>
          <div className="settings-sub">Interfeys tili va subtitle standartini tanlang.</div>
          {["uz-Latn", "uz-Cyrl", "ru", "en"].map((language) => (
            <button
              type="button"
              key={language}
              className={cx("settings-row", settings.language === language && "settings-row-active")}
              onClick={() => onSettingsChange({ ...settings, language })}
            >
              <div>
                <div className="settings-row-label">{language}</div>
                <div className="settings-row-desc">Darslar va bildirishnomalar shu tilda ko'rsatiladi</div>
              </div>
              {settings.language === language ? <Check size={18} /> : null}
            </button>
          ))}
        </>
      );
    }

    if (activeTab === "business") {
      return (
        <>
          <h3 className="settings-h">Soha va bo'lim</h3>
          <div className="settings-sub">Feed va dars tavsiyalari shu tanlovga moslashadi.</div>
          <div className="chip-bar">
            {sections.slice(0, 7).map((section) => (
              <button
                type="button"
                key={section.id}
                className={cx("chip", settings.section === section.id && "active")}
                onClick={() => onSettingsChange({ ...settings, section: section.id })}
              >
                {section.name}
              </button>
            ))}
          </div>
        </>
      );
    }

    if (activeTab === "notifications") {
      return (
        <>
          <h3 className="settings-h">Bildirishnomalar</h3>
          <ToggleRow label="Yangi darslar" desc="Sizning sohangizga mos yangi dars chiqqanda." checked={settings.lessonNotifications} onChange={() => onSettingsChange({ ...settings, lessonNotifications: !settings.lessonNotifications })} />
          <ToggleRow label="Xabarlar" desc="Shaxsiy chat va guruh xabarlari." checked={settings.messageNotifications} onChange={() => onSettingsChange({ ...settings, messageNotifications: !settings.messageNotifications })} />
        </>
      );
    }

    if (activeTab === "privacy") {
      return (
        <>
          <h3 className="settings-h">Maxfiylik</h3>
          <ToggleRow label="Public profil" desc="Profilingiz boshqa tadbirkorlarga ko'rinadi." checked={settings.publicProfile} onChange={() => onSettingsChange({ ...settings, publicProfile: !settings.publicProfile })} />
          <ToggleRow label="Online holat" desc="Onlayn/offline statusni ko'rsatish." checked={settings.showOnline} onChange={() => onSettingsChange({ ...settings, showOnline: !settings.showOnline })} />
        </>
      );
    }

    if (activeTab === "theme") {
      return (
        <>
          <h3 className="settings-h">Tema</h3>
          <ToggleRow label="Dark tema" desc="Ko'zga qulay indigo-zinc dark interfeys." checked={settings.darkTheme} onChange={() => onSettingsChange({ ...settings, darkTheme: !settings.darkTheme })} />
        </>
      );
    }

    return (
      <>
        <h3 className="settings-h">Faol qurilmalar</h3>
        <div className="settings-row">
          <div>
            <div className="settings-row-label">Windows Desktop</div>
            <div className="settings-row-desc">Joriy sessiya - Toshkent</div>
          </div>
          <button type="button" className="btn btn-danger btn-sm" onClick={onLogout}>
            <LogOut size={13} /> Chiqish
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="content-inner">
      <div className="page-head page-head-actions">
        <div>
          <h1 className="page-title">Sozlamalar</h1>
          <p className="page-sub">Profil, til, soha, bildirishnoma, maxfiylik va faol qurilmalar</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onSave}>
          <Save size={14} /> Saqlash
        </button>
      </div>
      <div className="settings">
        <div className="settings-nav">
          {settingsTabs.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} type="button" className={cx("settings-nav-item", activeTab === item.id && "active")} onClick={() => onActiveTabChange(item.id)}>
                <Icon size={15} /> {item.label}
              </button>
            );
          })}
        </div>
        <div className="settings-panel">{renderPanel()}</div>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: () => void }): ReactElement {
  return (
    <button type="button" className="settings-row" onClick={onChange}>
      <div>
        <div className="settings-row-label">{label}</div>
        <div className="settings-row-desc">{desc}</div>
      </div>
      <span className={cx("toggle", checked && "on")} />
    </button>
  );
}

function MySiteScreen({
  share,
  promoVideo,
  playing,
  onTogglePlay,
  onCopy,
  onToggleShare,
}: {
  share: ShareState;
  promoVideo: ApiPromoVideo | null;
  playing: boolean;
  onTogglePlay: () => void;
  onCopy: () => void;
  onToggleShare: () => void;
}): ReactElement {
  const promoTitle = promoVideo?.title ?? "Mening saytim videosi";
  const promoDesc = promoVideo?.description ?? "Professional promo video profilingizga biriktirilganda shu yerda ko'rinadi.";
  const promoUrl = resolveMediaUrl(promoVideo?.sourcePath ?? promoVideo?.hlsManifestPath);
  const shareCode = promoVideo?.shareToken ? `biznesjon.uz/share/promo/${promoVideo.shareToken}` : "biznesjon.uz/v/mening-saytim";

  return (
    <div className="content-inner">
      <div className="page-head page-head-actions">
        <div>
          <h1 className="page-title">{promoTitle}</h1>
          <p className="page-sub">Jamoa tomonidan tayyorlangan Mening saytim videosi. Public link orqali ulashish mumkin.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onCopy}>
          {share.copied ? <Check size={14} /> : <Copy size={14} />} Link
        </button>
      </div>
      <div className="player" style={{ aspectRatio: "16/9", background: "#0a0c10" }}>
        {promoUrl ? (
          <video className="player-video" src={promoUrl} poster={resolveMediaUrl(promoVideo?.thumbnailPath)} controls />
        ) : (
          <div className="player-canvas">
            <button type="button" className="player-canvas-icon" onClick={onTogglePlay}>
              {playing ? <Pause size={36} /> : <Play size={36} />}
            </button>
          </div>
        )}
      </div>
      <div className="mysite-grid">
        <p className="player-desc">{promoDesc}</p>
        <div className="settings-panel">
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Public link</div>
              <div className="settings-row-desc">{share.enabled ? "Faol" : "O'chirilgan"}</div>
            </div>
            <button type="button" className={cx("toggle", share.enabled && "on")} onClick={onToggleShare} />
          </div>
          <button type="button" className="copy-code" onClick={onCopy}>
            {shareCode}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminScreen({
  lessonDraft,
  promoDraft,
  users,
  onLessonDraftChange,
  onPromoDraftChange,
  onLessonFileSelect,
  onPromoFileSelect,
  onCreateLesson,
  onCreatePromo,
}: {
  lessonDraft: AdminDraft;
  promoDraft: AdminDraft;
  users: Person[];
  onLessonDraftChange: (value: AdminDraft) => void;
  onPromoDraftChange: (value: AdminDraft) => void;
  onLessonFileSelect: (file: File) => void;
  onPromoFileSelect: (file: File) => void;
  onCreateLesson: () => void;
  onCreatePromo: () => void;
}): ReactElement {
  return (
    <div className="content-inner">
      <div className="page-head">
        <h1 className="page-title">Admin panel</h1>
        <p className="page-sub">Dars videolari va Mening saytim videolarini yuklash, foydalanuvchiga biriktirish.</p>
      </div>
      <div className="admin-grid">
        <div className="settings-panel">
          <h3 className="settings-h">Dars videosi yuklash</h3>
          <div className="settings-sub">MP4/MOV fayl nomi, 4 til metadata uchun bazaviy sarlavha va tavsif.</div>
          <label className="form-field">
            <span>Sarlavha</span>
            <input className="input-field" value={lessonDraft.title} onChange={(event) => onLessonDraftChange({ ...lessonDraft, title: event.target.value })} />
          </label>
          <label className="form-field">
            <span>Tavsif</span>
            <textarea className="input-field" value={lessonDraft.description} onChange={(event) => onLessonDraftChange({ ...lessonDraft, description: event.target.value })} />
          </label>
          <label className="form-field">
            <span>Davomiylik, sekund</span>
            <input className="input-field" type="number" value={lessonDraft.durationSeconds} onChange={(event) => onLessonDraftChange({ ...lessonDraft, durationSeconds: Number(event.target.value) })} />
          </label>
          <label className="upload-drop">
            <UploadCloud size={20} />
            <span>{lessonDraft.videoFileName || "Video fayl tanlang"}</span>
            <input type="file" accept="video/mp4,video/quicktime,video/*" onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onLessonFileSelect(file);
            }} />
          </label>
          <button type="button" className="btn btn-primary" onClick={onCreateLesson}>
            <UploadCloud size={14} /> Darsni publish qilish
          </button>
        </div>

        <div className="settings-panel">
          <h3 className="settings-h">Mening saytim videosi</h3>
          <div className="settings-sub">Professional promo videoni tanlangan foydalanuvchi profiliga biriktirish.</div>
          <label className="form-field">
            <span>Foydalanuvchi</span>
            <select className="input-field" value={promoDraft.userId} onChange={(event) => onPromoDraftChange({ ...promoDraft, userId: event.target.value })}>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name} - @{user.handle}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Sarlavha</span>
            <input className="input-field" value={promoDraft.title} onChange={(event) => onPromoDraftChange({ ...promoDraft, title: event.target.value })} />
          </label>
          <label className="form-field">
            <span>Tavsif</span>
            <textarea className="input-field" value={promoDraft.description} onChange={(event) => onPromoDraftChange({ ...promoDraft, description: event.target.value })} />
          </label>
          <label className="upload-drop">
            <UploadCloud size={20} />
            <span>{promoDraft.videoFileName || "Promo video fayl tanlang"}</span>
            <input type="file" accept="video/mp4,video/quicktime,video/*" onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onPromoFileSelect(file);
            }} />
          </label>
          <button type="button" className="btn btn-primary" onClick={onCreatePromo}>
            <Star size={14} /> Profilga biriktirish
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileScreen({
  person,
  isOwn,
  avatarPath,
  savedLessons,
  onAvatarUpload,
  onOpenLesson,
  openMessage,
  shareProfile,
}: {
  person: Person;
  isOwn: boolean;
  avatarPath?: string;
  savedLessons: Lesson[];
  onAvatarUpload: (file: File) => void;
  onOpenLesson: (lesson: Lesson) => void;
  openMessage: (person: Person) => void;
  shareProfile: (person: Person) => void;
}): ReactElement {
  return (
    <div className="content-inner">
      <div className="profile-cover" />
      <div className="profile-head">
        <Avatar name={person.name} color={person.avatarColor} size="xxl" online={person.online} src={isOwn ? avatarPath : person.avatarPath} />
        <div className="profile-info">
          <h1 className="profile-name">{person.name}</h1>
          <div className="profile-handle">@{person.handle}</div>
        </div>
        <div className="inline-actions">
          {isOwn ? (
            <label className="btn btn-secondary">
              <UploadCloud size={14} /> Avatar yuklash
              <input className="visually-hidden-input" type="file" accept="image/*" onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onAvatarUpload(file);
              }} />
            </label>
          ) : null}
          <button type="button" className="btn btn-secondary" onClick={() => shareProfile(person)}>
            <Share2 size={14} /> Ulashish
          </button>
          <button type="button" className="btn btn-primary" onClick={() => openMessage(person)}>
            <MessageSquare size={14} /> Xabar yuborish
          </button>
        </div>
      </div>
      <p className="profile-bio" style={{ marginTop: 24 }}>
        {person.bio || `${person.business} - ${person.city}. Biznesjon tadbirkorlar hamjamiyati a'zosi.`}
      </p>
      <SectionBlock title="Saqlangan videolar" icon={<Bookmark size={11} />}>
        {savedLessons.length ? (
          <div className="row">
            {savedLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} onOpen={onOpenLesson} onSave={() => undefined} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <div className="empty-title">Hali saqlangan video yo'q</div>
            <div className="empty-desc">Dars kartasidagi saqlash tugmasi orqali videolar shu yerga tushadi.</div>
          </div>
        )}
      </SectionBlock>
    </div>
  );
}

function NotificationPanel({
  notifications,
  onClose,
  onRead,
  onReadAll,
}: {
  notifications: AppNotification[];
  onClose: () => void;
  onRead: (id: string) => void;
  onReadAll: () => void;
}): ReactElement {
  return (
    <div className="notification-panel">
      <div className="notification-head">
        <strong>Bildirishnomalar</strong>
        <button type="button" className="btn btn-ghost btn-icon" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
      <button type="button" className="btn btn-secondary btn-sm notification-read-all" onClick={onReadAll}>
        Hammasini o'qildi qilish
      </button>
      {notifications.map((notification) => (
        <button
          type="button"
          key={notification.id}
          className={cx("notification-item", !notification.readAt && "unread")}
          onClick={() => onRead(notification.id)}
        >
          <span>{notification.title}</span>
          <small>{notification.body}</small>
        </button>
      ))}
    </div>
  );
}

function CmdK({
  open,
  query,
  onQueryChange,
  onClose,
  openLesson,
  openProfile,
  openGroup,
  go,
  appLessons,
  appPeople,
  appGroups,
}: {
  open: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
  openLesson: (lesson: Lesson) => void;
  openProfile: (person: Person) => void;
  openGroup: (group: Group) => void;
  go: (route: Route) => void;
  appLessons: Lesson[];
  appPeople: Person[];
  appGroups: Group[];
}): ReactElement | null {
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rawResults = [
      ...appLessons.map((lesson) => ({ type: "lesson" as const, id: lesson.id, title: lesson.title, subtitle: lesson.author, payload: lesson })),
      ...appPeople.map((person) => ({ type: "person" as const, id: person.id, title: person.name, subtitle: `@${person.handle}`, payload: person })),
      ...appGroups.map((group) => ({ type: "group" as const, id: group.id, title: group.name, subtitle: group.description, payload: group })),
      { type: "route" as const, id: "settings", title: "Sozlamalar", subtitle: "Profil va bildirishnomalar", payload: { name: "settings" } as Route },
    ];

    if (!q) return rawResults.slice(0, 8);
    return rawResults.filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(q)).slice(0, 8);
  }, [appGroups, appLessons, appPeople, query]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Escape") {
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="cmdk" onClick={(event) => event.stopPropagation()}>
        <div className="cmdk-input">
          <Search size={18} />
          <input autoFocus value={query} onChange={(event) => onQueryChange(event.target.value)} onKeyDown={handleKeyDown} placeholder="Darslar, tadbirkorlar, guruhlar - qidiring..." />
          <kbd>ESC</kbd>
        </div>
        <div className="cmdk-results">
          {results.length === 0 ? <div className="empty-desc" style={{ padding: 16 }}>Natija topilmadi</div> : null}
          {results.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              className="cmdk-item"
              onClick={() => {
                onClose();
                if (item.type === "lesson") openLesson(item.payload);
                if (item.type === "person") openProfile(item.payload);
                if (item.type === "group") openGroup(item.payload);
                if (item.type === "route") go(item.payload);
              }}
            >
              <div className="cmdk-icon">{item.type === "lesson" ? <Play size={14} /> : item.type === "person" ? <User size={14} /> : <Users size={14} />}</div>
              <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{item.title}</div>
                <div className="cmdk-item-sub">{item.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToastStack({ toasts }: { toasts: Toast[] }): ReactElement {
  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div key={toast.id} className={cx("toast", `toast-${toast.tone}`)}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

function LoginScreen({
  auth,
  onAuthChange,
  onLogin,
  onRegister,
  onVerify,
}: {
  auth: AuthState;
  onAuthChange: (value: AuthState) => void;
  onLogin: () => void;
  onRegister: () => void;
  onVerify: () => void;
}): ReactElement {
  const isOtp = auth.mode === "otp";
  const isRegister = auth.mode === "register";

  function updateAuth(patch: Partial<AuthState>): void {
    onAuthChange({ ...auth, ...patch, error: patch.error ?? null });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (isOtp) {
      onVerify();
      return;
    }

    if (isRegister) {
      onRegister();
      return;
    }

    onLogin();
  }

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <div className="sidebar-brand-mark">B</div>
        <span>Biznesjon</span>
      </div>
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card-head">
          <div className="eyebrow">
            <Shield size={11} /> Xavfsiz kirish
          </div>
          <h1>{isOtp ? "OTP tasdiqlash" : isRegister ? "Akkaunt yaratish" : "Platformaga kirish"}</h1>
          <p>{isOtp ? "SMS orqali yuborilgan 6 xonali kodni kiriting." : "Tadbirkorlar uchun darslar, chat va Mening saytim kabineti."}</p>
        </div>

        {!isOtp ? (
          <>
            <label className="auth-field">
              <span>Telefon</span>
              <div className="auth-input">
                <Phone size={16} />
                <input value={auth.phone} onChange={(event) => updateAuth({ phone: event.target.value })} placeholder="+998901234567" />
              </div>
            </label>
            <label className="auth-field">
              <span>Parol</span>
              <div className="auth-input">
                <LockKeyhole size={16} />
                <input type="password" value={auth.password} onChange={(event) => updateAuth({ password: event.target.value })} placeholder="Kamida 8 belgi" />
              </div>
            </label>
          </>
        ) : (
          <label className="auth-field">
            <span>OTP kod</span>
            <div className="auth-input">
              <Shield size={16} />
              <input value={auth.code} onChange={(event) => updateAuth({ code: event.target.value })} placeholder="123456" inputMode="numeric" />
            </div>
          </label>
        )}

        {auth.error ? <div className="auth-error">{auth.error}</div> : null}

        <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={auth.loading}>
          {auth.loading ? "Tekshirilmoqda..." : isOtp ? "Tasdiqlash" : isRegister ? "Ro'yxatdan o'tish" : "Kirish"}
        </button>

        <div className="auth-switch">
          {isOtp ? (
            <button type="button" onClick={() => updateAuth({ mode: "login", code: "" })}>
              Login sahifasiga qaytish
            </button>
          ) : (
            <button type="button" onClick={() => updateAuth({ mode: isRegister ? "login" : "register" })}>
              {isRegister ? "Akkauntingiz bormi? Kirish" : "Yangi akkaunt yaratish"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export function BiznesjonApp(): ReactElement {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [auth, setAuth] = useState<AuthState>({
    mode: "login",
    phone: "+998901234567",
    password: "password123",
    code: "",
    otpToken: "",
    loading: false,
    error: null,
  });
  const [route, setRoute] = useState<Route>({ name: "home" });
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [appLessons, setAppLessons] = useState<Lesson[]>(lessons);
  const [appPeople, setAppPeople] = useState<Person[]>(people);
  const [appGroups, setAppGroups] = useState<Group[]>(groups);
  const [promoVideo, setPromoVideo] = useState<ApiPromoVideo | null>(null);
  const [savedLessonIds, setSavedLessonIds] = useState<string[]>([]);
  const [avatarPath, setAvatarPath] = useState<string | undefined>(undefined);
  const [adminLessonDraft, setAdminLessonDraft] = useState<AdminDraft>({
    title: "Yangi professional dars",
    description: "Admin panel orqali yuklangan video dars.",
    durationSeconds: 1200,
    videoFileName: "",
    userId: "user_1",
  });
  const [adminPromoDraft, setAdminPromoDraft] = useState<AdminDraft>({
    title: "Yangi Mening saytim videosi",
    description: "Mijoz biznesi haqida professional video.",
    durationSeconds: 180,
    videoFileName: "",
    userId: "user_1",
  });
  const [threads, setThreads] = useState<ThreadState[]>(createInitialThreads);
  const [groupMessages, setGroupMessages] = useState<Record<string, GroupMessage[]>>(createInitialGroupMessages);
  const [messageDraft, setMessageDraft] = useState("");
  const [groupDraft, setGroupDraft] = useState("");
  const [messageQuery, setMessageQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "notif_1",
      title: "Mening saytim videosi tayyor",
      body: "Kofe Lab videosi profilingizga biriktirildi.",
      readAt: null,
    },
  ]);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("profile");
  const [settings, setSettings] = useState<SettingsState>({
    firstName: "Bekzod",
    lastName: "Olimov",
    username: "bekzod_o",
    language: "uz-Latn",
    section: "food",
    publicProfile: true,
    showOnline: true,
    lessonNotifications: true,
    messageNotifications: true,
    darkTheme: true,
  });
  const [playerPrefs, setPlayerPrefs] = useState<PlayerPrefs>({
    playing: true,
    speed: 1,
    quality: "1080p",
    captions: true,
  });
  const [promoPlaying, setPromoPlaying] = useState(false);
  const [share, setShare] = useState<ShareState>({ enabled: true, copied: false });

  const activeThreadId = route.name === "messages" && route.threadId ? route.threadId : threads[0]?.id ?? "";
  const activeGroup = route.name === "groupChat" ? appGroups.find((group) => group.id === route.groupId) ?? appGroups[0] : appGroups[0];
  const activeLesson = route.name === "player" ? appLessons.find((lesson) => lesson.id === route.lessonId) ?? appLessons[0] : appLessons[0];
  const activePerson = route.name === "profile" && route.personId ? appPeople.find((person) => person.id === route.personId) ?? appPeople[0] : appPeople[0];
  const savedLessons = appLessons.filter((lesson) => savedLessonIds.includes(lesson.id));
  const isOwnProfile = route.name !== "profile" || !route.personId || activePerson.id === "user_1";
  const unreadNotifications = notifications.filter((notification) => !notification.readAt).length;

  const title =
    route.name === "player"
      ? activeLesson.title
      : route.name === "profile"
        ? activePerson.handle
        : route.name === "groupChat"
          ? activeGroup.name
          : {
              home: "Bosh sahifa",
              lessons: "Darslar",
              mysite: "Mening saytim",
              people: "Tadbirkorlar",
              groups: "Guruhlar",
              messages: "Xabarlar",
              settings: "Sozlamalar",
              admin: "Admin panel",
            }[route.name];

  const nav = [
    { id: "home", label: "Bosh sahifa", icon: iconMap.home },
    { id: "lessons", label: "Darslar", icon: iconMap.lessons },
    { id: "mysite", label: "Mening saytim", icon: iconMap.mysite, badge: share.enabled ? 1 : 0 },
    { id: "people", label: "Tadbirkorlar", icon: iconMap.people },
    { id: "groups", label: "Guruhlar", icon: iconMap.groups, badge: appGroups.reduce((total, group) => total + group.unread, 0) },
    { id: "messages", label: "Xabarlar", icon: iconMap.messages, badge: threads.reduce((total, thread) => total + thread.unread, 0) },
  ] as const;

  useEffect(() => {
    function handleShortcut(event: globalThis.KeyboardEvent): void {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCmdOpen(true);
      }
      if (event.key === "Escape") {
        setCmdOpen(false);
        setNotificationsOpen(false);
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void loadServerData();
    }
  }, [isAuthenticated]);

  async function loadServerData(): Promise<void> {
    const [feed, users, serverGroups, serverNotifications, savedLessons, serverThreads, promoVideos] = await Promise.all([
      requestJson<{
        continueWatching: ApiLesson[];
        newest: ApiLesson[];
        popular: ApiLesson[];
      }>("/lessons/feed/home"),
      requestJson<ApiPerson[]>("/users"),
      requestJson<ApiGroup[]>("/groups"),
      requestJson<Array<{ id: string; title: string; body: string | null; readAt: string | null }>>("/notifications"),
      requestJson<ApiLesson[]>("/me/saved-lessons"),
      requestJson<ApiThread[]>("/messages/threads"),
      requestJson<ApiPromoVideo[]>("/me/promo-videos"),
    ]);

    if (feed) {
      const lessonMap = new Map<string, Lesson>();
      [...feed.continueWatching, ...feed.newest, ...feed.popular].forEach((lesson, index) => {
        lessonMap.set(lesson.id, apiLessonToLesson(lesson, index));
      });
      setAppLessons([...lessonMap.values()]);
    }

    if (users?.length) {
      const mappedUsers = users.map(apiPersonToPerson);
      setAppPeople(mappedUsers);
      const currentUser = mappedUsers.find((person) => person.id === "user_1") ?? mappedUsers[0];
      const [firstName = "Bekzod", lastName = "Olimov"] = currentUser.name.split(" ");
      setAvatarPath(currentUser.avatarPath);
      setSettings((current) => ({
        ...current,
        firstName,
        lastName,
        username: currentUser.handle,
      }));
    }

    if (serverGroups) {
      setAppGroups(serverGroups.map(apiGroupToGroup));
    }

    if (serverNotifications) {
      setNotifications(serverNotifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        body: notification.body ?? "",
        readAt: notification.readAt,
      })));
    }

    if (savedLessons) {
      setSavedLessonIds(savedLessons.map((lesson) => lesson.id));
    }

    if (serverThreads) {
      const details = await Promise.all(
        serverThreads.map((thread) =>
          requestJson<{ id: string; user: ApiPerson; messages: ApiMessage[] }>(`/messages/threads/${thread.id}`),
        ),
      );
      setThreads(
        serverThreads.map((thread, index) => {
          const detail = details[index];
          return {
            id: thread.id,
            person: apiPersonToPerson(thread.user, index),
            messages: detail?.messages.map(apiMessageToChatMessage) ?? [],
            lastMessage: thread.lastMessage,
            unread: thread.unread,
          };
        }),
      );
    }

    if (promoVideos?.length) {
      setPromoVideo(promoVideos[0]);
      setShare((current) => ({ ...current, enabled: promoVideos[0].isShareable }));
    }
  }

  function pushToast(message: string, tone: ToastTone = "success"): void {
    const toast: Toast = { id: createId("toast"), message, tone };
    setToasts((current) => [...current, toast]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== toast.id));
    }, TOAST_TIMEOUT_MS);
  }

  function validateAuthFields(): boolean {
    const phone = auth.phone.trim();
    const password = auth.password.trim();
    if (!phone || !password) {
      setAuth((current) => ({ ...current, error: "Telefon va parol majburiy" }));
      return false;
    }

    return true;
  }

  async function loginAction(): Promise<void> {
    if (!validateAuthFields()) return;

    setAuth((current) => ({ ...current, loading: true, error: null }));
    const result = await requestJson<{ accessToken: string }>("/auth/login", {
      method: "POST",
      body: { phone: auth.phone, password: auth.password },
    });
    setAuth((current) => ({ ...current, loading: false }));

    if (!result?.accessToken) {
      setAuth((current) => ({ ...current, error: "Login bajarilmadi" }));
      return;
    }

    setIsAuthenticated(true);
    pushToast("Xush kelibsiz");
  }

  async function registerAction(): Promise<void> {
    if (!validateAuthFields()) return;

    setAuth((current) => ({ ...current, loading: true, error: null }));
    const result = await requestJson<{ otpToken: string }>("/auth/register", {
      method: "POST",
      body: { phone: auth.phone, password: auth.password },
    });
    setAuth((current) => ({
      ...current,
      loading: false,
      mode: result?.otpToken ? "otp" : current.mode,
      otpToken: result?.otpToken ?? current.otpToken,
      error: result?.otpToken ? null : "OTP yuborilmadi",
    }));
  }

  async function verifyOtpAction(): Promise<void> {
    if (auth.code.trim().length !== 6) {
      setAuth((current) => ({ ...current, error: "OTP 6 xonali bo'lishi kerak" }));
      return;
    }

    setAuth((current) => ({ ...current, loading: true, error: null }));
    const result = await requestJson<{ ok: boolean; accessToken: string }>("/auth/verify-otp", {
      method: "POST",
      body: { otpToken: auth.otpToken, code: auth.code },
    });
    setAuth((current) => ({ ...current, loading: false }));

    if (!result?.ok) {
      setAuth((current) => ({ ...current, error: "OTP kod noto'g'ri" }));
      return;
    }

    setIsAuthenticated(true);
    pushToast("Akkaunt tasdiqlandi");
  }

  function openLesson(lesson: Lesson): void {
    setRoute({ name: "player", lessonId: lesson.id });
  }

  function openProfile(person: Person): void {
    setRoute({ name: "profile", personId: person.id });
  }

  function openGroup(group: Group): void {
    setAppGroups((current) => current.map((item) => (item.id === group.id ? { ...item, unread: 0 } : item)));
    setRoute({ name: "groupChat", groupId: group.id });
  }

  function openMessage(person: Person): void {
    const thread =
      threads.find((item) => item.person.id === person.id) ?? {
        id: person.id,
        person,
        messages: [],
        lastMessage: "Yangi suhbat",
        unread: 0,
      };
    setThreads((current) => {
      const exists = current.some((item) => item.id === thread.id);
      const next = exists ? current : [thread, ...current];
      return next.map((item) => (item.id === thread.id ? { ...item, unread: 0 } : item));
    });
    setRoute({ name: "messages", threadId: thread.id });
  }

  function saveLesson(lesson: Lesson): void {
    setAppLessons((current) => current.map((item) => (item.id === lesson.id ? { ...item, progress: item.progress ?? MIN_PROGRESS } : item)));
    setSavedLessonIds((current) => (current.includes(lesson.id) ? current : [lesson.id, ...current]));
    void requestJson(`/me/saved-lessons/${lesson.id}`, { method: "POST" });
    pushToast("Dars saqlandi");
  }

  function updateLessonProgress(lesson: Lesson, progress: number): void {
    const safeProgress = Math.max(MIN_PROGRESS, Math.min(progress, COMPLETE_PROGRESS));
    setAppLessons((current) => current.map((item) => (item.id === lesson.id ? { ...item, progress: safeProgress } : item)));
    void requestJson(`/lessons/${lesson.id}/progress`, {
      method: "POST",
      body: { positionSeconds: Math.round(safeProgress * 1000) },
    });
  }

  async function copyShare(): Promise<void> {
    const linkValue = promoVideo?.shareUrl ?? (promoVideo?.shareToken ? `https://biznesjon.uz/share/promo/${promoVideo.shareToken}` : "https://biznesjon.uz/v/mening-saytim");
    const copied = await copyText(linkValue);
    setShare((current) => ({ ...current, copied: true }));
    pushToast(copied ? "Share link nusxalandi" : linkValue, copied ? "success" : "info");
  }

  async function togglePromoShare(): Promise<void> {
    if (!promoVideo) {
      pushToast("Avval promo video biriktiring", "error");
      return;
    }

    const nextEnabled = !share.enabled;
    setShare((current) => ({ ...current, enabled: nextEnabled }));
    const updated = await requestJson<ApiPromoVideo>(`/me/promo-videos/${promoVideo.id}/${nextEnabled ? "enable-sharing" : "disable-sharing"}`, { method: "POST" });
    if (updated) setPromoVideo(updated);
    pushToast(nextEnabled ? "Public link yoqildi" : "Public link o'chirildi", "info");
  }

  async function inviteGroup(group: Group): Promise<void> {
    const invite = await requestJson<{ url: string }>(`/groups/${group.id}/invites`, { method: "POST" });
    const linkValue = invite?.url ? `https://biznesjon.uz${invite.url}` : `https://biznesjon.uz/groups/${group.id}`;
    const copied = await copyText(linkValue);
    pushToast(copied ? "Invite link nusxalandi" : "Invite link tayyor", "success");
  }

  async function createGroupAction(): Promise<void> {
    const result = await requestJson<ApiGroup>("/groups", {
      method: "POST",
      body: { name: "Yangi biznes guruhi", description: "Tajriba almashish uchun yangi guruh", visibility: "PUBLIC" },
    });

    if (!result) {
      pushToast("Guruh yaratilmadi", "error");
      return;
    }

    const createdGroup = apiGroupToGroup(result, appGroups.length);
    setAppGroups((current) => [createdGroup, ...current]);
    setGroupMessages((current) => ({ ...current, [createdGroup.id]: [] }));
    pushToast("Guruh yaratildi");
  }

  async function sendMessage(): Promise<void> {
    const text = normalizeMessage(messageDraft);
    if (!text || !activeThreadId) {
      return;
    }

    const message: ChatMessage = {
      id: createId("msg"),
      from: "me",
      kind: "TEXT",
      text,
      time: getCurrentTime(),
      status: "sent",
    };

    setThreads((current) =>
      current.map((thread) =>
        thread.id === activeThreadId
          ? {
              ...thread,
              messages: [...thread.messages, message],
              lastMessage: text,
              unread: 0,
            }
          : thread,
      ),
    );
    setMessageDraft("");
    await requestJson(`/messages/threads/${activeThreadId}`, { method: "POST", body: { text, type: "TEXT" } });
  }

  async function sendMediaMessage(kind: ChatMessage["kind"], file?: File): Promise<void> {
    if (!activeThreadId) return;
    if (!file) {
      pushToast("Media fayl tanlang", "error");
      return;
    }
    if (file.size > MAX_MESSAGE_MEDIA_SIZE_BYTES) {
      pushToast("Media fayl hajmi limitdan katta", "error");
      return;
    }

    const upload = await requestUpload("message-media", file);
    if (!upload) {
      pushToast("Media yuborilmadi", "error");
      return;
    }

    const mediaPath = upload.path;
    const text = kind === "VOICE" ? `Ovozli xabar - ${file.name}` : kind === "VIDEO_NOTE" ? `Aylanacha video - ${file.name}` : file.name;
    const message: ChatMessage = {
      id: createId("msg"),
      from: "me",
      kind,
      text,
      mediaPath,
      mediaName: file.name,
      time: getCurrentTime(),
      status: "sent",
    };

    setThreads((current) =>
      current.map((thread) =>
        thread.id === activeThreadId
          ? {
              ...thread,
              messages: [...thread.messages, message],
              lastMessage: text,
              unread: 0,
            }
          : thread,
      ),
    );
    await requestJson(`/messages/threads/${activeThreadId}`, { method: "POST", body: { text, type: kind, mediaPath } });
  }

  async function sendGroupMessage(): Promise<void> {
    const text = normalizeMessage(groupDraft);
    if (!text || !activeGroup) {
      return;
    }

    const message: GroupMessage = {
      id: createId("gmsg"),
      from: "me",
      author: `${settings.firstName} ${settings.lastName}`,
      kind: "TEXT",
      text,
      time: getCurrentTime(),
    };

    setGroupMessages((current) => ({
      ...current,
      [activeGroup.id]: [...(current[activeGroup.id] ?? []), message],
    }));
    setAppGroups((current) => current.map((group) => (group.id === activeGroup.id ? { ...group, lastMessage: text, lastTime: "hozir", unread: 0 } : group)));
    setGroupDraft("");
    await requestJson(`/groups/${activeGroup.id}/messages`, { method: "POST", body: { text, type: "TEXT" } });
  }

  async function sendGroupMediaMessage(kind: ChatMessage["kind"], file?: File): Promise<void> {
    if (!activeGroup) return;
    if (!file) {
      pushToast("Media fayl tanlang", "error");
      return;
    }
    if (file.size > MAX_MESSAGE_MEDIA_SIZE_BYTES) {
      pushToast("Media fayl hajmi limitdan katta", "error");
      return;
    }

    const upload = await requestUpload("message-media", file);
    if (!upload) {
      pushToast("Media yuborilmadi", "error");
      return;
    }

    const mediaPath = upload.path;
    const text = kind === "VOICE" ? `Guruh ovozli xabari - ${file.name}` : kind === "VIDEO_NOTE" ? `Guruh aylanacha videosi - ${file.name}` : file.name;
    const message: GroupMessage = {
      id: createId("gmsg"),
      from: "me",
      author: `${settings.firstName} ${settings.lastName}`,
      kind,
      text,
      mediaPath,
      mediaName: file.name,
      time: getCurrentTime(),
    };
    setGroupMessages((current) => ({
      ...current,
      [activeGroup.id]: [...(current[activeGroup.id] ?? []), message],
    }));
    setAppGroups((current) => current.map((group) => (group.id === activeGroup.id ? { ...group, lastMessage: text, lastTime: "hozir", unread: 0 } : group)));
    await requestJson(`/groups/${activeGroup.id}/messages`, { method: "POST", body: { text, type: kind, mediaPath } });
  }

  function readNotification(id: string): void {
    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, readAt: item.readAt ?? new Date().toISOString() } : item)));
    void requestJson(`/notifications/${id}/read`, { method: "POST" });
  }

  function readAllNotifications(): void {
    const readAt = new Date().toISOString();
    setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? readAt })));
    void requestJson("/notifications/read-all", { method: "POST" });
    pushToast("Bildirishnomalar o'qildi", "info");
  }

  async function saveSettings(): Promise<void> {
    if (!settings.firstName.trim() || !settings.username.trim()) {
      pushToast("Ism va username bo'sh bo'lmasin", "error");
      return;
    }

    const updated = await requestJson<ApiPerson>("/me", {
      method: "POST",
      body: {
        firstName: settings.firstName,
        lastName: settings.lastName,
        username: settings.username,
        sectionId: "section_food",
        language: settings.language,
      },
    });

    if (updated) {
      setAppPeople((current) => current.map((person, index) => (person.id === updated.id ? apiPersonToPerson(updated, index) : person)));
    }
    document.documentElement.dataset.theme = settings.darkTheme ? "dark" : "light";
    pushToast("Sozlamalar saqlandi");
  }

  function shareProfile(person: Person): void {
    void copyText(`https://biznesjon.uz/@${person.handle}`);
    pushToast("Profil linki tayyor");
  }

  async function uploadAvatar(file: File): Promise<void> {
    if (!file.type.startsWith("image/")) {
      pushToast("Avatar uchun rasm tanlang", "error");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      pushToast("Avatar 5MB dan kichik bo'lishi kerak", "error");
      return;
    }

    const upload = await requestUpload("avatar", file);
    if (!upload) {
      pushToast("Avatar yuklanmadi", "error");
      return;
    }

    setAvatarPath(upload.path);
    setAppPeople((current) => current.map((person) => (person.id === "user_1" ? { ...person, avatarPath: upload.path } : person)));
    await requestJson("/me/avatar", { method: "POST", body: { avatarPath: upload.path } });
    pushToast("Profil rasmi yangilandi");
  }

  async function uploadAdminVideo(file: File, target: "lesson" | "promo"): Promise<void> {
    if (!file.type.startsWith("video/")) {
      pushToast("Video fayl tanlang", "error");
      return;
    }
    if (file.size > MAX_ADMIN_VIDEO_SIZE_BYTES) {
      pushToast("Video fayl hajmi limitdan katta", "error");
      return;
    }

    const upload = await requestUpload("admin-video", file);
    if (!upload) {
      pushToast("Video yuklanmadi", "error");
      return;
    }

    if (target === "lesson") {
      setAdminLessonDraft((current) => ({ ...current, videoFileName: upload.path }));
    } else {
      setAdminPromoDraft((current) => ({ ...current, videoFileName: upload.path }));
    }
    pushToast("Video fayl yuklandi");
  }

  async function createAdminLesson(): Promise<void> {
    if (!adminLessonDraft.videoFileName) {
      pushToast("Avval video fayl yuklang", "error");
      return;
    }

    const lesson = await requestJson<ApiLesson>("/admin/lessons", {
      method: "POST",
      body: {
        title: adminLessonDraft.title,
        description: adminLessonDraft.description,
        durationSeconds: adminLessonDraft.durationSeconds,
        videoFileName: adminLessonDraft.videoFileName,
        sectionId: "section_food",
      },
    });

    if (!lesson) {
      pushToast("Dars yuklashda xato", "error");
      return;
    }

    setAppLessons((current) => [apiLessonToLesson(lesson, current.length), ...current]);
    pushToast("Dars videosi publish qilindi");
  }

  async function createAdminPromo(): Promise<void> {
    if (!adminPromoDraft.videoFileName) {
      pushToast("Avval promo video yuklang", "error");
      return;
    }

    const promo = await requestJson<ApiPromoVideo>("/admin/promo-videos", {
      method: "POST",
      body: {
        title: adminPromoDraft.title,
        description: adminPromoDraft.description,
        durationSeconds: adminPromoDraft.durationSeconds,
        videoFileName: adminPromoDraft.videoFileName,
        userId: adminPromoDraft.userId,
      },
    });

    if (!promo) {
      pushToast("Promo video biriktirishda xato", "error");
      return;
    }

    setShare((current) => ({ ...current, enabled: true }));
    setPromoVideo(promo);
    pushToast("Mening saytim videosi profilga biriktirildi");
  }

  function showPersonMore(person: Person): void {
    pushToast(`${person.business} profili ochildi`, "info");
  }

  function logout(): void {
    setIsAuthenticated(false);
    setRoute({ name: "home" });
    pushToast("Sessiya yopildi", "info");
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen auth={auth} onAuthChange={setAuth} onLogin={loginAction} onRegister={registerAction} onVerify={verifyOtpAction} />
        <ToastStack toasts={toasts} />
      </>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">B</div>
          <span className="sidebar-brand-text">Biznesjon</span>
        </div>
        <div className="sidebar-section">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = route.name === item.id || (item.id === "lessons" && route.name === "player") || (item.id === "groups" && route.name === "groupChat");
            return (
              <button key={item.id} type="button" className={cx("nav-item", active && "active")} onClick={() => setRoute(createSimpleRoute(item.id))}>
                <div className="nav-icon">
                  <Icon size={17} />
                </div>
                <span className="nav-text">{item.label}</span>
                {"badge" in item && item.badge > 0 ? <span className="nav-badge">{item.badge}</span> : null}
              </button>
            );
          })}
        </div>
        <div className="sidebar-section">
          <div className="sidebar-section-label">Hisob</div>
          <button type="button" className={cx("nav-item", route.name === "profile" && !route.personId && "active")} onClick={() => setRoute({ name: "profile" })}>
            <div className="nav-icon">
              <User size={17} />
            </div>
            <span className="nav-text">Profilim</span>
          </button>
          <button type="button" className={cx("nav-item", route.name === "settings" && "active")} onClick={() => setRoute({ name: "settings" })}>
            <div className="nav-icon">
              <Settings size={17} />
            </div>
            <span className="nav-text">Sozlamalar</span>
          </button>
          <button type="button" className={cx("nav-item", route.name === "admin" && "active")} onClick={() => setRoute({ name: "admin" })}>
            <div className="nav-icon">
              <UploadCloud size={17} />
            </div>
            <span className="nav-text">Admin panel</span>
          </button>
        </div>
        <div className="sidebar-footer">
          <button type="button" className="sidebar-profile" onClick={() => setRoute({ name: "profile" })}>
            <Avatar name={`${settings.firstName} ${settings.lastName}`} color={0} online={settings.showOnline} src={avatarPath} />
            <div className="sidebar-profile-meta">
              <div className="sidebar-profile-name">{settings.firstName} {settings.lastName}</div>
              <div className="sidebar-profile-handle">@{settings.username}</div>
            </div>
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="mobile-header">
          <div className="mobile-header-brand">
            <div className="sidebar-brand-mark">B</div>
            <span>Biznesjon</span>
          </div>
          <button type="button" className="icon-btn" onClick={() => setCmdOpen(true)}>
            <Search size={18} />
          </button>
        </header>
        {route.name !== "messages" && route.name !== "groupChat" ? (
          <header className="topbar">
            <div className="topbar-title">{title}</div>
            <button type="button" className="topbar-search" onClick={() => setCmdOpen(true)}>
              <Search size={15} />
              <span className="topbar-search-placeholder">Qidirish...</span>
              <kbd>Ctrl K</kbd>
            </button>
            <div className="topbar-notification-wrap">
              <button type="button" className="icon-btn" onClick={() => setNotificationsOpen((open) => !open)}>
                <Bell size={18} />
                {unreadNotifications > 0 ? <span className="dot" /> : null}
              </button>
              {notificationsOpen ? (
                <NotificationPanel
                  notifications={notifications}
                  onClose={() => setNotificationsOpen(false)}
                  onRead={readNotification}
                  onReadAll={readAllNotifications}
                />
              ) : null}
            </div>
          </header>
        ) : null}

        <div className="content" style={route.name === "messages" || route.name === "groupChat" ? { padding: 0 } : undefined}>
          {route.name === "home" ? (
            <HomeScreen
              appLessons={appLessons}
              appGroups={appGroups}
              promoVideo={promoVideo}
              openLesson={openLesson}
              openGroup={openGroup}
              inviteGroup={inviteGroup}
              saveLesson={saveLesson}
              go={setRoute}
              copyShare={copyShare}
            />
          ) : null}
          {route.name === "lessons" ? <LessonsScreen appLessons={appLessons} initialSection={route.section} openLesson={openLesson} saveLesson={saveLesson} /> : null}
          {route.name === "player" ? (
            <PlayerScreen
              lesson={activeLesson}
              related={appLessons.filter((item) => item.id !== activeLesson.id).slice(0, 6)}
              prefs={playerPrefs}
              onPrefsChange={setPlayerPrefs}
              onProgress={updateLessonProgress}
              onOpenLesson={openLesson}
            />
          ) : null}
          {route.name === "mysite" ? <MySiteScreen share={share} promoVideo={promoVideo} playing={promoPlaying} onTogglePlay={() => setPromoPlaying((value) => !value)} onCopy={copyShare} onToggleShare={togglePromoShare} /> : null}
          {route.name === "people" ? <PeopleScreen appPeople={appPeople} openProfile={openProfile} openMessage={openMessage} showMore={showPersonMore} /> : null}
          {route.name === "groups" ? <GroupsScreen appGroups={appGroups} openGroup={openGroup} inviteGroup={inviteGroup} createGroupAction={createGroupAction} /> : null}
          {route.name === "groupChat" ? (
            <GroupChatScreen
              group={activeGroup}
              messages={groupMessages[activeGroup.id] ?? []}
              draft={groupDraft}
              onDraftChange={setGroupDraft}
              onSend={sendGroupMessage}
              onSendMedia={sendGroupMediaMessage}
              onBack={() => setRoute({ name: "groups" })}
              onInvite={inviteGroup}
            />
          ) : null}
          {route.name === "messages" ? (
            <MessagesScreen
              threads={threads}
              activeThreadId={activeThreadId}
              draft={messageDraft}
              query={messageQuery}
              onQueryChange={setMessageQuery}
              onDraftChange={setMessageDraft}
              onSelect={(threadId) => {
                setThreads((current) => current.map((thread) => (thread.id === threadId ? { ...thread, unread: 0 } : thread)));
                setRoute({ name: "messages", threadId });
              }}
              onSend={sendMessage}
              onSendMedia={sendMediaMessage}
              onBackToList={() => setRoute({ name: "messages" })}
            />
          ) : null}
          {route.name === "admin" ? (
            <AdminScreen
              lessonDraft={adminLessonDraft}
              promoDraft={adminPromoDraft}
              users={appPeople}
              onLessonDraftChange={setAdminLessonDraft}
              onPromoDraftChange={setAdminPromoDraft}
              onLessonFileSelect={(file) => void uploadAdminVideo(file, "lesson")}
              onPromoFileSelect={(file) => void uploadAdminVideo(file, "promo")}
              onCreateLesson={createAdminLesson}
              onCreatePromo={createAdminPromo}
            />
          ) : null}
          {route.name === "settings" ? (
            <SettingsScreen
              settings={settings}
              activeTab={settingsTab}
              onActiveTabChange={setSettingsTab}
              onSettingsChange={setSettings}
              onSave={saveSettings}
              onLogout={logout}
            />
          ) : null}
          {route.name === "profile" ? (
            <ProfileScreen
              person={activePerson}
              isOwn={isOwnProfile}
              avatarPath={avatarPath}
              savedLessons={savedLessons}
              onAvatarUpload={(file) => void uploadAvatar(file)}
              onOpenLesson={openLesson}
              openMessage={openMessage}
              shareProfile={shareProfile}
            />
          ) : null}
        </div>

        <nav className="tab-bar">
          {([
            { id: "home", label: "Bosh", Icon: Home },
            { id: "lessons", label: "Darslar", Icon: BookOpen },
            { id: "groups", label: "Guruhlar", Icon: Users },
            { id: "messages", label: "Xabarlar", Icon: MessageSquare },
            { id: "profile", label: "Profil", Icon: User },
          ] as const).map((item) => (
            <button key={item.id} type="button" className={cx("tab-bar-item", route.name === item.id && "active")} onClick={() => setRoute(createSimpleRoute(item.id))}>
              <div className="tab-bar-item-icon">
                <item.Icon size={20} />
              </div>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </main>

      <CmdK
        open={cmdOpen}
        query={cmdQuery}
        onQueryChange={setCmdQuery}
        onClose={() => setCmdOpen(false)}
        openLesson={openLesson}
        openProfile={openProfile}
        openGroup={openGroup}
        go={setRoute}
        appLessons={appLessons}
        appPeople={appPeople}
        appGroups={appGroups}
      />
      <ToastStack toasts={toasts} />
    </div>
  );
}
