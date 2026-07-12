import { useState } from 'react';
import { theme } from '../theme';

const wrap = { maxWidth: 860, margin: '0 auto', padding: '40px 20px 60px' };
const ps = {
  wrap,
  h1: { fontSize: 34, fontWeight: 800, marginBottom: 10 },
  sub: { color: theme.textDim, fontSize: 16, marginBottom: 32 },
  h2: { fontSize: 20, fontWeight: 700, margin: '28px 0 12px' },
  p: { color: theme.textDim, fontSize: 15, lineHeight: 2, marginBottom: 12 },
};

// الأسئلة الشائعة
const faqs = [
  { q: 'كم يستغرق تنفيذ الطلب؟', a: 'أغلب الطلبات تبدأ خلال دقائق من الدفع، وبعضها قد يستغرق ساعات حسب نوع الخدمة والكمية.' },
  { q: 'هل المتابعين حقيقيين؟', a: 'نوفّر خدمات متنوعة، بعضها متابعين عالي الجودة وبعضها اقتصادي. تفاصيل كل خدمة موضّحة في اسمها.' },
  { q: 'كيف أشحن رصيدي؟', a: 'من صفحة شحن الرصيد، عبر تحويل بنكي أو الدفع ببطاقة عن طريق الدعم الفني.' },
  { q: 'ماذا لو ما نفّذ الطلب؟', a: 'في حال فشل الطلب لأي سبب، يُعاد المبلغ تلقائياً إلى رصيدك.' },
  { q: 'هل أحتاج كلمة مرور حسابي؟', a: 'لا أبداً. نحتاج فقط رابط حسابك أو منشورك العام. لا تعطِ كلمة مرورك لأي جهة.' },
];

export function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div style={ps.wrap}>
      <h1 style={ps.h1}>الأسئلة الشائعة</h1>
      <p style={ps.sub}>إجابات لأكثر الأسئلة تكراراً</p>
      {faqs.map((f, i) => (
        <div key={i} style={fs.item}>
          <button style={fs.q} onClick={() => setOpen(open === i ? null : i)}>
            <span>{f.q}</span>
            <span style={{ transform: open === i ? 'rotate(45deg)' : 'none', transition: '0.2s' }}>＋</span>
          </button>
          {open === i && <p style={fs.a}>{f.a}</p>}
        </div>
      ))}
    </div>
  );
}
const fs = {
  item: { background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
  q: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', background: 'transparent', border: 'none', color: '#fff', fontSize: 16, fontWeight: 600, textAlign: 'right' },
  a: { padding: '0 20px 18px', color: theme.textDim, fontSize: 15, lineHeight: 1.9 },
};

// الاتصال بنا
export function Contact() {
  const WA = '9665XXXXXXXX'; const TG = 'i8231';
  return (
    <div style={ps.wrap}>
      <h1 style={ps.h1}>الاتصال بنا</h1>
      <p style={ps.sub}>فريقنا جاهز لمساعدتك على مدار الساعة</p>
      <div style={cs.grid}>
        <a style={cs.card} href={`https://wa.me/${WA}`} target="_blank" rel="noreferrer">
          <span style={cs.icon}>💬</span><b>واتساب</b><span style={cs.dim}>تواصل مباشر</span>
        </a>
        <a style={cs.card} href={`https://t.me/${TG}`} target="_blank" rel="noreferrer">
          <span style={cs.icon}>✈️</span><b>تيليجرام</b><span style={cs.dim}>@{TG}</span>
        </a>
      </div>
    </div>
  );
}
const cs = {
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  card: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '32px 20px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 20 },
  icon: { fontSize: 38 },
  dim: { color: theme.textDim, fontSize: 14 },
};

// صفحات نصية
export function Terms() {
  return (
    <div style={ps.wrap}>
      <h1 style={ps.h1}>شروط الاستخدام</h1>
      <p style={ps.p}>باستخدامك موقع رواج، فإنك توافق على الشروط التالية. يُرجى قراءتها بعناية.</p>
      <h2 style={ps.h2}>استخدام الخدمات</h2>
      <p style={ps.p}>تُقدَّم الخدمات كما هي. المستخدم مسؤول عن التأكد من توافق استخدامه مع شروط المنصات المستهدفة. لا نتحمّل مسؤولية أي إجراء تتخذه المنصات ضد الحسابات.</p>
      <h2 style={ps.h2}>الحساب والرصيد</h2>
      <p style={ps.p}>الرصيد المشحون يُستخدم لطلب الخدمات فقط. أنت مسؤول عن حماية بيانات دخولك.</p>
      <h2 style={ps.h2}>حظر إساءة الاستخدام</h2>
      <p style={ps.p}>يُمنع استخدام الموقع في أي نشاط غير قانوني أو مخالف. نحتفظ بحق إيقاف أي حساب يخالف الشروط.</p>
    </div>
  );
}

export function Privacy() {
  return (
    <div style={ps.wrap}>
      <h1 style={ps.h1}>سياسة الخصوصية</h1>
      <p style={ps.p}>نحترم خصوصيتك ونلتزم بحماية بياناتك.</p>
      <h2 style={ps.h2}>البيانات التي نجمعها</h2>
      <p style={ps.p}>نجمع فقط البيانات الضرورية: البريد الإلكتروني، اسم المستخدم، وسجل الطلبات. لا نطلب كلمات مرور حساباتك على المنصات.</p>
      <h2 style={ps.h2}>استخدام البيانات</h2>
      <p style={ps.p}>تُستخدم بياناتك لتشغيل الخدمة وتحسين تجربتك فقط. لا نبيع بياناتك لأي جهة.</p>
    </div>
  );
}

export function Refund() {
  return (
    <div style={ps.wrap}>
      <h1 style={ps.h1}>سياسة الاسترجاع</h1>
      <p style={ps.p}>نسعى لرضاك التام عن خدماتنا.</p>
      <h2 style={ps.h2}>حالات الاسترجاع</h2>
      <p style={ps.p}>في حال فشل تنفيذ الطلب، يُعاد المبلغ كاملاً إلى رصيدك تلقائياً. في حال التنفيذ الجزئي، يُعاد الفرق عن الكمية غير المنفّذة.</p>
      <h2 style={ps.h2}>غير قابل للاسترجاع</h2>
      <p style={ps.p}>الطلبات المكتملة بنجاح غير قابلة للاسترجاع. تأكد من صحة الرابط والكمية قبل تأكيد الطلب.</p>
    </div>
  );
}

export function Blog() {
  return (
    <div style={ps.wrap}>
      <h1 style={ps.h1}>مقالات</h1>
      <p style={ps.sub}>نصائح ومقالات في التسويق الرقمي</p>
      <div style={{ padding: 40, textAlign: 'center', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 20, color: theme.textDim }}>
        قريباً — نعمل على إضافة مقالات مفيدة في التسويق الرقمي.
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div style={{ ...ps.wrap, textAlign: 'center', padding: '80px 20px' }}>
      <h1 style={{ fontSize: 80, fontWeight: 900, background: theme.gradientText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1>
      <p style={ps.sub}>الصفحة غير موجودة</p>
    </div>
  );
}
