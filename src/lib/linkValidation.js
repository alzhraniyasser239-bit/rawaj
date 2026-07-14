// نظام التحقق الذكي من الروابط - يغطي كل المنصات وأنواع الروابط بأعلى دقة ممكنة

const PLATFORMS = [
  { key: 'instagram', words: ['انستقرام','انستجرام','انستا','instagram','insta','ig'], hosts: ['instagram.com','instagr.am'], label: 'انستقرام' },
  { key: 'tiktok', words: ['تيك توك','تيكتوك','تكتوك','tiktok'], hosts: ['tiktok.com','vm.tiktok.com'], label: 'تيك توك' },
  { key: 'twitter', words: ['تويتر','twitter','اكس','x '], hosts: ['twitter.com','x.com'], label: 'تويتر / X' },
  { key: 'telegram', words: ['تليجرام','تلجرام','تيليجرام','telegram'], hosts: ['t.me','telegram.me'], label: 'تليجرام' },
  { key: 'youtube', words: ['يوتيوب','يوتوب','youtube'], hosts: ['youtube.com','youtu.be'], label: 'يوتيوب' },
  { key: 'facebook', words: ['فيسبوك','فيس بوك','facebook'], hosts: ['facebook.com','fb.com','fb.watch'], label: 'فيسبوك' },
  { key: 'snapchat', words: ['سناب','snapchat','snap'], hosts: ['snapchat.com'], label: 'سناب شات' },
  { key: 'threads', words: ['ثريدز','threads'], hosts: ['threads.net'], label: 'ثريدز' },
  { key: 'soundcloud', words: ['ساوند','soundcloud'], hosts: ['soundcloud.com'], label: 'ساوند كلاود' },
  { key: 'spotify', words: ['سبوتيفاي','spotify'], hosts: ['spotify.com','open.spotify.com'], label: 'سبوتيفاي' },
];

// كلمات تدل على نوع الهدف
const POST_WORDS = ['لايك','إعجاب','اعجاب','مشاهد','تعليق','كومنت','ريت','حفظ','مشارك','ريتويت','ريبوست','فيو','رد','تفاعل','like','view','comment','save','share','repost'];
const STORY_WORDS = ['ستوري','story','stories'];
const REEL_WORDS = ['ريل','reel','reels'];
const PROFILE_WORDS = ['متابع','اعضاء','أعضاء','مشترك','عضو','follow','subscriber','member','عضوية'];

// أنماط روابط المنشورات
const POST_PATTERNS = {
  instagram: ['/p/','/reel/','/reels/','/tv/','/stories/'],
  tiktok: ['/video/','/photo/'],
  twitter: ['/status/'],
  youtube: ['watch?v=','youtu.be/','/shorts/'],
  facebook: ['/posts/','/videos/','/photo','/reel/','story_fbid','/watch'],
  threads: ['/post/','/t/'],
  telegram: [], // نتعامل معه بشكل خاص تحت
};
// أنماط خاصة بالستوري والريل (لدقة أعلى في انستقرام)
const STORY_PATTERNS = { instagram: ['/stories/'] };
const REEL_PATTERNS = { instagram: ['/reel/','/reels/'], tiktok: ['/video/'], facebook: ['/reel/'], youtube: ['/shorts/'] };

export function detectPlatform(text) {
  const t = (text || '').toLowerCase();
  for (const p of PLATFORMS) {
    if (p.words.some((w) => t.includes(w.trim()))) return p;
  }
  return null;
}

function serviceTarget(txt) {
  const t = (txt || '').toLowerCase();
  // الأكثر تحديداً أول
  if (STORY_WORDS.some((w) => t.includes(w))) return 'story';
  if (REEL_WORDS.some((w) => t.includes(w))) return 'reel';
  if (POST_WORDS.some((w) => t.includes(w))) return 'post';
  if (PROFILE_WORDS.some((w) => t.includes(w))) return 'profile';
  return 'unknown';
}

function hasAny(link, patterns) {
  const l = (link || '').toLowerCase();
  return (patterns || []).some((p) => l.includes(p));
}

// تحقق خاص بتليجرام: قناة/حساب = t.me/x ، منشور = t.me/x/123
function telegramIsPost(link) {
  const m = (link || '').toLowerCase().match(/t\.me\/([^/]+)(\/(\d+))?/);
  return !!(m && m[3]); // فيه رقم بوست بالآخر
}

export function validateLink(service, link) {
  const raw = (link || '').trim();
  if (!/^https?:\/\/.+\..+/i.test(raw)) {
    return { ok: false, message: 'الرابط لازم يبدأ بـ https:// ويكون رابط صحيح' };
  }

  const txt = `${service.name} ${service.category}`;
  const platform = detectPlatform(txt);
  if (!platform) return { ok: true }; // ما عرفنا المنصة - نكتفي بالتحقق الأساسي

  const l = raw.toLowerCase();
  if (!platform.hosts.some((h) => l.includes(h))) {
    return { ok: false, message: `هذي خدمة ${platform.label} — لازم تحط رابط ${platform.label} صحيح` };
  }

  const target = serviceTarget(txt);

  // تليجرام: تعامل خاص
  if (platform.key === 'telegram') {
    const isPost = telegramIsPost(raw);
    if (target === 'profile' && isPost) {
      return { ok: false, message: 'هذي خدمة أعضاء/اشتراك — حط رابط القناة أو القروب نفسه (بدون رقم رسالة).' };
    }
    if (target === 'post' && !isPost) {
      return { ok: false, message: 'هذي الخدمة تحتاج رابط منشور محدد في القناة (رابط الرسالة)، مو رابط القناة.' };
    }
    return { ok: true };
  }

  // ستوري
  if (target === 'story') {
    if (!hasAny(raw, STORY_PATTERNS[platform.key] || [])) {
      return { ok: false, message: `هذي خدمة ستوري — لازم تحط رابط الستوري نفسه.` };
    }
    return { ok: true };
  }

  // ريل
  if (target === 'reel') {
    if (!hasAny(raw, REEL_PATTERNS[platform.key] || [])) {
      return { ok: false, message: `هذي خدمة ريلز — لازم تحط رابط الريل نفسه.` };
    }
    return { ok: true };
  }

  // منشور عام (لايك/مشاهدة/تعليق)
  const linkIsPost = hasAny(raw, POST_PATTERNS[platform.key] || []);
  if (target === 'post' && !linkIsPost) {
    return { ok: false, message: 'هذي الخدمة تحتاج رابط منشور محدد (بوست / ريل / فيديو)، مو رابط الحساب. افتح المنشور وانسخ رابطه.' };
  }
  if (target === 'profile' && linkIsPost) {
    return { ok: false, message: 'هذي الخدمة تحتاج رابط الحساب (البروفايل)، مو رابط منشور. حط رابط حسابك مباشرة.' };
  }

  return { ok: true };
}

export function platformLabel(service) {
  const p = detectPlatform(`${service.name} ${service.category}`);
  return p ? p.label : null;
}

export function targetHint(service) {
  const t = serviceTarget(`${service.name} ${service.category}`);
  const map = {
    story: 'رابط الستوري',
    reel: 'رابط الريل / الفيديو',
    post: 'رابط منشور محدد (بوست / ريل / فيديو)',
    profile: 'رابط الحساب (البروفايل)',
  };
  return map[t] || null;
}
