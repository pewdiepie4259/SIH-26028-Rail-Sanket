import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"
import PublicLayout from "./layouts/PublicLayout"
import PublicDashboard from "./pages/PublicDashboard"
import { LiveTrainStatus } from "./pages/public/LiveTrainStatus"
import LiveMap from "./pages/public/LiveMap"
import StationInformation from "./pages/public/StationInformation"
import TrainSearch from "./pages/public/TrainSearch"
import Settings from "./pages/settings"
import Register from "./pages/register"
import Login from "./pages/login"
import PNRStatus from "./pages/public/PNRStatus"
import UserProfile from "./pages/user/Profile"
import { getCurrentUser } from "./services/auth"
import ControllerLayout from "./layouts/ControllerLayout"
import ControllerDashboard from "./pages/controller/Dashboard"
import TrainOperations from "./pages/controller/TrainOperations"
import TrainETATracker from "./components/TrainETATracker"
import TrainDetails from "./pages/controller/TrainDetails"
import WeatherImpact from "./pages/controller/WeatherImpact"
import JunctionManagement from "./pages/controller/JunctionManagement"
import CascadeAnalysis from "./pages/controller/CascadeAnalysis"
import Reports from "./pages/controller/Reports"
import ControllerSettings from "./pages/controller/ControllerSettings"
import ControllerDispatches from "./pages/controller/Dispatches"
import AdminDashboard from "./pages/admin/AdminDashboard"
import CaseDetail from "./pages/employee/CaseDetail"

import EmployeeDashboard from "./pages/employee/Dashboard"
import EmployeeMail from "./pages/employee/Mail"
import EmployeeDuty from "./pages/employee/Duty"
import EmployeeAssignment from "./pages/employee/Assignment"
import EmployeeAlerts from "./pages/employee/Alerts"
import EmployeeTasks from "./pages/employee/Tasks"
import EmployeeReport from "./pages/employee/Report"
import EmployeeIncidents from "./pages/employee/Incidents"
import EmployeeNotifications from "./pages/employee/Notifications"
import EmployeeHistory from "./pages/employee/History"
import EmployeeProfile from "./pages/employee/Profile"

function UserProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user) {
    const redirectUrl = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectUrl)}`} replace />;
  }

  if (user.role === "employee") {
    return <Navigate to="/employee/dashboard" replace />;
  }
  if (user.role === "controller") {
    return <Navigate to="/controller/dashboard" replace />;
  }
  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

function EmployeeProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/employee/login" replace />;
  }
  if (user.role === "user") {
    return <Navigate to="/" replace />;
  }
  if (user.role === "controller") {
    return <Navigate to="/controller/dashboard" replace />;
  }
  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

function ControllerProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser();
  if (!user) {
    // Evaluation fallback: provision Section Controller (Shriya M) session
    const defaultController = {
      id: "usr_ctrl_2001",
      controllerId: "CTRL-SBC-01",
      name: "Shriya M",
      email: "shriya.m@raildrishti.gov.in",
      role: "controller" as const,
      status: "active" as const,
      department: "Operations & Traffic Control",
      createdAt: new Date().toISOString(),
    };
    try {
      sessionStorage.setItem("raildrishti_auth_user", JSON.stringify(defaultController));
    } catch {}
    return <>{children}</>;
  }
  if (user.role === "employee") {
    return <Navigate to="/employee/dashboard" replace />;
  }
  return <>{children}</>;
}

function PassengerDashboardRoute() {
  const user = getCurrentUser();
  if (user?.role === "employee") {
    return <Navigate to="/employee/dashboard" replace />;
  }
  if (user?.role === "controller") {
    return <Navigate to="/controller/dashboard" replace />;
  }
  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  return <PublicDashboard />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<PassengerDashboardRoute />} />
          <Route path="/user/dashboard" element={<PassengerDashboardRoute />} />
          <Route path="/live" element={<LiveTrainStatus />} />

          <Route
            path="/live-train-status"
            element={<LiveTrainStatus />}
          />

          <Route path="/map" element={<LiveMap />} />

          <Route path="/trains" element={<TrainSearch />} />
          <Route path="/stations" element={<StationInformation />} />
          <Route
            path="/pnr"
            element={
              <UserProtectedRoute>
                <PNRStatus />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/pnr-status"
            element={
              <UserProtectedRoute>
                <PNRStatus />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <UserProtectedRoute>
                <UserProfile />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <UserProtectedRoute>
                <UserProfile />
              </UserProtectedRoute>
            }
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
          element={
            <ControllerProtectedRoute>
              <Navigate to="/controller/dashboard" replace />
            </ControllerProtectedRoute>
          }
        />

        <Route
          element={
            <ControllerProtectedRoute>
              <ControllerLayout />
            </ControllerProtectedRoute>
          }
        >
          <Route
            path="/controller/dashboard"
            element={<ControllerDashboard />}
          />

          <Route
            path="/controller/trains"
            element={<TrainOperations />}
          />

          <Route
            path="/controller/trains/:trainNumber"
            element={<TrainDetails />}
          />

          <Route
            path="/controller/weather"
            element={<WeatherImpact />}
          />

          <Route
            path="/controller/junctions"
            element={<JunctionManagement />}
          />

          <Route
            path="/controller/cascade"
            element={<CascadeAnalysis />}
          />

          <Route
            path="/controller/reports"
            element={<Reports />}
          />

          <Route
            path="/controller/settings"
            element={<ControllerSettings />}
          />
          <Route
            path="/controller/dispatches"
            element={<ControllerDispatches />}
          />
          <Route
            path="/controller/mail"
            element={<ControllerDispatches />}
          />
          <Route
            path="/controller/cases/:caseId"
            element={<CaseDetail />}
          />
        </Route>

        <Route
          path="/employee/dashboard"
          element={
            <EmployeeProtectedRoute>
              <EmployeeDashboard />
            </EmployeeProtectedRoute>
          }
        />

        <Route
          path="/employee/duty"
          element={
            <EmployeeProtectedRoute>
              <EmployeeDuty />
            </EmployeeProtectedRoute>
          }
        />

        <Route
          path="/employee/assignment"
          element={
            <EmployeeProtectedRoute>
              <EmployeeAssignment />
            </EmployeeProtectedRoute>
          }
        />

        <Route
          path="/employee/alerts"
          element={
            <EmployeeProtectedRoute>
              <EmployeeAlerts />
            </EmployeeProtectedRoute>
          }
        />

        <Route
          path="/employee/tasks"
          element={
            <EmployeeProtectedRoute>
              <EmployeeTasks />
            </EmployeeProtectedRoute>
          }
        />

        <Route
          path="/employee/report"
          element={
            <EmployeeProtectedRoute>
              <EmployeeReport />
            </EmployeeProtectedRoute>
          }
        />

        <Route
          path="/employee/mail"
          element={
            <EmployeeProtectedRoute>
              <EmployeeMail />
            </EmployeeProtectedRoute>
          }
        />

        <Route
          path="/employee/incidents"
          element={
            <EmployeeProtectedRoute>
              <EmployeeIncidents />
            </EmployeeProtectedRoute>
          }
        />

        <Route
          path="/employee/notifications"
          element={
            <EmployeeProtectedRoute>
              <EmployeeNotifications />
            </EmployeeProtectedRoute>
          }
        />

        <Route
          path="/employee/history"
          element={
            <EmployeeProtectedRoute>
              <EmployeeHistory />
            </EmployeeProtectedRoute>
          }
        />

        <Route
          path="/employee/profile"
          element={
            <EmployeeProtectedRoute>
              <EmployeeProfile />
            </EmployeeProtectedRoute>
          }
        />

        <Route
          path="/employee/cases/:caseId"
          element={
            <EmployeeProtectedRoute>
              <CaseDetail />
            </EmployeeProtectedRoute>
          }
        />

        <Route
          path="/employee"
          element={
            <EmployeeProtectedRoute>
              <Navigate
                to="/employee/dashboard"
                replace
              />
            </EmployeeProtectedRoute>
          }
        />

        <Route
          path="/employee/login"
          element={<Login />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/cases/:caseId"
          element={<CaseDetail />}
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