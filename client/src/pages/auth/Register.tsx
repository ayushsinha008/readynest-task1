import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate, Link, Navigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import LogoIcon from '../../components/icons/LogoIcon';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'register' | 'otp'>('register');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f9fafb]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={returnTo || "/dashboard"} replace />;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      setError('');
      const { data } = await api.post('/auth/register', { name, email, password });
      setStep('otp');
      setSuccessMsg('OTP sent to your email!');
      if (data.previewUrl) setPreviewUrl(data.previewUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      setError('');
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      login(data.user);
      navigate(returnTo || '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setError('');
      const { data } = await api.post('/auth/resend-otp', { email });
      setSuccessMsg('New OTP sent to your email!');
      if (data.previewUrl) setPreviewUrl(data.previewUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9fafb] px-4 font-sans relative overflow-hidden">
      {/* Optional: subtle background pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-50 z-0 pointer-events-none"></div>
      
      <div className="w-full max-w-[440px] p-8 sm:p-10 bg-white rounded-[24px] shadow-xl border border-gray-100 relative z-10">
        <div className="flex justify-center mb-6">
          <LogoIcon className="w-12 h-12 text-ink" />
        </div>
        {step === 'register' ? (
          <>
            <h2 className="text-[32px] font-display font-bold text-center mb-8 tracking-tight text-ink">Create an Account</h2>
            {error && <div className="mb-6 text-destructive text-sm text-center bg-red-50 py-2 rounded-lg">{error}</div>}
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-ink focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  required 
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-ink focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  required 
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Password</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-ink focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  required 
                  placeholder="••••••••"
                />
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full bg-primary text-on-primary rounded-xl h-[52px] font-bold text-[16px] hover:bg-primary-active transition-all shadow-md mt-6 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70">
                {isSubmitting ? 'Sending OTP...' : 'Register'}
              </button>
            </form>
            <p className="mt-8 text-center text-[15px] text-gray-500 font-medium">
              Already have an account? <Link to={returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login"} className="text-primary font-semibold hover:underline">Log in</Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-[32px] font-display font-bold text-center mb-4 tracking-tight text-ink">Verify Email</h2>
            <p className="text-center text-sm text-gray-500 mb-6">We've sent a 6-digit OTP to <br/><strong className="text-ink">{email}</strong></p>
            
            {previewUrl && (
              <div className="mb-6 flex justify-center">
                <a 
                  href={previewUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  Open Email Inbox (Test Mode)
                </a>
              </div>
            )}

            {error && <div className="mb-4 text-destructive text-sm text-center bg-red-50 py-2 rounded-lg">{error}</div>}
            {successMsg && !previewUrl && <div className="mb-4 text-green-700 text-sm text-center bg-green-50 py-2 rounded-lg">{successMsg}</div>}
            
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 text-center">Enter OTP</label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/\\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-ink focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
                  required 
                  maxLength={6}
                  placeholder="••••••"
                />
              </div>
              <button disabled={isSubmitting || otp.length < 6} type="submit" className="w-full bg-primary text-on-primary rounded-xl h-[52px] font-bold text-[16px] hover:bg-primary-active transition-all shadow-md mt-6 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0">
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
            <p className="mt-8 text-center text-[15px] text-gray-500 font-medium">
              Didn't receive code? <button type="button" onClick={handleResendOTP} className="text-primary font-semibold hover:underline">Resend</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
