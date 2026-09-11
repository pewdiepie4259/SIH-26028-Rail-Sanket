import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import PublicLayout from "./layouts/PublicLayout"
import PublicDashboard from "./pages/PublicDashboard"
import { LiveTrainStatus } from "./pages/public/LiveTrainStatus"
import LiveMap from "./pages/public/LiveMap"
import TrainSearch from "./pages/public/TrainSearch"
import StationInformation from "./pages/public/StationInformation"
import Settings from "./pages/settings"
import Register from "./pages/register"
import Login from "./pages/login"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PublicDashboard />} />
          <Route path="/live" element={<LiveTrainStatus />} />
          <Route path="/live-train-status" element={<LiveTrainStatus />} />
          <Route path="/map" element={<LiveMap />} />
          <Route path="/trains" element={<TrainSearch />} />
          <Route path="/stations" element={<StationInformation />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route
          path="/controller"
          element={<div className="p-10">Controller Dashboard</div>}
        />

        <Route
          path="/admin"
          element={<div className="p-10">Admin Dashboard</div>}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App