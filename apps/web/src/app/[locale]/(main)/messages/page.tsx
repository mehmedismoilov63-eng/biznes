"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, resolveMedia } from "../../../../lib/api/client";

type PersonDto = {
  id: string;
  name: string;
  username: string;
  avatarPath: string | null;
  online: boolean;
};

type ThreadDto = {
  id: string;
  user: PersonDto;
  lastMessage: string;
  unread: number;
};

type ReactionDto = { emoji: string; count: number; byMe: boolean };

type MessageDto = {
  id: string;
  from: "me" | "them";
  type: string;
  text: string | null;
  mediaPath?: string | null;
  replyToId?: string | null;
  replyToText?: string | null;
  replyToSender?: string | null;
  reactions: ReactionDto[];
  time: string;
  createdAt: string;
};

type ThreadDetail = {
  id: string;
  user: PersonDto;
  messages: MessageDto[];
};


function Avatar({ person, size = 40 }: { person: PersonDto; size?: number }) {
  const initials = person.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const colorIdx = person.name.charCodeAt(0) % 8;
  return (
    <div className={`av av-c${colorIdx}${person.online ? " av-online" : ""}`} style={{ width: size, height: size, fontSize: size * 0.36, flexShrink: 0 }}>
      {person.avatarPath ? (
        <img className="av-img" src={resolveMedia(person.avatarPath)} alt={person.name} />
      ) : initials}
    </div>
  );
}

/* ── Message renderers ── */
function AudioMessage({ src, isMe }: { src: string; isMe: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 200 }}>
      <audio
        ref={audioRef}
        src={src}
        onEnded={() => { setPlaying(false); setProgress(0); }}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          setProgress(a.duration ? a.currentTime / a.duration : 0);
          setDuration(a.duration || 0);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
      />
      <button
        type="button"
        onClick={togglePlay}
        style={{ width: 36, height: 36, borderRadius: "50%", background: isMe ? "rgba(255,255,255,0.25)" : "var(--brand)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
        )}
      </button>
      {/* Waveform bar */}
      <div style={{ flex: 1, position: "relative", height: 28, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 2 }}>
          {Array.from({ length: 28 }, (_, i) => {
            const h = 6 + Math.sin(i * 0.9 + 1.2) * 5 + Math.sin(i * 0.4) * 4;
            const filled = i / 28 <= progress;
            return (
              <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: filled ? (isMe ? "rgba(255,255,255,0.9)" : "var(--brand)") : (isMe ? "rgba(255,255,255,0.3)" : "var(--border-strong)"), flexShrink: 0 }} />
            );
          })}
        </div>
      </div>
      <span style={{ fontSize: 11, opacity: 0.7, flexShrink: 0 }}>
        {duration ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, "0")}` : "0:00"}
      </span>
    </div>
  );
}

function VideoNoteMessage({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (playing) { v.pause(); setPlaying(false); }
    else { v.play(); setPlaying(true); }
  }

  return (
    <div style={{ position: "relative", width: 180, height: 180, borderRadius: "50%", overflow: "hidden", cursor: "pointer", flexShrink: 0 }} onClick={toggle}>
      <video
        ref={videoRef}
        src={src}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        loop
        playsInline
        onEnded={() => setPlaying(false)}
      />
      {!playing && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(139,92,246,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
          </div>
        </div>
      )}
      {/* Ring border */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid rgba(139,92,246,0.7)", pointerEvents: "none" }} />
    </div>
  );
}

function ImageMessage({ src }: { src: string }) {
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", maxWidth: 280 }}>
      <img src={src} alt="media" style={{ width: "100%", display: "block", borderRadius: 12 }} />
    </div>
  );
}

function VideoMessage({ src }: { src: string }) {
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", maxWidth: 280 }}>
      <video src={src} controls style={{ width: "100%", display: "block", borderRadius: 12 }} />
    </div>
  );
}

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉", "😡", "🙏"];

function MessageBubble({ msg, onMenu, onReact }: {
  msg: MessageDto;
  onMenu: (x: number, y: number, msg: MessageDto) => void;
  onReact: (msgId: string, emoji: string) => void;
}) {
  const isMe = msg.from === "me";
  const src = resolveMedia(msg.mediaPath);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  function handleContextMenu(e: React.MouseEvent) { e.preventDefault(); onMenu(e.clientX, e.clientY, msg); }
  function handlePointerDown(e: React.PointerEvent) { pressTimer.current = setTimeout(() => onMenu(e.clientX, e.clientY, msg), 500); }
  function cancelPress() { if (pressTimer.current) clearTimeout(pressTimer.current); }

  function scrollToReply() {
    if (!msg.replyToId) return;
    const el = document.getElementById(`msg-${msg.replyToId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("msg-highlight");
    setTimeout(() => el.classList.remove("msg-highlight"), 1500);
  }

  const isVidNote = msg.type === "VIDEO_NOTE";
  const bubbleStyle: React.CSSProperties = {
    maxWidth: "72%",
    padding: isVidNote ? 0 : "8px 12px",
    borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
    background: isVidNote ? "transparent" : (isMe ? "var(--brand-strong)" : "var(--bg-elev-2)"),
    color: isMe ? "white" : "var(--text)",
    fontSize: 14, lineHeight: 1.45,
    boxShadow: isVidNote ? "none" : "0 1px 3px rgba(0,0,0,0.12)",
    cursor: "default", userSelect: "text",
  };

  return (
    <div id={`msg-${msg.id}`} style={{ marginBottom: 8 }}>
      <div
        style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 6 }}
        onContextMenu={handleContextMenu}
        onPointerDown={handlePointerDown}
        onPointerUp={cancelPress}
        onPointerMove={cancelPress}
      >
        <div style={bubbleStyle}>
          {/* Reply quote — clickable */}
          {msg.replyToId && !isVidNote && (
            <div
              onClick={scrollToReply}
              style={{ cursor: "pointer", borderLeft: `3px solid ${isMe ? "rgba(255,255,255,0.5)" : "var(--brand)"}`, padding: "4px 8px", marginBottom: 6, borderRadius: "0 4px 4px 0", background: isMe ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.05)" }}
            >
              {msg.replyToSender && <div style={{ fontSize: 11, fontWeight: 700, color: isMe ? "rgba(255,255,255,0.9)" : "var(--brand)", marginBottom: 1 }}>{msg.replyToSender}</div>}
              <div style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220, opacity: 0.85 }}>{msg.replyToText || "📎 Media"}</div>
            </div>
          )}
          {msg.type === "VOICE" && src && <AudioMessage src={src} isMe={isMe} />}
          {msg.type === "VIDEO_NOTE" && src && <VideoNoteMessage src={src} />}
          {msg.type === "IMAGE" && src && <ImageMessage src={src} />}
          {msg.type === "VIDEO" && src && <VideoMessage src={src} />}
          {(msg.type === "TEXT" || !msg.mediaPath) && msg.text && <span>{msg.text}</span>}
          {!isVidNote && <div style={{ fontSize: 11, opacity: 0.55, marginTop: msg.type === "TEXT" ? 3 : 6, textAlign: "right" }}>{msg.time}</div>}
        </div>
      </div>

      {/* Reactions row */}
      <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", flexWrap: "wrap", gap: 4, marginTop: 3, paddingRight: isMe ? 0 : 0, position: "relative" }}>
        {(msg.reactions ?? []).map((r) => (
          <button key={r.emoji} type="button" onClick={() => onReact(msg.id, r.emoji)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 12, border: `1px solid ${r.byMe ? "var(--brand)" : "var(--border)"}`, background: r.byMe ? "var(--brand-tint)" : "var(--bg-elev-2)", cursor: "pointer", fontSize: 13, lineHeight: 1 }}>
            <span>{r.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: r.byMe ? "var(--brand)" : "var(--text-dim)" }}>{r.count}</span>
          </button>
        ))}
        {/* + emoji picker button */}
        <button type="button" onClick={() => setShowPicker((p) => !p)} style={{ width: 26, height: 26, borderRadius: 13, border: "1px solid var(--border)", background: "var(--bg-elev-2)", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-faint)" }}>
          {showPicker ? "×" : "+"}
        </button>
        {showPicker && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 149 }} onClick={() => setShowPicker(false)} />
            <div style={{ position: "absolute", [isMe ? "right" : "left"]: 0, bottom: "calc(100% + 6px)", zIndex: 150, background: "var(--bg-elev)", border: "1px solid var(--border)", borderRadius: 14, padding: 8, display: "flex", flexWrap: "wrap", gap: 4, width: 218, boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
              {QUICK_EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => { onReact(msg.id, e); setShowPicker(false); }} style={{ width: 34, height: 34, border: "none", background: "none", cursor: "pointer", fontSize: 20, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.1s" }}
                  onMouseEnter={(el) => (el.currentTarget.style.background = "var(--bg-elev-2)")}
                  onMouseLeave={(el) => (el.currentTarget.style.background = "none")}>
                  {e}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Recording hooks ── */
function useVoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        setBlob(new Blob(chunksRef.current, { type: "audio/webm" }));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      // mic not available
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  }

  function clearBlob() { setBlob(null); }

  return { recording, blob, startRecording, stopRecording, clearBlob };
}

function useVideoNoteRecorder() {
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  async function start(previewEl: HTMLVideoElement) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300, facingMode: "user" }, audio: true });
      streamRef.current = stream;
      previewEl.srcObject = stream;
      previewEl.play();
      videoPreviewRef.current = previewEl;
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const b = new Blob(chunksRef.current, { type: "video/webm" });
        setBlob(b);
        setPreview(URL.createObjectURL(b));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      // camera not available
    }
  }

  function stop() {
    recorderRef.current?.stop();
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
    setRecording(false);
  }

  function clear() { setBlob(null); if (preview) { URL.revokeObjectURL(preview); setPreview(null); } }

  return { recording, blob, preview, start, stop, clear };
}

/* ── Main page ── */
export default function MessagesPage() {
  const t = useTranslations("messages");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const withUserId = searchParams.get("with");

  const [threads, setThreads] = useState<ThreadDto[]>([]);
  const [activeThread, setActiveThread] = useState<ThreadDetail | null>(null);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showVideoNote, setShowVideoNote] = useState(false);
  const [replyTo, setReplyTo] = useState<MessageDto | null>(null);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; msg: MessageDto } | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);

  const filteredThreads = searchQ.trim()
    ? threads.filter((t) => t.user.name.toLowerCase().includes(searchQ.toLowerCase()))
    : threads;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const openedWithRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoCamRef = useRef<HTMLVideoElement>(null);

  const voice = useVoiceRecorder();
  const vidNote = useVideoNoteRecorder();

  function refreshThreads() {
    api.get<ThreadDto[]>("/messages/threads").then(setThreads).catch(() => {});
  }

  useEffect(() => {
    api.get<ThreadDto[]>("/messages/threads").then(setThreads).finally(() => setLoadingThreads(false));
    const p = setInterval(refreshThreads, 5000);
    return () => clearInterval(p);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (!withUserId || openedWithRef.current === withUserId) return;
    openedWithRef.current = withUserId;
    openThread(withUserId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withUserId]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!activeThread) return;
    pollRef.current = setInterval(async () => {
      try {
        const detail = await api.get<ThreadDetail>(`/messages/threads/${activeThread.id}`);
        setActiveThread((prev) => {
          if (!prev) return detail;
          if (prev.messages.at(-1)?.id === detail.messages.at(-1)?.id) return prev;
          return { ...prev, messages: detail.messages };
        });
      } catch { /* ignore */ }
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeThread?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages.length]);

  const openThread = useCallback(async (id: string) => {
    setLoadingMessages(true);
    setSendError(null);
    try {
      const detail = await api.get<ThreadDetail>(`/messages/threads/${id}`);
      setActiveThread(detail);
      // Mark messages as read and clear unread badge
      api.post(`/messages/threads/${id}/read`, {}).catch(() => {});
      setThreads((prev) => prev.map((t) => t.id === id ? { ...t, unread: 0 } : t));
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  async function sendText() {
    if (!text.trim() || !activeThread || sending) return;
    const msg = text.trim();
    const replyId = replyTo?.id ?? null;
    setText("");
    setReplyTo(null);
    setSendError(null);
    setSending(true);
    try {
      const sent = await api.post<MessageDto>(`/messages/threads/${activeThread.id}`, { text: msg, type: "TEXT", replyToId: replyId });
      appendMessage(sent, msg);
    } catch (err: unknown) {
      setText(msg);
      const e = err as { message?: string };
      setSendError(e?.message ?? "Xabar yuborishda xato");
    } finally {
      setSending(false);
    }
  }

  async function uploadAndSend(blob: Blob, type: "VOICE" | "VIDEO_NOTE" | "IMAGE" | "VIDEO") {
    if (!activeThread) return;
    const replyId = replyTo?.id ?? null;
    setReplyTo(null);
    setSendError(null);
    setSending(true);
    try {
      const ext = type === "VOICE" ? "webm" : type === "VIDEO_NOTE" ? "webm" : blob.type.includes("png") ? "png" : blob.type.includes("gif") ? "gif" : "jpg";
      const mime = blob.type || (type === "VOICE" ? "audio/webm" : "video/webm");
      const file = new File([blob], `media.${ext}`, { type: mime });
      const { path } = await api.upload("/uploads/message-media", file);
      const sent = await api.post<MessageDto>(`/messages/threads/${activeThread.id}`, {
        type,
        mediaPath: path,
        text: null,
        replyToId: replyId,
      });
      appendMessage(sent, type.toLowerCase());
    } catch (err: unknown) {
      const e = err as { message?: string };
      setSendError(e?.message ?? "Media yuborishda xato");
    } finally {
      setSending(false);
    }
  }

  async function deleteMessage(msgId: string) {
    try {
      await api.delete(`/messages/${msgId}`);
      setActiveThread((prev) => prev ? { ...prev, messages: prev.messages.filter((m) => m.id !== msgId) } : prev);
    } catch { /* ignore */ }
  }

  function handleReact(msgId: string, emoji: string) {
    setActiveThread((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: prev.messages.map((m) => {
          if (m.id !== msgId) return m;
          const cur = m.reactions ?? [];
          const existing = cur.find((r) => r.emoji === emoji);
          let reactions: ReactionDto[];
          if (existing) {
            reactions = existing.byMe
              ? cur.map((r) => r.emoji === emoji ? { ...r, count: r.count - 1, byMe: false } : r).filter((r) => r.count > 0)
              : cur.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1, byMe: true } : r);
          } else {
            reactions = [...cur, { emoji, count: 1, byMe: true }];
          }
          return { ...m, reactions };
        }),
      };
    });
    api.post(`/messages/${msgId}/reactions`, { emoji }).catch(() => {});
  }

  function appendMessage(sent: MessageDto, preview: string) {
    setActiveThread((prev) => prev ? { ...prev, messages: [...prev.messages, sent] } : prev);
    setThreads((prev) => {
      const exists = prev.find((t) => t.id === activeThread?.id);
      if (exists) return prev.map((t) => t.id === activeThread?.id ? { ...t, lastMessage: preview } : t);
      if (!activeThread) return prev;
      return [{ id: activeThread.id, user: activeThread.user, lastMessage: preview, unread: 0 }, ...prev];
    });
  }

  async function handleVoiceSend() {
    if (!voice.blob) return;
    const b = voice.blob;
    voice.clearBlob();
    await uploadAndSend(b, "VOICE");
  }

  async function handleVideoNoteSend() {
    if (!vidNote.blob) return;
    const b = vidNote.blob;
    vidNote.clear();
    setShowVideoNote(false);
    await uploadAndSend(b, "VIDEO_NOTE");
  }

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !activeThread) return;
    e.target.value = "";
    const type: "IMAGE" | "VIDEO" = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";
    setSending(true);
    try {
      const { path } = await api.upload("/uploads/message-media", file);
      const sent = await api.post<MessageDto>(`/messages/threads/${activeThread.id}`, { type, mediaPath: path, text: null });
      appendMessage(sent, type.toLowerCase());
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <style>{`
        .thread-item { width:100%; display:flex; align-items:center; gap:12px; padding:10px 14px; background:transparent; border:none; text-align:left; cursor:pointer; transition:background 0.12s; }
        .thread-item:hover { background:var(--bg-elev-2); }
        .thread-item.ti-active { background:var(--brand-tint); }
        .thread-item.ti-active .ti-name { color:var(--brand); }
        .media-btn { width:34px; height:34px; border-radius:50%; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.15s; }
        .media-btn:hover { filter:brightness(1.15); }
        .vid-note-wrap { position:fixed; inset:0; z-index:200; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; }
        .vid-note-inner { background:var(--bg-elev); border-radius:24px; padding:28px; display:flex; flex-direction:column; align-items:center; gap:20px; width:320px; }
        .vid-cam-circle { width:240px; height:240px; border-radius:50%; overflow:hidden; background:#000; border:4px solid var(--brand); position:relative; }
        .record-ring { width:240px; height:240px; border-radius:50%; border:4px solid var(--brand); position:absolute; inset:0; animation:ring-pulse 1.2s ease-in-out infinite; pointer-events:none; }
        @keyframes ring-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.06)} }
        @keyframes recPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes msgHighlight { 0%{background:rgba(139,92,246,0.22)} 100%{background:transparent} }
        .msg-highlight { animation:msgHighlight 1.5s ease-out; border-radius:12px; }
        .ctx-menu { position:fixed; z-index:400; background:var(--bg-elev); border:1px solid var(--border); border-radius:12px; padding:4px 0; min-width:160px; box-shadow:0 8px 30px rgba(0,0,0,0.18); }
        .ctx-item { width:100%; display:flex; align-items:center; gap:10px; padding:9px 14px; background:none; border:none; cursor:pointer; font-size:13.5px; color:var(--text); text-align:left; transition:background 0.1s; }
        .ctx-item:hover { background:var(--bg-elev-2); }
        .ctx-item.danger { color:var(--error,#ef4444); }
        .reply-bar { display:flex; align-items:center; gap:10px; padding:8px 14px; border-top:1px solid var(--border); background:var(--bg-elev); flex-shrink:0; }
        .reply-preview { flex:1; border-left:3px solid var(--brand); padding-left:8px; }
        .msg-search-input { width:100%; background:var(--bg-elev-2); border:1px solid var(--border); border-radius:10px; padding:7px 10px 7px 30px; font-size:13px; color:var(--text-strong); outline:none; box-sizing:border-box; transition:border-color 0.15s; }
        .msg-search-input:focus { border-color:var(--brand); }
        .msg-icon-btn { width:30px; height:30px; border-radius:8px; background:none; border:1px solid var(--border); cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--text-dim); transition:background 0.12s; }
        .msg-icon-btn:hover { background:var(--bg-elev-2); }
        .msg-hdr-btn { width:32px; height:32px; border-radius:8px; background:none; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--text-dim); transition:background 0.12s; }
        .msg-hdr-btn:hover { background:var(--bg-elev-2); }
        .chat-bg { background-image:radial-gradient(circle at 1px 1px, rgba(99,102,241,0.04) 1px, transparent 0); background-size:24px 24px; }
      `}</style>

      <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>

        {/* ── LEFT PANEL: thread list ── */}
        <div style={{ width: 300, flexShrink: 0, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg-base)" }}>
          {/* Panel header */}
          <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-strong)", letterSpacing: "-0.015em" }}>{t("title")}</span>
              <button type="button" className="msg-icon-btn" title="Yangi xabar" onClick={() => router.push(`/${locale}/people`)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", pointerEvents: "none" }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="text" className="msg-search-input" placeholder="Qidirish..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} />
            </div>
          </div>

          {/* Thread list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loadingThreads ? (
              <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 2 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
                    <div className="skeleton" style={{ width: 46, height: 46, borderRadius: "50%", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton skeleton-text lg" style={{ width: "55%", marginBottom: 6 }} />
                      <div className="skeleton skeleton-text" style={{ width: "78%" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredThreads.length === 0 ? (
              <div style={{ padding: "52px 20px 36px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", marginBottom: 14, background: "radial-gradient(circle at 38% 32%, rgba(99,102,241,0.18) 0%, transparent 70%), var(--bg-elev)", border: "1.5px solid var(--brand-tint-strong)", display: "grid", placeItems: "center", boxShadow: "0 0 24px rgba(99,102,241,0.1)", color: "var(--brand)" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text-strong)", marginBottom: 5 }}>
                  {searchQ ? "Topilmadi" : "Suhbatlar yo'q"}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-dim)", lineHeight: 1.6, maxWidth: 200 }}>
                  {searchQ ? "Boshqa nom bilan qidiring" : "Tadbirkorlar sahifasidan birovga xabar yuboring"}
                </div>
              </div>
            ) : filteredThreads.map((thread) => {
              const isActive = activeThread?.id === thread.id;
              return (
                <button key={thread.id} type="button" className={`thread-item${isActive ? " ti-active" : ""}`} onClick={() => openThread(thread.id)}>
                  <Avatar person={thread.user} size={46} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 3 }}>
                      <span className="ti-name" style={{ fontWeight: 600, fontSize: 14, color: isActive ? "var(--brand)" : "var(--text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 155 }}>
                        {thread.user.name}
                      </span>
                      {thread.unread > 0 && <span style={{ fontSize: 10, color: "var(--brand)", flexShrink: 0, marginLeft: 4 }}>●</span>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                      <span style={{ fontSize: 13, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {thread.lastMessage}
                      </span>
                      {thread.unread > 0 && (
                        <span style={{ background: "var(--brand-strong)", color: "#fff", borderRadius: 999, minWidth: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, padding: "0 6px" }}>
                          {thread.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        {activeThread ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

            {/* Chat header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid var(--border)", flexShrink: 0, background: "var(--bg-base)" }}>
              <button type="button" className="msg-hdr-btn" onClick={() => { setActiveThread(null); setSendError(null); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <Avatar person={activeThread.user} size={38} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: "var(--text-strong)", letterSpacing: "-0.015em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {activeThread.user.name}
                </div>
                <div style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 5, color: activeThread.user.online ? "#22c55e" : "var(--text-faint)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: activeThread.user.online ? "#22c55e" : "var(--border-strong)", display: "inline-block", flexShrink: 0 }} />
                  {activeThread.user.online ? "Onlayn" : "Offlayn"}
                </div>
              </div>
              <button type="button" className="msg-hdr-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
              <button type="button" className="msg-hdr-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
                </svg>
              </button>
            </div>

            {/* Messages area */}
            <div className="chat-bg" style={{ flex: 1, overflowY: "auto", padding: "16px 20px 8px", display: "flex", flexDirection: "column" }}>
              {loadingMessages ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px 0" }}>
                  {[140, 220, 180, 260, 160].map((w, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: i % 2 === 0 ? "flex-end" : "flex-start" }}>
                      <div className="skeleton" style={{ width: w, height: 38, borderRadius: i % 2 === 0 ? "18px 18px 4px 18px" : "18px 18px 18px 4px" }} />
                    </div>
                  ))}
                </div>
              ) : activeThread.messages.length === 0 ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-faint)" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bg-elev)", border: "1px solid var(--border)", display: "grid", placeItems: "center", color: "var(--text-faint)" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 13.5, color: "var(--text-dim)" }}>Birinchi xabarni yuboring</span>
                </div>
              ) : activeThread.messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} onMenu={(x, y, m) => setCtxMenu({ x, y, msg: m })} onReact={handleReact} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Recording indicator */}
            {voice.recording && (
              <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border)", background: "var(--bg-elev)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", animation: "recPulse 1s ease-in-out infinite" }} />
                <span style={{ fontSize: 13, color: "var(--text-dim)", flex: 1 }}>Yozilmoqda...</span>
                <button type="button" className="btn btn-danger btn-sm" onClick={voice.stopRecording}>■ To'xtatish</button>
              </div>
            )}

            {/* Voice preview */}
            {voice.blob && !voice.recording && (
              <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border)", background: "var(--bg-elev)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <AudioMessage src={URL.createObjectURL(voice.blob)} isMe={false} />
                <button type="button" className="btn btn-primary btn-sm" onClick={handleVoiceSend} disabled={sending}>
                  {sending ? "..." : "Yuborish"}
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={voice.clearBlob}>✕</button>
              </div>
            )}

            {/* Reply bar */}
            {replyTo && (
              <div className="reply-bar">
                <div className="reply-preview">
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand)", marginBottom: 1 }}>
                    {replyTo.from === "me" ? "O'zingiz" : activeThread.user.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {replyTo.text || "📎 Media"}
                  </div>
                </div>
                <button type="button" onClick={() => setReplyTo(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: 18, lineHeight: 1 }}>×</button>
              </div>
            )}

            {/* Error banner */}
            {sendError && (
              <div style={{ padding: "8px 16px", background: "rgba(239,68,68,0.08)", borderTop: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{ fontSize: 12.5, color: "#ef4444", flex: 1 }}>{sendError}</span>
                <button type="button" onClick={() => setSendError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
              </div>
            )}

            {/* Input bar */}
            <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, background: "var(--bg-base)", flexShrink: 0 }}>
              <button type="button" className="media-btn" style={{ background: "var(--bg-elev-2)" }} onClick={() => fileInputRef.current?.click()} title="Rasm yoki video">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={handleFilePick} />

              <button type="button" className="media-btn" style={{ background: "var(--bg-elev-2)" }} onClick={() => setShowVideoNote(true)} title="Aylanacha video">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>
                </svg>
              </button>

              <input
                type="text"
                placeholder={t("typePlaceholder")}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(); } }}
                style={{ flex: 1, background: "var(--bg-elev)", border: "1px solid var(--border-strong)", borderRadius: 22, padding: "9px 16px", color: "var(--text-strong)", fontSize: 14, outline: "none" }}
              />

              {text.trim() ? (
                <button type="button" className="media-btn" style={{ background: "var(--brand)", width: 40, height: 40 }} onClick={sendText} disabled={sending}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              ) : (
                <button type="button" className="media-btn"
                  style={{ background: voice.recording ? "#ef4444" : "var(--brand)", width: 40, height: 40 }}
                  onClick={() => voice.recording ? voice.stopRecording() : voice.startRecording()}
                  title={voice.recording ? "To'xtatish" : "Ovozli xabar"}
                >
                  {voice.recording ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* No active thread — welcome placeholder */
          <div className="chat-bg" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: 40, background: "var(--bg-base)" }}>
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "radial-gradient(circle at 38% 32%, rgba(99,102,241,0.22) 0%, rgba(139,92,246,0.08) 55%, transparent 80%), var(--bg-elev)",
              border: "1.5px solid var(--brand-tint-strong)",
              display: "grid", placeItems: "center",
              boxShadow: "0 0 0 16px rgba(99,102,241,0.05), 0 0 0 32px rgba(99,102,241,0.025), 0 8px 32px rgba(0,0,0,0.12)",
              color: "var(--brand)",
            }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: "var(--text-strong)", marginBottom: 8, letterSpacing: "-0.025em" }}>
                Suhbat tanlang
              </div>
              <div style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.65, maxWidth: 260 }}>
                Chap paneldan suhbat tanlang yoki Tadbirkorlar sahifasidan yangi muloqot boshlang
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Context menu ── */}
      {ctxMenu && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 399 }} onClick={() => setCtxMenu(null)} />
          <div
            className="ctx-menu"
            style={{
              left: Math.min(ctxMenu.x, (typeof window !== "undefined" ? window.innerWidth : 800) - 170),
              top: Math.min(ctxMenu.y, (typeof window !== "undefined" ? window.innerHeight : 600) - 130),
            }}
          >
            <button className="ctx-item" type="button" onClick={() => { setReplyTo(ctxMenu.msg); setCtxMenu(null); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
              Javob berish
            </button>
            {ctxMenu.msg.text && (
              <button className="ctx-item" type="button" onClick={() => { navigator.clipboard.writeText(ctxMenu.msg.text!); setCtxMenu(null); }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Nusxa olish
              </button>
            )}
            {ctxMenu.msg.from === "me" && (
              <button className="ctx-item danger" type="button" onClick={() => { deleteMessage(ctxMenu.msg.id); setCtxMenu(null); }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                O'chirish
              </button>
            )}
          </div>
        </>
      )}

      {/* ── Video note modal ── */}
      {showVideoNote && (
        <div className="vid-note-wrap" onClick={(e) => { if (e.target === e.currentTarget) { vidNote.stop(); vidNote.clear(); setShowVideoNote(false); } }}>
          <div className="vid-note-inner">
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-strong)" }}>Aylanacha video xabar</div>

            {!vidNote.blob ? (
              <>
                {/* Camera preview */}
                <div className="vid-cam-circle">
                  <video ref={videoCamRef} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} autoPlay muted playsInline />
                  {vidNote.recording && <div className="record-ring" />}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  {!vidNote.recording ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => videoCamRef.current && vidNote.start(videoCamRef.current)}
                    >
                      ● Yozishni boshlash
                    </button>
                  ) : (
                    <button type="button" className="btn btn-danger" onClick={vidNote.stop}>
                      ■ To'xtatish
                    </button>
                  )}
                  <button type="button" className="btn btn-secondary" onClick={() => { vidNote.stop(); setShowVideoNote(false); }}>Bekor</button>
                </div>
              </>
            ) : (
              <>
                {/* Preview recorded video */}
                <div className="vid-cam-circle">
                  {vidNote.preview && <video src={vidNote.preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} autoPlay loop muted />}
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button type="button" className="btn btn-primary" onClick={handleVideoNoteSend} disabled={sending}>
                    {sending ? "Yuklanmoqda..." : "Yuborish"}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => { vidNote.clear(); }}>Qayta yozish</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
