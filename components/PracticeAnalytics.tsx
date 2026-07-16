import React, { useState } from 'react';
import { 
  ArrowLeft, Users, Calendar, Award, TrendingUp, 
  UserCheck, Beaker, ShoppingBag, PieChart, Activity,
  ChevronRight, ArrowUpRight, ArrowDownRight, Clock,
  Share2, ExternalLink
} from 'lucide-react';
import { PrescriptionData } from '../types';

interface PracticeAnalyticsProps {
  onBack: () => void;
  savedPrescriptions: PrescriptionData[];
  onSyncClick?: () => void;
}

const PracticeAnalytics: React.FC<PracticeAnalyticsProps> = ({ onBack, savedPrescriptions, onSyncClick }) => {
  const [timeRange, setTimeRange] = useState<'WEEK' | 'MONTH' | 'YEAR'>('MONTH');

  // Baseline Historical Data
  const BASELINE_PATIENTS = 850;
  const totalClinicianRx = savedPrescriptions.length;
  const totalPatients = BASELINE_PATIENTS + totalClinicianRx;

  // Calculate Average Age
  const baseAgeSum = 850 * 38.5; // Average age of historical patients is 38.5
  const activeAgeSum = savedPrescriptions.reduce((acc, curr) => acc + (parseFloat(curr.age) || 35), 0);
  const averageAge = ((baseAgeSum + activeAgeSum) / totalPatients).toFixed(1);

  // Sex Pattern (Gender Distribution)
  const baseMale = 412;
  const baseFemale = 428;
  const baseOther = 10;
  const activeMale = savedPrescriptions.filter(p => p.gender === 'Male').length;
  const activeFemale = savedPrescriptions.filter(p => p.gender === 'Female').length;
  const activeOther = savedPrescriptions.filter(p => p.gender !== 'Male' && p.gender !== 'Female').length;
  
  const maleCount = baseMale + activeMale;
  const femaleCount = baseFemale + activeFemale;
  const otherCount = baseOther + activeOther;
  const malePercentage = ((maleCount / totalPatients) * 100).toFixed(0);
  const femalePercentage = ((femaleCount / totalPatients) * 100).toFixed(0);
  const otherPercentage = ((otherCount / totalPatients) * 100).toFixed(0);

  // Visit Breakdown (First Time vs Follow up)
  // First-time patients are those without a follow-up history or explicitly marked. 
  // Let's assume 65% are new, 35% are follow-up historically
  const baseNew = 552;
  const baseFollowUp = 298;
  
  // For saved prescriptions, we check if followUpDate is provided to determine active session patterns
  const activeNew = savedPrescriptions.filter(p => !p.followUpDate).length;
  const activeFollowUp = savedPrescriptions.filter(p => p.followUpDate).length;

  const totalNew = baseNew + activeNew;
  const totalFollowUp = baseFollowUp + activeFollowUp;
  const newPercentage = ((totalNew / totalPatients) * 100).toFixed(0);
  const followUpPercentage = ((totalFollowUp / totalPatients) * 100).toFixed(0);

  // Diagnostic Test Opt-In Rate (checking investigations or labReport)
  const baseTests = 340; // 40% historical rate
  const activeTests = savedPrescriptions.filter(p => p.investigations || p.labReport).length;
  const totalTests = baseTests + activeTests;
  const testOptInRate = ((totalTests / totalPatients) * 100).toFixed(1);

  // Medicine Purchase / Pharmacy Fill Rate
  const basePharmacy = 714; // 84% historical rate
  const activePharmacy = savedPrescriptions.filter(p => p.medications && p.medications.length > 0).length;
  const totalPharmacy = basePharmacy + activePharmacy;
  const pharmacyFillRate = ((totalPharmacy / totalPatients) * 100).toFixed(1);

  // Patient Referrals & Referral Center Analytics
  const baseReferrals = 48;
  const activeReferrals = savedPrescriptions.filter(p => p.isReferred).length;
  const totalReferrals = baseReferrals + activeReferrals;
  const referralRate = ((totalReferrals / totalPatients) * 100).toFixed(1);

  const getReferralCenterStats = () => {
    let counts: Record<string, number> = {
      "AIIMS, New Delhi": 18,
      "Safdarjung Hospital, New Delhi": 14,
      "Ram Manohar Lohia (RML) Hospital, Delhi": 8,
      "Lok Nayak Jai Prakash (LNJP) Hospital, Delhi": 5,
      "National Institute of TB & Respiratory Diseases (NITRD), New Delhi": 3,
    };

    savedPrescriptions.forEach(p => {
      if (p.isReferred && p.referredCenter) {
        counts[p.referredCenter] = (counts[p.referredCenter] || 0) + 1;
      }
    });

    const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts).map(([name, val]) => ({
      name,
      val,
      percentage: ((val / totalCount) * 100).toFixed(0)
    })).sort((a, b) => b.val - a.val);
  };

  const referralCenters = getReferralCenterStats();
  const referredPatients = savedPrescriptions.filter(p => p.isReferred);

  // Disease Patterns (Distribution across practice)
  const diseaseDistribution = () => {
    let counts = {
      "Influenza (Flu)": 240,
      "Hypertension (BP)": 215,
      "Diabetes Mellitus": 190,
      "Gastroenteritis": 180,
      "Coronary Artery (CAD)": 145,
      "COVID-19": 120,
      "Dengue Vector": 110,
      "Typhoid (Enteric)": 95,
      "COPD & Asthma": 85,
      "Tuberculosis (TB)": 65,
      "Malaria Vector": 40,
    };

    savedPrescriptions.forEach(p => {
      const d = (p.diagnosis || '').toLowerCase();
      const s = (p.symptoms || '').toLowerCase();
      if (d.includes('covid') || d.includes('corona')) counts["COVID-19"] += 1;
      else if (d.includes('flu') || d.includes('influenza')) counts["Influenza (Flu)"] += 1;
      else if (d.includes('diarrh') || d.includes('gastro') || s.includes('loose')) counts["Gastroenteritis"] += 1;
      else if (d.includes('tb') || d.includes('tuber')) counts["Tuberculosis (TB)"] += 1;
      else if (d.includes('typh') || d.includes('enteric')) counts["Typhoid (Enteric)"] += 1;
      else if (d.includes('dengue')) counts["Dengue Vector"] += 1;
      else if (d.includes('malaria')) counts["Malaria Vector"] += 1;
      else if (d.includes('diabet') || d.includes('dm') || d.includes('hyperglyc') || d.includes('sugar')) counts["Diabetes Mellitus"] += 1;
      else if (d.includes('hyperten') || d.includes('htn') || d.includes('blood pressure') || d.includes('bp') || d.includes('cardio')) counts["Hypertension (BP)"] += 1;
      else if (d.includes('copd') || d.includes('asthma') || d.includes('bronch') || d.includes('emphys') || d.includes('respirat')) counts["COPD & Asthma"] += 1;
      else if (d.includes('cad') || d.includes('coronary') || d.includes('ischemic') || d.includes('angina') || d.includes('myocardial')) counts["Coronary Artery (CAD)"] += 1;
    });

    const totalAll = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts).map(([name, val]) => {
      const isNCD = name.includes('Hypertension') || name.includes('Diabetes') || name.includes('COPD') || name.includes('Coronary');
      return {
        name,
        val,
        isNCD,
        percentage: ((val / totalAll) * 100).toFixed(0)
      };
    }).sort((a, b) => b.val - a.val);
  };

  const diseases = diseaseDistribution();

  // Multi-week visit trend line coordinates (last 6 months)
  const visitTrend = [180, 210, 195, 240, 280, 320 + totalClinicianRx];

  // Render Elegant Trend Chart
  const renderTrendSVG = () => {
    const width = 420;
    const height = 140;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = Math.max(...visitTrend) * 1.15;
    const minVal = Math.min(...visitTrend) * 0.85;
    const valRange = maxVal - minVal;

    const points = visitTrend.map((val, index) => {
      const x = padding + (index / (visitTrend.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((val - minVal) / valRange) * chartHeight;
      return { x, y, val, label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index] };
    });

    const pathD = points.reduce((acc, p, index) => {
      return acc + `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
    }, '');

    const areaD = pathD + `L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding + chartHeight * ratio;
          return (
            <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1f5f9" strokeWidth="1" />
          );
        })}

        {/* Area */}
        <path d={areaD} fill="url(#visGrad)" />

        {/* Trend line */}
        <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots & Labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
            <text x={p.x} y={height - 2} fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle">
              {p.label}
            </text>
            <text x={p.x} y={p.y - 10} fill="#1e293b" fontSize="8" fontWeight="black" textAnchor="middle">
              {p.val}
            </text>
          </g>
        ))}
      </svg>
    );
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
            <h2 className="font-bold text-slate-800 text-base">Practice Intelligence</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinical KPI Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-slate-100 border border-slate-200 rounded-full px-3 py-1.5 text-xs font-bold text-slate-600 outline-none cursor-pointer"
          >
            <option value="WEEK">This Week</option>
            <option value="MONTH">This Month</option>
            <option value="YEAR">This Year</option>
          </select>
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

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {/* Prime KPI Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[2rem] p-5 shadow-lg relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <span className="bg-white/20 p-2 rounded-xl inline-block">
                <Users size={16} />
              </span>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Total Patients</p>
              <h3 className="text-3xl font-black">{totalPatients}</h3>
              <p className="text-[9px] font-bold text-blue-100 flex items-center gap-1">
                <ArrowUpRight size={12} className="text-emerald-300" />
                +12.4% vs last {timeRange.toLowerCase()}
              </p>
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
          </div>

          <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-2">
              <span className="bg-slate-100 p-2 rounded-xl inline-block text-slate-700">
                <Clock size={16} />
              </span>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Average Patient Age</p>
              <h3 className="text-3xl font-black text-slate-800">{averageAge} <span className="text-xs text-slate-400">Yrs</span></h3>
            </div>
            <p className="text-[9px] font-bold text-slate-400 mt-2">Active practice demographic baseline</p>
          </div>
        </div>

        {/* Sex Pattern & Visit Breakdown */}
        <div className="bg-white rounded-[2.5rem] p-5 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Demographic & Visit Patterns</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Gender Pie Distribution */}
            <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100/80 space-y-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Gender Distribution</span>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Male</span>
                  <span className="font-extrabold text-slate-800">{malePercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ width: `${malePercentage}%` }} />
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Female</span>
                  <span className="font-extrabold text-slate-800">{femalePercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full" style={{ width: `${femalePercentage}%` }} />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Other</span>
                  <span className="font-extrabold text-slate-800">{otherPercentage}%</span>
                </div>
              </div>
            </div>

            {/* Visit breakdown (First time vs Follow-up) */}
            <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100/80 space-y-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Visit Types</span>
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-semibold text-slate-700">First-Time</div>
                  <div className="text-xs font-black text-slate-800">{newPercentage}%</div>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: `${newPercentage}%` }} />
                  <div className="bg-indigo-500 h-full" style={{ width: `${followUpPercentage}%` }} />
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs font-semibold text-slate-700">Follow-Up</div>
                  <div className="text-xs font-black text-indigo-600">{followUpPercentage}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Volume Trend */}
        <div className="bg-white rounded-[2.5rem] p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Patient Visit Volume Trend</h3>
              <p className="text-lg font-black text-slate-800 mt-1">Practice Footfall</p>
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <TrendingUp size={12} /> Rising
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            {renderTrendSVG()}
          </div>
        </div>

        {/* Operational Flow & Integrations: Tests Opted, Medicine Purchased */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm space-y-2">
            <span className="bg-purple-50 text-purple-600 p-2 rounded-xl inline-block">
              <Beaker size={16} />
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Diagnostic Opt-In</span>
            <h4 className="text-2xl font-black text-slate-800">{testOptInRate}%</h4>
            <p className="text-[10px] text-slate-500 leading-tight">Patients prescribed labs or scans</p>
          </div>

          <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm space-y-2">
            <span className="bg-emerald-50 text-emerald-600 p-2 rounded-xl inline-block">
              <ShoppingBag size={16} />
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Rx Pharmacy Fill</span>
            <h4 className="text-2xl font-black text-slate-800">{pharmacyFillRate}%</h4>
            <p className="text-[10px] text-slate-500 leading-tight">Prescriptions with filled medications</p>
          </div>
        </div>

        {/* Disease Patterns (Practice Disease Map) */}
        <div className="bg-white rounded-[2.5rem] p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Clinical Case & Disease Map</h3>
              <p className="text-sm font-extrabold text-slate-800 mt-1">Diagnosis Frequency</p>
            </div>
            <Activity className="text-blue-500" size={16} />
          </div>

          <div className="space-y-3">
            {diseases.map((dis, idx) => {
              const bgColors = ['bg-amber-500', 'bg-indigo-600', 'bg-emerald-600', 'bg-blue-600', 'bg-pink-600', 'bg-red-500', 'bg-rose-500', 'bg-purple-600', 'bg-teal-600', 'bg-cyan-600'];
              const col = bgColors[idx % bgColors.length];
              return (
                <div key={dis.name} className="space-y-1.5 p-2 bg-slate-50/40 rounded-xl border border-slate-100/30">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-700 font-extrabold flex items-center gap-1.5">
                      {dis.name}
                      <span className={`text-[8px] px-1.5 py-0.2 rounded font-black uppercase tracking-wider ${dis.isNCD ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/50' : 'bg-amber-50 text-amber-700 border border-amber-100/50'}`}>
                        {dis.isNCD ? 'Chronic NCD' : 'Infectious'}
                      </span>
                    </span>
                    <span className="text-slate-500 font-bold">{dis.val} cases ({dis.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${col} h-full rounded-full transition-all duration-500`} style={{ width: `${dis.percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Referral and Transfer Network Analytics */}
        <div className="bg-white rounded-[2.5rem] p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Referrals & Transfer Metrics</h3>
              <p className="text-lg font-black text-slate-800 mt-1">Referred Cases & Destinations</p>
            </div>
            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <Share2 size={12} /> External Care
            </span>
          </div>

          {/* Quick Metrics Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100/80 space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Referred</span>
              <h4 className="text-xl font-black text-slate-800">{totalReferrals} patients</h4>
              <p className="text-[9px] text-slate-400">Transferred to specialized care</p>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100/80 space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Referral Rate</span>
              <h4 className="text-xl font-black text-slate-800">{referralRate}%</h4>
              <p className="text-[9px] text-slate-400">Of total registered cases</p>
            </div>
          </div>

          {/* Hospital/Center breakdown */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Referral Destination Share</h4>
            <div className="space-y-2">
              {referralCenters.map((cent, idx) => {
                const bgColors = ['bg-indigo-600', 'bg-blue-600', 'bg-amber-500', 'bg-emerald-600', 'bg-purple-600', 'bg-rose-600', 'bg-teal-600'];
                const col = bgColors[idx % bgColors.length];
                return (
                  <div key={cent.name} className="space-y-1.5 p-2 bg-slate-50/50 rounded-xl border border-slate-100/40">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-700 font-extrabold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        {cent.name}
                      </span>
                      <span className="text-slate-500 font-bold">{cent.val} cases ({cent.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className={`${col} h-full rounded-full transition-all duration-500`} style={{ width: `${cent.percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Referred patients case list */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Referred Patient Logs (Clinical Diagnosis)</h4>
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {referredPatients.length > 0 ? (
                referredPatients.map((pat, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/30 border border-amber-100/50 rounded-2xl flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        {pat.patientName} <span className="text-[10px] font-bold text-slate-400">({pat.age}y, {pat.gender})</span>
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <ExternalLink size={10} /> Referred
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 bg-white/65 px-2.5 py-1.5 rounded-xl border border-slate-100">
                      <strong className="text-[9px] text-slate-400 uppercase block tracking-wider">Clinical Diagnosis</strong>
                      <span className="font-semibold text-slate-700">{pat.diagnosis || "No diagnosis entered"}</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1 px-1">
                      <span className="text-slate-400">Referral Center:</span>
                      <span className="text-amber-800 font-black">{pat.referredCenter || "General Specialist Center"}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-400">No active referred cases recorded in this session.</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Toggle "Refer Patient" during prescription generation to test real-time mapping.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeAnalytics;
