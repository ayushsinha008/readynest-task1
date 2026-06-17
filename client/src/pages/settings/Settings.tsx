import { useState, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { User, Mail, Shield, Save, Key, X, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';

export default function Settings() {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess('');
    setProfileError('');
    try {
      const { data } = await api.put('/auth/profile', profileForm);
      updateUser(data.user);
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (error: any) {
      setProfileError(error.response?.data?.message || 'Error updating profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    try {
      await api.put('/auth/password', passwordForm);
      alert('Password updated successfully!');
      setShowPasswordForm(false);
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || 'Error updating password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setProfileError('File size must be less than 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm(prev => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Settings</h1>
          <p className="text-muted mt-1">Manage your account settings and preferences.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-hairline overflow-hidden shadow-sm">
          <div className="p-6 border-b border-hairline flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Profile Information</h2>
          </div>
          
          <form onSubmit={handleProfileSubmit}>
            <div className="p-6 space-y-6">
              
              {profileSuccess && (
                <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
                  {profileError}
                </div>
              )}

              {/* Avatar section */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold overflow-hidden border-2 border-surface-soft shrink-0">
                  {profileForm.avatar ? (
                    <img src={profileForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-surface-card hover:bg-surface-strong text-sm font-medium text-ink rounded-xl transition-colors border border-hairline"
                  >
                    Change Avatar
                  </button>
                  <p className="text-xs text-muted mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-ink flex items-center gap-2">
                    <User className="w-4 h-4 text-muted" /> Full Name
                  </label>
                  <input 
                    type="text" 
                    value={profileForm.name} 
                    onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-surface-soft border border-hairline rounded-xl text-ink text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-ink flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted" /> Email Address
                  </label>
                  <input 
                    type="email" 
                    value={profileForm.email} 
                    readOnly
                    className="w-full px-4 py-2.5 bg-surface-card border border-hairline rounded-xl text-muted text-sm cursor-not-allowed opacity-80 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-surface-soft border-t border-hairline flex justify-end">
              <button 
                type="submit"
                disabled={profileLoading}
                className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-70"
              >
                <Save className="w-4 h-4" /> {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Security Card */}
        <div className="bg-white rounded-2xl border border-hairline overflow-hidden shadow-sm">
          <div className="p-6 border-b border-hairline flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
              <Shield className="w-5 h-5" /> Security
            </h2>
          </div>
          
          <div className="p-6">
            {!showPasswordForm ? (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-ink">Password</h3>
                  <p className="text-sm text-muted mt-1">Set a unique password to protect your account.</p>
                </div>
                <button 
                  onClick={() => setShowPasswordForm(true)}
                  className="px-4 py-2 bg-surface-card hover:bg-surface-strong text-sm font-medium text-ink rounded-xl transition-colors border border-hairline"
                >
                  Update Password
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-ink">Update Password</h3>
                  <button 
                    type="button" 
                    onClick={() => setShowPasswordForm(false)}
                    className="p-1.5 hover:bg-surface-soft rounded-lg transition-colors text-muted hover:text-ink"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {passwordError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                    {passwordError}
                  </div>
                )}

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-ink flex items-center gap-2">
                    <Key className="w-4 h-4 text-muted" /> Current Password
                  </label>
                  <input 
                    type="password" 
                    required
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2 bg-surface-soft border border-hairline rounded-xl text-ink text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-ink">New Password</label>
                  <input 
                    type="password" 
                    required
                    minLength={6}
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2 bg-surface-soft border border-hairline rounded-xl text-ink text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="px-4 py-2 text-sm font-medium text-ink bg-surface-soft hover:bg-surface-strong rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={passwordLoading}
                    className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-colors disabled:opacity-70"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
