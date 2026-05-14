"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "../../../lib/api/client";
import { useAuthStore } from "../../../lib/store/auth";

type LoginResponse = {
  user: {
    id: string;
    phone: string;
    role: "USER" | "ADMIN" | "SUPER_ADMIN";
    language: string;
    industryId?: string | null;
    sectionId?: string | null;
    profile?: {
      firstName: string;
      lastName: string;
      username: string;
      avatarPath?: string | null;
      businessName?: string | null;
      city?: string | null;
      bio?: string | null;
    } | null;
  };
  accessToken: string;
};

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const locale = useLocale();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>("/auth/login", { phone, password });
      setAuth(res.user, res.accessToken);
      const isAdmin = res.user.role === "ADMIN" || res.user.role === "SUPER_ADMIN";
      if (!isAdmin && (!res.user.profile?.firstName || !res.user.industryId)) {
        router.push(`/${locale}/onboarding/language`);
      } else {
        router.push(`/${locale}/home`);
      }
    } catch {
      setError(t("errors.wrongCredentials"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: "min(420px, 100%)" }}>
      {/* Brand mark */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          display: "grid", placeItems: "center",
          color: "#fff", fontWeight: 800, fontSize: 17,
          boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
          flexShrink: 0,
        }}>B</div>
        <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-strong)", letterSpacing: "-0.02em" }}>
          Biznesjon
        </span>
      </div>

      {/* Heading */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: "0 0 8px", fontSize: 30, fontWeight: 700, letterSpacing: "-0.035em", color: "var(--text-strong)", lineHeight: 1.1 }}>
          Xush kelibsiz
        </h1>
        <p style={{ margin: 0, color: "var(--text-dim)", fontSize: 14, lineHeight: 1.6 }}>
          Tadbirkorlar uchun darslar, chat va "Mening saytim"
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Phone */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--text-dim)", marginBottom: 7, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Telefon raqam
          </label>
          <div className="auth-input">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.97a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            <input
              type="tel"
              placeholder="+998 90 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "var(--text-dim)", marginBottom: 7, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Parol
          </label>
          <div className="auth-input">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              style={{ background: "none", border: "none", padding: "0 2px", cursor: "pointer", color: "var(--text-faint)", display: "flex", alignItems: "center", flexShrink: 0 }}
              tabIndex={-1}
            >
              {showPass ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="auth-error" style={{ marginTop: 12, marginBottom: 4 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          className="btn btn-primary auth-submit"
          type="submit"
          disabled={loading}
          style={{ marginTop: 24, height: 48, fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", borderRadius: 12 }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Kirilmoqda...
            </span>
          ) : "Kirish →"}
        </button>
      </form>

      {/* Feature chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginTop: 28 }}>
        {["🎬 Professional darslar", "💬 Tadbirkorlar chati", "🌐 Mening saytim"].map((f) => (
          <span key={f} style={{ fontSize: 11.5, color: "var(--text-faint)", background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 20, padding: "3px 10px" }}>
            {f}
          </span>
        ))}
      </div>

      {/* Register link */}
      <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
        <span style={{ color: "var(--text-dim)", fontSize: 13 }}>{t("noAccount")}</span>
        <a href={`/${locale}/register`} style={{ color: "var(--brand)", fontWeight: 600, fontSize: 13 }}>
          {t("register")}
        </a>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
