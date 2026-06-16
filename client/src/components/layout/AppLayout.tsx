import { Outlet, Navigate, NavLink, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { format } from 'date-fns';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Loader2, LayoutDashboard, Plus,
  Settings, HelpCircle, LogOut, Bell, Search,
  Edit3, QrCode, Download, X, FileText
} from 'lucide-react';

const PRIMARY = '#1a3c2a';
const PRIMARY_LIGHT = '#52b788';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'My Forms', icon: FileText, to: '/forms' },
  { label: 'New Form', icon: Plus, to: '/builder' },
];

export default function AppLayout() {
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [qrForm, setQrForm] = useState<any>(null);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const { data: forms } = useQuery({
    queryKey: ['forms'],
    queryFn: async () => {
      const res = await api.get('/forms');
      return res.data.forms;
    },
    enabled: isAuthenticated
  });

  const handleDownloadCSV = async (form: any) => {
    try {
      const res = await api.get(`/responses/form/${form._id}`);
      const responses = res.data.responses;
      if (!responses || responses.length === 0) {
        alert('No responses to download yet!');
        return;
      }
      const headers = form.fields.map((f: any) => f.label) || [];
      const csvContent = [
        ['Submitted At', ...headers].join(','),
        ...responses.map((r: any) => [
          format(new Date(r.submittedAt), 'yyyy-MM-dd HH:mm:ss'),
          ...form.fields.map((f: any) => `"${(r.data[f.id] || '').toString().replace(/"/g, '""')}"`)
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${form?.title || 'responses'}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert('Failed to download CSV');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center" style={{ background: '#F0F2EE' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: PRIMARY }} />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="flex h-screen overflow-hidden p-3" style={{ background: '#EAECE7' }}>
      {/* ── Outer rounded card ───────────────────────────────────────── */}
      <div className="flex flex-1 rounded-2xl overflow-hidden shadow-lg" style={{ background: '#F7F8F5' }}>

        {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
        <aside className="w-[210px] flex flex-col bg-white flex-shrink-0" style={{ borderRight: '1px solid #EAECE7' }}>
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-5 py-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm" style={{ background: PRIMARY }}>
              F
            </div>
            <span className="font-bold text-base tracking-tight" style={{ color: '#111' }}>FormBuilder</span>
          </div>

          {/* Nav */}
          <div className="px-3 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest px-2 mb-2" style={{ color: '#9CA3AF' }}>MENU</p>
          </div>
          <nav className="px-3 space-y-0.5 mb-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
                style={({ isActive }) => isActive ? { background: PRIMARY } : {}}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? '#fff' : undefined }} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Forms removed from here, now a dedicated tab in menu */}

          {/* General section */}
          <div className="px-3 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest px-2 mb-2" style={{ color: '#9CA3AF' }}>GENERAL</p>
            <Link
              to="/settings"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${location.pathname === '/settings'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-ink hover:bg-surface-soft'
                }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <Link
              to="/help"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${location.pathname === '/help'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-ink hover:bg-surface-soft'
                }`}
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </Link>
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-ink hover:bg-surface-soft transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Bottom promo card */}
          <div className="mx-3 mb-4 p-4 rounded-2xl overflow-hidden relative" style={{ background: PRIMARY }}>
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10" style={{ background: PRIMARY_LIGHT }} />
            <div className="absolute -bottom-3 -left-3 w-16 h-16 rounded-full opacity-10" style={{ background: PRIMARY_LIGHT }} />
            <div className="relative z-10">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-3">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm font-bold text-white leading-snug">
                Build forms <span style={{ color: '#74c69d' }}>faster</span>
              </p>
              <p className="text-xs text-white/60 mt-1 mb-3">Drag, drop, publish.</p>
              <NavLink
                to="/builder"
                className="flex items-center justify-center w-full py-1.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-90"
                style={{ background: '#fff', color: PRIMARY }}
              >
                Create Form →
              </NavLink>
            </div>
          </div>
        </aside>

        {/* ── MAIN AREA ───────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top header */}
          <header className="flex items-center justify-between px-6 h-[60px] bg-white flex-shrink-0" style={{ borderBottom: '1px solid #EAECE7' }}>
            {/* Search */}
            <div className="flex items-center gap-2 rounded-xl px-4 h-9 text-sm min-w-[240px] focus-within:ring-2 focus-within:ring-green-500/20" style={{ background: '#F7F8F5', border: '1px solid #E5E7E0' }}>
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Search forms…" 
                className="bg-transparent border-none outline-none w-full text-gray-700 placeholder:text-gray-400"
                value={searchParams.get('q') || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setSearchParams({ q: e.target.value });
                    if (location.pathname !== '/dashboard') navigate('/dashboard');
                  } else {
                    setSearchParams({});
                  }
                }}
              />
              <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: '#E5E7E0', color: '#6B7280' }}>⌘F</span>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors" style={{ border: '1px solid #E5E7E0' }}>
                <Bell className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-100" />
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: PRIMARY }}>
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none" style={{ color: '#111' }}>{user?.name || 'User'}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{user?.email || ''}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page outlet */}
          <main className="flex-1 min-h-0 flex flex-col overflow-hidden" style={{ background: '#F7F8F5' }}>
            <Outlet />
          </main>
        </div>
      </div>

      {/* QR Code Modal */}
      {qrForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative" style={{ border: '1px solid #E8EAE4' }}>
            <button
              onClick={() => setQrForm(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-center mb-6" style={{ color: '#111' }}>{qrForm.title} QR Code</h3>
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                <QRCodeCanvas
                  value={`${window.location.origin}/form/${qrForm.slug}`}
                  size={200}
                  level="H"
                  fgColor={PRIMARY}
                />
              </div>
              <p className="text-xs text-gray-500 text-center mb-6">Scan to open the form directly on a mobile device.</p>
              <button
                onClick={() => {
                  const canvas = document.querySelector('canvas');
                  if (canvas) {
                    const url = canvas.toDataURL('image/png');
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${qrForm.slug}-qrcode.png`;
                    a.click();
                  }
                }}
                className="w-full h-10 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm"
                style={{ background: PRIMARY }}
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
