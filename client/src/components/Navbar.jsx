import { NavLink, useNavigate } from 'react-router-dom';
import { clearAuth, getUser, isAuthenticated } from '../services/api';
import careerMatchLogo from '../assets/career-match-logo-full.svg';
import {
  IconTarget,
  IconFileText,
  IconBarChart,
  IconCompass,
  IconMic,
  IconBriefcase,
  IconArrowRight,
  IconUser,
} from './Icons';

export default function Navbar() {
  const navigate = useNavigate();
  const user = getUser();
  const authed = isAuthenticated();

  function handleLogout() {
    clearAuth();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/project-details" className="navbar-brand" title="About CareerMatch AI">
          <img className="brand-logo-full" src={careerMatchLogo} alt="CareerMatch AI - Better Skills. Better Matches." />
        </NavLink>

        {authed && (
          <nav>
            <ul className="navbar-links">
              <li>
                <NavLink to="/dashboard" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                  <IconBarChart size={15} />
                  <span>Overview</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/resume" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                  <IconFileText size={15} />
                  <span>Resume Intelligence</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/jd" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                  <IconTarget size={15} />
                  <span>Job Matcher</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/roadmap" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                  <IconCompass size={15} />
                  <span>Skill Roadmap</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/interview" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                  <IconMic size={15} />
                  <span>Interview Prep</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/applications" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                  <IconBriefcase size={15} />
                  <span>Applications</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        )}

        <div className="flex items-center gap-3">
          {authed ? (
            <>
              <div className="user-profile-chip" title={user?.email || 'Logged in candidate'}>
                <div className="user-avatar-circle">
                  {(user?.name || 'C').charAt(0).toUpperCase()}
                </div>
                <span>{user?.name?.split(' ')[0] || 'Candidate'}</span>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleLogout}
                title="Sign out of your session"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-ghost btn-sm">
                Sign In
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                <span>Get Started</span>
                <IconArrowRight size={14} />
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
