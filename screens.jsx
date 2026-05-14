// ===================== Home =====================
function HomeScreen({ go, openLesson }) {
  const continueLessons = DATA.lessons.filter(l => l.progress);
  const newLessons = DATA.lessons.filter(l => l.isNew);
  const popular = [...DATA.lessons].sort((a, b) => b.views - a.views).slice(0, 4);
  const myGroups = DATA.groups.slice(0, 3);
  const newPeople = DATA.people.slice(0, 4);

  return (
    <div className="content-inner">
      {/* Mening saytim — hero */}
      <div className="hero-mysite">
        <div>
          <div className="eyebrow"><Icon name="star" size={11} /> Mening saytim</div>
          <h1 className="hero-mysite-title">Kofe Lab — siz uchun professional kofe tajribasi</h1>
          <p className="hero-mysite-desc">Jamoa tomonidan tayyorlangan professional video sizning biznesingiz haqida. Mehmonlar bilan ulashing, profilingizdan ko'rsating.</p>
          <div className="hero-mysite-actions">
            <button className="btn btn-primary" onClick={() => go('mysite')}>
              <Icon name="play" size={14} /> Tomosha qilish
            </button>
            <button className="btn btn-secondary">
              <Icon name="share" size={14} /> Ulashish
            </button>
          </div>
        </div>
        <div className="hero-mysite-preview" onClick={() => go('mysite')}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.5), transparent 60%), radial-gradient(circle at 70% 70%, rgba(244,114,182,0.35), transparent 60%), #1a1d23' }}></div>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(20px)', display: 'grid', placeItems: 'center', color: 'white' }}>
              <Icon name="play" size={28} />
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 10, left: 12, color: 'white', fontSize: 11, fontWeight: 500, opacity: 0.85, fontFamily: 'var(--font-mono)' }}>2:24 · Kofe Lab</div>
          <div style={{ position: 'absolute', top: 10, right: 12, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 10, padding: '3px 7px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, background: '#34d399', borderRadius: '50%' }}></span> Ulashilgan
          </div>
        </div>
      </div>

      {continueLessons.length > 0 && (
        <Section icon={<Icon name="play" size={11} />} title="Davom ettirish" link="Hammasini ko'rish" onLink={() => go('lessons')}>
          <div className="continue-strip">
            {continueLessons.map(l => <ContinueCard key={l.id} lesson={l} onClick={openLesson} />)}
          </div>
        </Section>
      )}

      <Section icon={<Icon name="sparkles" size={11} />} title="Yangi darslar" link="Hammasini ko'rish" onLink={() => go('lessons')}>
        <div className="row">
          {newLessons.map(l => <LessonCard key={l.id} lesson={l} onClick={openLesson} />)}
        </div>
      </Section>

      <Section icon={<Icon name="fire" size={11} />} title="Mashhur darslar" link="Hammasini ko'rish" onLink={() => go('lessons')}>
        <div className="row">
          {popular.map(l => <LessonCard key={l.id} lesson={l} onClick={openLesson} />)}
        </div>
      </Section>

      <Section icon={<Icon name="users" size={11} />} title="Mening guruhlarim" link="Hammasini ko'rish" onLink={() => go('groups')}>
        <div className="row-tight">
          {myGroups.map(g => <GroupCard key={g.id} group={g} onClick={() => go('groups')} />)}
        </div>
      </Section>

      <Section icon={<Icon name="handshake" size={11} />} title="Yangi tadbirkorlar" link="Hammasini ko'rish" onLink={() => go('people')}>
        <div className="row">
          {newPeople.map(u => <PersonCard key={u.id} user={u} onMessage={() => go('messages')} onOpen={() => go('people')} />)}
        </div>
      </Section>
    </div>
  );
}

// ===================== Lessons (Grid) =====================
function LessonsScreen({ openLesson }) {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('new');

  const filtered = useMemo(() => {
    let arr = [...DATA.lessons];
    if (filter !== 'all') arr = arr.filter(l => l.dept === filter);
    if (sort === 'views') arr.sort((a,b) => b.views - a.views);
    if (sort === 'new') arr.sort((a,b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    return arr;
  }, [filter, sort]);

  return (
    <div className="content-inner">
      <div className="page-head">
        <h1 className="page-title">Darslar</h1>
        <p className="page-sub">Oziq-ovqat sohasidagi {DATA.lessons.length} ta professional dars · audio o'zbekcha · subtitle 4 tilda</p>
      </div>

      <div className="chip-bar" style={{ marginBottom: 24 }}>
        <div className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Hammasi</div>
        {DATA.departments.slice(0, 5).map(d => (
          <div key={d.id} className={`chip ${filter === d.id ? 'active' : ''}`} onClick={() => setFilter(d.id)}>
            <span>{d.icon}</span> {d.name}
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Saralash:</span>
          <select className="select-pill" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="new">Yangilari</option>
            <option value="views">Mashhurligi</option>
          </select>
        </div>
      </div>

      <div className="row">
        {filtered.map(l => <LessonCard key={l.id} lesson={l} onClick={openLesson} />)}
      </div>
    </div>
  );
}

// ===================== People =====================
function PeopleScreen({ go, openProfile, openMessage }) {
  const [q, setQ] = useState('');
  const [city, setCity] = useState('all');
  const [dept, setDept] = useState('all');

  const cities = useMemo(() => Array.from(new Set(DATA.people.map(p => p.city))), []);
  const filtered = useMemo(() => DATA.people.filter(p => {
    if (q && !(p.name.toLowerCase().includes(q.toLowerCase()) || p.handle.includes(q.toLowerCase()) || p.biz.toLowerCase().includes(q.toLowerCase()))) return false;
    if (city !== 'all' && p.city !== city) return false;
    if (dept !== 'all' && p.dept !== dept) return false;
    return true;
  }), [q, city, dept]);

  return (
    <div className="content-inner">
      <div className="page-head">
        <h1 className="page-title">Tadbirkorlar</h1>
        <p className="page-sub">O'z sohangizdagi va boshqa tadbirkorlar bilan tanishing</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Icon name="search" size={15} style={{ position: 'absolute', left: 11, top: 10, color: 'var(--text-faint)' }} />
          <input className="input-field" value={q} onChange={e => setQ(e.target.value)}
            placeholder="Ism, @username, biznes nomi..."
            style={{ paddingLeft: 34 }} />
        </div>
        <select className="select-pill" value={dept} onChange={e => setDept(e.target.value)}>
          <option value="all">Barcha bo'limlar</option>
          {DATA.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="select-pill" value={city} onChange={e => setCity(e.target.value)}>
          <option value="all">Barcha shaharlar</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 14 }}>{filtered.length} ta tadbirkor topildi</div>

      <div className="row">
        {filtered.map(u => <PersonCard key={u.id} user={u} onOpen={openProfile} onMessage={openMessage} />)}
      </div>
    </div>
  );
}

// ===================== Profile =====================
function ProfileScreen({ user, isSelf = false, go, openMessage }) {
  const u = user || DATA.people[0];
  const dept = DATA.departments.find(d => d.id === u.dept);
  const sector = DATA.sectors.find(s => s.id === u.sector);

  return (
    <div className="content-inner">
      <div className="profile-cover"></div>
      <div className="profile-head">
        <Avatar name={u.name} color={u.avColor} size="xxl" online={u.online} />
        <div className="profile-info">
          <h1 className="profile-name">{u.name}</h1>
          <div className="profile-handle">@{u.handle}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isSelf ? (
            <button className="btn btn-secondary"><Icon name="edit" size={14} /> Tahrirlash</button>
          ) : (
            <>
              <button className="btn btn-primary" onClick={() => openMessage && openMessage(u)}><Icon name="message" size={14} /> Xabar yuborish</button>
              <button className="btn btn-secondary btn-icon"><Icon name="more_h" size={16} /></button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32, marginTop: 24 }}>
        <div>
          <p className="profile-bio">{u.bio || `${u.biz} — ${u.city}. Tadbirkorlar hamjamiyatining a'zosi.`}</p>

          <div className="profile-stats">
            <div>
              <div className="profile-stat-num">{u.biz || '—'}</div>
              <div className="profile-stat-label">Biznes</div>
            </div>
            <div>
              <div className="profile-stat-num">{u.city}</div>
              <div className="profile-stat-label">Shahar</div>
            </div>
            <div>
              <div className="profile-stat-num">2024</div>
              <div className="profile-stat-label">Qo'shilgan</div>
            </div>
          </div>

          {isSelf && (
            <Section icon="⭐" title="Mening saytim">
              <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 16, display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16 }}>
                <LessonThumb gradIdx={0} className="continue-thumb">
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                    <Icon name="play" size={28} color="white" />
                  </div>
                </LessonThumb>
                <div>
                  <h3 style={{ margin: '4px 0 6px', fontSize: 15, fontWeight: 600 }}>Kofe Lab — professional kofe tajribasi</h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>5 yillik tajriba, 3 filial. Spesialty kofe va master-klasslar.</p>
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--text-faint)' }}>
                    <Icon name="globe" size={12} /> Public link faol
                    <span style={{ marginLeft: 'auto' }}>2:24</span>
                  </div>
                </div>
              </div>
            </Section>
          )}
        </div>

        <div>
          <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Ma'lumotlar</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <InfoRow icon="users" label="Soha" value={sector ? `${sector.icon} ${sector.name}` : '—'} />
              <InfoRow icon="bookmark" label="Bo'lim" value={dept ? `${dept.icon} ${dept.name}` : '—'} />
              <InfoRow icon="globe" label="Shahar" value={u.city} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <Icon name={icon} size={15} color="var(--text-faint)" style={{ marginTop: 2, flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{label}</div>
        <div style={{ fontSize: 13, color: 'var(--text)' }}>{value}</div>
      </div>
    </div>
  );
}

// ===================== Groups list =====================
function GroupsScreen({ openGroup }) {
  const [tab, setTab] = useState('mine'); // mine, discover
  const [q, setQ] = useState('');
  const filtered = DATA.groups.filter(g => g.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="content-inner">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div className="page-head" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Guruhlar</h1>
          <p className="page-sub">Tadbirkorlar bilan kanalda muloqot</p>
        </div>
        <button className="btn btn-primary"><Icon name="plus" size={14} /> Yangi guruh</button>
      </div>

      <div className="tabs-bar">
        <div className={`tab ${tab === 'mine' ? 'active' : ''}`} onClick={() => setTab('mine')}>Mening guruhlarim</div>
        <div className={`tab ${tab === 'discover' ? 'active' : ''}`} onClick={() => setTab('discover')}>Topish</div>
      </div>

      {tab === 'discover' && (
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Icon name="search" size={15} style={{ position: 'absolute', left: 11, top: 10, color: 'var(--text-faint)' }} />
          <input className="input-field" value={q} onChange={e => setQ(e.target.value)}
            placeholder="Public guruhlarni qidirish..."
            style={{ paddingLeft: 34 }} />
        </div>
      )}

      <div className="row-tight">
        {filtered.map(g => <GroupCard key={g.id} group={g} onClick={() => openGroup(g)} />)}
      </div>
    </div>
  );
}
function Tab({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 14px',
      fontSize: 13,
      fontWeight: 500,
      color: active ? 'var(--text)' : 'var(--text-dim)',
      borderBottom: active ? '2px solid var(--brand)' : '2px solid transparent',
      marginBottom: -1,
    }}>{children}</button>
  );
}

// ===================== Mening Saytim =====================
function MySiteScreen({ go }) {
  return (
    <div className="content-inner">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--brand-tint)', color: 'var(--brand)', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
            <Icon name="star" size={11} /> Sizning maxsus videongiz
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px' }}>{DATA.myVideo.title}</h1>
          <p style={{ color: 'var(--text-dim)', margin: 0, maxWidth: 700 }}>Jamoamiz tomonidan sizning biznesingiz uchun tayyorlangan professional video</p>
        </div>
      </div>

      <div style={{ aspectRatio: '16/9', borderRadius: 'var(--r-xl)', overflow: 'hidden', background: '#000', position: 'relative', marginBottom: 24, border: '1px solid var(--border)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 40%, rgba(129,140,248,0.4), transparent 50%), radial-gradient(circle at 70% 60%, rgba(244,114,182,0.25), transparent 50%), #0a0c10' }}></div>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <button className="player-canvas-icon" style={{ width: 96, height: 96 }}>
            <Icon name="play" size={36} color="white" />
          </button>
        </div>
        <div style={{ position: 'absolute', bottom: 18, left: 22, color: 'white' }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 2 }}>Kofe Lab</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Bekzod Olimov · Toshkent</div>
        </div>
        <div style={{ position: 'absolute', top: 18, right: 18, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', color: 'white', fontSize: 12, fontWeight: 500, padding: '6px 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid rgba(255,255,255,0.15)' }}>
          <span style={{ width: 7, height: 7, background: '#34d399', borderRadius: '50%' }}></span> Public link faol · 142 ko'rilgan
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 10px' }}>Tavsif</h3>
          <p style={{ color: 'var(--text-dim)', margin: 0, lineHeight: 1.65 }}>{DATA.myVideo.desc}</p>

          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 10px' }}>Ulashish</h3>
            <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icon name="globe" size={18} color="var(--brand)" />
              <code style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>biznesjon.uz/v/kofe-lab-bekzod</code>
              <button className="btn btn-secondary btn-sm">Nusxa olish</button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 8 }}>Bu link orqali har kim videoni ko'ra oladi (qidiruvda chiqmaydi)</p>
          </div>
        </div>

        <div>
          <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Sozlamalar</div>
            <div className="settings-row" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <div className="settings-row-label">Public link</div>
                <div className="settings-row-desc">Tashqaridagi odamlar link orqali ko'rsin</div>
              </div>
              <Toggle value={true} onChange={() => {}} />
            </div>
            <div className="settings-row" style={{ border: 'none' }}>
              <div>
                <div className="settings-row-label">Qidiruvda ko'rinsin</div>
                <div className="settings-row-desc">Boshqa foydalanuvchilar profilingizda ko'rsin</div>
              </div>
              <Toggle value={true} onChange={() => {}} />
            </div>
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: 10 }}>
              <Icon name="share" size={14} /> Chatda yuborish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== Settings =====================
function SettingsScreen() {
  const [tab, setTab] = useState('profile');
  const [notifPush, setNotifPush] = useState(true);
  const [notifMsg, setNotifMsg] = useState(true);
  const [notifGroup, setNotifGroup] = useState(false);
  const [notifLesson, setNotifLesson] = useState(true);

  const tabs = [
    { id: 'profile', label: 'Profil', icon: 'user' },
    { id: 'lang', label: 'Til', icon: 'globe' },
    { id: 'sector', label: 'Soha va bo\'lim', icon: 'bookmark' },
    { id: 'notif', label: 'Bildirishnomalar', icon: 'bell' },
    { id: 'privacy', label: 'Maxfiylik', icon: 'shield' },
    { id: 'theme', label: 'Tema', icon: 'sun' },
    { id: 'devices', label: 'Faol qurilmalar', icon: 'pip' },
    { id: 'danger', label: 'Hisobni o\'chirish', icon: 'trash' },
  ];

  return (
    <div className="content-inner">
      <div className="page-head">
        <h1 className="page-title">Sozlamalar</h1>
        <p className="page-sub">Hisobingiz va platforma sozlamalari</p>
      </div>

      <div className="settings">
        <div className="settings-nav">
          {tabs.map(t => (
            <div key={t.id} className={`settings-nav-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <Icon name={t.icon} size={15} />
              {t.label}
            </div>
          ))}
        </div>

        <div className="settings-panel">
          {tab === 'profile' && (<>
            <h3 className="settings-h">Profil</h3>
            <div className="settings-sub">Sizning ma'lumotlaringiz boshqa tadbirkorlarga ko'rinadi</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <Avatar name="Bekzod Olimov" color={0} size="xl" />
              <div>
                <button className="btn btn-secondary btn-sm">Rasm yuklash</button>
                <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 6 }}>JPG, PNG, WEBP, HEIC · max 5 MB</div>
              </div>
            </div>
            <FormRow label="Ism" value="Bekzod" />
            <FormRow label="Familiya" value="Olimov" />
            <FormRow label="Username" value="@bekzod_o" />
            <FormRow label="Biznes nomi" value="Kofe Lab" />
            <FormRow label="Shahar" value="Toshkent" />
            <FormRow label="Bio" value="5 yil restoran biznesi. 3 ta filial. Spesialist: F&B operations." textarea />
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-primary">Saqlash</button>
              <button className="btn btn-ghost">Bekor qilish</button>
            </div>
          </>)}

          {tab === 'lang' && (<>
            <h3 className="settings-h">Interfeys tili</h3>
            <div className="settings-sub">Video darslar audiosi har doim o'zbek tilida (lotin) qoladi. Bu sozlama faqat interfeys uchun.</div>
            {[
              { code: 'uz-Latn', label: "O'zbekcha (lotin)", native: "O'zbekcha" },
              { code: 'uz-Cyrl', label: 'Узбекча (kirill)', native: 'Ўзбекча' },
              { code: 'ru', label: 'Русский', native: 'Russian' },
              { code: 'en', label: 'English', native: 'English' },
            ].map((l, i) => (
              <div key={l.code} className="settings-row">
                <div>
                  <div className="settings-row-label">{l.label}</div>
                  <div className="settings-row-desc">{l.native}</div>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  border: '2px solid ' + (i === 0 ? 'var(--brand)' : 'var(--border-strong)'),
                  display: 'grid', placeItems: 'center'
                }}>
                  {i === 0 && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--brand)' }}></div>}
                </div>
              </div>
            ))}
          </>)}

          {tab === 'notif' && (<>
            <h3 className="settings-h">Bildirishnomalar</h3>
            <div className="settings-sub">Qaysi voqealar haqida xabar olishingizni tanlang</div>
            <NotifRow label="Push bildirishnomalar" desc="Telefonga push xabarlar yuboriladi" value={notifPush} onChange={setNotifPush} />
            <NotifRow label="Shaxsiy xabarlar" desc="Yangi DM kelganda xabar bering" value={notifMsg} onChange={setNotifMsg} />
            <NotifRow label="Guruh xabarlari" desc="Faqat sizni mention qilganda" value={notifGroup} onChange={setNotifGroup} />
            <NotifRow label="Yangi darslar" desc="Sizning bo'limingizda yangi video chiqsa" value={notifLesson} onChange={setNotifLesson} />
          </>)}

          {tab === 'theme' && (<>
            <h3 className="settings-h">Ko'rinish</h3>
            <div className="settings-sub">Uzoq vaqt ishlash uchun ko'zga qulay tema</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <ThemeOption label="Qorong'i" desc="Default — kechqurun uchun" current={true} icon="moon" />
              <ThemeOption label="Yorug'" desc="Kunduz uchun" current={false} icon="sun" />
              <ThemeOption label="Avto" desc="Tizimga muvofiq" current={false} icon="settings" />
            </div>
          </>)}

          {tab === 'devices' && (<>
            <h3 className="settings-h">Faol qurilmalar</h3>
            <div className="settings-sub">Hisobingizga kirilgan qurilmalar ro'yxati</div>
            <DeviceRow icon="pip" name="iPhone 15 Pro" detail="Toshkent · Hozir faol" current={true} />
            <DeviceRow icon="pip" name="MacBook Pro" detail="Toshkent · 12 daq oldin" />
            <DeviceRow icon="pip" name="Chrome — Windows" detail="Samarqand · 3 kun oldin" />
          </>)}

          {(tab === 'sector') && (<>
            <h3 className="settings-h">Soha va bo'lim</h3>
            <div className="settings-sub">Bu yo'nalishga oid darslar va tadbirkorlar ko'rsatiladi. O'zgartirish cheklovsiz — eski guruhlar va dars progressingiz saqlanib qoladi.</div>
            <FormRow label="Hozirgi soha" value="💼 Kichik Biznes va Tadbirkorlar" readOnly />
            <FormRow label="Hozirgi bo'lim" value="🍽 Oziq-ovqat" readOnly />
            <button className="btn btn-secondary" style={{ marginTop: 16 }}>O'zgartirish</button>
          </>)}

          {tab === 'privacy' && (<>
            <h3 className="settings-h">Maxfiylik</h3>
            <div className="settings-sub">Sizning ma'lumotlaringiz kimga ko'rinishi</div>
            <NotifRow label="Profilim ommaviy ko'rinsin" desc="Boshqa tadbirkorlar topa oladi" value={true} onChange={() => {}} />
            <NotifRow label="Mening saytim — public link" desc="Tashqaridagilar link orqali ko'ra oladi" value={true} onChange={() => {}} />
            <NotifRow label="Online holatim ko'rinsin" desc="Boshqalar onlayn ekanligimni ko'rsin" value={true} onChange={() => {}} />
          </>)}

          {tab === 'danger' && (<>
            <h3 className="settings-h" style={{ color: 'var(--error)' }}>Hisobni o'chirish</h3>
            <div className="settings-sub">Hisobingiz 30 kun davomida saqlanadi — login qilsangiz avtomatik tiklanadi. 30 kundan keyin to'liq o'chadi.</div>
            <button className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <Icon name="trash" size={14} /> Hisobni o'chirish
            </button>
          </>)}
        </div>
      </div>
    </div>
  );
}
function FormRow({ label, value, textarea, readOnly }) {
  const [v, setV] = useState(value);
  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>{label}</label>
      {textarea ? (
        <textarea value={v} onChange={e => setV(e.target.value)} readOnly={readOnly} rows={3}
          style={{ width: '100%', background: 'var(--bg-elev-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '9px 12px', outline: 'none', fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }} />
      ) : (
        <input value={v} onChange={e => setV(e.target.value)} readOnly={readOnly}
          style={{ width: '100%', background: 'var(--bg-elev-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '9px 12px', outline: 'none', fontSize: 13 }} />
      )}
    </div>
  );
}
function NotifRow({ label, desc, value, onChange }) {
  return (
    <div className="settings-row">
      <div>
        <div className="settings-row-label">{label}</div>
        <div className="settings-row-desc">{desc}</div>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}
function ThemeOption({ label, desc, current, icon }) {
  return (
    <div style={{
      border: '2px solid ' + (current ? 'var(--brand)' : 'var(--border)'),
      background: current ? 'var(--brand-tint)' : 'var(--bg-elev-2)',
      borderRadius: 'var(--r-lg)',
      padding: 16,
      cursor: 'pointer',
      textAlign: 'left',
    }}>
      <Icon name={icon} size={20} color="var(--brand)" />
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{desc}</div>
    </div>
  );
}
function DeviceRow({ icon, name, detail, current }) {
  return (
    <div className="settings-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--bg-elev-2)', display: 'grid', placeItems: 'center' }}>
          <Icon name={icon} size={16} />
        </div>
        <div>
          <div className="settings-row-label">{name} {current && <span style={{ fontSize: 11, background: 'var(--success)', color: '#04321f', padding: '1px 6px', borderRadius: 999, marginLeft: 6, fontWeight: 600 }}>HOZIRGI</span>}</div>
          <div className="settings-row-desc">{detail}</div>
        </div>
      </div>
      {!current && <button className="btn btn-ghost btn-sm">Chiqarish</button>}
    </div>
  );
}

Object.assign(window, { HomeScreen, LessonsScreen, PeopleScreen, ProfileScreen, GroupsScreen, MySiteScreen, SettingsScreen });
