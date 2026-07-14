import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { theme } from '../theme';

export default function Auth() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) nav('/dashboard'); });
  }, []);

  function validEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

  async function submit() {
    setError(''); setInfo('');

    if (mode === 'reset') {
      if (!validEmail(email)) return setError('اكتب بريد إلكتروني صحيح');
      setLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password',
        });
        if (error) throw error;
        setInfo('أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك. تحقق من صندوق الوارد (ومجلد الرسائل غير المرغوبة).');
      } catch (e) {
        setError(e.message || 'صار خطأ، جرّب مرة ثانية');
      } finally { setLoading(false); }
      return;
    }

    if (!validEmail(email)) return setError('اكتب بريد إلكتروني صحيح');
    if (!password) return setError('اكتب كلمة المرور');
    if (mode === 'signup') {
      if (!username.trim()) return setError('اختر اسم مستخدم');
      if (username.trim().length < 3) return setError('اسم المستخدم لازم ٣ أحرف على الأقل');
      if (password.length < 6) return setError('كلمة المرور لازم ٦ أحرف على الأقل');
      if (password !== password2) return setError('كلمتا المرور غير متطابقتين');
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        // تأكد إن اسم المستخدم غير محجوز
        const { data: existing } = await supabase
          .from('profiles').select('id').eq('username', username.trim()).maybeSingle();
        if (existing) { setLoading(false); return setError('اسم المستخدم محجوز، اختر غيره'); }

        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id, username: username.trim(), balance_sar: 0, role: 'user',
          });
        }
        // بعض إعدادات Supabase تتطلب تأكيد البريد
        if (data.session) nav('/dashboard');
        else { setInfo('تم إنشاء حسابك! إذا طُلب تأكيد البريد، تحقق من إيميلك ثم سجّل الدخول.'); setMode('login'); }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav('/dashboard');
      }
    } catch (e) {
      const m = e.message || '';
      if (m.includes('Invalid login')) setError('البريد أو كلمة المرور غير صحيحة');
      else if (m.includes('already registered') || m.includes('already been registered')) setError('هذا البريد مسجّل مسبقاً');
      else if (m.includes('at least 6')) setError('كلمة المرور لازم ٦ أحرف على الأقل');
      else if (m.includes('Email not confirmed')) setError('لازم تأكيد بريدك أولاً، تحقق من إيميلك');
      else if (m.includes('rate limit') || m.includes('too many')) setError('محاولات كثيرة، انتظر شوي وجرّب مرة ثانية');
      else setError(m || 'صار خطأ، جرّب مرة ثانية');
    } finally { setLoading(false); }
  }

  const titleByMode = { login: 'تسجيل الدخول', signup: 'إنشاء الحساب', reset: 'إرسال الرابط' };

  return (
    <div style={s.page}>
      <div style={s.orb1} /><div style={s.orb2} />
      <div style={s.card}>
        <div style={s.brand}>
          <span style={s.logoAr}>رواج</span>
          <span style={s.logoEn}>RAWAJ</span>
        </div>
        <p style={s.tagline}>وصولك يبدأ من هنا</p>

        {mode !== 'reset' && (
          <div style={s.tabs}>
            <button onClick={() => { setMode('login'); setError(''); setInfo(''); }} style={{ ...s.tab, ...(mode === 'login' ? s.tabActive : {}) }}>دخول</button>
            <button onClick={() => { setMode('signup'); setError(''); setInfo(''); }} style={{ ...s.tab, ...(mode === 'signup' ? s.tabActive : {}) }}>حساب جديد</button>
          </div>
        )}

        {mode === 'reset' && (
          <div style={s.resetHead}>
            <button style={s.backBtn} onClick={() => { setMode('login'); setError(''); setInfo(''); }}>→ رجوع</button>
            <p style={s.resetDesc}>اكتب بريدك ونرسل لك رابط إعادة تعيين كلمة المرور.</p>
          </div>
        )}

        {mode === 'signup' && (
          <input style={s.input} placeholder="اسم المستخدم" value={username} onChange={(e) => setUsername(e.target.value)} />
        )}
        <input style={s.input} type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
        {mode !== 'reset' && (
          <input style={s.input} type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" onKeyDown={(e) => e.key === 'Enter' && submit()} />
        )}
        {mode === 'signup' && (
          <input style={s.input} type="password" placeholder="تأكيد كلمة المرور" value={password2} onChange={(e) => setPassword2(e.target.value)} dir="ltr" onKeyDown={(e) => e.key === 'Enter' && submit()} />
        )}

        {mode === 'login' && (
          <div style={s.forgotRow}>
            <span style={s.forgotLink} onClick={() => { setMode('reset'); setError(''); setInfo(''); }}>نسيت كلمة المرور؟</span>
          </div>
        )}

        {error && <div style={s.error}>{error}</div>}
        {info && <div style={s.infoBox}>{info}</div>}

        <button style={s.submit} onClick={submit} disabled={loading}>
          {loading ? <span className="spinner" /> : titleByMode[mode]}
        </button>

        {mode !== 'reset' && (
          <p style={s.switch}>
            {mode === 'login' ? 'ما عندك حساب؟ ' : 'عندك حساب؟ '}
            <span style={s.switchLink} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setInfo(''); }}>
              {mode === 'login' ? 'سجّل الآن' : 'ادخل'}
            </span>
          </p>
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
  brand: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  logoAr: { fontSize: 42, fontWeight: 800, background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  logoEn: { fontSize: 12, letterSpacing: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 600 },
  tagline: { textAlign: 'center', color: 'rgba(255,255,255,0.55)', fontSize: 14, margin: '10px 0 28px' },
  tabs: { display: 'flex', background: 'rgba(0,0,0,0.25)', borderRadius: 14, padding: 4, marginBottom: 22 },
  tab: { flex: 1, padding: '11px 0', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: 600, borderRadius: 10, transition: 'all 0.2s' },
  tabActive: { background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: '#fff', boxShadow: '0 4px 14px rgba(139,92,246,0.4)' },
  resetHead: { marginBottom: 18 },
  backBtn: { background: 'none', border: 'none', color: '#a78bfa', fontSize: 14, fontWeight: 600, padding: 0, marginBottom: 10 },
  resetDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.8 },
  input: { width: '100%', boxSizing: 'border-box', padding: '14px 16px', marginBottom: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#fff', fontSize: 15, outline: 'none' },
  forgotRow: { textAlign: 'left', marginBottom: 14, marginTop: -2 },
  forgotLink: { color: '#a78bfa', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  error: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 14, textAlign: 'center', lineHeight: 1.7 },
  infoBox: { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 14, textAlign: 'center', lineHeight: 1.8 },
  submit: { width: '100%', padding: '15px 0', border: 'none', borderRadius: 14, background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: '#fff', fontSize: 16, fontWeight: 700, boxShadow: '0 8px 24px rgba(139,92,246,0.35)', marginTop: 6, minHeight: 52 },
  switch: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 22 },
  switchLink: { color: '#a78bfa', fontWeight: 700, cursor: 'pointer' },
};
