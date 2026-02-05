
import React, { useState } from 'react';
import { ArrowLeft, Search, Pill, Landmark, Tag, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { searchDrugInfo } from '../services/geminiService';
import { AnalysisResult } from '../types';

interface DrugInfoProps {
  onBack: () => void;
}

const DrugInfo: React.FC<DrugInfoProps> = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    const res = await searchDrugInfo(query);
    setResult(res);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="font-bold text-slate-800">Drug & Pharmacy Hub</h2>
        </div>
        <div className="bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
          <span className="text-[10px] font-bold text-orange-700 uppercase tracking-widest">India Market</span>
        </div>
      </div>

      <div className="p-5 space-y-6 flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {/* Search Bar */}
        <section>
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Generic (e.g. Paracetamol, Telmisartan)..." 
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
            />
            <Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
            <button type="submit" className="absolute right-3 top-2.5 p-1.5 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition-colors">
              <Sparkles size={18} />
            </button>
          </form>
          <p className="text-[10px] text-slate-500 mt-2 ml-1 font-medium italic">
            Powered by Gemini AI Search • Real-time Indian Pharmacy Data
          </p>
        </section>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse text-sm">Searching Indian Pharmacy Networks...</p>
          </div>
        ) : result ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* AI Response Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="text-blue-600" size={20} />
                  <h3 className="font-bold text-slate-800">{result.title}</h3>
                </div>
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">
                  <ShieldCheck size={12} />
                  <span className="text-[9px] font-black uppercase">Verified Prices</span>
                </div>
              </div>
              <div className="p-5 prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 text-sm leading-relaxed">
                  {result.content}
                </div>
              </div>
            </div>

            {/* Sources */}
            {result.sources && result.sources.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Reference Sources</h4>
                <div className="grid grid-cols-1 gap-2">
                  {result.sources.map((s, idx) => s.web && (
                    <a 
                      key={idx} 
                      href={s.web.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <span className="text-xs font-medium text-slate-600 truncate mr-2">{s.web.title || s.web.uri}</span>
                      <ExternalLink size={12} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center px-10">
            <Pill size={64} className="text-slate-300 mb-4" />
            <p className="font-bold text-slate-500 text-sm">Search for any medication to see brands, manufacturers, and comparative pricing.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrugInfo;
