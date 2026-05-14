"use client";

import { useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, resolveMedia } from "../../../../../lib/api/client";

type LessonDto = {
  id: string;
  title: string;
  description: string;
  duration: string;
  durationSeconds: number;
  views: number;
  progress: number;
  positionSeconds: number;
  thumbnailPath: string | null;
  hlsManifestPath: string | null;
  sourcePath: string | null;
  author: string;
};

export default function LessonPlayerPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const locale = useLocale();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lesson, setLesson] = useState<LessonDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.get<LessonDto>(`/lessons/${id}`)
      .then(setLesson)
      .catch(() => setError("Dars topilmadi"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!lesson || !videoRef.current) return;
    if (lesson.positionSeconds > 0) {
      videoRef.current.currentTime = lesson.positionSeconds;
    }

    let hlsInstance: { destroy: () => void } | null = null;

    if (lesson.hlsManifestPath) {
      const manifestUrl = resolveMedia(lesson.hlsManifestPath);
      if (manifestUrl) {
        import("hls.js").then(({ default: Hls }) => {
          if (Hls.isSupported() && videoRef.current) {
            const hls = new Hls();
            hlsInstance = hls;
            hls.loadSource(manifestUrl);
            hls.attachMedia(videoRef.current);
          } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
            videoRef.current.src = manifestUrl;
          }
        });
      }
    } else if (lesson.sourcePath && videoRef.current) {
      videoRef.current.src = resolveMedia(lesson.sourcePath) ?? "";
    }

    return () => {
      hlsInstance?.destroy();
    };
  }, [lesson]);

  const saveProgress = useCallback(() => {
    if (!videoRef.current || !lesson) return;
    const pos = Math.floor(videoRef.current.currentTime);
    if (pos < 5) return;
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      api.post(`/lessons/${lesson.id}/progress`, { positionSeconds: pos }).catch(() => null);
    }, 2000);
  }, [lesson]);

  if (loading) {
    return (
      <div className="content-inner">
        <div style={{ color: "var(--text-faint)", fontSize: 13 }}>Yuklanmoqda...</div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="content-inner">
        <p style={{ color: "var(--error)" }}>{error ?? "Dars topilmadi"}</p>
        <button className="btn btn-secondary" onClick={() => router.back()}>← Orqaga</button>
      </div>
    );
  }

  return (
    <div className="content-inner" style={{ maxWidth: 900 }}>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => router.back()}
        style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}
      >
        ← Orqaga
      </button>

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
          onTimeUpdate={saveProgress}
          poster={resolveMedia(lesson.thumbnailPath) ?? undefined}
        />
      </div>

      <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-strong)" }}>
        {lesson.title}
      </h1>
      <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-dim)", marginBottom: 16 }}>
        <span>{lesson.author}</span>
        <span>•</span>
        <span>{lesson.duration}</span>
        <span>•</span>
        <span>{lesson.views} ko'rishlar</span>
      </div>
      {lesson.description && (
        <p style={{ color: "var(--text-dim)", fontSize: 14, lineHeight: 1.6 }}>{lesson.description}</p>
      )}
    </div>
  );
}
