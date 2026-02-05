
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Save, Share2, User, Activity, FileText, 
  Stethoscope, Calendar, Sparkles, Send, CheckCircle2, Mic, MicOff, Brain
} from 'lucide-react';
import { PrescriptionData } from '../types';
import { GoogleGenAI, Modality } from "@google/genai";

interface PrescriptionFormProps {
  onBack: () => void;
  onSave: (data: PrescriptionData) => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState<PrescriptionData>({
    patientName: '',
    age: '',
    gender: 'Male',
    contact: '',
    symptoms: '',
    vitals: { bp: '', hr: '', temp: '', weight: '' },
    labReport: '',
    investigations: '',
    diagnosis: '',
    summary: '',
    treatment: '',
    followUpDate: '',
    conversationTranscript: ''
  });

  const [isShared, setIsShared] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Audio & AI Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);

  const handleChange = (field: keyof PrescriptionData | string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...(prev as any)[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleShare = () => {
    setIsShared(true);
    setTimeout(() => setIsShared(false), 3000);
    alert("Prescription link generated and ready to share via WhatsApp/Email!");
  };

  const toggleVoiceConsultation = async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startListening = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = audioCtx.createMediaStreamSource(stream);
            const scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioCtx.destination);
            setIsListening(true);
          },
          onmessage: async (message: any) => {
            // Handle transcriptions
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setFormData(prev => ({
                ...prev,
                conversationTranscript: (prev.conversationTranscript || '') + ' ' + text
              }));
            }
            if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                setFormData(prev => ({
                  ...prev,
                  conversationTranscript: (prev.conversationTranscript || '') + ' [AI]: ' + text
                }));
            }
          },
          onerror: (e) => console.error("AI Error:", e),
          onclose: () => setIsListening(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: "You are a passive clinical scribe. Transcribe the conversation between a doctor and patient exactly as it happens. Do not interrupt unless asked. Focus on symptoms, dosage, and diagnostic details."
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start listening:", err);
      alert("Microphone access denied or connection error.");
    }
  };

  const stopListening = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (sessionRef.current) {
      // In real SDK session.close() exists
      try { (sessionRef.current as any).close(); } catch(e) {}
      sessionRef.current = null;
    }
    setIsListening(false);
  };

  const syncTranscriptToForm = () => {
    // Basic heuristic: Move transcript into summary or symptoms if not already filled
    if (formData.conversationTranscript) {
      setFormData(prev => ({
        ...prev,
        summary: prev.summary ? prev.summary + "\n\nTranscript Sync: " + prev.conversationTranscript : prev.conversationTranscript
      }));
      alert("Transcript synced to Summary Notes!");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="font-bold text-slate-800">New Prescription</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleShare}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onSave(formData)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>

      {/* Floating Voice Button */}
      <button 
        onClick={toggleVoiceConsultation}
        className={`fixed bottom-24 right-6 z-40 p-5 rounded-full shadow-2xl transition-all flex items-center justify-center border-4 ${isListening ? 'bg-red-500 border-red-200 animate-pulse text-white scale-110' : 'bg-blue-600 border-blue-200 text-white hover:scale-105'}`}
      >
        {isListening ? <MicOff size={28} /> : <Mic size={28} />}
        {isListening && <span className="absolute -top-12 right-0 bg-red-600 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg">AI Listening...</span>}
      </button>

      <div className="flex-1 overflow-y-auto p-5 pb-32 space-y-6">
        
        {/* Voice Transcript Area */}
        { (formData.conversationTranscript || isListening) && (
          <section className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl relative overflow-hidden animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <Brain className="text-blue-400" size={20} />
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">Live Consultation Transcript</h3>
              </div>
              {formData.conversationTranscript && (
                <button 
                  onClick={syncTranscriptToForm}
                  className="bg-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-2 hover:bg-blue-500 transition-colors"
                >
                  <Sparkles size={12} /> Sync to Notes
                </button>
              )}
            </div>
            <div className="bg-white/10 rounded-2xl p-4 min-h-[100px] max-h-[200px] overflow-y-auto text-sm leading-relaxed text-slate-200 scrollbar-hide border border-white/5 relative z-10">
              {formData.conversationTranscript ? (
                formData.conversationTranscript
              ) : (
                <p className="text-slate-500 italic flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                  Listening to doctor and patient...
                </p>
              )}
            </div>
          </section>
        )}

        {/* Demographics */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <User size={18} className="font-bold" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Patient Demographics</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Full Name</label>
              <input 
                type="text" 
                placeholder="Patient Name"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm mt-1"
                value={formData.patientName}
                onChange={(e) => handleChange('patientName', e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Age</label>
              <input 
                type="number" 
                placeholder="Age"
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm mt-1"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Gender</label>
              <select 
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm mt-1 bg-white"
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* Vitals */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <Activity size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Vital Signs</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input 
              placeholder="BP (e.g. 120/80)"
              className="p-3 rounded-xl border border-slate-200 text-sm"
              value={formData.vitals.bp}
              onChange={(e) => handleChange('vitals.bp', e.target.value)}
            />
            <input 
              placeholder="HR (bpm)"
              className="p-3 rounded-xl border border-slate-200 text-sm"
              value={formData.vitals.hr}
              onChange={(e) => handleChange('vitals.hr', e.target.value)}
            />
            <input 
              placeholder="Temp (°F)"
              className="p-3 rounded-xl border border-slate-200 text-sm"
              value={formData.vitals.temp}
              onChange={(e) => handleChange('vitals.temp', e.target.value)}
            />
            <input 
              placeholder="Weight (kg)"
              className="p-3 rounded-xl border border-slate-200 text-sm"
              value={formData.vitals.weight}
              onChange={(e) => handleChange('vitals.weight', e.target.value)}
            />
          </div>
        </section>

        {/* Symptoms & Diagnosis */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Stethoscope size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Clinical Assessment</h3>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Symptoms</label>
            <textarea 
              rows={2}
              placeholder="Presenting complaints..."
              className="w-full p-3 rounded-xl border border-slate-200 text-sm mt-1"
              value={formData.symptoms}
              onChange={(e) => handleChange('symptoms', e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Diagnosis</label>
            <textarea 
              rows={2}
              placeholder="Clinical impression..."
              className="w-full p-3 rounded-xl border border-slate-200 text-sm mt-1 font-semibold text-slate-800"
              value={formData.diagnosis}
              onChange={(e) => handleChange('diagnosis', e.target.value)}
            />
          </div>
        </section>

        {/* Labs & Investigations */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <FileText size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Reports & Investigations</h3>
          </div>
          <textarea 
            placeholder="Lab results / Findings..."
            className="w-full p-3 rounded-xl border border-slate-200 text-sm"
            value={formData.labReport}
            onChange={(e) => handleChange('labReport', e.target.value)}
          />
          <textarea 
            placeholder="Planned investigations (e.g. MRI, Blood culture)..."
            className="w-full p-3 rounded-xl border border-slate-200 text-sm"
            value={formData.investigations}
            onChange={(e) => handleChange('investigations', e.target.value)}
          />
        </section>

        {/* Treatment & Summary */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-purple-600">
              <Sparkles size={18} />
              <h3 className="text-sm font-bold uppercase tracking-wider">Management Plan</h3>
            </div>
            <button className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-100 transition-colors">
              <Sparkles size={10}/> AI Smart Write
            </button>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Treatment / Medication</label>
            <textarea 
              rows={4}
              placeholder="Dosage, frequency, and duration..."
              className="w-full p-3 rounded-xl border border-slate-200 text-sm mt-1"
              value={formData.treatment}
              onChange={(e) => handleChange('treatment', e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Summary / Instructions</label>
            <textarea 
              rows={2}
              placeholder="Advice to patient..."
              className="w-full p-3 rounded-xl border border-slate-200 text-sm mt-1 italic"
              value={formData.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
            />
          </div>
        </section>

        {/* Follow Up */}
        <section className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-600" />
            <div>
              <p className="text-xs font-bold text-blue-900">Follow-up Date</p>
              <input 
                type="date"
                className="bg-transparent text-sm text-blue-800 font-medium outline-none"
                value={formData.followUpDate}
                onChange={(e) => handleChange('followUpDate', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <button 
            onClick={handleShare}
            className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Send size={18} className="text-blue-500" /> WhatsApp Patient
          </button>
        </div>
      </div>

      {isShared && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl animate-in fade-in zoom-in duration-300 z-50">
          <CheckCircle2 className="text-green-400" />
          <span className="text-sm font-bold">Prescription Sent Successfully</span>
        </div>
      )}
    </div>
  );
};

export default PrescriptionForm;
