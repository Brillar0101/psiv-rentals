// src/components/Sidebar.tsx
// Left sidebar navigation menu

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/equipment', icon: '📷', label: 'Equipment' },
    { path: '/bookings', icon: '📅', label: 'Bookings' },
    { path: '/categories', icon: '📁', label: 'Categories' },
  ];

  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
