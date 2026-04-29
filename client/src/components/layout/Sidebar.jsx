import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserSquare, Calendar, BarChart3, 
  Settings, LogOut, FileText, Activity, BookOpen, Clock, 
  QrCode, ClipboardList, ShieldAlert, FileSpreadsheet
} from 'lucide-react';

const navConfig = {
  admin: [
    { title: 'Overview', path: '/admin', icon: LayoutDashboard },
    { title: 'Students', path: '/admin/students', icon: Users },
    { title: 'Faculty', path: '/admin/faculty', icon: UserSquare },
    { title: 'Timetable', path: '/admin/timetable', icon: Calendar },
    { title: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ],
  authority: [
    { title: 'Overview', path: '/hod', icon: LayoutDashboard },
    { title: 'Sections', path: '/hod/sections', icon: Users },
    { title: 'Faculty', path: '/hod/faculty', icon: UserSquare },
    { title: 'Statistics', path: '/hod/statistics', icon: BarChart3 },
    { title: 'Monthly Reports', path: '/hod/reports', icon: FileSpreadsheet },
    { title: 'Audit Logs', path: '/hod/audit', icon: Activity },
  ],
  student: [
    { title: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { title: 'OD Requests', path: '/student/od-requests', icon: FileText },
    { title: 'Medical Leave', path: '/student/medical-leave', icon: ClipboardList },
    { title: 'Attendance History', path: '/student/history', icon: Clock },
    { title: 'Profile', path: '/student/profile', icon: UserSquare },
  ],
  teacher: [
    { title: 'Dashboard', path: '/teacher', icon: LayoutDashboard },
    { title: 'Timetable', path: '/teacher/timetable', icon: Calendar },
    { title: 'Attendance Logs', path: '/teacher/logs', icon: BookOpen },
    { title: 'Permissions', path: '/teacher/permissions', icon: ShieldAlert },
  ],
  invigilator: [
    { title: 'Dashboard', path: '/invigilator', icon: LayoutDashboard },
    { title: 'Exam Schedule', path: '/invigilator/schedule', icon: Calendar },
    { title: 'Reports', path: '/invigilator/reports', icon: BarChart3 },
  ]
};

const getPortalDetails = (role) => {
  switch(role) {
    case 'admin': return { title: 'Takshashila', subtitle: 'Admin Portal' };
    case 'authority': return { title: 'Takshashila', subtitle: 'HOD Portal' };
    case 'student': return { title: 'Academia', subtitle: 'Student Portal' };
    case 'teacher': return { title: 'Takshashila', subtitle: 'Academic Portal' };
    case 'invigilator': return { title: 'Takshashila', subtitle: 'University' };
    default: return { title: 'Takshashila', subtitle: 'Portal' };
  }
};

export default function Sidebar({ role = 'student' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = navConfig[role] || [];
  const portal = getPortalDetails(role);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
            TU
          </div>
          <div>
            <h2 className="text-gray-900 font-bold text-lg leading-tight">{portal.title}</h2>
            <p className="text-gray-500 text-xs font-medium">{portal.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">MAIN NAVIGATION</p>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isReallyActive = location.pathname === item.path;

            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isReallyActive 
                    ? 'bg-primary-50 text-primary-600 shadow-[inset_4px_0_0_0_#f97316]' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} className={isReallyActive ? 'text-primary-500' : 'text-gray-400'} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100 flex flex-col gap-4">
        {role === 'student' && (
          <button className="w-full flex items-center justify-center gap-2 bg-primary-100 text-primary-700 hover:bg-primary-200 py-3 rounded-xl font-semibold transition-colors duration-200">
            <QrCode size={18} />
            Quick Scan
          </button>
        )}
        {(role === 'admin' || role === 'authority' || role === 'teacher') && (
          <button className="btn-primary w-full flex items-center justify-center gap-2">
            {role === 'teacher' ? 'Start Session' : 'Generate Report'}
          </button>
        )}
        
        <div className="flex flex-col gap-1 mt-2">
          <Link 
            to={role === 'authority' ? '/hod/settings' : `/${role}/settings`} 
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Settings size={18} className="text-gray-400" />
            <span>Settings</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full text-left">
            <LogOut size={18} className="text-red-400" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
