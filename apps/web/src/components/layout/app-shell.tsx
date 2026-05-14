"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../lib/store/auth";
import { resolveMedia, api } from "../../lib/api/client";

// ── Icon map — exact paths from Biznesjon prototype icons.jsx ──────────────
const ICONS: Record<string, React.ReactNode> = {
  home: <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1Z" />,
  book: (
    <>
      <path d="M3 4.5A2.5 2.5 0 0 1 5.5 2H20v18H5.5A2.5 2.5 0 0 0 3 22.5" />
      <path d="M3 4.5V20a2.5 2.5 0 0 0 2.5 2.5" />
    </>
  ),
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  handshake: (
    <>
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
      <path d="m21 3 1 11h-2" />
      <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
      <path d="M3 4h8" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />,
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  settings: (
    <>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
};

function NavSvg({ icon, size = 17 }: { icon: string; size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
    >
      {ICONS[icon]}
    </svg>
  );
}

function Avatar({ name, src, size = 32 }: { name: string; src?: string | null; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const colorIdx = name.charCodeAt(0) % 8;
  if (src) {
    return (
      <img
        src={resolveMedia(src) ?? ""}
        alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div className={`av av-c${colorIdx}`} style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const cmdRef = useRef<HTMLInputElement>(null);
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Badge counts
  const [groupsBadge, setGroupsBadge] = useState(0);
  const [msgBadge, setMsgBadge] = useState(0);
  const [mysiteBadge, setMysiteBadge] = useState(0);

  useEffect(() => {
    api.get<{ unread: number }[]>("/groups")
      .then((groups) => setGroupsBadge(groups.reduce((s, g) => s + (g.unread || 0), 0)))
      .catch(() => {});
    api.get<{ id: string }[]>("/me/promo-videos")
      .then((videos) => setMysiteBadge(videos.length > 0 ? 1 : 0))
      .catch(() => {});
  }, []);

  function handleLogoClick() {
    logoClickCount.current += 1;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    if (logoClickCount.current >= 5) {
      logoClickCount.current = 0;
      router.push(`/${locale}/admin`);
      return;
    }
    logoClickTimer.current = setTimeout(() => { logoClickCount.current = 0; }, 2000);
  }

  const displayName = user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : "Biznesjon";

  // ── Nav items ───────────────────────────────────────────────────────────
  const NAV_MAIN = [
    { id: "home",     label: "Bosh sahifa",    short: "Bosh",     path: `/${locale}/home`,     icon: "home" },
    { id: "lessons",  label: "Darslar",        short: "Darslar",  path: `/${locale}/lessons`,  icon: "book" },
    { id: "mysite",   label: "Mening saytim",  short: "Saytim",   path: `/${locale}/mysite`,   icon: "star",    badge: mysiteBadge },
    { id: "people",   label: "Tadbirkorlar",   short: "Biznes",   path: `/${locale}/people`,   icon: "handshake" },
    { id: "groups",   label: "Guruhlar",       short: "Guruhlar", path: `/${locale}/groups`,   icon: "users",   badge: groupsBadge },
    { id: "messages", label: "Xabarlar",       short: "Xabarlar", path: `/${locale}/messages`, icon: "message", badge: msgBadge },
  ];
  const NAV_ACCOUNT = [
    { id: "profile",  label: "Profilim",   short: "Profil",  path: `/${locale}/profile`,  icon: "user" },
    { id: "settings", label: "Sozlamalar", short: "Sozlama", path: `/${locale}/settings`, icon: "settings" },
  ];
  const ALL_NAV = [...NAV_MAIN, ...NAV_ACCOUNT];

  function isActive(path: string) {
    return pathname === path || pathname.startsWith(path + "/");
  }

  const topbarTitle =
    ALL_NAV.find((n) => isActive(n.path))?.label ?? "Biznesjon";

  const handleLogout = useCallback(() => {
    logout();
    router.push(`/${locale}/login`);
  }, [logout, router, locale]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
      if (e.key === "Escape") setCmdOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (cmdOpen) setTimeout(() => cmdRef.current?.focus(), 50);
  }, [cmdOpen]);

  // ── Mobile tab bar items ────────────────────────────────────────────────
  const TAB_BAR = [
    { id: "home",     path: `/${locale}/home`,     label: "Bosh",    icon: "home",    match: [] as string[] },
    { id: "lessons",  path: `/${locale}/lessons`,  label: "Darslar", icon: "book",    match: [] },
    { id: "groups",   path: `/${locale}/groups`,   label: "Guruhlar",icon: "users",   match: [], badge: groupsBadge },
    { id: "messages", path: `/${locale}/messages`, label: "Xabarlar",icon: "message", match: [], badge: msgBadge },
    { id: "profile",  path: `/${locale}/profile`,  label: "Profil",  icon: "user",    match: ["settings", "mysite"] },
  ];

  return (
    <>
      <div className="app">
        {/* ── Top navbar ── */}
        <aside className="sidebar">
          {/* Brand */}
          <div className="sidebar-brand">
            <div
              className="sidebar-brand-mark"
              onClick={handleLogoClick}
              style={{ cursor: "pointer", userSelect: "none" }}
            >
              B
            </div>
          </div>

          {/* Centered nav */}
          <div className="sidebar-nav-center">
            <div className="sidebar-section">
              {NAV_MAIN.map((item) => (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`nav-item${isActive(item.path) ? " active" : ""}`}
                >
                  <div className="nav-icon"><NavSvg icon={item.icon} size={19} /></div>
                  <span className="nav-text">{item.short}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </Link>
              ))}
            </div>

            <div style={{ width: 1, height: 28, background: "var(--border)", margin: "0 6px", flexShrink: 0 }} />

            <div className="sidebar-section">
              {NAV_ACCOUNT.map((item) => (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`nav-item${isActive(item.path) ? " active" : ""}`}
                >
                  <div className="nav-icon"><NavSvg icon={item.icon} size={19} /></div>
                  <span className="nav-text">{item.short}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right side: search + bell + avatar */}
          <div className="sidebar-footer">
            <button type="button" className="icon-btn" onClick={() => setCmdOpen(true)} title="Qidirish">
              <NavSvg icon="search" size={19} />
            </button>
            <Link href={`/${locale}/notifications`} className="icon-btn" title="Bildirishnomalar">
              <NavSvg icon="bell" size={19} />
              <span className="dot" />
            </Link>
            <Link href={`/${locale}/profile`} className="sidebar-profile" title={displayName}>
              <Avatar name={displayName} src={user?.profile?.avatarPath} size={30} />
            </Link>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main">
          {/* Mobile header */}
          <header className="mobile-header">
            <div className="mobile-header-brand">
              <div className="sidebar-brand-mark" onClick={handleLogoClick} style={{ cursor: "pointer", userSelect: "none" }}>B</div>
              <span>Biznesjon</span>
            </div>
            <button type="button" className="icon-btn" onClick={() => setCmdOpen(true)}>
              <NavSvg icon="search" size={18} />
            </button>
            <button type="button" className="icon-btn">
              <NavSvg icon="bell" size={18} />
              <span className="dot" />
            </button>
          </header>

          {/* Desktop topbar */}
          <header className="topbar">
            <div className="topbar-title">{topbarTitle}</div>
            <button type="button" className="topbar-search" onClick={() => setCmdOpen(true)}>
              <NavSvg icon="search" size={15} />
              <span className="topbar-search-placeholder">Qidirish...</span>
              <kbd>⌘K</kbd>
            </button>
            <Link href={`/${locale}/notifications`} className="icon-btn">
              <NavSvg icon="bell" size={18} />
              <span className="dot" />
            </Link>
          </header>

          {/* Page content */}
          <div className="content">{children}</div>

          {/* Mobile tab bar */}
          <nav className="tab-bar">
            {TAB_BAR.map((item) => {
              const active = isActive(item.path) || item.match.some((m) => pathname.includes(m));
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`tab-bar-item${active ? " active" : ""}`}
                >
                  <span className="tab-bar-item-icon">
                    <NavSvg icon={item.icon} size={22} />
                  </span>
                  <span>{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </main>
      </div>

      {/* ── Command Palette ── */}
      {cmdOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "var(--overlay)", zIndex: 200, display: "grid", placeItems: "center", padding: 24 }}
          onClick={() => setCmdOpen(false)}
        >
          <div
            style={{ width: "min(580px, 100%)", background: "var(--bg-elev)", border: "1px solid var(--border-strong)", borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-lg)", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
              <NavSvg icon="search" size={16} />
              <input
                ref={cmdRef}
                type="text"
                placeholder="Darslar, tadbirkorlar, guruhlar..."
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                style={{ flex: 1, border: 0, outline: 0, background: "transparent", color: "var(--text-strong)", fontSize: 15 }}
              />
              <kbd style={{ fontSize: 11, background: "var(--bg-elev-2)", border: "1px solid var(--border-strong)", color: "var(--text-dim)", padding: "1px 6px", borderRadius: 4 }}>Esc</kbd>
            </div>
            <div style={{ padding: "8px 0", maxHeight: 400, overflowY: "auto" }}>
              {ALL_NAV
                .filter((item) => !cmdQuery || item.label.toLowerCase().includes(cmdQuery.toLowerCase()))
                .map((item) => (
                  <Link
                    key={item.id}
                    href={item.path}
                    onClick={() => setCmdOpen(false)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 16px", color: "var(--text)", fontSize: 14, transition: "background var(--t-fast)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-elev-2)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <NavSvg icon={item.icon} size={16} />
                    {item.label}
                  </Link>
                ))}
              <div style={{ height: 1, background: "var(--border)", margin: "6px 0" }} />
              <button
                type="button"
                onClick={handleLogout}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 16px", color: "var(--error)", fontSize: 14, width: "100%", textAlign: "left" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Chiqish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
