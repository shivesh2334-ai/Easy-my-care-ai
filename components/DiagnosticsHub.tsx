
import React from 'react';
import { 
  ArrowLeft, Eye, UserPlus, HeartPulse, Zap, 
  FileText, Brain, Upload, Sparkles, ShieldCheck 
} from 'lucide-react';

interface DiagnosticsHubProps {
  onBack: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, type: string) => void;
}

const DiagnosticsHub: React.FC<DiagnosticsHubProps> = ({ onBack, onUpload }) => {
  const modules = [
    { label: "Retina AI", desc: "Fundus Report Scan", icon: <Eye />, color: "text-teal-600", bg: "bg-teal-50", type: "RETINA", accept: "image/*" },
    { label: "Dermatology AI", desc: "MedGemma Lesion Scan", icon: <UserPlus />, color: "text-orange-600", bg: "bg-orange-50", type: "DERMA", accept: "image/*" },
    { label: "ECG AI", desc: "Complex Rhythm Analysis", icon: <HeartPulse />, color: "text-red-500", bg: "bg-red-50", type: "ECG", accept: "image/*" },
    { label: "X-Ray AI", desc: "Pulmonary & Ortho", icon: <Zap />, color: "text-blue-500", bg: "bg-blue-50", type: "X-Ray", accept: "image/*" },
    { label: "Lab AI", desc: "Biomarker Trends", icon: <FileText />, color: "text-green-500", bg: "bg-green-50", type: "Lab", accept: "image/*,application/pdf" },
    { label: "MRI AI", desc: "Neural Pathway Scan", icon: <Brain />, color: "text-purple-500", bg: "bg-purple-50", type: "MRI", accept: "image/*" }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
      <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h2 className="font-bold text-slate-800">AI Diagnostic Suite</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-32">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-6 text-white mb-8 shadow-xl shadow-blue-200 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2">Multi-Modal Diagnostics</h3>
            <p className="text-xs text-blue-100 opacity-80 leading-relaxed">
              Upload clinical imagery or reports for instant AI-driven pathological assessment and differential suggestions.
            </p>
          </div>
          <Sparkles className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {modules.map((mod, i) => (
            <div 
              key={i} 
              className="bg-white border border-slate-100 rounded-3xl p-5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all group relative cursor-pointer active:scale-95"
            >
              <input 
                type="file" 
                accept={mod.accept}
                onChange={(e) => onUpload(e, mod.type)}
                className="absolute inset-0 opacity-0 cursor-pointer z-20" 
              />
              <div className={`${mod.bg} w-16 h-16 rounded-2xl flex items-center justify-center ${mod.color} mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                {/* FIX: Cast icon to React.ReactElement<any> to prevent TS error when cloning and adding 'size' prop */}
                {React.cloneElement(mod.icon as React.ReactElement<any>, { size: 32 })}
              </div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">{mod.label}</h4>
              <p className="text-[10px] text-slate-400 font-medium leading-tight">{mod.desc}</p>
              
              <div className="mt-4 w-full pt-3 border-t border-slate-50 flex items-center justify-center gap-1 text-[9px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload size={10} /> TAP TO UPLOAD
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-5 bg-white border border-slate-100 rounded-3xl shadow-sm">
           <div className="flex items-center gap-3 mb-3">
             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
               <ShieldCheck size={20} />
             </div>
             <h4 className="font-bold text-slate-800 text-sm">Security & Privacy</h4>
           </div>
           <p className="text-[10px] text-slate-500 leading-relaxed">
             All uploads are encrypted and processed via HIPPA-compliant AI protocols. Images are not used for public training and are purged after analysis.
           </p>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsHub;
