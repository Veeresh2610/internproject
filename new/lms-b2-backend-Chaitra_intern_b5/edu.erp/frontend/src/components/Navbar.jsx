import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Settings, Users } from 'lucide-react';

const Navbar = () => {
  const { logout, user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary-color)' }}>
        IonERP Admin
      </div>
      <div className="nav-links">
        <Link 
          to="/config-type" 
          className={`nav-link ${location.pathname === '/config-type' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Settings size={18} /> Configuration
        </Link>
        <Link 
          to="/department-config" 
          className={`nav-link ${location.pathname === '/department-config' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Users size={18} /> Departments
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Welcome, {user.first_name || user.username}
        </span>
        <button onClick={logout} className="btn" style={{ background: 'transparent', color: 'var(--danger)', padding: '8px' }}>
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
