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
      <Sidebar isOpen={sidebarOpen} />

      <div className="main-area">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
        />

        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;