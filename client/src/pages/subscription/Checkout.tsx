import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Lock, Loader2, ShieldCheck } from 'lucide-react';
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

  // Form states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');

  const handleFormatCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    val = val.substring(0, 16);
    const groups = val.match(/.{1,4}/g);
    if (groups) {
      setCardNumber(groups.join(' '));
    } else {
      setCardNumber(val);
    }
  };

  const handleFormatExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    val = val.substring(0, 4);
    if (val.length >= 3) {
      setExpiry(`${val.substring(0, 2)}/${val.substring(2, 4)}`);
    } else {
      setExpiry(val);
    }
  };

  const handleFormatCvv = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    setCvv(val.substring(0, 4));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || !cardNumber || !expiry || !cvv || !address || !city || !zip) {
      setError('Please fill out all fields.');
      return;
    }
    if (cardNumber.replace(/\s/g, '').length < 15) {
      setError('Please enter a valid card number.');
      return;
    }
    if (expiry.length < 5) {
      setError('Please enter a valid expiration date.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { data } = await api.post('/subscription/create-checkout-session', { plan });
      
      if (data.url) {
        window.location.href = data.url; // Redirects to our success page
      } else {
        throw new Error('Failed to complete checkout');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-10 flex items-center justify-center h-full w-full max-w-[1280px] mx-auto overflow-y-auto scrollbar-hide bg-[#F7F8F5]">
      
      <div className="max-w-4xl w-full grid md:grid-cols-[1fr_400px] gap-8 bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Payment Form */}
        <div className="p-8 md:p-10">
          <div className="mb-8">
            <h1 className="text-[28px] font-bold text-ink flex items-center gap-3">
              <Lock className="w-6 h-6 text-green-600 stroke-[2.5]" />
              Secure Checkout
            </h1>
            <p className="text-[14px] text-gray-500 font-medium mt-2">
              Please enter your payment details below to complete your upgrade.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 font-bold text-[13px]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card Information */}
            <div>
              <h3 className="text-[15px] font-bold text-ink mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-400" />
                Card / UPI Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Name on Card</label>
                  <input 
                    type="text" 
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full h-12 bg-gray-50 rounded-xl px-4 text-[15px] outline-none border border-transparent focus:border-coral focus:bg-white transition-all font-medium placeholder:text-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Card Number</label>
                  <input 
                    type="text" 
                    value={cardNumber}
                    onChange={handleFormatCardNumber}
                    placeholder="0000 0000 0000 0000"
                    className="w-full h-12 bg-gray-50 rounded-xl px-4 text-[15px] outline-none border border-transparent focus:border-coral focus:bg-white transition-all font-medium tracking-wide placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Expiry (MM/YY)</label>
                    <input 
                      type="text" 
                      value={expiry}
                      onChange={handleFormatExpiry}
                      placeholder="MM/YY"
                      className="w-full h-12 bg-gray-50 rounded-xl px-4 text-[15px] outline-none border border-transparent focus:border-coral focus:bg-white transition-all font-medium placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">CVV</label>
                    <input 
                      type="password" 
                      value={cvv}
                      onChange={handleFormatCvv}
                      placeholder="123"
                      maxLength={4}
                      className="w-full h-12 bg-gray-50 rounded-xl px-4 text-[15px] outline-none border border-transparent focus:border-coral focus:bg-white transition-all font-medium placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100 my-6"></div>

            {/* Billing Address */}
            <div>
              <h3 className="text-[15px] font-bold text-ink mb-4">Billing Address</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Street Address</label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St"
                    className="w-full h-12 bg-gray-50 rounded-xl px-4 text-[15px] outline-none border border-transparent focus:border-coral focus:bg-white transition-all font-medium placeholder:text-gray-400"
                  />
                </div>
                <div className="grid grid-cols-[2fr_1fr] gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">City</label>
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New York"
                      className="w-full h-12 bg-gray-50 rounded-xl px-4 text-[15px] outline-none border border-transparent focus:border-coral focus:bg-white transition-all font-medium placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">ZIP Code</label>
                    <input 
                      type="text" 
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="10001"
                      className="w-full h-12 bg-gray-50 rounded-xl px-4 text-[15px] outline-none border border-transparent focus:border-coral focus:bg-white transition-all font-medium placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-14 mt-6 rounded-2xl font-bold text-[16px] bg-[#1a3c2a] text-white hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ₹${price}.00`}
            </button>
            <p className="text-center text-[12px] text-gray-400 font-medium mt-4 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Payments are secure and encrypted.
            </p>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-8 md:p-10 flex flex-col border-l border-gray-100">
          <h2 className="text-[20px] font-bold text-ink mb-6">Order Summary</h2>
          
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[15px] font-bold text-ink">{planName} Subscription</p>
              <p className="text-[13px] text-gray-500 font-medium mt-1">Billed monthly</p>
            </div>
            <p className="text-[15px] font-bold text-ink">₹{price}.00</p>
          </div>

          <div className="space-y-3 mb-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between text-[14px]">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="font-bold text-ink">₹{price}.00</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-gray-500 font-medium">Tax</span>
              <span className="font-bold text-ink">₹0.00</span>
            </div>
          </div>

          <div className="flex justify-between items-end pt-6 border-t border-gray-200 mt-auto">
            <div>
              <p className="text-[14px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total Due</p>
            </div>
            <p className="text-[32px] font-bold text-ink leading-none">₹{price}.00</p>
          </div>

        </div>
      </div>
    </div>
  );
}
