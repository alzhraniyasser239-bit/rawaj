import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { theme } from '../theme';

export default function ResetPassword() {
  const nav = useNavigate();
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase يضع جلسة مؤقتة من رابط الإيميل — ننتظرها
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true);
      }
    });
    // تحقق إذا فيه جلسة أصلاً
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit() {
    setError('');
    if (!password) return setError('اكتب كلمة المرور الجديدة');
    if (password.length < 6) return setError('كلمة المرور لازم ٦ أحرف على الأقل');
    if (password !== password2) return setError('كلمتا المرور غير متطابقتين');

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => nav('/dashboard'), 2000);
    } catch (e) {
      setError(e.message || 'صار خطأ، جرّب مرة ثانية');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.orb1} /><div style={s.orb2} />
      <div style={s.card}>
        <div style={s.brand}>
          <span style={s.logoAr}>رواج</span>
          <span style={s.logoEn}>RAWAJ</span>
        </div>

        {done ? (
          <div style={s.successBox}>
            <div style={s.check}>✓</div>
            <h3 style={s.successT}>تم تغيير كلمة المرور!</h3>
            <p style={s.successD}>جاري تحويلك للوحة التحكم...</p>
          </div>
        ) : (
          <>
            <h2 style={s.title}>كلمة مرور جديدة</h2>
            <p style={s.desc}>اكتب كلمة المرور الجديدة لحسابك</p>

            {!ready && (
              <div style={s.waitBox}>
                جاري التحقق من الرابط... إذا طالت المدة، اطلب رابط جديد من صفحة الدخول.
              </div>
            )}

            <input style={s.input} type="password" placeholder="كلمة المرور الجديدة" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
            <input style={s.input} type="password" placeholder="تأكيد كلمة المرور" value={password2} onChange={(e) => setPassword2(e.target.value)} dir="ltr" onKeyDown={(e) => e.key === 'Enter' && submit()} />

            {error && <div style={s.error}>{error}</div>}

            <button style={s.submit} onClick={submit} disabled={loading}>
              {loading ? <span className="spinner" /> : 'تغيير كلمة المرور'}
            </button>

            <p style={s.back} onClick={() => nav('/auth')}>→ رجوع لتسجيل الدخول</p>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 20% 20%, #1e1b4b, #0f0a2e 60%, #080618)', position: 'relative', overflow: 'hidden', padding: 20 },
  orb1: { position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)', top: -80, right: -60, filter: 'blur(40px)' },
  orb2: { position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.4), transparent 70%)', bottom: -120, left: -80, filter: 'blur(50px)' },
  card: { position: 'relative', width: '100%', maxWidth: 400, background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: '40px 32px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' },
  brand: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginBottom: 24 },
  logoAr: { fontSize: 42, fontWeight: 800, background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  logoEn: { fontSize: 12, letterSpacing: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 600 },
  title: { fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 8 },
  desc: { textAlign: 'center', color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 24 },
  waitBox: { background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fcd34d', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 16, textAlign: 'center', lineHeight: 1.7 },
  input: { width: '100%', boxSizing: 'border-box', padding: '14px 16px', marginBottom: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#fff', fontSize: 15, outline: 'none' },
  error: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 14, textAlign: 'center' },
  submit: { width: '100%', padding: '15px 0', border: 'none', borderRadius: 14, background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: '#fff', fontSize: 16, fontWeight: 700, boxShadow: '0 8px 24px rgba(139,92,246,0.35)', marginTop: 6, minHeight: 52 },
  back: { textAlign: 'center', color: '#a78bfa', fontSize: 14, fontWeight: 600, marginTop: 20, cursor: 'pointer' },
  successBox: { textAlign: 'center', padding: '20px 0' },
  check: { width: 70, height: 70, margin: '0 auto 18px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, color: '#22c55e' },
  successT: { fontSize: 22, fontWeight: 800, marginBottom: 8 },
  successD: { color: 'rgba(255,255,255,0.6)', fontSize: 15 },
};
