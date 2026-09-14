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
import ControllerDashboardLegacy from "./pages/ControllerDashboard"
import ControllerLayout from "./layouts/ControllerLayout"
import ControllerDashboard from "./pages/controller/Dashboard"
import TrainETATracker from "./components/TrainETATracker"
import TrainDetails from "./pages/controller/TrainDetails"
import WeatherImpact from "./pages/controller/WeatherImpact"

import EmployeeDashboard from "./pages/employee/Dashboard"
import EmployeeDuty from "./pages/employee/Duty"
import EmployeeAssignment from "./pages/employee/Assignment"
import EmployeeAlerts from "./pages/employee/Alerts"
import EmployeeTasks from "./pages/employee/Tasks"
import EmployeeReport from "./pages/employee/Report"
import EmployeeIncidents from "./pages/employee/Incidents"
import EmployeeNotifications from "./pages/employee/Notifications"
import EmployeeHistory from "./pages/employee/History"
import EmployeeProfile from "./pages/employee/Profile"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PublicDashboard />} />

          <Route path="/live" element={<LiveTrainStatus />} />

          <Route
            path="/live-train-status"
            element={<LiveTrainStatus />}
          />

          <Route path="/map" element={<LiveMap />} />

          <Route path="/trains" element={<TrainSearch />} />

          <Route
            path="/stations"
            element={<StationInformation />}
          />

          <Route path="/settings" element={<Settings />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route path="/eta" element={<TrainETATracker />} />

          <Route
            path="/eta-tracker"
            element={<TrainETATracker />}
          />
        </Route>

        <Route
          path="/controller"
          element={<ControllerDashboardLegacy />}
        />

        <Route element={<ControllerLayout />}>
          <Route
            path="/controller/dashboard"
            element={<ControllerDashboard />}
          />

          <Route
            path="/controller/trains/:trainNumber"
            element={<TrainDetails />}
          />

          <Route
            path="/controller/weather"
            element={<WeatherImpact />}
          />
        </Route>

        <Route
          path="/employee/dashboard"
          element={<EmployeeDashboard />}
        />

        <Route
          path="/employee/duty"
          element={<EmployeeDuty />}
        />

        <Route
          path="/employee/assignment"
          element={<EmployeeAssignment />}
        />

        <Route
          path="/employee/alerts"
          element={<EmployeeAlerts />}
        />

        <Route
          path="/employee/tasks"
          element={<EmployeeTasks />}
        />

        <Route
          path="/employee/report"
          element={<EmployeeReport />}
        />

        <Route
          path="/employee/incidents"
          element={<EmployeeIncidents />}
        />

        <Route
          path="/employee/notifications"
          element={<EmployeeNotifications />}
        />

        <Route
          path="/employee/history"
          element={<EmployeeHistory />}
        />

        <Route
          path="/employee/profile"
          element={<EmployeeProfile />}
        />

        <Route
          path="/employee"
          element={
            <Navigate
              to="/employee/dashboard"
              replace
            />
          }
        />

        <Route
          path="/employee/login"
          element={<Login />}
        />

        <Route
          path="/admin"
          element={
            <div className="p-10">
              Admin Dashboard
            </div>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App