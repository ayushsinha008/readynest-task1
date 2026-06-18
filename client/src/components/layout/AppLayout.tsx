import { Outlet, Navigate, NavLink, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { format } from 'date-fns';
import { QRCodeCanvas } from 'qrcode.react';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import {
  Loader2, LayoutDashboard, Plus,
  Settings, HelpCircle, LogOut, Bell, Search,
  Edit3, QrCode, Download, X, FileText, Crown
} from 'lucide-react';
import LogoIcon from '../icons/LogoIcon';

const PRIMARY = '#1a3c2a';
const PRIMARY_LIGHT = '#52b788';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'My Forms', icon: FileText, to: '/forms' },
  { label: 'New Form', icon: Plus, to: '/builder' },
  { label: 'Pricing & Plans', icon: Crown, to: '/pricing' },
];

export default function AppLayout() {
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [qrForm, setQrForm] = useState<any>(null);
  
  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>(() => {
    const saved = localStorage.getItem('formbuilder_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });
  const [browserNotificationEnabled, setBrowserNotificationEnabled] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );

  // Fetch Notification History
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/analytics/notifications').then((res) => {
        if (res.data?.success && res.data?.notifications) {
          setNotifications(prev => {
            const merged = [...prev];
            res.data.notifications.forEach((newNotif: any) => {
              if (!merged.find(n => n.id === newNotif.id)) {
                merged.push(newNotif);
              }
            });
            return merged.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 50);
          });
        }
      }).catch(err => console.error("Failed to load notifications history", err));
    }
  }, [isAuthenticated]);

  // Save notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem('formbuilder_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const requestBrowserNotification = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support desktop notifications.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setBrowserNotificationEnabled(true);
      toast.success('Desktop notifications enabled!');
    } else {
      toast.error('Permission denied for notifications.');
    }
  };

  useEffect(() => { checkAuth(); }, [checkAuth]);

  // Auto-prompt for notifications if not yet asked
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            setBrowserNotificationEnabled(true);
            toast.success('Desktop notifications enabled!');
          }
        });
      }, 2000); // slight delay so it's not jarring immediately on load
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const userId = user?.id || (user as any)?._id;
    if (isAuthenticated && userId) {
      // Connect to socket when authenticated
      const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        withCredentials: true
      });

      socket.on('connect', () => {
        socket.emit('join', userId);
      });

      socket.on('new_submission', (data: any) => {
        const newNotif = {
          id: Date.now().toString(),
          message: data.message,
          formId: data.formId,
          time: new Date().toISOString(),
          read: false
        };
        
        setNotifications((prev) => [newNotif, ...prev].slice(0, 50)); // keep last 50
        
        toast.success(data.message, {
          duration: 5000,
          position: 'top-right',
        });

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Form Submission', {
            body: data.message,
            icon: '/favicon.ico'
          });
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [isAuthenticated, user?.id, (user as any)?._id]);

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
      <Toaster />
      {/* ── Outer rounded card ───────────────────────────────────────── */}
      <div className="flex flex-1 rounded-2xl overflow-hidden shadow-lg" style={{ background: '#F7F8F5' }}>

        {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
        <aside className="w-[210px] flex flex-col bg-white flex-shrink-0" style={{ borderRight: '1px solid #EAECE7' }}>
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-5 py-5">
            <div className="w-10 h-10 flex items-center justify-center text-ink">
              <LogoIcon className="w-full h-full" />
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: '#111' }}>FormBuilder</span>
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
          {user?.plan === 'free' ? (
            <div className="mx-3 mb-4 p-5 rounded-[20px] overflow-hidden relative shadow-lg" style={{ background: 'linear-gradient(135deg, #1a3c2a 0%, #2d6a4f 100%)' }}>
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20" style={{ background: '#74c69d' }} />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full opacity-20" style={{ background: '#74c69d' }} />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-200 flex items-center justify-center mb-3 shadow-md">
                  <Crown className="w-5 h-5 text-yellow-900" />
                </div>
                <p className="text-[15px] font-bold text-white leading-tight mb-1">
                  Unlock Pro
                </p>
                <p className="text-[12px] text-white/80 font-medium mb-4">
                  Unlimited forms & responses.
                </p>
                <NavLink
                  to="/pricing"
                  className="flex items-center justify-center w-full py-2.5 rounded-xl text-[13px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg animate-pulse hover:animate-none"
                  style={{ background: '#fff', color: '#1a3c2a' }}
                >
                  Upgrade Now
                </NavLink>
              </div>
            </div>
          ) : (
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
          )}
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
              {user?.plan === 'free' ? (
                <Link 
                  to="/pricing" 
                  className="hidden md:flex items-center justify-center h-9 px-4 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 shadow-sm"
                  style={{ background: PRIMARY }}
                >
                  Upgrade
                </Link>
              ) : null}
              
              <div className="hidden md:flex items-center justify-center h-9 px-3 rounded-xl border border-gray-200 bg-gray-50 text-[11px] font-bold tracking-wider uppercase text-gray-500">
                {user?.plan === 'premium' ? (
                  <span className="text-purple-600 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>Premium Plan</span>
                ) : user?.plan === 'pro' ? (
                  <span className="text-green-600 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>Pro Plan</span>
                ) : (
                  <span>Free Plan</span>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) {
                      // Mark all as read when opening
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    }
                  }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors relative" 
                  style={{ border: '1px solid #E5E7E0' }}
                >
                  <Bell className="w-4 h-4" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-white"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                      <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                      {notifications.length > 0 && (
                        <button 
                          onClick={() => setNotifications([])}
                          className="text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    {!browserNotificationEnabled && (
                      <div className="bg-blue-50/50 border-b border-blue-100 px-4 py-3 flex flex-col gap-2">
                        <p className="text-[11px] text-blue-800 leading-tight font-medium">Enable desktop notifications to get alerted even when the tab is hidden.</p>
                        <button 
                          onClick={requestBrowserNotification}
                          className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg w-fit hover:bg-blue-700 transition-colors"
                        >
                          Enable Desktop Notifications
                        </button>
                      </div>
                    )}
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-gray-500 flex flex-col items-center">
                          <Bell className="w-6 h-6 text-gray-300 mb-2" />
                          <p>You have no notifications yet.</p>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {notifications.map((notif) => (
                            <Link 
                              key={notif.id}
                              to={`/responses/${notif.formId}`}
                              onClick={() => setShowNotifications(false)}
                              className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex flex-col gap-1"
                            >
                              <p className="text-sm text-gray-900 leading-snug">{notif.message}</p>
                              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                {format(new Date(notif.time), 'MMM d, h:mm a')}
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="w-px h-6 bg-gray-100" />
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden" style={{ background: PRIMARY }}>
                  {user?.avatar ? (
                    <img src={user?.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
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
