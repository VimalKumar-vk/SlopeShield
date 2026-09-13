import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import Locations from "./pages/Locations";
import RiskMap from "./pages/RiskMap";
import Simulation from "./pages/Simulation";

import Login from "./pages/Login";
import Register from "./pages/Register";

import "./App.css";

// ==================================================
// PROTECTED ROUTE
// ==================================================

function ProtectedRoutes() {
  const isLoggedIn =
    localStorage.getItem("slopeShieldLoggedIn") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/risk-map" element={<RiskMap />} />
        <Route path="/simulation" element={<Simulation />} />
      </Routes>
    </DashboardLayout>
  );
}

// ==================================================
// APP
// ==================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* DASHBOARD + OTHER PAGES */}
        <Route
          path="/*"
          element={<ProtectedRoutes />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;