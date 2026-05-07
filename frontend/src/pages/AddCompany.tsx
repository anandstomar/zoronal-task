import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Building2, MapPin, Map, Calendar,
  FileText, Image as ImageIcon, ArrowLeft, CheckCircle
} from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function AddCompany() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    location: '',
    city: '',
    foundedOn: '',
    description: '',
    logoUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await axios.post(`${API}/companies`, form);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      <Link to="/" className="back-link" id="back-to-list">
        <ArrowLeft size={16} /> Back to Companies
      </Link>

      <h1>Add New Company</h1>

      <div className="glass" style={{ padding: '2rem' }}>
        {error   && <div className="alert alert-danger">{error}</div>}
        {success && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} /> Company created successfully! Redirecting…
          </div>
        )}

        <form onSubmit={handleSubmit} id="add-company-form">
          <div className="grid cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                <Building2 size={14} /> Company Name *
              </label>
              <input
                id="name" name="name" type="text" className="form-control" required
                placeholder="e.g. Acme Corp"
                value={form.name} onChange={onChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="location">
                <MapPin size={14} /> Location (State / Country) *
              </label>
              <input
                id="location" name="location" type="text" className="form-control" required
                placeholder="e.g. California, USA"
                value={form.location} onChange={onChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="city">
                <Map size={14} /> City *
              </label>
              <input
                id="city" name="city" type="text" className="form-control" required
                placeholder="e.g. San Francisco"
                value={form.city} onChange={onChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="foundedOn">
                <Calendar size={14} /> Founded On *
              </label>
              <input
                id="foundedOn" name="foundedOn" type="date" className="form-control" required
                value={form.foundedOn} onChange={onChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="logoUrl">
              <ImageIcon size={14} /> Logo URL (optional)
            </label>
            <input
              id="logoUrl" name="logoUrl" type="url" className="form-control"
              placeholder="https://example.com/logo.png"
              value={form.logoUrl} onChange={onChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              <FileText size={14} /> Description
            </label>
            <textarea
              id="description" name="description" className="form-control" rows={5}
              placeholder="Brief overview of what the company does…"
              value={form.description} onChange={onChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
              Cancel
            </button>
            <button id="submit-company-btn" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Create Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
