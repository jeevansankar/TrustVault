
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/auth/Register";
import VerifyOtp from "./pages/auth/VerifyOtp";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/auth/Dashboard";
import Documents from "./pages/auth/Documents";
import Permissions from "./pages/auth/Permissions";
import SharedWithMe from "./pages/auth/SharedWithMe";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyResetOtp from "./pages/auth/VerifyResetOtp";
import ResetPassword from "./pages/auth/ResetPassword";
import AuditLogs from "./pages/auth/AuditLogs";
import IntegrityVerification from "./pages/auth/IntegrityVerification";
import "./video-background.css";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("trustvault_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function VideoBackdrop() {
  return (
    <div className="tv-video-backdrop" aria-hidden="true">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster=""
      >
        <source
          src="/videos/trustvault-hero.mp4"
          type="video/mp4"
        />
      </video>
      <div className="tv-video-overlay" />
    </div>
  );
}

function AppContent() {
  const location = useLocation();

  const videoRoutes = [
    "/",
    "/login",
    "/register",
    "/verify-otp",
    "/forgot-password",
    "/verify-reset-otp",
    "/reset-password",
  ];

  const showVideo = videoRoutes.includes(location.pathname);

  return (
    <div className={`app-shell ${showVideo ? "has-video-bg" : ""}`}>
      {showVideo && <VideoBackdrop />}

      <Routes>
        {/* Public homepage */}
        <Route path="/" element={<Home />} />

        {/* Registration and OTP verification */}
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />

        {/* Login and password recovery */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/verify-reset-otp"
          element={<VerifyResetOtp />}
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Protected application pages */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/permissions"
          element={
            <ProtectedRoute>
              <Permissions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/shared-with-me"
          element={
            <ProtectedRoute>
              <SharedWithMe />
            </ProtectedRoute>
          }
        />

        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute>
              <AuditLogs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/integrity-verification"
          element={
            <ProtectedRoute>
              <IntegrityVerification />
            </ProtectedRoute>
          }
        />

        {/* Unknown URLs return to the homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
