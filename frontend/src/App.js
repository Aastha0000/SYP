import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GuideDashboard from './pages/GuideDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminGuides from './pages/AdminGuides';
import AdminDestinations from './pages/AdminDestinations';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import PublicGuides from './pages/PublicGuides';
import GuideProfile from './pages/GuideProfile';
import Destinations from './pages/Destinations';
import DestinationDetails from './pages/DestinationDetails';
import MessagesPage from './pages/MessagesPage';
import GuideProfileSettings from './pages/GuideProfileSettings';
import './index.css';

// ─── Helper: check if a valid token exists in localStorage ───────────────────
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// ─── ProtectedRoute: handle role-based navigation ───────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their respective dashboards if they hit a wrong route
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'guide') return <Navigate to="/guide-dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
}

// ─── DefaultRedirect: Send users to their correct home ──────────────────────
function DefaultRedirect() {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
  if (user.role === 'guide') return <Navigate to="/guide/home" replace />;
  if (user.role === 'user') return <Navigate to="/user/home" replace />;
  return <Navigate to="/login" replace />;
}


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DefaultRedirect />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Guide Portal Routes */}
        <Route path="/guide/home" element={
          <ProtectedRoute allowedRoles={['guide']}>
            <GuideDashboard />
          </ProtectedRoute>
        } />
        <Route path="/guide/messages" element={
          <ProtectedRoute allowedRoles={['guide']}>
            <MessagesPage />
          </ProtectedRoute>
        } />
        <Route path="/guide/profile" element={
          <ProtectedRoute allowedRoles={['guide']}>
            <GuideProfileSettings />
          </ProtectedRoute>
        } />
        <Route path="/guide-dashboard" element={<Navigate to="/guide/home" replace />} />
        <Route path="/guide-messages" element={<Navigate to="/guide/messages" replace />} />
        <Route path="/guide-profile" element={<Navigate to="/guide/profile" replace />} />

        {/* Admin Portal Routes */}
        <Route path="/admin-dashboard/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin-dashboard/guides" element={<ProtectedRoute allowedRoles={['admin']}><AdminGuides /></ProtectedRoute>} />
        <Route path="/admin-dashboard/destinations" element={<ProtectedRoute allowedRoles={['admin']}><AdminDestinations /></ProtectedRoute>} />
        <Route path="/admin-dashboard/profile" element={<ProtectedRoute allowedRoles={['admin']}><Profile /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<Navigate to="/admin-dashboard/users" replace />} />
        
        {/* User Portal Routes */}
        <Route path="/user/home" element={<ProtectedRoute allowedRoles={['user']}><Home /></ProtectedRoute>} />
        <Route path="/user/profile" element={<ProtectedRoute allowedRoles={['user']}><Profile /></ProtectedRoute>} />
        <Route path="/user/messages" element={<ProtectedRoute allowedRoles={['user']}><MessagesPage /></ProtectedRoute>} />
        <Route path="/user/destinations" element={<ProtectedRoute allowedRoles={['user']}><Destinations /></ProtectedRoute>} />
        <Route path="/user/destinations/:id" element={<ProtectedRoute allowedRoles={['user']}><DestinationDetails /></ProtectedRoute>} />
        
        <Route path="/guides" element={<PublicGuides />} />
        <Route path="/guides/:id" element={<GuideProfile />} />

        <Route path="/destinations" element={<Destinations />} />
        <Route path="/destinations/:id" element={<DestinationDetails />} />

        <Route path="/profile" element={<Navigate to="/user/profile" replace />} />

        {/* Catch-all → root/login */}
        <Route path="*" element={<DefaultRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;

