import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { theme } from '../theme';

const SUPPORT_WHATSAPP = '966591782702';

export default function Wallet() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);
  const [bankInfo, setBankInfo] = useState({ bankName: '', accountName: '', iban: '' });

  useEffect(() => { if (!loading && !user) nav('/auth'); }, [loading, user]);

  useEffect(() => {
    supabase.from('settings').select('key, value').then(({ data }) => {
      if (!data) return;
      const map = {};
      data.forEach((row) => { map[row.key] = row.value; });
      setBankInfo({
        bankName: map.bank_name || '',
        accountName: map.bank_beneficiary || '',
        iban: map.bank_iban || '',
      });
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from('wallet_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => setRequests(data || []));
  }, [user, done]);

  async function submitBank() {
    setError('');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return setError('اكتب مبلغاً صحيحاً');
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

  const waText = encodeURIComponent('مرحباً، أبي أرسل إيصال تحويل لشحن رصيدي في موقع رواج.');

  if (loading || !user) return <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" /></div>;

  return (
    <div style={s.wrap}>
      <h1 style={s.title}>شحن الرصيد</h1>
      <p style={s.sub}>عبر التحويل البنكي</p>

      <div style={s.panel}>
        {done ? (
          <div style={s.successBox}>
            <div style={s.check}>✓</div>
            <h3 style={s.successT}>تم استلام طلبك</h3>
            <p style={s.successD}>حوّل المبلغ على الحساب البنكي أعلاه، ثم أرسل صورة الإيصال للدعم على واتساب ليتم شحن رصيدك.</p>
            <a style={s.waBtnFull} href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${waText}`} target="_blank" rel="noreferrer">
              💬 أرسل الإيصال على واتساب
            </a>
            <button style={s.againBtn} onClick={() => setDone(false)}>طلب جديد</button>
          </div>
        ) : (
          <>
            <div style={s.bankBox}>
              <BankRow label="البنك" value={bankInfo.bankName} />
              <BankRow label="اسم المستفيد" value={bankInfo.accountName} />
              <BankRow label="الآيبان" value={bankInfo.iban} copyable last />
            </div>
            <label style={s.label}>المبلغ (ر.س)</label>
            <input
              style={s.input}
              type="number"
              inputMode="numeric"
              placeholder="مثال: 50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              dir="ltr"
            />
            {error && <div style={s.error}>{error}</div>}
            <button style={s.submit} onClick={submitBank} disabled={submitting}>
              {submitting ? <span className="spinner" /> : 'أبلغت بالتحويل'}
            </button>
            <p style={s.note}>بعد الضغط، حوّل المبلغ وأرسل الإيصال للدعم على واتساب لتأكيد الشحن.</p>
          </>
        )}
      </div>

      {requests.length > 0 && (
        <div style={s.history}>
          <h2 style={s.h2}>طلبات الشحن السابقة</h2>
          {requests.map((r) => (
            <div key={r.id} style={s.histRow}>
              <span style={s.histAmount}>{Number(r.amount_sar).toFixed(2)} ر.س</span>
              <span style={s.histMethod}>تحويل بنكي</span>
              <StatusBadge status={r.status} />
              <span style={s.histDate}>{new Date(r.created_at).toLocaleDateString('ar-SA')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BankRow({ label, value, copyable, last }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ ...s.bankRow, borderBottom: last ? 'none' : `1px solid ${theme.border}` }}>
      <span style={s.bankLabel}>{label}</span>
      <span style={s.bankValue} dir={copyable ? 'ltr' : 'rtl'}>{value}</span>
      {copyable && (
        <button
          style={{ ...s.copyBtn, ...(copied ? s.copyBtnDone : {}) }}
          onClick={() => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? '✓ تم' : 'نسخ'}
        </button>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: { l: 'قيد المراجعة', c: '#B45309' },
    approved: { l: 'تمت', c: '#15803D' },
    rejected: { l: 'مرفوضة', c: '#B91C1C' },
  };
  const st = map[status] || map.pending;
  return <span style={{ ...s.badge, color: st.c, background: `${st.c}1A` }}>{st.l}</span>;
}

const wrap = { maxWidth: 680, margin: '0 auto', padding: '0 20px' };
const s = {
  wrap: { ...wrap, padding: '40px 20px 60px' },
  title: { fontSize: 32, fontWeight: 800, color: theme.text },
  sub: { color: theme.textDim, fontSize: 16, marginTop: 6, marginBottom: 28 },
  panel: { padding: 28, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 22 },
  bankBox: { background: 'rgba(156,122,69,0.08)', border: '1px solid rgba(156,122,69,0.2)', borderRadius: 16, padding: '6px 18px', marginBottom: 22 },
  bankRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' },
  bankLabel: { fontSize: 13, color: theme.textDim, minWidth: 90 },
  bankValue: { fontSize: 14, fontWeight: 700, flex: 1, color: theme.text, wordBreak: 'break-all' },
  copyBtn: { padding: '7px 16px', borderRadius: 10, border: '1px solid rgba(156,122,69,0.4)', background: 'rgba(156,122,69,0.12)', color: '#7A5D33', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' },
  copyBtnDone: { background: 'rgba(21,128,61,0.12)', border: '1px solid rgba(21,128,61,0.4)', color: '#15803D' },
  label: { display: 'block', fontSize: 13, color: theme.textDim, marginBottom: 8, fontWeight: 600 },
  input: { width: '100%', boxSizing: 'border-box', padding: '14px 16px', marginBottom: 16, background: 'rgba(58,42,28,0.05)', border: `1px solid ${theme.border}`, borderRadius: 12, color: theme.text, fontSize: 16, fontFamily: 'inherit', outline: 'none' },
  submit: { width: '100%', padding: '15px 0', border: 'none', borderRadius: 14, background: theme.gradient, color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', minHeight: 52 },
  note: { fontSize: 13, color: theme.textFaint, textAlign: 'center', marginTop: 14, lineHeight: 1.7 },
  error: { background: 'rgba(185,28,28,0.10)', border: '1px solid rgba(185,28,28,0.3)', color: '#991B1B', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 14, textAlign: 'center' },
  waBtnFull: { display: 'block', width: '100%', boxSizing: 'border-box', padding: '16px 0', borderRadius: 14, background: '#25D366', color: '#fff', fontSize: 16, fontWeight: 700, textAlign: 'center', marginBottom: 14 },
  successBox: { textAlign: 'center', padding: '10px 0' },
  check: { width: 66, height: 66, margin: '0 auto 16px', borderRadius: '50%', background: 'rgba(21,128,61,0.12)', border: '2px solid #15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: '#15803D' },
  successT: { fontSize: 21, fontWeight: 800, marginBottom: 10, color: theme.text },
  successD: { color: theme.textDim, fontSize: 15, lineHeight: 1.9, marginBottom: 20 },
  againBtn: { padding: '12px 26px', borderRadius: 12, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textDim, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' },
  history: { marginTop: 40 },
  h2: { fontSize: 20, fontWeight: 800, marginBottom: 16, color: theme.text },
  histRow: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 14, marginBottom: 10, fontSize: 14 },
  histAmount: { fontWeight: 700, color: theme.text },
  histMethod: { color: theme.textDim, flex: 1 },
  histDate: { color: theme.textFaint, fontSize: 13 },
  badge: { padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' },
};
