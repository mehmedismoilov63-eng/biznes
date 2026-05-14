"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, resolveMedia } from "../../../../../lib/api/client";

type PromoDto = {
  id: string;
  title: string;
  description: string;
  hlsManifestPath: string | null;
  thumbnailPath: string | null;
  sourcePath: string | null;
  durationSeconds: number | null;
};

export default function SharePromoPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? "";
  const [promo, setPromo] = useState<PromoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    api.get<PromoDto>(`/share/promo/${token}`)
      .then(setPromo)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

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
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
        <div className="sidebar-brand-mark">B</div>
        <span style={{ fontWeight: 700, fontSize: 18, color: "var(--text-strong)" }}>Biznesjon</span>
      </div>

      {loading ? (
        <div style={{ color: "var(--text-faint)" }}>Yuklanmoqda...</div>
      ) : error ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
          <h2 style={{ color: "var(--text-strong)", marginBottom: 8 }}>Video topilmadi</h2>
          <p style={{ color: "var(--text-dim)", fontSize: 14 }}>
            Bu havola mavjud emas yoki ulashish o'chirilgan.
          </p>
        </div>
      ) : promo ? (
        <div style={{ width: "min(780px, 100%)" }}>
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
          <h1 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 700, color: "var(--text-strong)" }}>
            {promo.title}
          </h1>
          {promo.description && (
            <p style={{ color: "var(--text-dim)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              {promo.description}
            </p>
          )}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "var(--text-faint)" }}>
              Biznesjon platformasida nashr etilgan
            </span>
            <a href="/" className="btn btn-secondary btn-sm">
              Biznesjon haqida →
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
