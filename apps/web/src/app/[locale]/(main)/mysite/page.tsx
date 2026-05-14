"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { api, resolveMedia } from "../../../../lib/api/client";

type PromoDto = {
  id: string;
  title: string;
  description: string;
  hlsManifestPath: string | null;
  thumbnailPath: string | null;
  sourcePath: string | null;
  durationSeconds: number | null;
  isShareable: boolean;
  shareToken: string | null;
  shareUrl?: string;
};

export default function MySitePage() {
  const t = useTranslations("mysite");
  const [videos, setVideos] = useState<PromoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    api.get<PromoDto[]>("/me/promo-videos").then(setVideos).finally(() => setLoading(false));
  }, []);

  const promo = videos[0] ?? null;

  async function toggleShare() {
    if (!promo) return;
    const endpoint = promo.isShareable
      ? `/me/promo-videos/${promo.id}/disable-sharing`
      : `/me/promo-videos/${promo.id}/enable-sharing`;
    const updated = await api.post<PromoDto>(endpoint);
    setVideos((prev) => prev.map((v) => (v.id === promo.id ? updated : v)));
  }

  async function copyLink() {
    if (!promo?.shareToken) return;
    const url = `${window.location.origin}/share/promo/${promo.shareToken}`;
    await navigator.clipboard.writeText(url).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    if (!promo || !videoRef.current) return;
    let hls: { destroy: () => void } | null = null;

    if (promo.hlsManifestPath) {
      const url = resolveMedia(promo.hlsManifestPath);
      if (url) {
        import("hls.js").then(({ default: Hls }) => {
          if (Hls.isSupported() && videoRef.current) {
            const h = new Hls();
            hls = h;
            h.loadSource(url);
            h.attachMedia(videoRef.current);
          } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
            videoRef.current.src = url;
          }
        });
      }
    } else if (promo.sourcePath && videoRef.current) {
      videoRef.current.src = resolveMedia(promo.sourcePath) ?? "";
    }

    return () => { hls?.destroy(); };
  }, [promo]);

  return (
    <div className="content-inner" style={{ maxWidth: 800 }}>
      <h1 className="page-title" style={{ marginBottom: 6 }}>{t("title")}</h1>
      <p style={{ color: "var(--text-dim)", fontSize: 14, marginBottom: 28 }}>{t("subtitle")}</p>

      {loading ? (
        <div style={{ color: "var(--text-faint)", fontSize: 13 }}>Yuklanmoqda...</div>
      ) : !promo ? (
        <div
          style={{
            background: "var(--bg-elev)",
            border: "1px dashed var(--border-strong)",
            borderRadius: "var(--r-xl)",
            padding: "60px 40px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 16 }}>🎥</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "var(--text-strong)" }}>
            {t("noVideo")}
          </h2>
          <p style={{ color: "var(--text-dim)", fontSize: 14, margin: 0 }}>{t("noVideoHint")}</p>
        </div>
      ) : (
        <div>
          {/* Video player */}
          <div
            style={{
              background: "#000",
              borderRadius: "var(--r-lg)",
              overflow: "hidden",
              marginBottom: 20,
              aspectRatio: "16 / 9",
            }}
          >
            <video
              ref={videoRef}
              controls
              playsInline
              style={{ width: "100%", height: "100%", display: "block" }}
              poster={resolveMedia(promo.thumbnailPath) ?? undefined}
            />
          </div>

          <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700, color: "var(--text-strong)" }}>
            {promo.title}
          </h2>
          {promo.description && (
            <p style={{ color: "var(--text-dim)", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
              {promo.description}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn btn-secondary" onClick={toggleShare}>
              {promo.isShareable ? t("disableShare") : t("enableShare")}
            </button>
            {promo.isShareable && promo.shareToken && (
              <button type="button" className="btn btn-secondary" onClick={copyLink}>
                {copied ? "✓ " + t("shareLink") : t("share") + " 🔗"}
              </button>
            )}
          </div>

          {promo.isShareable && promo.shareToken && (
            <div
              style={{
                marginTop: 16,
                padding: "10px 14px",
                background: "var(--bg-elev)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-md)",
                fontSize: 13,
                color: "var(--text-dim)",
                wordBreak: "break-all",
              }}
            >
              {window?.location?.origin ?? "https://biznesjon.uz"}/share/promo/{promo.shareToken}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
