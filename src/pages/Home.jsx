import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { theme } from '../theme';

const features = [
  { icon: '⚡', title: 'تنفيذ فوري', desc: 'أغلب الطلبات تبدأ خلال دقائق من الدفع.' },
  { icon: '💎', title: 'أعلى جودة', desc: 'خدمات مختارة بعناية لأفضل النتائج.' },
  { icon: '💬', title: 'دعم متواصل', desc: 'فريق جاهز للرد على استفساراتك.' },
  { icon: '🔗', title: 'ربط API', desc: 'اربط متجرك بموقعنا بسهولة.' },
];

const steps = [
  { n: '1', title: 'أنشئ حساب', desc: 'سجّل في موقعنا واملأ بياناتك خلال دقيقة.' },
  { n: '2', title: 'اشحن رصيدك', desc: 'أضف رصيداً لحسابك بطرق دفع آمنة.' },
  { n: '3', title: 'اطلب الخدمة', desc: 'اختر من آلاف الخدمات وابدأ فوراً.' },
];

const platforms = [
  { name: 'انستقرام', emoji: '📸' }, { name: 'تيك توك', emoji: '🎵' },
  { name: 'تويتر / X', emoji: '🐦' }, { name: 'تليجرام', emoji: '📱' },
  { name: 'يوتيوب', emoji: '🎬' }, { name: 'فيسبوك', emoji: '📘' },
  { name: 'سناب شات', emoji: '👻' }, { name: 'المزيد', emoji: '✨' },
];

export default function Home() {
  const { user } = useAuth();
  return (
    <div>
      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroOrb1} /><div style={s.heroOrb2} />
        <div style={s.heroInner}>
          <div style={s.badge}>الموقع العربي الأول للخدمات المصغّرة</div>
          <h1 style={s.h1}>
            عزّز حضورك على <span style={s.h1grad}>مواقع التواصل</span>
          </h1>
          <p style={s.heroP}>
            متابعين، إعجابات، مشاهدات، وتفاعل حقيقي لكل منصاتك — بأسعار تبدأ من ريالات قليلة وتنفيذ فوري.
          </p>
          <div style={s.heroCtas}>
            <Link to={user ? '/services' : '/auth?mode=signup'} style={s.ctaPrimary}>
              {user ? 'تصفّح الخدمات' : 'ابدأ الآن مجاناً'}
            </Link>
            <Link to="/services" style={s.ctaGhost}>عرض الخدمات</Link>
          </div>
          <div style={s.statRow}>
            <div style={s.stat}><b style={s.statNum}>+13M</b><span style={s.statLbl}>طلب مكتمل</span></div>
            <div style={s.statDiv} />
            <div style={s.stat}><b style={s.statNum}>+4000</b><span style={s.statLbl}>خدمة متاحة</span></div>
            <div style={s.statDiv} />
            <div style={s.stat}><b style={s.statNum}>24/7</b><span style={s.statLbl}>دعم فني</span></div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section style={s.section}>
        <div style={s.platGrid}>
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
        <div style={s.featGrid}>
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
        <div style={s.stepGrid}>
          {steps.map((st, i) => (
            <div key={st.n} style={s.stepCard}>
              <div style={s.stepNum}>{st.n}</div>
              <h3 style={s.stepTitle}>{st.title}</h3>
              <p style={s.stepDesc}>{st.desc}</p>
              {i < steps.length - 1 && <div style={s.stepArrow}>←</div>}
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
  hero: { position: 'relative', overflow: 'hidden', padding: '80px 0 60px', textAlign: 'center' },
  heroOrb1: { position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.35), transparent 70%)', top: -180, right: -100, filter: 'blur(60px)' },
  heroOrb2: { position: 'absolute', width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.3), transparent 70%)', top: -80, left: -120, filter: 'blur(60px)' },
  heroInner: { ...wrap, position: 'relative' },
  badge: { display: 'inline-block', padding: '7px 16px', borderRadius: 100, background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', color: '#c4b5fd', fontSize: 13, fontWeight: 600, marginBottom: 24 },
  h1: { fontSize: 52, fontWeight: 900, lineHeight: 1.2, marginBottom: 20 },
  h1grad: { background: theme.gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroP: { fontSize: 18, color: theme.textDim, maxWidth: 620, margin: '0 auto 32px', lineHeight: 1.9 },
  heroCtas: { display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 },
  ctaPrimary: { padding: '15px 32px', borderRadius: 14, background: theme.gradient, color: '#fff', fontSize: 16, fontWeight: 700, boxShadow: '0 8px 28px rgba(139,92,246,0.4)' },
  ctaGhost: { padding: '15px 32px', borderRadius: 14, border: `1px solid ${theme.border}`, color: '#fff', fontSize: 16, fontWeight: 600 },
  statRow: { display: 'inline-flex', alignItems: 'center', gap: 28, padding: '20px 32px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.border}`, borderRadius: 20 },
  stat: { display: 'flex', flexDirection: 'column', gap: 2 },
  statNum: { fontSize: 26, fontWeight: 800, background: theme.gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  statLbl: { fontSize: 13, color: theme.textDim },
  statDiv: { width: 1, height: 36, background: theme.border },
  section: { ...wrap, padding: '50px 20px' },
  platGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  platCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '24px 12px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 18 },
  platEmoji: { fontSize: 32 },
  platName: { fontSize: 14, fontWeight: 600, color: theme.textDim },
  secTitle: { textAlign: 'center', marginBottom: 40 },
  eyebrow: { color: '#a78bfa', fontSize: 14, fontWeight: 700, letterSpacing: 1 },
  secH2: { fontSize: 34, fontWeight: 800, marginTop: 8 },
  featGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 },
  featCard: { padding: 28, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 20 },
  featIcon: { fontSize: 34, marginBottom: 14 },
  featTitle: { fontSize: 18, fontWeight: 700, marginBottom: 8 },
  featDesc: { fontSize: 14, color: theme.textDim, lineHeight: 1.8 },
  stepGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  stepCard: { position: 'relative', padding: 32, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 20, textAlign: 'center' },
  stepNum: { width: 56, height: 56, margin: '0 auto 18px', borderRadius: '50%', background: theme.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, boxShadow: '0 8px 20px rgba(139,92,246,0.4)' },
  stepTitle: { fontSize: 19, fontWeight: 700, marginBottom: 8 },
  stepDesc: { fontSize: 14, color: theme.textDim, lineHeight: 1.8 },
  stepArrow: { position: 'absolute', left: -22, top: '50%', fontSize: 26, color: theme.textFaint },
  ctaBand: { ...wrap, margin: '40px auto', padding: '56px 40px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.15))', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 28 },
  ctaBandTitle: { fontSize: 32, fontWeight: 800, marginBottom: 12 },
  ctaBandP: { fontSize: 16, color: theme.textDim, marginBottom: 28 },
};
