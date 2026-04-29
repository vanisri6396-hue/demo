import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { Save, Plus, Trash2, Calendar, User, BookOpen, Clock } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = [1, 2, 3, 4, 5, 6, 7, 8];
const TIMES = [
  '09:30 - 10:20', '10:20 - 11:10', '11:20 - 12:10', '12:10 - 01:00',
  '01:50 - 02:30', '02:30 - 03:10', '03:20 - 04:00', '04:00 - 04:40'
];

export default function TimetableManager() {
  const [section, setSection] = useState('CSE-A');
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTimetable();
  }, [section]);

  const fetchTimetable = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/timetable/section/${section}`);
      const mapped = {};
      res.data.forEach(dayData => {
        mapped[dayData.day] = dayData.slots;
      });
      setTimetable(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCellChange = (day, hour, field, value) => {
    const currentSlots = timetable[day] || [];
    const slotIndex = currentSlots.findIndex(s => s.hour === hour);
    
    const newSlots = [...currentSlots];
    if (slotIndex > -1) {
      newSlots[slotIndex] = { ...newSlots[slotIndex], [field]: value };
    } else {
      newSlots.push({ hour, [field]: value, timeSlot: TIMES[hour-1] });
    }
    
    setTimetable({ ...timetable, [day]: newSlots });
  };

  const saveTimetable = async () => {
    setLoading(true);
    try {
      for (const day of DAYS) {
        if (timetable[day]) {
          await axios.post(`${BASE_URL}/api/timetable/update`, {
            day,
            section,
            slots: timetable[day]
          });
        }
      }
      alert('Timetable saved successfully! 🚀');
    } catch (err) {
      alert('Failed to save timetable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">University Timetable Editor</h1>
          <p className="text-gray-500 font-medium">Manage faculty assignments and subject schedules per section.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            className="bg-white border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-gray-700 shadow-sm outline-none focus:border-primary-500"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            <option value="CSE-A">CSE (AIML-A)</option>
            <option value="CSE-B">CSE (AIML-B)</option>
            <option value="CSE-C">CSE (AIML-C)</option>
          </select>
          
          <button 
            onClick={saveTimetable}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={18} /> {loading ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-2xl bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-r border-gray-100 w-40">Day / Hour</th>
              {HOURS.map(h => (
                <th key={h} className="p-6 text-center border-r border-gray-100">
                  <span className="block text-primary-600 font-black text-lg">H-{h}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{TIMES[h-1]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day => (
              <tr key={day} className="border-b border-gray-50 last:border-0">
                <td className="p-6 bg-gray-50/50 border-r border-gray-100 font-black text-gray-900 uppercase tracking-tighter text-sm">
                  {day}
                </td>
                {HOURS.map(hour => {
                  const slot = (timetable[day] || []).find(s => s.hour === hour) || {};
                  return (
                    <td key={hour} className="p-4 border-r border-gray-100 hover:bg-primary-50/30 transition-colors group">
                      <div className="flex flex-col gap-2">
                        <input 
                          placeholder="Subject"
                          className="w-full text-xs font-bold text-gray-900 bg-transparent border-b border-transparent group-hover:border-primary-200 outline-none placeholder:text-gray-300 uppercase"
                          value={slot.subjectCode || ''}
                          onChange={(e) => handleCellChange(day, hour, 'subjectCode', e.target.value)}
                        />
                        <input 
                          placeholder="Faculty Name"
                          className="w-full text-[10px] font-medium text-gray-500 bg-transparent outline-none placeholder:text-gray-300"
                          value={slot.teacherName || ''}
                          onChange={(e) => handleCellChange(day, hour, 'teacherName', e.target.value)}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 bg-blue-50/50 border-blue-100">
          <div className="flex items-center gap-3 mb-4 text-blue-600">
            <BookOpen size={20} /> <span className="font-black uppercase tracking-widest text-xs">Course Reference</span>
          </div>
          <p className="text-xs text-blue-700 leading-relaxed font-medium">
            Use official course codes (e.g., U24CET473) for accurate tracking and report generation across departments.
          </p>
        </div>
        <div className="glass-card p-6 bg-amber-50/50 border-amber-100">
          <div className="flex items-center gap-3 mb-4 text-amber-600">
            <User size={20} /> <span className="font-black uppercase tracking-widest text-xs">Faculty Assignment</span>
          </div>
          <p className="text-xs text-amber-700 leading-relaxed font-medium">
            Ensure teacher names match their registration profiles to enable their personal timetable dashboards.
          </p>
        </div>
        <div className="glass-card p-6 bg-primary-50/50 border-primary-100">
          <div className="flex items-center gap-3 mb-4 text-primary-600">
            <Clock size={20} /> <span className="font-black uppercase tracking-widest text-xs">Auto-Sync</span>
          </div>
          <p className="text-xs text-primary-700 leading-relaxed font-medium">
            Changes saved here reflect instantly on student and teacher portals. Previous sessions remain unaffected.
          </p>
        </div>
      </div>
    </div>
  );
}
