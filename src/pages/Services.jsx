import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, SUPABASE_URL } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { theme } from '../theme';
import { validateLink, platformLabel, targetHint } from '../lib/linkValidation';

const PAGE_SIZE = 40;

function timeLabel(mins) {
  if (!mins || mins <= 0) return null;
  if (mins < 60) return `${mins} دقيقة`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h < 24) return m ? `${h} ساعة و${m} دقيقة` : `${h} ساعة`;
  const d = Math.floor(h / 24);
  return `${d} يوم`;
}

export default function Services() {
  const { user, profile, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCat, setActiveCat] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // جلب كل الخدمات على دفعات (Supabase يحد بـ 1000 لكل استعلام)
      let all = [];
      let from = 0;
      const step = 1000;
      while (true) {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('category', { ascending: true })
          .range(from, from + step - 1);
        if (error || !data || data.length === 0) break;
        all = all.concat(data);
        if (data.length < step) break;
        from += step;
      }
      setServices(all);
      const cats = [...new Set(all.map((x) => x.category))].filter(Boolean);
      setCategories(cats);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (activeCat === 'all') return services;
    return services.filter((x) => x.category === activeCat);
  }, [services, activeCat]);

  const paged = filtered.slice(0, page * PAGE_SIZE);

  return (
    <div style={s.wrap}>
      <div style={s.head}>
        <h1 style={s.title}>الخدمات</h1>
        <p style={s.sub}>{services.length.toLocaleString('ar')} خدمة متاحة — اختر ما يناسبك وابدأ فوراً</p>
      </div>

      <div style={s.catRow}>
        <button style={{ ...s.catChip, ...(activeCat === 'all' ? s.catActive : {}) }} onClick={() => { setActiveCat('all'); setPage(1); }}>
          الكل ({services.length})
        </button>
        {categories.map((c) => (
          <button key={c} style={{ ...s.catChip, ...(activeCat === c ? s.catActive : {}) }} onClick={() => { setActiveCat(c); setPage(1); }}>
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={s.center}><span className="spinner" /> جاري تحميل كل الخدمات...</div>
      ) : (
        <>
          <div style={s.grid}>
            {paged.map((svc) => {
              const t = timeLabel(svc.avg_time_min);
              return (
                <div key={svc.id} style={s.card}>
                  <div style={s.cardTop}>
                    <div style={s.cardCat}>{svc.category}</div>
                    {svc.refill && <div style={s.refillBadge}>♻️ تعويض</div>}
                  </div>
                  <h3 style={s.cardName}>{svc.name}</h3>
                  <div style={s.cardMeta}>
                    <span>الحد: {svc.min_order?.toLocaleString('ar')} - {svc.max_order?.toLocaleString('ar')}</span>
                    {t && <span style={s.timeChip}>⏱ {t}</span>}
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
              );
            })}
          </div>

          {paged.length < filtered.length && (
            <div style={s.center}>
              <button style={s.moreBtn} onClick={() => setPage(page + 1)}>
                عرض المزيد ({filtered.length - paged.length} متبقية)
              </button>
            </div>
          )}
          {filtered.length === 0 && <div style={s.center}>لا توجد خدمات في هذا التصنيف.</div>}
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
  const [orderId, setOrderId] = useState(null);

  const pLabel = platformLabel(service);
  const tHint = targetHint(service);
  const t = timeLabel(service.avg_time_min);
  const cost = (Number(service.sell_price_sar) * qty / 1000);
  const enough = balance >= cost;

  async function placeOrder() {
    setError('');
    if (!link.trim()) return setError('حط رابط الحساب أو المنشور');

    const check = validateLink(service, link);
    if (!check.ok) return setError(check.message);

    if (qty < service.min_order || qty > service.max_order) return setError(`الكمية لازم بين ${service.min_order} و ${service.max_order}`);
    if (!enough) return setError('رصيدك غير كافٍ، اشحن رصيدك أولاً');

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('لازم تسجّل دخول أولاً'); setLoading(false); return; }

      const res = await fetch(`${SUPABASE_URL}/functions/v1/place-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ user_id: session.user.id, service_id: service.id, target_link: link.trim(), quantity: qty }),
      });

      let out;
      try { out = await res.json(); } catch { out = {}; }
      if (!res.ok || out.error) throw new Error(out.error || 'فشل الطلب، حاول مرة ثانية');
      setOrderId(out.order_id);
      setTimeout(onDone, 3000);
    } catch (e) {
      if (String(e.message).includes('fetch') || String(e.message).includes('Failed')) {
        setError('تعذّر الاتصال بالخادم، تأكد من اتصالك وحاول مرة ثانية');
      } else setError(e.message || 'صار خطأ، جرّب مرة ثانية');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={m.overlay} onClick={onClose}>
      <div style={m.modal} onClick={(e) => e.stopPropagation()}>
        {orderId ? (
          <div style={m.successBox}>
            <div style={m.checkCircle}>✓</div>
            <h3 style={m.successTitle}>تم إرسال طلبك!</h3>
            <div style={m.orderIdBox}>
              <span style={m.orderIdLabel}>رقم طلبك</span>
              <span style={m.orderIdNum}>#{orderId}</span>
            </div>
            <p style={m.successDesc}>احتفظ برقم الطلب. تقدر تتابع حالته من لوحة التحكم، ولو صارت مشكلة أرسل الرقم للدعم.</p>
          </div>
        ) : (
          <>
            <div style={m.header}>
              <h3 style={m.title}>طلب خدمة</h3>
              <button style={m.close} onClick={onClose}>✕</button>
            </div>
            <div style={m.svcName}>{service.name}</div>
            {(pLabel || tHint) && (
              <div style={m.platformHint}>
                🔗 {pLabel ? `خدمة ${pLabel}` : 'هذي الخدمة'} — المطلوب: {tHint || 'رابط صحيح'}
              </div>
            )}
            {t && <div style={m.timeHint}>⏱ متوسط وقت التنفيذ: {t}</div>}
            <label style={m.label}>{tHint || 'رابط الحساب / المنشور'}</label>
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
  head: { marginBottom: 24 },
  title: { fontSize: 38, fontWeight: 800 },
  sub: { color: theme.textDim, fontSize: 16, marginTop: 6 },
  catRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28, maxHeight: 130, overflowY: 'auto', padding: 4 },
  catChip: { padding: '9px 16px', borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.bgCard, color: theme.textDim, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' },
  catActive: { background: theme.gradient, color: '#fff', border: '1px solid transparent' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 },
  card: { display: 'flex', flexDirection: 'column', padding: 20, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 18 },
  cardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  cardCat: { display: 'inline-block', padding: '4px 10px', borderRadius: 100, background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', fontSize: 12, fontWeight: 600 },
  refillBadge: { padding: '4px 10px', borderRadius: 100, background: 'rgba(34,197,94,0.12)', color: '#86efac', fontSize: 11, fontWeight: 600 },
  cardName: { fontSize: 15, fontWeight: 600, lineHeight: 1.7, marginBottom: 12, flex: 1 },
  cardMeta: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: theme.textFaint, marginBottom: 14 },
  timeChip: { color: '#93c5fd' },
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
  modal: { width: '100%', maxWidth: 460, background: '#151332', border: `1px solid ${theme.border}`, borderRadius: 24, padding: 28, maxHeight: '90vh', overflowY: 'auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  title: { fontSize: 22, fontWeight: 800 },
  close: { background: 'none', border: 'none', color: theme.textDim, fontSize: 20 },
  svcName: { padding: 14, background: 'rgba(139,92,246,0.1)', borderRadius: 12, fontSize: 14, lineHeight: 1.7, marginBottom: 14 },
  platformHint: { padding: '10px 14px', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12, fontSize: 13, color: '#93c5fd', marginBottom: 12 },
  timeHint: { padding: '8px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 12, fontSize: 13, color: theme.textDim, marginBottom: 16 },
  label: { display: 'block', fontSize: 13, color: theme.textDim, marginBottom: 8, fontWeight: 600 },
  input: { width: '100%', boxSizing: 'border-box', padding: '13px 16px', marginBottom: 16, background: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.border}`, borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none' },
  summary: { background: 'rgba(0,0,0,0.25)', borderRadius: 14, padding: 16, marginBottom: 16 },
  sumRow: { display: 'flex', justifyContent: 'space-between', fontSize: 15, padding: '5px 0' },
  error: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 14, textAlign: 'center', lineHeight: 1.7 },
  confirm: { width: '100%', padding: '15px 0', border: 'none', borderRadius: 14, background: theme.gradient, color: '#fff', fontSize: 16, fontWeight: 700, minHeight: 52 },
  successBox: { textAlign: 'center', padding: '10px 0' },
  checkCircle: { width: 70, height: 70, margin: '0 auto 18px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, color: '#22c55e' },
  successTitle: { fontSize: 22, fontWeight: 800, marginBottom: 16 },
  orderIdBox: { display: 'flex', flexDirection: 'column', gap: 4, padding: '14px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 14, marginBottom: 16 },
  orderIdLabel: { fontSize: 13, color: theme.textDim },
  orderIdNum: { fontSize: 26, fontWeight: 800, color: '#c4b5fd' },
  successDesc: { color: theme.textDim, fontSize: 14, lineHeight: 1.8 },
};
