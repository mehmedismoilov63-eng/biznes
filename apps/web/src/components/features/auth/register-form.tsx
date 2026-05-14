"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "../../../lib/api/client";

type RegisterResponse = {
  otpToken: string;
  expiresIn: number;
  phone: string;
  debugCode?: string;
};

export function RegisterForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Parollar mos kelmaydi");
      return;
    }
    if (password.length < 8) {
      setError(t("errors.weakPassword"));
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<RegisterResponse>("/auth/register", { phone, password });
      sessionStorage.setItem(
        "bj_otp",
        JSON.stringify({ otpToken: res.otpToken, phone: res.phone }),
      );
      router.push(`/${locale}/verify-otp`);
    } catch (err) {
      const e = err as { status?: number; message?: string };
      if (e.status === 409) {
        setError(t("errors.phoneTaken"));
      } else {
        setError(e.message ?? "Xatolik yuz berdi");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <div className="auth-card-head">
        <h1>{t("register")}</h1>
        <p>Biznesjon platformasiga qo'shiling — bepul, hamma uchun.</p>
      </div>

      <label className="auth-field">
        <span>{t("phone")}</span>
        <div className="auth-input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.97a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <input
            type="tel"
            placeholder={t("phonePlaceholder")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoComplete="tel"
          />
        </div>
      </label>

      <label className="auth-field">
        <span>{t("password")}</span>
        <div className="auth-input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
      </label>

      <label className="auth-field">
        <span>{t("confirmPassword")}</span>
        <div className="auth-input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <input
            type="password"
            placeholder={t("passwordPlaceholder")}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
      </label>

      {error && <div className="auth-error">{error}</div>}

      <button className="btn btn-primary btn-lg auth-submit" type="submit" disabled={loading}>
        {loading ? "..." : t("register")}
      </button>

      <div className="auth-switch">
        <span style={{ color: "var(--text-dim)", fontSize: 13 }}>{t("hasAccount")}&nbsp;</span>
        <a href={`/${locale}/login`} style={{ color: "var(--brand)", fontWeight: 500, fontSize: 13 }}>
          {t("login")}
        </a>
      </div>
    </form>
  );
}
