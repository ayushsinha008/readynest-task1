import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function Cancel() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 h-full">
      <div className="bg-white rounded-[32px] p-10 shadow-xl max-w-md w-full text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-red-500 stroke-[2.5]" />
        </div>
        
        <h1 className="text-[28px] font-bold text-ink mb-4">Checkout Canceled</h1>
        <p className="text-[15px] font-medium text-gray-500 mb-8 leading-relaxed">
          Your payment was canceled and you have not been charged. You can upgrade to Pro at any time from the Pricing page.
        </p>

        <Link 
          to="/pricing"
          className="w-full py-4 rounded-2xl font-bold text-[15px] bg-gray-100 text-ink hover:bg-gray-200 active:scale-[0.98] transition-all mb-4"
        >
          Try Again
        </Link>
        <Link 
          to="/dashboard"
          className="text-[14px] font-bold text-gray-400 hover:text-ink transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
