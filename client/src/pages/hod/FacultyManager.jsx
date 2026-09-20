import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Loader2,
  XCircle,
  ChevronRight
} from 'lucide-react';

export default function FacultyManager() {
  const location = useLocation();
  const [faculty, setFaculty] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    name: '', email: '', password: '', employeeId: '', 
    schoolId: '', departmentId: '', role: 'teacher'
  });
  const [summary, setSummary] = useState({ total: 0, active: 0 });

  // ── Search & filter state ─────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterSchoolId, setFilterSchoolId] = useState('');
  const [filterDeptId, setFilterDeptId] = useState('');
  const filterPanelRef = useRef(null);

  // Keep the profile link inside the section the user is browsing (admin vs HOD)
  const basePath = location.pathname.startsWith('/hod') ? '/hod/faculty' : '/admin/faculty';

  // Faculty store schoolId/departmentId as ObjectIds, so read the populated
  // objects first and fall back to the legacy plain-text `department` field.
  const schoolName     = (member) => member.schoolId?.name     || 'Not assigned';
  const departmentName = (member) => member.departmentId?.name || member.department || 'Not assigned';

  // Populated ObjectId (or raw id) of a member's school/department
  const schoolRef = (member) => member.schoolId?._id || member.schoolId || '';
  const deptRef   = (member) => member.departmentId?._id || member.departmentId || '';

  const selectedFilterSchool = hierarchy.find(s => s._id === filterSchoolId);
  const filterDeptOptions = (selectedFilterSchool?.departments || [])
    .map(d => ({ value: d._id, label: d.name }));

  const activeFilterCount = (filterSchoolId ? 1 : 0) + (filterDeptId ? 1 : 0);
  const hasActiveRefinements = activeFilterCount > 0 || searchQuery.trim() !== '';

  // Search + filters are applied together, reactively on every keystroke/change
  const filteredFaculty = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return faculty.filter(member => {
      const matchesSearch = !q || [
        member.name, member.email, member.employeeId,
        member.schoolId?.name, member.departmentId?.name, member.department
      ].some(value => (value || '').toLowerCase().includes(q));

      const matchesSchool = !filterSchoolId || schoolRef(member) === filterSchoolId;
      const matchesDept   = !filterDeptId   || deptRef(member)   === filterDeptId;

      return matchesSearch && matchesSchool && matchesDept;
    });
  }, [faculty, searchQuery, filterSchoolId, filterDeptId]);

  const clearRefinements = () => {
    setSearchQuery('');
    setFilterSchoolId('');
    setFilterDeptId('');
  };

  // Close the filter panel on outside click / Escape
  useEffect(() => {
    if (!showFilterPanel) return;

    const handleClickOutside = (e) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(e.target)) {
        setShowFilterPanel(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowFilterPanel(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showFilterPanel]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [usersRes, hierarchyRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/admin/users?role=teacher`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BASE_URL}/api/admin/hierarchy`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const users = usersRes.data.users || [];
      setFaculty(users);
      setHierarchy(hierarchyRes.data || []);
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    if (!newFaculty.schoolId || !newFaculty.departmentId) {
      return alert("Please select School and Department! ⚠️");
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/api/admin/users`, newFaculty, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setNewFaculty({ name: '', email: '', password: '', employeeId: '', schoolId: '', departmentId: '', role: 'teacher' });
      fetchData();
      alert('Faculty member added successfully! ✅');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add faculty ❌');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Faculty Directory</h1>
          <p className="text-gray-500 font-medium mt-1">Manage departmental teaching staff and course assignments.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 px-8 py-4 shadow-xl shadow-primary-100"
        >
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
            {new Set(faculty.map(f => departmentName(f))).size}
          </h3>
        </div>
        <div className="glass-card p-6 bg-white border-gray-100">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">PENDING VERIFICATION</p>
          <h3 className="text-3xl font-black text-red-600">0</h3>
        </div>
      </div>

      <div className="glass-card bg-white border-gray-100 overflow-hidden shadow-2xl min-h-[400px]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center gap-4">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search faculty name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-10 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 w-80 outline-none font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                title="Clear search"
                className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={18} />
              </button>
            )}
          </div>

          {/* Filter button + options panel */}
          <div className="relative" ref={filterPanelRef}>
            <button
              onClick={() => setShowFilterPanel(prev => !prev)}
              className={`p-3 rounded-xl transition-colors relative ${
                showFilterPanel || activeFilterCount > 0
                  ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Filter size={20} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {showFilterPanel && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-30 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Filter Faculty</h3>
                  <button
                    onClick={() => setShowFilterPanel(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">School</label>
                    <select
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 text-sm appearance-none"
                      value={filterSchoolId}
                      onChange={(e) => {
                        setFilterSchoolId(e.target.value);
                        // Cascade: a department belongs to a single school
                        setFilterDeptId('');
                      }}
                    >
                      <option value="">All Schools</option>
                      {hierarchy.map(school => (
                        <option key={school._id} value={school._id}>{school.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Department</label>
                    <select
                      disabled={!filterSchoolId}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 text-sm appearance-none disabled:opacity-50"
                      value={filterDeptId}
                      onChange={(e) => setFilterDeptId(e.target.value)}
                    >
                      <option value="">All Departments</option>
                      {filterDeptOptions.map(dept => (
                        <option key={dept.value} value={dept.value}>{dept.label}</option>
                      ))}
                    </select>
                    {!filterSchoolId && (
                      <p className="text-[9px] text-gray-400 font-bold italic px-1">Select a School first to filter by Department.</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-gray-50">
                  <button
                    onClick={() => { setFilterSchoolId(''); setFilterDeptId(''); }}
                    disabled={activeFilterCount === 0}
                    className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-40"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowFilterPanel(false)}
                    className="btn-primary px-6 py-2.5 text-xs uppercase tracking-widest"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active refinements + result count */}
        {hasActiveRefinements && (
          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center gap-3">
            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                Search: “{searchQuery.trim()}”
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-700">
                  <XCircle size={14} />
                </button>
              </span>
            )}
            {filterSchoolId && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                School: {selectedFilterSchool?.name || 'Selected'}
                <button onClick={() => { setFilterSchoolId(''); setFilterDeptId(''); }} className="text-gray-400 hover:text-gray-700">
                  <XCircle size={14} />
                </button>
              </span>
            )}
            {filterDeptId && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                Dept: {filterDeptOptions.find(d => d.value === filterDeptId)?.label || 'Selected'}
                <button onClick={() => setFilterDeptId('')} className="text-gray-400 hover:text-gray-700">
                  <XCircle size={14} />
                </button>
              </span>
            )}
            <button
              onClick={clearRefinements}
              className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700"
            >
              Clear all
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 md:ml-auto">
              Showing {filteredFaculty.length} of {faculty.length} faculty
            </span>
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-32 gap-4">
              <Loader2 className="animate-spin text-primary-500" size={50} />
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Faculty...</p>
            </div>
          ) : filteredFaculty.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 text-left border-b border-gray-100">
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Faculty Member</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">School</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Department</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee ID</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.map(member => (
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
                      <span className="font-bold text-gray-700">{schoolName(member)}</span>
                    </td>
                    <td className="p-6">
                      <span className="font-bold text-gray-700">{departmentName(member)}</span>
                    </td>
                    <td className="p-6">
                      <span className="font-bold text-gray-700">{member.employeeId || 'N/A'}</span>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        member.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${member.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <Link
                        to={`${basePath}/${member._id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-semibold inline-flex items-center gap-1"
                      >
                        Profile <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : faculty.length > 0 ? (
            <div className="p-32 text-center">
              <p className="text-gray-500 font-bold italic">No faculty match your search or filters.</p>
              <button
                onClick={clearRefinements}
                className="mt-4 text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-700"
              >
                Clear search &amp; filters
              </button>
            </div>
          ) : (
            <div className="p-32 text-center text-gray-500 italic">No faculty found.</div>
          )}
        </div>
      </div>


      {/* Add Faculty Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Add Faculty</h2>
                <p className="text-gray-500 text-sm font-medium">Create a new teacher record</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateFaculty} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Dr. Alan Turing"
                  className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 transition-all"
                  value={newFaculty.name}
                  onChange={(e) => setNewFaculty({...newFaculty, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">School</label>
                  <select 
                    required
                    className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 transition-all appearance-none"
                    value={newFaculty.schoolId}
                    onChange={(e) => setNewFaculty({...newFaculty, schoolId: e.target.value, departmentId: ''})}
                  >
                    <option value="">Select School</option>
                    {hierarchy.map(school => (
                      <option key={school._id} value={school._id}>{school.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Department</label>
                  <select 
                    required
                    disabled={!newFaculty.schoolId}
                    className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 transition-all appearance-none disabled:opacity-50"
                    value={newFaculty.departmentId}
                    onChange={(e) => setNewFaculty({...newFaculty, departmentId: e.target.value})}
                  >
                    <option value="">Select Dept</option>
                    {hierarchy.find(s => s._id === newFaculty.schoolId)?.departments.map(dept => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Employee ID</label>
                <input 
                  type="text" 
                  required
                  placeholder="FAC-2024-001"
                  className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 transition-all"
                  value={newFaculty.employeeId}
                  onChange={(e) => setNewFaculty({...newFaculty, employeeId: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="faculty@university.edu"
                  className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 transition-all"
                  value={newFaculty.email}
                  onChange={(e) => setNewFaculty({...newFaculty, email: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full px-5 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900 transition-all"
                  value={newFaculty.password}
                  onChange={(e) => setNewFaculty({...newFaculty, password: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary-100 mt-4"
              >
                Register Faculty <ChevronRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
