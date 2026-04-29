import { useState } from 'react';
import { 
  Users, MapPin, Clock, Search, Filter, 
  Download, CheckCircle2, XCircle, ChevronLeft, ChevronRight, 
  Save, Send 
} from 'lucide-react';

export default function ExamInvigilation() {
  const [students, setStudents] = useState([
    { id: '2024-MATH-001', name: 'Alex Bennett', seat: 'A-01', status: 'PRESENT' },
    { id: '2024-MATH-015', name: 'Chloe Patel', seat: 'A-02', status: 'ABSENT' },
    { id: '2024-MATH-042', name: 'Daniel Miller', seat: 'A-03', status: 'PENDING' },
    { id: '2024-MATH-088', name: 'Emma Lawson', seat: 'A-04', status: 'PRESENT' },
  ]);

  const toggleStatus = (index, newStatus) => {
    const updated = [...students];
    updated[index].status = newStatus;
    setStudents(updated);
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto">
      {/* Header section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Exam Invigilation</h1>
          <p className="text-gray-500 font-medium">Real-time attendance tracking for current session.</p>
        </div>
        <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time Left</p>
            <p className="text-xl font-bold text-gray-900">01:42:15</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column Controls */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <h3 className="font-bold text-gray-900">Location</h3>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Assigned Hall</p>
            <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-primary-400 transition-all appearance-none cursor-pointer">
              <option>Room 201 - North Wing</option>
              <option>Room 305 - South Wing</option>
              <option>Main Audit Hall</option>
            </select>
          </div>

          <div className="bg-gradient-to-br from-[#242D45] to-[#1E293B] rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-[60px] rounded-full"></div>
            <p className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.2em] mb-6">ACTIVE SESSION</p>
            <h2 className="text-3xl font-bold mb-2">Discrete Mathematics</h2>
            <p className="text-primary-200/60 text-sm mb-10 flex items-center gap-2">
              MAT-402 • 120 Students Assigned
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 text-sm text-primary-100/80">
                <Clock size={16} className="text-primary-500" /> 10:00 AM - 01:00 PM
              </div>
              <div className="flex items-center gap-4 text-sm text-primary-100/80">
                <MapPin size={16} className="text-primary-500" /> Invigilator: Dr. J. Doe
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Present</p>
                <p className="text-3xl font-black text-green-400">84</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Absent</p>
                <p className="text-3xl font-black text-red-400">36</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Roster */}
        <div className="lg:col-span-2 glass-card p-0 overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-100 bg-white flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">Student Roster</h3>
              <p className="text-sm text-gray-500 font-medium">Manage and verify student presence</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-white transition-all">
                <Filter size={14} /> Filter
              </button>
              <button className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-white transition-all">
                <Download size={14} /> Export
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">STUDENT DETAILS</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">SEAT</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">ATTENDANCE STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student, i) => (
                  <tr key={i} className="hover:bg-gray-50/20 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-500 text-xs shadow-inner">
                          {student.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{student.name}</h4>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {student.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-gray-700 bg-gray-100 px-2 py-1 rounded-md">{student.seat}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toggleStatus(i, 'PRESENT')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${student.status === 'PRESENT' ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                          <CheckCircle2 size={14} /> Present
                        </button>
                        <button 
                          onClick={() => toggleStatus(i, 'ABSENT')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${student.status === 'ABSENT' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                          <XCircle size={14} /> Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center">
            <p className="text-xs text-gray-500 font-bold">Showing 1-4 of 120 Students</p>
            <div className="flex items-center gap-1">
              <button className="p-2 border border-gray-200 rounded-lg bg-white text-gray-400 hover:text-gray-900"><ChevronLeft size={16} /></button>
              <button className="w-8 h-8 rounded-lg bg-primary-600 text-white text-xs font-bold shadow-lg shadow-primary-200">1</button>
              <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50">2</button>
              <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50">3</button>
              <button className="p-2 border border-gray-200 rounded-lg bg-white text-gray-400 hover:text-gray-900"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="glass-card p-6 flex justify-between items-center sticky bottom-8 shadow-2xl border-primary-100 bg-white/90 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="flex -space-x-3">
            {[1,2,3].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
                <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">{i}</div>
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">+116</div>
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">84 / 120 Students Marked</h4>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Complete all entries to finalize</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-3 bg-white border-2 border-gray-100 text-gray-600 font-bold rounded-2xl hover:border-gray-300 transition-all flex items-center gap-2">
            <Save size={18} /> Save Progress
          </button>
          <button className="px-10 py-3 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all flex items-center gap-2">
            <Send size={18} /> Submit Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
