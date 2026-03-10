import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import dashboard from './pages/Dashboard';
import './index.css';

// ─── Helper: check if a valid token exists in localStorage ───────────────────
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// ─── PrivateRoute: only let authenticated users through ──────────────────────
function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

// ─── PublicRoute: if already logged in, skip login/signup → go home ──────────
function PublicRoute({ children }) {
  return isAuthenticated() ? <Navigate to="/" replace /> : children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Default: redirect root to /login */}
        <Route path="/" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />

        {/* Login – redirect to home if already logged in */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        {/* Signup – redirect to home if already logged in */}
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />

        {/* Catch-all → login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
