import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { useState } from 'react';
import CompanyList from './pages/CompanyList';
import CompanyDetails from './pages/CompanyDetails';
import './index.css';

function Navbar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate(`/?search=${encodeURIComponent(query)}`);
    } else {
      // dispatch a custom event so CompanyList can pick it up
      window.dispatchEvent(new CustomEvent('nav-search', { detail: query }));
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="nav-brand">
          <div className="nav-brand-icon">
            <Star size={20} fill="white" color="white" />
          </div>
          <span className="brand-text">Review&amp;<b>RATE</b></span>
        </Link>

        {/* Centre Search */}
        <div className="nav-search-wrap">
          <form className="nav-search" onSubmit={handleSearch}>
            <Search className="search-icon" size={17} />
            <input
              id="global-search"
              type="text"
              placeholder="Search..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          <button className="btn-signup" id="signup-btn">SignUp</button>
          <button className="btn-login" id="login-btn">Login</button>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"            element={<CompanyList />} />
        <Route path="/company/:id" element={<CompanyDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
