"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, resolveMedia } from "../../../../lib/api/client";
import { useAuthStore } from "../../../../lib/store/auth";

type LessonDto = {
  id: string;
  title: string;
  description: string;
  duration: string;
  views: number;
  progress: number;
  positionSeconds: number;
  thumbnailPath: string | null;
  author: string;
  isNew: boolean;
};

type GroupDto = {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  members: number;
  joined: boolean;
  myRole: string | null;
};

type PersonDto = {
  id: string;
  name: string;
  username: string;
  businessName: string;
  city: string;
  avatarPath: string | null;
  online: boolean;
};

type HomeFeed = {
  mySite: { id: string; shareToken: string | null } | null;
  continueWatching: LessonDto[];
  newest: LessonDto[];
  popular: LessonDto[];
  myGroups: GroupDto[];
  newPeople: PersonDto[];
};

const GRADS = [
  "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
  "linear-gradient(135deg, #14b8a6 0%, #0ea5e9 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
  "linear-gradient(135deg, #84cc16 0%, #10b981 100%)",
  "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
  "linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)",
  "linear-gradient(135deg, #f97316 0%, #db2777 100%)",
  "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
  "linear-gradient(135deg, #65a30d 0%, #16a34a 100%)",
];

function fmtViews(v: number) {
  return v > 1000 ? (v / 1000).toFixed(1) + "K" : String(v);
}

function LessonThumb({ gradIdx, thumbnailPath, alt, children }: { gradIdx: number; thumbnailPath?: string | null; alt?: string; children?: React.ReactNode }) {
  return (
    <div className="lesson-thumb">
      {thumbnailPath ? (
        <img src={resolveMedia(thumbnailPath)} alt={alt ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <>
          <div className="lesson-thumb-bg" />
          <div className="lesson-thumb-gradient" style={{ background: GRADS[gradIdx % GRADS.length] }} />
        </>
      )}
      {children}
    </div>
  );
}

function LessonCard({ lesson, locale, gradIdx }: { lesson: LessonDto; locale: string; gradIdx: number }) {
  const pct = Math.round(lesson.progress * 100);
  return (
    <Link href={`/${locale}/lessons/${lesson.id}`} className="lesson-card">
      <LessonThumb gradIdx={gradIdx} thumbnailPath={lesson.thumbnailPath} alt={lesson.title}>
        <span className="lesson-duration" style={{ fontFamily: "var(--font-mono)" }}>{lesson.duration}</span>
        {pct > 0 && <div className="lesson-progress" style={{ width: `${pct}%` }} />}
        <div className="lesson-play-overlay">
          <div className="play-circle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          </div>
        </div>
      </LessonThumb>
      <div className="lesson-body">
        <h3 className="lesson-title">{lesson.title}</h3>
        <div className="lesson-meta">
          <span>{lesson.author}</span>
          <span className="lesson-meta-dot" />
          <span>{fmtViews(lesson.views)} ko'rilgan</span>
          {lesson.isNew && (
            <span style={{ marginLeft: "auto", background: "var(--brand-tint)", color: "var(--brand)", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Yangi
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function ContinueCard({ lesson, locale, gradIdx }: { lesson: LessonDto; locale: string; gradIdx: number }) {
  const pct = Math.round(lesson.progress * 100);
  return (
    <Link href={`/${locale}/lessons/${lesson.id}`} className="continue-card">
      <div className="continue-thumb">
        {lesson.thumbnailPath ? (
          <img src={resolveMedia(lesson.thumbnailPath)} alt={lesson.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--r-sm)" }} />
        ) : (
          <>
            <div className="lesson-thumb-bg" />
            <div className="lesson-thumb-gradient" style={{ background: GRADS[gradIdx % GRADS.length] }} />
          </>
        )}
        <span className="lesson-duration" style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>{lesson.duration}</span>
      </div>
      <div className="continue-body">
        <div>
          <h4 className="continue-title">{lesson.title}</h4>
          <div className="continue-meta">{pct}% ko'rilgan · {lesson.author}</div>
        </div>
        <div className="continue-bar">
          <div className="continue-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Link>
  );
}

function SectionHeading({ icon, title, link, onLink }: { icon: React.ReactNode; title: string; link: string; onLink: () => void }) {
  return (
    <div className="section-head">
      <h2 className="section-title">
        <span className="section-title-icon">{icon}</span>
        {title}
      </h2>
      <button type="button" className="section-link" onClick={onLink}>
        {link}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

// Icon components matching prototype
const IconPlay = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
);
const IconSparkles = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.88 5.76L19.64 9l-4.76 3.44L16.5 19 12 15.6 7.5 19l2.12-6.56L4.36 9l5.76-.24z" />
  </svg>
);
const IconFire = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);
const IconUsers = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconHandshake = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 12H3" /><path d="m15 12 6-6" /><path d="M8 7 3 12l5 5" /><path d="m19 6-4 4 4 4" />
  </svg>
);
const IconStar = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function HomePage() {
  const t = useTranslations("home");
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const [feed, setFeed] = useState<HomeFeed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<HomeFeed>("/lessons/feed/home").then(setFeed).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="content-inner">
        {/* Skeleton hero */}
        <div style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 28, marginBottom: 36 }}>
          <div className="skeleton skeleton-text" style={{ width: 100, height: 22, borderRadius: "var(--r-full)" }} />
          <div className="skeleton skeleton-text lg" style={{ width: "70%", marginTop: 14 }} />
          <div className="skeleton skeleton-text" style={{ width: "50%", marginTop: 8 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            <div className="skeleton" style={{ width: 110, height: 34, borderRadius: "var(--r-md)" }} />
            <div className="skeleton" style={{ width: 90, height: 34, borderRadius: "var(--r-md)" }} />
          </div>
        </div>
        {/* Skeleton lesson row */}
        <div className="skeleton skeleton-text lg" style={{ width: 180, marginBottom: 14 }} />
        <div className="row">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="lesson-card" style={{ pointerEvents: "none" }}>
              <div className="skeleton skeleton-thumb" />
              <div className="lesson-body">
                <div className="skeleton skeleton-text lg" style={{ width: "90%" }} />
                <div className="skeleton skeleton-text" style={{ width: "55%", marginTop: 6 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasSomething = (feed?.continueWatching?.length ?? 0) > 0
    || (feed?.newest?.length ?? 0) > 0
    || (feed?.popular?.length ?? 0) > 0;

  return (
    <div className="content-inner">

      {/* ── Mening saytim — hero ── */}
      {feed?.mySite && (
        <div className="hero-mysite">
          <div>
            <div className="eyebrow">
              <IconStar /> Mening saytim
            </div>
            <h1 className="hero-mysite-title">
              {user?.profile?.businessName ?? user?.profile?.firstName ?? "Biznesingiz"}ning professional sahifasi
            </h1>
            <p className="hero-mysite-desc">
              Jamoa tomonidan tayyorlangan professional video sizning biznesingiz haqida. Mehmonlar bilan ulashing, profilingizdan ko'rsating.
            </p>
            <div className="hero-mysite-actions">
              <Link href={`/${locale}/mysite`} className="btn btn-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                Tomosha qilish
              </Link>
              <button type="button" className="btn btn-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Ulashish
              </button>
            </div>
          </div>
          <div className="hero-mysite-preview" onClick={() => window.location.href = `/${locale}/mysite`}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.5), transparent 60%), radial-gradient(circle at 70% 70%, rgba(244,114,182,0.35), transparent 60%), #1a1d23" }} />
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(20px)", display: "grid", placeItems: "center", color: "white" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: 10, left: 12, color: "white", fontSize: 11, fontWeight: 500, opacity: 0.85, fontFamily: "var(--font-mono)" }}>
              Mening saytim
            </div>
            <div style={{ position: "absolute", top: 10, right: 12, background: "rgba(0,0,0,0.5)", color: "white", fontSize: 10, padding: "3px 7px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, background: "#34d399", borderRadius: "50%" }} /> Faol
            </div>
          </div>
        </div>
      )}

      {/* ── Davom ettirish ── */}
      {(feed?.continueWatching?.length ?? 0) > 0 && (
        <section className="section">
          <SectionHeading
            icon={<IconPlay />}
            title={t("continueWatching")}
            link={t("viewAll")}
            onLink={() => window.location.href = `/${locale}/lessons`}
          />
          <div className="continue-strip">
            {feed!.continueWatching.slice(0, 4).map((lesson, i) => (
              <ContinueCard key={lesson.id} lesson={lesson} locale={locale} gradIdx={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Yangi darslar ── */}
      {(feed?.newest?.length ?? 0) > 0 && (
        <section className="section">
          <SectionHeading
            icon={<IconSparkles />}
            title={t("newLessons")}
            link={t("viewAll")}
            onLink={() => window.location.href = `/${locale}/lessons`}
          />
          <div className="row">
            {feed!.newest.slice(0, 4).map((lesson, i) => (
              <LessonCard key={lesson.id} lesson={lesson} locale={locale} gradIdx={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Mashhur darslar ── */}
      {(feed?.popular?.length ?? 0) > 0 && (
        <section className="section">
          <SectionHeading
            icon={<IconFire />}
            title={t("popular")}
            link={t("viewAll")}
            onLink={() => window.location.href = `/${locale}/lessons`}
          />
          <div className="row">
            {feed!.popular.slice(0, 4).map((lesson, i) => (
              <LessonCard key={lesson.id} lesson={lesson} locale={locale} gradIdx={i + 4} />
            ))}
          </div>
        </section>
      )}

      {/* ── Mening guruhlarim ── */}
      {(feed?.myGroups?.length ?? 0) > 0 && (
        <section className="section">
          <SectionHeading
            icon={<IconUsers />}
            title={t("myGroups")}
            link={t("viewAll")}
            onLink={() => window.location.href = `/${locale}/groups`}
          />
          <div className="row-tight">
            {feed!.myGroups.slice(0, 6).map((group) => {
              const colorIdx = group.name.charCodeAt(0) % 8;
              const initials = group.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
              return (
                <Link key={group.id} href={`/${locale}/groups/${group.id}`} className="group-card">
                  <div className={`av av-c${colorIdx} lg`}>{initials}</div>
                  <div className="group-meta">
                    <div className="group-name">{group.name}</div>
                    {group.description && (
                      <div className="group-last">{group.description}</div>
                    )}
                    <div className="group-count">{group.members} a'zo</div>
                  </div>
                  {group.myRole === "OWNER" || group.myRole === "ADMIN" ? (
                    <div style={{ fontSize: 10, color: "var(--brand)", background: "var(--brand-tint)", padding: "2px 7px", borderRadius: "var(--r-full)", fontWeight: 600 }}>
                      Admin
                    </div>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Yangi tadbirkorlar ── */}
      {(feed?.newPeople?.length ?? 0) > 0 && (
        <section className="section">
          <SectionHeading
            icon={<IconHandshake />}
            title={t("newEntrepreneurs")}
            link={t("viewAll")}
            onLink={() => window.location.href = `/${locale}/people`}
          />
          <div className="row">
            {feed!.newPeople.slice(0, 4).map((person) => {
              const initials = person.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
              const colorIdx = person.name.charCodeAt(0) % 8;
              return (
                <Link key={person.id} href={`/${locale}/people/${person.username}`} className="person-card">
                  <div className="person-head">
                    <div className={`av av-c${colorIdx} lg${person.online ? " av-online" : ""}`}>
                      {person.avatarPath ? (
                        <img className="av-img" src={resolveMedia(person.avatarPath)} alt={person.name} />
                      ) : initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="person-name">{person.name}</div>
                      <div className="person-handle">@{person.username}</div>
                    </div>
                  </div>
                  {(person.businessName || person.city) && (
                    <p className="person-biz">
                      {[person.businessName, person.city].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <div className="person-actions" onClick={(e) => e.preventDefault()}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/${locale}/messages?with=${person.id}`;
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Xabar
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Bo'sh holat ── */}
      {!hasSomething && !feed?.mySite && (
        <div style={{ padding: "64px 20px 56px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Decorative rings */}
          <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 28px" }}>
            <div style={{ position: "absolute", inset: -18, borderRadius: "50%", border: "1px dashed rgba(99,102,241,0.2)", animation: "spin 20s linear infinite" }} />
            <div style={{ position: "absolute", inset: -36, borderRadius: "50%", border: "1px dashed rgba(139,92,246,0.12)", animation: "spin 30s linear infinite reverse" }} />
            <div style={{
              width: 120, height: 120, borderRadius: "50%",
              background: "radial-gradient(circle at 38% 32%, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.1) 50%, transparent 80%), var(--bg-elev)",
              border: "1.5px solid var(--brand-tint-strong)",
              display: "grid", placeItems: "center",
              boxShadow: "0 0 40px rgba(99,102,241,0.15), 0 8px 32px rgba(0,0,0,0.12)",
              color: "var(--brand)",
            }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            {/* Floating dots */}
            <div style={{ position: "absolute", top: 4, right: -6, width: 10, height: 10, borderRadius: "50%", background: "var(--brand)", opacity: 0.5 }} />
            <div style={{ position: "absolute", bottom: 8, left: -8, width: 7, height: 7, borderRadius: "50%", background: "#8b5cf6", opacity: 0.4 }} />
            <div style={{ position: "absolute", top: "50%", right: -14, width: 5, height: 5, borderRadius: "50%", background: "#ec4899", opacity: 0.45 }} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-strong)", marginBottom: 10, letterSpacing: "-0.025em" }}>
            Xush kelibsiz, {user?.profile?.firstName ?? "tadbirkor"}!
          </div>
          <div style={{ fontSize: 14, color: "var(--text-dim)", maxWidth: 320, lineHeight: 1.65, marginBottom: 28 }}>
            Sizning bo'limingiz uchun professional darslar va guruhlar tez orada qo'shiladi. Hozircha boshqa tadbirkorlar bilan tanishing.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href={`/${locale}/lessons`} className="btn btn-primary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Darslarni ko'rish
            </Link>
            <Link href={`/${locale}/people`} className="btn btn-secondary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Tadbirkorlar
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
