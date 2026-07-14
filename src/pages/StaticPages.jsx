import { useState } from 'react';
import { theme } from '../theme';

const WHATSAPP = '966591782702'; // رقم الدعم (صيغة دولية)

const wrap = { maxWidth: 860, margin: '0 auto', padding: '40px 20px 60px' };
const ps = {
  wrap,
  h1: { fontSize: 34, fontWeight: 800, marginBottom: 10 },
  sub: { color: theme.textDim, fontSize: 16, marginBottom: 32 },
  h2: { fontSize: 20, fontWeight: 700, margin: '28px 0 12px' },
  p: { color: theme.textDim, fontSize: 15, lineHeight: 2, marginBottom: 12 },
};

const faqs = [
  { q: 'كم يستغرق تنفيذ الطلب؟', a: 'يظهر متوسط وقت التنفيذ على كل خدمة قبل الطلب. أغلب الطلبات تبدأ خلال دقائق، وبعضها يحتاج وقت أطول حسب نوع الخدمة والكمية.' },
  { q: 'هل المتابعين والتفاعل حقيقي؟', a: 'نوفّر خدمات متنوعة، بعضها عالي الجودة وبعضها اقتصادي. تفاصيل كل خدمة موضّحة في اسمها، وبعض الخدمات فيها خاصية التعويض التلقائي.' },
  { q: 'كيف أشحن رصيدي؟', a: 'من صفحة شحن الرصيد، عبر تحويل بنكي أو الدفع ببطاقة عن طريق الدعم الفني على واتساب.' },
  { q: 'ماذا لو ما نفّذ الطلب؟', a: 'في حال فشل الطلب لأي سبب، يُعاد المبلغ تلقائياً إلى رصيدك. احتفظ برقم طلبك للمتابعة مع الدعم.' },
  { q: 'حطيت رابط غلط، وش أسوي؟', a: 'الموقع يتحقق من الرابط قبل الطلب ويرفض الروابط غير المناسبة. تأكد من نوع الرابط المطلوب (حساب أو منشور) الظاهر عند الطلب.' },
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

export function Contact() {
  return (
    <div style={ps.wrap}>
      <h1 style={ps.h1}>الاتصال بنا</h1>
      <p style={ps.sub}>فريقنا جاهز لمساعدتك — التواصل عبر واتساب</p>
      <a style={cs.card} href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">
        <span style={cs.icon}>💬</span>
        <b style={cs.cardTitle}>واتساب الدعم</b>
        <span style={cs.dim} dir="ltr">+966 59 178 2702</span>
        <span style={cs.badge}>تواصل الآن</span>
      </a>
    </div>
  );
}
const cs = {
  card: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '40px 20px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 20, maxWidth: 380, margin: '0 auto' },
  icon: { fontSize: 44 },
  cardTitle: { fontSize: 20 },
  dim: { color: theme.textDim, fontSize: 16 },
  badge: { marginTop: 8, padding: '10px 28px', borderRadius: 12, background: '#25D366', color: '#fff', fontSize: 15, fontWeight: 700 },
};

export function Terms() {
  return (
    <div style={ps.wrap}>
      <h1 style={ps.h1}>شروط الاستخدام</h1>
      <p style={ps.p}>مرحباً بك في موقع رواج. باستخدامك الموقع فإنك توافق على الشروط التالية، يُرجى قراءتها بعناية.</p>
      <h2 style={ps.h2}>١. طبيعة الخدمة</h2>
      <p style={ps.p}>يوفّر رواج خدمات تعزيز الحضور على منصات التواصل الاجتماعي (متابعين، تفاعل، مشاهدات وغيرها). تُقدَّم الخدمات كما هي، والمستخدم مسؤول عن التأكد من توافق استخدامه مع شروط المنصات المستهدفة.</p>
      <h2 style={ps.h2}>٢. الحساب والرصيد</h2>
      <p style={ps.p}>يجب أن تكون المعلومات التي تقدّمها صحيحة. الرصيد المشحون يُستخدم لطلب الخدمات فقط، وأنت مسؤول عن حماية بيانات دخولك وعدم مشاركتها.</p>
      <h2 style={ps.h2}>٣. تنفيذ الطلبات</h2>
      <p style={ps.p}>يجب إدخال الرابط الصحيح المطابق لنوع الخدمة (حساب أو منشور). الطلبات المنفّذة بناءً على رابط خاطئ أدخله المستخدم لا تُعوّض. تأكد من صحة الرابط والكمية قبل التأكيد.</p>
      <h2 style={ps.h2}>٤. حظر إساءة الاستخدام</h2>
      <p style={ps.p}>يُمنع استخدام الموقع في أي نشاط غير قانوني أو مخالف للأنظمة. نحتفظ بحق إيقاف أي حساب يخالف هذه الشروط دون إشعار مسبق.</p>
      <h2 style={ps.h2}>٥. تعديل الشروط</h2>
      <p style={ps.p}>نحتفظ بحق تعديل هذه الشروط في أي وقت، ويسري التعديل فور نشره على الموقع.</p>
    </div>
  );
}

export function Privacy() {
  return (
    <div style={ps.wrap}>
      <h1 style={ps.h1}>سياسة الخصوصية</h1>
      <p style={ps.p}>نحترم خصوصيتك في رواج ونلتزم بحماية بياناتك الشخصية. توضّح هذه السياسة كيفية تعاملنا مع معلوماتك.</p>
      <h2 style={ps.h2}>١. البيانات التي نجمعها</h2>
      <p style={ps.p}>نجمع فقط البيانات الضرورية لتشغيل الخدمة: البريد الإلكتروني، اسم المستخدم، سجل الطلبات، والروابط التي تُدخلها لتنفيذ الطلبات. لا نطلب أبداً كلمات مرور حساباتك على المنصات.</p>
      <h2 style={ps.h2}>٢. استخدام البيانات</h2>
      <p style={ps.p}>تُستخدم بياناتك حصراً لتشغيل الخدمة، تنفيذ طلباتك، وتحسين تجربتك. لا نبيع أو نشارك بياناتك مع أي طرف ثالث لأغراض تسويقية.</p>
      <h2 style={ps.h2}>٣. حماية البيانات</h2>
      <p style={ps.p}>نستخدم إجراءات حماية تقنية لتأمين بياناتك، ونقيّد الوصول إليها بما يخدم تشغيل الخدمة فقط.</p>
      <h2 style={ps.h2}>٤. التواصل</h2>
      <p style={ps.p}>لأي استفسار يخص خصوصيتك، تواصل مع الدعم عبر واتساب.</p>
    </div>
  );
}

export function Refund() {
  return (
    <div style={ps.wrap}>
      <h1 style={ps.h1}>سياسة الاسترجاع</h1>
      <p style={ps.p}>نسعى في رواج لرضاك التام عن خدماتنا. توضّح هذه السياسة حالات استرجاع الرصيد.</p>
      <h2 style={ps.h2}>١. الطلبات الفاشلة</h2>
      <p style={ps.p}>في حال فشل تنفيذ الطلب بالكامل لأي سبب من طرفنا أو المزوّد، يُعاد المبلغ كاملاً إلى رصيدك في الموقع تلقائياً.</p>
      <h2 style={ps.h2}>٢. التنفيذ الجزئي</h2>
      <p style={ps.p}>إذا نُفّذ جزء من الطلب فقط، يُعاد الفرق عن الكمية غير المنفّذة إلى رصيدك.</p>
      <h2 style={ps.h2}>٣. غير قابل للاسترجاع</h2>
      <p style={ps.p}>الطلبات المكتملة بنجاح غير قابلة للاسترجاع. كذلك الطلبات التي أُدخل لها رابط خاطئ من المستخدم لا تُعوّض، لذا تأكد من صحة الرابط قبل التأكيد.</p>
      <h2 style={ps.h2}>٤. الرصيد المشحون</h2>
      <p style={ps.p}>الرصيد المشحون في المحفظة غير قابل للسحب نقداً، ويُستخدم لطلب الخدمات فقط.</p>
      <h2 style={ps.h2}>٥. طلب المراجعة</h2>
      <p style={ps.p}>لأي استفسار عن طلب، تواصل مع الدعم عبر واتساب مع ذكر رقم الطلب.</p>
    </div>
  );
}

export function Blog() {
  return (
    <div style={ps.wrap}>
      <h1 style={ps.h1}>مقالات</h1>
      <p style={ps.sub}>نصائح ومقالات في التسويق الرقمي</p>
      <div style={{ padding: 40, textAlign: 'center', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 20, color: theme.textDim }}>
        قريباً — نعمل على إضافة مقالات مفيدة في التسويق الرقمي وإدارة حسابات التواصل.
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
