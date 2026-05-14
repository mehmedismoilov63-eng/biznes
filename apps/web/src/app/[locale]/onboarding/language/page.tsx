"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../../../lib/api/client";
import { useAuthStore } from "../../../../lib/store/auth";

const LANGUAGES = [
  { code: "uz-Latn", label: "O'zbekcha", sub: "Lotin", flag: "🇺🇿" },
  { code: "uz-Cyrl", label: "Ўзбекча", sub: "Кирилл", flag: "🇺🇿" },
  { code: "ru", label: "Русский", sub: "Russian", flag: "🇷🇺" },
  { code: "en", label: "English", sub: "English", flag: "🇬🇧" },
];

export default function OnboardingLanguagePage() {
  const t = useTranslations("onboarding.language");
  const locale = useLocale();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [selected, setSelected] = useState(user?.language ?? locale);
  const [loading, setLoading] = useState(false);

  async function handleNext() {
    setLoading(true);
    try {
      await api.post("/me", { language: selected });
      if (user) setUser({ ...user, language: selected });
      router.push(`/${locale}/onboarding/industry`);
    } catch {
      router.push(`/${locale}/onboarding/industry`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ob-shell">
      <div className="ob-card">
        <div className="ob-progress">
          <div className="ob-dot active" />
          <div className="ob-dot" />
          <div className="ob-dot" />
          <div className="ob-dot" />
        </div>
        <div className="ob-head">
          <div className="ob-step">1 / 4</div>
          <h2>{t("title")}</h2>
          <p>{t("subtitle")}</p>
        </div>

        <div className="ob-choices list">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`ob-choice${selected === lang.code ? " selected" : ""}`}
              onClick={() => setSelected(lang.code)}
            >
              <span className="ob-choice-icon">{lang.flag}</span>
              <div>
                <div className="ob-choice-name">{lang.label}</div>
                <div className="ob-choice-sub">{lang.sub}</div>
              </div>
              <span className="ob-check">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          ))}
        </div>

        <div className="ob-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? "..." : "Davom etish →"}
          </button>
        </div>
      </div>
    </div>
  );
}
