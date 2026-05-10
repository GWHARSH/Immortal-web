import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogIn, LogOut } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(typeof window !== 'undefined' ? window.scrollY > 40 : false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Uploads', path: '/uploads' },
    { name: 'Packages', path: '/packages' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="navbar__logo-text">HIXX</span>
          <span className="navbar__logo-accent">PLAYZ</span>
        </Link>

        <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
          {user && user.role === 'admin' && (
            <Link
              to="/admin"
              className={`navbar__link ${location.pathname === '/admin' ? 'navbar__link--active' : ''}`}
            >
              Admin
            </Link>
          )}
          <div className="navbar__auth">
            {user ? (
              <button className="btn btn--ghost" onClick={signOut}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            ) : (
              <Link to="/login" className="btn btn--primary">
                <LogIn size={16} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>

        <button
          className="navbar__toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}
