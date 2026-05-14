"use client";

import { useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, resolveMedia } from "../../../../../lib/api/client";

type PersonDto = {
  id: string;
  name: string;
  username: string;
  businessName: string;
  city: string;
  avatarPath: string | null;
  online: boolean;
  bio: string | null;
};

export default function PersonProfilePage() {
  const params = useParams<{ username: string }>();
  const username = params?.username ?? "";
  const locale = useLocale();
  const router = useRouter();
  const [person, setPerson] = useState<PersonDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get<PersonDto | null>(`/users/by-username/${username}`)
      .then((data) => { if (data) setPerson(data); else setError(true); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return <div className="content-inner" style={{ color: "var(--text-faint)", fontSize: 13 }}>Yuklanmoqda...</div>;
  }

  if (error || !person) {
    return (
      <div className="content-inner" style={{ textAlign: "center", paddingTop: 60 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
        <p style={{ color: "var(--text-dim)" }}>Foydalanuvchi topilmadi</p>
        <button className="btn btn-secondary" onClick={() => router.back()}>← Orqaga</button>
      </div>
    );
  }

  const initials = person.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const colorIdx = person.name.charCodeAt(0) % 8;

  return (
    <div className="content-inner" style={{ maxWidth: 640 }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => router.back()} style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
        ← Orqaga
      </button>

      <div
        style={{
          background: "var(--bg-elev)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-xl)",
          padding: "28px",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 20 }}>
          <div className={`av av-c${colorIdx} xxl${person.online ? " av-online" : ""}`}>
            {person.avatarPath ? (
              <img className="av-img" src={resolveMedia(person.avatarPath)} alt={person.name} />
            ) : initials}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "var(--text-strong)" }}>
              {person.name}
            </h1>
            <div style={{ color: "var(--text-faint)", fontSize: 13.5, marginBottom: 8 }}>
              @{person.username}
              {person.online && <span style={{ marginLeft: 10, color: "var(--success)", fontSize: 12 }}>● Onlayn</span>}
            </div>
            {person.businessName && (
              <div style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 4 }}>🏢 {person.businessName}</div>
            )}
            {person.city && (
              <div style={{ color: "var(--text-faint)", fontSize: 13 }}>📍 {person.city}</div>
            )}
          </div>
        </div>

        {person.bio && (
          <p style={{ color: "var(--text-dim)", fontSize: 14, lineHeight: 1.6, margin: "0 0 20px", paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            {person.bio}
          </p>
        )}

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => router.push(`/${locale}/messages?with=${person.id}`)}
        >
          💬 Xabar yuborish
        </button>
      </div>
    </div>
  );
}
