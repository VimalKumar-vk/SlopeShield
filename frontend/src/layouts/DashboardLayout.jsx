import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function toggleSidebar() {
    setSidebarOpen((previousState) => !previousState);
  }

  return (
    <div className="dashboard-layout">
      {/* Left Navigation */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Main Application Area */}
      <div className="main-area">
        {/* Top Header */}
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
        />

        {/* Main Content */}
        <main className="dashboard-content">
          <div className="dashboard-content-inner">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;