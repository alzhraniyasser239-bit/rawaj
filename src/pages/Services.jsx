import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, SUPABASE_URL } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { theme } from '../theme';
import { validateLink, platformLabel, targetHint } from '../lib/linkValidation';

const PAGE_SIZE = 40;

// ===== تصنيف المنصات =====
const PLATFORMS = [
  { key: 'tiktok',    label: 'تيك توك',   icon: '🎵', match: ['تيك توك', 'تيك توك', 'TikTok'] },
  { key: 'instagram', label: 'انستقرام',  icon: '📸', match: ['انستقرام', 'انستگرام', 'Instagram', 'IG '] },
  { key: 'snapchat',  label: 'سناب شات',  icon: '👻', match: ['سناب شات', 'سناب'] },
  { key: 'youtube',   label: 'يوتيوب',    icon: '▶️', match: ['يوتيوب', 'YouTube'] },
  { key: 'twitter',   label: 'تويتر / X', icon: '✖️', match: ['تويتر', 'Twitter'] },
  { key: 'facebook',  label: 'فيسبوك',    icon: '👥', match: ['فيسبوك', 'Facebook'] },
  { key: 'telegram',  label: 'تليجرام',   icon: '✈️', match: ['تليجرام', 'تليگرام', 'Telegram'] },
  { key: 'whatsapp',  label: 'واتساب',    icon: '💬', match: ['وتساب', 'واتساب', 'WhatsApp'] },
];

const DEALS = { key: 'deals', label: 'الأرخص مبيعاً', icon: '🔥' };
const OTHER = { key: 'other', label: 'منصات أخرى', icon: '🌐' };

const PLATFORM_ORDER = ['tiktok', 'instagram', 'snapchat', 'youtube', 'twitter', 'facebook', 'telegram', 'whatsapp', 'other', 'deals'];

// ===== تصنيف الأنواع =====
const TYPES = [
  { key: 'followers',    label: 'متابعين',   icon: '👤', match: ['متابعين', 'متابعة', 'مشتركين', 'اعضاء', 'أعضاء'] },
  { key: 'likes',        label: 'لايكات',    icon: '👍', match: ['لايكات', 'لايكي', 'لايك', 'اعجابات', 'أعجابات', 'إعجاب', 'اعجاب', 'تكبيسات'] },
  { key: 'views',        label: 'مشاهدات',   icon: '🎥', match: ['مشاهدات', 'مشاهده'] },
  { key: 'comments',     label: 'تعليقات',   icon: '💬', match: ['تعليقات', 'تعليق'] },
  { key: 'interactions', label: 'تفاعلات',   icon: '❤️', match: ['تفاعلات'] },
  { key: 'story',        label: 'ستوري',     icon: '📖', match: ['ستوري', 'استوري', 'القصص'] },
];

const TYPE_ORDER = ['followers', 'likes', 'views', 'comments', 'interactions', 'story', 'other'];
const OTHER_TYPE = { key: 'other', label: 'خدمات أخرى', icon: '✨' };

function detectPlatform(category) {
  const c = category || '';
  if (c.includes('الأرخص مبيعاً')) return 'deals';
  for (const p of PLATFORMS) {
    if (p.match.some((m) => c.includes(m))) return p.key;
  }
  return 'other';
}

function detectType(category) {
  const c = category || '';
  const after = c.includes('|') ? c.split('|').slice(1).join('|') : c;
  for (const t of TYPES) {
    if (t.match.some((m) => after.includes(m))) return t.key;
  }
  return 'other';
}

function platformInfo(key) {
  if (key === 'deals') return DEALS;
  if (key === 'other') return OTHER;
  return PLATFORMS.find((p) => p.key === key) || OTHER;
}

function typeInfo(key) {
  if (key === 'other') return OTHER_TYPE;
  return TYPES.find((t) => t.key === key) || OTHER_TYPE;
}

function timeLabel(mins) {
  if (!mins || mins <= 0) return null;
  if (mins < 60) return `${mins} دقيقة`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h < 24) return m ? `${h} ساعة و${m} دقيقة` : `${h} ساعة`;
  const d = Math.floor(h / 24);
  return `${d} يوم`;
}

// توحيد النص للمقارنة والبحث
function norm(t) {
  return String(t || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

// حذف المكرر: نفس الاسم حرفياً => نُبقي الأرخص فقط
function dedupe(list) {
  const best = new Map();
  for (const svc of list) {
    const key = norm(svc.name);
    const prev = best.get(key);
    if (!prev || Number(svc.sell_price_sar) < Number(prev.sell_price_sar)) {
      best.set(key, svc);
    }
  }
  return [...best.values()];
}

export default function Services() {
  const { user, profile, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState(null);
  const [activeType, setActiveType] = useState(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const COLS = 'id, name, category, min_order, max_order, sell_price_sar, refill, avg_time_min';
      const STEP = 1000;

      const { count } = await supabase
        .from('services')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      const total = count || 0;
      const pages = Math.max(1, Math.ceil(total / STEP));

      const requests = [];
      for (let i = 0; i < pages; i++) {
        requests.push(
          supabase
            .from('services')
            .select(COLS)
            .eq('is_active', true)
            .order('category', { ascending: true })
            .range(i * STEP, i * STEP + STEP - 1)
        );
      }

      const results = await Promise.all(requests);
      const all = results.flatMap((r) => r.data || []);

      // نحذف المكرر أولاً ثم نصنّف
      const unique = dedupe(all);
      const tagged = unique.map((x) => ({
        ...x,
        _platform: detectPlatform(x.category),
        _type: detectType(x.category),
        _search: norm(x.name + ' ' + x.category),
      }));

      setServices(tagged);
      setLoading(false);
    })();
  }, []);

  const platformCounts = useMemo(() => {
    const counts = {};
    services.forEach((x) => { counts[x._platform] = (counts[x._platform] || 0) + 1; });
    return counts;
  }, [services]);

  const platformList = useMemo(
    () => PLATFORM_ORDER.filter((k) => platformCounts[k] > 0),
    [platformCounts]
  );

  const platformServices = useMemo(
    () => (activePlatform ? services.filter((x) => x._platform === activePlatform) : []),
    [services, activePlatform]
  );

  const typeCounts = useMemo(() => {
    const counts = {};
    platformServices.forEach((x) => { counts[x._type] = (counts[x._type] || 0) + 1; });
    return counts;
  }, [platformServices]);

  const typeList = useMemo(
    () => TYPE_ORDER.filter((k) => typeCounts[k] > 0),
    [typeCounts]
  );

  const q = norm(query);
  const searching = q.length >= 2;

  // نتائج البحث — تشمل كل المنصات
  const searchResults = useMemo(() => {
    if (!searching) return [];
    const words = q.split(' ').filter(Boolean);
    return services
      .filter((x) => words.every((w) => x._search.includes(w)))
      .sort((a, b) => Number(a.sell_price_sar) - Number(b.sell_price_sar));
  }, [services, q, searching]);

  // الفلترة + الترتيب من الأرخص للأغلى
  const filtered = useMemo(() => {
    if (searching) return searchResults;
    if (!activePlatform) return [];
    const list = !activeType
      ? platformServices
      : platformServices.filter((x) => x._type === activeType);
    return [...list].sort(
      (a, b) => Number(a.sell_price_sar) - Number(b.sell_price_sar)
    );
  }, [searching, searchResults, platformServices, activeType, activePlatform]);

  const paged = filtered.slice(0, page * PAGE_SIZE);

  function pickPlatform(key) {
    setActivePlatform(key);
    setActiveType(null);
    setPage(1);
  }

  function pickType(key) {
    setActiveType(key === activeType ? null : key);
    setPage(1);
  }

  function resetAll() {
    setActivePlatform(null);
    setActiveType(null);
    setQuery('');
    setPage(1);
  }

  function onSearch(v) {
    setQuery(v);
    setPage(1);
  }

  const pInfo = activePlatform ? platformInfo(activePlatform) : null;

  return (
    <div style={s.wrap}>
      <div style={s.head}>
        <h1 style={s.title}>الخدمات</h1>
        <p style={s.sub}>
          {services.length.toLocaleString('ar')} خدمة متاحة — اختر المنصة أو ابحث مباشرة
        </p>
      </div>

      {/* شريط البحث */}
      <div style={s.searchBox}>
        <span style={s.searchIcon}>🔍</span>
        <input
          style={s.searchInput}
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="ابحث عن خدمة… مثال: متابعين تيك توك"
        />
        {query && (
          <button style={s.clearBtn} onClick={() => onSearch('')}>✕</button>
        )}
      </div>

      {loading ? (
        <div style={s.center}><span className="spinner" /> جاري تحميل الخدمات...</div>
      ) : searching ? (
        /* ===== وضع البحث ===== */
        <>
          <div style={s.breadcrumb}>
            <button style={s.backBtn} onClick={resetAll}>← رجوع</button>
            <span style={s.crumbNow}>
              نتائج البحث ({filtered.length.toLocaleString('ar')})
            </span>
            <span style={s.sortNote}>مرتّبة من الأرخص للأغلى</span>
          </div>
          <ServiceGrid
            list={paged}
            user={user}
            onPick={setSelected}
            nav={nav}
          />
          {paged.length < filtered.length && (
            <div style={s.center}>
              <button style={s.moreBtn} onClick={() => setPage(page + 1)}>
                عرض المزيد ({(filtered.length - paged.length).toLocaleString('ar')} متبقية)
              </button>
            </div>
          )}
          {filtered.length === 0 && (
            <div style={s.empty}>
              ما لقينا نتائج لـ "{query}". جرّب كلمة أقصر أو تصفّح المنصات.
            </div>
          )}
        </>
      ) : (
        <>
          {/* المستوى الأول: المنصات */}
          {!activePlatform && (
            <>
              <p style={s.hint}>اختر المنصة اللي تبي تعزّز حسابك فيها:</p>
              <div style={s.platGrid}>
                {platformList.map((k) => {
                  const info = platformInfo(k);
                  return (
                    <button key={k} style={s.platCard} onClick={() => pickPlatform(k)}>
                      <span style={s.platIcon}>{info.icon}</span>
                      <span style={s.platLabel}>{info.label}</span>
                      <span style={s.platCount}>{platformCounts[k].toLocaleString('ar')} خدمة</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* المستوى الثاني: الأنواع */}
          {activePlatform && (
            <>
              <div style={s.breadcrumb}>
                <button style={s.backBtn} onClick={resetAll}>← كل المنصات</button>
                <span style={s.crumbNow}>{pInfo.icon} {pInfo.label}</span>
                <span style={s.sortNote}>مرتّبة من الأرخص للأغلى</span>
              </div>

              <div style={s.typeRow}>
                <button
                  style={{ ...s.typeChip, ...(!activeType ? s.typeActive : {}) }}
                  onClick={() => pickType(null)}
                >
                  الكل ({platformServices.length.toLocaleString('ar')})
                </button>
                {typeList.map((k) => {
                  const info = typeInfo(k);
                  return (
                    <button
                      key={k}
                      style={{ ...s.typeChip, ...(activeType === k ? s.typeActive : {}) }}
                      onClick={() => pickType(k)}
                    >
                      {info.icon} {info.label} ({typeCounts[k].toLocaleString('ar')})
                    </button>
                  );
                })}
              </div>

              <ServiceGrid
                list={paged}
                user={user}
                onPick={setSelected}
                nav={nav}
              />

              {paged.length < filtered.length && (
                <div style={s.center}>
                  <button style={s.moreBtn} onClick={() => setPage(page + 1)}>
                    عرض المزيد ({(filtered.length - paged.length).toLocaleString('ar')} متبقية)
                  </button>
                </div>
              )}
              {filtered.length === 0 && <div style={s.empty}>لا توجد خدمات هنا.</div>}
            </>
          )}
        </>
      )}

      {selected && (
        <OrderModal
          service={selected}
          balance={Number(profile?.balance_sar || 0)}
          onClose={() => setSelected(null)}
          onDone={() => { setSelected(null); refreshProfile(); }}
        />
      )}
    </div>
  );
}

function ServiceGrid({ list, user, onPick, nav }) {
  return (
    <div style={s.grid} className="grid-services">
      {list.map((svc) => {
        const t = timeLabel(svc.avg_time_min);
        const price = Number(svc.sell_price_sar);
        const minCost = (price * (svc.min_order || 0) / 1000);
        return (
          <div key={svc.id} style={s.card}>
            <div style={s.cardTop}>
              <div style={s.cardCat}>{svc.category}</div>
              {svc.refill && <div style={s.refillBadge}>♻️ تعويض</div>}
            </div>

            <h3 style={s.cardName}>{svc.name}</h3>

            <div style={s.cardMeta}>
              <span>📦 أقل طلب: {svc.min_order?.toLocaleString('ar')} — أعلى طلب: {svc.max_order?.toLocaleString('ar')}</span>
              {t && <span style={s.timeChip}>⏱ يبدأ خلال: {t}</span>}
            </div>

            <div style={s.priceBox}>
              <div style={s.priceMain}>
                <span style={s.priceNum}>{price.toFixed(2)}</span>
                <span style={s.priceCur}>ر.س لكل 1000</span>
              </div>
              <div style={s.priceExample}>
                يعني {svc.min_order?.toLocaleString('ar')} ≈ <b style={s.exampleVal}>{minCost.toFixed(2)} ر.س</b>
              </div>
            </div>

            <button style={s.orderBtn} onClick={() => (user ? onPick(svc) : nav('/auth'))}>
              اطلب الآن
            </button>
          </div>
        );
      })}
    </div>
  );
}

function OrderModal({ service, balance, onClose, onDone }) {
  const [link, setLink] = useState('');
  const [qty, setQty] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);

  const pLabel = platformLabel(service);
  const tHint = targetHint(service);
  const t = timeLabel(service.avg_time_min);

  const qtyNum = Number(qty) || 0;
  const hasQty = qtyNum > 0;
  const cost = (Number(service.sell_price_sar) * qtyNum / 1000);
  const enough = balance >= cost;
  const showInsufficient = hasQty && !enough;

  async function placeOrder() {
    setError('');
    if (!link.trim()) return setError('حط رابط الحساب أو المنشور');

    const check = validateLink(service, link);
    if (!check.ok) return setError(check.message);
    const finalLink = check.link || link.trim();

    if (!hasQty) return setError('اكتب الكمية المطلوبة');
    if (qtyNum < service.min_order || qtyNum > service.max_order) {
      return setError(`الكمية لازم بين ${service.min_order} و ${service.max_order}`);
    }
    if (!enough) return setError('رصيدك غير كافٍ، اشحن رصيدك أولاً');

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('لازم تسجّل دخول أولاً'); setLoading(false); return; }

      const res = await fetch(`${SUPABASE_URL}/functions/v1/place-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ user_id: session.user.id, service_id: service.id, target_link: finalLink, quantity: qtyNum }),
      });

      let out;
      try { out = await res.json(); } catch { out = {}; }
      if (!res.ok || out.error) throw new Error(out.error || 'فشل الطلب، حاول مرة ثانية');
      setOrderId(out.order_id);
      setTimeout(onDone, 3000);
    } catch (e) {
      if (String(e.message).includes('fetch') || String(e.message).includes('Failed')) {
        setError('تعذّر الاتصال بالخادم، تأكد من اتصالك وحاول مرة ثانية');
      } else setError(e.message || 'صار خطأ، جرّب مرة ثانية');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={m.overlay} onClick={onClose}>
      <div style={m.modal} onClick={(e) => e.stopPropagation()}>
        {orderId ? (
          <div style={m.successBox}>
            <div style={m.checkCircle}>✓</div>
            <h3 style={m.successTitle}>تم إرسال طلبك!</h3>
            <div style={m.orderIdBox}>
              <span style={m.orderIdLabel}>رقم طلبك</span>
              <span style={m.orderIdNum}>#{orderId}</span>
            </div>
            <p style={m.successDesc}>احتفظ برقم الطلب. تقدر تتابع حالته من لوحة التحكم، ولو صارت مشكلة أرسل الرقم للدعم.</p>
          </div>
        ) : (
          <>
            <div style={m.header}>
              <h3 style={m.title}>طلب خدمة</h3>
              <button style={m.close} onClick={onClose}>✕</button>
            </div>
            <div style={m.svcName}>{service.name}</div>
            {(pLabel || tHint) && (
              <div style={m.platformHint}>
                🔗 {pLabel ? `خدمة ${pLabel}` : 'هذي الخدمة'} — المطلوب: {tHint || 'رابط صحيح'}
              </div>
            )}
            {t && <div style={m.timeHint}>⏱ متوسط وقت التنفيذ: {t}</div>}
            <label style={m.label}>{tHint || 'رابط الحساب / المنشور'}</label>
            <input style={m.input} placeholder="مثال: tiktok.com/@اسمك" value={link} onChange={(e) => setLink(e.target.value)} dir="ltr" />
            <label style={m.label}>الكمية (بين {service.min_order} و {service.max_order})</label>
            <input
              style={m.input}
              type="number"
              inputMode="numeric"
              placeholder={`مثال: ${service.min_order}`}
              value={qty}
              onChange={(e) => setQty(e.target.value.replace(/[^0-9]/g, ''))}
              dir="ltr"
            />
            <div style={m.summary}>
              <div style={m.sumRow}><span>التكلفة</span><b>{cost.toFixed(2)} ر.س</b></div>
              <div style={m.sumRow}><span>رصيدك</span><b style={{ color: showInsufficient ? theme.danger : theme.success }}>{balance.toFixed(2)} ر.س</b></div>
            </div>
            {error && <div style={m.error}>{error}</div>}
            <button style={{ ...m.confirm, opacity: showInsufficient ? 0.6 : 1 }} onClick={placeOrder} disabled={loading}>
              {loading ? <span className="spinner" /> : showInsufficient ? 'اشحن رصيدك أولاً' : 'تأكيد الطلب'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const wrap = { maxWidth: 1200, margin: '0 auto', padding: '0 20px' };
const s = {
  wrap: { ...wrap, padding: '40px 20px 60px' },
  head: { marginBottom: 20 },
  title: { fontSize: 38, fontWeight: 800, color: theme.text },
  sub: { color: theme.textDim, fontSize: 16, marginTop: 6 },
  hint: { color: theme.textDim, fontSize: 15, marginBottom: 14, fontWeight: 600 },

  searchBox: { display: 'flex', alignItems: 'center', gap: 10, padding: '4px 16px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 16, marginBottom: 24 },
  searchIcon: { fontSize: 17, opacity: 0.6 },
  searchInput: { flex: 1, padding: '14px 0', border: 'none', background: 'transparent', outline: 'none', fontSize: 16, fontFamily: 'inherit', color: theme.text },
  clearBtn: { border: 'none', background: 'transparent', cursor: 'pointer', color: theme.textDim, fontSize: 16, padding: 6 },

  platGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 20 },
  platCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '26px 14px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 20, cursor: 'pointer', color: theme.text, fontFamily: 'inherit' },
  platIcon: { fontSize: 34 },
  platLabel: { fontSize: 16, fontWeight: 800, color: theme.text },
  platCount: { fontSize: 12, color: theme.textFaint },

  breadcrumb: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' },
  backBtn: { padding: '9px 16px', borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.bgCard, color: theme.textDim, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  crumbNow: { fontSize: 18, fontWeight: 800, color: '#5C4432' },
  sortNote: { fontSize: 12, color: theme.textFaint, padding: '5px 12px', borderRadius: 100, background: 'rgba(156,122,69,0.10)' },

  typeRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 },
  typeChip: { padding: '9px 16px', borderRadius: 100, border: `1px solid ${theme.border}`, background: theme.bgCard, color: theme.textDim, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit' },
  typeActive: { background: theme.gradient, color: '#fff', border: '1px solid transparent' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 },
  card: { display: 'flex', flexDirection: 'column', padding: 20, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 18, color: theme.text },
  cardTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  cardCat: { display: 'inline-block', padding: '4px 10px', borderRadius: 100, background: 'rgba(156,122,69,0.15)', color: '#7A5D33', fontSize: 12, fontWeight: 600 },
  refillBadge: { padding: '4px 10px', borderRadius: 100, background: 'rgba(21,128,61,0.12)', color: '#15803D', fontSize: 11, fontWeight: 700 },
  cardName: { fontSize: 15, fontWeight: 600, lineHeight: 1.7, marginBottom: 12, flex: 1, color: theme.text },
  cardMeta: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: theme.textFaint, marginBottom: 14 },
  timeChip: { color: '#5C4432' },

  priceBox: { borderTop: `1px solid ${theme.border}`, paddingTop: 14, marginBottom: 14 },
  priceMain: { display: 'flex', alignItems: 'baseline', gap: 6 },
  priceNum: { fontSize: 24, fontWeight: 800, color: '#7A5D33' },
  priceCur: { fontSize: 13, color: theme.textDim, fontWeight: 600 },
  priceExample: { fontSize: 12, color: theme.textFaint, marginTop: 5 },
  exampleVal: { color: '#5C4432' },

  orderBtn: { width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', background: theme.gradient, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  center: { textAlign: 'center', padding: '40px 0', color: theme.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  empty: { textAlign: 'center', padding: '50px 20px', background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 20, color: theme.textDim, lineHeight: 1.9 },
  moreBtn: { padding: '13px 32px', borderRadius: 14, border: `1px solid ${theme.border}`, background: theme.bgCard, color: theme.text, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
};
const m = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(45,32,20,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 },
  modal: { width: '100%', maxWidth: 460, background: theme.bgElev, border: `1px solid ${theme.border}`, borderRadius: 24, padding: 28, maxHeight: '90vh', overflowY: 'auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  title: { fontSize: 22, fontWeight: 800, color: theme.text },
  close: { background: 'none', border: 'none', color: theme.textDim, fontSize: 20, cursor: 'pointer' },
  svcName: { padding: 14, background: 'rgba(156,122,69,0.12)', borderRadius: 12, fontSize: 14, lineHeight: 1.7, marginBottom: 14, color: theme.text },
  platformHint: { padding: '10px 14px', background: 'rgba(122,93,51,0.10)', border: '1px solid rgba(122,93,51,0.25)', borderRadius: 12, fontSize: 13, color: '#5C4432', marginBottom: 12 },
  timeHint: { padding: '8px 14px', background: 'rgba(58,42,28,0.05)', borderRadius: 12, fontSize: 13, color: theme.textDim, marginBottom: 16 },
  label: { display: 'block', fontSize: 13, color: theme.textDim, marginBottom: 8, fontWeight: 600 },
  input: { width: '100%', boxSizing: 'border-box', padding: '13px 16px', marginBottom: 16, background: 'rgba(58,42,28,0.05)', border: `1px solid ${theme.border}`, borderRadius: 12, color: theme.text, fontSize: 15, fontFamily: 'inherit', outline: 'none' },
  summary: { background: 'rgba(58,42,28,0.07)', borderRadius: 14, padding: 16, marginBottom: 16 },
  sumRow: { display: 'flex', justifyContent: 'space-between', fontSize: 15, padding: '5px 0' },
  error: { background: 'rgba(185,28,28,0.10)', border: '1px solid rgba(185,28,28,0.3)', color: '#991B1B', padding: '10px 14px', borderRadius: 12, fontSize: 13, marginBottom: 14, textAlign: 'center', lineHeight: 1.7 },
  confirm: { width: '100%', padding: '15px 0', border: 'none', borderRadius: 14, background: theme.gradient, color: '#fff', fontSize: 16, fontWeight: 700, minHeight: 52, cursor: 'pointer', fontFamily: 'inherit' },
  successBox: { textAlign: 'center', padding: '10px 0' },
  checkCircle: { width: 70, height: 70, margin: '0 auto 18px', borderRadius: '50%', background: 'rgba(21,128,61,0.12)', border: '2px solid #15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, color: '#15803D' },
  successTitle: { fontSize: 22, fontWeight: 800, marginBottom: 16, color: theme.text },
  orderIdBox: { display: 'flex', flexDirection: 'column', gap: 4, padding: '14px', background: 'rgba(156,122,69,0.12)', border: '1px solid rgba(156,122,69,0.3)', borderRadius: 14, marginBottom: 16 },
  orderIdLabel: { fontSize: 13, color: theme.textDim },
  orderIdNum: { fontSize: 26, fontWeight: 800, color: '#7A5D33' },
  successDesc: { color: theme.textDim, fontSize: 14, lineHeight: 1.8 },
};
