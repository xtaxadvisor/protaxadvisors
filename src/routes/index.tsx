import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { UnauthorizedPage } from '../components/shared/UnauthorizedPage';
import { NotFoundPage } from '../components/shared/NotFoundPage';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

// Eagerly load critical components
import Home from '../pages/Home';

// Lazy load other components
const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/RegisterPage'));
const ServiceCatalog = React.lazy(() => import('../pages/services/ServiceCatalog'));
const SameDayServices = React.lazy(() => import('../pages/services/SameDayServices'));
const VideoLibrary = React.lazy(() => import('../pages/videos/VideoLibrary'));
const VideoDetail = React.lazy(() => import('../pages/videos/VideoDetail'));
const AdminPortal = React.lazy(() => import('../pages/admin/AdminPortal'));
const InvestorPortal = React.lazy(() => import('../pages/investor/InvestorPortal'));
const StudentPortal = React.lazy(() => import('../pages/student/StudentPortal'));
const ProfessionalPortal = React.lazy(() => import('../pages/ProfessionalPortal'));
const TaxCalculator = React.lazy(() => import('../pages/calculator/TaxCalculator'));
const TaxForms = React.lazy(() => import('../pages/forms/TaxForms'));

const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

export function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/services" element={
        <LazyRoute>
          <ServiceCatalog />
        </LazyRoute>
      } />
      <Route path="/same-day-services" element={
        <LazyRoute>
          <SameDayServices />
        </LazyRoute>
      } />
      <Route path="/calculator" element={
        <LazyRoute>
          <TaxCalculator />
        </LazyRoute>
      } />
      <Route path="/tax-forms" element={
        <LazyRoute>
          <TaxForms />
        </LazyRoute>
      } />
      <Route path="/browse-videos" element={
        <LazyRoute>
          <VideoLibrary />
        </LazyRoute>
      } />
      <Route path="/browse-videos/:videoId" element={
        <LazyRoute>
          <VideoDetail />
        </LazyRoute>
      } />
      
      {/* Auth Routes */}
      <Route path="/login" element={
        <LazyRoute>
          {isAuthenticated ? <Navigate to="/" /> : <LoginPage />}
        </LazyRoute>
      } />
      <Route path="/register" element={
        <LazyRoute>
          {isAuthenticated ? <Navigate to="/" /> : <RegisterPage />}
        </LazyRoute>
      } />

      {/* Protected Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute requiredRole={['admin']}>
          <LazyRoute>
            <AdminPortal />
          </LazyRoute>
        </ProtectedRoute>
      } />
      
      <Route path="/investor/*" element={
        <ProtectedRoute requiredRole={['investor']}>
          <LazyRoute>
            <InvestorPortal />
          </LazyRoute>
        </ProtectedRoute>
      } />

      <Route path="/student/*" element={
        <ProtectedRoute requiredRole={['student']}>
          <LazyRoute>
            <StudentPortal />
          </LazyRoute>
        </ProtectedRoute>
      } />

      <Route path="/professional/*" element={
        <ProtectedRoute requiredRole={['professional']}>
          <LazyRoute>
            <ProfessionalPortal />
          </LazyRoute>
        </ProtectedRoute>
      } />

      {/* Error Pages */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
}