"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef, type FormEvent } from "react";
import { api } from "../../../../lib/api/client";
import { useAuthStore } from "../../../../lib/store/auth";

type UsernameStatus = "idle" | "checking" | "ok" | "taken";

export default function OnboardingProfilePage() {
  const t = useTranslations("onboarding.profile");
  const locale = useLocale();
  const router = useRouter();
  const { user, setAuth, accessToken } = useAuthStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const section = sessionStorage.getItem("bj_ob_section");
    if (!section) {
      router.replace(`/${locale}/onboarding/section`);
    }
  }, [locale, router]);

  const checkUsername = useCallback((val: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val || val.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get<{ available: boolean }>(`/users/check-username?username=${encodeURIComponent(val)}`);
        setUsernameStatus(res.available ? "ok" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 500);
  }, []);

  function handleUsernameChange(val: string) {
    const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
    setUsername(clean);
    checkUsername(clean);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (usernameStatus === "taken") {
      setError("Bu username band. Boshqa username tanlang.");
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !username.trim()) {
      setError("Ism, familiya va username majburiy.");
      return;
    }
    setError(null);
    setLoading(true);

    const sectionId = sessionStorage.getItem("bj_ob_section");
    const industryId = sessionStorage.getItem("bj_ob_industry");

    try {
      const updated = await api.post<{
        id: string;
        phone: string;
        role: "USER" | "ADMIN" | "SUPER_ADMIN";
        language: string;
        industryId?: string | null;
        sectionId?: string | null;
        profile?: { firstName: string; lastName: string; username: string; businessName: string | null; city: string | null; bio: string | null; avatarPath: string | null } | null;
      }>("/me", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        businessName: businessName.trim() || null,
        city: city.trim() || null,
        bio: bio.trim() || null,
        sectionId,
        industryId,
      });

      sessionStorage.removeItem("bj_ob_industry");
      sessionStorage.removeItem("bj_ob_section");

      if (user && accessToken) {
        setAuth(
          {
            ...user,
            industryId: updated.industryId ?? user.industryId,
            sectionId: updated.sectionId ?? user.sectionId,
            profile: {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              username: username.trim(),
              businessName: businessName.trim() || null,
              city: city.trim() || null,
              bio: bio.trim() || null,
              avatarPath: updated.profile?.avatarPath ?? user.profile?.avatarPath ?? null,
            },
          },
          accessToken,
        );
      }

      router.push(`/${locale}/home`);
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message ?? "Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    router.push(`/${locale}/onboarding/section`);
  }

  return (
    <div className="ob-shell">
      <form className="ob-card" onSubmit={handleSubmit}>
        <div className="ob-progress">
          <div className="ob-dot done" />
          <div className="ob-dot done" />
          <div className="ob-dot done" />
          <div className="ob-dot active" />
        </div>
        <div className="ob-head">
          <div className="ob-step">4 / 4</div>
          <h2>{t("title")}</h2>
          <p>{t("subtitle")}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label className="ob-field">
            <span>{t("firstName")} *</span>
            <div className="ob-input">
              <input
                type="text"
                placeholder="Bekzod"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
          </label>
          <label className="ob-field">
            <span>{t("lastName")} *</span>
            <div className="ob-input">
              <input
                type="text"
                placeholder="Yusupov"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </label>
        </div>

        <label className="ob-field">
          <span>{t("username")} *</span>
          <div className="ob-input">
            <span style={{ color: "var(--text-faint)", fontSize: 14, userSelect: "none" }}>@</span>
            <input
              type="text"
              placeholder="bekzod_uz"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              required
            />
            {usernameStatus === "checking" && (
              <span style={{ color: "var(--text-faint)", fontSize: 12 }}>...</span>
            )}
          </div>
          {usernameStatus === "ok" && (
            <span className="ob-username-status ok">✓ Band emas</span>
          )}
          {usernameStatus === "taken" && (
            <span className="ob-username-status taken">✗ Band. Boshqa username tanlang</span>
          )}
          <span style={{ color: "var(--text-faint)", fontSize: 11.5 }}>{t("usernameHint")}</span>
        </label>

        <label className="ob-field">
          <span>{t("businessName")}</span>
          <div className="ob-input">
            <input
              type="text"
              placeholder="Kofe Lab"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>
        </label>

        <label className="ob-field">
          <span>{t("city")}</span>
          <div className="ob-input">
            <input
              type="text"
              placeholder="Toshkent"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </label>

        <label className="ob-field">
          <span>{t("bio")}</span>
          <div className="ob-input textarea">
            <textarea
              placeholder="O'zingiz haqida qisqacha..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
            />
          </div>
        </label>

        {error && <div className="auth-error" style={{ marginBottom: 14 }}>{error}</div>}

        <div className="ob-actions">
          <button type="button" className="btn btn-secondary btn-lg" onClick={handleBack}>
            ← Orqaga
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading || usernameStatus === "taken" || usernameStatus === "checking"}
          >
            {loading ? "..." : t("save")}
          </button>
        </div>
      </form>
    </div>
  );
}
