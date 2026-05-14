"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, resolveMedia } from "../../../../../lib/api/client";

type GroupDto = {
  id: string; name: string; description: string | null;
  visibility: string; members: number; joined: boolean;
  avatarPath: string | null; myRole: string | null;
};
type ReactionDto = { emoji: string; count: number; byMe: boolean };
type MessageDto = {
  id: string; from: "me" | "them"; senderName: string | null;
  type: string; text: string | null; mediaPath?: string | null;
  replyToId?: string | null; replyToText?: string | null; replyToSender?: string | null;
  reactions: ReactionDto[]; time: string;
};
type GroupMessages = { group: GroupDto; messages: MessageDto[] };
type MemberDto = { userId: string; name: string; avatarPath: string | null; role: string };
type PersonDto = { id: string; name: string; username: string; avatarPath: string | null };

const EMOJIS = ["👍","❤️","😂","😮","😢","🔥","👏","🎉","😡","🙏"];

/* ── Media ── */
function AudioMsg({ src, isMe }: { src: string; isMe: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const ref = useRef<HTMLAudioElement>(null);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 180 }}>
      <audio ref={ref} src={src} onEnded={() => { setPlaying(false); setProgress(0); }}
        onTimeUpdate={(e) => { const a = e.currentTarget; setProgress(a.duration ? a.currentTime / a.duration : 0); setDuration(a.duration || 0); }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)} />
      <button type="button" onClick={() => { const a = ref.current; if (!a) return; playing ? (a.pause(), setPlaying(false)) : (a.play(), setPlaying(true)); }}
        style={{ width: 34, height: 34, borderRadius: "50%", background: isMe ? "rgba(255,255,255,0.25)" : "var(--brand)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {playing ? <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          : <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>}
      </button>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 2, height: 28 }}>
        {Array.from({ length: 26 }, (_, i) => {
          const h = 6 + Math.sin(i * 0.9 + 1.2) * 5 + Math.sin(i * 0.4) * 3;
          return <div key={i} style={{ width: 3, height: h, borderRadius: 2, flexShrink: 0, background: i / 26 <= progress ? (isMe ? "rgba(255,255,255,0.9)" : "var(--brand)") : (isMe ? "rgba(255,255,255,0.3)" : "var(--border-strong)") }} />;
        })}
      </div>
      <span style={{ fontSize: 11, opacity: 0.7, flexShrink: 0 }}>
        {duration ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, "0")}` : "0:00"}
      </span>
    </div>
  );
}

function VideoNoteMsg({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <div style={{ width: 160, height: 160, borderRadius: "50%", overflow: "hidden", cursor: "pointer", position: "relative" }}
      onClick={() => { const v = ref.current; if (!v) return; playing ? (v.pause(), setPlaying(false)) : (v.play(), setPlaying(true)); }}>
      <video ref={ref} src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} loop playsInline onEnded={() => setPlaying(false)} />
      {!playing && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(139,92,246,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
          </div>
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "3px solid rgba(139,92,246,0.6)", pointerEvents: "none" }} />
    </div>
  );
}

/* ── Bubble ── */
function MsgBubble({ msg, onMenu, onReact }: {
  msg: MessageDto;
  onMenu: (x: number, y: number, msg: MessageDto) => void;
  onReact: (msgId: string, emoji: string) => void;
}) {
  const isMe = msg.from === "me";
  const src = resolveMedia(msg.mediaPath);
  const isVidNote = msg.type === "VIDEO_NOTE";
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleContextMenu(e: React.MouseEvent) { e.preventDefault(); onMenu(e.clientX, e.clientY, msg); }
  function handlePointerDown(e: React.PointerEvent) { pressTimer.current = setTimeout(() => onMenu(e.clientX, e.clientY, msg), 500); }
  function cancelPress() { if (pressTimer.current) clearTimeout(pressTimer.current); }
  function scrollToReply() {
    if (!msg.replyToId) return;
    const el = document.getElementById(`gmsg-${msg.replyToId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("gmsg-hl");
    setTimeout(() => el.classList.remove("gmsg-hl"), 1500);
  }

  return (
    <div id={`gmsg-${msg.id}`} style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end", gap: 6 }}
        onContextMenu={handleContextMenu} onPointerDown={handlePointerDown} onPointerUp={cancelPress} onPointerMove={cancelPress}>
        <div style={{ maxWidth: "70%", padding: isVidNote ? 0 : "8px 12px", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: isVidNote ? "transparent" : (isMe ? "var(--brand-strong)" : "var(--bg-elev-2)"), color: isMe ? "white" : "var(--text)", fontSize: 14, lineHeight: 1.45, cursor: "default" }}>
          {!isMe && msg.senderName && <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand)", marginBottom: 4 }}>{msg.senderName}</div>}
          {msg.replyToId && !isVidNote && (
            <div onClick={scrollToReply} style={{ cursor: "pointer", borderLeft: `3px solid ${isMe ? "rgba(255,255,255,0.5)" : "var(--brand)"}`, padding: "4px 8px", marginBottom: 6, borderRadius: "0 4px 4px 0", background: isMe ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.05)" }}>
              {msg.replyToSender && <div style={{ fontSize: 11, fontWeight: 700, color: isMe ? "rgba(255,255,255,0.9)" : "var(--brand)", marginBottom: 1 }}>{msg.replyToSender}</div>}
              <div style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220, opacity: 0.85 }}>{msg.replyToText || "📎 Media"}</div>
            </div>
          )}
          {msg.type === "VOICE" && src && <AudioMsg src={src} isMe={isMe} />}
          {msg.type === "VIDEO_NOTE" && src && <VideoNoteMsg src={src} />}
          {msg.type === "IMAGE" && src && <img src={src} alt="img" style={{ maxWidth: 260, borderRadius: 10, display: "block" }} />}
          {msg.type === "VIDEO" && src && <video src={src} controls style={{ maxWidth: 260, borderRadius: 10, display: "block" }} />}
          {(msg.type === "TEXT" || !msg.mediaPath) && msg.text && <span>{msg.text}</span>}
          {!isVidNote && <div style={{ fontSize: 11, opacity: 0.55, marginTop: 3, textAlign: "right" }}>{msg.time}</div>}
        </div>
      </div>
      {/* Reactions */}
      {(msg.reactions ?? []).length > 0 && (
        <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", flexWrap: "wrap", gap: 4, marginTop: 3 }}>
          {(msg.reactions ?? []).map((r) => (
            <button key={r.emoji} type="button" onClick={() => onReact(msg.id, r.emoji)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 12, border: `1px solid ${r.byMe ? "var(--brand)" : "var(--border)"}`, background: r.byMe ? "var(--brand-tint)" : "var(--bg-elev-2)", cursor: "pointer", fontSize: 13 }}>
              <span>{r.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: r.byMe ? "var(--brand)" : "var(--text-dim)" }}>{r.count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Recorders ── */
function useVoice() {
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      chunks.current = [];
      r.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
      r.onstop = () => { setBlob(new Blob(chunks.current, { type: "audio/webm" })); stream.getTracks().forEach(t => t.stop()); };
      r.start(); rec.current = r; setRecording(true);
    } catch { /* no mic */ }
  }
  function stop() { rec.current?.stop(); rec.current = null; setRecording(false); }
  function clear() { setBlob(null); }
  return { recording, blob, start, stop, clear };
}

function useVideoNote() {
  const [recording, setRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  async function start(videoEl: HTMLVideoElement) {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300, facingMode: "user" }, audio: true });
      stream.current = s; videoEl.srcObject = s; videoEl.play();
      const r = new MediaRecorder(s, { mimeType: "video/webm" });
      chunks.current = [];
      r.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
      r.onstop = () => { const b = new Blob(chunks.current, { type: "video/webm" }); setBlob(b); setPreview(URL.createObjectURL(b)); s.getTracks().forEach(t => t.stop()); };
      r.start(); rec.current = r; setRecording(true);
    } catch { /* no camera */ }
  }
  function stop() { rec.current?.stop(); rec.current = null; stream.current?.getTracks().forEach(t => t.stop()); setRecording(false); }
  function clear() { setBlob(null); if (preview) { URL.revokeObjectURL(preview); setPreview(null); } }
  return { recording, blob, preview, start, stop, clear };
}

/* ── Group Avatar ── */
function GroupAvatar({ group, size = 36, editable = false, onUploaded }: { group: GroupDto; size?: number; editable?: boolean; onUploaded?: (path: string) => void }) {
  const src = resolveMedia(group.avatarPath);
  const initials = group.name.slice(0, 1).toUpperCase();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !onUploaded) return; e.target.value = "";
    try {
      const { path } = await api.upload("/uploads/avatar", file);
      onUploaded(path);
    } catch { /* ignore */ }
  }

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,var(--brand) 0%,#7c3aed 100%)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: size * 0.4, overflow: "hidden" }}>
        {src ? <img src={src} alt={group.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
      </div>
      {editable && (
        <>
          <div onClick={() => fileRef.current?.click()} style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: 0, transition: "opacity 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")} onMouseLeave={e => (e.currentTarget.style.opacity = "0")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        </>
      )}
    </div>
  );
}

/* ── Page ── */
export default function GroupChatPage() {
  const { id } = useParams<{ id: string }>();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("messages");

  const [data, setData] = useState<GroupMessages | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [showVidNote, setShowVidNote] = useState(false);
  const [replyTo, setReplyTo] = useState<MessageDto | null>(null);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; msg: MessageDto } | null>(null);

  // Management
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"info" | "members">("info");
  const [members, setMembers] = useState<MemberDto[]>([]);
  const [showSound, setShowSound] = useState(false);
  const [muted, setMuted] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editVis, setEditVis] = useState("PUBLIC");
  const [saving, setSaving] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Add member
  const [showAddMember, setShowAddMember] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<PersonDto[]>([]);
  const [sendingInvite, setSendingInvite] = useState<string | null>(null);
  const [sentInvites, setSentInvites] = useState<Set<string>>(new Set());

  const endRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLVideoElement>(null);
  const voice = useVoice();
  const vidNote = useVideoNote();

  useEffect(() => {
    api.get<GroupMessages>(`/groups/${id}/messages`).then(setData).finally(() => setLoading(false));
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem(`grp_muted_${id}`) === "1" : false;
    setMuted(saved);
  }, [id]);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const fresh = await api.get<GroupMessages>(`/groups/${id}/messages`);
        setData((prev) => {
          if (!prev) return fresh;
          if (prev.messages.at(-1)?.id === fresh.messages.at(-1)?.id) return prev;
          return { ...prev, messages: fresh.messages };
        });
      } catch { /* ignore */ }
    }, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [id]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [data?.messages.length]);

  // User search for add member
  useEffect(() => {
    if (!showAddMember) return;
    const t = setTimeout(async () => {
      try {
        const users = await api.get<PersonDto[]>(`/users${userSearch ? `?q=${encodeURIComponent(userSearch)}` : ""}`);
        const memberIds = new Set(members.map(m => m.userId));
        setUserResults(users.filter(u => !memberIds.has(u.id)));
      } catch { setUserResults([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [userSearch, showAddMember, members]);

  function openSettings() {
    if (!data) return;
    setEditName(data.group.name);
    setEditDesc(data.group.description ?? "");
    setEditVis(data.group.visibility);
    setInviteLink(null);
    setShowSettings(true);
    setSettingsTab("info");
    api.get<MemberDto[]>(`/groups/${id}/members`).then(setMembers).catch(() => {});
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const updated = await api.patch<GroupDto>(`/groups/${id}`, { name: editName, description: editDesc, visibility: editVis });
      setData(prev => prev ? { ...prev, group: updated } : prev);
      setShowSettings(false);
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  async function generateInvite() {
    try {
      const res = await api.post<{ token: string }>(`/groups/${id}/invites`);
      setInviteLink(`${window.location.origin}/${locale}/groups/join/${res.token}`);
    } catch { /* ignore */ }
  }

  async function sendInvite(user: PersonDto) {
    if (sendingInvite) return;
    setSendingInvite(user.id);
    try {
      const res = await api.post<{ token: string }>(`/groups/${id}/invites`);
      const link = `${window.location.origin}/${locale}/groups/join/${res.token}`;
      await api.post(`/messages/threads/${user.id}`, { text: `Siz "${data?.group.name}" guruhiga taklif qilindingiz:\n${link}`, type: "TEXT" });
      setSentInvites(prev => new Set([...prev, user.id]));
    } catch { /* ignore */ } finally { setSendingInvite(null); }
  }

  async function kickMember(userId: string) {
    try {
      await api.delete(`/groups/${id}/members/${userId}`);
      setMembers(prev => prev.filter(m => m.userId !== userId));
      setData(prev => prev ? { ...prev, group: { ...prev.group, members: prev.group.members - 1 } } : prev);
    } catch { /* ignore */ }
  }

  function appendMsg(sent: MessageDto) {
    setData((prev) => prev ? { ...prev, messages: [...prev.messages, sent] } : prev);
  }

  async function sendText() {
    if (!text.trim() || sending) return;
    const msg = text.trim(); const replyId = replyTo?.id ?? null;
    setText(""); setReplyTo(null); setSending(true);
    try { appendMsg(await api.post<MessageDto>(`/groups/${id}/messages`, { text: msg, type: "TEXT", replyToId: replyId })); }
    finally { setSending(false); }
  }

  async function uploadAndSend(blob: Blob, type: "VOICE" | "VIDEO_NOTE" | "IMAGE" | "VIDEO") {
    const replyId = replyTo?.id ?? null; setReplyTo(null); setSending(true);
    try {
      const ext = type === "VOICE" ? "webm" : type === "VIDEO_NOTE" ? "webm" : blob.type.includes("png") ? "png" : "jpg";
      const file = new File([blob], `media.${ext}`, { type: blob.type || (type === "VOICE" ? "audio/webm" : "video/webm") });
      const { path } = await api.upload("/uploads/message-media", file);
      appendMsg(await api.post<MessageDto>(`/groups/${id}/messages`, { type, mediaPath: path, text: null, replyToId: replyId }));
    } finally { setSending(false); }
  }

  async function deleteMessage(msgId: string) {
    try {
      await api.delete(`/groups/${id}/messages/${msgId}`);
      setData((prev) => prev ? { ...prev, messages: prev.messages.filter((m) => m.id !== msgId) } : prev);
    } catch { /* ignore */ }
  }

  function handleReact(msgId: string, emoji: string) {
    setData((prev) => {
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
    api.post(`/groups/${id}/messages/${msgId}/reactions`, { emoji }).catch(() => {});
  }

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return; e.target.value = "";
    const type: "IMAGE" | "VIDEO" = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";
    setSending(true);
    try { const { path } = await api.upload("/uploads/message-media", file); appendMsg(await api.post<MessageDto>(`/groups/${id}/messages`, { type, mediaPath: path, text: null })); }
    finally { setSending(false); }
  }

  if (loading) return <div className="content-inner" style={{ color: "var(--text-faint)", fontSize: 13 }}>Yuklanmoqda...</div>;
  if (!data) return (
    <div className="content-inner">
      <p style={{ color: "var(--error)" }}>Guruh topilmadi</p>
      <button className="btn btn-secondary" onClick={() => router.back()}>← Orqaga</button>
    </div>
  );

  const { group, messages } = data;
  const isAdmin = group.myRole === "OWNER" || group.myRole === "ADMIN";
  const W = typeof window !== "undefined" ? window.innerWidth : 800;
  const H = typeof window !== "undefined" ? window.innerHeight : 600;

  return (
    <>
      <style>{`
        .gbtn { width:34px;height:34px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity 0.15s;background:var(--bg-elev-2); }
        .gbtn:hover{opacity:0.75;}
        @keyframes recPulse{0%,100%{opacity:1}50%{opacity:0.25}}
        .vn-modal{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,0.72);display:flex;align-items:center;justify-content:center;}
        .vn-inner{background:var(--bg-elev);border-radius:24px;padding:28px;display:flex;flex-direction:column;align-items:center;gap:20px;width:300px;}
        .vn-circle{width:220px;height:220px;border-radius:50%;overflow:hidden;background:#000;border:4px solid var(--brand);position:relative;}
        @keyframes rring{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.35;transform:scale(1.06)}}
        .gctx{position:fixed;z-index:400;background:var(--bg-elev);border:1px solid var(--border);border-radius:14px;min-width:180px;box-shadow:0 8px 30px rgba(0,0,0,0.2);overflow:hidden;}
        .gctx-emojis{display:flex;gap:2px;padding:8px 8px 6px;border-bottom:1px solid var(--border);}
        .gctx-emoji{width:30px;height:30px;border:none;background:none;cursor:pointer;font-size:18px;border-radius:8px;display:flex;align-items:center;justify-content:center;transition:background 0.1s;}
        .gctx-emoji:hover{background:var(--bg-elev-2);}
        .gctx-item{width:100%;display:flex;align-items:center;gap:10px;padding:9px 14px;background:none;border:none;cursor:pointer;font-size:13.5px;color:var(--text);text-align:left;transition:background 0.1s;}
        .gctx-item:hover{background:var(--bg-elev-2);}
        .gctx-item.danger{color:var(--error,#ef4444);}
        @keyframes gmsgHL{0%{background:rgba(139,92,246,0.22)}100%{background:transparent}}
        .gmsg-hl{animation:gmsgHL 1.5s ease-out;border-radius:12px;}
        .g-modal{position:fixed;inset:0;z-index:350;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;}
        .g-panel{background:var(--bg-elev);border-radius:20px;width:340px;max-height:85vh;display:flex;flex-direction:column;overflow:hidden;}
        .g-tabs{display:flex;border-bottom:1px solid var(--border);}
        .g-tab{flex:1;padding:10px;background:none;border:none;cursor:pointer;font-size:13px;font-weight:600;color:var(--text-dim);transition:color 0.15s;}
        .g-tab.active{color:var(--brand);border-bottom:2px solid var(--brand);}
        .member-row{display:flex;align-items:center;gap:10px;padding:10px 16px;}
        .member-row:hover{background:var(--bg-elev-2);}
        .role-badge{font-size:10px;font-weight:700;padding:2px 6px;border-radius:8px;background:var(--brand-tint);color:var(--brand);}
        .sound-menu{position:fixed;z-index:401;background:var(--bg-elev);border:1px solid var(--border);border-radius:14px;min-width:200px;box-shadow:0 8px 30px rgba(0,0,0,0.2);overflow:hidden;}
        .sound-item{width:100%;display:flex;align-items:center;gap:10px;padding:10px 14px;background:none;border:none;cursor:pointer;font-size:13.5px;color:var(--text);text-align:left;transition:background 0.1s;}
        .sound-item:hover{background:var(--bg-elev-2);}
        .sound-item.active{color:var(--brand);}
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => router.push(`/${locale}/groups`)}>←</button>
          <GroupAvatar group={group} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-strong)" }}>{group.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{group.members} a'zo</div>
          </div>

          {/* Sound toggle */}
          <div style={{ position: "relative" }}>
            <button type="button" className="gbtn" title="Ovoz sozlamalari" onClick={() => setShowSound(s => !s)}>
              {muted
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>}
            </button>
            {showSound && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 400 }} onClick={() => setShowSound(false)} />
                <div className="sound-menu" style={{ position: "absolute", top: "calc(100% + 6px)", right: 0 }}>
                  <button className={`sound-item${!muted ? " active" : ""}`} type="button" onClick={() => { setMuted(false); localStorage.setItem(`grp_muted_${id}`, "0"); setShowSound(false); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                    Ovoz yoqilgan
                  </button>
                  <button className={`sound-item${muted ? " active" : ""}`} type="button" onClick={() => { setMuted(true); localStorage.setItem(`grp_muted_${id}`, "1"); setShowSound(false); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5 6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                    Ovoz o'chirilgan
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Settings */}
          <button type="button" className="gbtn" title="Sozlamalar" onClick={openSettings}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>

          {/* Leave */}
          {group.joined && (
            <button type="button" className="gbtn" title="Chiqish" style={{ background: "none" }} onClick={async () => {
              if (!confirm("Guruhdan chiqishni xohlaysizmi?")) return;
              await api.post(`/groups/${id}/leave`);
              router.push(`/${locale}/groups`);
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--error,#ef4444)" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          )}
        </div>

        {/* ── Messages ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {messages.length === 0
            ? <div style={{ textAlign: "center", color: "var(--text-faint)", fontSize: 13, padding: "40px 0" }}>Birinchi xabarni yuboring!</div>
            : messages.map((msg) => <MsgBubble key={msg.id} msg={msg} onMenu={(x, y, m) => setCtxMenu({ x, y, msg: m })} onReact={handleReact} />)}
          <div ref={endRef} />
        </div>

        {/* Recording indicator */}
        {voice.recording && (
          <div style={{ padding: "8px 20px", borderTop: "1px solid var(--border)", background: "var(--bg-elev)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", animation: "recPulse 1s ease-in-out infinite" }} />
            <span style={{ fontSize: 13, color: "var(--text-dim)", flex: 1 }}>Yozilmoqda...</span>
            <button type="button" className="btn btn-danger btn-sm" onClick={voice.stop}>■ To'xtatish</button>
          </div>
        )}

        {/* Voice preview */}
        {voice.blob && !voice.recording && (
          <div style={{ padding: "8px 20px", borderTop: "1px solid var(--border)", background: "var(--bg-elev)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <AudioMsg src={URL.createObjectURL(voice.blob)} isMe={false} />
            <button type="button" className="btn btn-primary btn-sm" onClick={async () => { const b = voice.blob!; voice.clear(); await uploadAndSend(b, "VOICE"); }} disabled={sending}>{sending ? "..." : "Yuborish"}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={voice.clear}>✕</button>
          </div>
        )}

        {/* Reply bar */}
        {replyTo && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderTop: "1px solid var(--border)", background: "var(--bg-elev)", flexShrink: 0 }}>
            <div style={{ flex: 1, borderLeft: "3px solid var(--brand)", paddingLeft: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--brand)", marginBottom: 1 }}>{replyTo.from === "me" ? "O'zingiz" : (replyTo.senderName || "Foydalanuvchi")}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{replyTo.text || "📎 Media"}</div>
            </div>
            <button type="button" onClick={() => setReplyTo(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: 18 }}>×</button>
          </div>
        )}

        {/* Input bar */}
        {group.joined ? (
          <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button type="button" className="gbtn" onClick={() => fileRef.current?.click()} title="Fayl">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: "none" }} onChange={handleFilePick} />
            <button type="button" className="gbtn" onClick={() => setShowVidNote(true)} title="Aylanacha video">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
            </button>
            <input type="text" placeholder={t("typePlaceholder")} value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(); } }}
              style={{ flex: 1, background: "var(--bg-elev)", border: "1px solid var(--border-strong)", borderRadius: 22, padding: "9px 16px", color: "var(--text-strong)", fontSize: 14, outline: "none" }} />
            <button type="button" className="gbtn" style={{ background: voice.recording ? "#ef4444" : "var(--brand)", width: 38, height: 38 }}
              onClick={() => voice.recording ? voice.stop() : voice.start()}>
              {voice.recording
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>}
            </button>
            {text.trim() && (
              <button type="button" className="gbtn" style={{ background: "var(--brand)", width: 38, height: 38 }} onClick={sendText} disabled={sending}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            )}
          </div>
        ) : (
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", textAlign: "center", color: "var(--text-dim)", fontSize: 13, flexShrink: 0 }}>
            <button type="button" style={{ color: "var(--brand)", fontWeight: 600 }}
              onClick={async () => { await api.post(`/groups/${id}/join`); setData((prev) => prev ? { ...prev, group: { ...prev.group, joined: true } } : prev); }}>
              Guruhga qo'shilish
            </button>
          </div>
        )}
      </div>

      {/* ── Context menu (emoji bar + actions) ── */}
      {ctxMenu && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 399 }} onClick={() => setCtxMenu(null)} />
          <div className="gctx" style={{ left: Math.min(ctxMenu.x, W - 200), top: Math.min(ctxMenu.y, H - 160) }}>
            {/* Emoji quick-pick */}
            <div className="gctx-emojis">
              {EMOJIS.map((e) => (
                <button key={e} className="gctx-emoji" type="button" onClick={() => { handleReact(ctxMenu.msg.id, e); setCtxMenu(null); }}>{e}</button>
              ))}
            </div>
            <button className="gctx-item" type="button" onClick={() => { setReplyTo(ctxMenu.msg); setCtxMenu(null); }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
              Javob berish
            </button>
            {ctxMenu.msg.text && (
              <button className="gctx-item" type="button" onClick={() => { navigator.clipboard.writeText(ctxMenu.msg.text!); setCtxMenu(null); }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Nusxa olish
              </button>
            )}
            {(ctxMenu.msg.from === "me" || isAdmin) && (
              <button className="gctx-item danger" type="button" onClick={() => { deleteMessage(ctxMenu.msg.id); setCtxMenu(null); }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                O'chirish
              </button>
            )}
          </div>
        </>
      )}

      {/* ── Video note modal ── */}
      {showVidNote && (
        <div className="vn-modal" onClick={(e) => { if (e.target === e.currentTarget) { vidNote.stop(); vidNote.clear(); setShowVidNote(false); } }}>
          <div className="vn-inner">
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-strong)" }}>Aylanacha video xabar</div>
            {!vidNote.blob ? (
              <>
                <div className="vn-circle">
                  <video ref={camRef} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} autoPlay muted playsInline />
                  {vidNote.recording && <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "4px solid var(--brand)", animation: "rring 1.2s ease-in-out infinite" }} />}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {!vidNote.recording
                    ? <button type="button" className="btn btn-primary" onClick={() => camRef.current && vidNote.start(camRef.current)}>● Yozish</button>
                    : <button type="button" className="btn btn-danger" onClick={vidNote.stop}>■ To'xtatish</button>}
                  <button type="button" className="btn btn-secondary" onClick={() => { vidNote.stop(); setShowVidNote(false); }}>Bekor</button>
                </div>
              </>
            ) : (
              <>
                <div className="vn-circle">{vidNote.preview && <video src={vidNote.preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} autoPlay loop muted />}</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" className="btn btn-primary" disabled={sending} onClick={async () => { const b = vidNote.blob!; vidNote.clear(); setShowVidNote(false); await uploadAndSend(b, "VIDEO_NOTE"); }}>
                    {sending ? "..." : "Yuborish"}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={vidNote.clear}>Qayta</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Settings modal ── */}
      {showSettings && (
        <div className="g-modal" onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}>
          <div className="g-panel">
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", padding: "16px 20px 12px", gap: 10, flexShrink: 0 }}>
              <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: "var(--text-strong)" }}>Guruh sozlamalari</span>
              <button type="button" onClick={() => setShowSettings(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            {/* Tabs */}
            <div className="g-tabs">
              <button className={`g-tab${settingsTab === "info" ? " active" : ""}`} onClick={() => setSettingsTab("info")}>Ma'lumot</button>
              <button className={`g-tab${settingsTab === "members" ? " active" : ""}`} onClick={() => setSettingsTab("members")}>A'zolar ({group.members})</button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {settingsTab === "info" && (
                <div style={{ padding: "20px 20px 8px" }}>
                  {/* Avatar */}
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                    <GroupAvatar group={group} size={72} editable={isAdmin} onUploaded={async (path) => {
                      await api.patch(`/groups/${id}`, { avatarPath: path });
                      setData(prev => prev ? { ...prev, group: { ...prev.group, avatarPath: path } } : prev);
                    }} />
                  </div>

                  {/* Name */}
                  <label style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 600, marginBottom: 4, display: "block" }}>Guruh nomi</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} disabled={!isAdmin}
                    style={{ width: "100%", background: "var(--bg-elev-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 12px", color: "var(--text-strong)", fontSize: 14, outline: "none", marginBottom: 14, boxSizing: "border-box" }} />

                  {/* Description */}
                  <label style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 600, marginBottom: 4, display: "block" }}>Tavsif</label>
                  <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} disabled={!isAdmin} rows={2}
                    style={{ width: "100%", background: "var(--bg-elev-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 12px", color: "var(--text-strong)", fontSize: 14, outline: "none", resize: "none", marginBottom: 14, boxSizing: "border-box" }} />

                  {/* Visibility */}
                  <label style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 600, marginBottom: 8, display: "block" }}>Guruh turi</label>
                  <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    {["PUBLIC", "PRIVATE"].map(v => (
                      <button key={v} type="button" disabled={!isAdmin} onClick={() => setEditVis(v)}
                        style={{ flex: 1, padding: "8px", borderRadius: 10, border: `1px solid ${editVis === v ? "var(--brand)" : "var(--border)"}`, background: editVis === v ? "var(--brand-tint)" : "var(--bg-elev-2)", color: editVis === v ? "var(--brand)" : "var(--text-dim)", fontWeight: 600, fontSize: 13, cursor: isAdmin ? "pointer" : "default" }}>
                        {v === "PUBLIC" ? "🌍 Ochiq" : "🔒 Yopiq"}
                      </button>
                    ))}
                  </div>

                  {/* Invite link */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 600, marginBottom: 8, display: "block" }}>Taklif havolasi</label>
                    {inviteLink ? (
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ flex: 1, background: "var(--bg-elev-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inviteLink}</div>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(inviteLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                          {copied ? "✓" : "Nusxa"}
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="btn btn-secondary" style={{ width: "100%" }} onClick={generateInvite}>
                        🔗 Havola yaratish
                      </button>
                    )}
                  </div>
                </div>
              )}

              {settingsTab === "members" && (
                <div>
                  {isAdmin && (
                    <div style={{ padding: "12px 16px 4px" }}>
                      <button type="button" className="btn btn-primary" style={{ width: "100%" }} onClick={() => { setShowAddMember(true); setShowSettings(false); }}>
                        + A'zo qo'shish
                      </button>
                    </div>
                  )}
                  {members.map(m => (
                    <div key={m.userId} className="member-row">
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,var(--brand) 0%,#7c3aed 100%)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0, overflow: "hidden" }}>
                        {m.avatarPath ? <img src={resolveMedia(m.avatarPath)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : m.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-strong)" }}>{m.name}</div>
                        {m.role !== "MEMBER" && <span className="role-badge">{m.role === "OWNER" ? "Egasi" : "Admin"}</span>}
                      </div>
                      {isAdmin && m.role !== "OWNER" && (
                        <button type="button" onClick={() => kickMember(m.userId)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--error,#ef4444)", fontSize: 12, padding: "4px 8px" }}>Chiqarish</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {isAdmin && settingsTab === "info" && (
              <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexShrink: 0 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowSettings(false)}>Bekor</button>
                <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={saveSettings} disabled={saving}>{saving ? "..." : "Saqlash"}</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Add member modal ── */}
      {showAddMember && (
        <div className="g-modal" onClick={(e) => { if (e.target === e.currentTarget) setShowAddMember(false); }}>
          <div className="g-panel">
            <div style={{ display: "flex", alignItems: "center", padding: "16px 20px 12px", gap: 10, flexShrink: 0 }}>
              <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: "var(--text-strong)" }}>A'zo qo'shish</span>
              <button type="button" onClick={() => setShowAddMember(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", fontSize: 20 }}>×</button>
            </div>
            <div style={{ padding: "0 16px 12px", flexShrink: 0 }}>
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Ism yoki username..."
                style={{ width: "100%", background: "var(--bg-elev-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 12px", color: "var(--text-strong)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {userResults.length === 0
                ? <div style={{ padding: "24px", textAlign: "center", color: "var(--text-faint)", fontSize: 13 }}>Foydalanuvchi topilmadi</div>
                : userResults.map(u => (
                  <div key={u.id} className="member-row" style={{ justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,var(--brand) 0%,#7c3aed 100%)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0, overflow: "hidden" }}>
                        {u.avatarPath ? <img src={resolveMedia(u.avatarPath)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text-strong)" }}>{u.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-faint)" }}>@{u.username}</div>
                      </div>
                    </div>
                    {sentInvites.has(u.id)
                      ? <span style={{ fontSize: 12, color: "var(--success,#22c55e)", fontWeight: 600 }}>✓ Yuborildi</span>
                      : <button type="button" className="btn btn-primary btn-sm" disabled={sendingInvite === u.id} onClick={() => sendInvite(u)}>
                          {sendingInvite === u.id ? "..." : "Taklif"}
                        </button>}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
