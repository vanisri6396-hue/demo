import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  ArrowLeft, Building2, Users, GraduationCap, ChevronRight, Search, LayoutGrid,
  BookOpen, MoreVertical, ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BASE_URL } from '../../config';

const SchoolDashboard = () => {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const [schoolData, setSchoolData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hierarchyRes, attendanceRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/admin/hierarchy`, authHeader),
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
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!schoolData) return <div className="p-8 text-center text-red-500 font-bold">School not found ❌</div>;

  const filteredDepts = schoolData.departments.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header & Navigation */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/admin/schools')}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-all mb-4 group font-medium"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Schools
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
              <Building2 className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{schoolData.name}</h1>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100 uppercase">
                  {schoolData.code}
                </span>
              </div>
              <p className="text-gray-500 font-medium">Academic Management Console • institutional Dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<BookOpen className="text-indigo-600" />} 
          label="Departments" 
          value={schoolData.departments.length} 
          color="indigo" 
        />
        <StatCard 
          icon={<GraduationCap className="text-emerald-600" />} 
          label="Avg Attendance" 
          value={`${Math.round(attendanceData?.deptContribution?.reduce((acc, curr) => acc + curr.percentage, 0) / (attendanceData?.deptContribution?.length || 1))}%`} 
          color="emerald" 
        />
        <StatCard 
          icon={<Users className="text-amber-600" />} 
          label="Active Faculty" 
          value="45+" 
          color="amber" 
        />
        <StatCard 
          icon={<LayoutGrid className="text-purple-600" />} 
          label="Programs" 
          value={schoolData.departments.reduce((acc, curr) => acc + (curr.programs?.length || 0), 0)} 
          color="purple" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Department Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">Academic Departments</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Quick search..." 
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredDepts.map((dept, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={dept._id}
                onClick={() => navigate(`/admin/department/${dept._id}`)}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <MoreVertical className="w-4 h-4 text-gray-300" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{dept.name}</h4>
                <p className="text-xs text-gray-400 font-medium uppercase mb-4 tracking-wider">{dept.code}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-[10px] font-bold text-gray-400 group-hover:text-indigo-500 transition-colors">VIEW SECTIONS</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-500 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* School-wide Attendance Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-800">Performance Index</h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">TODAY</span>
          </div>
          <div className="h-80 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData?.deptContribution || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="department" type="category" width={100} tick={{ fontSize: 10, fontWeight: 600 }} stroke="#9ca3af" />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="percentage" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-50">
            <p className="text-sm text-gray-500 leading-relaxed">
              Attendance patterns across all departments are monitored in real-time. Click any department card to manage its sections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:shadow-md hover:scale-[1.02]">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${color}-50 shadow-inner`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
    </div>
  </div>
);

export default SchoolDashboard;
