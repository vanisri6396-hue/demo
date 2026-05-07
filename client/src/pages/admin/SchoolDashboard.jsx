import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  ArrowLeft, Building2, Users, GraduationCap, ChevronRight, Search, LayoutGrid
} from 'lucide-react';
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
        // We need to find the school from the hierarchy or have a dedicated getSchool endpoint
        // For now, let's fetch hierarchy and filter, or use a new endpoint if available
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

  if (!schoolData) return <div className="p-8 text-center text-red-500">School not found ❌</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Breadcrumbs & Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to University Overview
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{schoolData.name}</h1>
              <p className="text-gray-500">{schoolData.code} • School Administrator Console</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Departments</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{schoolData.departments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <GraduationCap className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Avg Attendance</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {Math.round(attendanceData?.deptContribution?.reduce((acc, curr) => acc + curr.percentage, 0) / (attendanceData?.deptContribution?.length || 1))}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 text-purple-600 mb-2">
            <LayoutGrid className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Total Programs</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {schoolData.departments.reduce((acc, curr) => acc + (curr.programs?.length || 0), 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Comparison Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Department Attendance Comparison</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData?.deptContribution || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="percentage" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Academic Departments</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search departments..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] divide-y divide-gray-50">
            {schoolData.departments
              .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(dept => (
              <div 
                key={dept._id}
                onClick={() => navigate(`/admin/department/${dept._id}`)}
                className="p-4 hover:bg-gray-50 cursor-pointer group flex items-center justify-between transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{dept.name}</p>
                  <p className="text-xs text-gray-500">{dept.programs?.length || 0} Programs • {dept.code}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
