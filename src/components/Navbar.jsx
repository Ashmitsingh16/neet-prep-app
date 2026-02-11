import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide navbar on test page for distraction-free experience
  if (location.pathname === '/test') return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-icon">🔬</span>
          <span className="brand-text">NEETPrepPro</span>
        </Link>

        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/select"
            className={`nav-link ${isActive('/select') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Practice
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}
        </div>

        <div className={`navbar-auth ${menuOpen ? 'open' : ''}`}>
          {user ? (
            <div className="user-menu">
              <span className="user-name">{user.name}</span>
              <button className="btn-logout" onClick={() => { logout(); setMenuOpen(false); }}>
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="btn-login"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
