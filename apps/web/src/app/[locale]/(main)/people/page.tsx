"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api, resolveMedia } from "../../../../lib/api/client";

type PersonDto = {
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

const AV_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f59e0b", "#10b981", "#0ea5e9", "#f97316",
];

function Avatar({ name, avatarPath, online, size = "lg" }: { name: string; avatarPath: string | null; online: boolean; size?: string }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const colorIdx = name.charCodeAt(0) % AV_COLORS.length;
  const px = size === "lg" ? 44 : 36;

  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div
        style={{
          width: px, height: px, borderRadius: "50%",
          background: AV_COLORS[colorIdx],
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size === "lg" ? 15 : 13, fontWeight: 700, color: "#fff",
          overflow: "hidden",
        }}
      >
        {avatarPath ? (
          <img src={resolveMedia(avatarPath)} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : initials}
      </div>
      {online && (
        <span style={{
          position: "absolute", bottom: 1, right: 1,
          width: 10, height: 10, borderRadius: "50%",
          background: "#22c55e", border: "2px solid var(--bg-elev)",
        }} />
      )}
    </div>
  );
}

function PersonCard({ person, onMessage }: { person: PersonDto; onMessage: (p: PersonDto) => void }) {
  return (
    <div className="person-card">
      <div className="person-head">
        <Avatar name={person.name} avatarPath={person.avatarPath} online={person.online} />
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

      {person.sectionId && (
        <div className="person-tags">
          <span className="tag tag-brand">{sectionLabel(person.sectionId)}</span>
        </div>
      )}

      <div className="person-actions" onClick={(e) => e.stopPropagation()}>
        <button
          className="btn btn-secondary btn-sm"
          style={{ flex: 1 }}
          onClick={() => onMessage(person)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Xabar
        </button>
        <button className="btn btn-ghost btn-sm btn-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function sectionLabel(sectionId: string): string {
  const map: Record<string, string> = {
    sec_it_web: "💻 IT / Web",
    sec_biz_food: "🍽️ Oziq-ovqat",
    sec_biz_beauty: "💄 Go'zallik",
    sec_biz_workshop: "🔧 Ustaxona",
    sec_biz_retail: "🛒 Savdo",
  };
  return map[sectionId] ?? sectionId;
}

export default function PeoplePage() {
  const t = useTranslations("people");
  const locale = useLocale();
  const router = useRouter();
  const [people, setPeople] = useState<PersonDto[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query.trim().replace(/^@/, "");
    setLoading(true);
    api.get<PersonDto[]>(`/users${q ? `?q=${encodeURIComponent(q)}` : ""}`)
      .then(setPeople)
      .finally(() => setLoading(false));
  }, [query]);

  const handleMessage = (person: PersonDto) => {
    router.push(`/${locale}/messages?with=${person.id}`);
  };

  return (
    <div className="content-inner">
      <div className="page-head">
        <h1 className="page-title">{t("title")}</h1>
        <p className="page-sub">O'z sohangizdagi tadbirkorlar bilan tanishing</p>
      </div>

      {/* Search bar */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <svg
          width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", pointerEvents: "none" }}
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          className="input-field"
          type="text"
          placeholder="Ism, @username, biznes nomi..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ paddingLeft: 34 }}
        />
      </div>

      {/* Count */}
      {!loading && (
        <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 14 }}>
          {people.length} ta tadbirkor topildi
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="row">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="person-card" style={{ pointerEvents: "none" }}>
              <div className="person-head">
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text lg" style={{ width: "70%" }} />
                  <div className="skeleton skeleton-text" style={{ width: "45%", marginTop: 6 }} />
                </div>
              </div>
              <div className="skeleton skeleton-text" style={{ width: "80%" }} />
              <div className="skeleton" style={{ width: 64, height: 22, borderRadius: 99 }} />
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                <div className="skeleton" style={{ flex: 1, height: 32, borderRadius: "var(--r-md)" }} />
                <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "var(--r-md)" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && people.length === 0 && (
        <div className="empty">
          <div className="empty-icon">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="empty-title">
            {query ? "Hech kim topilmadi" : "Tadbirkorlar yo'q"}
          </div>
          <div className="empty-desc">
            {query
              ? `"${query}" bo'yicha natija yo'q. Boshqa nom yoki username bilan qidiring.`
              : "Hozircha platforma tadbirkorlar bilan to'ldirilmoqda. Tez orada yangi a'zolar qo'shiladi."}
          </div>
          {query && (
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={() => setQuery("")}>
              Qidirishni tozalash
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && people.length > 0 && (
        <div className="row">
          {people.map((person) => (
            <PersonCard key={person.id} person={person} onMessage={handleMessage} />
          ))}
        </div>
      )}
    </div>
  );
}
