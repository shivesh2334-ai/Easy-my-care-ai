import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, MapPin, AlertTriangle, Activity, 
  TrendingUp, TrendingDown, RefreshCw, Sparkles, 
  Loader2, Brain, Calendar, ShieldCheck, CheckCircle2, User, Share2
} from 'lucide-react';
import { PrescriptionData } from '../types';
import { predictOutbreaks } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface PublicSurveillanceProps {
  onBack: () => void;
  savedPrescriptions: PrescriptionData[];
  onSyncClick?: () => void;
}

interface LocationData {
  name: string;
  authority: string;
  warning: string;
  alertLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  covidTrend: number[];
  influenzaTrend: number[];
  diarrhoeaTrend: number[];
  tbTrend: number[];
  typhoidTrend: number[];
  dengueTrend: number[];
  malariaTrend: number[];
  diabetesTrend: number[];
  hypertensionTrend: number[];
  copdTrend: number[];
  cadTrend: number[];
}

const LOCATIONS: Record<string, LocationData> = {
  'Delhi NCR (MoHFW)': {
    name: 'Delhi NCR (MoHFW)',
    authority: 'Ministry of Health & Family Welfare (MoHFW), India',
    warning: 'Ministry of Health and Family Welfare (MoHFW) advises immediate clinical vigilance across Delhi NCR. A 20% week-over-week rise in H3N2 Influenza, Dengue serotype-2 vectors, and COVID-19 JN.1 subvariants has been recorded. Tuberculosis detection and DOTS enforcement are prioritized.',
    alertLevel: 'HIGH',
    covidTrend: [150, 180, 220, 290, 380, 450, 510, 590],
    influenzaTrend: [120, 140, 160, 180, 210, 240, 260, 290],
    diarrhoeaTrend: [90, 110, 105, 120, 115, 130, 142, 140],
    tbTrend: [320, 330, 315, 340, 325, 350, 362, 380],
    typhoidTrend: [80, 95, 110, 130, 145, 160, 185, 210],
    dengueTrend: [40, 65, 95, 140, 210, 310, 450, 580],
    malariaTrend: [30, 35, 42, 50, 65, 82, 105, 125],
    diabetesTrend: [450, 465, 480, 510, 530, 550, 570, 595],
    hypertensionTrend: [610, 625, 640, 655, 680, 710, 730, 760],
    copdTrend: [140, 155, 180, 210, 240, 275, 310, 345],
    cadTrend: [280, 295, 310, 325, 340, 360, 385, 410]
  },
  'Delhi NCR (WHO)': {
    name: 'Delhi NCR (WHO)',
    authority: 'World Health Organization (WHO) India Office',
    warning: 'WHO SEARO sentinel labs report localized clusters of enteric pathogens (Typhoid and Diarrhoeal vectors) and co-circulating respiratory viruses in Delhi NCR. Urgent strengthening of water chlorination systems and active pediatric fever triaging is strongly recommended.',
    alertLevel: 'CRITICAL',
    covidTrend: [180, 170, 160, 150, 130, 110, 95, 80],
    influenzaTrend: [80, 110, 150, 220, 310, 420, 530, 640],
    diarrhoeaTrend: [140, 160, 190, 250, 340, 450, 560, 680],
    tbTrend: [410, 400, 395, 380, 370, 360, 355, 340],
    typhoidTrend: [110, 125, 140, 175, 210, 260, 310, 370],
    dengueTrend: [25, 45, 75, 120, 190, 280, 410, 550],
    malariaTrend: [15, 22, 35, 55, 80, 115, 160, 210],
    diabetesTrend: [520, 535, 540, 555, 570, 585, 600, 615],
    hypertensionTrend: [720, 735, 740, 755, 770, 790, 810, 830],
    copdTrend: [180, 190, 205, 220, 240, 260, 285, 310],
    cadTrend: [310, 320, 335, 350, 365, 380, 395, 415]
  },
  'Delhi NCR (ICMR)': {
    name: 'Delhi NCR (ICMR)',
    authority: 'Indian Council of Medical Research (ICMR)',
    warning: 'ICMR National Influenza Surveillance network warns of a dual peak in vector-borne Dengue/Malaria and water-borne Typhoid/Acute Diarrhoea in Delhi NCR. Clinicians are urged to practice rational antibiotic prescriptions and advise rapid antigen tests early.',
    alertLevel: 'MEDIUM',
    covidTrend: [110, 120, 115, 130, 125, 120, 118, 122],
    influenzaTrend: [150, 160, 155, 148, 152, 158, 162, 160],
    diarrhoeaTrend: [220, 250, 290, 340, 410, 490, 580, 620],
    tbTrend: [280, 290, 295, 305, 312, 320, 325, 335],
    typhoidTrend: [130, 140, 145, 160, 175, 190, 210, 230],
    dengueTrend: [50, 70, 100, 150, 220, 320, 440, 590],
    malariaTrend: [25, 30, 38, 48, 60, 75, 92, 110],
    diabetesTrend: [400, 420, 445, 470, 495, 520, 550, 580],
    hypertensionTrend: [590, 610, 630, 650, 680, 710, 740, 770],
    copdTrend: [120, 135, 150, 170, 195, 225, 260, 300],
    cadTrend: [240, 255, 275, 290, 310, 330, 350, 375]
  }
};

const PublicSurveillance: React.FC<PublicSurveillanceProps> = ({ onBack, savedPrescriptions, onSyncClick }) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('Delhi NCR (MoHFW)');
  const [activeDisease, setActiveDisease] = useState<'COVID' | 'FLU' | 'DIARRHOEA' | 'TB' | 'TYPHOID' | 'DENGUE' | 'MALARIA' | 'DIABETES' | 'HYPERTENSION' | 'COPD' | 'CAD'>('COVID');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const locData = LOCATIONS[selectedLocation];

  // Map saved prescriptions into matching local disease counts for current week
  const getPrescriptionSentinelCases = () => {
    return savedPrescriptions.filter(p => {
      const diag = (p.diagnosis || '').toLowerCase();
      const symp = (p.symptoms || '').toLowerCase();
      
      if (activeDisease === 'COVID' && (diag.includes('covid') || diag.includes('corona'))) return true;
      if (activeDisease === 'FLU' && (diag.includes('flu') || diag.includes('influenza'))) return true;
      if (activeDisease === 'DIARRHOEA' && (diag.includes('diarrh') || diag.includes('gastro') || diag.includes('stomach') || symp.includes('vomit') || symp.includes('loose'))) return true;
      if (activeDisease === 'TB' && (diag.includes('tb') || diag.includes('tuber') || (diag.includes('cough') && diag.includes('blood')))) return true;
      if (activeDisease === 'TYPHOID' && (diag.includes('typh') || diag.includes('enteric') || diag.includes('salmonella'))) return true;
      if (activeDisease === 'DENGUE' && (diag.includes('dengue') || diag.includes('breakbone'))) return true;
      if (activeDisease === 'MALARIA' && (diag.includes('malaria') || diag.includes('plasmodium'))) return true;
      if (activeDisease === 'DIABETES' && (diag.includes('diabet') || diag.includes('dm') || diag.includes('hyperglyc') || diag.includes('sugar'))) return true;
      if (activeDisease === 'HYPERTENSION' && (diag.includes('hyperten') || diag.includes('htn') || diag.includes('blood pressure') || diag.includes('bp') || diag.includes('cardio'))) return true;
      if (activeDisease === 'COPD' && (diag.includes('copd') || diag.includes('asthma') || diag.includes('bronch') || diag.includes('emphys') || diag.includes('respirat'))) return true;
      if (activeDisease === 'CAD' && (diag.includes('cad') || diag.includes('coronary') || diag.includes('heart') || diag.includes('ischemic') || diag.includes('angina') || diag.includes('myocardial'))) return true;
      return false;
    });
  };

  const sentinelCases = getPrescriptionSentinelCases();

  // Dynamically calculate trends (last element is baseline + local sentinel cases)
  const getDynamicTrend = (disease: 'COVID' | 'FLU' | 'DIARRHOEA' | 'TB' | 'TYPHOID' | 'DENGUE' | 'MALARIA' | 'DIABETES' | 'HYPERTENSION' | 'COPD' | 'CAD') => {
    let baseTrend = [];
    switch (disease) {
      case 'COVID': baseTrend = [...locData.covidTrend]; break;
      case 'FLU': baseTrend = [...locData.influenzaTrend]; break;
      case 'DIARRHOEA': baseTrend = [...locData.diarrhoeaTrend]; break;
      case 'TB': baseTrend = [...locData.tbTrend]; break;
      case 'TYPHOID': baseTrend = [...locData.typhoidTrend]; break;
      case 'DENGUE': baseTrend = [...locData.dengueTrend]; break;
      case 'MALARIA': baseTrend = [...locData.malariaTrend]; break;
      case 'DIABETES': baseTrend = [...locData.diabetesTrend]; break;
      case 'HYPERTENSION': baseTrend = [...locData.hypertensionTrend]; break;
      case 'COPD': baseTrend = [...locData.copdTrend]; break;
      case 'CAD': baseTrend = [...locData.cadTrend]; break;
    }

    // Add clinician's local prescriptions count to the current week's total to demonstrate interactive live sync
    const matchingCount = savedPrescriptions.filter(p => {
      const diag = (p.diagnosis || '').toLowerCase();
      const symp = (p.symptoms || '').toLowerCase();
      if (disease === 'COVID') return diag.includes('covid') || diag.includes('corona');
      if (disease === 'FLU') return diag.includes('flu') || diag.includes('influenza');
      if (disease === 'DIARRHOEA') return diag.includes('diarrh') || diag.includes('gastro') || symp.includes('vomit') || symp.includes('loose');
      if (disease === 'TB') return diag.includes('tb') || diag.includes('tuber') || (diag.includes('cough') && diag.includes('blood'));
      if (disease === 'TYPHOID') return diag.includes('typh') || diag.includes('enteric') || diag.includes('salmonella');
      if (disease === 'DENGUE') return diag.includes('dengue') || diag.includes('breakbone');
      if (disease === 'MALARIA') return diag.includes('malaria') || diag.includes('plasmodium');
      if (disease === 'DIABETES') return diag.includes('diabet') || diag.includes('dm') || diag.includes('hyperglyc') || diag.includes('sugar');
      if (disease === 'HYPERTENSION') return diag.includes('hyperten') || diag.includes('htn') || diag.includes('blood pressure') || diag.includes('bp') || diag.includes('cardio');
      if (disease === 'COPD') return diag.includes('copd') || diag.includes('asthma') || diag.includes('bronch') || diag.includes('emphys') || diag.includes('respirat');
      if (disease === 'CAD') return diag.includes('cad') || diag.includes('coronary') || diag.includes('heart') || diag.includes('ischemic') || diag.includes('angina') || diag.includes('myocardial');
      return false;
    }).length;

    baseTrend[baseTrend.length - 1] += matchingCount;
    return baseTrend;
  };

  const currentTrend = getDynamicTrend(activeDisease);
  const previousWeekVal = currentTrend[currentTrend.length - 2];
  const currentWeekVal = currentTrend[currentTrend.length - 1];
  const percentChange = ((currentWeekVal - previousWeekVal) / previousWeekVal) * 100;

  // Run AI Predictor Simulation
  const handleRunAIPrediction = async () => {
    setIsAiLoading(true);
    setAiReport(null);
    try {
      const recentDiagnoses = savedPrescriptions.map(p => `${p.patientName} (${p.age}${p.gender[0]}): ${p.diagnosis || p.symptoms}`);
      const report = await predictOutbreaks(
        selectedLocation,
        {
          covidCases: locData.covidTrend.slice(-4),
          influenzaCases: locData.influenzaTrend.slice(-4),
          diarrhoeaCases: locData.diarrhoeaTrend.slice(-4),
          tbCases: locData.tbTrend.slice(-4),
          typhoidCases: locData.typhoidTrend.slice(-4),
          dengueCases: locData.dengueTrend.slice(-4),
          malariaCases: locData.malariaTrend.slice(-4),
          diabetesCases: locData.diabetesTrend.slice(-4),
          hypertensionCases: locData.hypertensionTrend.slice(-4),
          copdCases: locData.copdTrend.slice(-4),
          cadCases: locData.cadTrend.slice(-4)
        },
        recentDiagnoses,
        locData.warning
      );

      setAiReport(report);
    } catch (err) {
      console.error(err);
      setAiReport("Failed to generate predictive intelligence report. Please check server settings.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const getDiseaseColor = (disease: 'COVID' | 'FLU' | 'DIARRHOEA' | 'TB' | 'TYPHOID' | 'DENGUE' | 'MALARIA' | 'DIABETES' | 'HYPERTENSION' | 'COPD' | 'CAD') => {
    switch (disease) {
      case 'COVID': return '#2563eb'; // blue
      case 'FLU': return '#d97706'; // orange
      case 'DIARRHOEA': return '#059669'; // emerald
      case 'TB': return '#7c3aed'; // purple
      case 'TYPHOID': return '#e11d48'; // rose
      case 'DENGUE': return '#dc2626'; // red
      case 'MALARIA': return '#0d9488'; // teal
      case 'DIABETES': return '#4f46e5'; // indigo
      case 'HYPERTENSION': return '#db2777'; // pink
      case 'COPD': return '#0891b2'; // cyan
      case 'CAD': return '#e11d48'; // crimson rose
      default: return '#3b82f6';
    }
  };

  // Helper for rendering high-contrast SVG trend graph
  const renderSVGChart = () => {
    const width = 400;
    const height = 180;
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = Math.max(...currentTrend) * 1.15;
    const minVal = Math.min(...currentTrend) * 0.85;
    const valRange = maxVal - minVal;

    const points = currentTrend.map((val, index) => {
      const x = padding + (index / (currentTrend.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((val - minVal) / valRange) * chartHeight;
      return { x, y, val, label: `W${index + 1}` };
    });

    const pathD = points.reduce((acc, p, index) => {
      return acc + `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
    }, '');

    // Area path closed to bottom
    const areaD = pathD + `L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    const activeColor = getDiseaseColor(activeDisease);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + chartHeight * ratio;
          const val = Math.round(maxVal - ratio * valRange);
          return (
            <g key={i} className="opacity-15">
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
              <text x={padding - 6} y={y + 3} fill="#475569" fontSize="8" fontWeight="bold" textAnchor="end">{val}</text>
            </g>
          );
        })}

        {/* X axis labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={height - padding + 15} fill="#64748b" fontSize="8" fontWeight="black" textAnchor="middle">
            {p.label}
          </text>
        ))}

        {/* Area fill */}
        <path d={areaD} fill="url(#chartGrad)" opacity="0.12" />

        {/* Trend line */}
        <path d={pathD} fill="none" stroke={activeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i} className="group cursor-pointer">
            <circle cx={p.x} cy={p.y} r="4" fill={activeColor} stroke="#ffffff" strokeWidth="2" className="transition-all hover:scale-150" />
            <rect x={p.x - 18} y={p.y - 22} width="36" height="14" rx="4" fill="#0f172a" opacity="0" className="group-hover:opacity-90 transition-opacity" />
            <text x={p.x} y={p.y - 12} fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" opacity="0" className="group-hover:opacity-100 pointer-events-none transition-opacity">
              {p.val}
            </text>
          </g>
        ))}

        {/* Definitions for gradient */}
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={activeColor} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  const getAlertStyle = (level: string) => {
    switch (level) {
      case 'CRITICAL': return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', badge: 'bg-red-500 text-white animate-pulse', iconColor: 'text-red-600' };
      case 'HIGH': return { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', badge: 'bg-orange-500 text-white', iconColor: 'text-orange-600' };
      case 'MEDIUM': return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', badge: 'bg-amber-500 text-slate-900', iconColor: 'text-amber-600' };
      default: return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-500 text-white', iconColor: 'text-emerald-600' };
    }
  };

  const alertStyles = getAlertStyle(locData.alertLevel);

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 text-base">Surveillance AI</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Public Health Insights</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <MapPin size={13} className="text-blue-500 animate-bounce" />
            <select 
              value={selectedLocation} 
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent outline-none cursor-pointer pr-1 font-sans"
            >
              {Object.keys(LOCATIONS).map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          {onSyncClick && (
            <button 
              onClick={onSyncClick} 
              className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full border border-blue-100 transition-all flex items-center justify-center active:scale-95"
              title="Connect & Sync to Third Party Apps"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-4">
        {/* Healthcare Authority Warning Banner */}
        <div className={`p-4 rounded-3xl border ${alertStyles.bg} space-y-3`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-5 h-5 ${alertStyles.iconColor}`} />
              <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 font-sans">Healthcare Authority Alert</h3>
            </div>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${alertStyles.badge}`}>
              {locData.alertLevel} Risk
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {locData.warning}
          </p>
          <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold border-t border-slate-200/55 pt-2">
            <span>ISSUED BY: {locData.authority}</span>
            <span>UPDATED: Today</span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-extrabold text-slate-800">Disease Incidence</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">8-Week Epidemiological Trend</p>
            </div>
            {percentChange !== 0 && (
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black ${percentChange > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {percentChange > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
              </div>
            )}
          </div>

          {/* Disease Toggle Tabs (Premium Scrollable Capsules with Color Coordinated Badges) */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
            {([
              { id: 'COVID', name: 'COVID-19', activeClass: 'bg-blue-600 text-white border-blue-600' },
              { id: 'FLU', name: 'Influenza', activeClass: 'bg-amber-500 text-white border-amber-500' },
              { id: 'DIARRHOEA', name: 'Diarrhoea', activeClass: 'bg-emerald-600 text-white border-emerald-600' },
              { id: 'TB', name: 'Tuberculosis', activeClass: 'bg-purple-600 text-white border-purple-600' },
              { id: 'TYPHOID', name: 'Typhoid', activeClass: 'bg-rose-600 text-white border-rose-600' },
              { id: 'DENGUE', name: 'Dengue', activeClass: 'bg-red-600 text-white border-red-600' },
              { id: 'MALARIA', name: 'Malaria', activeClass: 'bg-teal-600 text-white border-teal-600' },
              { id: 'DIABETES', name: 'Diabetes Mellitus', activeClass: 'bg-indigo-600 text-white border-indigo-600' },
              { id: 'HYPERTENSION', name: 'Hypertension', activeClass: 'bg-pink-600 text-white border-pink-600' },
              { id: 'COPD', name: 'COPD & Asthma', activeClass: 'bg-cyan-600 text-white border-cyan-600' },
              { id: 'CAD', name: 'Coronary Artery (CAD)', activeClass: 'bg-rose-700 text-white border-rose-700' }
            ] as const).map(dis => (
              <button
                key={dis.id}
                onClick={() => setActiveDisease(dis.id)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-black tracking-wide border transition-all whitespace-nowrap ${
                  activeDisease === dis.id 
                    ? `${dis.activeClass} shadow-md scale-[1.03]` 
                    : 'bg-slate-100 text-slate-600 border-slate-200/60 hover:bg-slate-200/80'
                }`}
              >
                {dis.name}
              </button>
            ))}
          </div>

          {/* Graphical Representation */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            {renderSVGChart()}
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-50/75 p-3 rounded-2xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Previous Week</span>
              <p className="text-xl font-black text-slate-800 mt-1">{previousWeekVal}</p>
            </div>
            <div className="bg-slate-50/75 p-3 rounded-2xl border border-slate-100">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Week</span>
              <p className="text-xl font-black mt-1 transition-all duration-300" style={{ color: getDiseaseColor(activeDisease) }}>
                {currentWeekVal}
                {sentinelCases.length > 0 && (
                  <span className="text-xs font-bold text-emerald-600 ml-1">
                    (+{sentinelCases.length} Clinician Rx)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Sentinel Surveillance Feed from Clinician's Prescriptions */}
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">Local Sentinel Feed</h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Prescriptions Logged This Session</p>
          </div>

          {savedPrescriptions.length > 0 ? (
            <div className="space-y-2.5">
              {savedPrescriptions.map((p, i) => {
                const diagLower = (p.diagnosis || '').toLowerCase();
                const sympLower = (p.symptoms || '').toLowerCase();
                
                const isRespiratory = diagLower.includes('covid') || diagLower.includes('corona') || diagLower.includes('flu') || diagLower.includes('influenza') || diagLower.includes('tb') || diagLower.includes('tuber') || sympLower.includes('cough');
                const isGastro = diagLower.includes('diarrh') || diagLower.includes('gastro') || diagLower.includes('vomit') || diagLower.includes('typh') || diagLower.includes('enteric');
                const isVector = diagLower.includes('dengue') || diagLower.includes('malaria') || diagLower.includes('plasmodium');
                const isNCD = diagLower.includes('diabet') || diagLower.includes('dm') || diagLower.includes('sugar') || diagLower.includes('hyperten') || diagLower.includes('htn') || diagLower.includes('bp') || diagLower.includes('cardio') || diagLower.includes('copd') || diagLower.includes('asthma') || diagLower.includes('heart') || diagLower.includes('cad') || diagLower.includes('coronary') || diagLower.includes('ischemic');
                
                let themeClasses = 'bg-blue-100 text-blue-600';
                if (isRespiratory) themeClasses = 'bg-orange-100 text-orange-600';
                else if (isGastro) themeClasses = 'bg-emerald-100 text-emerald-600';
                else if (isVector) themeClasses = 'bg-rose-100 text-rose-600';
                else if (isNCD) themeClasses = 'bg-indigo-100 text-indigo-600';

                return (
                  <div key={i} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-start gap-3 justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-xl mt-0.5 ${themeClasses}`}>
                        <User size={13} />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">{p.patientName || 'Anonymous'}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">{p.age || 'N/A'}{p.gender ? ` • ${p.gender}` : ''}</p>
                        <p className="text-[10px] text-slate-600 font-medium mt-1">
                          <span className="font-bold text-slate-800">Dx: </span>
                          {p.diagnosis || p.symptoms || 'General Checkup'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 shrink-0 flex items-center gap-1">
                      <CheckCircle2 size={9} /> Sentinel Reported
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-2xl">
              <Activity className="mx-auto text-slate-200 mb-2 animate-pulse" size={28} />
              <p className="text-[10px] font-bold text-slate-400 leading-tight">No sentinel clinical prescriptions logged yet.</p>
              <p className="text-[9px] text-slate-400 mt-1">Prescriptions saved with respiratory, enteric, vector-borne, or chronic non-communicable diagnoses will feed real-time outbreaks.</p>
            </div>
          )}
        </div>

        {/* AI Outbreak Predictor Intelligence Report */}
        <div className="bg-slate-900 text-white rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-white">AI Epidemic Predictive Model</h3>
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-0.5">CDC Sentinel Core</p>
              </div>
              <div className="bg-white/10 p-2.5 rounded-2xl">
                <Brain className="text-blue-400" size={20} />
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Analyze multi-week trend coordinates, live clinical diagnoses, and regional healthcare warnings using deep medical AI networks to forecast local viral epidemics.
            </p>

            <button
              onClick={handleRunAIPrediction}
              disabled={isAiLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {isAiLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Processing Epidemiological Analytics...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Run AI Predictive Simulation
                </>
              )}
            </button>

            {aiReport && (
              <div className="bg-white/10 rounded-3xl p-5 border border-white/5 max-h-[300px] overflow-y-auto text-xs leading-relaxed text-slate-200 space-y-3 font-sans scrollbar-hide">
                <div className="markdown-body text-slate-100 text-xs">
                  <ReactMarkdown>{aiReport}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
          <Sparkles className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 rotate-12 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default PublicSurveillance;
