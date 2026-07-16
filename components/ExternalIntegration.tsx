import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Database, Activity, TrendingUp, CheckCircle, 
  XCircle, RefreshCw, Settings, Code, Lock, Server, 
  Radio, Terminal, Clock, Send, ShieldAlert, Check, ChevronRight, Globe
} from 'lucide-react';
import { PrescriptionData } from '../types';

interface ExternalIntegrationProps {
  onBack: () => void;
  savedPrescriptions: PrescriptionData[];
}

interface SyncLog {
  id: string;
  timestamp: string;
  type: string;
  payloadSize: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  recordsSynced: number;
  txId: string;
}

const ExternalIntegration: React.FC<ExternalIntegrationProps> = ({ onBack, savedPrescriptions }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'DHIS2' | 'ABDM' | 'FHIR' | 'WEBHOOK'>('DHIS2');
  const [endpointUrl, setEndpointUrl] = useState('https://play.dhis2.org/demo/api/36/dataValueSets');
  const [apiKey, setApiKey] = useState('dhis2_admin:district_demo_2026');
  const [syncSchedule, setSyncSchedule] = useState<'MANUAL' | 'DAILY' | 'WEEKLY'>('DAILY');
  const [syncKPI, setSyncKPI] = useState(true);
  const [syncSurveillance, setSyncSurveillance] = useState(true);
  
  // Interactive testing states
  const [testStatus, setTestStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [testLogs, setTestLogs] = useState<string[]>([]);
  
  // Interactive manual sync states
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS' | 'FAILED'>('IDLE');
  const [syncProgress, setSyncProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'CONFIG' | 'PAYLOAD' | 'LOGS'>('CONFIG');

  // Static baseline state
  const BASELINE_PATIENTS = 850;
  const totalClinicianRx = savedPrescriptions.length;
  const totalPatients = BASELINE_PATIENTS + totalClinicianRx;

  // Disease calculations
  const calculateDiseaseCounts = () => {
    let counts = {
      covid: 120,
      flu: 240,
      gastro: 180,
      tb: 65,
      typhoid: 95,
      dengue: 110,
      malaria: 40,
      diabetes: 190,
      hypertension: 215,
      copd: 85,
      cad: 145,
    };

    savedPrescriptions.forEach(p => {
      const d = (p.diagnosis || '').toLowerCase();
      const s = (p.symptoms || '').toLowerCase();
      if (d.includes('covid') || d.includes('corona')) counts.covid += 1;
      else if (d.includes('flu') || d.includes('influenza')) counts.flu += 1;
      else if (d.includes('diarrh') || d.includes('gastro') || s.includes('loose')) counts.gastro += 1;
      else if (d.includes('tb') || d.includes('tuber')) counts.tb += 1;
      else if (d.includes('typh') || d.includes('enteric')) counts.typhoid += 1;
      else if (d.includes('dengue')) counts.dengue += 1;
      else if (d.includes('malaria')) counts.malaria += 1;
      else if (d.includes('diabet') || d.includes('dm') || d.includes('sugar')) counts.diabetes += 1;
      else if (d.includes('hyperten') || d.includes('htn') || d.includes('bp')) counts.hypertension += 1;
      else if (d.includes('copd') || d.includes('asthma')) counts.copd += 1;
      else if (d.includes('cad') || d.includes('coronary') || d.includes('ischemic') || d.includes('angina') || d.includes('myocardial')) counts.cad += 1;
    });

    return counts;
  };

  const diseaseCounts = calculateDiseaseCounts();

  // Simulated initial logs
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([
    {
      id: '1',
      timestamp: '2026-07-15 18:30:15',
      type: 'DHIS2 Surveillance',
      payloadSize: '2.8 KB',
      status: 'SUCCESS',
      recordsSynced: 12,
      txId: 'TXN-DH-87291A-2026'
    },
    {
      id: '2',
      timestamp: '2026-07-14 18:30:02',
      type: 'DHIS2 Surveillance',
      payloadSize: '2.7 KB',
      status: 'SUCCESS',
      recordsSynced: 11,
      txId: 'TXN-DH-87104B-2026'
    },
    {
      id: '3',
      timestamp: '2026-07-14 09:15:40',
      type: 'FHIR KPI Board',
      payloadSize: '4.2 KB',
      status: 'SUCCESS',
      recordsSynced: 8,
      txId: 'TXN-FH-92048X-2026'
    }
  ]);

  // Handle platform change and update sample endpoints
  const handlePlatformChange = (platform: 'DHIS2' | 'ABDM' | 'FHIR' | 'WEBHOOK') => {
    setSelectedPlatform(platform);
    setTestStatus('IDLE');
    setSyncStatus('IDLE');
    setTestLogs([]);
    
    switch (platform) {
      case 'DHIS2':
        setEndpointUrl('https://play.dhis2.org/demo/api/36/dataValueSets');
        setApiKey('dhis2_admin:district_demo_2026');
        break;
      case 'ABDM':
        setEndpointUrl('https://sandbox.abdm.gov.in/api/v2/surveillance/sync');
        setApiKey('abdm_facility_in_9829482');
        break;
      case 'FHIR':
        setEndpointUrl('https://healthcare.googleapis.com/v1/projects/emc-ai/locations/us-central1/datasets/fhir');
        setApiKey('gcp_service_account_oauth2_token');
        break;
      case 'WEBHOOK':
        setEndpointUrl('https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX');
        setApiKey('slack_token_secret');
        break;
    }
  };

  // Run Simulated Connection Test Handshake
  const runConnectionTest = () => {
    if (testStatus === 'TESTING') return;
    setTestStatus('TESTING');
    setTestLogs([]);

    const steps = [
      `[1/5] 🌐 Resolving DNS address for: ${new URL(endpointUrl).hostname}...`,
      `[2/5] 🔒 Establishing secure TLS 1.3 cryptographic handshake...`,
      `[3/5] 🛡️ Presenting credentials / API Token mapping...`,
      `[4/5] 🔌 Sending protocol-specific OPTIONS ping request...`,
      `[5/5] 🛰️ Active peer verification completed successfully.`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setTestLogs(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        setTestStatus('SUCCESS');
      }
    }, 700);
  };

  // Run Simulated Data Sync
  const runDataSync = () => {
    if (syncStatus === 'SYNCING') return;
    setSyncStatus('SYNCING');
    setSyncProgress(0);

    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSyncStatus('SUCCESS');
          
          // Add a new log to history
          const newLog: SyncLog = {
            id: Math.random().toString(),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            type: `${selectedPlatform} Sync (${syncKPI ? 'KPI' : ''}${syncKPI && syncSurveillance ? ' + ' : ''}${syncSurveillance ? 'Surveillance' : ''})`,
            payloadSize: selectedPlatform === 'FHIR' ? '5.4 KB' : '3.2 KB',
            status: 'SUCCESS',
            recordsSynced: totalClinicianRx + 5,
            txId: `TXN-${selectedPlatform.substring(0, 2)}-${Math.floor(Math.random() * 90000 + 10000)}Z-2026`
          };
          setSyncLogs(prevLogs => [newLog, ...prevLogs]);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Build FHIR and DHIS2 Dynamic JSON Payloads
  const getPayloadJSON = () => {
    if (selectedPlatform === 'FHIR') {
      return JSON.stringify({
        resourceType: "Bundle",
        id: "bundle-kpi-surveillance-sync",
        type: "transaction",
        timestamp: new Date().toISOString(),
        entry: [
          {
            fullUrl: "urn:uuid:practice-kpis",
            resource: {
              resourceType: "MeasureReport",
              id: "practice-kpi-summary",
              status: "complete",
              type: "summary",
              measure: "http://easy-my-care.ai/fhir/Measure/clinic-performance",
              period: {
                start: "2026-07-01",
                end: "2026-07-16"
              },
              group: [
                {
                  code: { coding: [{ system: "http://loinc.org", code: "74003-5", display: "Patient count" }] },
                  population: [{ code: { coding: [{ display: "total-patients" }] }, count: totalPatients }]
                },
                {
                  code: { coding: [{ display: "clinician-consultations-this-week" }] },
                  population: [{ code: { coding: [{ display: "active-encounters" }] }, count: totalClinicianRx }]
                }
              ]
            }
          },
          {
            fullUrl: "urn:uuid:surveillance-report",
            resource: {
              resourceType: "Observation",
              id: "surveillance-epidemiology",
              status: "final",
              code: {
                coding: [
                  { system: "http://loinc.org", code: "29308-4", display: "Public Health Surveillance" }
                ]
              },
              component: [
                {
                  code: { coding: [{ display: "Infectious-COVID-19" }] },
                  valueInteger: diseaseCounts.covid
                },
                {
                  code: { coding: [{ display: "Infectious-Influenza" }] },
                  valueInteger: diseaseCounts.flu
                },
                {
                  code: { coding: [{ display: "NCD-Coronary-Artery-Disease" }] },
                  valueInteger: diseaseCounts.cad
                },
                {
                  code: { coding: [{ display: "NCD-Hypertension" }] },
                  valueInteger: diseaseCounts.hypertension
                },
                {
                  code: { coding: [{ display: "NCD-Diabetes" }] },
                  valueInteger: diseaseCounts.diabetes
                }
              ]
            }
          }
        ]
      }, null, 2);
    } else if (selectedPlatform === 'DHIS2') {
      return JSON.stringify({
        dataSet: "easy_my_care_ai_surveillance_v1",
        completeDate: new Date().toISOString().substring(0, 10),
        period: "2026W29",
        orgUnit: "MoHFW_DELHI_HEALTH_POST_04",
        dataValues: [
          { dataElement: "COVID19_CASES_COUNT", value: diseaseCounts.covid },
          { dataElement: "INFLUENZA_CASES_COUNT", value: diseaseCounts.flu },
          { dataElement: "GASTROENTERITIS_CASES_COUNT", value: diseaseCounts.gastro },
          { dataElement: "TUBERCULOSIS_CASES_COUNT", value: diseaseCounts.tb },
          { dataElement: "DENGUE_VECTOR_CASES_COUNT", value: diseaseCounts.dengue },
          { dataElement: "CAD_CHRONIC_CASES_COUNT", value: diseaseCounts.cad },
          { dataElement: "HYPERTENSION_CHRONIC_CASES_COUNT", value: diseaseCounts.hypertension },
          { dataElement: "DIABETES_CHRONIC_CASES_COUNT", value: diseaseCounts.diabetes },
          { dataElement: "COPD_ASTHMA_CHRONIC_CASES_COUNT", value: diseaseCounts.copd },
          { dataElement: "TOTAL_CONSULTATIONS", value: totalClinicianRx }
        ]
      }, null, 2);
    } else if (selectedPlatform === 'ABDM') {
      return JSON.stringify({
        abdmVersion: "2.5.0",
        facilityRegistryId: "IN-FAC-92849",
        timestamp: new Date().toISOString(),
        publicHealthReport: {
          periodType: "WEEKLY",
          reportingUnit: "Delhi NCR Health Post",
          kpiMetrics: {
            activeRegisteredPatients: totalPatients,
            prescriptionsAuthorized: totalClinicianRx,
            referralsInitiated: savedPrescriptions.filter(p => p.isReferred).length
          },
          surveillanceMap: {
            vectorBorne: {
              dengue: diseaseCounts.dengue,
              malaria: diseaseCounts.malaria
            },
            airborneInfectious: {
              covid19: diseaseCounts.covid,
              influenza: diseaseCounts.flu,
              tuberculosis: diseaseCounts.tb
            },
            chronicNcd: {
              cardiovascularCAD: diseaseCounts.cad,
              hypertensionBP: diseaseCounts.hypertension,
              diabetesMellitus: diseaseCounts.diabetes
            }
          }
        }
      }, null, 2);
    } else {
      // Custom Webhook
      return JSON.stringify({
        text: "🚨 Easy My Care AI - Dynamic Analytics Sync Complete",
        attachments: [
          {
            title: "Clinic Performance & KPI Board Summary",
            color: "#4f46e5",
            fields: [
              { title: "Total Managed Lives", value: totalPatients, short: true },
              { title: "Active Consultations", value: totalClinicianRx, short: true }
            ]
          },
          {
            title: "Public Health Sentinel Highlights",
            color: "#e11d48",
            fields: [
              { title: "Coronary Artery Disease (CAD)", value: `${diseaseCounts.cad} cases`, short: true },
              { title: "Hypertension (BP)", value: `${diseaseCounts.hypertension} cases`, short: true },
              { title: "Diabetes Mellitus", value: `${diseaseCounts.diabetes} cases`, short: true },
              { title: "COVID-19 suspected", value: `${diseaseCounts.covid} cases`, short: true }
            ]
          }
        ]
      }, null, 2);
    }
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
            <h2 className="font-bold text-slate-800 text-base">EHR Interoperability</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Third-Party App Integration</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-extrabold uppercase">
          <Globe size={11} className="animate-spin" /> Live Hub
        </div>
      </div>

      {/* Hero Banner */}
      <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white relative overflow-hidden flex flex-col justify-between">
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
          <Database size={160} />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="bg-blue-500/20 text-blue-300 border border-blue-400/20 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-block">
            HL7 / FHIR & WHO Standards Compliant
          </div>
          <h1 className="text-lg font-black tracking-tight leading-tight">
            Connect & Share Medical Dashboards
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Seamlessly synchronize local Clinic Performance KPIs and sentinel Public Health Surveillance metrics directly with national repositories.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 bg-white border-b border-slate-200 flex">
        <button 
          onClick={() => setActiveTab('CONFIG')}
          className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'CONFIG' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
        >
          ⚙️ Setup API
        </button>
        <button 
          onClick={() => setActiveTab('PAYLOAD')}
          className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider border-b-2 transition-all ${activeTab === 'PAYLOAD' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
        >
          📊 Live Payload
        </button>
        <button 
          onClick={() => setActiveTab('LOGS')}
          className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider border-b-2 transition-all relative ${activeTab === 'LOGS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}
        >
          📜 Sync Logs
          <span className="absolute right-4 top-2 bg-slate-100 text-slate-600 text-[8px] font-black px-1.5 py-0.5 rounded-full border border-slate-200">
            {syncLogs.length}
          </span>
        </button>
      </div>

      {/* View Contents */}
      <div className="flex-1 overflow-y-auto p-4 pb-28 space-y-4">
        
        {activeTab === 'CONFIG' && (
          <>
            {/* Choose Platform */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-sm space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Interop Standard</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'DHIS2', name: 'DHIS2 HIMS', desc: 'WHO health database', icon: <Database size={16} /> },
                  { id: 'ABDM', name: 'ABDM India', desc: 'National sandbox', icon: <Server size={16} /> },
                  { id: 'FHIR', name: 'FHIR Client', desc: 'GCP HL7 pipeline', icon: <Radio size={16} /> },
                  { id: 'WEBHOOK', name: 'BI Webhook', desc: 'Custom Slack / BI Feed', icon: <Send size={16} /> }
                ].map((plat) => (
                  <button
                    key={plat.id}
                    onClick={() => handlePlatformChange(plat.id as any)}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${selectedPlatform === plat.id ? 'bg-blue-50 border-blue-500 shadow-sm text-blue-900' : 'bg-white border-slate-150 hover:bg-slate-50'}`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <div className={`p-1.5 rounded-lg ${selectedPlatform === plat.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {plat.icon}
                      </div>
                      {selectedPlatform === plat.id && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping" />}
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-extrabold">{plat.name}</p>
                      <p className="text-[9px] text-slate-400 font-medium leading-tight mt-0.5">{plat.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Config Fields */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Connection Parameter</h3>
                <Settings size={14} className="text-slate-400" />
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Destination Endpoint URL</label>
                  <input 
                    type="text" 
                    value={endpointUrl} 
                    onChange={(e) => setEndpointUrl(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 rounded-xl px-3.5 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Secure API Token / Auth Token</label>
                  <input 
                    type="password" 
                    value={apiKey} 
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 text-xs font-mono border border-slate-200 rounded-xl px-3.5 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">Synchronize Scope</label>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                        <input type="checkbox" checked={syncKPI} onChange={(e) => setSyncKPI(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                        <span>KPI Metrics</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                        <input type="checkbox" checked={syncSurveillance} onChange={(e) => setSyncSurveillance(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                        <span>Surveillance Map</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500">Auto-Sync Syncing</label>
                    <select 
                      value={syncSchedule} 
                      onChange={(e) => setSyncSchedule(e.target.value as any)}
                      className="w-full bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 rounded-xl px-2.5 py-2.5 outline-none cursor-pointer"
                    >
                      <option value="MANUAL">Manual Trigger</option>
                      <option value="DAILY">Every 24 Hours</option>
                      <option value="WEEKLY">Every 7 Days</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Connection Handshake */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Diagnostic API Handshake</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Validate security & ping peer</p>
                </div>
                <button 
                  onClick={runConnectionTest}
                  disabled={testStatus === 'TESTING'}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${testStatus === 'TESTING' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'}`}
                >
                  <RefreshCw size={11} className={testStatus === 'TESTING' ? 'animate-spin' : ''} />
                  Test Handshake
                </button>
              </div>

              {testStatus !== 'IDLE' && (
                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 font-mono text-[10px] space-y-1.5 text-slate-300">
                  {testLogs.map((log, index) => (
                    <div key={index} className="flex gap-2 items-start animate-in fade-in duration-200">
                      <span className="text-blue-400">⚡</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  
                  {testStatus === 'TESTING' && (
                    <div className="flex items-center gap-2 text-slate-400 pt-1.5 animate-pulse">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                      <span>Negotiating protocols...</span>
                    </div>
                  )}

                  {testStatus === 'SUCCESS' && (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold pt-2 border-t border-slate-800/80 mt-2">
                      <CheckCircle size={12} />
                      <span>HANDSHAKE SUCCESSFUL: HTTP/2 200 OK</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Direct Sync Action */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800">Manual Push Data Sync</h4>
                  <p className="text-[9px] text-slate-400 font-medium">Export raw data elements safely</p>
                </div>
                <button 
                  onClick={runDataSync}
                  disabled={syncStatus === 'SYNCING'}
                  className={`px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${syncStatus === 'SYNCING' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100'}`}
                >
                  <Send size={13} />
                  Sync Metrics Now
                </button>
              </div>

              {syncStatus === 'SYNCING' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Compressing & streaming schema...</span>
                    <span>{syncProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-200" style={{ width: `${syncProgress}%` }} />
                  </div>
                </div>
              )}

              {syncStatus === 'SUCCESS' && (
                <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl">
                  <div className="p-2 bg-emerald-500 text-white rounded-xl">
                    <Check size={16} />
                  </div>
                  <div>
                    <h5 className="text-xs font-black">Metrics Synced successfully!</h5>
                    <p className="text-[10px] text-emerald-600 font-bold">Reflected instantly in national registries & dashboards.</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'PAYLOAD' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Interoperable JSON Payload</h3>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">{selectedPlatform === 'FHIR' ? 'HL7 FHIR Bundle Resource' : `${selectedPlatform} Payload`}</p>
                </div>
                <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                  <Code size={14} />
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                This is the secure encrypted data packet transmitted to the third-party endpoint during sync. Notice how the cases dynamically sync with your local prescriptions:
              </p>

              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 overflow-x-auto max-h-[360px] overflow-y-auto scrollbar-hide">
                <pre className="font-mono text-[9px] text-emerald-400 leading-relaxed text-left whitespace-pre-wrap">
                  {getPayloadJSON()}
                </pre>
              </div>

              <div className="flex gap-2 items-center text-[10px] text-slate-500 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Lock size={12} className="text-slate-400" />
                <span>Payload encrypted with TLS 1.3 before transport.</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'LOGS' && (
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Sync Session Ledger</h3>
            
            <div className="space-y-2.5">
              {syncLogs.map((log) => (
                <div key={log.id} className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                        <Database size={15} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">{log.type}</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{log.txId}</p>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] font-black uppercase px-2 py-0.5 rounded-md">
                      {log.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-2.5 text-[10px] font-bold text-slate-500">
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase">Records Shared</p>
                      <p className="text-slate-700 mt-0.5 font-black">{log.recordsSynced} elements</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-400 uppercase">Packet Size</p>
                      <p className="text-slate-700 mt-0.5 font-black">{log.payloadSize}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-slate-400 uppercase">Timestamp</p>
                      <p className="text-slate-700 mt-0.5 font-black">{log.timestamp.split(' ')[1]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>

      {/* Floating Action Banner */}
      <div className="absolute bottom-4 left-4 right-4 bg-slate-900 text-white rounded-3xl p-4 flex justify-between items-center shadow-2xl z-40 border border-white/5 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-indigo-200">
            <Radio size={18} className="animate-pulse" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 leading-tight">Sync Interval Active</p>
            <p className="text-xs font-bold leading-tight">Auto-sync daily set to active</p>
          </div>
        </div>
        <button onClick={onBack} className="bg-white/10 text-white border border-white/10 px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-wider hover:bg-white/20 transition-all">
          Lounge
        </button>
      </div>
    </div>
  );
};

export default ExternalIntegration;
