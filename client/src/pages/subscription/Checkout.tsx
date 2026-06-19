import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Loader2, CreditCard } from 'lucide-react';
import api from '../../lib/api';

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'pro'; // default to pro
  
  const isPremium = plan === 'premium';
  const price = isPremium ? 999 : 499;
  const planName = isPremium ? 'Premium Plan' : 'Pro Plan';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayUCheckout = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch hash and details from backend
      const { data } = await api.post('/subscription/create-payu-hash', { plan });
      
      if (!data || !data.hash) {
        throw new Error('Failed to initiate payment');
      }

      // Create a form dynamically and submit it to PayU
      const form = document.createElement('form');
      form.method = 'POST';
      // Use test endpoint for now. For production use: https://secure.payu.in/_payment
      form.action = 'https://test.payu.in/_payment';

      // Map parameters
      const params: Record<string, string> = {
        key: data.key,
        txnid: data.txnid,
        amount: data.amount,
        productinfo: data.productinfo,
        firstname: data.firstname,
        email: data.email,
        phone: data.phone,
        surl: data.surl,
        furl: data.furl,
        hash: data.hash,
        udf1: data.udf1,
        udf2: data.udf2
      };

      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          const hiddenField = document.createElement('input');
          hiddenField.type = 'hidden';
          hiddenField.name = key;
          hiddenField.value = params[key];
          form.appendChild(hiddenField);
        }
      }

      document.body.appendChild(form);
      form.submit();

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Payment initiation failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-10 flex items-center justify-center h-full w-full max-w-[1280px] mx-auto overflow-y-auto scrollbar-hide bg-[#F7F8F5]">
      
      <div className="max-w-2xl w-full bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        
        {/* Order Summary Header */}
        <div className="bg-gray-50 p-8 md:p-10 border-b border-gray-100 text-center">
          <h2 className="text-[24px] font-bold text-ink mb-2">Upgrade to {planName}</h2>
          <p className="text-[15px] text-gray-500 font-medium mb-6">You will be securely redirected to PayU to complete your payment.</p>
          
          <div className="inline-flex items-center justify-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-left">
              <p className="text-[14px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Due</p>
              <p className="text-[32px] font-bold text-ink leading-none">₹{price}.00</p>
            </div>
          </div>
        </div>

        {/* Payment Action */}
        <div className="p-8 md:p-10 flex flex-col items-center">
          {error && (
            <div className="w-full bg-red-50 text-red-500 p-4 rounded-xl mb-6 font-bold text-[13px] text-center">
              {error}
            </div>
          )}

          <button 
            onClick={handlePayUCheckout}
            disabled={isLoading}
            className="w-full max-w-sm h-14 rounded-2xl font-bold text-[16px] bg-[#1a3c2a] text-white hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay securely with PayU
              </>
            )}
          </button>
          
          <div className="mt-8 flex items-center gap-2 text-gray-400 font-medium text-[13px]">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            <p>100% Secure Checkout powered by PayU.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
