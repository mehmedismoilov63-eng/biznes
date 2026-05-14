"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, type FormEvent } from "react";
import { api } from "../../../lib/api/client";
import { useAuthStore } from "../../../lib/store/auth";

type OtpVerifyResponse = {
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
    } | null;
  };
  accessToken: string;
};

export function VerifyOtpForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [otpToken, setOtpToken] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("bj_otp");
      if (!stored) {
        router.replace(`/${locale}/register`);
        return;
      }
      const data = JSON.parse(stored) as { otpToken: string; phone: string };
      setOtpToken(data.otpToken);
      setPhone(data.phone);
    } catch {
      router.replace(`/${locale}/register`);
    }
  }, [locale, router]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        const res = await api.post<OtpVerifyResponse>("/auth/verify-otp", { otpToken, code });
        sessionStorage.removeItem("bj_otp");
        setAuth(res.user, res.accessToken);
        router.push(`/${locale}/onboarding/language`);
      } catch (err) {
        const e = err as { status?: number; message?: string };
        if (e.status === 410) {
          setError(t("errors.otpExpired"));
        } else {
          setError(t("errors.otpWrong"));
        }
      } finally {
        setLoading(false);
      }
    },
    [otpToken, code, locale, router, setAuth, t],
  );

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <div className="auth-card-head">
        <h1>{t("verify")}</h1>
        <p>
          {phone
            ? t("otpSent", { phone })
            : "SMS orqali kod yuborildi. Kodni kiriting."}
        </p>
      </div>

      <label className="auth-field">
        <span>{t("otp")}</span>
        <div className="auth-input">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            required
            autoComplete="one-time-code"
          />
        </div>
      </label>

      {error && <div className="auth-error">{error}</div>}

      <button className="btn btn-primary btn-lg auth-submit" type="submit" disabled={loading || code.length < 6}>
        {loading ? "..." : t("verify")}
      </button>
    </form>
  );
}
