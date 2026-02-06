
import React, { useState } from 'react';
import { 
  ArrowLeft, Video, Star, Clock, Calendar, 
  ShieldCheck, ChevronRight, Search, PhoneCall,
  CheckCircle2, Sparkles, User
} from 'lucide-react';
import { Specialist } from '../types';

interface TeleConsultationProps {
  onBack: () => void;
  onBook: (specialist: Specialist, time: string) => void;
}

const SPECIALISTS: Specialist[] = [
  { id: '1', name: 'Dr. Aris Thorne', specialty: 'Cardiologist', rating: 4.9, fee: 50, experience: '12 Years', avatar: 'https://picsum.photos/seed/dr1/100/100' },
  { id: '2', name: 'Dr. Sarah Jenkins', specialty: 'Dermatologist', rating: 4.8, fee: 40, experience: '8 Years', avatar: 'https://picsum.photos/seed/dr2/100/100' },
  { id: '3', name: 'Dr. Michael Chen', specialty: 'Neurologist', rating: 5.0, fee: 75, experience: '15 Years', avatar: 'https://picsum.photos/seed/dr3/100/100' },
  { id: '4', name: 'Dr. Elena Rodriguez', specialty: 'Pediatrician', rating: 4.7, fee: 35, experience: '6 Years', avatar: 'https://picsum.photos/seed/dr4/100/100' },
];

const TeleConsultation: React.FC<TeleConsultationProps> = ({ onBack, onBook }) => {
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [bookingStep, setBookingStep] = useState<'LIST' | 'SLOTS' | 'CONFIRMING'>('LIST');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleSelectSpecialist = (s: Specialist) => {
    setSelectedSpecialist(s);
    setBookingStep('SLOTS');
  };

  const handleConfirmBooking = () => {
    if (!selectedSpecialist || !selectedTime) return;
    setBookingStep('CONFIRMING');
    setTimeout(() => {
      onBook(selectedSpecialist, selectedTime);
    }, 2000);
  };

  const timeSlots = ["09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM", "05:00 PM", "06:30 PM"];

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={bookingStep === 'LIST' ? onBack : () => setBookingStep('LIST')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="font-bold text-slate-800">
            {bookingStep === 'LIST' ? 'Virtual Clinic' : 'Select Time Slot'}
          </h2>
        </div>
        <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
          <Video size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Live Now</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-32">
        {bookingStep === 'LIST' && (
          <div className="space-y-6">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search specialists or symptoms..." 
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm text-sm"
              />
              <Search className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Top Rated Specialists</h3>
              {SPECIALISTS.map((s) => (
                <div key={s.id} onClick={() => handleSelectSpecialist(s)} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer active:scale-95">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-sm">
                        <img src={s.avatar} alt={s.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{s.name}</h4>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star size={12} fill="currentColor" />
                          <span className="text-[10px] font-bold">{s.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mb-2">{s.specialty} • {s.experience}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">Consult: ${s.fee}</span>
                        <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                          <Clock size={10} /> Next Available: 2h
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" size={18} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {bookingStep === 'SLOTS' && selectedSpecialist && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 text-center">
              <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-blue-50 shadow-lg mx-auto mb-4">
                <img src={selectedSpecialist.avatar} className="w-full h-full object-cover" alt={selectedSpecialist.name} />
              </div>
              <h3 className="font-black text-xl text-slate-800">{selectedSpecialist.name}</h3>
              <p className="text-sm font-medium text-slate-500 mb-6">{selectedSpecialist.specialty}</p>
              
              <div className="grid grid-cols-3 gap-3">
                {timeSlots.map((time) => (
                  <button 
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 rounded-2xl text-[10px] font-bold transition-all border ${selectedTime === time ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 -translate-y-1' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-white hover:border-blue-200 hover:text-blue-600'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <Sparkles className="absolute top-0 right-0 p-4 opacity-20 w-32 h-32" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 text-blue-300">
                  <ShieldCheck size={18} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted</span>
                </div>
                <h4 className="text-xl font-bold mb-2">Book Appointment</h4>
                <p className="text-sm text-blue-100 opacity-80 mb-8 leading-relaxed">
                  Your tele-consultation will take place via high-definition secure video. A link will be sent to your reciprocal clinician hub immediately.
                </p>
                <button 
                  disabled={!selectedTime}
                  onClick={handleConfirmBooking}
                  className="w-full py-4 bg-white text-blue-900 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  <PhoneCall size={18} /> Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}

        {bookingStep === 'CONFIRMING' && (
          <div className="h-full flex flex-col items-center justify-center py-20 space-y-8 animate-in zoom-in duration-500">
            <div className="relative">
              <div className="w-32 h-32 border-4 border-slate-100 rounded-full"></div>
              <div className="w-32 h-32 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
              <div className="absolute inset-0 m-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                <Video className="text-blue-600 animate-pulse" size={40} />
              </div>
            </div>
            <div className="text-center px-8">
              <h3 className="font-black text-2xl text-slate-800">Connecting...</h3>
              <p className="text-sm text-slate-500 mt-2">Syncing your appointment with {selectedSpecialist?.name}'s clinical calendar.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeleConsultation;
