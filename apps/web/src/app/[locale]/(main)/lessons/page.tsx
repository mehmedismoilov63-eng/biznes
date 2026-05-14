"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  sectionId: string;
};

// Gradient pool — cycles by lesson index
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

// Section name / label map
const SECTION_META: Record<string, { name: string; label: string; icon: string }> = {
  sec_biz_food:     { name: "Oziq-ovqat sohasidagi", label: "Oziq-ovqat", icon: "🍽️" },
  sec_biz_beauty:   { name: "Go'zallik sohasidagi",  label: "Go'zallik",  icon: "💇" },
  sec_biz_workshop: { name: "Ustaxona sohasidagi",   label: "Ustaxona",   icon: "🔧" },
  sec_biz_retail:   { name: "Savdo sohasidagi",      label: "Chakana savdo", icon: "🛒" },
  sec_it_web:       { name: "IT / Web sohasidagi",   label: "IT / Web",   icon: "💻" },
};

function fmtViews(v: number) {
  return v > 1000 ? (v / 1000).toFixed(1) + "K" : String(v);
}

function LessonCard({ lesson, locale, gradIdx }: { lesson: LessonDto; locale: string; gradIdx: number }) {
  const progressPct = Math.round(lesson.progress * 100);
  const grad = GRADS[gradIdx % GRADS.length];

  return (
    <Link href={`/${locale}/lessons/${lesson.id}`} className="lesson-card">
      <div className="lesson-thumb">
        {lesson.thumbnailPath ? (
          <img
            src={resolveMedia(lesson.thumbnailPath)}
            alt={lesson.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <>
            <div className="lesson-thumb-bg" />
            <div className="lesson-thumb-gradient" style={{ background: grad }} />
          </>
        )}
        <span className="lesson-duration" style={{ fontFamily: "var(--font-mono)" }}>
          {lesson.duration}
        </span>
        {progressPct > 0 && (
          <div className="lesson-progress" style={{ width: `${progressPct}%` }} />
        )}
        <div className="lesson-play-overlay">
          <div className="play-circle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
          </div>
        </div>
      </div>
      <div className="lesson-body">
        <h3 className="lesson-title">{lesson.title}</h3>
        <div className="lesson-meta">
          <span>{lesson.author}</span>
          <span className="lesson-meta-dot" />
          <span>{fmtViews(lesson.views)} ko'rilgan</span>
          {lesson.isNew && (
            <span style={{
              marginLeft: "auto",
              background: "var(--brand-tint)", color: "var(--brand)",
              fontSize: 10, fontWeight: 700, padding: "1px 6px",
              borderRadius: 4, letterSpacing: "0.04em", textTransform: "uppercase",
            }}>
              Yangi
            </span>
          )}
        </div>
        {progressPct > 0 && (
          <div style={{ fontSize: 12, color: "var(--brand)", marginTop: 6, fontWeight: 500 }}>
            {progressPct}% ko'rildi
          </div>
        )}
      </div>
    </Link>
  );
}

export default function LessonsPage() {
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<"new" | "views">("new");

  useEffect(() => {
    api.get<LessonDto[]>("/lessons").then(setLessons).finally(() => setLoading(false));
  }, []);

  const sectionMeta = SECTION_META[user?.sectionId ?? ""] ?? null;

  // Build unique section chips from returned lessons
  const sectionChips = useMemo(() => {
    const seen = new Set<string>();
    const chips: { id: string; icon: string; label: string }[] = [];
    for (const l of lessons) {
      if (!seen.has(l.sectionId) && SECTION_META[l.sectionId]) {
        seen.add(l.sectionId);
        chips.push({ id: l.sectionId, icon: SECTION_META[l.sectionId].icon, label: SECTION_META[l.sectionId].label });
      }
    }
    return chips;
  }, [lessons]);

  const sorted = useMemo(() => {
    let arr = [...lessons];
    if (filter !== "all") arr = arr.filter((l) => l.sectionId === filter);
    if (sort === "views") arr.sort((a, b) => b.views - a.views);
    if (sort === "new") arr.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    return arr;
  }, [lessons, filter, sort]);

  const subtitle = !loading
    ? `${sectionMeta ? sectionMeta.name + " " : ""}${lessons.length} ta professional dars · audio o'zbekcha`
    : "";

  return (
    <div className="content-inner">
      <div className="page-head">
        <h1 className="page-title">Darslar</h1>
        {!loading && <p className="page-sub">{subtitle}</p>}
      </div>

      {/* Chip + sort bar */}
      <div className="chip-bar" style={{ marginBottom: 24 }}>
        <div
          className={`chip${filter === "all" ? " active" : ""}`}
          onClick={() => setFilter("all")}
        >
          Hammasi
        </div>
        {sectionChips.map((chip) => (
          <div
            key={chip.id}
            className={`chip${filter === chip.id ? " active" : ""}`}
            onClick={() => setFilter(chip.id)}
          >
            <span>{chip.icon}</span> {chip.label}
          </div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Saralash:</span>
          <select
            className="select-pill"
            value={sort}
            onChange={(e) => setSort(e.target.value as "new" | "views")}
          >
            <option value="new">Yangilari</option>
            <option value="views">Mashhurligi</option>
          </select>
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="row">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="lesson-card" style={{ pointerEvents: "none" }}>
              <div className="skeleton skeleton-thumb" />
              <div className="lesson-body">
                <div className="skeleton skeleton-text lg" style={{ width: "90%" }} />
                <div className="skeleton skeleton-text" style={{ width: "60%", marginTop: 8 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && sorted.length === 0 && (
        <div className="empty">
          <div className="empty-icon">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" opacity="0.6" />
            </svg>
          </div>
          <div className="empty-title">Hali darslar yo'q</div>
          <div className="empty-desc">
            {filter !== "all"
              ? "Bu bo'lim uchun hali darslar mavjud emas. Boshqa kategoriyani sinab ko'ring."
              : "Sizning bo'limingiz uchun professional darslar tez orada qo'shiladi."}
          </div>
          {filter !== "all" && (
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={() => setFilter("all")}>
              Hammasi
            </button>
          )}
        </div>
      )}

      {/* Lessons grid */}
      {!loading && sorted.length > 0 && (
        <div className="row">
          {sorted.map((lesson, i) => (
            <LessonCard key={lesson.id} lesson={lesson} locale={locale} gradIdx={i} />
          ))}
        </div>
      )}
    </div>
  );
}
