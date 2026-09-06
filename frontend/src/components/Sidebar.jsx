import { NavLink } from "react-router-dom";

function Sidebar({ isOpen }) {
  const navigation = [
    {
      name: "Dashboard",
      path: "/",
      icon: "▦",
    },
    {
      name: "Risk Map",
      path: "/risk-map",
      icon: "◉",
    },
    {
      name: "Alerts",
      path: "/alerts",
      icon: "⚠",
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: "◔",
    },
    {
      name: "Locations",
      path: "/locations",
      icon: "⌖",
    },
    {
      name: "Simulation",
      path: "/simulation",
      icon: "◌",
    },
  ];

  return (
    <aside
      className={`sidebar ${
        isOpen
          ? "sidebar-open"
          : "sidebar-closed"
      }`}
    >
      <div className="sidebar-brand">
        <div className="sidebar-logo">▲</div>

        <div>
          <h1>SlopeShield</h1>
          <span>LANDSLIDE INTELLIGENCE</span>
        </div>
      </div>

      <nav className="sidebar-navigation">
        <p className="navigation-label">
          MONITORING
        </p>

        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${
                isActive
                  ? "active"
                  : ""
              }`
            }
            end={item.path === "/"}
          >
            <span className="nav-icon">
              {item.icon}
            </span>

            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="system-health">
          <span className="health-dot"></span>

          <div>
            <strong>System Healthy</strong>
            <span>All services operational</span>
          </div>
        </div>

        <p>© 2026 SlopeShield</p>
      </div>
    </aside>
  );
}

export default Sidebar;