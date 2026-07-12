import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { theme } from '../theme';

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

  return (
    <header style={s.header}>
      <div style={s.inner}>
        <Link to="/" style={s.brand}>
          <span style={s.logoAr}>رواج</span>
          <span style={s.logoEn}>RAWAJ</span>
        </Link>

        <nav style={{ ...s.nav, ...(open ? s.navOpen : {}) }}>
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              style={{ ...s.link, ...(loc.pathname === l.to ? s.linkActive : {}) }}
            >
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
              <button style={s.ghostBtn} onClick={() => { signOut(); nav('/'); }}>خروج</button>
            </>
          ) : (
            <>
              <Link to="/auth" style={s.ghostBtn}>دخول</Link>
              <Link to="/auth?mode=signup" style={s.primaryBtn}>حساب جديد</Link>
            </>
          )}
          <button style={s.burger} onClick={() => setOpen(!open)}>☰</button>
        </div>
      </div>
    </header>
  );
}

const s = {
  header: {
    position: 'sticky', top: 0, zIndex: 50,
    background: 'rgba(11,10,30,0.85)', backdropFilter: 'blur(16px)',
    borderBottom: `1px solid ${theme.border}`,
  },
  inner: {
    maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 68,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
  },
  brand: { display: 'flex', flexDirection: 'column', lineHeight: 1 },
  logoAr: {
    fontSize: 26, fontWeight: 800,
    background: theme.gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  logoEn: { fontSize: 9, letterSpacing: 4, color: theme.textFaint, fontWeight: 700 },
  nav: { display: 'flex', gap: 6, alignItems: 'center' },
  navOpen: {},
  link: {
    padding: '8px 14px', borderRadius: 10, fontSize: 15, fontWeight: 600,
    color: theme.textDim, transition: 'all 0.2s',
  },
  linkActive: { color: '#fff', background: 'rgba(139,92,246,0.15)' },
  actions: { display: 'flex', alignItems: 'center', gap: 10 },
  balancePill: {
    display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px',
    background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: 12,
  },
  balanceNum: { fontWeight: 800, fontSize: 15, color: '#c4b5fd' },
  balanceCur: { fontSize: 12, color: theme.textDim },
  ghostBtn: {
    padding: '9px 16px', borderRadius: 12, border: `1px solid ${theme.border}`,
    background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 600,
  },
  primaryBtn: {
    padding: '9px 18px', borderRadius: 12, border: 'none',
    background: theme.gradient, color: '#fff', fontSize: 14, fontWeight: 700,
    boxShadow: '0 4px 14px rgba(139,92,246,0.35)',
  },
  burger: { display: 'none', background: 'none', border: 'none', color: '#fff', fontSize: 22 },
};
