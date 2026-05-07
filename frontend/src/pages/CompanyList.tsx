import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { MapPin, X, Calendar, Building } from 'lucide-react';

const API = 'http://localhost:5000/api';

interface Company {
  _id: string;
  name: string;
  address: string;
  location: string;
  city: string;
  logoUrl: string;
  description: string;
  foundedOn: string;
  avgRating: number;
  reviewCount: number;
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

function AddCompanyModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: '', location: '', foundedOn: '', city: '', logoUrl: '', description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true); setError('');
      await axios.post(`${API}/companies`, form);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Add Company">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <div className="modal-header-graphic">
        </div>
        <div className="modal-body">
          <h2 className="modal-title">Add Company</h2>
          {error && <div className="alert alert-error"><X size={14} />{error}</div>}
          <form onSubmit={handleSubmit} id="add-company-form">
            <div className="form-group">
              <label className="form-label" style={{ marginTop: "60px"}} htmlFor="company-name">Company name</label>
              <input id="company-name" name="name" type="text" className="form-control"
                placeholder="Enter..." value={form.name} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="company-location">Location</label>
              <div className="form-control-icon">
                <input id="company-location" name="location" type="text" className="form-control"
                  placeholder="Select Location" value={form.location} onChange={onChange} required />
                <MapPin className="input-icon" size={16} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="company-founded">Founded on</label>
              <div className="form-control-icon">
                <input id="company-founded" name="foundedOn" type="date" className="form-control"
                  value={form.foundedOn} onChange={onChange} required />
                <Calendar className="input-icon" size={16} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="company-city">City</label>
              <input id="company-city" name="city" type="text" className="form-control"
                placeholder="Enter city" value={form.city} onChange={onChange} required />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
              <button id="save-company-btn" type="submit" className="btn-purple" disabled={loading}
                style={{ padding: '10px 40px' }}>
                {loading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CompanyList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading]     = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort]               = useState('name');
  const [showAdd, setShowAdd]         = useState(false);

  useEffect(() => {
    const handler = (e: Event) => setSearchInput((e as CustomEvent).detail as string);
    window.addEventListener('nav-search', handler);
    return () => window.removeEventListener('nav-search', handler);
  }, []);

  useEffect(() => {
    const s = searchParams.get('search');
    if (s) setSearchInput(s);
  }, []);   // eslint-disable-line

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<Company[]>(`${API}/companies`, {
        params: searchInput.trim() ? { search: searchInput.trim() } : {}
      });
      let sorted = [...data];
      if (sort === 'name')     sorted.sort((a, b) => a.name.localeCompare(b.name));
      if (sort === 'average')  sorted.sort((a, b) => b.avgRating - a.avgRating);
      if (sort === 'rating')   sorted.sort((a, b) => b.reviewCount - a.reviewCount);
      if (sort === 'location') sorted.sort((a, b) => (a.location || a.city).localeCompare(b.location || b.city));
      setCompanies(sorted);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [searchInput, sort]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const formatFounded = (date: string) => {
    if (!date) return '';
    const d    = new Date(date);
    const dd   = String(d.getDate()).padStart(2, '0');
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const logoFallback = (name: string) => {
    const colors = ['1B2A4A', '2E7D32', 'F57C00', '1565C0', '6A1FA8', 'C62828'];
    const idx    = name.charCodeAt(0) % colors.length;
    const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('');
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${colors[idx]}&color=fff&size=128&bold=true&rounded=false`;
  };

  return (
    <div className="page-content">
      <div className="filter-section">
        <div className="filter-bar">
          <div className="filter-field">
            <span className="filter-label">Select City</span>
            <div className="filter-input-wrap">
              <input
                id="city-search"
                type="text"
                className="filter-input"
                placeholder="Search by company name or city..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchCompanies()}
              />
              <MapPin className="filter-input-icon" size={16} />
            </div>
          </div>
          <button id="find-company-btn" className="btn-purple1" onClick={fetchCompanies}>
            Find Company
          </button>
          <button id="add-company-btn" className="btn-purple1" onClick={() => setShowAdd(true)}>
            + Add Company
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <span className="filter-label" style={{ marginBottom: 2 }}>Sort:</span>
            <select id="sort-select" className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="name">Name</option>
              <option value="average">Average</option>
              <option value="rating">Rating</option>
              <option value="location">Location</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap">
          <div className="spinner" />
          <span>Loading companies…</span>
        </div>
      ) : companies.length === 0 ? (
        <div className="empty-state">
          <Building size={48} style={{ margin: '0 auto 12px', color: '#ccc' }} />
          <h3>No companies found</h3>
          <p>Try a different search term or add a new company.</p>
          <button className="btn-purple" onClick={() => setShowAdd(true)}>+ Add Company</button>
        </div>
      ) : (
        <>
          <p className="result-count">Result Found: {companies.length}</p>
          <div className="company-list">
            {companies.map(c => (
              <div key={c._id} className="company-row" id={`company-${c._id}`}>
                <img
                  src={c.logoUrl || logoFallback(c.name)}
                  alt={c.name}
                  className="company-row-logo"
                  onError={e => { (e.target as HTMLImageElement).src = logoFallback(c.name); }}
                />
                <div className="company-row-body">
                  <div className="company-row-name">{c.name}</div>
                  <div className="company-row-addr">
                    <MapPin size={13} style={{ color: '#7B2CBF', flexShrink: 0 }} />
                    {c.location}
                  </div>
                  <div className="company-row-rating">
                    <span className="rating-num">{c.avgRating > 0 ? c.avgRating.toFixed(1) : '–'}</span>
                    <Stars rating={c.avgRating} size={16} />
                    {c.reviewCount > 0 && (
                      <span className="review-count">{c.reviewCount} Reviews</span>
                    )}
                  </div>
                </div>
                <div className="company-row-right">
                  <span className="founded-label">
                    {c.foundedOn ? `Founded on  ${formatFounded(c.foundedOn)}` : '\u00a0'}
                  </span>
                  <button
                    id={`detail-btn-${c._id}`}
                    className="btn-dark"
                    onClick={() => navigate(`/company/${c._id}`)}
                  >
                    Detail Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showAdd && (
        <AddCompanyModal onClose={() => setShowAdd(false)} onSaved={fetchCompanies} />
      )}
    </div>
  );
}
