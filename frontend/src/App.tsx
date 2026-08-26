import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';

import FarmerDashboard from './pages/FarmerDashboard';

import GovDashboard from './pages/GovDashboard';

import Landing from './pages/Landing';
import GovLogin from './pages/GovLogin';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { token, role } = useAuth();
  
  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && role && !allowedRoles.includes(role)) return <Navigate to="/unauthorized" />;
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/department-of-ahd-login" element={<GovLogin />} />
      
      <Route 
        path="/farmer/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['FARMER']}>
            <FarmerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vet/*" 
        element={
          <ProtectedRoute allowedRoles={['VETERINARIAN']}>
            <div className="p-8">Veterinarian Dashboard (Coming Soon)</div>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/ahd/surveillance-hq" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <GovDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
