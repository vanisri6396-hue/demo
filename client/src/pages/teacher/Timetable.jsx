import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { Clock, Calendar, MapPin, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function Timetable() {
  const [view, setView] = useState('today'); // 'today' or 'weekly'
  const [schedule, setSchedule] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/timetable/teacher/${user.name}`);
        setWeeklyData(res.data);
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];
        const todayData = res.data.find(d => d.day === today);
        setSchedule(todayData ? todayData.slots : []);
      } catch (err) {
        console.error('Error fetching schedule:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [user.name]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="animate-spin text-primary-500" size={40} />
      <p className="text-gray-500 font-medium">Syncing your schedule...</p>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Academic Schedule</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your weekly classes and session tracking.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={() => setView('today')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              view === 'today' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Today
          </button>
          <button 
            onClick={() => setView('weekly')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              view === 'weekly' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Weekly Overview
          </button>
        </div>
      </div>

      {view === 'today' ? (
        <div className="grid grid-cols-1 gap-6">
          {schedule.length > 0 ? schedule.map((item, i) => (
            <div key={i} className="glass-card p-6 border-l-8 border-l-primary-500 bg-white flex items-center justify-between group hover:shadow-xl transition-all">
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center justify-center bg-gray-50 w-24 h-24 rounded-2xl border border-gray-100">
                  <Clock size={20} className="text-gray-400 mb-1" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Hour {item.hour}</span>
                  <span className="text-sm font-bold text-gray-900">{item.timeSlot?.split(' - ')[0]}</span>
                </div>
                
                <div>
                  <h3 className="text-2xl font-black text-gray-900 group-hover:text-primary-600 transition-colors">{item.subjectCode}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 font-bold mt-1">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> Section A</span>
                    <span className="flex items-center gap-1.5"><MapPin size={14} /> Room 302</span>
                  </div>
                </div>
              </div>
              <button className="btn-primary px-8">Start Session</button>
            </div>
          )) : (
            <div className="glass-card p-20 text-center flex flex-col items-center bg-white border-dashed">
              <Calendar size={48} className="text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-900">No classes today</h3>
              <p className="text-gray-500">You can relax or check your weekly overview.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
            const daySlots = weeklyData.find(d => d.day === day)?.slots || [];
            return (
              <div key={day} className="glass-card bg-white p-6 hover:border-primary-200 transition-all border-2 border-transparent">
                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center justify-between">
                  {day}
                  <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">
                    {daySlots.length} Classes
                  </span>
                </h3>
                <div className="space-y-3">
                  {daySlots.length > 0 ? daySlots.map((slot, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-xl flex justify-between items-center group cursor-default">
                      <div>
                        <p className="text-sm font-black text-gray-900">{slot.subjectCode}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{slot.timeSlot}</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-xs font-black text-gray-900 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                        {slot.hour}
                      </div>
                    </div>
                  )) : (
                    <p className="text-xs font-medium text-gray-400 italic">No classes scheduled</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
