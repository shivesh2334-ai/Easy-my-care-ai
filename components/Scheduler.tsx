
import React, { useState } from 'react';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, 
  Calendar as CalendarIcon, Clock, MoreVertical, 
  Search, Filter, Plus, User, FileText, CheckCircle2
} from 'lucide-react';
import { Appointment } from '../types';

interface SchedulerProps {
  onBack: () => void;
  onStartSession: (patientName: string) => void;
}

const MOCK_APPOINTMENTS: Record<number, Appointment[]> = {
  // Keyed by day of month for demo purposes
  [new Date().getDate()]: [
    { id: '1', patientName: 'John Doe', time: '09:00 AM', type: 'New', status: 'Confirmed', initialSymptoms: 'Chest Pain' },
    { id: '2', patientName: 'Sarah Smith', time: '10:30 AM', type: 'Follow-up', status: 'Pending', initialSymptoms: 'Sugar check' },
    { id: '3', patientName: 'Robert Wilson', time: '11:45 AM', type: 'Lab Review', status: 'Confirmed', initialSymptoms: 'Blood report' },
    { id: '4', patientName: 'Emily Davis', time: '02:00 PM', type: 'New', status: 'Confirmed', initialSymptoms: 'Fever' },
  ],
  [new Date().getDate() + 1]: [
    { id: '5', patientName: 'Michael Brown', time: '09:30 AM', type: 'Follow-up', status: 'Confirmed', initialSymptoms: 'Joint pain' },
  ]
};

const Scheduler: React.FC<SchedulerProps> = ({ onBack, onStartSession }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'DAY' | 'MONTH'>('DAY');

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const currentDay = selectedDate.getDate();
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const monthName = selectedDate.toLocaleString('default', { month: 'long' });

  const appointmentsForSelectedDate = MOCK_APPOINTMENTS[currentDay] || [];

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Confirmed': return 'text-green-600 bg-green-50';
      case 'Pending': return 'text-amber-600 bg-amber-50';
      case 'Completed': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="font-bold text-slate-800">Clinic Schedule</h2>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <Filter className="w-5 h-5" />
          </button>
          <button className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-200">
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Interactive Date Strip */}
      <div className="bg-white border-b border-slate-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tighter">
            {monthName} {currentYear}
          </h3>
          <div className="flex gap-1">
            <button onClick={() => changeDate(-1)} className="p-1 hover:bg-slate-50 rounded-lg"><ChevronLeft size={18}/></button>
            <button onClick={() => setSelectedDate(new Date())} className="text-[10px] font-bold text-blue-600 px-2">TODAY</button>
            <button onClick={() => changeDate(1)} className="p-1 hover:bg-slate-50 rounded-lg"><ChevronRight size={18}/></button>
          </div>
        </div>

        <div className="flex justify-between gap-2 overflow-x-auto scrollbar-hide pb-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - 3 + i);
            const isSelected = date.getDate() === currentDay && date.getMonth() === currentMonth;
            return (
              <button 
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center min-w-[48px] py-3 rounded-2xl transition-all ${isSelected ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 -translate-y-1' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest">{date.toLocaleString('default', { weekday: 'short' })}</span>
                <span className="text-base font-black mt-1">{date.getDate()}</span>
                {MOCK_APPOINTMENTS[date.getDate()] && !isSelected && <span className="w-1 h-1 bg-blue-500 rounded-full mt-1"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Appointment List */}
      <div className="flex-1 overflow-y-auto p-5 pb-24 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {appointmentsForSelectedDate.length} Appointments Found
          </p>
          <div className="bg-white px-2 py-1 rounded-lg border border-slate-200 flex items-center gap-1 shadow-sm">
            <Clock size={12} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-600">Timeline</span>
          </div>
        </div>

        {appointmentsForSelectedDate.length > 0 ? (
          appointmentsForSelectedDate.map((app) => (
            <div key={app.id} className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                    <img src={`https://picsum.photos/seed/${app.patientName}/100/100`} className="w-full h-full object-cover" alt="Patient"/>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">{app.patientName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                        <Clock size={10} /> {app.time}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Appointment Type</span>
                  <span className="text-xs font-bold text-slate-700">{app.type} - {app.initialSymptoms}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onStartSession(app.patientName)}
                    className="p-3 bg-white border border-slate-200 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                  >
                    <FileText size={16} />
                  </button>
                  <button className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                    <CheckCircle2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 opacity-40">
            <CalendarIcon size={64} className="text-slate-300 mb-4" />
            <p className="font-bold text-slate-500">No appointments for this day</p>
            <button className="mt-4 text-sm font-bold text-blue-600 bg-blue-50 px-6 py-2 rounded-full">Book Slot</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scheduler;
