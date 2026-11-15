import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { LiveMonitoring } from './pages/LiveMonitoring';
import { Astronauts } from './pages/Astronauts';
import { Missions } from './pages/Missions';
import { Alerts } from './pages/Alerts';
import { Analytics } from './pages/Analytics';
import { AIPredictions } from './pages/AIPredictions';
import { HealthRecords } from './pages/HealthRecords';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Toaster } from 'react-hot-toast';

// Protected Route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07111F] flex items-center justify-center font-mono text-sky-400 text-sm">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span>AUTHENTICATING MISSION CREDENTIALS...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'font-mono text-xs',
              style: {
                background: '#0d1b2e',
                color: '#f8fafc',
                border: '1px solid rgba(56, 189, 248, 0.2)',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="monitoring" element={<LiveMonitoring />} />
              <Route path="astronauts" element={<Astronauts />} />
              <Route path="missions" element={<Missions />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="predictions" element={<AIPredictions />} />
              <Route path="records" element={<HealthRecords />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
