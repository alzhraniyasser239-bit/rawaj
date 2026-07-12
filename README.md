# رواج | Rawaj — موقع خدمات التواصل الاجتماعي

موقع كامل مبني على React + Vite + Supabase، مربوط بـ API كد1س لسحب الخدمات وتنفيذ الطلبات.

## كيف تشغّله في StackBlitz

1. روح stackblitz.com → New Project → Vite + React (أو ارفع هذا المجلد)
2. StackBlitz بيثبّت المكتبات تلقائياً (react-router-dom, @supabase/supabase-js)
3. لو ما ثبّتها: افتح الترمنال واكتب `npm install`
4. اضغط Run

## الصفحات الجاهزة
- `/` الرئيسية
- `/auth` تسجيل الدخول / حساب جديد
- `/services` الخدمات (مربوطة بقاعدة البيانات)
- `/dashboard` لوحة التحكم (الرصيد + الطلبات)
- `/wallet` شحن الرصيد (تحويل بنكي + دعم)
- `/faq` `/contact` `/terms` `/privacy` `/refund` `/blog`

## ⚙️ قبل النشر — عدّل هذي:

### 1. بيانات الشحن في `src/pages/Wallet.jsx`:
- `BANK_INFO`: بيانات حسابك البنكي (البنك، الاسم، الآيبان)
- `SUPPORT_WHATSAPP`: رقم واتساب الدعم (صيغة دولية بدون +)
- `SUPPORT_TELEGRAM`: يوزر التيليجرام

### 2. رقم التواصل في `src/pages/StaticPages.jsx` (دالة Contact)

## ملاحظات مهمة
- مفاتيح Supabase في `src/lib/supabase.js` (عامة وآمنة، الحماية عبر RLS)
- دالة `place-order` لازم تكون منشورة في Supabase عشان الطلبات تشتغل (المرحلة الجاية)
- الخدمات تُسحب من جدول `services` اللي عبّيناه بدالة `sync-services`

## الناقص (المرحلة الجاية)
- دالة `place-order` (تنفيذ الطلب) — موجودة بمحادثتنا، تنشرها زي sync-services
- دالة تحديث حالة الطلبات (cron)
- لوحة الدعم (موافقة الشحن + شحن يدوي)
