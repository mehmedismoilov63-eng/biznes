"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { api } from "../../../../lib/api/client";

type NotificationDto = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
};

const TYPE_ICONS: Record<string, string> = {
  DIRECT_MESSAGE: "💬",
  GROUP_MENTION: "👥",
  PROMO_VIDEO_PUBLISHED: "🎥",
  LESSON_PUBLISHED: "📚",
  GROUP_INVITE: "✉️",
  ADMIN_ANNOUNCEMENT: "📢",
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Hozir";
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  return `${Math.floor(hours / 24)} kun oldin`;
}

export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const [notifs, setNotifs] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<NotificationDto[]>("/notifications").then(setNotifs).finally(() => setLoading(false));
  }, []);

  async function markAllRead() {
    await api.post("/notifications/read-all");
    setNotifs((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
  }

  async function markRead(id: string) {
    await api.post(`/notifications/${id}/read`);
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
  }

  const unreadCount = notifs.filter((n) => !n.readAt).length;

  return (
    <div className="content-inner">
      <div className="page-head-actions" style={{ marginBottom: 24 }}>
        <h1 className="page-title">{t("title")}</h1>
        {unreadCount > 0 && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={markAllRead}>
            {t("readAll")}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: "var(--text-faint)", fontSize: 13 }}>Yuklanmoqda...</div>
      ) : notifs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-faint)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
          <p>{t("empty")}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {notifs.map((notif) => (
            <button
              key={notif.id}
              type="button"
              onClick={() => !notif.readAt && markRead(notif.id)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                padding: "14px 16px",
                borderRadius: "var(--r-lg)",
                background: notif.readAt ? "transparent" : "var(--brand-tint)",
                border: "1px solid",
                borderColor: notif.readAt ? "transparent" : "var(--brand-tint-strong)",
                textAlign: "left",
                cursor: notif.readAt ? "default" : "pointer",
                transition: "background var(--t-fast)",
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-elev-2)", display: "grid", placeItems: "center", flexShrink: 0, fontSize: 18 }}>
                {TYPE_ICONS[notif.type] ?? "🔔"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-strong)", marginBottom: 3 }}>
                  {notif.title}
                </div>
                {notif.body && (
                  <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.4, marginBottom: 4 }}>
                    {notif.body}
                  </div>
                )}
                <div style={{ fontSize: 12, color: "var(--text-faint)" }}>
                  {timeAgo(notif.createdAt)}
                </div>
              </div>
              {!notif.readAt && (
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand)", flexShrink: 0, marginTop: 4 }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
