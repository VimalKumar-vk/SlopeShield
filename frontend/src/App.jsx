import { BrowserRouter, Routes, Route } from "react-router-dom";
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
    </BrowserRouter>
  );
}

export default App;