"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../../../../../lib/api/client";

type GroupDto = {
  id: string;
  name: string;
  description: string | null;
  visibility: string;
  members: number;
  joined: boolean;
};

export default function GroupSearchPage() {
  const t = useTranslations("groups");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    setLoading(true);
    api.get<GroupDto[]>(`/groups/search${q ? `?q=${encodeURIComponent(q)}` : ""}`)
      .then(setGroups)
      .finally(() => setLoading(false));
  }, [query]);

  async function handleJoin(groupId: string) {
    setJoining(groupId);
    try {
      await api.post(`/groups/${groupId}/join`);
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, joined: true, members: g.members + 1 } : g)),
      );
    } catch {
      // ignore
    } finally {
      setJoining(null);
    }
  }

  return (
    <div className="content-inner">
      <div className="page-head-actions" style={{ marginBottom: 24 }}>
        <h1 className="page-title">{t("search")}</h1>
        <Link href={`/${locale}/groups`} className="btn btn-ghost btn-sm">
          ← Orqaga
        </Link>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-elev)", border: "1px solid var(--border-strong)", borderRadius: "var(--r-md)", padding: "8px 12px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-faint)", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Guruh nomi yoki tavsif bo'yicha..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ border: 0, outline: 0, background: "transparent", color: "var(--text-strong)", fontSize: 14, flex: 1 }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-faint)", fontSize: 13 }}>Yuklanmoqda...</div>
      ) : groups.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-faint)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p>Guruh topilmadi</p>
        </div>
      ) : (
        <div className="row-tight">
          {groups.map((group) => (
            <div key={group.id} className="group-card">
              <div className="group-card-icon">#</div>
              <div className="group-card-body">
                <Link href={`/${locale}/groups/${group.id}`} className="group-card-name">
                  {group.name}
                </Link>
                {group.description && (
                  <div className="group-card-desc">{group.description}</div>
                )}
                <div className="group-card-meta">
                  {group.members} {t("members", { count: group.members })} · {t("public")}
                </div>
              </div>
              {!group.joined ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={joining === group.id}
                  onClick={() => handleJoin(group.id)}
                >
                  {joining === group.id ? "..." : t("join")}
                </button>
              ) : (
                <Link href={`/${locale}/groups/${group.id}`} className="btn btn-secondary btn-sm">
                  Ochish
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
