import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const { data } = await api.post('/auth/register', { name, email, password });
      login(data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="w-full max-w-md p-8 bg-canvas">
        {/* Asterisk to mimic Anthropic spike mark */}
        <div className="flex justify-center mb-6">
          <span className="text-4xl leading-none font-bold text-ink">*</span>
        </div>
        <h2 className="text-4xl font-display font-normal text-center mb-8 tracking-tight text-ink">Create an Account</h2>
        {error && <div className="mb-6 text-destructive text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 text-body-strong">Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-hairline bg-canvas rounded-md px-[14px] py-[10px] text-body focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-body-strong">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-hairline bg-canvas rounded-md px-[14px] py-[10px] text-body focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-body-strong">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-hairline bg-canvas rounded-md px-[14px] py-[10px] text-body focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-primary text-on-primary rounded-md h-[40px] font-medium hover:bg-primary-active transition-colors mt-2">
            Register
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-muted">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
