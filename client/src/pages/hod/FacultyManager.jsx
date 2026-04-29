import { useState } from 'react';
import { 
  UserSquare, 
  Mail, 
  Phone, 
  BookOpen, 
  MoreVertical, 
  Plus, 
  Search, 
  Filter,
  CheckCircle2
} from 'lucide-react';

export default function FacultyManager() {
  const [faculty, setFaculty] = useState([
    { id: 1, name: 'Dr. Alan Turing', email: 'alan.t@university.edu', courses: 3, classes: 12, rating: 4.8, status: 'Active' },
    { id: 2, name: 'Prof. Grace Hopper', email: 'grace.h@university.edu', courses: 2, classes: 8, rating: 4.9, status: 'Active' },
    { id: 3, name: 'Dr. John von Neumann', email: 'john.v@university.edu', courses: 4, classes: 16, rating: 4.7, status: 'On Leave' },
    { id: 4, name: 'Prof. Ada Lovelace', email: 'ada.l@university.edu', courses: 3, classes: 10, rating: 4.9, status: 'Active' },
  ]);

  return (
    <div className="max-w-[1200px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Faculty Directory</h1>
          <p className="text-gray-500 font-medium mt-1">Manage departmental teaching staff and course assignments.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 px-8 py-4 shadow-xl shadow-primary-100">
          <Plus size={20} /> Add Faculty
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass-card p-6 bg-white border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">TOTAL FACULTY</p>
          <h3 className="text-3xl font-black text-gray-900">24</h3>
        </div>
        <div className="glass-card p-6 bg-white border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">CLASSES THIS WEEK</p>
          <h3 className="text-3xl font-black text-green-600">142</h3>
        </div>
        <div className="glass-card p-6 bg-white border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">AVG RATING</p>
          <h3 className="text-3xl font-black text-primary-600">4.8</h3>
        </div>
        <div className="glass-card p-6 bg-white border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">STAFF ON LEAVE</p>
          <h3 className="text-3xl font-black text-red-600">02</h3>
        </div>
      </div>

      <div className="glass-card bg-white border-gray-100 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search faculty name..." 
              className="pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 w-80 outline-none font-medium"
            />
          </div>
          <button className="p-3 bg-gray-50 rounded-xl text-gray-500 hover:bg-gray-100"><Filter size={20} /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 text-left border-b border-gray-100">
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Faculty Member</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Courses</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Weekly Load</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Performance</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {faculty.map(member => (
                <tr key={member.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                        <UserSquare size={24} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900">{member.name}</p>
                        <p className="text-xs font-bold text-gray-400">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="font-bold text-gray-700">{member.courses} Subjects</span>
                  </td>
                  <td className="p-6">
                    <span className="font-bold text-gray-700">{member.classes} Classes</span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <div key={s} className={`w-1.5 h-4 rounded-full ${s <= Math.floor(member.rating) ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
                        ))}
                      </div>
                      <span className="text-xs font-black text-gray-900 ml-1">{member.rating}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      member.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
