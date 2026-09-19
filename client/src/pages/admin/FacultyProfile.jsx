import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../config';
import {
  Mail, Phone, MapPin, ChevronLeft, Building2, BadgeCheck,
  UserSquare, Trash2, Briefcase, Clock
} from 'lucide-react';

export default function FacultyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const canDelete = currentUser.role === 'admin';

  // Stay inside the directory the profile was opened from (admin vs HOD)
  const basePath = location.pathname.startsWith('/hod') ? '/hod/faculty' : '/admin/faculty';

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/users/${id}`, authHeader);
        setFaculty(res.data);
      } catch (err) {
        console.error('Faculty profile error:', err);
        setFaculty(null);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) return;
    try {
      await axios.delete(`${BASE_URL}/api/admin/users/${id}`, authHeader);
      alert('Faculty deleted ✅');
      navigate(basePath);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed ❌');
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">Loading Profile...</div>;
  if (!faculty) return <div className="p-20 text-center font-bold">Faculty member not found.</div>;

  const schoolName     = faculty.schoolId?.name     || 'Not assigned';
  const departmentName = faculty.departmentId?.name || faculty.department || 'Not assigned';

  return (
    <div className="max-w-[1000px] mx-auto pb-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-8 transition-colors"
      >
        <ChevronLeft size={20} /> Back to Directory
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-8 bg-white text-center">
            <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl font-black">
              {faculty.name?.charAt(0) || <UserSquare size={36} />}
            </div>
            <h1 className="text-2xl font-black text-gray-900">{faculty.name}</h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">
              {faculty.employeeId || 'No Employee ID'}
            </p>

            <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col gap-4 text-left">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={18} className="text-gray-400" />
                <span className="text-sm font-medium truncate">{faculty.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} className="text-gray-400" />
                <span className="text-sm font-medium">{faculty.phone || 'No phone added'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={18} className="text-gray-400" />
                <span className="text-sm font-medium">{departmentName}</span>
              </div>
            </div>

            {canDelete && (
              <button
                onClick={handleDelete}
                className="w-full mt-10 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Delete Faculty
              </button>
            )}
          </div>
        </div>

{/* Assignment & Details */}
        <div className="md:col-span-2 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-6 bg-white border-primary-100">
              <div className="flex justify-between items-center mb-4">
                <BadgeCheck className={faculty.isActive ? 'text-green-500' : 'text-red-500'} size={24} />
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                  faculty.isActive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                }`}>
                  {faculty.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Status</p>
              <h3 className="text-2xl font-black text-gray-900 capitalize">
                {faculty.role === 'classIncharge' ? 'Class Incharge' : faculty.role}
              </h3>
            </div>
            <div className="glass-card p-6 bg-white border-primary-100">
              <div className="flex justify-between items-center mb-4">
                <Briefcase className="text-primary-500" size={24} />
                <span className="text-[10px] font-black text-primary-600 uppercase bg-primary-50 px-2 py-1 rounded">Faculty</span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Employee ID</p>
              <h3 className="text-2xl font-black text-gray-900">{faculty.employeeId || 'N/A'}</h3>
            </div>
          </div>

          <div className="glass-card p-8 bg-white">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Building2 size={20} className="text-gray-400" /> School &amp; Department Assignment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">School</p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {schoolName} {faculty.schoolId?.code && <span className="text-gray-400">({faculty.schoolId.code})</span>}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Department</p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {departmentName} {faculty.departmentId?.code && <span className="text-gray-400">({faculty.departmentId.code})</span>}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 bg-white">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-gray-400" /> Record Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</span>
                <span className="text-sm font-bold text-gray-900 truncate ml-4">{faculty.email}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</span>
                <span className="text-sm font-bold text-gray-900">{faculty.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Member Since</span>
                <span className="text-sm font-bold text-gray-900">
                  {faculty.createdAt ? new Date(faculty.createdAt).toLocaleDateString() : 'Unknown'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}