import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { 
  QrCode, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Calendar,
  ChevronRight,
  Loader2
} from 'lucide-react';

export default function StudentDashboard() {
  const [stats, setStats] = useState({ overall: 0 });
  const [alerts, setAlerts] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [dashRes, summaryRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/student/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/student/attendance/summary`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setAlerts(dashRes.data.alerts);
        setUpcoming(dashRes.data.upcomingClasses);
        setStats(dashRes.data.stats);
        setSubjects(summaryRes.data.summary);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto pb-20">
      {/* Header & Main Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Student Dashboard</h1>
          <p className="text-gray-500 font-medium mt-1">Track your attendance and stay above the threshold.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="glass-card px-6 py-4 bg-white flex items-center gap-4 border-primary-100 shadow-lg shadow-primary-50/50">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Overall Attendance</p>
              <p className="text-2xl font-black text-gray-900">{stats.overall}%</p>
            </div>
          </div>
          
          <Link to="/student/scan" className="bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-2xl shadow-xl shadow-primary-200 transition-all group flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <QrCode size={24} />
            </div>
            <span className="font-bold pr-2">Smart Check-In</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subject Cards */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Calendar size={20} className="text-primary-500" /> Subject-wise Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((sub, i) => (
              <div key={i} className="glass-card p-6 bg-white hover:shadow-xl transition-all border-gray-100 group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-black text-gray-900 group-hover:text-primary-600 transition-colors">{sub.name}</h4>
                    <p className="text-xs font-bold text-gray-400">{sub.code}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                    sub.attendance >= 75 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {sub.attendance >= 75 ? 'Safe' : 'Low'}
                  </div>
                </div>
                
                <div className="flex items-end justify-between mb-2">
                  <p className="text-3xl font-black text-gray-900">{sub.attendance}%</p>
                  <p className="text-xs font-bold text-gray-400 mb-1">{sub.present} / {sub.total} Classes</p>
                </div>
                
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      sub.percent >= 75 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${sub.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {subjects.length === 0 && (
              <div className="col-span-2 p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed">
                <p className="text-gray-400 font-bold">No attendance records yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Alerts / Recent Activity */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <AlertCircle size={20} className="text-amber-500" /> Critical Alerts
            </h3>
            <div className="space-y-4">
              {alerts.length > 0 ? alerts.map((alert, i) => (
                <div key={i} className={`p-4 rounded-2xl border flex gap-4 ${
                  alert.severity === 'high' ? 'bg-red-50 border-red-100' : 
                  alert.severity === 'success' ? 'bg-green-50 border-green-100' : 
                  'bg-amber-50 border-amber-100'
                }`}>
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    {alert.severity === 'high' ? <AlertCircle className="text-red-500" /> : <CheckCircle2 className="text-green-500" />}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${
                      alert.severity === 'high' ? 'text-red-900' : 'text-amber-900'
                    }`}>{alert.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{alert.message}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm font-medium text-gray-400 italic">No critical alerts today.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-primary-500" /> Upcoming Classes
            </h3>
            <div className="space-y-3">
              {upcoming.length > 0 ? upcoming.map((cls, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all cursor-default">
                  <div className="flex items-center gap-4">
                    <div className="text-xs font-black text-primary-600 bg-white px-2 py-1 rounded-lg border border-primary-100">
                      {cls.timeSlot}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{cls.subjectName || cls.subjectCode}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">{cls.room || 'TBA'}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              )) : (
                <p className="text-sm font-medium text-gray-400 italic">No more classes today.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dummy Icon for UserX since it's not imported in the list above but used in Alerts
function UserX({ size, className }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/>
    </svg>
  );
}
