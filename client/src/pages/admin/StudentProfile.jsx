import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { 
  User, Mail, Phone, MapPin, Calendar, 
  ChevronLeft, Award, Clock, BookOpen, Trash2
} from 'lucide-react';

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/admin/users?role=student`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Since there is no single user fetch, we filter the list for now
        // Ideally, backend should have GET /api/admin/users/:id
        const found = res.data.users.find(u => u._id === id);
        setStudent(found);
      } catch (err) {
        console.error('Profile error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Student deleted ✅');
      navigate('/admin/students');
    } catch (err) {
      alert('Delete failed ❌');
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">Loading Profile...</div>;
  if (!student) return <div className="p-20 text-center font-bold">Student not found.</div>;

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
              {student.name.charAt(0)}
            </div>
            <h1 className="text-2xl font-black text-gray-900">{student.name}</h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">{student.rollNo}</p>
            
            <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col gap-4 text-left">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={18} className="text-gray-400" />
                <span className="text-sm font-medium truncate">{student.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} className="text-gray-400" />
                <span className="text-sm font-medium">{student.phone || 'No phone added'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={18} className="text-gray-400" />
                <span className="text-sm font-medium">{student.department} Section {student.section}</span>
              </div>
            </div>

            <button 
              onClick={handleDelete}
              className="w-full mt-10 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> Delete Student
            </button>
          </div>
        </div>

        {/* Stats & Details */}
        <div className="md:col-span-2 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-6 bg-white border-green-100">
              <div className="flex justify-between items-center mb-4">
                <Award className="text-green-500" size={24} />
                <span className="text-[10px] font-black text-green-600 uppercase bg-green-50 px-2 py-1 rounded">Excellent</span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Attendance %</p>
              <h3 className="text-3xl font-black text-gray-900">92%</h3>
            </div>
            <div className="glass-card p-6 bg-white border-primary-100">
              <div className="flex justify-between items-center mb-4">
                <BookOpen className="text-primary-500" size={24} />
                <span className="text-[10px] font-black text-primary-600 uppercase bg-primary-50 px-2 py-1 rounded">Year 3</span>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Semester</p>
              <h3 className="text-3xl font-black text-gray-900">Sem 5</h3>
            </div>
          </div>

          <div className="glass-card p-8 bg-white">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-gray-400" /> Recent Attendance History
            </h3>
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-primary-500 shadow-sm">
                      {i === 1 ? 'DS' : i === 2 ? 'OS' : 'CN'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {i === 1 ? 'Data Structures' : i === 2 ? 'Operating Systems' : 'Computer Networks'}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400">Oct {24-i}, 2024</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg shadow-sm">Present</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
