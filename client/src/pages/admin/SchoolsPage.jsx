import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Building2, Users, GraduationCap, ChevronRight, Search, 
  Filter, LayoutGrid, List as ListIcon, ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BASE_URL } from '../../config';

const SchoolsPage = () => {
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/admin/hierarchy`, authHeader);
        setHierarchy(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchHierarchy();
  }, []);

  const filteredSchools = hierarchy.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">University Schools</h1>
          <p className="text-gray-500 mt-1">Manage and monitor all 13 academic schools of Takshashila University</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search schools..." 
              className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {filteredSchools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Building2 className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Schools Found</h3>
          <p className="text-gray-500 max-w-sm text-center mb-8">
            It looks like the university hierarchy hasn't been initialized yet. Please ensure the database is seeded with the school data.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary flex items-center gap-2"
          >
            Refresh Data
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSchools.map((school, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={school._id}
              onClick={() => navigate(`/admin/school/${school._id}`)}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase tracking-wider">
                  {school.code}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                {school.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{school.departments?.length || 0} Depts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>~85% Avg</span>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-50 flex items-center justify-between group-hover:border-indigo-50 transition-colors">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">View Details</span>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">School Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Departments</th>
                <th className="px-6 py-4">Performance</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSchools.map((school) => (
                <tr 
                  key={school._id}
                  onClick={() => navigate(`/admin/school/${school._id}`)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{school.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{school.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{school.departments?.length || 0} Departments</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[85%]"></div>
                      </div>
                      <span className="text-xs font-bold text-gray-700">85%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 inline transition-all" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SchoolsPage;
