import { Link } from 'react-router-dom';
import { theme } from '../theme';

export default function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.inner}>
        <div style={s.col}>
          <span style={s.logoAr}>رواج</span>
          <p style={s.desc}>الموقع العربي الأول لخدمات التواصل الاجتماعي. جودة عالية، أسعار منافسة، ودعم فني على مدار الساعة.</p>
        </div>
        <div style={s.col}>
          <h4 style={s.h4}>روابط</h4>
          <Link to="/services" style={s.flink}>الخدمات</Link>
          <Link to="/dashboard" style={s.flink}>لوحة التحكم</Link>
          <Link to="/wallet" style={s.flink}>شحن الرصيد</Link>
          <Link to="/blog" style={s.flink}>مقالات</Link>
        </div>
        <div style={s.col}>
          <h4 style={s.h4}>المساعدة</h4>
          <Link to="/faq" style={s.flink}>الأسئلة الشائعة</Link>
          <Link to="/terms" style={s.flink}>شروط الاستخدام</Link>
          <Link to="/privacy" style={s.flink}>سياسة الخصوصية</Link>
          <Link to="/refund" style={s.flink}>سياسة الاسترجاع</Link>
          <Link to="/contact" style={s.flink}>الاتصال بنا</Link>
        </div>
      </div>
      <div style={s.bottom}>
        <span>© {new Date().getFullYear()} رواج — جميع الحقوق محفوظة</span>
      </div>
    </footer>
  );
}

const s = {
  footer: { borderTop: `1px solid ${theme.border}`, background: '#08071a', marginTop: 80 },
  inner: {
    maxWidth: 1200, margin: '0 auto', padding: '50px 20px 30px',
    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 40,
  },
  col: { display: 'flex', flexDirection: 'column', gap: 10 },
  logoAr: {
    fontSize: 28, fontWeight: 800,
    background: theme.gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  desc: { color: theme.textDim, fontSize: 14, lineHeight: 1.9, maxWidth: 340 },
  h4: { fontSize: 15, fontWeight: 700, marginBottom: 6 },
  flink: { color: theme.textDim, fontSize: 14, padding: '3px 0' },
  bottom: {
    borderTop: `1px solid ${theme.border}`, padding: '20px', textAlign: 'center',
    color: theme.textFaint, fontSize: 13,
  },
};
