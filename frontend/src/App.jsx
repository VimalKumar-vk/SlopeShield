import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import Locations from "./pages/Locations";
import RiskMap from "./pages/RiskMap";
import Simulation from "./pages/Simulation";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard and other pages */}
        <Route
          path="/"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />

        <Route
          path="/alerts"
          element={
            <DashboardLayout>
              <Alerts />
            </DashboardLayout>
          }
        />

        <Route
          path="/analytics"
          element={
            <DashboardLayout>
              <Analytics />
            </DashboardLayout>
          }
        />

        <Route
          path="/locations"
          element={
            <DashboardLayout>
              <Locations />
            </DashboardLayout>
          }
        />

        <Route
          path="/risk-map"
          element={
            <DashboardLayout>
              <RiskMap />
            </DashboardLayout>
          }
        />

        <Route
          path="/simulation"
          element={
            <DashboardLayout>
              <Simulation />
            </DashboardLayout>
          }
        />

        {/* Redirect old login/register URLs to dashboard */}
        <Route
          path="/login"
          element={<Navigate to="/" replace />}
        />

        <Route
          path="/register"
          element={<Navigate to="/" replace />}
        />

        {/* Unknown URLs redirect to dashboard */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;