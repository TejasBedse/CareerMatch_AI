import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuth, getUser, isAuthenticated } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const user = getUser();
  const authed = isAuthenticated();

  function handleLogout() {
    clearAuth();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">
          <div className="logo-icon">⚡</div>
          CareerMatch<span className="gradient-text" style={{ marginLeft: 2 }}>AI</span>
        </NavLink>

        {authed && (
          <ul className="navbar-nav">
            <li><NavLink to="/dashboard">Dashboard</NavLink></li>
            <li><NavLink to="/resume">Resume</NavLink></li>
            <li><NavLink to="/jd">Job Match</NavLink></li>
            <li><NavLink to="/roadmap">Roadmap</NavLink></li>
            <li><NavLink to="/interview">Interview</NavLink></li>
            <li><NavLink to="/applications">Applications</NavLink></li>
          </ul>
        )}

        <div className="flex items-center gap-4">
          {authed ? (
            <>
              <span className="text-sm text-muted">
                👤 {user?.name || 'User'}
              </span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-ghost btn-sm">Sign In</NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">Get Started</NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
