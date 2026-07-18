import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { theme } from '../theme';

const ADMIN_EMAIL = 'alzhraniyasser239@gmail.com';

const navLinks = [
  { to: '/', label: 'الرئيسية' },
  { to: '/services', label: 'الخدمات' },
  { to: '/blog', label: 'مقالات' },
  { to: '/faq', label: 'الأسئلة الشائعة' },
  { to: '/contact', label: 'الاتصال بنا' },
];

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL || profile?.role === 'admin';
  const allLinks = isAdmin ? [...navLinks, { to: '/admin', label: '⚙️ الإدارة', admin: true }] : navLinks;

  const initial = (profile?.username || user?.email || '؟').trim().charAt(0).toUpperCase();

  return (
    <header style={s.header}>
      <div style={s.inner}>
        <Link to="/" style={s.brand} onClick={() => setOpen(false)}>
          <span style={s.logoAr}>رواج</span>
          <span style={s.logoEn}>RAWAJ</span>
        </Link>

        <nav style={s.navDesktop} className="nav-desktop">
          {allLinks.map((l) => (
            <Link key={l.to} to={l.to}
              style={{ ...s.link, ...(l.admin ? s.adminLink : {}), ...(loc.pathname === l.to ? s.linkActive : {}) }}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div style={s.actions}>
          {user ? (
            <>
              <Link to="/wallet" style={s.balancePill} title="اشحن رصيدك">
                <span style={s.balanceNum}>{Number(profile?.balance_sar || 0).toFixed(2)}</span>
                <span style={s.balanceCur}>ر.س</span>
                <span style={s.balancePlus}>+</span>
              </Link>

              <Link
                to="/dashboard"
                style={{ ...s.avatar, ...(loc.pathname === '/dashboard' ? s.avatarActive : {}) }}
                title="حسابي ولوحة التحكم"
                aria-label="حسابي"
              >
                {initial}
              </Link>

              <button style={s.ghostBtn} className="hide-mobile" onClick={() => { signOut(); nav('/'); }}>خروج</button>
            </>
          ) : (
            <>
              <Link to="/auth" style={s.ghostBtn} className="hide-mobile">دخول</Link>
              <Link to="/auth?mode=signup" style={s.primaryBtn} className="hide-mobile">حساب جديد</Link>
            </>
          )}
          <button style={s.burger} className="burger-btn" onClick={() => setOpen(!open)}>
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <div style={s.mobileMenu} className="mobile-menu">
          {user && (
            <Link to="/dashboard" onClick={() => setOpen(false)} style={s.mobileProfile}>
              <span style={s.mobileAvatar}>{initial}</span>
              <span style={s.mobileProfileText}>
                <b style={s.mobileProfileName}>{profile?.username || 'حسابي'}</b>
                <span style={s.mobileProfileSub}>لوحة التحكم وطلباتي</span>
              </span>
            </Link>
          )}

          {allLinks.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              style={{ ...s.mobileLink, ...(l.admin ? s.adminLink : {}), ...(loc.pathname === l.to ? s.mobileLinkActive : {}) }}>
              {l.label}
            </Link>
          ))}

          <div style={s.mobileDivider} />

          {user ? (
            <button style={s.mobileAuthBtn} onClick={() => { signOut(); nav('/'); setOpen(false); }}>تسجيل الخروج</button>
          ) : (
            <>
              <Link to="/auth" onClick={() => setOpen(false)} style={s.mobileLink}>دخول</Link>
              <Link to="/auth?mode=signup" onClick={() => setOpen(false)} style={{ ...s.mobileAuthBtn, background: theme.gradient, color: '#fff', border: 'none' }}>حساب جديد</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

const s = {
  header: {
    position: 'sticky', top: 0, zIndex: 50,
    background: 'rgba(243,235,221,0.92)', backdropFilter: 'blur(16px)',
    borderBottom: `1px solid ${theme.border}`,
  },
  inner: {
    maxWidth: 1200, margin: '0 auto', padding: '0 16px', height: 64,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  },
  brand: { display: 'flex', flexDirection: 'column', lineHeight: 1, flexShrink: 0 },
  logoAr: { fontSize: 24, fontWeight: 800, background: theme.gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  logoEn: { fontSize: 9, letterSpacing: 4, color: theme.textFaint, fontWeight: 700 },
  navDesktop: { display: 'flex', gap: 4, alignItems: 'center' },
  link: { padding: '8px 12px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: theme.textDim, whiteSpace: 'nowrap' },
  linkActive: { color: theme.text, background: 'rgba(156,122,69,0.18)' },
  adminLink: { color: '#92400E', border: '1px solid rgba(146,64,14,0.35)' },
  actions: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },

  balancePill: { display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', background: 'rgba(156,122,69,0.16)', border: '1px solid rgba(156,122,69,0.35)', borderRadius: 12 },
  balanceNum: { fontWeight: 800, fontSize: 14, color: '#7A5D33' },
  balanceCur: { fontSize: 11, color: theme.textDim },
  balancePlus: { fontSize: 15, fontWeight: 800, color: '#7A5D33', marginRight: 2, opacity: 0.7 },

  avatar: {
    width: 38, height: 38, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: '50%', background: theme.gradient, color: '#fff',
    fontSize: 15, fontWeight: 800,
    border: '2px solid transparent',
    boxShadow: '0 4px 12px rgba(122,93,51,0.25)',
  },
  avatarActive: { border: '2px solid #7A5D33' },

  ghostBtn: { padding: '9px 15px', borderRadius: 12, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.text, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit' },
  primaryBtn: { padding: '9px 16px', borderRadius: 12, border: 'none', background: theme.gradient, color: '#fff', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' },
  burger: { display: 'none', background: 'rgba(58,42,28,0.07)', border: `1px solid ${theme.border}`, color: theme.text, fontSize: 20, width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },

  mobileMenu: { display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 16px 20px', borderTop: `1px solid ${theme.border}`, background: 'rgba(243,235,221,0.99)' },
  mobileProfile: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, background: 'rgba(156,122,69,0.14)', border: '1px solid rgba(156,122,69,0.3)', marginBottom: 8 },
  mobileAvatar: { width: 42, height: 42, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: theme.gradient, color: '#fff', fontSize: 17, fontWeight: 800 },
  mobileProfileText: { display: 'flex', flexDirection: 'column', gap: 2 },
  mobileProfileName: { fontSize: 15, color: theme.text },
  mobileProfileSub: { fontSize: 12, color: theme.textDim },
  mobileLink: { padding: '14px 16px', borderRadius: 12, fontSize: 16, fontWeight: 600, color: theme.textDim, background: 'rgba(58,42,28,0.05)' },
  mobileLinkActive: { color: theme.text, background: 'rgba(156,122,69,0.18)' },
  mobileDivider: { height: 1, background: theme.border, margin: '8px 0' },
  mobileAuthBtn: { padding: '14px 16px', borderRadius: 12, fontSize: 16, fontWeight: 700, color: theme.text, background: 'transparent', border: `1px solid ${theme.border}`, textAlign: 'center', width: '100%', cursor: 'pointer', fontFamily: 'inherit' },
};
