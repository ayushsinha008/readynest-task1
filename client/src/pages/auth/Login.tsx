import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';
import LogoIcon from '../../components/icons/LogoIcon';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      setError('');
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
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
        <h2 className="text-[32px] font-display font-bold text-center mb-8 tracking-tight text-ink">Welcome back.</h2>
        {error && <div className="mb-6 text-destructive text-sm text-center bg-red-50 py-2 rounded-lg">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-5">
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
            {isSubmitting ? 'Loading...' : 'Continue'}
          </button>
        </form>
        <p className="mt-8 text-center text-[15px] text-gray-500 font-medium">
          Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
