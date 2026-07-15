import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, SUPABASE_URL } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { theme } from '../theme';

export default function Admin() {
  const { user, profile, loading } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState('wallet');
  const [walletReqs, setWalletReqs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState('');
  const [chargeUser, setChargeUser] = useState('');
  const [chargeAmt, setChargeAmt] = useState('');

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) nav('/');
  }, [loading, user, profile]);

  async function loadData() {
    const { data: wr, error: wrErr } = await supabase
      .from('wallet_requests')
      .select('*, profiles!wallet_requests_user_id_fkey(username)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (wrErr) setMsg('خطأ في تحميل طلبات الشحن: ' + wrErr.message);
    setWalletReqs(wr || []);

    const { data: ord, error: ordErr } = await supabase
      .from('orders')
      .select('*, profiles(username), services(name)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (ordErr) setMsg('خطأ في تحميل الطلبات: ' + ordErr.message);
    setOrders(ord || []);
  }

  useEffect(() => { if (profile?.role === 'admin') loadData(); }, [profile]);

  async function callAdmin(body) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${SUPABASE_URL}/functions/v1/admin---actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  async function approve(id) {
    setBusy(id); setMsg('');
    const out = await callAdmin({ action: 'approve_wallet', request_id: id });
    if (out.error) setMsg('خطأ: ' + out.error);
    else { setMsg('تمت الموافقة وشحن الرصيد ✓'); loadData(); }
    setBusy(null);
  }

  async function reject(id) {
    setBusy(id); setMsg('');
    const out = await callAdmin({ action: 'reject_wallet', request_id: id });
    if (out.error) setMsg('خطأ: ' + out.error);
    else { setMsg('تم رفض الطلب'); loadData(); }
    setBusy(null);
  }

  async function manualCharge() {
    setMsg('');
    if (!chargeUser || !chargeAmt) return setMsg('اكتب اليوزر والمبلغ');
    setBusy('charge');
    const out = await callAdmin({ action: 'manual_charge', username: chargeUser.trim(), amount: parseFloat(chargeAmt) });
    if (out.error) setMsg('خطأ: ' + out.error);
    else { setMsg(`تم شحن ${chargeAmt} ر.س لـ ${out.username} (رصيده الآن: ${out.new_balance})`); setChargeUser(''); setChargeAmt(''); }
    setBusy(null);
  }

  if (loading || profile?.role !== 'admin') return <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" /></div>;

  const pendingCount = walletReqs.filter((r) => r.status === 'pending').length;

  return (
    <div style={s.wrap}>
      <h1 style={s.title}>لوحة التحكم — الإدارة</h1>
      {msg && <div style={s.msg}>{msg}</div>}
      <div style={s.chargeBox}>
        <h3 style={s.chargeTitle}>شحن يدوي (للدفع بالبطاقة)</h3>
        <div style={s.chargeRow}>
          <input style={s.chargeInput} placeholder="اسم المستخدم" value={chargeUser} onChange={(e) => setChargeUser(e.target.value)} />
          <input style={s.chargeInput} type="number" placeholder="المبلغ" value={chargeAmt} onChange={(e) => setChargeAmt(e.target.value)} dir="ltr" />
          <button style={s.chargeBtn} onClick={manualCharge} disabled={busy === 'charge'}>
            {busy === 'charge' ? '...' : 'اشحن'}
          </button>
        </div>
      </div>
      <div style={s.tabs}>
        <button style={{ ...s.tab, ...(tab === 'wallet' ? s.tabActive : {}) }} onClick={() => setTab('wallet')}>
          طلبات الشحن {pendingCount > 0 && <span style={s.dot}>{pendingCount}</span>}
        </button>
        <button style={{ ...s.tab, ...(tab === 'orders' ? s.tabActive : {}) }} onClick={() => setTab('orders')}>الطلبات</button>
      </div>
      {tab === 'wallet' ? (
        <div style={s.list}>
          {walletReqs.length === 0 && <div style={s.empty}>لا توجد طلبات شحن</div>}
          {walletReqs.map((r) => (
            <div key={r.id} style={s.row}>
              <div style={s.rowInfo}>
                <b>{r.profiles?.username || 'مستخدم'}</b>
                <span style={s.amt}>{Number(r.amount_sar).toFixed(2)} ر.س</span>
                <span style={s.rowMethod}>{r.method === 'bank_transfer' ? 'تحويل بنكي' : 'بطاقة'}</span>
                <span style={s.rowDate}>{new Date(r.created_at).toLocaleString('ar-SA')}</span>
              </div>
              {r.status === 'pending' ? (
                <div style={s.actions}>
                  <button style={s.approveBtn} onClick={() => approve(r.id)} disabled={busy === r.id}>موافقة</button>
                  <button style={s.rejectBtn} onClick={() => reject(r.id)} disabled={busy === r.id}>رفض</button>
                </div>
              ) : (
                <span style={{ ...s.status, color: r.status === 'approved' ? theme.success : theme.danger }}>
                  {r.status === 'approved' ? 'تمت ✓' : 'مرفوضة'}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={s.list}>
          {orders.length === 0 && <div style={s.empty}>لا توجد طلبات</div>}
          {orders.map((o) => (
            <div key={o.id} style={s.row}>
              <div style={s.rowInfo}>
                <b>#{o.id}</b>
                <span>{o.profiles?.username || 'مستخدم'}</span>
                <span style={s.svcCell}>{o.services?.name || '—'}</span>
                <span>{o.quantity?.toLocaleString('ar')}</span>
                <span style={s.amt}>{Number(o.charged_sar).toFixed(2)} ر.س</span>
              </div>
              <span style={s.orderStatus}>{o.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const wrap = { maxWidth: 1000, margin: '0 auto', padding: '0 20px' };
const s = {
  wrap: { ...wrap, padding: '40px 20px 60px' },
  title: { fontSize: 30, fontWeight: 800, marginBottom: 24 },
  msg: { padding: '12px 16px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12, marginBottom: 20, fontSize: 14, color: '#c4b5fd' },
  chargeBox: { padding: 22, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 18, marginBottom: 28 },
  chargeTitle: { fontSize: 16, fontWeight: 700, marginBottom: 14 },
  chargeRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  chargeInput: { flex: 1, minWidth: 140, boxSizing: 'border-box', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.border}`, borderRadius: 12, color: '#fff', fontSize: 15, outline: 'none' },
  chargeBtn: { padding: '12px 28px', borderRadius: 12, border: 'none', background: theme.gradient, color: '#fff', fontSize: 15, fontWeight: 700 },
  tabs: { display: 'flex', gap: 10, marginBottom: 20 },
  tab: { padding: '11px 22px', borderRadius: 12, border: `1px solid ${theme.border}`, background: theme.bgCard, color: theme.textDim, fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 },
  tabActive: { background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: '#fff' },
  dot: { background: theme.danger, color: '#fff', fontSize: 12, fontWeight: 700, minWidth: 20, height: 20, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  empty: { textAlign: 'center', padding: 40, color: theme.textDim, background: theme.bgCard, borderRadius: 16 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '16px 18px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 14, flexWrap: 'wrap' },
  rowInfo: { display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 14 },
  amt: { fontWeight: 800, color: '#c4b5fd' },
  rowMethod: { color: theme.textDim, fontSize: 13 },
  rowDate: { color: theme.textFaint, fontSize: 12 },
  svcCell: { maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: theme.textDim },
  actions: { display: 'flex', gap: 8 },
  approveBtn: { padding: '9px 18px', borderRadius: 10, border: 'none', background: theme.success, color: '#fff', fontSize: 14, fontWeight: 700 },
  rejectBtn: { padding: '9px 18px', borderRadius: 10, border: `1px solid ${theme.danger}`, background: 'transparent', color: theme.danger, fontSize: 14, fontWeight: 700 },
  status: { fontSize: 14, fontWeight: 700 },
  orderStatus: { fontSize: 13, fontWeight: 700, color: theme.textDim, padding: '5px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 100 },
};
