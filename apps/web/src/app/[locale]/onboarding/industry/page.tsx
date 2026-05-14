"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "../../../../lib/api/client";

type Industry = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  isOpen: boolean;
};

export default function OnboardingIndustryPage() {
  const t = useTranslations("onboarding.industry");
  const locale = useLocale();
  const router = useRouter();

  const [industries, setIndustries] = useState<Industry[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<Industry[]>("/catalog/industries")
      .then(setIndustries)
      .finally(() => setLoadingData(false));
  }, []);

  function handleNext() {
    if (!selected) return;
    setLoading(true);
    sessionStorage.setItem("bj_ob_industry", selected);
    router.push(`/${locale}/onboarding/section`);
  }

  function handleBack() {
    router.push(`/${locale}/onboarding/language`);
  }

  return (
    <div className="ob-shell">
      <div className="ob-card">
        <div className="ob-progress">
          <div className="ob-dot done" />
          <div className="ob-dot active" />
          <div className="ob-dot" />
          <div className="ob-dot" />
        </div>
        <div className="ob-head">
          <div className="ob-step">2 / 4</div>
          <h2>{t("title")}</h2>
          <p>{t("subtitle")}</p>
        </div>

        {loadingData ? (
          <div style={{ color: "var(--text-faint)", fontSize: 13, marginBottom: 20 }}>Yuklanmoqda...</div>
        ) : (
          <div className="ob-choices">
            {industries.map((ind) => (
              <button
                key={ind.id}
                type="button"
                className={`ob-choice${selected === ind.id ? " selected" : ""}`}
                onClick={() => setSelected(ind.id)}
              >
                <span className="ob-choice-icon">{ind.icon ?? "🏢"}</span>
                <div className="ob-choice-name">{ind.name}</div>
                <span className="ob-check">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="ob-actions">
          <button type="button" className="btn btn-secondary btn-lg" onClick={handleBack}>
            ← Orqaga
          </button>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleNext}
            disabled={!selected || loading}
          >
            Davom etish →
          </button>
        </div>
      </div>
    </div>
  );
}
