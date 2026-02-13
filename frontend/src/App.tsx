/**
 * Main App Component
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Apps from './pages/Apps';
import AppDetail from './pages/AppDetail';
import TestRunDetail from './pages/TestRunDetail';
import Recorder from './pages/Recorder';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/apps"
            element={
              <ProtectedRoute>
                <Apps />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/apps/:appId"
            element={
              <ProtectedRoute>
                <AppDetail />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/test-runs/:runId"
            element={
              <ProtectedRoute>
                <TestRunDetail />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/recorder"
            element={
              <ProtectedRoute>
                <Recorder />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
