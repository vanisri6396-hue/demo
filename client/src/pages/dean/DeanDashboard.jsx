import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  Building2, Users, GraduationCap, ChevronRight, Search, LayoutGrid,
  BookOpen, MoreVertical, ExternalLink, Activity, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BASE_URL } from '../../config';

const DeanDashboard = () => {
  const navigate = useNavigate();
  const [schoolData, setSchoolData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const schoolId = user.schoolId;
  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!schoolId) {
      alert("No school assigned to this Dean account! ❌");
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [hierarchyRes, attendanceRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/admin/hierarchy/public`), // Using public to avoid role-check conflicts if any
          axios.get(`${BASE_URL}/api/admin/attendance/school/${schoolId}`, authHeader)
        ]);
        
        const school = hierarchyRes.data.find(s => s._id === schoolId);
        setSchoolData(school);
        setAttendanceData(attendanceRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [schoolId]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-primary-400 font-black uppercase tracking-widest text-[10px]">Loading School Portal</p>
      </div>
    </div>
  );

  if (!schoolData) return <div className="p-8 text-center text-red-500 font-bold">Access Denied: School context missing ❌</div>;

  const filteredDepts = schoolData.departments.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-10">
      {/* Premium Dean Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-[2rem] bg-gray-900 flex items-center justify-center text-primary-400 shadow-2xl shadow-primary-200 group transition-all hover:scale-105">
              <Building2 className="w-12 h-12" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-primary-100 text-primary-700 text-[10px] font-black rounded-full border border-primary-200 uppercase tracking-widest">
                  {schoolData.code}
                </span>
                <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={12} className="text-primary-400" /> DEAN PORTAL
                </span>
              </div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none mb-2">{schoolData.name}</h1>
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Administrative Executive Console • {user.name}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
             <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 hover:text-gray-900 shadow-sm transition-all hover:shadow-md">
               Download Report
             </button>
             <button className="px-6 py-3 bg-primary-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-100 hover:bg-primary-700 transition-all hover:scale-105">
               School settings
             </button>
          </div>
        </div>
      </div>

      {/* Advanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          icon={<Activity className="text-indigo-600" />} 
          label="Departments" 
          value={schoolData.departments.length} 
          color="indigo" 
          trend="+2 New Programs"
        />
        <StatCard 
          icon={<GraduationCap className="text-emerald-600" />} 
          label="School Attendance" 
          value={`${Math.round(attendanceData?.deptContribution?.reduce((acc, curr) => acc + curr.percentage, 0) / (attendanceData?.deptContribution?.length || 1))}%`} 
          color="emerald" 
          trend="Above Target"
        />
        <StatCard 
          icon={<Users className="text-amber-600" />} 
          label="Total Students" 
          value="1,240" 
          color="amber" 
          trend="Updated Today"
        />
        <StatCard 
          icon={<LayoutGrid className="text-purple-600" />} 
          label="Course Blocks" 
          value={schoolData.departments.reduce((acc, curr) => acc + (curr.programs?.length || 0), 0)} 
          color="purple" 
          trend="Semester 2"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Department Management Grid */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-gray-50 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest ml-4">Department Oversight</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search departments..." 
                className="pl-11 pr-6 py-3 bg-gray-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary-500/20 w-64 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredDepts.map((dept, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={dept._id}
                onClick={() => navigate(`/hod/statistics?deptId=${dept._id}`)}
                className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 transition-all group-hover:bg-primary-100/50"></div>
                <div className="flex items-start justify-between mb-6 relative">
                  <div className="w-14 h-14 rounded-2xl bg-gray-900 flex items-center justify-center text-primary-400 transition-all group-hover:scale-110">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <MoreVertical className="w-5 h-5 text-gray-300" />
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{dept.name}</h4>
                <p className="text-[10px] text-gray-400 font-black uppercase mb-6 tracking-[0.2em]">{dept.code}</p>
                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <span className="text-[9px] font-black text-gray-400 group-hover:text-primary-600 transition-colors uppercase tracking-[0.2em]">Enter Analytics</span>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* School Analytics Column */}
        <div className="space-y-8">
           <div className="bg-gray-900 p-10 rounded-[3rem] shadow-2xl shadow-primary-200/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-indigo-500"></div>
              <div className="flex items-center justify-between mb-10">
                <h3 className="font-black text-white text-[10px] uppercase tracking-[0.3em]">Institutional Index</h3>
                <Activity className="text-primary-400 animate-pulse" size={20} />
              </div>
              
              <div className="h-72 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData?.deptContribution || []} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="department" type="category" width={1} hide />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '12px' }}
                    />
                    <Bar dataKey="percentage" fill="#f97316" radius={[0, 8, 8, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-10 space-y-4">
                 {attendanceData?.deptContribution?.slice(0, 3).map((dept, i) => (
                   <div key={i} className="flex items-center justify-between">
                     <span className="text-[10px] font-bold text-gray-400 truncate w-32">{dept.department}</span>
                     <div className="flex-1 mx-4 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500" style={{ width: `${dept.percentage}%` }}></div>
                     </div>
                     <span className="text-[10px] font-black text-white">{dept.percentage}%</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-primary-600 p-8 rounded-[3rem] text-white shadow-xl shadow-primary-100 relative group overflow-hidden">
             <div className="relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-80">Security Notice</h4>
                <p className="font-bold text-sm leading-relaxed mb-6">
                   You are currently monitoring the academic lifecycle of {schoolData.name}. All actions are audited for quality assurance.
                </p>
                <button className="w-full py-4 bg-white text-primary-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-700/20 hover:scale-[1.02] transition-all active:scale-[0.98]">
                   Access Audit Logs
                </button>
             </div>
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, trend }) => (
  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col gap-6 transition-all hover:shadow-xl group hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${color}-50 shadow-inner transition-all group-hover:scale-110`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest">{trend}</span>
    </div>
    <div>
      <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className="text-4xl font-black text-gray-900 tracking-tighter">{value}</p>
    </div>
  </div>
);

export default DeanDashboard;
