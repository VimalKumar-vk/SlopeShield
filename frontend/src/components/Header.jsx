function Header({ sidebarOpen, onToggleSidebar }) {
  return (
    <header className="top-header">
      <div className="header-left">
        <button
          className="menu-toggle"
          type="button"
          onClick={onToggleSidebar}
          aria-label={
            sidebarOpen
              ? "Close sidebar"
              : "Open sidebar"
          }
        >
          {sidebarOpen ? " ☰" : "☰"}
        </button>

        <div className="header-logo">
          <span className="logo-icon">▲</span>
        </div>

        <div className="header-title">
          <h2>SlopeShield</h2>
          <span>AI Landslide Early Warning System</span>
        </div>
      </div>

      <div className="header-right">
        <div className="monitoring-status">
          <span className="status-dot"></span>
          SYSTEM ONLINE
        </div>

        <button
          className="notification-button"
          type="button"
          aria-label="Notifications"
        >
          🔔
        </button>

        <div className="user-profile">
          <div className="user-avatar">A</div>

          <div className="user-info">
            <strong>Administrator</strong>
            <span>Control Center</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;