import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { theme } from '../theme';

const features = [
  { icon: '⚡', title: 'تنفيذ فوري', desc: 'أغلب الطلبات تبدأ خلال دقائق.' },
  { icon: '💎', title: 'أعلى جودة', desc: 'خدمات مختارة لأفضل النتائج.' },
  { icon: '💬', title: 'دعم متواصل', desc: 'فريق جاهز للرد على استفساراتك.' },
  { icon: '🔗', title: 'ربط API', desc: 'اربط متجرك بموقعنا بسهولة.' },
];

const steps = [
  { n: '1', title: 'أنشئ حساب', desc: 'سجّل واملأ بياناتك في دقيقة.' },
  { n: '2', title: 'اشحن رصيدك', desc: 'أضف رصيداً بطرق دفع آمنة.' },
  { n: '3', title: 'اطلب الخدمة', desc: 'اختر من آلاف الخدمات وابدأ.' },
];

const platforms = [
  { name: 'انستقرام', emoji: '📸' }, { name: 'تيك توك', emoji: '🎵' },
  { name: 'تويتر / X', emoji: '🐦' }, { name: 'تليجرام', emoji: '📱' },
  { name: 'يوتيوب', emoji: '🎬' }, { name: 'فيسبوك', emoji: '📘' },
  { name: 'سناب شات', emoji: '👻' }, { name: 'المزيد', emoji: '✨' },
];

export default function Home() {
  const { user } = useAuth();
  const [orderCount, setOrderCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(4000);

  useEffect(() => {
    supabase.from('orders').select('id', { count: 'exact', head: true })
      .then(({ count }) => { if (count != null) setOrderCount(count); });
    supabase.from('services').select('id', { count: 'exact', head: true }).eq('is_active', true)
      .then(({ count }) => { if (count != null) setServiceCount(count); });
  }, []);

  function fmt(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M+';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K+';
    return String(n);
  }

  return (
    <div>
      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroOrb1} /><div style={s.heroOrb2} />
        <div style={s.heroInner}>
          <div style={s.badge}>الموقع العربي الأول للخدمات المصغّرة</div>
          <h1 style={s.h1}>عزّز حضورك على <span style={s.h1grad}>مواقع التواصل</span></h1>
          <p style={s.heroP}>متابعين، إعجابات، مشاهدات، وتفاعل حقيقي لكل منصاتك — بأسعار تبدأ من ريالات قليلة وتنفيذ فوري.</p>
          <div style={s.heroCtas}>
            <Link to={user ? '/services' : '/auth?mode=signup'} style={s.ctaPrimary}>
              {user ? 'تصفّح الخدمات' : 'ابدأ الآن مجاناً'}
            </Link>
            <Link to="/services" style={s.ctaGhost}>عرض الخدمات</Link>
          </div>
          <div style={s.statRow}>
            <div style={s.stat}><b style={s.statNum}>{fmt(orderCount)}</b><span style={s.statLbl}>طلب مكتمل</span></div>
            <div style={s.statDiv} />
            <div style={s.stat}><b style={s.statNum}>{serviceCount.toLocaleString('en')}+</b><span style={s.statLbl}>خدمة متاحة</span></div>
            <div style={s.statDiv} />
            <div style={s.stat}><b style={s.statNum}>24/7</b><span style={s.statLbl}>دعم فني</span></div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section style={s.section}>
        <div style={s.platGrid} className="plat-grid">
          {platforms.map((p) => (
            <div key={p.name} style={s.platCard}>
              <span style={s.platEmoji}>{p.emoji}</span>
              <span style={s.platName}>{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={s.section}>
        <SectionTitle eyebrow="لماذا رواج" title="مميزات تفرّقنا عن غيرنا" />
        <div style={s.featGrid} className="feat-grid">
          {features.map((f) => (
            <div key={f.title} style={s.featCard}>
              <div style={s.featIcon}>{f.icon}</div>
              <h3 style={s.featTitle}>{f.title}</h3>
              <p style={s.featDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={s.section}>
        <SectionTitle eyebrow="كيف يعمل" title="ابدأ في ٣ خطوات" />
        <div style={s.stepGrid} className="step-grid">
          {steps.map((st) => (
            <div key={st.n} style={s.stepCard}>
              <div style={s.stepNum}>{st.n}</div>
              <h3 style={s.stepTitle}>{st.title}</h3>
              <p style={s.stepDesc}>{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section style={s.ctaBand}>
        <h2 style={s.ctaBandTitle}>جاهز تبدأ رحلتك؟</h2>
        <p style={s.ctaBandP}>انضم لآلاف العملاء وابدأ بتعزيز حساباتك اليوم.</p>
        <Link to={user ? '/services' : '/auth?mode=signup'} style={s.ctaPrimary}>
          {user ? 'تصفّح الخدمات' : 'أنشئ حسابك الآن'}
        </Link>
      </section>
    </div>
  );
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div style={s.secTitle}>
      <span style={s.eyebrow}>{eyebrow}</span>
      <h2 style={s.secH2}>{title}</h2>
    </div>
  );
}

const wrap = { maxWidth: 1200, margin: '0 auto', padding: '0 20px' };
const s = {
  hero: { position: 'relative', overflow: 'hidden', padding: '70px 0 50px', textAlign: 'center' },
  heroOrb1: { position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(156,122,69,0.28), transparent 70%)', top: -180, right: -100, filter: 'blur(60px)' },
  heroOrb2: { position: 'absolute', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,97,0.25), transparent 70%)', top: -80, left: -120, filter: 'blur(60px)' },
  heroInner: { ...wrap, position: 'relative' },
  badge: { display: 'inline-block', padding: '7px 16px', borderRadius: 100, background: 'rgba(156,122,69,0.15)', border: '1px solid rgba(156,122,69,0.35)', color: '#7A5D33', fontSize: 13, fontWeight: 700, marginBottom: 20 },
  h1: { fontSize: 46, fontWeight: 900, lineHeight: 1.25, marginBottom: 18, color: theme.text },
  h1grad: { background: theme.gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroP: { fontSize: 17, color: theme.textDim, maxWidth: 600, margin: '0 auto 30px', lineHeight: 1.9 },
  heroCtas: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 },
  ctaPrimary: { display: 'inline-block', padding: '15px 32px', borderRadius: 14, background: theme.gradient, color: '#fff', fontSize: 16, fontWeight: 700, boxShadow: '0 8px 24px rgba(122,93,51,0.28)' },
  ctaGhost: { padding: '15px 32px', borderRadius: 14, border: `1px solid ${theme.border}`, background: theme.bgCard, color: theme.text, fontSize: 16, fontWeight: 600 },
  statRow: { display: 'inline-flex', alignItems: 'center', gap: 24, padding: '18px 28px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 20, flexWrap: 'wrap', justifyContent: 'center' },
  stat: { display: 'flex', flexDirection: 'column', gap: 2 },
  statNum: { fontSize: 24, fontWeight: 800, background: theme.gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  statLbl: { fontSize: 12, color: theme.textDim },
  statDiv: { width: 1, height: 34, background: theme.border },
  section: { ...wrap, padding: '44px 20px' },
  platGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 },
  platCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 10px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 18 },
  platEmoji: { fontSize: 30 },
  platName: { fontSize: 13, fontWeight: 600, color: theme.textDim, textAlign: 'center' },
  secTitle: { textAlign: 'center', marginBottom: 36 },
  eyebrow: { color: '#9C7A45', fontSize: 14, fontWeight: 700, letterSpacing: 1 },
  secH2: { fontSize: 30, fontWeight: 800, marginTop: 8, color: theme.text },
  featGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  featCard: { padding: 24, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 20, textAlign: 'center' },
  featIcon: { fontSize: 32, marginBottom: 12 },
  featTitle: { fontSize: 18, fontWeight: 700, marginBottom: 8, color: theme.text },
  featDesc: { fontSize: 14, color: theme.textDim, lineHeight: 1.8 },
  stepGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  stepCard: { padding: 28, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 20, textAlign: 'center' },
  stepNum: { width: 52, height: 52, margin: '0 auto 16px', borderRadius: '50%', background: theme.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, boxShadow: '0 8px 18px rgba(122,93,51,0.3)' },
  stepTitle: { fontSize: 18, fontWeight: 700, marginBottom: 8, color: theme.text },
  stepDesc: { fontSize: 14, color: theme.textDim, lineHeight: 1.8 },
  ctaBand: { ...wrap, margin: '40px auto', padding: '48px 30px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(156,122,69,0.16), rgba(201,169,97,0.14))', border: '1px solid rgba(156,122,69,0.3)', borderRadius: 28 },
  ctaBandTitle: { fontSize: 30, fontWeight: 800, marginBottom: 12, color: theme.text },
  ctaBandP: { fontSize: 16, color: theme.textDim, marginBottom: 26 },
};
