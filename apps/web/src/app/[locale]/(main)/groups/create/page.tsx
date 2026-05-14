"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "../../../../../lib/api/client";

type GroupDto = {
  id: string;
  name: string;
};

export default function CreateGroupPage() {
  const t = useTranslations("groups");
  const locale = useLocale();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 3) {
      setError("Guruh nomi kamida 3 belgi bo'lishi kerak");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const group = await api.post<GroupDto>("/groups", {
        name: name.trim(),
        description: description.trim() || null,
        visibility,
      });
      router.push(`/${locale}/groups/${group.id}`);
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message ?? "Guruh yaratishda xato yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="content-inner" style={{ maxWidth: 560 }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => router.back()} style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
        ← Orqaga
      </button>

      <h1 className="page-title" style={{ marginBottom: 24 }}>{t("create")}</h1>

      <form onSubmit={handleSubmit} style={{ background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 28 }}>
        <label className="ob-field">
          <span>{t("name")} *</span>
          <div className="ob-input">
            <input
              type="text"
              placeholder={t("namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              maxLength={50}
            />
          </div>
        </label>

        <label className="ob-field">
          <span>{t("description")}</span>
          <div className="ob-input textarea">
            <textarea
              placeholder={t("descPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
            />
          </div>
        </label>

        <div className="ob-field">
          <span>{t("visibility")}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {(["PUBLIC", "PRIVATE"] as const).map((vis) => (
              <button
                key={vis}
                type="button"
                onClick={() => setVisibility(vis)}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "var(--r-md)",
                  border: "1.5px solid",
                  borderColor: visibility === vis ? "var(--brand)" : "var(--border)",
                  background: visibility === vis ? "var(--brand-tint)" : "transparent",
                  fontSize: 13.5,
                  fontWeight: 500,
                  color: "var(--text-strong)",
                  transition: "all var(--t-fast)",
                }}
              >
                {vis === "PUBLIC" ? `🌐 ${t("public")}` : `🔒 ${t("private")}`}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="auth-error" style={{ marginBottom: 14 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => router.back()}>
            Bekor qilish
          </button>
          <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={loading}>
            {loading ? "..." : "Yaratish"}
          </button>
        </div>
      </form>
    </div>
  );
}
