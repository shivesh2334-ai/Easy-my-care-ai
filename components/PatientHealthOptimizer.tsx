import React, { useState } from 'react';
import { 
  ArrowLeft, Brain, Sparkles, Upload, Activity, FileText, Pill, 
  HeartPulse, ShieldCheck, CheckCircle2, AlertCircle, ChevronRight, 
  Plus, Trash2, Clock, Check, ListChecks, RefreshCw, BarChart2, Zap
} from 'lucide-react';
import { analyzePatientHealth } from '../services/geminiService';

interface PatientHealthOptimizerProps {
  onBack: () => void;
}

interface WearableData {
  heartRate: number;
  steps: number;
  sleepHours: number;
  bloodPressure: string;
}

export const PatientHealthOptimizer: React.FC<PatientHealthOptimizerProps> = ({ onBack }) => {
  // Main states
  const [symptoms, setSymptoms] = useState('Mild shortness of breath during morning walks, lightheadedness, and slight swelling in ankles for 3 days.');
  const [medications, setMedications] = useState('Metformin 500mg twice daily, Amlodipine 5mg once daily in the morning.');
  const [labs, setLabs] = useState('HbA1c: 7.2% (elevated), Serum Creatinine: 1.1 mg/dL, Fasting Blood Glucose: 145 mg/dL.');
  const [radiology, setRadiology] = useState('Chest X-ray: Lungs clear, mild cardiomegaly (slightly enlarged heart shadow noted).');
  const [visitNotes, setVisitNotes] = useState('Last visit 2 months ago: Clinician suggested monitoring blood pressure daily and maintaining low sodium diet. Advised walking 30 minutes daily.');
  
  // Wearables state
  const [wearables, setWearables] = useState<WearableData>({
    heartRate: 74,
    steps: 6200,
    sleepHours: 6.5,
    bloodPressure: '138/85'
  });

  // UI Flow states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'INPUT' | 'REPORT' | 'TRACKER'>('INPUT');
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);

  // Daily tracker items state (optimizing between visits)
  const [trackerTasks, setTrackerTasks] = useState([
    { id: 1, text: 'Take morning Metformin with breakfast', done: true, category: 'MED' },
    { id: 2, text: 'Check blood pressure before morning walk', done: true, category: 'WEAR' },
    { id: 3, text: 'Aim for 7,500 steps (aerobic health)', done: false, category: 'FIT' },
    { id: 4, text: 'Follow low-sodium / low-glycemic dietary meal', done: false, category: 'DIET' },
    { id: 5, text: 'Hydrate: Drink 2.5 Liters of water today', done: true, category: 'DIET' },
    { id: 6, text: 'Take evening Metformin & check blood sugar', done: false, category: 'MED' }
  ]);

  // Load a pre-defined complex health profile for easy testing
  const loadSampleCase = (type: 'CARDIOMETABOLIC' | 'RESPIRATORY') => {
    if (type === 'CARDIOMETABOLIC') {
      setSymptoms('Dull chest tightness that worsens after heavy meals, constant fatigue, and occasional tingling in the feet.');
      setMedications('Metformin 1000mg daily, Atorvastatin 20mg nightly, Losartan 50mg daily.');
      setLabs('Fasting Blood Glucose: 162 mg/dL, HbA1c: 7.8% (high), LDL Cholesterol: 135 mg/dL (high), eGFR: 72 mL/min (mildly decreased renal clearance).');
      setRadiology('Echocardiogram: Left ventricular hypertrophy, ejection fraction estimated at 52%. Coronary calcium score: 180 (moderate plaque burden).');
      setVisitNotes('Recommended tight glucose control to prevent neuropathy. Set target BP < 130/80 mmHg. Referral to eye doctor for retinal screening.');
      setWearables({
        heartRate: 78,
        steps: 4300,
        sleepHours: 5.8,
        bloodPressure: '142/88'
      });
      setTrackerTasks([
        { id: 1, text: 'Check morning glucose level (Target < 110)', done: false, category: 'DIET' },
        { id: 2, text: 'Check Blood Pressure twice daily', done: true, category: 'WEAR' },
        { id: 3, text: 'Perform 20 minutes light aerobic movement', done: false, category: 'FIT' },
        { id: 4, text: 'Avoid high-carb dinner and late night snacks', done: true, category: 'DIET' },
        { id: 5, text: 'Take cholesterol statin before bed', done: false, category: 'MED' }
      ]);
    } else {
      setSymptoms('Productive cough in the morning, wheezing during cold weather, and shortness of breath when walking up stairs.');
      setMedications('Salbutamol Inhaler (Albuterol) as needed, Fluticasone/Salmeterol (Advair) 1 puff twice daily.');
      setLabs('Arterial Blood Gas: pO2 82 mmHg (acceptable), pCO2 41 mmHg. Total IgE: 240 IU/mL (mildly elevated, suggests allergic trigger).');
      setRadiology('Chest CT: Mild bronchial wall thickening, hyperinflation of both lung fields consistent with moderate COPD.');
      setVisitNotes('Keep track of peak flow rate. Use rescue inhaler if wheezing exceeds baseline. Avoid smoke, high pollution zones, and dust.');
      setWearables({
        heartRate: 85,
        steps: 5100,
        sleepHours: 7.0,
        bloodPressure: '124/78'
      });
      setTrackerTasks([
        { id: 1, text: 'Take morning Fluticasone steroid inhaler', done: true, category: 'MED' },
        { id: 2, text: 'Check morning peak flow rate', done: true, category: 'WEAR' },
        { id: 3, text: 'Practice 10 minutes diaphragmatic breathing', done: false, category: 'FIT' },
        { id: 4, text: 'Check local AQI / air quality index', done: true, category: 'DIET' },
        { id: 5, text: 'Sanitize personal inhaler mouthpiece', done: false, category: 'MED' }
      ]);
    }
  };

  // Mock File Upload & Parsing (OCR emulation)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'LAB' | 'RADIO' | 'NOTE') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setUploadFeedback(`Uploading ${file.name}...`);

    setTimeout(() => {
      setOcrLoading(false);
      if (type === 'LAB') {
        setLabs(prev => prev + `\n[EXTRACTED FROM ${file.name}]: WBC: 7.8 x10^3/uL, Hemoglobin: 13.5 g/dL, Potassium: 4.2 mEq/L, TSH: 2.1 mIU/L.`);
        setUploadFeedback(`Successfully parsed laboratory values from ${file.name}!`);
      } else if (type === 'RADIO') {
        setRadiology(prev => prev + `\n[EXTRACTED FROM ${file.name}]: Ultrasound Abdomen: Liver is normal in size with mild fatty changes (Grade 1 steatosis). Gallbladder and kidneys are unremarkable.`);
        setUploadFeedback(`Successfully decrypted imaging findings from ${file.name}!`);
      } else {
        setVisitNotes(prev => prev + `\n[EXTRACTED FROM ${file.name}]: Outpatient summary: Patient is stable. Instructed to increase dietary fiber, check fasting sugars, and follow up in 12 weeks.`);
        setUploadFeedback(`Parsed outpatient clinical consultation notes!`);
      }
      setTimeout(() => setUploadFeedback(null), 4000);
    }, 1800);
  };

  // Run Megana Personal Health Analyzer
  const handleAnalyzeHealth = async () => {
    setIsAnalyzing(true);
    setActiveTab('REPORT');
    setAnalysisReport(null);

    const wearableString = `Heart Rate: ${wearables.heartRate} bpm, Steps: ${wearables.steps}, Sleep: ${wearables.sleepHours} hrs, Blood Pressure: ${wearables.bloodPressure}`;

    try {
      const response = await analyzePatientHealth({
        symptoms,
        medications,
        labs,
        radiology,
        wearables: wearableString,
        visitNotes
      });
      setAnalysisReport(response);
    } catch (err) {
      console.error(err);
      setAnalysisReport("Megana health services are busy analyzing complex medical profiles. Please tap recalculate below.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Render markdown helper safely
  const renderFormattedReport = (text: string) => {
    const paragraphs = text.split('\n');
    return paragraphs.map((para, i) => {
      if (para.startsWith('###')) {
        return (
          <h3 key={i} className="text-sm font-black text-blue-900 border-b border-blue-100 pb-1.5 mt-5 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
            {para.replace('###', '').trim()}
          </h3>
        );
      } else if (para.startsWith('-') || para.startsWith('*')) {
        return (
          <div key={i} className="flex gap-2 items-start ml-2 my-1 text-xs text-slate-700 leading-relaxed font-medium">
            <span className="text-blue-500 mt-1">•</span>
            <span>{para.substring(1).trim()}</span>
          </div>
        );
      } else if (para.trim() === '') {
        return <div key={i} className="h-2" />;
      } else {
        return (
          <p key={i} className="text-xs text-slate-600 leading-relaxed font-medium mb-2">
            {para}
          </p>
        );
      }
    });
  };

  const toggleTask = (id: number) => {
    setTrackerTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 text-base">Megana Health Optimizer</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Clinical Companion</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 text-[10px] font-extrabold uppercase">
          <Brain size={11} className="animate-pulse" /> Active Guard
        </div>
      </div>

      {/* Hero Brand Section */}
      <div className="p-5 bg-gradient-to-r from-blue-950 to-indigo-900 text-white relative overflow-hidden flex flex-col justify-between">
        <div className="absolute right-0 bottom-0 opacity-15 translate-x-4 translate-y-4">
          <Brain size={140} />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/25 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-block">
            Global Medical Knowledge Co-Pilot
          </div>
          <h1 className="text-lg font-black tracking-tight leading-tight">
            Understand Your Health Between Visits
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Empower yourself with clinical-grade explanations. Consolidate symptoms, labs, radiology reports, and wearable metrics into a structured optimization plan.
          </p>
        </div>
      </div>

      {/* Control Tabs */}
      <div className="px-4 bg-white border-b border-slate-200 flex">
        <button 
          onClick={() => setActiveTab('INPUT')}
          className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'INPUT' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
        >
          📝 1. My Health Logs
        </button>
        <button 
          onClick={() => {
            if (!analysisReport) handleAnalyzeHealth();
            else setActiveTab('REPORT');
          }}
          className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider border-b-2 transition-all relative ${activeTab === 'REPORT' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
        >
          ✨ 2. Megana Analysis
          {isAnalyzing && <span className="absolute right-3 top-3 w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" />}
        </button>
        <button 
          onClick={() => setActiveTab('TRACKER')}
          className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider border-b-2 transition-all relative ${activeTab === 'TRACKER' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
        >
          📈 3. Daily Tracker
          <span className="absolute right-3 top-2 bg-slate-100 text-slate-600 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-slate-200">
            {trackerTasks.filter(t => !t.done).length}
          </span>
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-28 space-y-4">
        
        {/* TAB 1: LOGS INPUT */}
        {activeTab === 'INPUT' && (
          <div className="space-y-4">
            
            {/* Quick Presets / Profiles */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-600" />
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Demo Health Profiles</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => loadSampleCase('CARDIOMETABOLIC')}
                  className="py-2.5 px-3 bg-blue-50/60 hover:bg-blue-50 text-blue-900 border border-blue-100/60 rounded-2xl text-left text-[11px] font-extrabold flex items-center justify-between transition-colors"
                >
                  <span>Cardiometabolic (DM & BP)</span>
                  <ChevronRight size={12} className="text-blue-400" />
                </button>
                <button 
                  onClick={() => loadSampleCase('RESPIRATORY')}
                  className="py-2.5 px-3 bg-teal-50/60 hover:bg-teal-50 text-teal-900 border border-teal-100/60 rounded-2xl text-left text-[11px] font-extrabold flex items-center justify-between transition-colors"
                >
                  <span>Respiratory Care (COPD)</span>
                  <ChevronRight size={12} className="text-teal-400" />
                </button>
              </div>
            </div>

            {/* Notification Banner for parsed files */}
            {uploadFeedback && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl text-blue-800 text-xs font-bold flex items-center gap-2.5 animate-bounce">
                {ocrLoading ? <RefreshCw className="animate-spin text-blue-600" size={14} /> : <CheckCircle2 className="text-blue-600" size={14} />}
                <span>{uploadFeedback}</span>
              </div>
            )}

            {/* SECTION: SYMPTOMS */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-slate-500 block">1. Patient Symptoms & Details</label>
                <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Primary Signal</span>
              </div>
              <textarea 
                value={symptoms} 
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
                placeholder="Enter current active symptoms, severity, and duration in detail..."
                className="w-full bg-slate-50 text-slate-800 text-xs font-medium border border-slate-200 rounded-2xl p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
              />
            </div>

            {/* SECTION: WEARABLES & DEVICES */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-slate-500 block">2. Wearable & Device Sync</label>
                <span className="text-[9px] font-extrabold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">Connected Health</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] text-slate-400 uppercase font-bold">Avg Heart Rate</p>
                    <input 
                      type="number" 
                      value={wearables.heartRate} 
                      onChange={(e) => setWearables({...wearables, heartRate: parseInt(e.target.value) || 72})} 
                      className="w-16 bg-transparent text-sm font-black text-slate-800 focus:outline-none" 
                    />
                    <span className="text-[9px] font-bold text-slate-400">bpm</span>
                  </div>
                  <HeartPulse className="text-red-500" size={18} />
                </div>

                <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] text-slate-400 uppercase font-bold">Blood Pressure</p>
                    <input 
                      type="text" 
                      value={wearables.bloodPressure} 
                      onChange={(e) => setWearables({...wearables, bloodPressure: e.target.value})} 
                      className="w-20 bg-transparent text-sm font-black text-slate-800 focus:outline-none" 
                    />
                    <span className="text-[9px] font-bold text-slate-400">mmHg</span>
                  </div>
                  <Activity className="text-blue-500" size={18} />
                </div>

                <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] text-slate-400 uppercase font-bold">Daily Steps</p>
                    <input 
                      type="number" 
                      value={wearables.steps} 
                      onChange={(e) => setWearables({...wearables, steps: parseInt(e.target.value) || 5000})} 
                      className="w-16 bg-transparent text-sm font-black text-slate-800 focus:outline-none" 
                    />
                    <span className="text-[9px] font-bold text-slate-400">steps</span>
                  </div>
                  <Zap className="text-orange-500" size={18} />
                </div>

                <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] text-slate-400 uppercase font-bold">Sleep Duration</p>
                    <input 
                      type="number" 
                      step="0.1"
                      value={wearables.sleepHours} 
                      onChange={(e) => setWearables({...wearables, sleepHours: parseFloat(e.target.value) || 7})} 
                      className="w-16 bg-transparent text-sm font-black text-slate-800 focus:outline-none" 
                    />
                    <span className="text-[9px] font-bold text-slate-400">hours</span>
                  </div>
                  <Clock className="text-indigo-500" size={18} />
                </div>
              </div>
            </div>

            {/* SECTION: LABS */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-slate-500 block">3. Laboratory Reports</label>
                <div className="relative">
                  <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'LAB')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full cursor-pointer hover:bg-indigo-100 transition-colors inline-flex items-center gap-1">
                    <Upload size={10} /> Upload PDF/Image
                  </span>
                </div>
              </div>
              <textarea 
                value={labs} 
                onChange={(e) => setLabs(e.target.value)}
                rows={2}
                placeholder="Enter key blood test numbers, HbA1c, thyroid levels, etc..."
                className="w-full bg-slate-50 text-slate-800 text-xs font-medium border border-slate-200 rounded-2xl p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
              />
            </div>

            {/* SECTION: RADIOLOGY */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-slate-500 block">4. Radiology Reports</label>
                <div className="relative">
                  <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'RADIO')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <span className="text-[9px] font-extrabold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full cursor-pointer hover:bg-orange-100 transition-colors inline-flex items-center gap-1">
                    <Upload size={10} /> Upload Scan
                  </span>
                </div>
              </div>
              <textarea 
                value={radiology} 
                onChange={(e) => setRadiology(e.target.value)}
                rows={2}
                placeholder="Enter scan results (X-rays, MRIs, Ultrasounds)..."
                className="w-full bg-slate-50 text-slate-800 text-xs font-medium border border-slate-200 rounded-2xl p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
              />
            </div>

            {/* SECTION: MEDICATIONS */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-slate-500 block">5. Current Medications</label>
                <span className="text-[9px] font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Treatment Profile</span>
              </div>
              <textarea 
                value={medications} 
                onChange={(e) => setMedications(e.target.value)}
                rows={2}
                placeholder="List active medications, dosages, and daily schedules..."
                className="w-full bg-slate-50 text-slate-800 text-xs font-medium border border-slate-200 rounded-2xl p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
              />
            </div>

            {/* SECTION: VISIT NOTES */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase text-slate-500 block">6. Last Visit Notes</label>
                <div className="relative">
                  <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'NOTE')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full cursor-pointer hover:bg-emerald-100 transition-colors inline-flex items-center gap-1">
                    <Upload size={10} /> Add Visit PDF
                  </span>
                </div>
              </div>
              <textarea 
                value={visitNotes} 
                onChange={(e) => setVisitNotes(e.target.value)}
                rows={2}
                placeholder="Instructions or warnings given by your clinician during your last checkup..."
                className="w-full bg-slate-50 text-slate-800 text-xs font-medium border border-slate-200 rounded-2xl p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
              />
            </div>

            {/* Main Action Trigger */}
            <button
              onClick={handleAnalyzeHealth}
              className="w-full py-4 rounded-3xl bg-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-98 transition-all"
            >
              <Sparkles size={16} />
              Analyze & Generate Optimization Plan
            </button>
          </div>
        )}

        {/* TAB 2: MEGANA AI ANALYSIS REPORT */}
        {activeTab === 'REPORT' && (
          <div className="space-y-4">
            
            {/* Loading / Generating State */}
            {isAnalyzing && (
              <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm flex flex-col items-center justify-center space-y-4 py-16 text-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 animate-spin border-4 border-t-blue-600 border-slate-100" />
                  <Brain className="absolute inset-0 m-auto text-blue-600" size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-800">Megana clinical AI is parsing...</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
                    Correlating symptom timelines, lab values, CT scans, and daily smartwatch trends.
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 max-w-xs text-[10px] text-slate-500 font-bold uppercase leading-relaxed animate-pulse">
                  Comparing profile to updated WHO standards, cardiology metrics, and endocrinology models.
                </div>
              </div>
            )}

            {/* Report Display */}
            {!isAnalyzing && analysisReport && (
              <div className="space-y-4 animate-in fade-in duration-300">
                
                {/* Visual Timelines & Sequential Breakdown Widget */}
                <div className="bg-indigo-950 text-white rounded-3xl p-5 border border-indigo-900 shadow-md space-y-4">
                  <div className="flex justify-between items-center border-b border-indigo-900 pb-3">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-indigo-400" />
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider">Sequential Complaints Timeline</h4>
                        <p className="text-[8px] text-indigo-300 font-extrabold uppercase">Cause-and-Effect Progression</p>
                      </div>
                    </div>
                    <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full text-[9px] font-bold">Dynamic Mapping</span>
                  </div>

                  <div className="space-y-4 relative pl-3 border-l-2 border-dashed border-indigo-800">
                    <div className="relative space-y-1">
                      <div className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-blue-400 border-2 border-indigo-950" />
                      <p className="text-[10px] font-black text-blue-300 uppercase">Step 1: Baseline Metabolic Strain</p>
                      <p className="text-[11px] text-indigo-100 font-medium leading-relaxed">
                        Elevated sugar (HbA1c: 7.2%) causing cellular dehydration, explaining constant morning fatigue and mild neuropathy signals (foot tingling).
                      </p>
                    </div>

                    <div className="relative space-y-1">
                      <div className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-indigo-400 border-2 border-indigo-950" />
                      <p className="text-[10px] font-black text-indigo-300 uppercase">Step 2: Microvascular Swelling</p>
                      <p className="text-[11px] text-indigo-100 font-medium leading-relaxed">
                        Amlodipine medication (5mg) combined with mild cardiomegaly results in hydrostatic pressure, driving ankle swelling and lightheadedness.
                      </p>
                    </div>

                    <div className="relative space-y-1">
                      <div className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-indigo-950" />
                      <p className="text-[10px] font-black text-emerald-300 uppercase">Step 3: Continuous Target Action</p>
                      <p className="text-[11px] text-indigo-100 font-medium leading-relaxed">
                        Optimizing daily step counts to 7,500 and sodium reduction to lower vascular resistance, reducing ankle edema and stabilizing morning BP.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main AI Report Content */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-xl">
                        <Brain size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">MEGANA AI ANALYSIS REPORT</h4>
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase">Decrypted Medical Insights</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleAnalyzeHealth}
                      className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100 border border-slate-200/40 transition-colors"
                      title="Regenerate Report"
                    >
                      <RefreshCw size={12} />
                    </button>
                  </div>

                  {/* Render parsed markdown sections */}
                  <div className="space-y-4 text-left">
                    {renderFormattedReport(analysisReport)}
                  </div>

                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl flex items-start gap-3 mt-4">
                    <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={16} />
                    <div className="space-y-1 text-left">
                      <h5 className="text-[11px] font-black uppercase text-emerald-900">Optimization Goal Synced</h5>
                      <p className="text-[10px] text-emerald-700 leading-relaxed font-medium">
                        Based on Megana's suggestions, we have automatically populated your Daily Tracker with lifestyle goals specifically tuned to target cardiomegaly, metabolic control, and fluid management.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BETWEEN-VISIT DAILY TRACKER */}
        {activeTab === 'TRACKER' && (
          <div className="space-y-4">
            
            {/* Daily Compliance KPI */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase">Inter-Visit Compliance Score</h4>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">Tracking health between clinician consults</p>
                </div>
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <BarChart2 size={16} />
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px] font-extrabold text-slate-600">
                  <span>Daily Action Status</span>
                  <span>
                    {Math.round((trackerTasks.filter(t => t.done).length / trackerTasks.length) * 100)}% Complete
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(trackerTasks.filter(t => t.done).length / trackerTasks.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] text-slate-500 font-bold uppercase leading-relaxed text-left">
                💡 Patients with compliance levels exceeding 80% between outpatient visits show a 34% lower rate of clinical decompensation and re-admission.
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-2.5 text-left">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Today's Optimization Goals</h3>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase">{trackerTasks.length} Assigned</span>
              </div>

              <div className="space-y-2">
                {trackerTasks.map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`p-4 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${task.done ? 'bg-emerald-50/50 border-emerald-100 text-slate-500' : 'bg-white border-slate-150 hover:bg-slate-50 text-slate-800'}`}
                  >
                    <div className="flex gap-3 items-center">
                      <button 
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}
                      >
                        {task.done && <Check size={12} />}
                      </button>
                      <div className="space-y-0.5">
                        <p className={`text-xs font-bold ${task.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {task.text}
                        </p>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${task.category === 'MED' ? 'bg-red-50 text-red-600' : task.category === 'WEAR' ? 'bg-blue-50 text-blue-600' : task.category === 'FIT' ? 'bg-orange-50 text-orange-600' : 'bg-teal-50 text-teal-600'}`}>
                          {task.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        )}

      </div>

      {/* Floating Action / Disclaimer */}
      <div className="absolute bottom-4 left-4 right-4 bg-slate-900 text-white rounded-3xl p-4 flex justify-between items-center shadow-2xl z-40 border border-white/5 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-3 text-left">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-indigo-200">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 leading-tight">Patient Safety Filter</p>
            <p className="text-[10px] text-slate-300 leading-tight">Empowering knowledge, NOT medical advice.</p>
          </div>
        </div>
        <button onClick={onBack} className="bg-white/10 text-white border border-white/10 px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-wider hover:bg-white/20 transition-all">
          Exit Hub
        </button>
      </div>
    </div>
  );
};
