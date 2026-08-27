import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import GovDashboard from './pages/GovDashboard';

export default function App() {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <GovDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
