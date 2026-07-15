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
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 20% 20%, #EFE5D6, #E5D9C7 60%, #DCCFBB)', position: 'relative', overflow: 'hidden', padding: 20 },
  orb1: { position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(156,122,69,0.28), transparent 70%)', top: -80, right: -60, filter: 'blur(40px)' },
  orb2: { position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,97,0.25), transparent 70%)', bottom: -120, left: -80, filter: 'blur(50px)' },
  card: { position: 'relative', width: '100%', maxWidth: 400, background: 'rgba(250,245,236,0.85)', backdropFilter: 'blur(20px)', border: `1px solid ${theme.border}`, borderRadius: 28, padding: '40px 32px', boxShadow: '0 20px 50px rgba(58,42,28,0.15)' },
  brand: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  logoAr: { fontSize: 42, fontWeight: 800, background: theme.gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  logoEn: { fontSize: 12, letterSpacing: 8, color: theme.textFaint, fontWeight: 600 },
  tagline: { textAlign: 'center', color: theme.textDim, fontSize: 14, margin: '10px 0 28px' },
  tabs: { display: 'flex', background: 'rgba(58,42,28,0.07)', borderRadius: 14, padding: 4, marginBottom: 22 },
  tab: { flex: 1, padding: '11px 0', border: 'none', background: 'transparent', color: theme.textDim, fontSize: 15, fontWeight: 600, borderRadius: 10, transition: 'all 0.2s' },
  tabActive: { background: theme.gradient, color: '#fff', boxShadow: '0 4px 12px rgba(122,93,51,0.28)' },
  resetHead: { marginBottom: 18 },
  backBtn: { background: 'none', border: 'none', color: '#9C7A45', fontSize: 14, fontWeight: 700, padding: 0, marginBottom: 10 },
  resetDesc: { color: theme.textDim, fontSize: 14, lineHeight: 1.8 },
  input: { width: '100%', boxSizing: 'border-box', padding: '14px 16px', marginBottom: 14, background: 'rgba(58,42,28,0.05)', border: `1px solid ${theme.border}`, borderRadius: 14, color: theme.text, fontSize: 15, outline: 'none' },
  forgotRow: { textAlign: 'left', marginBottom: 14, marginTop: -2 },
  forgotLink: { color: '#9C7A45', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  error: { background: 'rgba(185,28,28,0.10)', border: '1px solid rgba(185,28,28,0.3)', color: '#991B1B', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 14, textAlign: 'center', lineHeight: 1.7 },
  infoBox: { background: 'rgba(21,128,61,0.10)', border: '1px solid rgba(21,128,61,0.3)', color: '#166534', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 14, textAlign: 'center', lineHeight: 1.8 },
  submit: { width: '100%', padding: '15px 0', border: 'none', borderRadius: 14, background: theme.gradient, color: '#fff', fontSize: 16, fontWeight: 700, boxShadow: '0 8px 20px rgba(122,93,51,0.25)', marginTop: 6, minHeight: 52 },
  switch: { textAlign: 'center', color: theme.textDim, fontSize: 14, marginTop: 22 },
  switchLink: { color: '#9C7A45', fontWeight: 700, cursor: 'pointer' },
};
