// StarRating is now inline in each page for direct Figma match.
// This file kept for compatibility if needed elsewhere.
export default function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? '#FFC107' : '#D9D9D9' }}>★</span>
      ))}
    </span>
  );
}
