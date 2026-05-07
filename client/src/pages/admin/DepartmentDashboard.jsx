import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  ArrowLeft, Users, GraduationCap, Building2, Search, Table, Filter
} from 'lucide-react';
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
        // Fetch all schools to find the department and its parent school
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

  if (!deptData) return <div className="p-8 text-center text-red-500">Department not found ❌</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Breadcrumbs & Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
          <button onClick={() => navigate('/admin')} className="hover:text-indigo-600">University</button>
          <span>/</span>
          <button onClick={() => navigate(`/admin/school/${deptData.school?._id}`)} className="hover:text-indigo-600">{deptData.school?.name}</button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{deptData.name}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{deptData.name}</h1>
              <p className="text-gray-500">Department Overview • {deptData.code}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            Filter Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section Stats Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Section Attendance Analysis</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="section" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="percentage" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Programs Info */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Table className="w-5 h-5 text-indigo-500" />
            Academic Programs
          </h3>
          <div className="space-y-3">
            {deptData.programs?.map((program, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 font-medium">
                {program}
              </div>
            ))}
            {(!deptData.programs || deptData.programs.length === 0) && (
              <p className="text-gray-400 text-sm italic">No specific programs listed.</p>
            )}
          </div>
        </div>

        {/* Detailed Section Table */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Section-wise Detailed Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Section Name</th>
                  <th className="px-6 py-4">Total Students</th>
                  <th className="px-6 py-4">Present Today</th>
                  <th className="px-6 py-4">Attendance Rate</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sectionStats.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.section}</td>
                    <td className="px-6 py-4 text-gray-600">{item.total}</td>
                    <td className="px-6 py-4 text-gray-600">{item.present}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${item.percentage > 85 ? 'bg-emerald-500' : item.percentage > 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-700">{Math.round(item.percentage)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">View Students</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDashboard;
