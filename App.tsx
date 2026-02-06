
import React, { useState, useCallback } from 'react';
import { 
  Bell, User, Search, Mic, Activity, FileText, Brain, 
  Stethoscope, MapPin, Star, Upload, ShieldCheck, 
  HeartPulse, Zap, Home, Menu, Phone, PhoneCall, Sparkles, PlusCircle, CreditCard, Calendar, Pill,
  UserPlus, TrendingUp, Eye, Receipt, X, ChevronRight, Video, PhoneIncoming, MessageCircle
} from 'lucide-react';
import { UserRole, AnalysisResult, PrescriptionData, Specialist } from './types';
import { analyzeMedicalImage, searchMedicalQueries, auditMedicalBill, analyzeDermatologyImage, analyzeRetinaImage } from './services/geminiService';
import AIModal from './components/AIModal';
import PrescriptionForm from './components/PrescriptionForm';
import PaymentModal from './components/PaymentModal';
import Scheduler from './components/Scheduler';
import DrugInfo from './components/DrugInfo';
import GrowthHub from './components/GrowthHub';
import DoctorBilling from './components/DoctorBilling';
import DiagnosticsHub from './components/DiagnosticsHub';
import TeleConsultation from './components/TeleConsultation';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.DOCTOR);
  const [currentView, setCurrentView] = useState<'HOME' | 'PRESCRIPTION' | 'SCHEDULE' | 'DRUG_INFO' | 'GROWTH' | 'BILLING' | 'DIAGNOSTICS' | 'TELE_CONSULT'>('HOME');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiResult, setAiResult] = useState<AnalysisResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [alerts, setAlerts] = useState<Array<{id: string, title: string, desc: string, role: UserRole}>>([]);
  
  // Payment States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingBillAmount, setPendingBillAmount] = useState<string>('0.00');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileMimeType = file.type || 'image/jpeg';
    setIsAiLoading(true);
    setIsAIModalOpen(true);
    setIsMenuOpen(false); // Close menu if open
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        let result: AnalysisResult;
        
        if (type === 'BILL') {
          result = await auditMedicalBill(base64Data);
          setPendingBillAmount((Math.random() * 500 + 50).toFixed(2));
        } else if (type === 'DERMA') {
          result = await analyzeDermatologyImage(base64Data);
        } else if (type === 'RETINA') {
          result = await analyzeRetinaImage(base64Data);
        } else {
          result = await analyzeMedicalImage(base64Data, type, fileMimeType);
        }
        
        setAiResult(result);
        setIsAiLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setAiResult({ title: "Error", content: "Failed to read file.", type: 'error' });
      setIsAiLoading(false);
    }
  };

  const handleTeleBooking = (specialist: Specialist, time: string) => {
    // Add Alert for Doctor
    const doctorAlert = {
      id: Math.random().toString(),
      title: 'New Tele-Consult Request',
      desc: `Patient requesting virtual visit at ${time} today.`,
      role: UserRole.DOCTOR
    };
    
    // Add Alert for Patient
    const patientAlert = {
      id: Math.random().toString(),
      title: 'Appointment Confirmed',
      desc: `Your video link with ${specialist.name} is ready for ${time}.`,
      role: UserRole.PATIENT
    };

    setAlerts(prev => [...prev, doctorAlert, patientAlert]);
    setCurrentView('HOME');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsAiLoading(true);
    setIsAIModalOpen(true);
    const result = await searchMedicalQueries(searchQuery);
    setAiResult(result);
    setIsAiLoading(false);
  };

  const savePrescription = (data: PrescriptionData) => {
    console.log("Prescription Saved:", data);
    alert(`Prescription for ${data.patientName} saved to EHR!`);
    setCurrentView('HOME');
  };

  // Drawer Menu Component
  const MenuDropdown = () => (
    <div className={`fixed inset-0 z-[110] transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}>
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={() => setIsMenuOpen(false)}
      ></div>
      <div className={`absolute bottom-0 w-full max-w-md left-1/2 -translate-x-1/2 bg-white rounded-t-[3rem] shadow-2xl p-8 transform transition-transform duration-500 ease-out ${isMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-800">AI Diagnostics</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Quick Access Tools</p>
          </div>
          <button onClick={() => setIsMenuOpen(false)} className="p-3 bg-slate-100 rounded-full text-slate-400">
            <X size={20}/>
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Retina", icon: <Eye />, type: "RETINA", color: "bg-teal-50 text-teal-600" },
            { label: "Derma", icon: <UserPlus />, type: "DERMA", color: "bg-orange-50 text-orange-600" },
            { label: "ECG", icon: <HeartPulse />, type: "ECG", color: "bg-red-50 text-red-600" },
            { label: "X-Ray", icon: <Zap />, type: "X-Ray", color: "bg-blue-50 text-blue-600" },
            { label: "Lab", icon: <FileText />, type: "Lab", color: "bg-green-50 text-green-600" },
            { label: "MRI", icon: <Brain />, type: "MRI", color: "bg-purple-50 text-purple-600" }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 group relative">
              <input 
                type="file" 
                accept="image/*,application/pdf"
                onChange={(e) => handleFileUpload(e, item.type)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              />
              <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center transition-transform group-active:scale-90 border border-transparent group-hover:border-current/20`}>
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 24 })}
              </div>
              <span className="text-[10px] font-bold text-slate-700">{item.label}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={() => { setCurrentView('DIAGNOSTICS'); setIsMenuOpen(false); }}
          className="w-full mt-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 active:scale-95 transition-transform"
        >
          View Full Suite Dashboard <ChevronRight size={16}/>
        </button>
      </div>
    </div>
  );

  if (role === UserRole.DOCTOR) {
    if (currentView === 'PRESCRIPTION') return <div className="min-h-screen bg-slate-100 flex justify-center items-start md:pt-4 md:pb-20 font-sans"><div className="w-full max-w-md bg-white shadow-2xl md:rounded-[2.5rem] overflow-hidden border border-gray-200 min-h-screen md:min-h-[850px] flex flex-col relative"><PrescriptionForm onBack={() => setCurrentView('HOME')} onSave={savePrescription} /></div></div>;
    if (currentView === 'SCHEDULE') return <div className="min-h-screen bg-slate-100 flex justify-center items-start md:pt-4 md:pb-20 font-sans"><div className="w-full max-w-md bg-white shadow-2xl md:rounded-[2.5rem] overflow-hidden border border-gray-200 min-h-screen md:min-h-[850px] flex flex-col relative"><Scheduler onBack={() => setCurrentView('HOME')} onStartSession={() => setCurrentView('PRESCRIPTION')} /></div></div>;
    if (currentView === 'DRUG_INFO') return <div className="min-h-screen bg-slate-100 flex justify-center items-start md:pt-4 md:pb-20 font-sans"><div className="w-full max-w-md bg-white shadow-2xl md:rounded-[2.5rem] overflow-hidden border border-gray-200 min-h-screen md:min-h-[850px] flex flex-col relative"><DrugInfo onBack={() => setCurrentView('HOME')} /></div></div>;
    if (currentView === 'GROWTH') return <div className="min-h-screen bg-slate-100 flex justify-center items-start md:pt-4 md:pb-20 font-sans"><div className="w-full max-w-md bg-white shadow-2xl md:rounded-[2.5rem] overflow-hidden border border-gray-200 min-h-screen md:min-h-[850px] flex flex-col relative"><GrowthHub onBack={() => setCurrentView('HOME')} /></div></div>;
    if (currentView === 'BILLING') return <div className="min-h-screen bg-slate-100 flex justify-center items-start md:pt-4 md:pb-20 font-sans"><div className="w-full max-w-md bg-white shadow-2xl md:rounded-[2.5rem] overflow-hidden border border-gray-200 min-h-screen md:min-h-[850px] flex flex-col relative"><DoctorBilling onBack={() => setCurrentView('HOME')} /></div></div>;
    if (currentView === 'DIAGNOSTICS') return <div className="min-h-screen bg-slate-100 flex justify-center items-start md:pt-4 md:pb-20 font-sans"><div className="w-full max-w-md bg-white shadow-2xl md:rounded-[2.5rem] overflow-hidden border border-gray-200 min-h-screen md:min-h-[850px] flex flex-col relative"><DiagnosticsHub onBack={() => setCurrentView('HOME')} onUpload={handleFileUpload} /></div></div>;
  }

  if (role === UserRole.PATIENT) {
    if (currentView === 'TELE_CONSULT') return <div className="min-h-screen bg-slate-100 flex justify-center items-start md:pt-4 md:pb-20 font-sans"><div className="w-full max-w-md bg-white shadow-2xl md:rounded-[2.5rem] overflow-hidden border border-gray-200 min-h-screen md:min-h-[850px] flex flex-col relative"><TeleConsultation onBack={() => setCurrentView('HOME')} onBook={handleTeleBooking} /></div></div>;
  }

  const roleAlerts = alerts.filter(a => a.role === role);

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-start md:pt-4 md:pb-20 font-sans">
      <div className="w-full max-w-md bg-white shadow-2xl md:rounded-[2.5rem] overflow-hidden border border-gray-200 min-h-screen md:min-h-[850px] flex flex-col relative">
        
        {/* Header */}
        <header className="bg-white p-4 flex justify-between items-center sticky top-0 z-40 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
              <Activity className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-lg text-slate-800 tracking-tight font-sans">Easy My Care <span className="text-blue-600 font-sans">AI</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setRole(role === UserRole.DOCTOR ? UserRole.PATIENT : UserRole.DOCTOR); setCurrentView('HOME'); }} className="bg-slate-100 px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-700 border border-slate-200 hover:bg-slate-200 transition-all font-sans">{role === UserRole.DOCTOR ? '👨‍⚕️ Clinician' : '🏥 Patient'}</button>
            <div className="relative">
              <Bell className={`w-5 h-5 ${roleAlerts.length > 0 ? 'text-blue-600' : 'text-slate-500'}`} />
              {roleAlerts.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-ping"></span>}
            </div>
            <div className="w-9 h-9 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm"><img src={`https://picsum.photos/seed/${role}/100/100`} alt="Profile" className="w-full h-full object-cover" /></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-32 scrollbar-hide">
          {/* Global Role Alerts */}
          {roleAlerts.length > 0 && (
            <div className="px-5 mt-4 space-y-2">
              {roleAlerts.map(alert => (
                <div key={alert.id} className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg animate-in slide-in-from-top duration-300 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl">
                      {role === UserRole.DOCTOR ? <PhoneIncoming size={18} /> : <Video size={18} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Important Alert</p>
                      <p className="text-xs font-bold leading-tight">{alert.title}</p>
                    </div>
                  </div>
                  <button onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))} className="p-1 hover:bg-white/10 rounded-lg"><X size={16}/></button>
                </div>
              ))}
            </div>
          )}

          {role === UserRole.DOCTOR ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="bg-slate-50/80 py-6 border-b border-slate-100">
                <div className="px-5 mb-4 flex justify-between items-end">
                  <div><h2 className="text-slate-800 font-extrabold text-2xl tracking-tight">Doctors Lounge</h2><p className="text-xs font-medium text-slate-500">Intelligent Clinical Workspace</p></div>
                  <button onClick={() => setCurrentView('DIAGNOSTICS')} className="text-blue-600 text-xs font-bold bg-blue-50 px-3 py-1 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors">AI Suite Hub</button>
                </div>
                <div className="flex overflow-x-auto px-5 gap-4 pb-4 scrollbar-hide">
                  <div className="min-w-[300px] bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-8 relative z-10"><div><h3 className="font-bold text-xl leading-tight text-white">AI Practice Hub</h3><p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">Enabled by MedGemma 3</p></div><div className="bg-white/10 p-3 rounded-2xl"><Mic className="w-5 h-5 text-blue-400" /></div></div>
                    <div className="grid grid-cols-2 gap-3 text-xs relative z-10">
                      <button onClick={() => setCurrentView('PRESCRIPTION')} className="bg-blue-600 p-3 rounded-2xl flex items-center gap-2 border border-blue-400/30 hover:bg-blue-500 transition-colors"><PlusCircle size={14}/> New Rx</button>
                      <button onClick={() => setCurrentView('SCHEDULE')} className="bg-white/10 p-3 rounded-2xl flex items-center gap-2 border border-white/5 hover:bg-white/20 transition-colors"><Calendar size={14}/> Schedule</button>
                      <button onClick={() => setCurrentView('DRUG_INFO')} className="bg-white/10 p-3 rounded-2xl flex items-center gap-2 border border-white/5 hover:bg-white/20 transition-colors"><Pill size={14} className="text-blue-400"/> Drug Info</button>
                      <button onClick={() => setCurrentView('GROWTH')} className="bg-amber-600 p-3 rounded-2xl flex items-center gap-2 border border-amber-400/30 hover:bg-amber-500 transition-colors"><TrendingUp size={14}/> Growth AI</button>
                      <button onClick={() => setCurrentView('BILLING')} className="col-span-2 bg-slate-800 p-3 rounded-2xl flex items-center justify-center gap-2 border border-slate-700 hover:bg-slate-700 transition-colors shadow-lg"><Receipt size={14} className="text-blue-400"/> Medical Billing Hub</button>
                    </div>
                  </div>
                  {[
                    { label: "Retina AI", desc: "Fundus Report Scan", icon: <Eye />, color: "text-teal-600", bg: "bg-teal-50", type: "RETINA", accept: "image/*" },
                    { label: "Dermatology AI", desc: "MedGemma Lesion Scan", icon: <UserPlus />, color: "text-orange-600", bg: "bg-orange-50", type: "DERMA", accept: "image/*" },
                    { label: "ECG AI", desc: "Complex Rhythm Analysis", icon: <HeartPulse />, color: "text-red-500", bg: "bg-red-50", type: "ECG", accept: "image/*" },
                    { label: "X-Ray AI", desc: "Pulmonary & Ortho", icon: <Zap />, color: "text-blue-500", bg: "bg-blue-50", type: "X-Ray", accept: "image/*" },
                    { label: "Lab AI", desc: "Biomarker Trends", icon: <FileText />, color: "text-green-500", bg: "bg-green-50", type: "Lab", accept: "image/*,application/pdf" },
                    { label: "MRI AI", desc: "Neural Pathway Scan", icon: <Brain />, color: "text-purple-500", bg: "bg-purple-50", type: "MRI", accept: "image/*" }
                  ].map((mod, i) => (
                    <div key={i} className="min-w-[140px] h-[180px] bg-white border border-slate-100 rounded-3xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all cursor-pointer">
                      <input type="file" accept={mod.accept} onChange={(e) => handleFileUpload(e, mod.type)} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                      <div className={`${mod.bg} w-12 h-12 rounded-2xl flex items-center justify-center ${mod.color}`}>{React.cloneElement(mod.icon as React.ReactElement<any>, { size: 24 })}</div>
                      <div><h4 className="font-bold text-slate-800 text-sm tracking-tight">{mod.label}</h4><p className="text-[10px] text-slate-500 leading-tight mt-1">{mod.desc}</p></div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="px-5 py-6">
                 <h2 className="text-slate-800 font-bold text-lg mb-4 flex items-center gap-2"><User className="w-5 h-5 text-blue-600" /> Recent Patients</h2>
                 <div className="space-y-3">{[{ name: "John Doe", diag: "HTN & Dyslipidemia", time: "09:45 AM" }, { name: "Sarah Smith", diag: "Type 2 DM Follow-up", time: "10:15 AM" }].map((pat, idx) => (<div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-100 transition-colors"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200"><img src={`https://picsum.photos/seed/pat${idx}/100/100`} className="w-full h-full object-cover" alt="Patient"/></div><div><p className="font-bold text-sm text-slate-800">{pat.name}</p><p className="text-[10px] text-slate-500 font-medium">{pat.diag}</p></div></div><span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{pat.time}</span></div>))}</div>
              </section>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="py-6">
                <div className="px-5">
                  <h2 className="text-slate-800 font-extrabold text-2xl mb-5 tracking-tight">Patient Zone</h2>
                  <form onSubmit={handleSearch} className="relative mb-6 group">
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Ask AI about symptoms..." className="w-full pl-12 pr-12 py-4 rounded-[1.25rem] bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm text-sm" />
                    <Search className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 w-5 h-5" />
                    <button type="submit" className="absolute right-3 top-2.5 p-1.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"><Sparkles size={18} /></button>
                  </form>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <button onClick={() => setCurrentView('TELE_CONSULT')} className="bg-blue-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 text-left relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
                        <Video size={48} />
                      </div>
                      <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                        <PhoneCall size={20} />
                      </div>
                      <h3 className="font-bold text-sm leading-tight">Virtual Consultation</h3>
                      <p className="text-[10px] text-blue-100 font-medium mt-1">Video chat with specialists</p>
                    </button>
                    
                    <button className="bg-white p-6 rounded-[2.5rem] border border-slate-100 text-left shadow-sm group">
                      <div className="bg-slate-50 w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-50 transition-colors">
                        <MapPin size={20} className="text-slate-400 group-hover:text-blue-600" />
                      </div>
                      <h3 className="font-bold text-sm text-slate-800 leading-tight">Nearby Clinics</h3>
                      <p className="text-[10px] text-slate-500 font-medium mt-1">Find healthcare hubs</p>
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-8">{[{ icon: <User className="text-blue-600"/>, label: "Doctors" }, { icon: <Home className="text-teal-600"/>, label: "Clinics" }, { icon: <FileText className="text-indigo-600"/>, label: "Hospital" }, { icon: <Activity className="text-pink-600"/>, label: "Day Care" }].map((item, i) => (<div key={i} className="flex flex-col items-center gap-2 cursor-pointer group"><div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-md group-hover:-translate-y-1 transition-all">{item.icon}</div><span className="text-[10px] font-bold text-slate-700 text-center leading-tight">{item.label}</span></div>))}</div>
                </div>
              </section>
              <section className="px-5 py-8 bg-emerald-50/40 border-y border-emerald-100 overflow-hidden relative"><div className="flex justify-between items-center mb-5 relative z-10"><div><h2 className="text-emerald-900 font-extrabold text-xl tracking-tight">Bill Audit & Fairness</h2><p className="text-xs font-medium text-emerald-700">Verify hospital charges with clinical AI</p></div><div className="p-2 bg-emerald-100 rounded-full"><ShieldCheck className="text-emerald-600 w-6 h-6" /></div></div><div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xl relative z-10"><input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'BILL')} className="absolute inset-0 opacity-0 cursor-pointer z-20" /><button className="w-full border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-2xl py-5 flex flex-col items-center gap-2 text-emerald-700 font-bold transition-all hover:bg-emerald-50"><Upload size={24} /><span className="text-sm">Audit Bill Photo / PDF</span></button></div></section>
            </div>
          )}
        </main>

        <nav className="absolute bottom-0 w-full bg-white/80 backdrop-blur-md border-t border-slate-100 py-4 px-8 flex justify-between items-center z-40">
          <div onClick={() => setCurrentView('HOME')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${currentView === 'HOME' ? 'text-blue-600' : 'text-slate-400'}`}><Home size={26}/><span className="text-[9px] font-bold uppercase tracking-widest">Home</span></div>
          <div onClick={() => role === UserRole.DOCTOR && setCurrentView('SCHEDULE')} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${currentView === 'SCHEDULE' ? 'text-blue-600' : 'text-slate-400'}`}><Calendar size={26}/><span className="text-[9px] font-bold uppercase tracking-widest">Schedule</span></div>
          <div className="relative -mt-10 group"><div className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div><button onClick={() => role === UserRole.DOCTOR && setCurrentView('PRESCRIPTION')} className="relative bg-blue-600 p-4 rounded-3xl shadow-xl text-white transition-all hover:scale-110 active:scale-95 shadow-blue-400/40"><Brain size={28} /></button></div>
          <div className="flex flex-col items-center gap-1 text-slate-400 cursor-pointer hover:text-slate-600"><User size={26}/><span className="text-[9px] font-bold uppercase tracking-widest">Profile</span></div>
          <div onClick={() => setIsMenuOpen(true)} className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${isMenuOpen ? 'text-blue-600' : 'text-slate-400'}`}><Menu size={26}/><span className="text-[9px] font-bold uppercase tracking-widest">Menu</span></div>
        </nav>

        <MenuDropdown />
        <AIModal isOpen={isAIModalOpen} result={aiResult} isLoading={isAiLoading} onClose={() => { setIsAIModalOpen(false); setAiResult(null); }} />
        <PaymentModal isOpen={isPaymentModalOpen} amount={pendingBillAmount} onClose={() => setIsPaymentModalOpen(false)} onSuccess={() => setIsPaymentModalOpen(false)} />
      </div>
    </div>
  );
};

export default App;
