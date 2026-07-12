import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { theme } from '../theme';

const statusMap = {
  pending: { label: 'قيد الانتظار', color: '#f59e0b' },
  processing: { label: 'قيد التنفيذ', color: '#3b82f6' },
  completed: { label: 'مكتمل', color: '#22c55e' },
  partial: { label: 'جزئي', color: '#f59e0b' },
  canceled: { label: 'ملغي', color: '#ef4444' },
  failed: { label: 'فشل', color: '#ef4444' },
};

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

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
    })();
  }, [user]);

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
          <Link to="/services" style={s.statBtnGhost}>اطلب خدمة</Link>
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
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const st = statusMap[o.status] || statusMap.pending;
                return (
                  <tr key={o.id} style={s.tr}>
                    <td style={s.td}>{o.id}</td>
                    <td style={s.td}><span style={s.svcCell}>{o.services?.name || '—'}</span></td>
                    <td style={s.td}>{o.quantity?.toLocaleString('ar')}</td>
                    <td style={s.td}>{Number(o.charged_sar).toFixed(2)} ر.س</td>
                    <td style={s.td}><span style={{ ...s.badge, color: st.color, background: `${st.color}22` }}>{st.label}</span></td>
                    <td style={s.td}>{new Date(o.created_at).toLocaleDateString('ar-SA')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const wrap = { maxWidth: 1200, margin: '0 auto', padding: '0 20px' };
const s = {
  wrap: { ...wrap, padding: '40px 20px 60px' },
  title: { fontSize: 32, fontWeight: 800, marginBottom: 28 },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 44 },
  statCard: { padding: 24, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 20 },
  statLbl: { fontSize: 14, color: theme.textDim },
  statVal: { fontSize: 32, fontWeight: 800, margin: '10px 0 16px' },
  cur: { fontSize: 16, color: theme.textDim, fontWeight: 600 },
  statBtn: { display: 'inline-block', padding: '10px 20px', borderRadius: 12, background: theme.gradient, color: '#fff', fontSize: 14, fontWeight: 700 },
  statBtnGhost: { display: 'inline-block', padding: '10px 20px', borderRadius: 12, border: `1px solid ${theme.border}`, color: '#fff', fontSize: 14, fontWeight: 600 },
  h2: { fontSize: 24, fontWeight: 800, marginBottom: 20 },
  center: { textAlign: 'center', padding: '60px 0' },
  empty: { textAlign: 'center', padding: '50px 20px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 20, color: theme.textDim },
  emptyBtn: { display: 'inline-block', marginTop: 16, padding: '11px 24px', borderRadius: 12, background: theme.gradient, color: '#fff', fontWeight: 700 },
  tableWrap: { overflowX: 'auto', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 20 },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 700 },
  th: { textAlign: 'right', padding: '16px 18px', fontSize: 13, color: theme.textDim, fontWeight: 700, borderBottom: `1px solid ${theme.border}`, whiteSpace: 'nowrap' },
  tr: {},
  td: { padding: '14px 18px', fontSize: 14, borderBottom: `1px solid ${theme.border}` },
  svcCell: { display: 'block', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  badge: { padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' },
};
