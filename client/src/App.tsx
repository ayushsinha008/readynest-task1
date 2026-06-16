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
import { useAuthStore } from './store/useAuthStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
}

export default function App() {
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
      </Route>
    </Routes>
  );
}
