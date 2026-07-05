import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import ConfigType from './pages/ConfigType';
import DepartmentConfig from './pages/DepartmentConfig';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

const AppContent = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="app-container">
      {user && <Navbar />}
      <div style={{ flex: 1, padding: '20px' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/config-type" 
            element={
              <ProtectedRoute>
                <ConfigType />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/department-config" 
            element={
              <ProtectedRoute>
                <DepartmentConfig />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Navigate to="/config-type" />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
