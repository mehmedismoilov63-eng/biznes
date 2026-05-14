// Shared UI components
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ---------- Avatar ----------
function Avatar({ name, color = 0, size = "md", online = false, src }) {
  const initials = (name || "?").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
  const cls = `av av-c${color % 8} ${size !== "md" ? size : ""} ${online ? "av-online" : ""}`;
  return (
    <div className={cls}>
      {src ? <img className="av-img" src={src} alt={name} /> : initials}
    </div>
  );
}

// ---------- Lesson Thumbnail (placeholder visual) ----------
function LessonThumb({ gradIdx, label, children, className = "" }) {
  return (
    <div className={`lesson-thumb ${className}`}>
      <div className="lesson-thumb-gradient" style={{ background: DATA.grads[gradIdx % DATA.grads.length] }}></div>
      <div className="lesson-thumb-bg"></div>
      {label && <div className="lesson-thumb-label">{label}</div>}
      {children}
    </div>
  );
}

// ---------- Lesson Card ----------
function LessonCard({ lesson, onClick }) {
  const fmt = (v) => v > 1000 ? (v / 1000).toFixed(1) + "K" : v;
  return (
    <div className="lesson-card" onClick={() => onClick && onClick(lesson)}>
      <LessonThumb gradIdx={lesson.grad} label={"VIDEO · " + lesson.duration}>
        <div className="lesson-duration">{lesson.duration}</div>
        <div className="lesson-play-overlay">
          <div className="play-circle"><Icon name="play" size={20} /></div>
        </div>
        {lesson.progress && <div className="lesson-progress" style={{ width: (lesson.progress * 100) + "%" }}></div>}
      </LessonThumb>
      <div className="lesson-body">
        <h3 className="lesson-title">{lesson.title}</h3>
        <div className="lesson-meta">
          <span>{lesson.author}</span>
          <span className="lesson-meta-dot"></span>
          <span>{fmt(lesson.views)} ko'rilgan</span>
          {lesson.isNew && <span className="badge-new" style={{ marginLeft: 'auto', background: 'var(--brand-tint)', color: 'var(--brand)', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Yangi</span>}
        </div>
      </div>
    </div>
  );
}

// ---------- Continue card ----------
function ContinueCard({ lesson, onClick }) {
  return (
    <div className="continue-card" onClick={() => onClick && onClick(lesson)}>
      <LessonThumb gradIdx={lesson.grad} className="continue-thumb">
        <div className="lesson-duration">{lesson.duration}</div>
      </LessonThumb>
      <div className="continue-body">
        <div>
          <h4 className="continue-title">{lesson.title}</h4>
          <div className="continue-meta">{Math.floor((lesson.progress || 0.5) * 100)}% ko'rilgan · {lesson.author}</div>
        </div>
        <div className="continue-bar"><div className="continue-bar-fill" style={{ width: ((lesson.progress || 0.5) * 100) + "%" }}></div></div>
      </div>
    </div>
  );
}

// ---------- Person card ----------
function PersonCard({ user, onMessage, onOpen }) {
  const dept = DATA.departments.find(d => d.id === user.dept);
  return (
    <div className="person-card" onClick={() => onOpen && onOpen(user)}>
      <div className="person-head">
        <Avatar name={user.name} color={user.avColor} size="lg" online={user.online} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="person-name">{user.name}</div>
          <div className="person-handle">@{user.handle}</div>
        </div>
      </div>
      <p className="person-biz">{user.biz} · {user.city}</p>
      <div className="person-tags">
        {dept && <span className="tag tag-brand">{dept.icon} {dept.name}</span>}
      </div>
      <div className="person-actions" onClick={e => e.stopPropagation()}>
        <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => onMessage && onMessage(user)}>
          <Icon name="message" size={14} /> Xabar
        </button>
        <button className="btn btn-ghost btn-sm btn-icon"><Icon name="more_h" size={16} /></button>
      </div>
    </div>
  );
}

// ---------- Group card ----------
function GroupCard({ group, onClick }) {
  return (
    <div className="group-card" onClick={() => onClick && onClick(group)}>
      <Avatar name={group.name} color={group.iconColor} size="lg" />
      <div className="group-meta">
        <div className="group-name">
          {group.name}
          {!group.public && <Icon name="lock" size={12} />}
        </div>
        <div className="group-last">{group.lastMsg}</div>
        <div className="group-count">{group.members} a'zo · {group.lastTime}</div>
      </div>
      {group.unread > 0 && <div className="group-unread">{group.unread}</div>}
    </div>
  );
}

// ---------- Section heading ----------
function Section({ icon, title, link, onLink, children }) {
  return (
    <div className="section">
      <div className="section-head">
        <h2 className="section-title">
          {icon && <span className="section-title-icon">{icon}</span>}
          {title}
        </h2>
        {link && <a className="section-link" onClick={onLink}>{link} <Icon name="chevron_right" size={12} /></a>}
      </div>
      {children}
    </div>
  );
}

// ---------- Toggle ----------
function Toggle({ value, onChange }) {
  return <div className={`toggle ${value ? 'on' : ''}`} onClick={() => onChange(!value)}></div>;
}

Object.assign(window, {
  Avatar, LessonThumb, LessonCard, ContinueCard, PersonCard, GroupCard, Section, Toggle
});
