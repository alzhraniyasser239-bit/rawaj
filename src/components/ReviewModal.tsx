import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { theme } from '../theme';

const labels = { 1: 'سيئة', 2: 'مقبولة', 3: 'جيدة', 4: 'ممتازة', 5: 'رائعة' };

export default function ReviewModal({ order, userId, onClose }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    if (rating === 0) {
      setError('اختر عدد النجوم أولاً');
      return;
    }
    setSaving(true);
    setError('');

    const { error: insertError } = await supabase.from('reviews').insert({
      order_id: order.id,
      user_id: userId,
      rating,
      comment: comment.trim() || null,
    });

    setSaving(false);

    if (insertError) {
      if (insertError.code === '23505') setError('قيّمت هذا الطلب من قبل');
      else if (insertError.code === '42501') setError('التقييم متاح للطلبات المكتملة فقط');
      else setError('تعذّر إرسال التقييم، جرّب مرة ثانية');
      return;
    }

    onClose(true);
  }

  return (
    <div style={s.overlay} onClick={() => !saving && onClose(false)}>
      <div style={s.box} onClick={(e) => e.stopPropagation()}>
        <h3 style={s.title}>كيف كانت الخدمة؟</h3>
        <p style={s.sub}>
          {order.services?.name || 'طلب'} — رقم {order.id}
        </p>

        <div style={s.stars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} من 5`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              style={{
                ...s.star,
                color: n <= (hover || rating) ? '#C9A961' : theme.border,
              }}
            >
              ★
            </button>
          ))}
        </div>

        <p style={s.starLabel}>{labels[hover || rating] || ''}</p>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="اكتب رأيك (اختياري)"
          style={s.textarea}
        />
        <p style={s.counter}>{comment.length}/300</p>

        {error && <p style={s.error}>{error}</p>}

        <div style={s.actions}>
          <button type="button" onClick={submit} disabled={saving} style={s.submit}>
            {saving ? 'جارٍ الإرسال…' : 'إرسال التقييم'}
          </button>
          <button
            type="button"
            onClick={() => onClose(false)}
            disabled={saving}
            style={s.later}
          >
            لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  box: {
    width: '100%',
    maxWidth: 400,
    padding: 28,
    background: theme.bgCard,
    border: `1px solid ${theme.border}`,
    borderRadius: 24,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  title: { fontSize: 22, fontWeight: 800, color: theme.text, marginBottom: 6 },
  sub: { fontSize: 13, color: theme.textDim, marginBottom: 22 },
  stars: { display: 'flex', justifyContent: 'center', gap: 4 },
  star: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 40,
    lineHeight: 1,
    padding: '0 2px',
    transition: 'transform .15s',
  },
  starLabel: {
    textAlign: 'center',
    height: 22,
    fontSize: 14,
    fontWeight: 700,
    color: '#9C7A45',
    margin: '8px 0 16px',
  },
  textarea: {
    width: '100%',
    resize: 'none',
    padding: 14,
    borderRadius: 14,
    border: `1px solid ${theme.border}`,
    background: 'rgba(0,0,0,0.03)',
    color: theme.text,
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  },
  counter: { fontSize: 11, color: theme.textDim, textAlign: 'left', marginTop: 5 },
  error: { fontSize: 13, color: '#ef4444', marginTop: 8 },
  actions: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 },
  submit: {
    flex: 1,
    padding: '14px 0',
    borderRadius: 14,
    border: 'none',
    cursor: 'pointer',
    background: theme.gradient,
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'inherit',
    boxShadow: '0 8px 20px rgba(122,93,51,0.25)',
  },
  later: {
    padding: '14px 18px',
    borderRadius: 14,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: theme.textDim,
    fontSize: 14,
    fontFamily: 'inherit',
  },
};
