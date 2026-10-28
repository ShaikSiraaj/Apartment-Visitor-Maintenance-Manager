import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ResidentDashboard from './pages/ResidentDashboard';
import SecurityDashboard from './pages/SecurityDashboard';
import Visitors from './pages/Visitors';
import Maintenance from './pages/Maintenance';

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100 bg-light">
          <Navbar />
          <div className="d-flex flex-grow-1">
            <Sidebar />
            <main className="flex-grow-1 p-3">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={['Admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/resident"
                  element={
                    <ProtectedRoute roles={['Resident']}>
                      <ResidentDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/security"
                  element={
                    <ProtectedRoute roles={['Security Guard']}>
                      <SecurityDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/visitors"
                  element={
                    <ProtectedRoute roles={['Admin', 'Resident', 'Security Guard']}>
                      <Visitors />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/maintenance"
                  element={
                    <ProtectedRoute roles={['Admin', 'Resident', 'Security Guard']}>
                      <Maintenance />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
