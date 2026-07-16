import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { theme } from '../theme';

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ avg: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      // كل التقييمات — للمعدّل والعدد
      const { data: all } = await supabase.from('reviews').select('rating');

      // التقييمات اللي فيها تعليق — للعرض
      const { data: withComments } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at')
        .not('comment', 'is', null)
        .order('created_at', { ascending: false })
        .limit(6);

      if (!alive) return;

      if (all && all.length > 0) {
        setStats({
          avg: all.reduce((sum, r) => sum + r.rating, 0) / all.length,
          total: all.length,
        });
      }
      setReviews(withComments || []);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading || stats.total === 0) return null;

  return (
    <section style={s.section}>
      <div style={s.head}>
        <span style={s.eyebrow}>آراء العملاء</span>
        <h2 style={s.h2}>وش يقولون عنّا؟</h2>
        <p style={s.avg}>
          <span style={s.avgStar}>★</span> {stats.avg.toFixed(1)} من 5 — بناءً على{' '}
          {stats.total} تقييم
        </p>
      </div>

      {reviews.length > 0 && (
        <div style={s.grid} className="feat-grid">
          {reviews.map((r) => (
            <article key={r.id} style={s.card}>
              <div style={s.cardStars}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} style={{ color: n <= r.rating ? '#C9A961' : theme.border }}>
                    ★
                  </span>
                ))}
              </div>
              <p style={s.comment}>{r.comment}</p>
              <p style={s.date}>{new Date(r.created_at).toLocaleDateString('ar-SA')}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

const wrap = { maxWidth: 1200, margin: '0 auto', padding: '0 20px' };
const s = {
  section: { ...wrap, padding: '44px 20px' },
  head: { textAlign: 'center', marginBottom: 32 },
  eyebrow: { color: '#9C7A45', fontSize: 14, fontWeight: 700, letterSpacing: 1 },
  h2: { fontSize: 30, fontWeight: 800, marginTop: 8, color: theme.text },
  avg: { fontSize: 14, color: theme.textDim, marginTop: 10 },
  avgStar: { color: '#C9A961', fontSize: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  card: {
    padding: 24,
    background: theme.bgCard,
    border: `1px solid ${theme.border}`,
    borderRadius: 20,
  },
  cardStars: { fontSize: 17, letterSpacing: 1, marginBottom: 12 },
  comment: { fontSize: 14, color: theme.text, lineHeight: 1.9 },
  date: { fontSize: 12, color: theme.textDim, marginTop: 14 },
};
