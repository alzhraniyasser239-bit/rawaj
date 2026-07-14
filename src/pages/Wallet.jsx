import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { theme } from '../theme';

// ⚙️ عدّل هذي المعلومات ببياناتك الحقيقية
const BANK_INFO = {
  bankName: 'مصرف الراجحي',
  accountName: 'اسمك الكامل',
  iban: 'SA0000000000000000000000',
};
const SUPPORT_WHATSAPP = '966591782702';


export default function Wallet() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [method, setMethod] = useState('bank');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);

  useEffect(() => { if (!loading && !user) nav('/auth'); }, [loading, user]);

  useEffect(() => {
    if (!user) return;
    supabase.from('wallet_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => setRequests(data || []));
  }, [user, done]);

  async function submitBank() {
    setError('');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return setError('اكتب مبلغ صحيح');
    setSubmitting(true);
    try {
      const { error } = await supabase.from('wallet_requests').insert({
        user_id: user.id, amount_sar: amt, method: 'bank_transfer', status: 'pending',
      });
      if (error) throw error;
      setDone(true); setAmount('');
    } catch (e) {
      setError(e.message || 'صار خطأ، جرّب مرة ثانية');
    } finally { setSubmitting(false); }
  }

  const waText = encodeURIComponent(`مرحباً، أبي أشحن رصيد في حسابي بموقع رواج. المبلغ: ${amount || '___'} ريال. طريقة الدفع: بطاقة.`);

  if (loading || !user) return <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" /></div>;

  return (
    <div style={s.wrap}>
      <h1 style={s.title}>شحن الرصيد</h1>
      <p style={s.sub}>اختر طريقة الشحن المناسبة لك</p>

      <div style={s.methodTabs}>
        <button style={{ ...s.mTab, ...(method === 'bank' ? s.mTabActive : {}) }} onClick={() => setMethod('bank')}>🏦 تحويل بنكي</button>
        <button style={{ ...s.mTab, ...(method === 'card' ? s.mTabActive : {}) }} onClick={() => setMethod('card')}>💳 بطاقة عبر الدعم</button>
      </div>

      {method === 'bank' ? (
        <div style={s.panel}>
          {done ? (
            <div style={s.successBox}>
              <div style={s.check}>✓</div>
              <h3 style={s.successT}>تم استلام طلبك</h3>
              <p style={s.successD}>حوّل المبلغ على الحساب البنكي، وبعد التأكد بيتم شحن رصيدك. تقدر ترسل صورة الإيصال للدعم لتسريع العملية.</p>
              <button style={s.againBtn} onClick={() => setDone(false)}>طلب جديد</button>
            </div>
          ) : (
            <>
              <div style={s.bankBox}>
                <BankRow label="البنك" value={BANK_INFO.bankName} />
                <BankRow label="اسم المستفيد" value={BANK_INFO.accountName} />
                <BankRow label="الآيبان" value={BANK_INFO.iban} copyable />
              </div>
              <label style={s.label}>المبلغ (ر.س)</label>
              <input style={s.input} type="number" placeholder="مثال: 50" value={amount} onChange={(e) => setAmount(e.target.value)} dir="ltr" />
              {error && <div style={s.error}>{error}</div>}
              <button style={s.submit} onClick={submitBank} disabled={submitting}>
                {submitting ? <span className="spinner" /> : 'أبلغت بالتحويل'}
              </button>
              <p style={s.note}>بعد الضغط، حوّل المبلغ وأرسل الإيصال للدعم لتأكيد الشحن.</p>
            </>
          )}
        </div>
      ) : (
        <div style={s.panel}>
          <div style={s.cardInfo}>
            <p style={s.cardText}>للدفع ببطاقة (سوا / مدى / فيزا)، تواصل مع الدعم مباشرة. تعطيه رقم بطاقتك أو تدفع عبر الرابط اللي يرسله لك، وهو يشحن رصيدك يدوياً.</p>
          </div>
          <label style={s.label}>المبلغ المطلوب (ر.س)</label>
          <input style={s.input} type="number" placeholder="مثال: 50" value={amount} onChange={(e) => setAmount(e.target.value)} dir="ltr" />
          <a style={s.waBtnFull} href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${waText}`} target="_blank" rel="noreferrer">💬 تواصل مع الدعم على واتساب</a>
        </div>
      )}

      {requests.length > 0 && (
        <div style={s.history}>
          <h2 style={s.h2}>طلبات الشحن السابقة</h2>
          {requests.map((r) => (
            <div key={r.id} style={s.histRow}>
              <span>{Number(r.amount_sar).toFixed(2)} ر.س</span>
              <span style={s.histMethod}>{r.method === 'bank_transfer' ? 'تحويل بنكي' : 'بطاقة'}</span>
              <StatusBadge status={r.status} />
              <span style={s.histDate}>{new Date(r.created_at).toLocaleDateString('ar-SA')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BankRow({ label, value, copyable }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={s.bankRow}>
      <span style={s.bankLabel}>{label}</span>
      <span style={s.bankValue} dir={copyable ? 'ltr' : 'rtl'}>{value}</span>
      {copyable && (
        <button style={s.copyBtn} onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
          {copied ? '✓' : 'نسخ'}
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { pending: { l: 'قيد المراجعة', c: '#f59e0b' }, approved: { l: 'تمت', c: '#22c55e' }, rejected: { l: 'مرفوضة', c: '#ef4444' } };
  const st = map[status] || map.pending;
  return <span style={{ ...s.badge, color: st.c, background: `${st.c}22` }}>{st.l}</span>;
}

const wrap = { maxWidth: 680, margin: '0 auto', padding: '0 20px' };
const s = {
  wrap: { ...wrap, padding: '40px 20px 60px' },
  title: { fontSize: 32, fontWeight: 800 },
  sub: { color: theme.textDim, fontSize: 16, marginTop: 6, marginBottom: 28 },
  methodTabs: { display: 'flex', gap: 12, marginBottom: 24 },
  mTab: { flex: 1, padding: '16px 0', borderRadius: 16, border: `1px solid ${theme.border}`, background: theme.bgCard, color: theme.textDim, fontSize: 15, fontWeight: 700 },
  mTabActive: { background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', color: '#fff' },
  panel: { padding: 28, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 22 },
  bankBox: { background: 'rgba(0,0,0,0.25)', borderRadius: 16, padding: 18, marginBottom: 22 },
  bankRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${theme.border}` },
  bankLabel: { fontSize: 13, color: theme.textDim, minWidth: 90 },
  bankValue: { fontSize: 14, fontWeight: 600, flex: 1 },
  copyBtn: { padding: '6px 14px', borderRadius: 10, border: `1px solid ${theme.border}`, background: 'transparent', color: '#c4b5fd', fontSize: 13, fontWeight: 600 },
  label: { display: 'block', fontSize: 13, color: theme.textDim, marginBottom: 8, fontWeight: 600 },
  input: { width: '100%', boxSizing: 'border-box', padding: '14px 16px', marginBottom: 16, background: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.border}`, borderRadius: 12, color: '#fff', fontSize: 16, outline: 'none' },
  submit: { width: '100%', padding: '15px 0', border: 'none', borderRadius: 14, background: theme.gradient, color: '#fff', fontSize: 16, fontWeight: 700, minHeight: 52 },
  note: { fontSize: 13, color: theme.textFaint, textAlign: 'center', marginTop: 14, lineHeight: 1.7 },
  error: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 14, textAlign: 'center' },
  cardInfo: { marginBottom: 20 },
  cardText: { color: theme.textDim, fontSize: 15, lineHeight: 1.9 },
  contactRow: { display: 'flex', gap: 12, marginTop: 8 },
  waBtn: { flex: 1, padding: '15px 0', borderRadius: 14, background: '#25D366', color: '#fff', fontSize: 15, fontWeight: 700, textAlign: 'center' },
  waBtnFull: { display: 'block', width: '100%', boxSizing: 'border-box', padding: '16px 0', borderRadius: 14, background: '#25D366', color: '#fff', fontSize: 16, fontWeight: 700, textAlign: 'center' },
  successBox: { textAlign: 'center', padding: '10px 0' },
  check: { width: 66, height: 66, margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: '#22c55e' },
  successT: { fontSize: 21, fontWeight: 800, marginBottom: 10 },
  successD: { color: theme.textDim, fontSize: 15, lineHeight: 1.9, marginBottom: 20 },
  againBtn: { padding: '12px 26px', borderRadius: 12, border: `1px solid ${theme.border}`, background: 'transparent', color: '#fff', fontWeight: 600 },
  history: { marginTop: 40 },
  h2: { fontSize: 20, fontWeight: 800, marginBottom: 16 },
  histRow: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 14, marginBottom: 10, fontSize: 14 },
  histMethod: { color: theme.textDim, flex: 1 },
  histDate: { color: theme.textFaint, fontSize: 13 },
  badge: { padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700 },
};
