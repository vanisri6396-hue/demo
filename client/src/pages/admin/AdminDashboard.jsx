import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  School, Users, GraduationCap, Building2, TrendingUp, ChevronRight, 
  Plus, Search, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BASE_URL } from '../../config';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];

const AdminDashboard = () => {
  const [hierarchy, setHierarchy] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'student',
    schoolId: '', departmentId: '', rollNo: '', employeeId: '',
    section: '', year: 1, semester: 1
  });

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [hierarchyRes, statsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/admin/hierarchy`, authHeader),
        axios.get(`${BASE_URL}/api/admin/dashboard`, authHeader)
      ]);
      setHierarchy(hierarchyRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/admin/users`, formData, authHeader);
      alert("User created successfully! ✅");
      setShowAddModal(false);
      setFormData({
        name: '', email: '', password: '', role: 'student',
        schoolId: '', departmentId: '', rollNo: '', employeeId: '',
        section: '', year: 1, semester: 1
      });
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create user ❌");
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Takshashila University Portal</h1>
          <p className="text-gray-500 mt-1">Global Institutional Overview & Administration</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Member
          </button>
          <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Building2 className="text-indigo-600" />} label="Total Schools" value={hierarchy.length} color="indigo" />
        <StatCard icon={<GraduationCap className="text-emerald-600" />} label="Total Students" value={stats?.totalStudents || 0} color="emerald" />
        <StatCard icon={<Users className="text-amber-600" />} label="Faculty Members" value={stats?.totalTeachers || 0} color="amber" />
        <StatCard icon={<TrendingUp className="text-rose-600" />} label="Avg Attendance" value={`${stats?.today?.attendancePercent || 0}%`} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Schools Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">School Performance Index</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hierarchy.map(s => ({ name: s.code, value: 80 + Math.random() * 15 }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Schools List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Academic Schools</h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search schools..." 
                  className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
              {hierarchy.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((school) => (
                <div 
                  key={school._id} 
                  onClick={() => navigate(`/admin/school/${school._id}`)}
                  className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                      {school.code}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{school.name}</p>
                      <p className="text-xs text-gray-500">{school.departments.length} Departments • View Analytics</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-6">Attendance Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Present', value: stats?.today?.presentToday || 1 },
                      { name: 'Absent', value: stats?.today?.absentToday || 0 },
                      { name: 'On Duty', value: stats?.today?.onDutyToday || 0 },
                      { name: 'Medical', value: stats?.today?.medicalToday || 0 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {COLORS.slice(0, 4).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <LegendItem color={COLORS[0]} label="Present" value={stats?.today?.presentToday || 0} />
              <LegendItem color={COLORS[1]} label="Absent" value={stats?.today?.absentToday || 0} />
              <LegendItem color={COLORS[2]} label="On Duty" value={stats?.today?.onDutyToday || 0} />
              <LegendItem color={COLORS[3]} label="Medical" value={stats?.today?.medicalToday || 0} />
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-900">Add New Member</h2>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <Plus className="w-6 h-6 rotate-45 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} required />
                  <Input label="Email Address" type="email" value={formData.email} onChange={v => setFormData({...formData, email: v})} required />
                  <Input label="Password" type="password" value={formData.password} onChange={v => setFormData({...formData, password: v})} required />
                  <Select label="Role" value={formData.role} options={['student', 'teacher', 'admin']} onChange={v => setFormData({...formData, role: v})} />
                  
                  <Select 
                    label="School" 
                    value={formData.schoolId} 
                    options={hierarchy.map(s => ({ label: s.name, value: s._id }))} 
                    onChange={v => setFormData({...formData, schoolId: v, departmentId: ''})} 
                  />
                  
                  {formData.schoolId && (
                    <Select 
                      label="Department" 
                      value={formData.departmentId} 
                      options={hierarchy.find(s => s._id === formData.schoolId)?.departments.map(d => ({ label: d.name, value: d._id })) || []} 
                      onChange={v => setFormData({...formData, departmentId: v})} 
                    />
                  )}

                  {formData.role === 'student' ? (
                    <>
                      <Input label="Roll Number" value={formData.rollNo} onChange={v => setFormData({...formData, rollNo: v})} />
                      <Input label="Section" value={formData.section} onChange={v => setFormData({...formData, section: v})} />
                      <Input label="Year" type="number" value={formData.year} onChange={v => setFormData({...formData, year: parseInt(v)})} />
                      <Input label="Semester" type="number" value={formData.semester} onChange={v => setFormData({...formData, semester: parseInt(v)})} />
                    </>
                  ) : (
                    <Input label="Employee ID" value={formData.employeeId} onChange={v => setFormData({...formData, employeeId: v})} />
                  )}
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">Create Member</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${color}-50`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const LegendItem = ({ color, label, value }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
      <span className="text-gray-600">{label}</span>
    </div>
    <span className="font-semibold text-gray-900">{value}</span>
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-500 uppercase">{label}</label>
    <input 
      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all"
      {...props}
      onChange={(e) => props.onChange(e.target.value)}
    />
  </div>
);

const Select = ({ label, options, value, onChange }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-500 uppercase">{label}</label>
    <select 
      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select {label}</option>
      {options.map((opt, i) => (
        typeof opt === 'string' 
          ? <option key={i} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
          : <option key={i} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export default AdminDashboard;
