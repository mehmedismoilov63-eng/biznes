// Chat (DM + Group) and Player screens

// ===================== Messages (DM) =====================
function MessagesScreen({ initialUserId, isMobile }) {
  const [activeId, setActiveId] = useState(isMobile ? null : (initialUserId || 'd1'));
  const [text, setText] = useState('');
  const [conv, setConv] = useState(DATA.conversation);
  const streamRef = useRef(null);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [conv, activeId]);

  // when switching to mobile, deselect
  useEffect(() => {
    if (isMobile && !activeId) {/* no-op */}
  }, [isMobile]);

  const activeMsg = DATA.messages.find(m => m.id === activeId);
  const activeUser = activeMsg ? DATA.people.find(p => p.id === activeMsg.userId) : null;

  const send = () => {
    if (!text.trim()) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    setConv([...conv, { from: 'me', text: text.trim(), time, status: 'sent' }]);
    setText('');
    setTimeout(() => {
      setConv(c => [...c, { from: 'them', text: "Tushundim, rahmat 🙏", time }]);
    }, 1500);
  };

  return (
    <div className={`chat-app ${activeId ? 'has-active' : ''}`}>
      <div className="chat-list">
        <div className="chat-list-head">
          <h2>Xabarlar</h2>
          <button className="icon-btn"><Icon name="edit" size={16} /></button>
        </div>
        <div className="chat-list-search">
          <Icon name="search" size={14} />
          <input placeholder="Qidirish..." />
        </div>
        <div className="chat-list-items">
          {DATA.messages.map(m => {
            const u = DATA.people.find(p => p.id === m.userId);
            if (!u) return null;
            return (
              <div key={m.id} className={`chat-list-item ${activeId === m.id ? 'active' : ''}`} onClick={() => setActiveId(m.id)}>
                <Avatar name={u.name} color={u.avColor} size="md" online={m.online} />
                <div style={{ minWidth: 0 }}>
                  <div className="chat-list-item-name">{u.name}</div>
                  <div className="chat-list-item-msg">
                    {m.lastFromMe && <Icon name="check2" size={12} style={{ verticalAlign: -2, marginRight: 3, color: m.read ? 'var(--brand)' : 'var(--text-faint)' }} />}
                    {m.lastMsg}
                  </div>
                </div>
                <div className="chat-list-item-meta">
                  <div className="chat-list-item-time">{m.time}</div>
                  {m.unread > 0 && <div className="chat-list-item-badge">{m.unread}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeUser ? (
        <ChatPane user={activeUser} conv={conv} text={text} setText={setText} send={send} streamRef={streamRef}
          onBack={isMobile ? (() => setActiveId(null)) : null} />
      ) : (
        !isMobile && (
          <div className="chat-pane" style={{ alignItems: 'center', justifyContent: 'center' }}>
            <div className="empty">
              <div className="empty-icon"><Icon name="message" size={22} /></div>
              <div className="empty-title">Suhbatni tanlang</div>
              <div className="empty-desc">Chap tomondan tadbirkorni tanlab muloqotni boshlang</div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function ChatPane({ user, conv, text, setText, send, streamRef, headRight, onBack }) {
  return (
    <div className="chat-pane">
      <div className="chat-head">
        {onBack && <button className="icon-btn" onClick={onBack} style={{ marginLeft: -8 }}><Icon name="arrow_left" size={18} /></button>}
        <Avatar name={user.name} color={user.avColor} size="md" online={user.online} />
        <div className="chat-head-info">
          <div className="chat-head-name">{user.name}</div>
          <div className="chat-head-status">{user.online ? 'onlayn' : 'oxirgi marta 2 soat oldin'}</div>
        </div>
        <div className="chat-head-actions">
          <button className="icon-btn"><Icon name="search" size={16} /></button>
          <button className="icon-btn"><Icon name="more_h" size={16} /></button>
          {headRight}
        </div>
      </div>

      <div className="chat-stream" ref={streamRef}>
        <div className="chat-day"><span>Bugun</span></div>
        {conv.map((m, i) => {
          const prev = conv[i-1];
          const compact = prev && prev.from === m.from;
          return (
            <div key={i} className={`chat-msg ${m.from === 'me' ? 'self' : ''} ${compact ? 'compact' : ''}`}>
              {!compact && m.from !== 'me' && <Avatar name={user.name} color={user.avColor} size="sm" />}
              {compact && m.from !== 'me' && <div style={{ width: 24 }}></div>}
              <div>
                <div className="chat-msg-bubble" style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                <div className="chat-msg-time">
                  {m.time}
                  {m.from === 'me' && <Icon name="check2" size={11} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="chat-input">
        <div className="chat-attach">
          <button className="icon-btn"><Icon name="paperclip" size={18} /></button>
        </div>
        <textarea className="chat-input-field" placeholder="Xabar yozing..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={1} />
        <div className="chat-attach">
          <button className="icon-btn"><Icon name="smile" size={18} /></button>
          {text.trim() ? (
            <button className="chat-send" onClick={send}><Icon name="send" size={16} /></button>
          ) : (
            <>
              <button className="icon-btn"><Icon name="mic" size={18} /></button>
              <button className="icon-btn"><Icon name="videoCircle" size={18} /></button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ===================== Group chat =====================
function GroupChatScreen({ group, back }) {
  const g = group || DATA.groups[0];
  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState([
    { uid: 'u2', text: "Salom hammaga 🙌 yangi a'zo sifatida qo'shildim", time: "09:12" },
    { uid: 'u1', text: "Xush kelibsiz Nilufar! Qaysi shaharlik ekansiz?", time: "09:14" },
    { uid: 'u2', text: "Samarqand. Beauty salon ochmoqchiman, lekin restoran biznesi haqida ham qiziqyapman", time: "09:15" },
    { uid: 'u3', text: "Aziz Karimov sizga aytib bersa kerak, u Karimov Auto egasi va do'sti restoran ochgan", time: "09:22" },
    { uid: 'me', text: "Yangi yetkazib beruvchini sinab ko'rdim, juda yaxshi narx beradi", time: "10:05" },
    { uid: 'me', text: "Kontaktini ulashishim kerak bo'lsa, ayting", time: "10:05" },
    { uid: 'u4', text: "Bekzod aka, men ham qiziqaman 🙏", time: "10:08" },
    { uid: 'u7', text: "Reels reklama strategiyasi tayyor — kim ko'rishni xohlaydi?", time: "10:14" },
  ]);
  const streamRef = useRef(null);

  useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [msgs]);

  const send = () => {
    if (!text.trim()) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    setMsgs(m => [...m, { uid: 'me', text: text.trim(), time }]);
    setText('');
  };

  return (
    <div className="chat-pane" style={{ height: '100%' }}>
      <div className="chat-head">
        <button className="icon-btn" onClick={back}><Icon name="arrow_left" size={16} /></button>
        <Avatar name={g.name} color={g.iconColor} size="md" />
        <div className="chat-head-info">
          <div className="chat-head-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {g.name}
            {!g.public && <Icon name="lock" size={12} color="var(--text-faint)" />}
          </div>
          <div className="chat-head-status">{g.members} a'zo · {g.public ? 'public guruh' : 'private'}</div>
        </div>
        <div className="chat-head-actions">
          <button className="icon-btn"><Icon name="search" size={16} /></button>
          <button className="icon-btn"><Icon name="more_h" size={16} /></button>
        </div>
      </div>

      <div className="chat-stream" ref={streamRef}>
        <div className="chat-day"><span>Bugun</span></div>
        {msgs.map((m, i) => {
          const prev = msgs[i-1];
          const compact = prev && prev.uid === m.uid;
          const u = DATA.people.find(p => p.id === m.uid);
          const isMe = m.uid === 'me';
          return (
            <div key={i} className={`chat-msg ${isMe ? 'self' : ''} ${compact ? 'compact' : ''}`} style={{ maxWidth: '70%' }}>
              {!compact && !isMe && <Avatar name={u?.name || 'U'} color={u?.avColor || 0} size="sm" />}
              {compact && !isMe && <div style={{ width: 24 }}></div>}
              <div>
                {!compact && !isMe && <div className="chat-msg-sender">{u?.name}</div>}
                <div className="chat-msg-bubble" style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                <div className="chat-msg-time">
                  {m.time}
                  {isMe && <Icon name="check2" size={11} />}
                </div>
              </div>
            </div>
          );
        })}
        <div className="chat-msg" style={{ alignSelf: 'flex-start' }}>
          <Avatar name="A" color={2} size="sm" />
          <div>
            <div className="chat-msg-sender">Aziz Karimov</div>
            <div className="chat-msg-bubble">
              <div className="typing"><span></span><span></span><span></span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="chat-input">
        <button className="icon-btn"><Icon name="paperclip" size={18} /></button>
        <textarea className="chat-input-field" placeholder={`${g.name}ga xabar yozing...`}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={1} />
        <button className="icon-btn"><Icon name="smile" size={18} /></button>
        {text.trim() ? (
          <button className="chat-send" onClick={send}><Icon name="send" size={16} /></button>
        ) : (
          <>
            <button className="icon-btn"><Icon name="mic" size={18} /></button>
          </>
        )}
      </div>
    </div>
  );
}

// ===================== Video Player =====================
function PlayerScreen({ lesson, back, openLesson }) {
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState((lesson.progress || 0.15));
  const [showSettings, setShowSettings] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState('1080p');
  const [subLang, setSubLang] = useState('uz-Latn');
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSubMenu, setShowSubMenu] = useState(false);

  // simulate playback
  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setProgress(p => {
        const next = p + (0.002 * speed);
        return next >= 1 ? 0 : next;
      });
    }, 100);
    return () => clearInterval(t);
  }, [playing, speed]);

  const dur = lesson.duration; // "MM:SS"
  const [m, s] = dur.split(":").map(Number);
  const totalSec = m * 60 + s;
  const curSec = Math.floor(totalSec * progress);
  const fmt = sec => `${Math.floor(sec/60).toString().padStart(2,'0')}:${(sec%60).toString().padStart(2,'0')}`;

  // pick a subtitle line based on progress
  const subLines = {
    'uz-Latn': "Restoran biznesini boshlashda eng muhim narsa — bozorni o'rganish",
    'uz-Cyrl': "Ресторан бизнесини бошлашда энг мухим нарса — бозорни ўрганиш",
    'ru': "Самое важное в начале ресторанного бизнеса — изучить рынок",
    'en': "The most important thing in starting a restaurant is studying the market",
    'off': null,
  };

  const others = DATA.lessons.filter(l => l.dept === lesson.dept && l.id !== lesson.id).slice(0, 8);

  return (
    <div className="content-inner">
      <button className="btn btn-ghost btn-sm" onClick={back} style={{ marginBottom: 14 }}>
        <Icon name="arrow_left" size={14} /> Darslarga qaytish
      </button>

      <div className="player-wrap">
        <div>
          <div className="player">
            <div className="player-canvas" style={{
              background: `radial-gradient(circle at 30% 40%, ${DATA.grads[lesson.grad % DATA.grads.length].match(/#[0-9a-f]{6}/gi)[0]}66, transparent 50%), radial-gradient(circle at 70% 60%, ${DATA.grads[lesson.grad % DATA.grads.length].match(/#[0-9a-f]{6}/gi)[1]}44, transparent 50%), #0a0c10`
            }}>
              <button className="player-canvas-icon" onClick={() => setPlaying(!playing)}>
                <Icon name={playing ? 'pause' : 'play'} size={36} color="white" />
              </button>
            </div>

            {subLang !== 'off' && subLines[subLang] && (
              <div className="player-subtitle">{subLines[subLang]}</div>
            )}

            <div className="player-controls">
              <div className="player-timeline" onClick={e => {
                const r = e.currentTarget.getBoundingClientRect();
                setProgress((e.clientX - r.left) / r.width);
              }}>
                <div className="player-timeline-fill" style={{ width: (progress * 100) + '%' }}>
                  <div className="player-timeline-thumb"></div>
                </div>
              </div>
              <div className="player-bar">
                <button className="player-btn" onClick={() => setPlaying(!playing)}>
                  <Icon name={playing ? 'pause' : 'play'} size={18} />
                </button>
                <button className="player-btn" onClick={() => setProgress(p => Math.max(0, p - 10 / totalSec))}>
                  <Icon name="back10" size={20} />
                </button>
                <button className="player-btn" onClick={() => setProgress(p => Math.min(1, p + 10 / totalSec))}>
                  <Icon name="fwd10" size={20} />
                </button>
                <button className="player-btn"><Icon name="volume" size={18} /></button>
                <div className="player-time">{fmt(curSec)} / {fmt(totalSec)}</div>
                <div className="player-spacer"></div>

                <div className="player-menu-wrap">
                  <button className="player-btn" onClick={() => { setShowSpeedMenu(s => !s); setShowQualityMenu(false); setShowSubMenu(false); }} style={{ minWidth: 36, fontSize: 12, fontWeight: 600 }}>
                    {speed}x
                  </button>
                  {showSpeedMenu && (
                    <div className="player-menu">
                      <div className="player-menu-label">Tezlik</div>
                      {[0.5, 1, 1.25, 1.5, 2].map(s => (
                        <div key={s} className={`player-menu-item ${speed === s ? 'checked' : ''}`} onClick={() => { setSpeed(s); setShowSpeedMenu(false); }}>{s}x</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="player-menu-wrap">
                  <button className="player-btn" onClick={() => { setShowQualityMenu(s => !s); setShowSpeedMenu(false); setShowSubMenu(false); }} style={{ minWidth: 46, fontSize: 11, fontWeight: 600 }}>
                    {quality}
                  </button>
                  {showQualityMenu && (
                    <div className="player-menu">
                      <div className="player-menu-label">Sifat</div>
                      {['480p', '720p', '1080p'].map(q => (
                        <div key={q} className={`player-menu-item ${quality === q ? 'checked' : ''}`} onClick={() => { setQuality(q); setShowQualityMenu(false); }}>{q}</div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="player-menu-wrap">
                  <button className="player-btn" onClick={() => { setShowSubMenu(s => !s); setShowQualityMenu(false); setShowSpeedMenu(false); }} style={{ fontSize: 11, fontWeight: 600 }}>
                    CC
                  </button>
                  {showSubMenu && (
                    <div className="player-menu" style={{ minWidth: 200 }}>
                      <div className="player-menu-label">Subtitle</div>
                      {[
                        { code: 'uz-Latn', label: "O'zbekcha (lotin)" },
                        { code: 'uz-Cyrl', label: 'Ўзбекча (kirill)' },
                        { code: 'ru', label: 'Русский' },
                        { code: 'en', label: 'English' },
                        { code: 'off', label: "O'chirish" },
                      ].map(o => (
                        <div key={o.code} className={`player-menu-item ${subLang === o.code ? 'checked' : ''}`} onClick={() => { setSubLang(o.code); setShowSubMenu(false); }}>{o.label}</div>
                      ))}
                    </div>
                  )}
                </div>

                <button className="player-btn"><Icon name="pip" size={18} /></button>
                <button className="player-btn"><Icon name="expand" size={18} /></button>
              </div>
            </div>
          </div>

          <div className="player-meta">
            <h1>{lesson.title}</h1>
            <div className="player-meta-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={lesson.author} color={lesson.grad} size="sm" />
                <span style={{ fontWeight: 500, color: 'var(--text)' }}>{lesson.author}</span>
              </div>
              <span>·</span>
              <span>{lesson.views.toLocaleString('en')} ko'rilgan</span>
              <span>·</span>
              <span>{lesson.duration}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <button className="btn btn-secondary btn-sm"><Icon name="bookmark" size={13} /> Saqlash</button>
                <button className="btn btn-secondary btn-sm"><Icon name="share" size={13} /> Ulashish</button>
              </div>
            </div>
            <p className="player-desc">
              Ushbu darsda restoran biznesini noldan boshlash uchun kerakli 7 ta asosiy qadam batafsil tushuntiriladi: bozorni o'rganish, joy tanlash, kontseptsiya, jamoa, hujjatlar, marketing va birinchi oy operatsiyalari.
            </p>
          </div>
        </div>

        <div className="lesson-sidebar">
          <div className="lesson-sidebar-title">Shu bo'limdan</div>
          {others.map(l => (
            <div key={l.id} className={`lesson-sidebar-item ${l.id === lesson.id ? 'current' : ''}`} onClick={() => openLesson(l)}>
              <LessonThumb gradIdx={l.grad} className="lesson-sidebar-thumb">
                <div className="lesson-duration" style={{ fontSize: 9, padding: '1px 4px' }}>{l.duration}</div>
              </LessonThumb>
              <div>
                <div className="lesson-sidebar-name">{l.title}</div>
                <div className="lesson-sidebar-meta">{l.author}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MessagesScreen, GroupChatScreen, PlayerScreen });
