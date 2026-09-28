import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { GisMap } from './pages/GisMap';
import { AssetsList } from './pages/AssetsList';
import { AssetCreate } from './pages/AssetCreate';
import { AssetDetail } from './pages/AssetDetail';
import { InspectionsList } from './pages/InspectionsList';
import { WorkOrdersList } from './pages/WorkOrdersList';
import { RiskMatrixPage } from './pages/RiskMatrixPage';
import { AiAssistant } from './pages/AiAssistant';
import { NotificationsPage } from './pages/NotificationsPage';
import { AuditPage } from './pages/AuditPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
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
            <Route path="map" element={<GisMap />} />
            <Route path="assets" element={<AssetsList />} />
            <Route path="assets/new" element={<AssetCreate />} />
            <Route path="assets/:id" element={<AssetDetail />} />
            <Route path="inspections" element={<InspectionsList />} />
            <Route path="work-orders" element={<WorkOrdersList />} />
            <Route path="maintenance" element={<WorkOrdersList />} />
            <Route path="risks" element={<RiskMatrixPage />} />
            <Route path="dependencies" element={<Navigate to="/dashboard" replace />} />
            <Route path="ai-assistant" element={<AiAssistant />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="audit" element={<AuditPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
