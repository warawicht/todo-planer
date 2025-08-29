import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { Calendar } from './components/Calendar';
import { Dashboard } from './components/Dashboard';
import NetworkStatusIndicator from './components/NetworkStatusIndicator';
import NotificationPanel from './components/NotificationPanel';
import { CalendarViewType } from './types/calendar.types';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Main App component
const AppContent: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">Todo Planer</h1>
                </div>
                <nav className="ml-6 flex space-x-8">
                  <a href="/dashboard" className="border-b-2 border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                    Dashboard
                  </a>
                  <a href="/calendar" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium">
                    Calendar
                  </a>
                </nav>
              </div>
              <div className="flex items-center">
                <NetworkStatusIndicator />
                <NotificationPanel />
                <div className="ml-3 relative">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">{user.firstName} {user.lastName}</span>
                    <button className="bg-gray-200 rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none">
                      <span className="sr-only">View profile</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}
      
      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <div className="p-6">
                <Calendar 
                  userId={user?.id || ''}
                  initialView={CalendarViewType.WEEK}
                  initialDate={new Date()}
                />
              </div>
            </ProtectedRoute>
          } />
          
          {/* Default route */}
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
};

// Main App wrapper with providers
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;