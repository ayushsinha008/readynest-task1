import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/dashboard/Dashboard';
import FormBuilder from './pages/builder/FormBuilder';
import FormViewer from './pages/public/FormViewer';
import Home from './pages/public/Home';
import Responses from './pages/responses/Responses';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Settings from './pages/settings/Settings';
import Help from './pages/help/Help';
import MyForms from './pages/forms/MyForms';
import Pricing from './pages/subscription/Pricing';
import Success from './pages/subscription/Success';
import Cancel from './pages/subscription/Cancel';
import Checkout from './pages/subscription/Checkout';
import { useAuthStore } from './store/useAuthStore';

import { useEffect } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
}

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/form/:slug" element={<FormViewer />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/builder" element={<FormBuilder />} />
        <Route path="/builder/:id" element={<FormBuilder />} />
        <Route path="/responses/:formId" element={<Responses />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
        <Route path="/forms" element={<MyForms />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
      </Route>
    </Routes>
  );
}
