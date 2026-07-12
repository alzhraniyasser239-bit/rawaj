import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { theme } from '../theme';

const PAGE_SIZE = 30;

export default function Services() {
  const { user, profile, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .limit(5000);
      const list = data || [];
      setServices(list);
      const cats = [...new Set(list.map((x) => x.category))].filter(Boolean);
      setCategories(cats);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let r = services;
    if (activeCat !== 'all') r = r.filter((x) => x.category === activeCat);
    if (search.trim()) {
      const q = search.trim();
      r = r.filter((x) => x.name?.includes(q) || x.provider_service_id?.includes(q));
    }
    return r;
  }, [services, activeCat, search]);

  const paged = filtered.slice(0, page * PAGE_SIZE);

  return (
    <div style={s.wrap}>
      <div style={s.head}>
        <h1 style={s.title}>الخدمات</h1>
        <p style={s.sub}>{services.length.toLocaleString('ar')} خدمة متاحة — اختر ما يناسبك وابدأ فوراً</p>
      </div>

      <div style={s.searchBar}>
        <input
          style={s.searchInput}
          placeholder="ابحث عن خدمة... (مثال: متابعين انستقرام)"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div style={s.catRow}>
        <button style={{ ...s.catChip, ...(activeCat === 'all' ? s.catActive : {}) }} onClick={() => { setActiveCat('all'); setPage(1); }}>
          الكل
        </button>
        {categories.map((c) => (
          <button key={c} style={{ ...s.catChip, ...(activeCat === c ? s.catActive : {}) }} onClick={() => { setActiveCat(c); setPage(1); }}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={s.center}><span className="spinner" /> جاري التحميل...</div>
      ) : (
        <>
          <div style={s.grid}>
            {paged.map((svc) => (
              <div key={svc.id} style={s.card}>
                <div style={s.cardCat}>{svc.category}</div>
                <h3 style={s.cardName}>{svc.name}</h3>
                <div style={s.cardMeta}>
                  <span>الحد: {svc.min_order?.toLocaleString('ar')} - {svc.max_order?.toLocaleString('ar')}</span>
                </div>
                <div style={s.cardFoot}>
                  <div style={s.price}>
                    <span style={s.priceNum}>{Number(svc.sell_price_sar).toFixed(2)}</span>
                    <span style={s.priceCur}>ر.س / 1000</span>
                  </div>
                  <button style={s.orderBtn} onClick={() => user ? setSelected(svc) : nav('/auth')}>
                    اطلب
                  </button>
                </div>
              </div>
            ))}
          </div>

          {paged.length < filtered.length && (
            <div style={s.center}>
              <button style={s.moreBtn} onClick={() => setPage(page + 1)}>عرض المزيد</button>
            </div>
          )}
          {filtered.length === 0 && <div style={s.center}>لا توجد خدمات مطابقة لبحثك.</div>}
        </>
      )}

      {selected && (
        <OrderModal
          service={selected}
          balance={Number(profile?.balance_sar || 0)}
          onClose={() => setSelected(null)}
          onDone={() => { setSelected(null); refreshProfile(); }}
        />
      )}
    </div>
  );
}

function OrderModal({ service, balance, onClose, onDone }) {
  const [link, setLink] = useState('');
  const [qty, setQty] = useState(service.min_order || 100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const cost = (Number(service.sell_price_sar) * qty / 1000);
  const enough = balance >= cost;

  async function placeOrder() {
    setError('');
    if (!link.trim()) return setError('حط رابط الحساب أو المنشور');
    if (qty < service.min_order || qty > service.max_order) return setError(`الكمية لازم بين ${service.min_order} و ${service.max_order}`);
    if (!enough) return setError('رصيدك غير كافٍ، اشحن رصيدك أولاً');
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${supabase.supabaseUrl}/functions/v1/place-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ user_id: session.user.id, service_id: service.id, target_link: link, quantity: qty }),
      });
      const out = await res.json();
      if (!res.ok || out.error) throw new Error(out.error || 'فشل الطلب');
      setSuccess(true);
      setTimeout(onDone, 1500);
    } catch (e) {
      setError(e.message || 'صار خطأ، جرّب مرة ثانية');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={m.overlay} onClick={onClose}>
      <div style={m.modal} onClick={(e) => e.stopPropagation()}>
        {success ? (
          <div style={m.successBox}>
            <div style={m.checkCircle}>✓</div>
            <h3 style={m.successTitle}>تم إرسال طلبك!</h3>
            <p style={m.successDesc}>تقدر تتابع حالته من لوحة التحكم.</p>
          </div>
        ) : (
          <>
            <div style={m.header}>
              <h3 style={m.title}>طلب خدمة</h3>
              <button style={m.close} onClick={onClose}>✕</button>
            </div>
            <div style={m.svcName}>{service.name}</div>
            <label style={m.label}>رابط الحساب / المنشور</label>
            <input style={m.input} placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} dir="ltr" />
            <label style={m.label}>الكمية (بين {service.min_order} و {service.max_order})</label>
            <input style={m.input} type="number" value={qty} onChange={(e) => setQty(parseInt(e.target.value) || 0)} dir="ltr" />
            <div style={m.summary}>
              <div style={m.sumRow}><span>التكلفة</span><b>{cost.toFixed(2)} ر.س</b></div>
              <div style={m.sumRow}><span>رصيدك</span><b style={{ color: enough ? theme.success : theme.danger }}>{balance.toFixed(2)} ر.س</b></div>
            </div>
            {error && <div style={m.error}>{error}</div>}
            <button style={{ ...m.confirm, opacity: enough ? 1 : 0.6 }} onClick={placeOrder} disabled={loading}>
              {loading ? <span className="spinner" /> : enough ? 'تأكيد الطلب' : 'اشحن رصيدك أولاً'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const wrap = { maxWidth: 1200, margin: '0 auto', padding: '0 20px' };
const s = {
  wrap: { ...wrap, padding: '40px 20px 60px' },
  head: { marginBottom: 28 },
  title: { fontSize: 38, fontWeight: 800 },
  sub: { color: theme.textDim, fontSize: 16, marginTop: 6 },
  searchBar: { marginBottom: 20 },
  searchInput: { width: '100%', boxSizing: 'border-box', padding: '16px 20px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 16, color: '#fff', fontSize: 16, outline: 'none' },
  catRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 },
  catChip: { padding: '9px 16px', borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.bgCard, color: theme.textDim, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' },
  catActive: { background: theme.gradient, color: '#fff', border: '1px solid transparent' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 },
  card: { display: 'flex', flexDirection: 'column', padding: 20, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 18 },
  cardCat: { display: 'inline-block', alignSelf: 'flex-start', padding: '4px 10px', borderRadius: 100, background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', fontSize: 12, fontWeight: 600, marginBottom: 12 },
  cardName: { fontSize: 15, fontWeight: 600, lineHeight: 1.7, marginBottom: 12, flex: 1 },
  cardMeta: { fontSize: 13, color: theme.textFaint, marginBottom: 14 },
  cardFoot: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTop: `1px solid ${theme.border}`, paddingTop: 14 },
  price: { display: 'flex', flexDirection: 'column' },
  priceNum: { fontSize: 20, fontWeight: 800, color: '#c4b5fd' },
  priceCur: { fontSize: 11, color: theme.textFaint },
  orderBtn: { padding: '10px 22px', borderRadius: 12, border: 'none', background: theme.gradient, color: '#fff', fontSize: 14, fontWeight: 700 },
  center: { textAlign: 'center', padding: '40px 0', color: theme.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  moreBtn: { padding: '13px 32px', borderRadius: 14, border: `1px solid ${theme.border}`, background: theme.bgCard, color: '#fff', fontSize: 15, fontWeight: 600 },
};
const m = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 },
  modal: { width: '100%', maxWidth: 460, background: '#151332', border: `1px solid ${theme.border}`, borderRadius: 24, padding: 28 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  title: { fontSize: 22, fontWeight: 800 },
  close: { background: 'none', border: 'none', color: theme.textDim, fontSize: 20 },
  svcName: { padding: 14, background: 'rgba(139,92,246,0.1)', borderRadius: 12, fontSize: 14, lineHeight: 1.7, marginBottom: 20 },
  label: { display: 'block', fontSize: 13, color: theme.textDim, marginBottom: 8, fontWeight: 600 },
  input: { width: '100%', boxSizing: 'border-box', padding: '13px 16px', marginBottom: 16, background: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.border}`, borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none' },
  summary: { background: 'rgba(0,0,0,0.25)', borderRadius: 14, padding: 16, marginBottom: 16 },
  sumRow: { display: 'flex', justifyContent: 'space-between', fontSize: 15, padding: '5px 0' },
  error: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 14, textAlign: 'center' },
  confirm: { width: '100%', padding: '15px 0', border: 'none', borderRadius: 14, background: theme.gradient, color: '#fff', fontSize: 16, fontWeight: 700, minHeight: 52 },
  successBox: { textAlign: 'center', padding: '20px 0' },
  checkCircle: { width: 70, height: 70, margin: '0 auto 18px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, color: '#22c55e' },
  successTitle: { fontSize: 22, fontWeight: 800, marginBottom: 8 },
  successDesc: { color: theme.textDim, fontSize: 15 },
};
