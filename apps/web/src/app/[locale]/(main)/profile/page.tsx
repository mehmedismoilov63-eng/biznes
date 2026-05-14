"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api, resolveMedia } from "../../../../lib/api/client";
import { useAuthStore } from "../../../../lib/store/auth";

type PromoVideo = {
  id: string;
  title?: string;
  description?: string;
  sourcePath: string | null;
  hlsManifestPath: string | null;
  thumbnailPath: string | null;
  isShareable: boolean;
  shareToken: string | null;
  durationSeconds?: number | null;
};

type CatalogItem = { id: string; name: string; icon: string | null };

const AV_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#10b981", "#0ea5e9", "#f97316"];

function fmtDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function ProfilePage() {
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [promos, setPromos] = useState<PromoVideo[]>([]);
  const [industries, setIndustries] = useState<CatalogItem[]>([]);
  const [sections, setSections] = useState<CatalogItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<PromoVideo[]>("/me/promo-videos").then(setPromos).catch(() => {});
    api.get<CatalogItem[]>("/catalog/industries").then(setIndustries).catch(() => {});
    api.get<CatalogItem[]>("/catalog/sections").then(setSections).catch(() => {});
  }, []);

  const displayName = user?.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : "Biznesjon";
  const initials = displayName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const colorIdx = displayName.charCodeAt(0) % AV_COLORS.length;

  const industry = industries.find((i) => i.id === user?.industryId);
  const section = sections.find((s) => s.id === user?.sectionId);
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const promo = promos[0];

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const res = await api.upload("/uploads/avatar", file);
      await api.post("/me/avatar", { avatarPath: res.path });
      if (user.profile) {
        setUser({ ...user, profile: { ...user.profile, avatarPath: res.path } });
      }
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(`https://biznesjon.uz/share/promo/${token}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="content-inner">
      {/* Cover */}
      <div className="profile-cover" />

      {/* Head */}
      <div className="profile-head">
        <div
          style={{ position: "relative", cursor: "pointer", flexShrink: 0 }}
          onClick={() => fileInputRef.current?.click()}
          title="Avatarni o'zgartirish"
        >
          <div
            style={{
              width: 88, height: 88, borderRadius: "50%",
              background: AV_COLORS[colorIdx],
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, fontWeight: 700, color: "#fff",
              border: "4px solid var(--bg)",
              overflow: "hidden", opacity: uploading ? 0.6 : 1,
            }}
          >
            {user?.profile?.avatarPath ? (
              <img src={resolveMedia(user.profile.avatarPath)} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : initials}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{displayName}</h1>
          <div className="profile-handle">@{user?.profile?.username ?? "..."}</div>
        </div>

        <div style={{ display: "flex", gap: 8, paddingBottom: 6 }}>
          <Link href={`/${locale}/settings`} className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Tahrirlash
          </Link>
          {isAdmin && (
            <Link href={`/${locale}/admin`} className="btn btn-ghost btn-icon" title="Admin">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* Content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 32, marginTop: 24, alignItems: "start" }}>

        {/* Left */}
        <div>
          {user?.profile?.bio && (
            <p className="profile-bio" style={{ marginBottom: 16 }}>{user.profile.bio}</p>
          )}

          <div className="profile-stats">
            {user?.profile?.businessName && (
              <div>
                <div className="profile-stat-num">{user.profile.businessName}</div>
                <div className="profile-stat-label">Biznes</div>
              </div>
            )}
            {user?.profile?.city && (
              <div>
                <div className="profile-stat-num">{user.profile.city}</div>
                <div className="profile-stat-label">Shahar</div>
              </div>
            )}
            <div>
              <div className="profile-stat-num">{new Date().getFullYear()}</div>
              <div className="profile-stat-label">Qo'shilgan</div>
            </div>
          </div>

          {/* Mening saytim promo */}
          {promo && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                ⭐ Mening saytim
              </div>
              <div style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 16, display: "grid", gridTemplateColumns: "160px 1fr", gap: 16 }}>
                <div style={{ aspectRatio: "16/9", borderRadius: 8, overflow: "hidden", background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", position: "relative" }}>
                  {promo.thumbnailPath && (
                    <img src={resolveMedia(promo.thumbnailPath)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                  <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#7c3aed"><polygon points="5,3 19,12 5,21" /></svg>
                    </div>
                  </div>
                  {promo.durationSeconds && (
                    <span style={{ position: "absolute", bottom: 5, right: 7, fontSize: 11, color: "#fff", fontWeight: 600, background: "rgba(0,0,0,0.6)", padding: "1px 5px", borderRadius: 4 }}>
                      {fmtDuration(promo.durationSeconds)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 style={{ margin: "4px 0 6px", fontSize: 14, fontWeight: 600, color: "var(--text-strong)", lineHeight: 1.3 }}>
                    {promo.title ?? "Mening saytim"}
                  </h3>
                  {promo.description && (
                    <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--text-dim)", lineHeight: 1.5 }}>
                      {promo.description}
                    </p>
                  )}
                  {promo.isShareable && promo.shareToken && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-faint)" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      Public link faol
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 11, padding: "2px 8px", marginLeft: 4 }}
                        onClick={() => copyLink(promo.shareToken!)}
                      >
                        {copied ? "✓" : "Nusxalash"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Link
              href={`/${locale}/mysite`}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", color: "var(--text-strong)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>🎥 Mening saytim</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
            <Link
              href={`/${locale}/settings`}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", color: "var(--text-strong)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>⚙️ Sozlamalar</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
            Ma'lumotlar
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {industry && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-faint)", marginTop: 2, flexShrink: 0 }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-faint)" }}>Soha</div>
                  <div style={{ fontSize: 13, color: "var(--text-strong)", fontWeight: 500 }}>{industry.icon ? `${industry.icon} ` : ""}{industry.name}</div>
                </div>
              </div>
            )}
            {section && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-faint)", marginTop: 2, flexShrink: 0 }}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-faint)" }}>Bo'lim</div>
                  <div style={{ fontSize: 13, color: "var(--text-strong)", fontWeight: 500 }}>{section.icon ? `${section.icon} ` : ""}{section.name}</div>
                </div>
              </div>
            )}
            {user?.profile?.city && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-faint)", marginTop: 2, flexShrink: 0 }}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-faint)" }}>Shahar</div>
                  <div style={{ fontSize: 13, color: "var(--text-strong)", fontWeight: 500 }}>{user.profile.city}</div>
                </div>
              </div>
            )}
            {!industry && !section && !user?.profile?.city && (
              <div style={{ color: "var(--text-faint)", fontSize: 13, textAlign: "center", padding: "8px 0" }}>Ma'lumot yo'q</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
