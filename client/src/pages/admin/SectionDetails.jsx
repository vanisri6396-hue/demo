import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { 
  Users, TrendingUp, UserCheck, Clock, Download, 
  Mail, Edit3, ChevronRight, Search, Filter, Loader2
} from 'lucide-react';

export default function SectionDetails() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'TOTAL STUDENTS', value: '0', sub: 'Loading...', icon: Users, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'OVERALL ATTENDANCE', value: '0%', sub: '...', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'DEPT HEAD', value: 'HOD', sub: 'Dept.', icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'ALERTS', value: '0', sub: 'Students needing review', icon: Clock, color: 'text-red-600', bg: 'bg-red-50' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [usersRes, dashRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/admin/users?role=student`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${BASE_URL}/api/admin/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setStudents(usersRes.data.users || []);
        
        const d = dashRes.data;
        setStats([
          { label: 'TOTAL STUDENTS', value: d.totalStudents || '0', sub: 'Active Enrollment', icon: Users, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'OVERALL ATTENDANCE', value: `${d.today?.attendancePercent || 0}%`, sub: 'Daily Average', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'TOTAL TEACHERS', value: d.totalTeachers || '0', sub: 'Active Faculty', icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'TODAY ABSENT', value: d.today?.absentToday || '0', sub: 'Students Missing', icon: Clock, color: 'text-red-600', bg: 'bg-red-50' },
        ]);

      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto">
      {/* Header Actions */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CSE-C Section Details</h1>
          <p className="text-gray-500">Detailed academic performance and attendance tracking for Batch 2024-25.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download size={18} /> Export CSV
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Mail size={18} /> Notify Parents
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Edit3 size={18} /> Update Timetable
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card p-6 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-0.5">{stat.value}</h3>
                <p className="text-xs text-gray-500">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Performance Log Table */}
        <div className="lg:col-span-2 glass-card p-0 overflow-hidden min-h-[400px]">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <h3 className="font-bold text-gray-900 text-lg">Student Directory</h3>
            <div className="flex gap-3">
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search student..." 
                  className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-400 w-48"
                />
              </div>
              <button className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100">
                <Filter size={16} />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="animate-spin text-primary-500" size={40} />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fetching Students...</p>
              </div>
            ) : students.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ROLL NO</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">NAME</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">DEPARTMENT</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">STATUS</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student, i) => (
                    <tr key={student._id || i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700">{student.rollNo || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{student.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{student.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {student.department} {student.section && `(${student.section})`}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${student.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {student.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center gap-1 justify-end ml-auto">
                          Profile <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-20 text-center text-gray-500 font-medium italic">
                No students found in the database.
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/30">
            <p className="text-xs text-gray-500">Showing {students.length} students</p>
          </div>
        </div>

        {/* Right Sidebar Components */}
        <div className="flex flex-col gap-6">
          {/* Ongoing Session Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-4 right-4 animate-pulse">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">LIVE SESSION ONGOING</p>
            <h3 className="text-xl font-bold mb-1">Discrete Mathematics</h3>
            <p className="text-sm text-gray-400 mb-6 flex items-center gap-2">
              <UserCheck size={14} /> Prof. Alan Turing
            </p>
            
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[10px] text-gray-400 mb-1">Students Present</p>
                <h4 className="text-2xl font-bold">34 <span className="text-gray-500 text-lg">/ 40</span></h4>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 mb-1">Class Ratio</p>
                <h4 className="text-2xl font-bold text-green-400">85%</h4>
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 mb-2">
              <div className="bg-primary-500 h-2 rounded-full" style={{width: '85%'}}></div>
            </div>
          </div>

          {/* Subject Analytics Card */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-gray-900 mb-6">Subject Analytics</h3>
            <div className="space-y-6">
              {[
                { name: 'Data Structures', pct: 88, color: 'bg-green-500' },
                { name: 'Algorithms', pct: 72, color: 'bg-red-400' },
                { name: 'Discrete Math', pct: 92, color: 'bg-primary-500' },
                { name: 'Computer Networks', pct: 84, color: 'bg-blue-500' }
              ].map((sub, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span className="text-gray-700">{sub.name}</span>
                    <span className={sub.pct < 75 ? 'text-red-500' : 'text-gray-900'}>{sub.pct}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className={`${sub.color} h-1.5 rounded-full transition-all`} style={{ width: `${sub.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white hover:border-primary-400 transition-all">
              Full Analytics Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
