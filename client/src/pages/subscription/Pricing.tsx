import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Check } from 'lucide-react';

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleSubscribe = (plan: 'pro' | 'premium') => {
    navigate(`/checkout?plan=${plan}`);
  };

  const isFree = user?.plan === 'free' || !user?.plan;
  const isPro = user?.plan === 'pro';
  const isPremium = user?.plan === 'premium';

  return (
    <div className="flex-1 p-6 md:p-10 flex flex-col items-center h-full w-full max-w-[1280px] mx-auto overflow-y-auto scrollbar-hide">
      
      <div className="text-center max-w-2xl mb-12 mt-8 md:mt-0">
        <h1 className="text-[32px] md:text-[42px] font-bold text-[#1a3c2a] leading-tight mb-4">
          Choose Your Plan
        </h1>
        <p className="text-gray-500 text-[15px] md:text-[17px] font-medium">
          Whether you're just getting started or scaling up, we have a plan for you.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 w-full max-w-6xl pb-10">
        
        {/* Free Plan */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm flex flex-col border border-gray-100">
          <div className="mb-8">
            <h3 className="text-[24px] font-bold text-[#1a3c2a] mb-2">Free</h3>
            <p className="text-[14px] text-gray-500 font-medium">Perfect to get started.</p>
          </div>
          
          <div className="mb-8 flex items-end gap-1">
            <span className="text-[48px] font-bold text-[#1a3c2a] leading-none">₹0</span>
            <span className="text-gray-400 font-bold mb-2">/mo</span>
          </div>

          <div className="flex-1 flex flex-col gap-4 mb-8">
            {[
              'Up to 3 forms',
              '100 responses per form',
              'Basic analytics',
              'Standard templates'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#52b788]/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-[#52b788] stroke-[3]" />
                </div>
                <span className="text-[15px] font-bold text-[#1a3c2a]">{feature}</span>
              </div>
            ))}
          </div>

          {!user ? (
            <button 
              onClick={() => navigate('/register')}
              className="w-full py-4 rounded-2xl font-bold text-[15px] bg-gray-100 text-[#1a3c2a] hover:bg-gray-200 transition-all"
            >
              Get Started
            </button>
          ) : isFree ? (
            <button 
              disabled
              className="w-full py-4 rounded-2xl font-bold text-[15px] bg-gray-100 text-gray-400 cursor-not-allowed"
            >
              Current Plan
            </button>
          ) : (
            <button 
              disabled
              className="w-full py-4 rounded-2xl font-bold text-[15px] bg-gray-100 text-gray-400 cursor-not-allowed"
            >
              Included in your plan
            </button>
          )}
        </div>

        {/* Pro Plan */}
        <div className="bg-[#1a3c2a] rounded-[32px] p-8 shadow-2xl flex flex-col relative transform lg:-translate-y-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#52b788] text-[#1a3c2a] text-[12px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
            Most Popular
          </div>

          <div className="mb-8">
            <h3 className="text-[24px] font-bold text-white mb-2">Pro</h3>
            <p className="text-[14px] text-white/80 font-medium">For power users & teams.</p>
          </div>
          
          <div className="mb-8 flex items-end gap-1">
            <span className="text-[48px] font-bold text-white leading-none">₹499</span>
            <span className="text-white/60 font-bold mb-2">/mo</span>
          </div>

          <div className="flex-1 flex flex-col gap-4 mb-8">
            {[
              'Unlimited forms',
              'Unlimited responses',
              'Advanced analytics & exports',
              'Custom branding',
              'Priority support'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#52b788] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-[#1a3c2a] stroke-[3]" />
                </div>
                <span className="text-[15px] font-bold text-white">{feature}</span>
              </div>
            ))}
          </div>

          {isPro ? (
            <button 
              disabled
              className="w-full py-4 rounded-2xl font-bold text-[15px] bg-white/10 text-white cursor-not-allowed border border-white/20"
            >
              You are currently on Pro
            </button>
          ) : isPremium ? (
            <button 
              disabled
              className="w-full py-4 rounded-2xl font-bold text-[15px] bg-white/10 text-white cursor-not-allowed border border-white/20"
            >
              Included in Premium
            </button>
          ) : (
            <button 
              onClick={() => handleSubscribe('pro')}
              className="w-full py-4 rounded-2xl font-bold text-[15px] bg-[#52b788] text-[#1a3c2a] hover:bg-[#74c69d] active:scale-[0.98] transition-all flex items-center justify-center shadow-lg"
            >
              Subscribe to Pro
            </button>
          )}
        </div>

        {/* Premium Plan */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm flex flex-col border border-[#52b788]/30">
          <div className="mb-8">
            <h3 className="text-[24px] font-bold text-[#1a3c2a] mb-2">Premium</h3>
            <p className="text-[14px] text-gray-500 font-medium">For large scale organizations.</p>
          </div>
          
          <div className="mb-8 flex items-end gap-1">
            <span className="text-[48px] font-bold text-[#1a3c2a] leading-none">₹999</span>
            <span className="text-gray-400 font-bold mb-2">/mo</span>
          </div>

          <div className="flex-1 flex flex-col gap-4 mb-8">
            {[
              'Everything in Pro',
              'Custom domains',
              'API access',
              'Dedicated account manager',
              '24/7 Phone support'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#1a3c2a] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                </div>
                <span className="text-[15px] font-bold text-[#1a3c2a]">{feature}</span>
              </div>
            ))}
          </div>

          {isPremium ? (
            <button 
              disabled
              className="w-full py-4 rounded-2xl font-bold text-[15px] bg-gray-100 text-gray-400 cursor-not-allowed"
            >
              You are currently on Premium
            </button>
          ) : (
            <button 
              onClick={() => handleSubscribe('premium')}
              className="w-full py-4 rounded-2xl font-bold text-[15px] bg-[#1a3c2a] text-white hover:bg-gray-800 active:scale-[0.98] transition-all"
            >
              Upgrade to Premium
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
