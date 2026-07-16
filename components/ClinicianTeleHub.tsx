
import React, { useState } from 'react';
import { 
  ArrowLeft, Video, Mic, MicOff, VideoOff, Settings, 
  LogOut, User, MessageCircle, FileText, PlusCircle,
  Clock, CheckCircle2, PhoneIncoming, Sparkles, X
} from 'lucide-react';

interface ClinicianTeleHubProps {
  onBack: () => void;
  onStartPrescription: (patientName: string) => void;
}

const ClinicianTeleHub: React.FC<ClinicianTeleHubProps> = ({ onBack, onStartPrescription }) => {
  const [activeCall, setActiveCall] = useState<string | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const waitingPatients = [
    { id: '1', name: 'John Doe', time: '10:45 AM', status: 'Waiting', symptoms: 'Chronic Back Pain' },
    { id: '2', name: 'Sarah Smith', time: '11:15 AM', status: 'Scheduled', symptoms: 'Rash Follow-up' },
  ];

  const handleEndCall = () => {
    const patientName = activeCall;
    setActiveCall(null);
    if (patientName) onStartPrescription(patientName);
  };

  if (activeCall) {
    return (
      <div className="flex flex-col h-full bg-slate-900 text-white animate-in zoom-in duration-300">
        {/* Call Header */}
        <div className="p-4 flex justify-between items-center bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center border-2 border-blue-400">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm">{activeCall}</h3>
              <p className="text-[10px] text-green-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> 08:42 • Live Call
              </p>
            </div>
          </div>
          <button onClick={() => setActiveCall(null)} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative overflow-hidden bg-slate-800 flex items-center justify-center">
          {/* Simulated Patient Video */}
          <img 
            src={`https://picsum.photos/seed/${activeCall}/800/1200`} 
            className={`w-full h-full object-cover transition-opacity duration-500 ${isVideoOn ? 'opacity-100' : 'opacity-0'}`} 
            alt="Patient"
          />
          {!isVideoOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center">
                <User size={48} className="text-slate-500" />
              </div>
              <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Video Paused</p>
            </div>
          )}

          {/* Clinician Self-View (Picture-in-Picture) */}
          <div className="absolute bottom-4 right-4 w-32 h-44 bg-slate-700 rounded-2xl border-2 border-slate-600 shadow-2xl overflow-hidden">
            <img src="https://picsum.photos/seed/doc/200/300" className="w-full h-full object-cover" alt="Self" />
            <div className="absolute bottom-2 left-2 p-1 bg-black/40 rounded-lg">
              <Mic size={10} className={isMicOn ? 'text-white' : 'text-red-500'} />
            </div>
          </div>
        </div>

        {/* Call Controls */}
        <div className="p-8 bg-slate-900 border-t border-white/5 flex flex-col items-center gap-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-5 rounded-3xl transition-all ${isMicOn ? 'bg-slate-800 text-white' : 'bg-red-500 text-white'}`}
            >
              {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
            </button>
            <button 
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-5 rounded-3xl transition-all ${isVideoOn ? 'bg-slate-800 text-white' : 'bg-red-500 text-white'}`}
            >
              {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
            <button className="p-5 rounded-3xl bg-slate-800 text-white hover:bg-slate-700">
              <Settings size={24} />
            </button>
            <button 
              onClick={handleEndCall}
              className="p-5 rounded-3xl bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-900/40"
            >
              <LogOut size={24} />
            </button>
          </div>

          <button 
            onClick={() => onStartPrescription(activeCall)}
            className="w-full py-4 bg-blue-600 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20"
          >
            <PlusCircle size={18} /> Start Digital Prescription
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="font-bold text-slate-800">Virtual Lobby</h2>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-100">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase">Online</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-32">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white mb-8 relative overflow-hidden shadow-2xl">
          <Video className="absolute -top-4 -right-4 w-32 h-32 text-white/5 rotate-12" />
          <div className="relative z-10">
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">Tele-Health Hub</p>
            <h3 className="text-2xl font-bold mb-4">Patient Virtual Queue</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] text-slate-400 uppercase font-bold">In Lobby</p>
                <p className="text-2xl font-black text-white">01</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Today Total</p>
                <p className="text-2xl font-black text-white">12</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Live Queue</h4>
          {waitingPatients.map((patient) => (
            <div key={patient.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                    <img src={`https://picsum.photos/seed/${patient.id}/100/100`} className="w-full h-full object-cover" alt={patient.name} />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">{patient.name}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${patient.status === 'Waiting' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {patient.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock size={10} /> {patient.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <PhoneIncoming size={18} />
                </div>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reason for Visit</p>
                <p className="text-xs font-medium text-slate-700">{patient.symptoms}</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveCall(patient.name)}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  <Video size={14} /> Start Consultation
                </button>
                <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
                  <MessageCircle size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-white border border-slate-100 rounded-3xl shadow-sm text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
            <Sparkles size={24} />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Need a Clinical Assistant?</h4>
          <p className="text-[10px] text-slate-500 mt-2">MedGemma AI can automatically transcribe your calls and draft prescriptions in real-time.</p>
        </div>
      </div>
    </div>
  );
};

export default ClinicianTeleHub;
