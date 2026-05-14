// Global Cmd+K search modal
function CmdK({ open, onClose, onGo, openLesson, openProfile }) {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo(() => {
    const query = q.toLowerCase().trim();
    const items = [];

    // Lessons
    DATA.lessons.forEach(l => {
      if (!query || l.title.toLowerCase().includes(query)) {
        items.push({ type: 'lesson', id: l.id, title: l.title, sub: `${l.author} · ${l.duration}`, icon: 'play', payload: l });
      }
    });

    // People
    DATA.people.forEach(p => {
      if (!query || p.name.toLowerCase().includes(query) || p.handle.includes(query) || p.biz.toLowerCase().includes(query)) {
        items.push({ type: 'person', id: p.id, title: p.name, sub: `@${p.handle} · ${p.biz}`, icon: 'user', payload: p });
      }
    });

    // Groups
    DATA.groups.filter(g => g.public).forEach(g => {
      if (!query || g.name.toLowerCase().includes(query)) {
        items.push({ type: 'group', id: g.id, title: g.name, sub: `${g.members} a'zo · public guruh`, icon: 'users', payload: g });
      }
    });

    return items.slice(0, 12);
  }, [q]);

  const grouped = {
    lesson: results.filter(r => r.type === 'lesson'),
    person: results.filter(r => r.type === 'person'),
    group: results.filter(r => r.type === 'group'),
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(results.length - 1, i + 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); }
      if (e.key === 'Enter') { e.preventDefault(); pick(results[idx]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, results, idx]);

  const pick = (r) => {
    if (!r) return;
    onClose();
    if (r.type === 'lesson') openLesson(r.payload);
    else if (r.type === 'person') openProfile(r.payload);
    else if (r.type === 'group') onGo('groups');
  };

  if (!open) return null;

  const groupOrder = [
    ['lesson', "Darslar"],
    ['person', "Tadbirkorlar"],
    ['group', "Public guruhlar"],
  ];

  let counter = 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="cmdk" onClick={e => e.stopPropagation()}>
        <div className="cmdk-input">
          <Icon name="search" size={18} color="var(--text-faint)" />
          <input ref={inputRef} value={q} onChange={e => { setQ(e.target.value); setIdx(0); }}
            placeholder="Darslar, tadbirkorlar, guruhlar — qidiring..." />
          <kbd>ESC</kbd>
        </div>
        <div className="cmdk-results">
          {results.length === 0 && (
            <div className="empty"><div className="empty-icon">🔍</div>Natija topilmadi</div>
          )}
          {groupOrder.map(([key, label]) => grouped[key].length > 0 && (
            <div className="cmdk-group" key={key}>
              <div className="cmdk-group-label">{label}</div>
              {grouped[key].map(r => {
                const my = counter++;
                return (
                  <div key={r.id} className={`cmdk-item ${idx === my ? 'active' : ''}`}
                    onClick={() => pick(r)}
                    onMouseEnter={() => setIdx(my)}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-elev-2)', display: 'grid', placeItems: 'center', color: 'var(--brand)', flexShrink: 0 }}>
                      <Icon name={r.icon} size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{r.title}</div>
                      <div className="cmdk-item-sub">{r.sub}</div>
                    </div>
                    <kbd>↵</kbd>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="cmdk-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> harakatlanish</span>
          <span><kbd>↵</kbd> ochish</span>
          <span style={{ marginLeft: 'auto' }}>Biznesjon Search</span>
        </div>
      </div>
    </div>
  );
}

window.CmdK = CmdK;
