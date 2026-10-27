import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isSuperAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Menu items for all admins
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/feedbacks', label: 'Feedbacks', icon: '📝' },
    { path: '/categories', label: 'Categories', icon: '🏷️' },
    { path: '/audit-logs', label: 'Audit Logs', icon: '📋' },
  ];

  // ✅ Only Super Admin can see Admin Management
  if (isSuperAdmin) {
    menuItems.push({ path: '/admins', label: 'Admin Management', icon: '👑' });
  }

  return (
    <aside className="sidebar-modern">
      <div className="sidebar-header-modern">
        <div className="logo-section">
          <span className="logo-icon">📋</span>
          <div>
            <h2>Feedback</h2>
            <p className="sidebar-subtitle">Management System</p>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav-modern">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link-modern ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.path === '/feedbacks' && (
              <span className="sidebar-badge">New</span>
            )}
          </Link>
        ))}
      </nav>
      
      <div className="sidebar-footer-modern">
        <div className="user-info-modern">
          <div className="user-avatar-modern">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="user-details-modern">
            <span className="user-name-modern">{user?.username || 'Admin'}</span>
            <span className="user-role-modern">
              {isSuperAdmin ? '👑 Super Admin' : '🔑 Admin'}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn-modern">
          <span className="logout-icon">🚪</span> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;