import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AiFloatingChat from './components/AiFloatingChat';
import GovDashboard from './pages/GovDashboard';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import ReportDiseasePage from './pages/ReportDiseasePage';
import DiseaseMapPage from './pages/DiseaseMapPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LaboratoryPage from './pages/LaboratoryPage';
import VaccinationsPage from './pages/VaccinationsPage';
import RiskDashboardPage from './pages/RiskDashboardPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';

export default function App() {
  return (
    <>
      <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <GovDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases"
        element={
          <ProtectedRoute>
            <CasesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases/:id"
        element={
          <ProtectedRoute>
            <CaseDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report"
        element={
          <ProtectedRoute>
            <ReportDiseasePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report-disease"
        element={
          <ProtectedRoute>
            <ReportDiseasePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/map"
        element={
          <ProtectedRoute>
            <DiseaseMapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/laboratory"
        element={
          <ProtectedRoute>
            <LaboratoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vaccinations"
        element={
          <ProtectedRoute>
            <VaccinationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/risk"
        element={
          <ProtectedRoute>
            <RiskDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <GovDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
    <AiFloatingChat />
    </>
  );
}
