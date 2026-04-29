import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  Loader2,
  CalendarCheck,
  Briefcase
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = [1, 2, 3, 4, 5, 6];

export default function TeacherTimetable() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserAndSchedule = async () => {
      try {
        const token = localStorage.getItem('token');
        const meRes = await axios.get(`${BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(meRes.data);

        // Fetch schedule based on teacher name
        const res = await axios.get(`${BASE_URL}/api/timetable/teacher/${meRes.data.name}`);
        setSchedule(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndSchedule();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-40">
      <Loader2 className="animate-spin text-primary-500 mb-4" size={40} />
      <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Generating your timetable...</p>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto pb-20 px-4">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <Briefcase size={40} className="text-primary-600" />
            My Weekly Schedule
          </h1>
          <p className="text-gray-500 font-medium mt-1">Full table view of your assigned periods and locations.</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Faculty Name</p>
            <p className="text-sm font-black text-gray-900">{user?.name}</p>
          </div>
          <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
            <Calendar size={20} />
          </div>
        </div>
      </div>

      <div className="glass-card bg-white border-gray-100 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-6 border-b border-r border-gray-100 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Hour / Day</th>
                {DAYS.map(day => (
                  <th key={day} className="p-6 border-b border-gray-100 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest min-w-[180px]">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map(hour => (
                <tr key={hour} className="group">
                  <td className="p-6 border-b border-r border-gray-100 bg-gray-50/30">
                    <p className="text-xs font-black text-primary-600 mb-1">Hour {hour}</p>
                    <p className="text-[10px] font-bold text-gray-400">09:30 - 10:20</p>
                  </td>
                  {DAYS.map(day => {
                    // Find slot for this teacher on this day at this hour
                    let teacherSlot = null;
                    schedule.filter(s => s.day === day).forEach(dayDoc => {
                      const slot = dayDoc.slots.find(sl => sl.hour === hour && sl.teacherName === user?.name);
                      if (slot) teacherSlot = { ...slot, section: dayDoc.section };
                    });

                    return (
                      <td key={`${day}-${hour}`} className={`p-6 border-b border-gray-50 transition-all ${teacherSlot ? 'bg-primary-50/30' : 'bg-transparent'}`}>
                        {teacherSlot ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-black text-gray-900 leading-tight">{teacherSlot.subjectName}</h4>
                              <span className="text-[9px] font-black bg-white px-1.5 py-0.5 rounded border border-primary-100 text-primary-600 uppercase">{teacherSlot.section}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                              <div className="flex items-center gap-1">
                                <MapPin size={10} className="text-primary-400" />
                                <span className="text-[10px] font-bold">Room {teacherSlot.room}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-4 opacity-10">
                            <Clock size={16} className="text-gray-400" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <CalendarCheck size={14} className="text-green-500" /> Auto-synced with Department Master Timetable
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-100 rounded"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Your Class</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-50 border border-gray-100 rounded"></div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Free Period</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
