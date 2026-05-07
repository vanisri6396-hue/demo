import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { 
  ArrowLeft, Users, GraduationCap, Building2, Search, Table, Filter, 
  Layers, CheckCircle2, AlertCircle, Clock, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BASE_URL } from '../../config';

const DepartmentDashboard = () => {
  const { deptId } = useParams();
  const navigate = useNavigate();
  const [deptData, setDeptData] = useState(null);
  const [sectionStats, setSectionStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hierarchyRes, sectionRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/admin/hierarchy`, authHeader),
          axios.get(`${BASE_URL}/api/admin/attendance/department/${deptId}`, authHeader)
        ]);
        
        let foundDept = null;
        let parentSchool = null;
        for (const school of hierarchyRes.data) {
          const dept = school.departments.find(d => d._id === deptId);
          if (dept) {
            foundDept = dept;
            parentSchool = school;
            break;
          }
        }
        
        setDeptData({ ...foundDept, school: parentSchool });
        setSectionStats(sectionRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [deptId]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!deptData) return <div className="p-8 text-center text-red-500 font-bold">Department not found ❌</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Breadcrumbs & Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">
          <button onClick={() => navigate('/admin')} className="hover:text-indigo-600 transition-colors">UNIVERSITY</button>
          <ChevronRight size={14} className="text-gray-300" />
          <button onClick={() => navigate(`/admin/school/${deptData.school?._id}`)} className="hover:text-indigo-600 transition-colors">{deptData.school?.code}</button>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-indigo-600">{deptData.code}</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100 rotate-3 group-hover:rotate-0 transition-transform">
              <Layers className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-1">{deptData.name}</h1>
              <p className="text-gray-500 font-medium flex items-center gap-2">
                <Building2 size={16} />
                {deptData.school?.name} • Academic Department
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-2xl hover:bg-gray-50 transition-all shadow-sm font-semibold text-sm">
              <Filter className="w-4 h-4" />
              Analyze Range
            </button>
            <button className="flex items-center justify-center w-11 h-11 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              <Clock className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Attendance Section */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-bold text-gray-800">Section Attendance Analysis</h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span className="text-xs font-bold text-gray-400">PRESENT RATE</span>
                </div>
              </div>
            </div>
            <div className="h-80 w-full relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={sectionStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="section" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#9ca3af' }} />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="percentage" radius={[8, 8, 0, 0]} barSize={45}>
                    {sectionStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.percentage > 85 ? '#6366f1' : entry.percentage > 70 ? '#818cf8' : '#a5b4fc'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section Table */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-800">Detailed Section Insights</h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Filter sections..." 
                  className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 shadow-sm"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-50">
                  <tr>
                    <th className="px-8 py-5">Academic Section</th>
                    <th className="px-8 py-5">Strength</th>
                    <th className="px-8 py-5">Engagement</th>
                    <th className="px-8 py-5 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sectionStats.map((item, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${item.percentage > 85 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                          <span className="font-bold text-gray-900 text-lg">{item.section}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users size={16} className="text-gray-300" />
                          <span className="font-bold">{item.total}</span>
                          <span className="text-xs text-gray-400">Students</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between w-48">
                            <span className="text-xs font-black text-gray-900">{Math.round(item.percentage)}%</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">SUCCESS RATE</span>
                          </div>
                          <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.percentage}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full rounded-full ${item.percentage > 85 ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'bg-indigo-300'}`}
                            ></motion.div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="px-4 py-2 bg-white border border-gray-100 text-indigo-600 text-xs font-bold rounded-xl shadow-sm hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-95">
                          REPORTS
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2rem] shadow-xl shadow-indigo-100 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-6">Quick Overview</h3>
              <div className="space-y-6">
                <InfoItem icon={<CheckCircle2 size={18} />} label="Sections Active" value={sectionStats.length} />
                <InfoItem icon={<GraduationCap size={18} />} label="Total Programs" value={deptData.programs?.length || 0} />
                <InfoItem icon={<AlertCircle size={18} />} label="Flagged Sections" value="0" />
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Table className="w-5 h-5 text-indigo-500" />
              Academic Programs
            </h3>
            <div className="space-y-3">
              {deptData.programs?.map((program, idx) => (
                <div key={idx} className="group p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-700 font-bold hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-all cursor-default">
                  {program}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <span className="text-xs font-semibold text-indigo-100">{label}</span>
    </div>
    <span className="text-xl font-black">{value}</span>
  </div>
);

export default DepartmentDashboard;
