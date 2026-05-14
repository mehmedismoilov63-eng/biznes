"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "../../../../lib/api/client";
import { useAuthStore } from "../../../../lib/store/auth";
import { useUIStore } from "../../../../lib/store/ui";

type Tab = "profile" | "lang" | "notif" | "theme" | "danger";

const LANGUAGES = [
  { code: "uz-Latn", label: "O'zbekcha (lotin)", native: "O'zbekcha" },
  { code: "uz-Cyrl", label: "Узбекча (kirill)", native: "Ўзбекча" },
  { code: "ru", label: "Русский", native: "Russian" },
  { code: "en", label: "English", native: "English" },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 34, height: 20, borderRadius: 10, cursor: "pointer", flexShrink: 0,
        background: value ? "var(--brand)" : "var(--bg-elev-3)",
        position: "relative", transition: "background var(--t-fast)",
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: value ? 17 : 3,
        width: 14, height: 14, borderRadius: "50%", background: "#fff",
        transition: "left var(--t-fast)", boxShadow: "0 1px 3px rgba(0,0,0,.3)",
      }} />
    </div>
  );
}

function SettingsRow({ label, desc, children }: { label: string; desc?: string; children?: React.ReactNode }) {
  return (
    <div className="settings-row">
      <div>
        <div className="settings-row-label">{label}</div>
        {desc && <div className="settings-row-desc">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

const NAV_ITEMS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  {
    id: "profile", label: "Profil",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>,
  },
  {
    id: "lang", label: "Til",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  },
  {
    id: "notif", label: "Bildirishnomalar",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  },
  {
    id: "theme", label: "Tema",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>,
  },
  {
    id: "danger", label: "Hisobdan chiqish",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  },
];

export default function SettingsPage() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

  const [tab, setTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState(user?.profile?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.profile?.lastName ?? "");
  const [businessName, setBusinessName] = useState(user?.profile?.businessName ?? "");
  const [city, setCity] = useState(user?.profile?.city ?? "");
  const [bio, setBio] = useState(user?.profile?.bio ?? "");
  const [selectedLang, setSelectedLang] = useState(user?.language ?? locale);

  const [notifPush, setNotifPush] = useState(true);
  const [notifMsg, setNotifMsg] = useState(true);
  const [notifGroup, setNotifGroup] = useState(false);
  const [notifLesson, setNotifLesson] = useState(true);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/me", { firstName, lastName, businessName, city, bio });
      if (user) {
        setUser({
          ...user,
          profile: user.profile
            ? { ...user.profile, firstName, lastName, businessName: businessName || null, city: city || null, bio: bio || null }
            : null,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function saveLang() {
    setSaving(true);
    try {
      await api.post("/me", { language: selectedLang });
      if (user) setUser({ ...user, language: selectedLang });
      router.push(`/${selectedLang}/settings`);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    router.push(`/${locale}/login`);
  }

  return (
    <div className="content-inner">
      <div className="page-head">
        <h1 className="page-title">Sozlamalar</h1>
        <p className="page-sub">Hisobingiz va platforma sozlamalari</p>
      </div>

      <div className="settings">
        {/* Sidebar nav */}
        <div className="settings-nav">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`settings-nav-item${tab === item.id ? " active" : ""}`}
              onClick={() => setTab(item.id)}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>

        {/* Panel */}
        <div className="settings-panel">

          {/* Profile */}
          {tab === "profile" && (
            <form onSubmit={saveProfile}>
              <h3 className="settings-h">Profil</h3>
              <div className="settings-sub">Sizning ma'lumotlaringiz boshqa tadbirkorlarga ko'rinadi</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 5, fontWeight: 500 }}>Ism</div>
                  <input
                    className="input-field"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ismingiz"
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 5, fontWeight: 500 }}>Familiya</div>
                  <input
                    className="input-field"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Familiyangiz"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 5, fontWeight: 500 }}>Biznes nomi</div>
                <input
                  className="input-field"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Biznesingiz nomi"
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 5, fontWeight: 500 }}>Shahar</div>
                <input
                  className="input-field"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Shahringiz"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 5, fontWeight: 500 }}>Bio (max 200 belgi)</div>
                <textarea
                  className="input-field"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder="O'zingiz haqida qisqacha..."
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saved ? "✓ Saqlandi" : saving ? "..." : "Saqlash"}
                </button>
                <button type="button" className="btn btn-ghost">Bekor qilish</button>
              </div>
            </form>
          )}

          {/* Language */}
          {tab === "lang" && (
            <>
              <h3 className="settings-h">Interfeys tili</h3>
              <div className="settings-sub">Video darslar audiosi har doim o'zbek tilida (lotin) qoladi. Bu sozlama faqat interfeys uchun.</div>
              {LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  className="settings-row"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedLang(lang.code)}
                >
                  <div>
                    <div className="settings-row-label">{lang.label}</div>
                    <div className="settings-row-desc">{lang.native}</div>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    border: `2px solid ${selectedLang === lang.code ? "var(--brand)" : "var(--border-strong)"}`,
                    display: "grid", placeItems: "center", flexShrink: 0,
                  }}>
                    {selectedLang === lang.code && (
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--brand)" }} />
                    )}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 20 }}>
                <button type="button" className="btn btn-primary" onClick={saveLang} disabled={saving}>
                  {saving ? "..." : "Saqlash"}
                </button>
              </div>
            </>
          )}

          {/* Notifications */}
          {tab === "notif" && (
            <>
              <h3 className="settings-h">Bildirishnomalar</h3>
              <div className="settings-sub">Qaysi voqealar haqida xabar olishingizni tanlang</div>
              <SettingsRow label="Push bildirishnomalar" desc="Telefonga push xabarlar yuboriladi">
                <Toggle value={notifPush} onChange={setNotifPush} />
              </SettingsRow>
              <SettingsRow label="Shaxsiy xabarlar" desc="Yangi DM kelganda xabar bering">
                <Toggle value={notifMsg} onChange={setNotifMsg} />
              </SettingsRow>
              <SettingsRow label="Guruh xabarlari" desc="Faqat sizni mention qilganda">
                <Toggle value={notifGroup} onChange={setNotifGroup} />
              </SettingsRow>
              <SettingsRow label="Yangi darslar" desc="Sizning bo'limingizda yangi video chiqsa">
                <Toggle value={notifLesson} onChange={setNotifLesson} />
              </SettingsRow>
            </>
          )}

          {/* Theme */}
          {tab === "theme" && (
            <>
              <h3 className="settings-h">Ko'rinish</h3>
              <div className="settings-sub">Uzoq vaqt ishlash uchun ko'zga qulay tema</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {(["dark", "light", "system"] as const).map((th) => {
                  const labels: Record<string, string> = { dark: "Qorong'i", light: "Yorug'", system: "Avto" };
                  const descs: Record<string, string> = { dark: "Default — kechqurun uchun", light: "Kunduz uchun", system: "Tizimga muvofiq" };
                  const icons: Record<string, React.ReactNode> = {
                    dark: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
                    light: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /></svg>,
                    system: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>,
                  };
                  return (
                    <div
                      key={th}
                      onClick={() => setTheme(th)}
                      style={{
                        padding: "16px 14px",
                        borderRadius: "var(--r-lg)",
                        border: `1.5px solid ${theme === th ? "var(--brand)" : "var(--border)"}`,
                        background: theme === th ? "var(--brand-tint)" : "var(--bg)",
                        cursor: "pointer",
                        transition: "all var(--t-fast)",
                        display: "flex", flexDirection: "column", gap: 8,
                      }}
                    >
                      <div style={{ color: theme === th ? "var(--brand)" : "var(--text-dim)" }}>{icons[th]}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-strong)" }}>{labels[th]}</div>
                      <div style={{ fontSize: 11, color: "var(--text-faint)", lineHeight: 1.4 }}>{descs[th]}</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Danger / logout */}
          {tab === "danger" && (
            <>
              <h3 className="settings-h">Hisobdan chiqish</h3>
              <div className="settings-sub">Barcha qurilmalarda sessiyangiz yakunlanadi</div>
              <div style={{ marginTop: 20 }}>
                <button type="button" className="btn btn-danger" onClick={handleLogout}>
                  Hisobdan chiqish
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
