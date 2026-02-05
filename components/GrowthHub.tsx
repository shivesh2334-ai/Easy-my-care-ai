
import React, { useState } from 'react';
import { 
  ArrowLeft, TrendingUp, Megaphone, Palette, Users, 
  Sparkles, Send, Download, Share2, MessageSquare, 
  Video, BarChart3, ChevronRight 
} from 'lucide-react';
import { generateGrowthStrategy } from '../services/geminiService';
import { AnalysisResult } from '../types';

interface GrowthHubProps {
  onBack: () => void;
}

const GrowthHub: React.FC<GrowthHubProps> = ({ onBack }) => {
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'BRANDING' | 'MARKETING' | 'SALES'>('CONTENT');

  const handleGenerate = async () => {
    if (!context.trim()) return;
    setIsLoading(true);
    const res = await generateGrowthStrategy(activeTab, context);
    setResult(res);
    setIsLoading(false);
  };

  const tabs = [
    { id: 'CONTENT', label: 'Patient Content', icon: <Video size={18} />, color: 'bg-rose-500' },
    { id: 'BRANDING', label: 'Brand Identity', icon: <Palette size={18} />, color: 'bg-indigo-500' },
    { id: 'MARKETING', label: 'Outreach Plan', icon: <Megaphone size={18} />, color: 'bg-amber-500' },
    { id: 'SALES', label: 'Retention & Sales', icon: <BarChart3 size={18} />, color: 'bg-emerald-500' }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="font-bold text-slate-800">Growth & Branding Hub</h2>
        </div>
        <div className="bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">Growth AI</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Intro Hero */}
        <div className="p-5 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-b-[2.5rem] shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <TrendingUp className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Scale Your Practice</h1>
              <p className="text-xs text-indigo-200">Ethical branding & marketing for clinicians</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`p-4 rounded-3xl flex flex-col items-start gap-2 transition-all border ${activeTab === t.id ? 'bg-white text-indigo-900 border-white shadow-lg' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeTab === t.id ? t.color + ' text-white' : 'bg-white/10 text-white'}`}>
                  {t.icon}
                </div>
                <span className="text-xs font-bold">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-5 -mt-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles className="text-indigo-600" size={16} /> 
              {activeTab === 'CONTENT' && "What clinical topic should we cover?"}
              {activeTab === 'BRANDING' && "Describe your vision or specialty"}
              {activeTab === 'MARKETING' && "Who is your target patient audience?"}
              {activeTab === 'SALES' && "What growth challenge are you facing?"}
            </h3>
            <textarea
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-h-[100px]"
              placeholder={
                activeTab === 'CONTENT' ? "e.g. Managing Hypertension in summer, Diabetic diet tips..." :
                activeTab === 'BRANDING' ? "e.g. A pediatric clinic focused on holistic child development..." :
                "Enter details here..."
              }
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading || !context.trim()}
              className="w-full mt-4 bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating Strategy...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Generate AI Strategy
                </>
              )}
            </button>
          </div>

          {/* Result Area */}
          {result && !isLoading && (
            <div className="mt-6 animate-in fade-in zoom-in duration-500">
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="text-indigo-600" size={18} />
                    Strategy Result
                  </h3>
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-indigo-600"><Share2 size={16}/></button>
                    <button className="p-2 text-slate-400 hover:text-indigo-600"><Download size={16}/></button>
                  </div>
                </div>
                <div className="p-6 prose prose-indigo max-w-none">
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {result.content}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Quick Shortcuts */}
          {!result && !isLoading && (
            <div className="mt-8 space-y-4">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Suggested for You</h4>
               <div className="space-y-3">
                 {[
                   { label: "Viral 'Health Myths' Reel Script", cat: 'CONTENT', desc: 'Boost social media engagement' },
                   { label: "Clinic Slogan & Logo Concept", cat: 'BRANDING', desc: 'Elevate your visual identity' },
                   { label: "WhatsApp Patient Outreach Template", cat: 'MARKETING', desc: 'Improve follow-up conversion' }
                 ].map((item, idx) => (
                   <button 
                    key={idx}
                    onClick={() => { setActiveTab(item.cat as any); handleGenerate(); }}
                    className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-3xl hover:border-indigo-200 transition-colors shadow-sm text-left group"
                   >
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {idx === 0 ? <Video size={18}/> : idx === 1 ? <Palette size={18}/> : <Megaphone size={18}/>}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-800">{item.label}</p>
                         <p className="text-[10px] text-slate-500">{item.desc}</p>
                       </div>
                     </div>
                     <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600" />
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrowthHub;
