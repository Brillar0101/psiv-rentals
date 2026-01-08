// src/components/Navbar.tsx
// Top navigation bar for admin dashboard with Feather icons

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Film } from 'react-feather';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('admin_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  const getInitials = () => {
    if (!user) return 'A';
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'A';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon">
          <Film size={20} />
        </div>
        <h1>PSIV Rentals</h1>
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <div className="user-avatar">
            {getInitials()}
          </div>
          <div>
            <span className="user-name">
              {user?.first_name} {user?.last_name}
            </span>
            <span className="user-role">{user?.role || 'Admin'}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
