// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { api } from "../services/api";

// function Header({ sidebarOpen, onToggleSidebar }) {
//   const navigate = useNavigate();

//   const [alertCount, setAlertCount] = useState(0);
//   const [bellActive, setBellActive] = useState(false);
//   const [profileOpen, setProfileOpen] = useState(false);

//   const profileRef = useRef(null);

//   // ==========================================
//   // GET LOGGED-IN USER
//   // ==========================================

//   const [user, setUser] = useState(() => {
//     try {
//       return JSON.parse(
//         localStorage.getItem("slopeShieldUser")
//       );
//     } catch {
//       return null;
//     }
//   });

//   // ==========================================
//   // ALERTS
//   // ==========================================

//   useEffect(() => {
//     const loadAlerts = async () => {
//       try {
//         const data = await api.getActiveAlerts();

//         const count = Array.isArray(data)
//           ? data.length
//           : 0;

//         setAlertCount(count);
//         setBellActive(count > 0);
//       } catch (error) {
//         console.error(
//           "Failed to load notification alerts:",
//           error
//         );
//       }
//     };

//     loadAlerts();

//     const interval = setInterval(
//       loadAlerts,
//       15000
//     );

//     return () => clearInterval(interval);
//   }, []);

//   // ==========================================
//   // CLOSE PROFILE WHEN CLICKING OUTSIDE
//   // ==========================================

//   useEffect(() => {
//     const handleOutsideClick = (event) => {
//       if (
//         profileRef.current &&
//         !profileRef.current.contains(event.target)
//       ) {
//         setProfileOpen(false);
//       }
//     };

//     document.addEventListener(
//       "mousedown",
//       handleOutsideClick
//     );

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleOutsideClick
//       );
//     };
//   }, []);

//   // ==========================================
//   // USER DATA
//   // ==========================================

//   const userName = user?.name || "User";

//   const userInitial =
//     userName.charAt(0).toUpperCase();

//   // ==========================================
//   // LOGOUT
//   // ==========================================

//   const handleLogout = () => {
//     localStorage.removeItem(
//       "slopeShieldLoggedIn"
//     );

//     setProfileOpen(false);

//     navigate("/login", {
//       replace: true,
//     });
//   };

//   // ==========================================
//   // LOGIN
//   // ==========================================

//   const handleLogin = () => {
//     setProfileOpen(false);

//     navigate("/login");
//   };

//   return (
//     <header className="top-header">

//       {/* ======================================
//           LEFT SIDE
//       ====================================== */}

//       <div className="header-left">

//         <button
//           className="menu-toggle"
//           type="button"
//           onClick={onToggleSidebar}
//           aria-label={
//             sidebarOpen
//               ? "Close sidebar"
//               : "Open sidebar"
//           }
//         >
//           ☰
//         </button>

//         <div className="header-logo">
//           <span className="logo-icon">
//             ▲
//           </span>
//         </div>

//         <div className="header-title">
//           <h2>SlopeShield</h2>

//           <span>
//             AI Landslide Early Warning System
//           </span>
//         </div>

//       </div>

//       {/* ======================================
//           RIGHT SIDE
//       ====================================== */}

//       <div className="header-right">

//         {/* SYSTEM STATUS */}

//         <div className="monitoring-status">
//           <span className="status-dot"></span>
//           SYSTEM ONLINE
//         </div>

//         {/* ====================================
//             NOTIFICATION
//         ==================================== */}

//         <button
//           className="notification-button"
//           type="button"
//           aria-label="Emergency notification"
//           onClick={() => {
//             window.dispatchEvent(
//               new CustomEvent(
//                 "slopeShieldEmergencySiren"
//               )
//             );
//           }}
//         >
//           🔔
//         </button>

//         {/* ====================================
//             USER PROFILE
//         ==================================== */}

//         <div
//           ref={profileRef}
//           style={{
//             position: "relative",
//           }}
//         >

//           {/* A AVATAR BUTTON */}

//           <button
//             type="button"
//             onClick={() =>
//               setProfileOpen(
//                 (previous) => !previous
//               )
//             }
//             aria-label="Open user menu"
//             style={{
//               border: "none",
//               background: "transparent",
//               padding: 0,
//               margin: 0,
//               cursor: "pointer",
//             }}
//           >
//             <div className="user-profile">

//               <div className="user-avatar">
//                 {userInitial}
//               </div>

//               <div className="user-info">
//                 <strong>
//                   {userName}
//                 </strong>

//                 <span>
//                   Control Center
//                 </span>
//               </div>

//             </div>
//           </button>

//           {/* ==================================
//               DROPDOWN
//           ================================== */}

//           {profileOpen && (
//             <div
//               style={{
//                 position: "absolute",
//                 top: "calc(100% + 15px)",
//                 right: 0,
//                 width: "280px",
//                 background: "#162033",
//                 border: "1px solid #334155",
//                 borderRadius: "16px",
//                 padding: "18px",
//                 boxShadow:
//                   "0 15px 40px rgba(0,0,0,0.45)",
//                 zIndex: 9999,
//               }}
//             >

//               {/* USER NAME */}

//               <div
//                 style={{
//                   textAlign: "center",
//                   marginBottom: "14px",
//                 }}
//               >
//                 <div
//                   style={{
//                     color: "#ffffff",
//                     fontSize: "21px",
//                     fontWeight: "700",
//                     marginBottom: "7px",
//                   }}
//                 >
//                   {userName}
//                 </div>

//                 {/* EMAIL */}

//                 <div
//                   style={{
//                     color: "#94a3b8",
//                     fontSize: "14px",
//                     maxWidth: "100%",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                     whiteSpace: "nowrap",
//                   }}
//                   title={user?.email || ""}
//                 >
//                   {user?.email || "No email"}
//                 </div>
//               </div>

//               {/* LINE */}

//               <div
//                 style={{
//                   height: "1px",
//                   background: "#334155",
//                   margin: "14px 0",
//                 }}
//               />

//               {/* LOGIN */}

//               <button
//                 type="button"
//                 onClick={handleLogin}
//                 style={{
//                   width: "100%",
//                   border: "none",
//                   background: "transparent",
//                   color: "#60a5fa",
//                   padding: "12px",
//                   textAlign: "left",
//                   fontSize: "16px",
//                   fontWeight: "700",
//                   borderRadius: "9px",
//                   cursor: "pointer",
//                 }}
//               >
//                 🔐 Login
//               </button>

//               {/* LOGOUT */}

//               <button
//                 type="button"
//                 onClick={handleLogout}
//                 style={{
//                   width: "100%",
//                   marginTop: "8px",
//                   padding: "12px",
//                   borderRadius: "9px",
//                   border:
//                     "1px solid #ef4444",
//                   background: "#991b1b",
//                   color: "#ffffff",
//                   fontSize: "16px",
//                   fontWeight: "700",
//                   cursor: "pointer",
//                 }}
//               >
//                 🚪 Logout
//               </button>

//             </div>
//           )}

//         </div>

//       </div>

//     </header>
//   );
// }

// export default Header;


import { useState } from "react";
import { NavLink } from "react-router-dom";

import {
  Menu,
  X,
  Bell,
  Mountain,
  UserRound,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", path: "/" },
  { label: "Risk Map", path: "/risk-map" },
  { label: "Alerts", path: "/alerts" },
  { label: "Analytics", path: "/analytics" },
  { label: "Locations", path: "/locations" },
  { label: "Simulation", path: "/simulation" },
];

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="flex h-[76px] items-center justify-between gap-4 px-4 md:px-8">

          {/* Logo */}
          <NavLink
            to="/"
            className="flex shrink-0 items-center gap-2 no-underline"
          >
            <Mountain
              size={30}
              className="text-sky-500"
            />

            <span className="text-xl font-bold tracking-tight text-gray-900">
              SlopeShield
            </span>
          </NavLink>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 lg:flex justify-between w-204">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-medium no-underline transition ${
                    isActive
                      ? "bg-gray-100 text-gray-950"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex shrink-0 items-center gap-2">

            {/* <button
              type="button"
              aria-label="Notifications"
              className="rounded-full p-3 text-gray-700 transition hover:bg-gray-100"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("slopeShieldEmergencySiren")
                );
              }}
            >
              <Bell size={20} />
            </button> */}

            {/* <button
              type="button"
              aria-label="User profile"
              className="flex items-center gap-2 rounded-full border border-gray-300 p-2 transition hover:shadow-md"
            >
              <UserRound size={20} />

              <span className="hidden text-sm font-semibold sm:inline">
                Profile
              </span>
            </button> */}

            {/* Mobile hamburger */}
            <button
              type="button"
              aria-label="Open navigation"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              className="rounded-full border border-gray-300 p-2 text-gray-800 transition hover:shadow-md lg:hidden"
            >
              <Menu size={22} />
            </button>

          </div>
        </div>
      </header>

      {/* Mobile backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          drawerOpen
            ? "visible opacity-100"
            : "invisible opacity-0"
        }`}
      />

      {/* Mobile sidebar */}
      <aside
        aria-label="Mobile navigation"
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
        className={`fixed right-0 top-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col border-l border-gray-200 bg-white shadow-xl transition-transform duration-300 lg:hidden ${
          drawerOpen
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex h-[76px] items-center justify-between border-b border-gray-200 px-5">
          <div className="flex items-center gap-2">
            <Mountain
              size={26}
              className="text-sky-500"
            />

            <span className="text-lg font-bold text-gray-900">
              SlopeShield
            </span>
          </div>

          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-sm font-medium no-underline transition ${
                  isActive
                    ? "bg-gray-100 text-gray-950"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-950"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}