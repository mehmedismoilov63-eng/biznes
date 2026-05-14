"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { api } from "../../../../lib/api/client";
import { useAuthStore } from "../../../../lib/store/auth";

/* ─── types ─── */
type Stats = { users: number; lessons: number; promoVideos: number; messagesToday: number };
type SectionInfo = { id: string; name: string; icon: string | null; userCount: number };
type IndustryTree = { id: string; name: string; icon: string | null; sections: SectionInfo[] };
type Person = { id: string; name: string; username: string; businessName: string; city: string; sectionId: string | null; avatarPath: string | null };
type AuditLog = { id: string; action: string; target: string; createdAt: string; metadata: Record<string, unknown> };

type NavSection = "dashboard" | "users" | "industries" | "lessons" | "promo" | "messages" | "announce" | "audit";

/* ─── helpers ─── */
function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <div style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12.5, color: "var(--text-dim)", marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

function NavItem({ id, label, icon, active, onClick }: { id: string; label: string; icon: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px",
        borderRadius: 10, fontSize: 13.5, fontWeight: active ? 600 : 400, textAlign: "left",
        background: active ? "var(--brand-tint)" : "transparent",
        color: active ? "var(--brand)" : "var(--text-dim)",
        border: active ? "1px solid var(--brand-tint-strong)" : "1px solid transparent",
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      {label}
    </button>
  );
}

function SectionBadge({ count }: { count: number }) {
  return (
    <span style={{ marginLeft: "auto", background: "var(--bg-elev-2)", color: "var(--text-dim)", borderRadius: 20, padding: "1px 8px", fontSize: 11.5, fontWeight: 600 }}>
      {count}
    </span>
  );
}

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, background: "var(--success)", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 13.5, fontWeight: 500, boxShadow: "0 4px 24px rgba(0,0,0,.18)" }}>
      {msg}
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export default function AdminPage() {
  const locale = useLocale();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [nav, setNav] = useState<NavSection>("dashboard");
  const [toast, setToast] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* data */
  const [stats, setStats] = useState<Stats | null>(null);
  const [tree, setTree] = useState<IndustryTree[]>([]);
  const [users, setUsers] = useState<Person[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [sectionUsers, setSectionUsers] = useState<Person[]>([]);
  const [userSearch, setUserSearch] = useState("");

  /* lesson form */
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [lessonSection, setLessonSection] = useState("");
  const [lessonFile, setLessonFile] = useState<File | null>(null);
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonLoading, setLessonLoading] = useState(false);

  /* promo form */
  const [promoUserId, setPromoUserId] = useState("");
  const [promoTitle, setPromoTitle] = useState("");
  const [promoFile, setPromoFile] = useState<File | null>(null);
  const [promoVideoUrl, setPromoVideoUrl] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  /* message form */
  const [msgUserId, setMsgUserId] = useState("");
  const [msgText, setMsgText] = useState("");
  const [msgLoading, setMsgLoading] = useState(false);

  /* announce form */
  const [annTitle, setAnnTitle] = useState("");
  const [annText, setAnnText] = useState("");
  const [annLoading, setAnnLoading] = useState(false);

  const lessonFileRef = useRef<HTMLInputElement>(null);
  const promoFileRef = useRef<HTMLInputElement>(null);

  /* guard — fresh role from API, not stale Zustand cache */
  useEffect(() => {
    api.get<{ role: string }>("/auth/me")
      .then((me) => {
        if (me.role !== "ADMIN" && me.role !== "SUPER_ADMIN") {
          router.replace(`/${locale}/home`);
        }
      })
      .catch(() => router.replace(`/${locale}/login`));
  }, [locale, router]);

  /* load on mount */
  useEffect(() => {
    api.get<Stats>("/admin/dashboard").then(setStats).catch(() => {});
    api.get<IndustryTree[]>("/admin/industries-tree").then(setTree).catch(() => {});
    api.get<Person[]>("/admin/users").then(setUsers).catch(() => {});
    api.get<AuditLog[]>("/admin/audit-logs").then(setAuditLogs).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSection) return;
    api.get<Person[]>(`/admin/users/by-section/${selectedSection}`).then(setSectionUsers).catch(() => {});
  }, [selectedSection]);

  function showToast(msg: string) { setToast(msg); }

  const filteredUsers = users.filter((u) =>
    !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.businessName?.toLowerCase().includes(userSearch.toLowerCase()),
  );

  /* ── lesson upload ── */
  async function handleLessonUpload(e: FormEvent) {
    e.preventDefault();
    if (!lessonSection) { showToast("Bo'limni tanlang"); return; }
    setLessonLoading(true);
    try {
      let videoFileName: string | undefined;
      if (lessonFile) {
        const up = await api.upload("/uploads/admin-video", lessonFile);
        videoFileName = up.path;
      } else if (lessonVideoUrl.trim()) {
        videoFileName = lessonVideoUrl.trim();
      }
      await api.post("/admin/lessons", {
        title: lessonTitle || undefined,
        description: lessonDesc || undefined,
        sectionId: lessonSection,
        videoFileName,
      });
      setLessonTitle(""); setLessonDesc(""); setLessonSection(""); setLessonFile(null); setLessonVideoUrl("");
      if (lessonFileRef.current) lessonFileRef.current.value = "";
      showToast("Dars muvaffaqiyatli yaratildi!");
      const s = await api.get<Stats>("/admin/dashboard"); setStats(s);
    } catch (err) { showToast((err as { message?: string }).message ?? "Xatolik"); }
    finally { setLessonLoading(false); }
  }

  /* ── promo upload ── */
  async function handlePromoUpload(e: FormEvent) {
    e.preventDefault();
    if (!promoUserId) { showToast("Foydalanuvchini tanlang"); return; }
    setPromoLoading(true);
    try {
      let videoFileName: string | undefined;
      if (promoFile) {
        const up = await api.upload("/uploads/admin-video", promoFile);
        videoFileName = up.path;
      } else if (promoVideoUrl.trim()) {
        videoFileName = promoVideoUrl.trim();
      }
      await api.post("/admin/promo-videos", {
        userId: promoUserId,
        title: promoTitle || undefined,
        videoFileName,
      });
      setPromoUserId(""); setPromoTitle(""); setPromoFile(null); setPromoVideoUrl("");
      if (promoFileRef.current) promoFileRef.current.value = "";
      showToast("Promo video biriktirildi!");
      const s = await api.get<Stats>("/admin/dashboard"); setStats(s);
    } catch (err) { showToast((err as { message?: string }).message ?? "Xatolik"); }
    finally { setPromoLoading(false); }
  }

  /* ── direct message ── */
  async function handleSendMessage(e: FormEvent) {
    e.preventDefault();
    if (!msgUserId || !msgText.trim()) { showToast("Foydalanuvchi va matn majburiy"); return; }
    setMsgLoading(true);
    try {
      await api.post("/admin/messages/direct", { userId: msgUserId, text: msgText.trim() });
      setMsgText(""); showToast("Xabar yuborildi!");
    } catch (err) { showToast((err as { message?: string }).message ?? "Xatolik"); }
    finally { setMsgLoading(false); }
  }

  /* ── announcement ── */
  async function handleAnnounce(e: FormEvent) {
    e.preventDefault();
    if (!annText.trim()) { showToast("Matn majburiy"); return; }
    setAnnLoading(true);
    try {
      const res = await api.post<{ ok: boolean; count: number }>("/admin/announcements", { title: annTitle || "Biznesjon e'loni", text: annText.trim() });
      setAnnTitle(""); setAnnText(""); showToast(`E'lon ${res.count} foydalanuvchiga yuborildi!`);
    } catch (err) { showToast((err as { message?: string }).message ?? "Xatolik"); }
    finally { setAnnLoading(false); }
  }

  /* ── reset password ── */
  async function handleResetPassword(userId: string) {
    try {
      const res = await api.post<{ temporaryPassword: string }>(`/admin/users/${userId}/reset-password`);
      showToast(`Vaqtinchalik parol: ${res.temporaryPassword}`);
    } catch { showToast("Xatolik"); }
  }

  /* ── all sections flat ── */
  const allSections = tree.flatMap((ind) => ind.sections.map((s) => ({ ...s, industryName: ind.name })));

  const NAV: Array<{ id: NavSection; label: string; icon: string }> = [
    { id: "dashboard", label: "Boshqaruv paneli", icon: "📊" },
    { id: "users", label: "Foydalanuvchilar", icon: "👥" },
    { id: "industries", label: "Sohalar va bo'limlar", icon: "🏭" },
    { id: "lessons", label: "Dars yuklash", icon: "🎬" },
    { id: "promo", label: "Promo video", icon: "🎥" },
    { id: "messages", label: "Xabar yuborish", icon: "✉️" },
    { id: "announce", label: "E'lon", icon: "📢" },
    { id: "audit", label: "Audit jurnali", icon: "🔍" },
  ];

  if (!user) return null;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "var(--bg)" }}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 100 }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        style={{
          width: 220, flexShrink: 0, background: "var(--bg-elev)", borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          position: "fixed" as const, top: 70, left: 0, bottom: 0, zIndex: 110,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform .22s cubic-bezier(.4,0,.2,1)",
        }}
        className="admin-sidebar"
      >
        <div style={{ padding: "18px 16px 12px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-strong)" }}>🛡️ Admin Panel</div>
          <div style={{ fontSize: 11.5, color: "var(--text-faint)", marginTop: 2 }}>Biznesjon</div>
        </div>
        <nav style={{ flex: 1, overflowY: "auto", padding: "10px 10px" }}>
          {NAV.map((item) => (
            <NavItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              active={nav === item.id}
              onClick={() => { setNav(item.id); setSidebarOpen(false); }}
            />
          ))}
        </nav>
        <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/home`)}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", borderRadius: 10, fontSize: 13, color: "var(--text-dim)", background: "transparent", border: "1px solid transparent" }}
          >
            ← Asosiy sahifa
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", marginLeft: 0 }} className="admin-main">

        {/* ── Top bar ── */}
        <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-elev)", flexShrink: 0 }}>
          <button
            type="button"
            className="admin-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ padding: "6px 8px", borderRadius: 8, background: "var(--bg-elev-2)", border: "1px solid var(--border)", fontSize: 16, lineHeight: 1 }}
          >
            ☰
          </button>
          <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text-strong)" }}>
            {NAV.find((n) => n.id === nav)?.icon} {NAV.find((n) => n.id === nav)?.label}
          </div>
          {stats && (
            <div style={{ marginLeft: "auto", display: "flex", gap: 16, fontSize: 12.5, color: "var(--text-faint)" }}>
              <span>👥 {stats.users} foydalanuvchi</span>
              <span>🎬 {stats.lessons} dars</span>
            </div>
          )}
        </header>

        {/* ── Content ── */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}>

          {/* ── DASHBOARD ── */}
          {nav === "dashboard" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
                <StatCard label="Jami foydalanuvchilar" value={stats?.users ?? "—"} icon="👥" color="#6366f1" />
                <StatCard label="Jami darslar" value={stats?.lessons ?? "—"} icon="🎬" color="#0ea5e9" />
                <StatCard label="Promo videolar" value={stats?.promoVideos ?? "—"} icon="🎥" color="#10b981" />
                <StatCard label="Bugungi xabarlar" value={stats?.messagesToday ?? "—"} icon="💬" color="#f59e0b" />
              </div>

              <div style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px" }}>
                <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 14, color: "var(--text-strong)" }}>Tezkor harakatlar</div>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 10 }}>
                  {([["users", "Foydalanuvchilar"], ["lessons", "Dars yuklash"], ["promo", "Promo video"], ["announce", "E'lon"]] as const).map(([id, label]) => (
                    <button key={id} type="button" className="btn btn-secondary btn-sm" onClick={() => setNav(id as NavSection)}>
                      {NAV.find((n) => n.id === id)?.icon} {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {nav === "users" && (
            <div>
              <div style={{ marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Ism, username yoki biznes nomi bo'yicha qidirish..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ flex: 1, maxWidth: 380, background: "var(--bg-elev)", border: "1px solid var(--border-strong)", borderRadius: 10, padding: "8px 12px", color: "var(--text-strong)", fontSize: 13.5, outline: "none" }}
                />
                <span style={{ fontSize: 13, color: "var(--text-faint)" }}>{filteredUsers.length} ta</span>
              </div>

              <div style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 0, borderBottom: "1px solid var(--border)", padding: "10px 16px", background: "var(--bg-elev-2)" }}>
                  {["Ism", "Username / Bo'lim", "Shahar / Biznes", "Amallar"].map((h) => (
                    <div key={h} style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-faint)", textTransform: "uppercase" as const, letterSpacing: ".04em" }}>{h}</div>
                  ))}
                </div>
                {filteredUsers.length === 0 ? (
                  <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-faint)", fontSize: 13 }}>Foydalanuvchilar topilmadi</div>
                ) : (
                  filteredUsers.map((u) => (
                    <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 0, padding: "12px 16px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-strong)" }}>{u.name}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-faint)", marginTop: 1 }}>{u.id}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: "var(--text-dim)" }}>@{u.username}</div>
                        {u.sectionId && <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 1 }}>{u.sectionId}</div>}
                      </div>
                      <div>
                        {u.city && <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{u.city}</div>}
                        {u.businessName && <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 1 }}>{u.businessName}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => { setMsgUserId(u.id); setNav("messages"); }}
                        >
                          ✉️
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => { setPromoUserId(u.id); setNav("promo"); }}
                          title="Promo video biriktirish"
                        >
                          🎥
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleResetPassword(u.id)}
                          title="Parolni tiklash"
                        >
                          🔑
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── INDUSTRIES TREE ── */}
          {nav === "industries" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
              {/* Left: tree */}
              <div>
                {tree.map((ind) => (
                  <div key={ind.id} style={{ marginBottom: 16, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", background: "var(--bg-elev-2)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{ind.icon}</span>
                      <span style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-strong)" }}>{ind.name}</span>
                    </div>
                    {ind.sections.map((sec) => (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setSelectedSection(sec.id === selectedSection ? null : sec.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px",
                          borderBottom: "1px solid var(--border)", textAlign: "left",
                          background: selectedSection === sec.id ? "var(--brand-tint)" : "transparent",
                          color: selectedSection === sec.id ? "var(--brand)" : "var(--text-dim)",
                        }}
                      >
                        <span style={{ fontSize: 15 }}>{sec.icon}</span>
                        <span style={{ fontSize: 13, flex: 1 }}>{sec.name}</span>
                        <SectionBadge count={sec.userCount} />
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Right: section users */}
              <div>
                {selectedSection ? (
                  <div style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden", position: "sticky" as const, top: 0 }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg-elev-2)", fontWeight: 600, fontSize: 13.5, color: "var(--text-strong)" }}>
                      Bo'lim foydalanuvchilari
                    </div>
                    {sectionUsers.length === 0 ? (
                      <div style={{ padding: 24, textAlign: "center", color: "var(--text-faint)", fontSize: 13 }}>Bu bo'limda foydalanuvchi yo'q</div>
                    ) : (
                      sectionUsers.map((u) => (
                        <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--brand-tint)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--brand)", flexShrink: 0 }}>
                            {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
                            <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>@{u.username}</div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => { setMsgUserId(u.id); setNav("messages"); }}
                            title="Xabar yuborish"
                          >
                            ✉️
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-faint)", fontSize: 13, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 14 }}>
                    Bo'limni tanlang
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── LESSON UPLOAD ── */}
          {nav === "lessons" && (
            <div style={{ maxWidth: 560 }}>
              <div style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px" }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-strong)", marginBottom: 20 }}>Yangi dars yuklash</div>
                <form onSubmit={handleLessonUpload} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                  <label className="ob-field">
                    <span>Bo'lim *</span>
                    <div className="ob-input">
                      <select
                        value={lessonSection}
                        onChange={(e) => setLessonSection(e.target.value)}
                        required
                        style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--text-strong)", fontSize: 14 }}
                      >
                        <option value="">— Bo'limni tanlang —</option>
                        {allSections.map((s) => (
                          <option key={s.id} value={s.id}>{s.icon} {s.name} ({s.industryName})</option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="ob-field">
                    <span>Sarlavha (ixtiyoriy)</span>
                    <div className="ob-input">
                      <input type="text" placeholder="Dars sarlavhasi..." value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
                    </div>
                  </label>

                  <label className="ob-field">
                    <span>Tavsif (ixtiyoriy)</span>
                    <div className="ob-input textarea">
                      <textarea rows={3} placeholder="Dars haqida qisqacha..." value={lessonDesc} onChange={(e) => setLessonDesc(e.target.value)} />
                    </div>
                  </label>

                  <label className="ob-field">
                    <span>Video URL (ixtiyoriy)</span>
                    <div className="ob-input">
                      <input
                        type="url"
                        placeholder="https://youtube.com/... yoki boshqa video URL"
                        value={lessonVideoUrl}
                        onChange={(e) => { setLessonVideoUrl(e.target.value); if (e.target.value) { setLessonFile(null); if (lessonFileRef.current) lessonFileRef.current.value = ""; } }}
                      />
                    </div>
                  </label>

                  <label className="ob-field">
                    <span>Yoki video fayl yuklash</span>
                    <div className="ob-input">
                      <input
                        ref={lessonFileRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => { setLessonFile(e.target.files?.[0] ?? null); if (e.target.files?.[0]) setLessonVideoUrl(""); }}
                        style={{ color: "var(--text-dim)", fontSize: 13 }}
                        disabled={!!lessonVideoUrl}
                      />
                    </div>
                    {lessonFile && <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{lessonFile.name} ({(lessonFile.size / 1024 / 1024).toFixed(1)} MB)</span>}
                  </label>

                  <button type="submit" className="btn btn-primary" disabled={lessonLoading || !lessonSection} style={{ marginTop: 4 }}>
                    {lessonLoading ? "Yuklanmoqda..." : "🎬 Dars yaratish"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── PROMO VIDEO ── */}
          {nav === "promo" && (
            <div style={{ maxWidth: 560 }}>
              <div style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px" }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-strong)", marginBottom: 20 }}>Promo video biriktirish</div>
                <form onSubmit={handlePromoUpload} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                  <label className="ob-field">
                    <span>Foydalanuvchi *</span>
                    <div className="ob-input">
                      <select
                        value={promoUserId}
                        onChange={(e) => setPromoUserId(e.target.value)}
                        required
                        style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--text-strong)", fontSize: 14 }}
                      >
                        <option value="">— Foydalanuvchini tanlang —</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="ob-field">
                    <span>Video sarlavhasi (ixtiyoriy)</span>
                    <div className="ob-input">
                      <input type="text" placeholder="Mening saytim..." value={promoTitle} onChange={(e) => setPromoTitle(e.target.value)} />
                    </div>
                  </label>

                  <label className="ob-field">
                    <span>Video URL (ixtiyoriy)</span>
                    <div className="ob-input">
                      <input
                        type="url"
                        placeholder="https://youtube.com/... yoki boshqa video URL"
                        value={promoVideoUrl}
                        onChange={(e) => { setPromoVideoUrl(e.target.value); if (e.target.value) { setPromoFile(null); if (promoFileRef.current) promoFileRef.current.value = ""; } }}
                      />
                    </div>
                  </label>

                  <label className="ob-field">
                    <span>Yoki video fayl yuklash</span>
                    <div className="ob-input">
                      <input
                        ref={promoFileRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => { setPromoFile(e.target.files?.[0] ?? null); if (e.target.files?.[0]) setPromoVideoUrl(""); }}
                        style={{ color: "var(--text-dim)", fontSize: 13 }}
                        disabled={!!promoVideoUrl}
                      />
                    </div>
                    {promoFile && <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{promoFile.name} ({(promoFile.size / 1024 / 1024).toFixed(1)} MB)</span>}
                  </label>

                  <button type="submit" className="btn btn-primary" disabled={promoLoading || !promoUserId} style={{ marginTop: 4 }}>
                    {promoLoading ? "Yuklanmoqda..." : "🎥 Promo video biriktirish"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── DIRECT MESSAGE ── */}
          {nav === "messages" && (
            <div style={{ maxWidth: 560 }}>
              <div style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px" }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-strong)", marginBottom: 20 }}>Foydalanuvchiga xabar yuborish</div>
                <form onSubmit={handleSendMessage} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                  <label className="ob-field">
                    <span>Foydalanuvchi *</span>
                    <div className="ob-input">
                      <select
                        value={msgUserId}
                        onChange={(e) => setMsgUserId(e.target.value)}
                        required
                        style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--text-strong)", fontSize: 14 }}
                      >
                        <option value="">— Foydalanuvchini tanlang —</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.name} (@{u.username})</option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="ob-field">
                    <span>Xabar matni *</span>
                    <div className="ob-input textarea">
                      <textarea
                        rows={4}
                        placeholder="Xabar matnini kiriting..."
                        value={msgText}
                        onChange={(e) => setMsgText(e.target.value)}
                        required
                      />
                    </div>
                  </label>

                  <button type="submit" className="btn btn-primary" disabled={msgLoading || !msgUserId || !msgText.trim()} style={{ marginTop: 4 }}>
                    {msgLoading ? "Yuborilmoqda..." : "✉️ Xabar yuborish"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── ANNOUNCEMENT ── */}
          {nav === "announce" && (
            <div style={{ maxWidth: 560 }}>
              <div style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 16, padding: "24px" }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-strong)", marginBottom: 6 }}>Barcha foydalanuvchilarga e'lon</div>
                <div style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 20 }}>Xabar barcha foydalanuvchilarga bildirishnoma sifatida yuboriladi</div>
                <form onSubmit={handleAnnounce} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                  <label className="ob-field">
                    <span>Sarlavha (ixtiyoriy)</span>
                    <div className="ob-input">
                      <input type="text" placeholder="Biznesjon e'loni" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} />
                    </div>
                  </label>

                  <label className="ob-field">
                    <span>E'lon matni *</span>
                    <div className="ob-input textarea">
                      <textarea
                        rows={5}
                        placeholder="E'lon matnini kiriting..."
                        value={annText}
                        onChange={(e) => setAnnText(e.target.value)}
                        required
                      />
                    </div>
                  </label>

                  <button type="submit" className="btn btn-primary" disabled={annLoading || !annText.trim()} style={{ marginTop: 4 }}>
                    {annLoading ? "Yuborilmoqda..." : `📢 Barcha ${stats?.users ?? ""} foydalanuvchiga yuborish`}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── AUDIT LOGS ── */}
          {nav === "audit" && (
            <div>
              <div style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", background: "var(--bg-elev-2)", borderBottom: "1px solid var(--border)", fontWeight: 600, fontSize: 13.5, color: "var(--text-strong)" }}>
                  So'nggi 100 ta harakat
                </div>
                {auditLogs.length === 0 ? (
                  <div style={{ padding: 32, textAlign: "center", color: "var(--text-faint)", fontSize: 13 }}>Hali hech qanday harakat yo'q</div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--brand)", background: "var(--brand-tint)", padding: "2px 7px", borderRadius: 6, flexShrink: 0, marginTop: 1 }}>
                        {log.action}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.target}</div>
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-faint)", flexShrink: 0 }}>
                        {new Date(log.createdAt).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* Admin-specific styles */}
      <style>{`
        @media (min-width: 768px) {
          .admin-sidebar {
            position: relative !important;
            transform: translateX(0) !important;
          }
          .admin-main {
            margin-left: 0 !important;
          }
          .admin-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .admin-sidebar {
            width: 240px !important;
          }
        }
      `}</style>
    </div>
  );
}
