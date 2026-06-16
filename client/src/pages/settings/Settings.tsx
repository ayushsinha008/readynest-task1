import { useAuthStore } from '../../store/useAuthStore';
import { User, Mail, Shield, Save } from 'lucide-react';

export default function Settings() {
  const { user } = useAuthStore();

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Settings</h1>
          <p className="text-muted mt-1">Manage your account settings and preferences.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-hairline overflow-hidden">
          <div className="p-6 border-b border-hairline flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Profile Information</h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Avatar section */}
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <button className="px-4 py-2 bg-surface-card hover:bg-surface-strong text-sm font-medium text-ink rounded-xl transition-colors border border-hairline">
                  Change Avatar
                </button>
                <p className="text-xs text-muted mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
              </div>
            </div>

            {/* Form */}
            <div className="grid gap-5">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-ink flex items-center gap-2">
                  <User className="w-4 h-4 text-muted" /> Full Name
                </label>
                <input 
                  type="text" 
                  defaultValue={user?.name || ''} 
                  disabled
                  className="w-full px-4 py-2.5 bg-surface-soft border border-hairline rounded-xl text-ink text-sm focus:outline-none cursor-not-allowed opacity-70"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-ink flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted" /> Email Address
                </label>
                <input 
                  type="email" 
                  defaultValue={user?.email || ''} 
                  disabled
                  className="w-full px-4 py-2.5 bg-surface-soft border border-hairline rounded-xl text-ink text-sm focus:outline-none cursor-not-allowed opacity-70"
                />
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-surface-soft border-t border-hairline flex justify-end">
            <button className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl flex items-center gap-2 opacity-50 cursor-not-allowed" disabled>
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white rounded-2xl border border-hairline overflow-hidden">
          <div className="p-6 border-b border-hairline flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
              <Shield className="w-5 h-5" /> Security
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-ink">Password</h3>
                <p className="text-sm text-muted mt-1">Set a unique password to protect your account.</p>
              </div>
              <button className="px-4 py-2 bg-surface-card hover:bg-surface-strong text-sm font-medium text-ink rounded-xl transition-colors border border-hairline">
                Update Password
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
