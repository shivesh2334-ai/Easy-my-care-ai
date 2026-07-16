
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Save, Share2, User, Activity, FileText, 
  Stethoscope, Calendar, Sparkles, Send, CheckCircle2, Mic, MicOff, Brain, Upload, Loader2, X, Plus, Trash2, Pill, Printer
} from 'lucide-react';
import { PrescriptionData, Medication } from '../types';
import { GoogleGenAI, Modality } from "@google/genai";
import { analyzePrescriptionImage, summarizePrescription, analyzePrescriptionWithMedGemma, suggestTreatment } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface PrescriptionFormProps {
  onBack: () => void;
  onSave: (data: PrescriptionData) => void;
  initialData: PrescriptionData;
  onDraftChange: (data: PrescriptionData) => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ onBack, onSave, initialData, onDraftChange }) => {
  const formData = initialData;
  const setFormData = (value: PrescriptionData | ((prev: PrescriptionData) => PrescriptionData)) => {
    const nextData = typeof value === 'function' ? (value as any)(formData) : value;
    onDraftChange(nextData);
  };

  const [isShared, setIsShared] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [aiResult, setAiResult] = useState<{ title: string; content: string } | null>(null);
  const [activeField, setActiveField] = useState<keyof PrescriptionData | null>(null);
  
  // Audio & AI Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const activeFieldRef = useRef<keyof PrescriptionData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...(prev.medications || []), { name: '', dosage: '', frequency: '', duration: '', route: '' }]
    }));
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => i === index ? { ...med, [field]: value } : med)
    }));
  };

  const toggleVoiceConsultation = async () => {
    if (isListening) {
      if (activeField === null) {
        stopListening();
      } else {
        setActiveField(null);
        activeFieldRef.current = null;
      }
    } else {
      await startListening(null);
    }
  };

  const toggleFieldVoice = async (field: keyof PrescriptionData) => {
    if (isListening) {
      if (activeField === field) {
        stopListening();
      } else {
        setActiveField(field);
        activeFieldRef.current = field;
      }
    } else {
      await startListening(field);
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

  const startListening = async (field: keyof PrescriptionData | null = null) => {
    try {
      setActiveField(field);
      activeFieldRef.current = field;
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
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
              const currentField = activeFieldRef.current;
              
              setFormData(prev => {
                if (currentField) {
                  return {
                    ...prev,
                    [currentField]: ((prev[currentField] as string) || '').trim() + ' ' + text.trim()
                  };
                }
                return {
                  ...prev,
                  conversationTranscript: (prev.conversationTranscript || '') + ' ' + text
                };
              });
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
    setActiveField(null);
    activeFieldRef.current = null;
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

  const handleAIImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        const mimeType = file.type;
        const extractedData = await analyzePrescriptionImage(base64Data, mimeType);
        
        setFormData(prev => ({
          ...prev,
          ...extractedData,
          vitals: {
            ...prev.vitals,
            ...(extractedData.vitals || {})
          },
          medications: extractedData.medications && extractedData.medications.length > 0 
            ? extractedData.medications 
            : prev.medications
        }));
        alert("AI successfully extracted data from the document!");
      } catch (err) {
        console.error(err);
        alert("Failed to extract data from the document.");
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const summary = await summarizePrescription(formData);
      setAiResult({ title: "Prescription Summary", content: summary });
    } catch (err) {
      console.error(err);
      alert("Failed to summarize prescription.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleMedGemmaAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzePrescriptionWithMedGemma(formData);
      setAiResult({ title: "MedGemma Clinical Analysis", content: analysis });
    } catch (err) {
      console.error(err);
      alert("Failed to analyze prescription.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSmartWrite = async () => {
    if (!formData.diagnosis && !formData.symptoms) {
      alert("Please provide symptoms or diagnosis first.");
      return;
    }
    setIsSuggesting(true);
    try {
      const suggestion = await suggestTreatment(formData);
      setFormData(prev => ({
        ...prev,
        treatment: suggestion.treatment || prev.treatment,
        medications: suggestion.medications && suggestion.medications.length > 0 
          ? [...(prev.medications || []), ...suggestion.medications]
          : prev.medications
      }));
      alert("AI has suggested a treatment plan based on your diagnosis!");
    } catch (err) {
      console.error(err);
      alert("AI Smart Write failed.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const medicationsHtml = formData.medications?.map(med => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.dosage}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.frequency}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.duration}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.route}</td>
      </tr>
    `).join('') || '<tr><td colspan="5" style="padding: 8px; text-align: center; color: #999;">No medications listed</td></tr>';

    const html = `
      <html>
        <head>
          <title>Prescription - ${formData.patientName || 'Patient'}</title>
          <style>
            body { font-family: 'Inter', sans-serif; color: #333; padding: 40px; line-height: 1.6; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
            .clinic-info h1 { margin: 0; color: #1e40af; font-size: 24px; }
            .clinic-info p { margin: 5px 0; color: #64748b; font-size: 14px; }
            .patient-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 12px; }
            .patient-info div b { color: #64748b; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 4px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 14px; font-weight: bold; color: #3b82f6; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { text-align: left; background: #f1f5f9; padding: 10px; font-size: 12px; color: #475569; text-transform: uppercase; }
            .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
            .signature { text-align: center; width: 200px; }
            .signature-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 5px; font-size: 14px; font-weight: bold; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-info">
              <h1>Easy My Care AI</h1>
              <p>Advanced Digital Health Solutions</p>
              <p>Dr. Shivesh | MD, Internal Medicine</p>
            </div>
            <div style="text-align: right;">
              <p>Date: ${new Date().toLocaleDateString()}</p>
              <p>Prescription ID: RX-${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
          </div>

          <div class="patient-info">
            <div><b>Patient Name</b> ${formData.patientName || 'N/A'}</div>
            <div><b>Age / Gender</b> ${formData.age || 'N/A'} / ${formData.gender || 'N/A'}</div>
            <div><b>Vitals</b> BP: ${formData.vitals?.bp || '--'} | HR: ${formData.vitals?.hr || '--'} | Temp: ${formData.vitals?.temp || '--'} | Wt: ${formData.vitals?.weight || '--'}</div>
            <div><b>Follow-up</b> ${formData.followUpDate || 'As needed'}</div>
          </div>

          <div class="section">
            <div class="section-title">Diagnosis</div>
            <p>${formData.diagnosis || 'No diagnosis recorded'}</p>
          </div>

          <div class="section">
            <div class="section-title">Medications</div>
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Route</th>
                </tr>
              </thead>
              <tbody>
                ${medicationsHtml}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Instructions & Advice</div>
            <p>${formData.treatment || 'No specific instructions provided'}</p>
          </div>

          ${formData.investigations ? `
            <div class="section">
              <div class="section-title">Investigations Planned</div>
              <p>${formData.investigations}</p>
            </div>
          ` : ''}

          <div class="footer">
            <div>
              <p style="font-size: 10px; color: #94a3b8;">This is an AI-assisted digital prescription generated via Easy My Care AI.</p>
            </div>
            <div class="signature">
              <div class="signature-line">Doctor's Signature</div>
            </div>
          </div>

          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
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
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,application/pdf" 
            onChange={handleAIImport}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors flex items-center gap-2"
            title="Import from Image/PDF"
          >
            {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            <span className="hidden md:inline text-xs font-bold">AI Import</span>
          </button>
          <button 
            onClick={handleShare}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={handlePrint}
            className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            title="Print Prescription"
          >
            <Printer className="w-5 h-5" />
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
        className={`fixed bottom-24 right-6 z-40 p-5 rounded-full shadow-2xl transition-all flex items-center justify-center border-4 ${isListening && activeField === null ? 'bg-red-500 border-red-200 animate-pulse text-white scale-110' : isListening ? 'bg-slate-700 border-slate-200 text-white' : 'bg-blue-600 border-blue-200 text-white hover:scale-105'}`}
      >
        {isListening && activeField === null ? <MicOff size={28} /> : <Mic size={28} />}
        {isListening && (
          <span className="absolute -top-12 right-0 bg-slate-900 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg border border-white/10">
            {activeField ? `Recording ${activeField}...` : 'AI Scribe Active'}
          </span>
        )}
      </button>

      <div className="flex-1 overflow-y-auto p-5 pb-32 space-y-6">
        
        {/* AI Result Area */}
        {aiResult && (
          <section className="bg-white rounded-[2rem] p-6 shadow-xl border border-blue-100 animate-in fade-in slide-in-from-top duration-500 relative">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="text-blue-600" size={20} />
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-800">{aiResult.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      summary: prev.summary ? prev.summary + "\n\n" + aiResult.content : aiResult.content
                    }));
                    alert("AI analysis saved to Notes!");
                  }}
                  className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-colors flex items-center gap-1"
                >
                  <Save size={12} /> Save to Notes
                </button>
                <button 
                  onClick={() => setAiResult(null)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed max-h-[300px] overflow-y-auto scrollbar-hide">
              <ReactMarkdown>{aiResult.content}</ReactMarkdown>
            </div>
          </section>
        )}

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
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Symptoms</label>
              <button 
                onClick={() => toggleFieldVoice('symptoms')}
                className={`p-1.5 rounded-lg transition-all ${activeField === 'symptoms' ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' : 'text-slate-400 hover:bg-slate-100'}`}
                title="Voice Input"
              >
                {activeField === 'symptoms' ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            </div>
            <textarea 
              rows={2}
              placeholder="Presenting complaints..."
              className={`w-full p-3 rounded-xl border transition-all text-sm outline-none ${activeField === 'symptoms' ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
              value={formData.symptoms}
              onChange={(e) => handleChange('symptoms', e.target.value)}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Diagnosis</label>
              <button 
                onClick={() => toggleFieldVoice('diagnosis')}
                className={`p-1.5 rounded-lg transition-all ${activeField === 'diagnosis' ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' : 'text-slate-400 hover:bg-slate-100'}`}
                title="Voice Input"
              >
                {activeField === 'diagnosis' ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            </div>
            <textarea 
              rows={2}
              placeholder="Clinical impression..."
              className={`w-full p-3 rounded-xl border transition-all text-sm font-semibold outline-none ${activeField === 'diagnosis' ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30 text-slate-800' : 'border-slate-200 focus:ring-2 focus:ring-blue-500 text-slate-800'}`}
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
            <button 
              onClick={handleSmartWrite}
              disabled={isSuggesting}
              className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              {isSuggesting ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10}/>}
              {isSuggesting ? 'Thinking...' : 'AI Smart Write'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Medications</label>
              <button 
                onClick={addMedication}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-all"
              >
                <Plus size={12} /> Add Medicine
              </button>
            </div>

            <div className="space-y-3">
              {formData.medications?.map((med, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 relative group">
                  <button 
                    onClick={() => removeMedication(idx)}
                    className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Medicine Name</label>
                      <input 
                        type="text"
                        placeholder="e.g. Paracetamol 500mg"
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                        value={med.name}
                        onChange={(e) => updateMedication(idx, 'name', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Dosage</label>
                      <input 
                        type="text"
                        placeholder="e.g. 1 tab"
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                        value={med.dosage}
                        onChange={(e) => updateMedication(idx, 'dosage', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Frequency</label>
                      <input 
                        type="text"
                        placeholder="e.g. 1-0-1"
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                        value={med.frequency}
                        onChange={(e) => updateMedication(idx, 'frequency', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Duration</label>
                      <input 
                        type="text"
                        placeholder="e.g. 5 days"
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none mt-1"
                        value={med.duration}
                        onChange={(e) => updateMedication(idx, 'duration', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Route</label>
                      <select 
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none mt-1 bg-white"
                        value={med.route}
                        onChange={(e) => updateMedication(idx, 'route', e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="Oral">Oral</option>
                        <option value="IV">IV</option>
                        <option value="IM">IM</option>
                        <option value="SC">SC</option>
                        <option value="Topical">Topical</option>
                        <option value="Inhalation">Inhalation</option>
                        <option value="Drops">Drops</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              {(!formData.medications || formData.medications.length === 0) && (
                <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-3xl">
                  <Pill className="mx-auto text-slate-200 mb-2" size={32} />
                  <p className="text-xs text-slate-400 font-medium">No medications added yet</p>
                  <button 
                    onClick={addMedication}
                    className="mt-3 text-[10px] font-bold text-blue-600 hover:underline"
                  >
                    + Add first medicine
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">General Instructions</label>
              <button 
                onClick={() => toggleFieldVoice('treatment')}
                className={`p-1.5 rounded-lg transition-all ${activeField === 'treatment' ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' : 'text-slate-400 hover:bg-slate-100'}`}
                title="Voice Input"
              >
                {activeField === 'treatment' ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            </div>
            <textarea 
              rows={3}
              placeholder="Dietary advice, lifestyle changes, etc..."
              className={`w-full p-3 rounded-xl border transition-all text-sm outline-none ${activeField === 'treatment' ? 'border-red-500 ring-2 ring-red-100 bg-red-50/30' : 'border-slate-200 focus:ring-2 focus:ring-blue-500'}`}
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

        {/* Referral Information */}
        <section className="bg-amber-50/50 p-4 rounded-3xl border border-amber-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-800">
              <Share2 size={16} className="text-amber-600" />
              <p className="text-xs font-black uppercase tracking-wider">Patient Referral Details</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.isReferred || false}
                onChange={(e) => handleChange('isReferred', e.target.checked)}
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
              <span className="ml-2 text-xs font-bold text-slate-700">Refer Patient</span>
            </label>
          </div>

          {(formData.isReferred) && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-2">
              <label className="text-[10px] font-bold text-amber-800 uppercase block">Referral Destination / Health Center</label>
              <select 
                className="w-full p-2.5 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-500 bg-white text-xs font-semibold text-slate-800 outline-none"
                value={formData.referredCenter || ''}
                onChange={(e) => handleChange('referredCenter', e.target.value)}
              >
                <option value="">-- Select Referral Center --</option>
                <option value="AIIMS, New Delhi">AIIMS, New Delhi (All India Institute of Medical Sciences)</option>
                <option value="Safdarjung Hospital, New Delhi">Safdarjung Hospital, New Delhi</option>
                <option value="Ram Manohar Lohia (RML) Hospital, Delhi">Ram Manohar Lohia (RML) Hospital, Delhi</option>
                <option value="Lok Nayak Jai Prakash (LNJP) Hospital, Delhi">Lok Nayak Jai Prakash (LNJP) Hospital, Delhi</option>
                <option value="Lady Hardinge Medical College, New Delhi">Lady Hardinge Medical College, New Delhi</option>
                <option value="National Institute of TB & Respiratory Diseases (NITRD), New Delhi">National Institute of TB & Respiratory Diseases (NITRD)</option>
                <option value="Fortis Healthcare, Delhi NCR">Fortis Healthcare, Delhi NCR</option>
                <option value="Max Super Speciality Hospital, Delhi NCR">Max Super Speciality Hospital, Delhi NCR</option>
                <option value="Sir Ganga Ram Hospital, New Delhi">Sir Ganga Ram Hospital, New Delhi</option>
              </select>
              <p className="text-[9px] text-amber-700/80 leading-snug">
                * Referral will link the current clinical diagnosis (<strong>{formData.diagnosis || "No Diagnosis entered yet"}</strong>) for unified Indian surveillance mapping.
              </p>
            </div>
          )}
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
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleSummarize}
              disabled={isSummarizing}
              className="py-3 bg-blue-50 text-blue-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-100 transition-all border border-blue-100 disabled:opacity-50"
            >
              {isSummarizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText size={16} />}
              Summarize
            </button>
            <button 
              onClick={handleMedGemmaAnalysis}
              disabled={isAnalyzing}
              className="py-3 bg-purple-50 text-purple-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-purple-100 transition-all border border-purple-100 disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain size={16} />}
              MedGemma Analysis
            </button>
          </div>
          <button 
            onClick={handleShare}
            className="w-full py-4 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
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
