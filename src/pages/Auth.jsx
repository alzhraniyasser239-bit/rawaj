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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) nav('/dashboard'); });
  }, []);

  async function submit() {
    setError('');
    if (!email || !password) return setError('اكتب البريد وكلمة المرور');
    if (mode === 'signup' && !username) return setError('اختر اسم مستخدم');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').insert({ id: data.user.id, username, balance_sar: 0, role: 'user' });
        }
        nav('/dashboard');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav('/dashboard');
      }
    } catch (e) {
      const m = e.message || '';
      if (m.includes('Invalid login')) setError('البريد أو كلمة المرور غير صحيحة');
      else if (m.includes('already registered')) setError('هذا البريد مسجّل مسبقاً');
      else if (m.includes('at least 6')) setError('كلمة المرور لازم ٦ أحرف على الأقل');
      else if (m.includes('duplicate') || m.includes('unique')) setError('اسم المستخدم محجوز، اختر غيره');
      else setError(m || 'صار خطأ، جرّب مرة ثانية');
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
        <p style={s.tagline}>وصولك يبدأ من هنا</p>
        <div style={s.tabs}>
          <button onClick={() => { setMode('login'); setError(''); }} style={{ ...s.tab, ...(mode === 'login' ? s.tabActive : {}) }}>دخول</button>
          <button onClick={() => { setMode('signup'); setError(''); }} style={{ ...s.tab, ...(mode === 'signup' ? s.tabActive : {}) }}>حساب جديد</button>
        </div>
        {mode === 'signup' && (
          <input style={s.input} placeholder="اسم المستخدم" value={username} onChange={(e) => setUsername(e.target.value)} />
        )}
        <input style={s.input} type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
        <input style={s.input} type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" onKeyDown={(e) => e.key === 'Enter' && submit()} />
        {error && <div style={s.error}>{error}</div>}
        <button style={s.submit} onClick={submit} disabled={loading}>
          {loading ? <span className="spinner" /> : mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
        </button>
        <p style={s.switch}>
          {mode === 'login' ? 'ما عندك حساب؟ ' : 'عندك حساب؟ '}
          <span style={s.switchLink} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
            {mode === 'login' ? 'سجّل الآن' : 'ادخل'}
          </span>
        </p>
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
  input: { width: '100%', boxSizing: 'border-box', padding: '14px 16px', marginBottom: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, color: '#fff', fontSize: 15, outline: 'none' },
  error: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 14, textAlign: 'center' },
  submit: { width: '100%', padding: '15px 0', border: 'none', borderRadius: 14, background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', color: '#fff', fontSize: 16, fontWeight: 700, boxShadow: '0 8px 24px rgba(139,92,246,0.35)', marginTop: 6, minHeight: 52 },
  switch: { textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 22 },
  switchLink: { color: '#a78bfa', fontWeight: 700, cursor: 'pointer' },
};
