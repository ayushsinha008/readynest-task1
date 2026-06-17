import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export default function Success() {
  const { updateUser } = useAuthStore();

  useEffect(() => {
    // In our mock, the backend already updated the user. 
    // We update local state immediately so they see Pro features.
    updateUser({ plan: 'pro', subscriptionStatus: 'active' });
  }, [updateUser]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 h-full">
      <div className="bg-white rounded-[32px] p-10 shadow-xl max-w-md w-full text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-500 stroke-[2.5]" />
        </div>
        
        <h1 className="text-[28px] font-bold text-ink mb-4">Payment Successful!</h1>
        <p className="text-[15px] font-medium text-gray-500 mb-8 leading-relaxed">
          Thank you for subscribing to Pro. Your account has been upgraded and you now have access to all premium features.
        </p>

        <Link 
          to="/dashboard"
          className="w-full py-4 rounded-2xl font-bold text-[15px] bg-coral text-white hover:bg-coral/90 active:scale-[0.98] transition-all shadow-lg shadow-coral/30"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
