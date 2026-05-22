import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/upload', label: 'Upload', icon: '📤' },
  { path: '/analysis', label: 'KPI Analysis', icon: '📈' },
  { path: '/clusters', label: 'Clusters', icon: '🗺️' },
  { path: '/export', label: 'Export', icon: '📥' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="brand-logo">T</div>
        {!collapsed && (
          <div className="brand-text">
            <span className="brand-name">Talkpool</span>
            <span className="brand-sub">KPI Dashboard</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
            }
            title={item.label}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="sidebar-toggle"
        onClick={onToggle}
        aria-label="Toggle sidebar"
      >
        {collapsed ? '→' : '←'}
      </button>
    </aside>
  );
}
