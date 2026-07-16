
import React from 'react';
import { X, ExternalLink, ShieldAlert, Sparkles, Save } from 'lucide-react';
import { AnalysisResult } from '../types';

interface AIModalProps {
  result: AnalysisResult | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  onSaveToNotes?: (content: string) => void;
}

const AIModal: React.FC<AIModalProps> = ({ result, isOpen, onClose, isLoading, onSaveToNotes }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="text-blue-600 w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">
              {isLoading ? "AI Thinking..." : result?.title}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 animate-pulse">Analyzing clinical data...</p>
            </div>
          ) : (
            <>
              <div className="prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-sm">
                  {result?.content}
                </div>
              </div>

              {result?.sources && result.sources.length > 0 && (
                <div className="mt-8 border-t pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Verified Sources</h4>
                  <div className="space-y-2">
                    {result.sources.map((s, idx) => s.web && (
                      <a 
                        key={idx}
                        href={s.web.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                      >
                        <span className="text-xs font-medium text-slate-600 truncate mr-2">{s.web.title || s.web.uri}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-[10px] text-amber-800">
                  Disclaimer: This AI analysis is for supportive purposes only and should not replace professional medical advice. Always consult with a certified healthcare provider.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex gap-2">
            {!isLoading && result && onSaveToNotes && (
              <button 
                onClick={() => onSaveToNotes(result.content)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
              >
                <Save size={14} /> Save to Prescription
              </button>
            )}
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-colors shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIModal;
