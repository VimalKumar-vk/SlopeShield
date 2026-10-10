// import { useState } from "react";
// import Header from "../components/Header";
// import Sidebar from "../components/Sidebar";

// function DashboardLayout({ children }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   function toggleSidebar() {
//     setSidebarOpen((previousState) => !previousState);
//   }

//   return (
//     <div className="dashboard-layout">
//       <Sidebar
//         isOpen={sidebarOpen}
//         onClose={() => setSidebarOpen(false)}
//       />

//       <div className="main-area">
//         <Header
//           sidebarOpen={sidebarOpen}
//           onToggleSidebar={toggleSidebar}
//         />

//         <main className="dashboard-content">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

// export default DashboardLayout;


import Header from "../components/Header";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="min-w-0">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;