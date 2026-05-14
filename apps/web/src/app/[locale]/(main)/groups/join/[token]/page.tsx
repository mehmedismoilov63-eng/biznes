"use client";

import { useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../../../../lib/api/client";

type GroupDto = {
  id: string;
  name: string;
  description: string | null;
  members: number;
};

type JoinResponse = {
  ok: true;
  group: GroupDto;
};

export default function JoinGroupPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? "";
  const locale = useLocale();
  const router = useRouter();

  const [group, setGroup] = useState<GroupDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    api.get<{ group: GroupDto }>(`/groups/invite/${token}`)
      .then((res) => setGroup(res.group))
      .catch(() => setError("Invite link topilmadi yoki muddati o'tgan"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleJoin() {
    setJoining(true);
    try {
      const res = await api.post<JoinResponse>(`/groups/join/${token}`);
      setJoined(true);
      setTimeout(() => router.push(`/${locale}/groups/${res.group.id}`), 1200);
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message ?? "Guruhga qo'shilishda xato yuz berdi");
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="content-inner" style={{ textAlign: "center", paddingTop: 80 }}>
        <div style={{ color: "var(--text-faint)", fontSize: 13 }}>Yuklanmoqda...</div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="content-inner" style={{ textAlign: "center", paddingTop: 80, maxWidth: 480 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
        <h2 style={{ color: "var(--text-strong)", marginBottom: 8 }}>Invite topilmadi</h2>
        <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 24 }}>
          {error ?? "Bu invite link mavjud emas yoki muddati o'tgan."}
        </p>
        <button className="btn btn-secondary" onClick={() => router.push(`/${locale}/groups`)}>
          ← Guruhlar
        </button>
      </div>
    );
  }

  return (
    <div className="content-inner" style={{ textAlign: "center", paddingTop: 60, maxWidth: 480 }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "var(--brand-tint)",
          display: "grid",
          placeItems: "center",
          fontSize: 28,
          color: "var(--brand)",
          fontWeight: 700,
          margin: "0 auto 20px",
        }}
      >
        #
      </div>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-strong)", marginBottom: 8 }}>
        {group.name}
      </h1>
      {group.description && (
        <p style={{ color: "var(--text-dim)", fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
          {group.description}
        </p>
      )}
      <p style={{ color: "var(--text-faint)", fontSize: 13, marginBottom: 28 }}>
        {group.members} a'zo
      </p>

      {joined ? (
        <div style={{ color: "var(--success)", fontWeight: 600, fontSize: 15 }}>
          ✓ Guruhga qo'shildingiz! Yo'naltirilmoqda...
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn btn-secondary" onClick={() => router.push(`/${locale}/groups`)}>
            Bekor qilish
          </button>
          <button className="btn btn-primary" onClick={handleJoin} disabled={joining}>
            {joining ? "..." : "Guruhga qo'shilish"}
          </button>
        </div>
      )}
    </div>
  );
}
