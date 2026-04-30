import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { 
  UserSquare, 
  Mail, 
  Phone, 
  BookOpen, 
  MoreVertical, 
  Plus, 
  Search, 
  Filter,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export default function FacultyManager() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, active: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/admin/users?role=teacher`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const users = res.data.users || [];
        setFaculty(users);
        setSummary({
          total: users.length,
          active: users.filter(u => u.isActive).length
        });
      } catch (err) {
        console.error('Faculty fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
          <h3 className="text-3xl font-black text-gray-900">{summary.total}</h3>
        </div>
        <div className="glass-card p-6 bg-white border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ACTIVE NOW</p>
          <h3 className="text-3xl font-black text-green-600">{summary.active}</h3>
        </div>
        <div className="glass-card p-6 bg-white border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">DEPARTMENTS</p>
          <h3 className="text-3xl font-black text-primary-600">
            {new Set(faculty.map(f => f.department)).size}
          </h3>
        </div>
        <div className="glass-card p-6 bg-white border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">PENDING VERIFICATION</p>
          <h3 className="text-3xl font-black text-red-600">0</h3>
        </div>
      </div>

      <div className="glass-card bg-white border-gray-100 overflow-hidden shadow-2xl min-h-[400px]">
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
          {loading ? (
            <div className="flex flex-col items-center justify-center p-32 gap-4">
              <Loader2 className="animate-spin text-primary-500" size={50} />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Faculty...</p>
            </div>
          ) : faculty.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 text-left border-b border-gray-100">
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Faculty Member</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Department</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee ID</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {faculty.map(member => (
                  <tr key={member._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
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
                      <span className="font-bold text-gray-700">{member.department || 'General'}</span>
                    </td>
                    <td className="p-6">
                      <span className="font-bold text-gray-700">{member.employeeId || 'N/A'}</span>
                    </td>
                    <td className="p-6 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        member.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${member.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-32 text-center text-gray-500 italic">No faculty found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
