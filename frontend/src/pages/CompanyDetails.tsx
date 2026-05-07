import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, X, ThumbsUp } from 'lucide-react';

const API = 'http://localhost:5000/api';

interface Company {
  _id: string;
  name: string;
  location: string;
  city: string;
  foundedOn: string;
  logoUrl: string;
  description: string;
  avgRating: number;
  reviewCount: number;
}

interface Review {
  _id: string;
  fullName: string;
  reviewText: string;
  rating: number;
  likes: number;
  createdAt: string;
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map(i => {
        const full = rating >= i;
        const half = !full && rating >= i - 0.5;
        return (
          <span key={i} style={{ position: 'relative', display: 'inline-block', fontSize: size, lineHeight: 1, width: `${size}px` }}>
            <span style={{ color: 'var(--star-empty)' }}>★</span>
            {(full || half) && (
              <span style={{
                position: 'absolute', left: 0, top: 0,
                color: 'var(--star-filled)',
                overflow: 'hidden',
                width: full ? '100%' : '50%',
                whiteSpace: 'nowrap'
              }}>★</span>
            )}
          </span>
        );
      })}
    </span>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-picker" id="star-picker">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n} type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <span style={{
            fontSize: 45,
            color: n <= (hovered || value) ? 'var(--star-filled)' : 'var(--star-empty)',
            transition: 'color 0.15s'
          }}>★</span>
        </button>
      ))}
    </div>
  );
}

function AddReviewModal({ companyId, onClose, onSaved }: { companyId: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ fullName: '', subject: '', reviewText: '', rating: 5 });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true); setError('');
      await axios.post(`${API}/reviews`, { ...form, companyId });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Add Review">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <div className="modal-header-graphic">
        </div>
        <div className="modal-body">
          <h2 className="modal-title">Add Review</h2>
          {error && <div className="alert alert-error"><X size={14} />{error}</div>}
          <form onSubmit={handleSubmit} id="add-review-form">
            <div className="form-group">
              <label className="form-label" style={{ marginTop: "60px"}} htmlFor="review-name">Full Name</label>
              <input id="review-name" type="text" className="form-control" required
                placeholder="Your full name"
                value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} />
            </div>
              <div className="form-group">
              <label className="form-label" htmlFor="review-name">Subject</label>
              <input id="review-name" type="text" className="form-control" required
                placeholder="Subject"
                value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="review-text">Review</label>
              <textarea id="review-text" className="form-control" required rows={4}
                placeholder="Share your experience…"
                value={form.reviewText} onChange={e => setForm(p => ({ ...p, reviewText: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label" id="review-rating">Rating</label>
              <StarPicker value={form.rating} onChange={n => setForm(p => ({ ...p, rating: n }))} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
              <button id="submit-review-btn" type="submit" className="btn-purple" disabled={loading}
                style={{ padding: '10px 40px' }}>
                {loading ? 'Submitting…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [company,  setCompany]  = useState<Company | null>(null);
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [sort, setSort] = useState('date');
  const [showAdd,  setShowAdd]  = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [cRes, rRes] = await Promise.all([
        axios.get<Company>(`${API}/companies/${id}`),
        axios.get<Review[]>(`${API}/reviews/company/${id}?sort=${sort}`)
      ]);
      setCompany(cRes.data);
      setReviews(rRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [id, sort]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLike = async (reviewId: string) => {
    if (likedIds.has(reviewId)) return;
    try {
      await axios.post(`${API}/reviews/${reviewId}/like`);
      setLikedIds(p => new Set([...p, reviewId]));
      setReviews(p => p.map(r => r._id === reviewId ? { ...r, likes: r.likes + 1 } : r));
    } catch (err) { console.error(err); }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}-${mm}-${yyyy}, ${hh}:${min}`;
  };

  const formatFounded = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  if (loading) return (
    <div className="page-content">
      <div className="loading-wrap"><div className="spinner" /><span>Loading…</span></div>
    </div>
  );

  if (!company) return (
    <div className="page-content">
      <div className="empty-state">
        <h3>Company not found.</h3>
        <button className="btn-purple" onClick={() => navigate('/')}>Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="page-content">

      <div className="detail-company-card" id="company-detail-card">
        <img
          src={company.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name.split(' ').slice(0,2).map((w:string) => w[0]).join(''))}&background=1B2A4A&color=fff&size=128&bold=true&rounded=false`}
          alt={company.name}
          className="detail-company-logo"
        />
        <div className="detail-company-body">
          <div className="detail-company-name">{company.name}</div>
          <div className="detail-company-addr">
            <MapPin size={13} style={{ color: '#7B2CBF', flexShrink: 0 }} />
            {company.location}
          </div>
          <div className="detail-rating-row" id="avg-rating-row">
            <span className="detail-avg-num">{company.avgRating > 0 ? company.avgRating.toFixed(1) : '–'}</span>
            <Stars rating={company.avgRating} size={18} />
            {company.reviewCount > 0 && (
              <span className="detail-review-count">{company.reviewCount} Reviews</span>
            )}
          </div>
        </div>
        <div className="detail-company-right">
          {company.foundedOn && (
            <span className="detail-founded">Founded on  {formatFounded(company.foundedOn)}</span>
          )}
          <button
            id="add-review-btn"
            className="btn-purple1"
            onClick={() => setShowAdd(true)}
          >
            + Add Review
          </button>
        </div>
      </div>

      <div className="reviews-header">
        <span className="reviews-result-count" id="review-count-label">
          {reviews.length > 0 ? `Result Found: ${reviews.length}` : 'No reviews yet'}
        </span>
        <div className="sort-bar">
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Sort by:</span>
          <select
            id="sort-reviews"
            className="sort-select"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="date">Newest</option>
            <option value="rating">Highest Rating</option>
            <option value="relevance">Most Relevant</option>
          </select>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-state">
          <h3>No reviews yet</h3>
          <p>Be the first to share your experience with {company.name}.</p>
          <button className="btn-purple1" onClick={() => setShowAdd(true)}>+ Add Review</button>
        </div>
      ) : (
        <div className="review-list">
          {reviews.map(review => (
            <div key={review._id} className="review-item" id={`review-${review._id}`}>
              <div className="review-top">
                <div className="review-avatar" aria-label={review.fullName}>
                  {review.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="review-meta">
                  <div className="review-name">{review.fullName}</div>
                  <div className="review-date">{formatDate(review.createdAt)}</div>
                </div>
                <div className="review-stars">
                  <Stars rating={review.rating} size={18} />
                </div>
              </div>
              <p className="review-text-body">{review.reviewText}</p>
              <div className="review-actions-row">
                <button
                  id={`like-btn-${review._id}`}
                  className={`like-btn${likedIds.has(review._id) ? ' liked' : ''}`}
                  onClick={() => handleLike(review._id)}
                  title="Mark as helpful"
                >
                  <ThumbsUp size={12} />
                  Helpful{review.likes > 0 ? ` (${review.likes})` : ''}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddReviewModal
          companyId={id!}
          onClose={() => setShowAdd(false)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}
