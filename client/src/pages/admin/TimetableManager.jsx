import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { 
  Calendar, 
  Save, 
  Clock, 
  Edit3, 
  Trash2, 
  Plus,
  ArrowLeft,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = [1, 2, 3, 4, 5, 6];

export default function TimetableManager() {
  const [section, setSection] = useState('CSE-A');
  const [timetableData, setTimetableData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/timetable/section/${section}`);
      const mapped = {};
      res.data.forEach(dayDoc => {
        mapped[dayDoc.day] = dayDoc.slots;
      });
      setTimetableData(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [section]);

  const handleUpdateSlot = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSlot = {
      hour: editingSlot.hour,
      subjectName: formData.get('subject'),
      teacherName: formData.get('teacher'),
      room: formData.get('room'),
      timeSlot: editingSlot.timeSlot || '09:30 - 10:20'
    };

    const daySlots = [...(timetableData[editingSlot.day] || [])];
    const index = daySlots.findIndex(s => s.hour === editingSlot.hour);
    if (index > -1) daySlots[index] = newSlot;
    else daySlots.push(newSlot);

    setTimetableData({...timetableData, [editingSlot.day]: daySlots});
    setEditingSlot(null);
  };

  const saveToBackend = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      // Save each day's configuration
      for (const day of DAYS) {
        if (timetableData[day]) {
          await axios.post(`${BASE_URL}/api/timetable/update`, {
            section,
            day,
            slots: timetableData[day]
          }, { headers: { Authorization: `Bearer ${token}` }});
        }
      }
      alert('Timetable saved successfully! ✅');
    } catch (err) {
      alert('Failed to save timetable ❌');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-20 px-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
            <Calendar size={40} className="text-primary-600" />
            Master Timetable
          </h1>
          <p className="text-gray-500 font-medium mt-1">Configure section-wise weekly schedule (Max 6 hours/day).</p>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <select 
            value={section} 
            onChange={(e) => setSection(e.target.value)}
            className="px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl font-black text-gray-700 outline-none focus:border-primary-400"
          >
            <option value="CSE-A">CSE-A</option>
            <option value="CSE-B">CSE-B</option>
            <option value="ECE-A">ECE-A</option>
          </select>
          <button 
            onClick={saveToBackend}
            disabled={saving}
            className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-xl"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />} Save Changes
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-2">
          <thead>
            <tr>
              <th className="p-4 bg-gray-50 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Time / Day</th>
              {DAYS.map(day => (
                <th key={day} className="p-4 bg-gray-50 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(hour => (
              <tr key={hour}>
                <td className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm min-w-[120px]">
                  <p className="text-[10px] font-black text-primary-600 uppercase mb-1">Hour {hour}</p>
                  <p className="text-sm font-bold text-gray-400 flex items-center gap-2"><Clock size={12}/> 09:30 - 10:20</p>
                </td>
                {DAYS.map(day => {
                  const slot = timetableData[day]?.find(s => s.hour === hour);
                  return (
                    <td 
                      key={`${day}-${hour}`}
                      onClick={() => setEditingSlot({day, hour, ...slot})}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer min-w-[180px] h-[120px] relative group ${
                        slot ? 'bg-white border-primary-50 shadow-md hover:border-primary-300' : 'bg-gray-50/50 border-dashed border-gray-200 hover:bg-white hover:border-primary-100'
                      }`}
                    >
                      {slot ? (
                        <div className="flex flex-col h-full justify-between">
                          <div>
                            <h4 className="font-black text-gray-900 leading-tight">{slot.subjectName}</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-1">{slot.teacherName}</p>
                          </div>
                          <div className="flex justify-between items-center mt-auto pt-2">
                            <span className="text-[10px] font-black bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase">{slot.room}</span>
                            <Edit3 size={14} className="text-gray-300 group-hover:text-primary-400 transition-colors" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Plus size={20} className="text-gray-200 group-hover:text-primary-200" />
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

      {/* Edit Slot Modal */}
      {editingSlot && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-[450px] w-full shadow-2xl scale-in-center">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Edit Schedule Slot</h2>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-8">{editingSlot.day} • Hour {editingSlot.hour}</p>
            
            <form onSubmit={handleUpdateSlot} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Subject Name</label>
                <input 
                  name="subject"
                  defaultValue={editingSlot.subjectName}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-primary-400 font-medium text-gray-700"
                  placeholder="e.g. Data Structures"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Assigned Teacher</label>
                <input 
                  name="teacher"
                  defaultValue={editingSlot.teacherName}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-primary-400 font-medium text-gray-700"
                  placeholder="Prof. Name"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Room No.</label>
                  <input 
                    name="room"
                    defaultValue={editingSlot.room}
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-primary-400 font-medium text-gray-700"
                    placeholder="e.g. 402"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Hour</label>
                  <input 
                    disabled
                    value={editingSlot.hour}
                    className="w-full px-4 py-4 bg-gray-100 border border-gray-100 rounded-2xl font-black text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary-100 hover:bg-primary-700 transition-all"
                >
                  Update Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
