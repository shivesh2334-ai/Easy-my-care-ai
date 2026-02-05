
import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Landmark, ShieldCheck, CheckCircle2, ChevronRight, Lock } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, amount, onSuccess }) => {
  const [step, setStep] = useState<'SELECT' | 'PROCESSING' | 'SUCCESS'>('SELECT');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePay = () => {
    setStep('PROCESSING');
    setTimeout(() => {
      setStep('SUCCESS');
      setTimeout(() => {
        onSuccess();
        setStep('SELECT');
      }, 2000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {step !== 'SUCCESS' && (
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-lg">Secure Checkout</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        )}

        <div className="p-6">
          {step === 'SELECT' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Payable</p>
                  <p className="text-2xl font-black text-slate-900">${amount}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShieldCheck className="text-blue-600 w-6 h-6" />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase ml-1">Payment Method</p>
                
                <button 
                  onClick={() => setSelectedMethod('CARD')}
                  className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${selectedMethod === 'CARD' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 rounded-xl text-slate-700">
                      <CreditCard size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800">Credit / Debit Card</p>
                      <p className="text-[10px] text-slate-500">Visa, Mastercard, Amex</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>

                <button 
                  onClick={() => setSelectedMethod('UPI')}
                  className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${selectedMethod === 'UPI' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 rounded-xl text-slate-700">
                      <Smartphone size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800">UPI / Mobile Wallet</p>
                      <p className="text-[10px] text-slate-500">Google Pay, Apple Pay</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>

                <button 
                  onClick={() => setSelectedMethod('NET')}
                  className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${selectedMethod === 'NET' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 rounded-xl text-slate-700">
                      <Landmark size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-800">Net Banking</p>
                      <p className="text-[10px] text-slate-500">All major banks supported</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              </div>

              <button 
                disabled={!selectedMethod}
                onClick={handlePay}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-900/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Lock size={16} /> Pay ${amount}
              </button>

              <p className="text-[10px] text-center text-slate-400 font-medium">
                Your payment is secured with 256-bit encryption. <br/> Easy My Care never stores your sensitive data.
              </p>
            </div>
          )}

          {step === 'PROCESSING' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-slate-100 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                <ShieldCheck className="absolute inset-0 m-auto text-blue-600" size={32} />
              </div>
              <div className="text-center">
                <h4 className="font-extrabold text-slate-800 text-lg">Authenticating...</h4>
                <p className="text-sm text-slate-500">Please do not refresh or close the window.</p>
              </div>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="text-green-600" size={56} />
              </div>
              <div className="text-center">
                <h4 className="font-black text-slate-800 text-2xl">Payment Success!</h4>
                <p className="text-sm text-slate-500 mt-2 font-medium">Receipt has been sent to your registered email.</p>
              </div>
              <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 w-full max-w-xs text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Transaction ID</p>
                <p className="text-xs font-mono font-bold text-slate-800">#TXN992837465</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
