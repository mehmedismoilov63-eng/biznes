"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../../lib/api/client";

type GroupDto = {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  members: number;
  joined: boolean;
  unread: number;
};

const AV_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#10b981", "#0ea5e9", "#f97316"];

function GroupCard({ group, onClick, onLeave, busy }: {
  group: GroupDto;
  onClick: () => void;
  onLeave: (e: React.MouseEvent) => void;
  busy: boolean;
}) {
  const colorIdx = group.name.charCodeAt(0) % AV_COLORS.length;
  const initial = group.name[0]?.toUpperCase() ?? "#";

  return (
    <div className="group-card" onClick={onClick} style={{ cursor: "pointer" }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: AV_COLORS[colorIdx],
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, fontWeight: 700, color: "#fff",
      }}>
        {initial}
      </div>

      <div className="group-meta">
        <div className="group-name">
          {group.name}
          {group.visibility === "PRIVATE" && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
          {group.joined && (
            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--brand)", background: "var(--brand-tint)", padding: "1px 6px", borderRadius: 20, marginLeft: 4 }}>
              A'zo
            </span>
          )}
        </div>
        {group.description && <div className="group-last">{group.description}</div>}
        <div className="group-count">{group.members} a'zo · {group.visibility === "PUBLIC" ? "Ochiq" : "Yopiq"}</div>
      </div>

      {group.unread > 0 && (
        <div className="group-unread">{group.unread}</div>
      )}

      {busy ? (
        <span style={{ fontSize: 13, color: "var(--text-faint)", flexShrink: 0 }}>...</span>
      ) : group.joined ? (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ flexShrink: 0 }}
          onClick={onLeave}
        >
          Chiqish
        </button>
      ) : null}
    </div>
  );
}

export default function GroupsPage() {
  const t = useTranslations("groups");
  const locale = useLocale();
  const router = useRouter();
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [tab, setTab] = useState<"mine" | "discover">("mine");
  const [q, setQ] = useState("");

  useEffect(() => {
    api.get<GroupDto[]>("/groups").then(setGroups).finally(() => setLoading(false));
  }, []);

  async function handleCardClick(group: GroupDto) {
    if (busy) return;
    if (!group.joined) {
      setBusy(group.id);
      try {
        await api.post(`/groups/${group.id}/join`);
      } catch {
        // already joined or forbidden — navigate anyway
      } finally {
        setBusy(null);
      }
    }
    router.push(`/${locale}/groups/${group.id}`);
  }

  async function handleLeave(e: React.MouseEvent, groupId: string) {
    e.stopPropagation();
    setBusy(groupId);
    try {
      await api.post(`/groups/${groupId}/leave`);
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, joined: false, members: Math.max(0, g.members - 1) } : g))
      );
    } catch {
      // ignore
    } finally {
      setBusy(null);
    }
  }

  const mine = groups.filter((g) => g.joined);
  const discover = groups.filter((g) => !g.joined && g.name.toLowerCase().includes(q.toLowerCase()));
  const displayed = tab === "mine" ? mine : discover;

  return (
    <div className="content-inner">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div className="page-head" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Guruhlar</h1>
          <p className="page-sub">Tadbirkorlar bilan kanalda muloqot</p>
        </div>
        <Link href={`/${locale}/groups/create`} className="btn btn-primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Yangi guruh
        </Link>
      </div>

      {/* Tabs */}
      <div className="tabs-bar" style={{ marginBottom: 20 }}>
        <div className={`tab${tab === "mine" ? " active" : ""}`} onClick={() => setTab("mine")}>
          Mening guruhlarim {mine.length > 0 && `(${mine.length})`}
        </div>
        <div className={`tab${tab === "discover" ? " active" : ""}`} onClick={() => setTab("discover")}>
          Topish
        </div>
      </div>

      {/* Search (discover tab) */}
      {tab === "discover" && (
        <div style={{ position: "relative", marginBottom: 16 }}>
          <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", pointerEvents: "none" }}
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="input-field"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Public guruhlarni qidirish..."
            style={{ paddingLeft: 34 }}
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="row-tight">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="group-card" style={{ pointerEvents: "none" }}>
              <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
              <div className="group-meta">
                <div className="skeleton skeleton-text lg" style={{ width: "55%" }} />
                <div className="skeleton skeleton-text" style={{ width: "75%", marginTop: 6 }} />
                <div className="skeleton skeleton-text" style={{ width: "40%", marginTop: 4 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && displayed.length === 0 && (
        <div className="empty">
          <div className="empty-icon">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="empty-title">{tab === "mine" ? "Hali guruhlar yo'q" : "Guruh topilmadi"}</div>
          <div className="empty-desc">
            {tab === "mine"
              ? "Topish bo'limidan mavjud guruhlarga qo'shiling yoki o'zingiz yangi guruh yarating."
              : "Boshqa kalit so'z bilan qidiring yoki yangi guruh yarating."}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {tab === "mine" ? (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => setTab("discover")}>
                  Guruh topish
                </button>
                <Link href={`/${locale}/groups/create`} className="btn btn-secondary btn-sm">
                  Yangi guruh
                </Link>
              </>
            ) : (
              <Link href={`/${locale}/groups/create`} className="btn btn-secondary btn-sm">
                Yangi guruh yaratish
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Cards */}
      {!loading && displayed.length > 0 && (
        <div className="row-tight">
          {displayed.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onClick={() => handleCardClick(group)}
              onLeave={(e) => handleLeave(e, group.id)}
              busy={busy === group.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
