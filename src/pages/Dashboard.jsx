import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { theme } from '../theme';
import ReviewModal from '../components/ReviewModal';

const statusMap = {
  pending: { label: 'قيد الانتظار', color: '#B45309' },
  processing: { label: 'قيد التنفيذ', color: '#1D4ED8' },
  completed: { label: 'مكتمل', color: '#15803D' },
  partial: { label: 'جزئي', color: '#B45309' },
  canceled: { label: 'ملغي', color: '#B91C1C' },
  failed: { label: 'فشل', color: '#B91C1C' },
};

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [reviewedIds, setReviewedIds] = useState([]);
  const [reviewOrder, setReviewOrder] = useState(null);

  useEffect(() => {
    if (!loading && !user) nav('/auth');
  }, [loading, user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, services(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setOrders(data || []);
      setLoadingOrders(false);

      const { data: myReviews } = await supabase
        .from('reviews')
        .select('order_id')
        .eq('user_id', user.id);
      setReviewedIds((myReviews || []).map((r) => r.order_id));
    })();
  }, [user]);

  function handleReviewClose(done) {
    if (done && reviewOrder) setReviewedIds((prev) => [...prev, reviewOrder.id]);
    setReviewOrder(null);
  }

  if (loading || !user) return <div style={s.center}><span className="spinner" /></div>;

  return (
    <div style={s.wrap}>
      <h1 style={s.title}>مرحباً، {profile?.username || 'مستخدم'} 👋</h1>

      <div style={s.cards}>
        <div style={s.statCard}>
          <span style={s.statLbl}>رصيدك الحالي</span>
          <div style={s.statVal}>{Number(profile?.balance_sar || 0).toFixed(2)} <span style={s.cur}>ر.س</span></div>
          <Link to="/wallet" style={s.statBtn}>اشحن رصيد</Link>
        </div>
        <div style={s.statCard}>
          <span style={s.statLbl}>عدد طلباتك</span>
          <div style={s.statVal}>{orders.length}</div>
          <Link to="/services" style={s.statBtn}>اطلب خدمة</Link>
        </div>
        <div style={s.statCard}>
          <span style={s.statLbl}>طلبات مكتملة</span>
          <div style={s.statVal}>{orders.filter((o) => o.status === 'completed').length}</div>
        </div>
      </div>

      <h2 style={s.h2}>سجل الطلبات</h2>
      {loadingOrders ? (
        <div style={s.center}><span className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div style={s.empty}>
          <p>ما عندك طلبات بعد.</p>
          <Link to="/services" style={s.emptyBtn}>تصفّح الخدمات</Link>
        </div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>#</th>
                <th style={s.th}>الخدمة</th>
                <th style={s.th}>الكمية</th>
                <th style={s.th}>التكلفة</th>
                <th style={s.th}>الحالة</th>
                <th style={s.th}>التاريخ</th>
                <th style={s.th}>التقييم</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const st = statusMap[o.status] || statusMap.pending;
                const reviewed = reviewedIds.includes(o.id);
                return (
                  <tr key={o.id} style={s.tr}>
                    <td style={s.td}>{o.id}</td>
                    <td style={s.td}><span style={s.svcCell}>{o.services?.name || '—'}</span></td>
                    <td style={s.td}>{o.quantity?.toLocaleString('ar')}</td>
                    <td style={s.td}>{Number(o.charged_sar).toFixed(2)} ر.س</td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, color: st.color, background: `${st.color}1A` }}>{st.label}</span>
                      {o.refunded_at && <span style={s.refunded}>↩ استُرجع {Number(o.refunded_sar).toFixed(2)} ر.س</span>}
                    </td>
                    <td style={s.td}>{new Date(o.created_at).toLocaleDateString('ar-SA')}</td>
                    <td style={s.td}>
                      {o.status !== 'completed' ? (
                        <span style={s.dash}>—</span>
                      ) : reviewed ? (
                        <span style={s.done}>★ تم التقييم</span>
                      ) : (
                        <button type="button" onClick={() => setReviewOrder(o)} style={s.rateBtn}>
                          قيّم الخدمة
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {reviewOrder && (
        <ReviewModal order={reviewOrder} userId={user.id} onClose={handleReviewClose} />
      )}
    </div>
  );
}

const wrap = { maxWidth: 1200, margin: '0 auto', padding: '0 20px' };
const s = {
  wrap: { ...wrap, padding: '40px 20px 60px' },
  title: { fontSize: 32, fontWeight: 800, marginBottom: 28, color: theme.text },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 44 },
  statCard: { padding: 24, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 20 },
  statLbl: { fontSize: 14, color: theme.textDim },
  statVal: { fontSize: 32, fontWeight: 800, margin: '10px 0 16px', color: theme.text },
  cur: { fontSize: 16, color: theme.textDim, fontWeight: 600 },
  statBtn: { display: 'inline-block', padding: '10px 20px', borderRadius: 12, background: theme.gradient, color: '#fff', fontSize: 14, fontWeight: 700, boxShadow: '0 6px 16px rgba(122,93,51,0.22)' },
  h2: { fontSize: 24, fontWeight: 800, marginBottom: 20, color: theme.text },
  center: { textAlign: 'center', padding: '60px 0' },
  empty: { textAlign: 'center', padding: '50px 20px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 20, color: theme.textDim },
  emptyBtn: { display: 'inline-block', marginTop: 16, padding: '11px 24px', borderRadius: 12, background: theme.gradient, color: '#fff', fontWeight: 700 },
  tableWrap: { overflowX: 'auto', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 20 },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 820 },
  th: { textAlign: 'right', padding: '16px 18px', fontSize: 13, color: theme.textDim, fontWeight: 700, borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' },
  tr: {},
  td: { padding: '14px 18px', fontSize: 14, borderBottom: `1px solid ${theme.border}`, color: theme.text },
  svcCell: { display: 'block', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  badge: { padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' },
  refunded: { display: 'block', fontSize: 11, color: '#15803D', marginTop: 5, whiteSpace: 'nowrap' },
  rateBtn: {
    padding: '7px 14px', borderRadius: 10,
    border: '1px solid rgba(156,122,69,0.4)', background: 'rgba(156,122,69,0.12)',
    color: '#7A5D33', fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
  done: { fontSize: 13, color: '#C9A961', fontWeight: 700, whiteSpace: 'nowrap' },
  dash: { color: theme.textDim },
};
