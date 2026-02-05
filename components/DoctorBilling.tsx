
import React, { useState } from 'react';
import { 
  ArrowLeft, CreditCard, Plus, Trash2, Sparkles, 
  ChevronRight, Save, FileText, Send, CheckCircle2,
  Receipt, Wallet, Calculator
} from 'lucide-react';
import { optimizeBilling } from '../services/geminiService';
import { AnalysisResult, LineItem, Invoice } from '../types';

interface DoctorBillingProps {
  onBack: () => void;
}

const DoctorBilling: React.FC<DoctorBillingProps> = ({ onBack }) => {
  const [patientName, setPatientName] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { description: 'Consultation Fee', quantity: 1, unitPrice: 100 }
  ]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    const result = await optimizeBilling(items);
    setAiAnalysis(result);
    setIsOptimizing(false);
  };

  const handleSaveInvoice = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="font-bold text-slate-800">Clinic Billing Hub</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSaveInvoice}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            <Save size={16} /> Save Invoice
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Intro Hero */}
        <div className="p-5 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white rounded-b-[2.5rem] shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <Receipt className="text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Billing & Invoices</h1>
                <p className="text-xs text-blue-200">Generate professional medical bills</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Revenue Today</p>
              <p className="text-xl font-black">$1,245.00</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="text-blue-300" />
              <div className="text-sm font-bold">Unpaid Invoices: <span className="text-amber-400">08</span></div>
            </div>
            <ChevronRight size={18} className="text-white/40" />
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* New Invoice Form */}
          <section className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-blue-600" size={16} /> New Patient Invoice
              </h3>
              <span className="text-[10px] font-bold text-slate-400">INV-2024-0012</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Patient Name</label>
                <input 
                  type="text" 
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter patient name..."
                  className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Service Items</label>
                  <button 
                    onClick={addItem}
                    className="text-blue-600 text-[10px] font-bold hover:underline"
                  >
                    + Add Row
                  </button>
                </div>
                
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center animate-in slide-in-from-left duration-200">
                    <input 
                      type="text"
                      placeholder="Service description"
                      className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-medium"
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    />
                    <input 
                      type="number"
                      placeholder="Qty"
                      className="w-16 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-center"
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                    />
                    <input 
                      type="number"
                      placeholder="Price"
                      className="w-20 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-right"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                    <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500 p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Subtotal Amount</p>
                  <p className="text-2xl font-black text-slate-900">${calculateTotal().toFixed(2)}</p>
                </div>
                <button 
                  onClick={handleOptimize}
                  disabled={isOptimizing || items.length === 0}
                  className="bg-blue-50 text-blue-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-100 transition-all border border-blue-100"
                >
                  {isOptimizing ? <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={14} />}
                  AI Coding Check
                </button>
              </div>
            </div>
          </section>

          {/* AI Analysis Area */}
          {aiAnalysis && (
            <div className="animate-in fade-in zoom-in duration-500">
              <div className="bg-indigo-900 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Sparkles size={100} />
                </div>
                <h3 className="font-bold mb-4 flex items-center gap-2 text-indigo-200">
                  <Calculator size={18} />
                  AI Billing Intelligence
                </h3>
                <div className="text-sm text-indigo-100 leading-relaxed whitespace-pre-wrap opacity-90">
                  {aiAnalysis.content}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
             <button className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 hover:border-blue-200 transition-colors">
               <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                 <Send size={20} />
               </div>
               <span className="text-[10px] font-bold text-slate-700">Send to Patient</span>
             </button>
             <button className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 hover:border-blue-200 transition-colors">
               <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
                 <CreditCard size={20} />
               </div>
               <span className="text-[10px] font-bold text-slate-700">Payment Link</span>
             </button>
          </div>

          {/* History */}
          <div className="space-y-3">
             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Recent Invoices</h4>
             {[
               { name: "John Doe", date: "Today, 10:20 AM", amount: "$150.00", status: "Paid" },
               { name: "Sarah Smith", date: "Yesterday", amount: "$420.00", status: "Unpaid" }
             ].map((inv, idx) => (
               <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{inv.name}</p>
                      <p className="text-[10px] text-slate-500">{inv.date}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{inv.amount}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${inv.status === 'Paid' ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>
                      {inv.status}
                    </span>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {isSaved && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-in fade-in zoom-in duration-300 z-50">
          <CheckCircle2 className="text-green-400" />
          <span className="text-sm font-bold">Invoice Saved Successfully</span>
        </div>
      )}
    </div>
  );
};

export default DoctorBilling;
