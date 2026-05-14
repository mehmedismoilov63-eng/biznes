"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "../../../../lib/api/client";

type Section = {
  id: string;
  industryId: string;
  slug: string;
  name: string;
  icon: string | null;
};

export default function OnboardingSectionPage() {
  const t = useTranslations("onboarding.section");
  const locale = useLocale();
  const router = useRouter();

  const [sections, setSections] = useState<Section[]>([]);
  const [industryId, setIndustryId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("bj_ob_industry");
    if (!stored) {
      router.replace(`/${locale}/onboarding/industry`);
      return;
    }
    setIndustryId(stored);
    api.get<Section[]>("/catalog/sections")
      .then((all) => setSections(all.filter((s) => s.industryId === stored)))
      .finally(() => setLoadingData(false));
  }, [locale, router]);

  function handleNext() {
    if (!selected) return;
    sessionStorage.setItem("bj_ob_section", selected);
    router.push(`/${locale}/onboarding/profile`);
  }

  function handleBack() {
    router.push(`/${locale}/onboarding/industry`);
  }

  return (
    <div className="ob-shell">
      <div className="ob-card">
        <div className="ob-progress">
          <div className="ob-dot done" />
          <div className="ob-dot done" />
          <div className="ob-dot active" />
          <div className="ob-dot" />
        </div>
        <div className="ob-head">
          <div className="ob-step">3 / 4</div>
          <h2>{t("title")}</h2>
          <p>{t("subtitle")}</p>
        </div>

        {loadingData ? (
          <div style={{ color: "var(--text-faint)", fontSize: 13, marginBottom: 20 }}>Yuklanmoqda...</div>
        ) : (
          <div className="ob-choices list">
            {sections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                className={`ob-choice${selected === sec.id ? " selected" : ""}`}
                onClick={() => setSelected(sec.id)}
              >
                <span className="ob-choice-icon">{sec.icon ?? "📌"}</span>
                <div className="ob-choice-name">{sec.name}</div>
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
            disabled={!selected}
          >
            Davom etish →
          </button>
        </div>
      </div>
    </div>
  );
}
