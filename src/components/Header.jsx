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

  return (
    <header style={s.header}>
      <div style={s.inner}>
        <Link to="/" style={s.brand} onClick={() => setOpen(false)}>
          <span style={s.logoAr}>رواج</span>
          <span style={s.logoEn}>RAWAJ</span>
        </Link>

        {/* قائمة سطح المكتب */}
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
              <Link to="/dashboard" style={s.balancePill}>
                <span style={s.balanceNum}>{Number(profile?.balance_sar || 0).toFixed(2)}</span>
                <span style={s.balanceCur}>ر.س</span>
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

      {/* قائمة الجوال المنسدلة */}
      {open && (
        <div style={s.mobileMenu} className="mobile-menu">
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
              <Link to="/auth?mode=signup" onClick={() => setOpen(false)} style={{ ...s.mobileAuthBtn, background: theme.gradient, border: 'none' }}>حساب جديد</Link>
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
    background: 'rgba(11,10,30,0.92)', backdropFilter: 'blur(16px)',
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
  linkActive: { color: '#fff', background: 'rgba(139,92,246,0.15)' },
  adminLink: { color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' },
  actions: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  balancePill: { display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12 },
  balanceNum: { fontWeight: 800, fontSize: 14, color: '#c4b5fd' },
  balanceCur: { fontSize: 11, color: theme.textDim },
  ghostBtn: { padding: '9px 15px', borderRadius: 12, border: `1px solid ${theme.border}`, background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' },
  primaryBtn: { padding: '9px 16px', borderRadius: 12, border: 'none', background: theme.gradient, color: '#fff', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' },
  burger: { display: 'none', background: 'rgba(255,255,255,0.06)', border: `1px solid ${theme.border}`, color: '#fff', fontSize: 20, width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  mobileMenu: { display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 16px 20px', borderTop: `1px solid ${theme.border}`, background: 'rgba(11,10,30,0.98)' },
  mobileLink: { padding: '14px 16px', borderRadius: 12, fontSize: 16, fontWeight: 600, color: theme.textDim, background: 'rgba(255,255,255,0.03)' },
  mobileLinkActive: { color: '#fff', background: 'rgba(139,92,246,0.15)' },
  mobileDivider: { height: 1, background: theme.border, margin: '8px 0' },
  mobileAuthBtn: { padding: '14px 16px', borderRadius: 12, fontSize: 16, fontWeight: 700, color: '#fff', background: 'transparent', border: `1px solid ${theme.border}`, textAlign: 'center', width: '100%' },
};
