
import React from 'react';
import { 
  ArrowLeft, Eye, UserPlus, HeartPulse, Zap, 
  FileText, Brain, Upload, Sparkles, ShieldCheck, Camera
} from 'lucide-react';

interface DiagnosticsHubProps {
  onBack: () => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, type: string) => void;
  onOpenCamera: (type: string) => void;
}

const DiagnosticsHub: React.FC<DiagnosticsHubProps> = ({ onBack, onUpload, onOpenCamera }) => {
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
              Upload clinical imagery or use your camera for instant AI-driven pathological assessment.
            </p>
          </div>
          <Sparkles className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {modules.map((mod, i) => (
            <div 
              key={i} 
              className="bg-white border border-slate-100 rounded-[2rem] p-5 flex items-center gap-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className={`${mod.bg} w-20 h-20 rounded-[1.5rem] flex items-center justify-center ${mod.color} shrink-0 group-hover:scale-105 transition-transform shadow-sm`}>
                {React.cloneElement(mod.icon as React.ReactElement<any>, { size: 40 })}
              </div>
              
              <div className="flex-1">
                <h4 className="font-black text-slate-800 text-lg mb-1">{mod.label}</h4>
                <p className="text-xs text-slate-500 font-medium leading-tight mb-4">{mod.desc}</p>
                
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="file" 
                      accept={mod.accept}
                      onChange={(e) => onUpload(e, mod.type)}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                    />
                    <button className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
                      <Upload size={14} /> Upload
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => onOpenCamera(mod.type)}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                  >
                    <Camera size={14} /> Camera
                  </button>
                </div>
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
             All uploads are encrypted and processed via HIPAA-compliant AI protocols. Images are not used for training and are purged after analysis.
           </p>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsHub;
