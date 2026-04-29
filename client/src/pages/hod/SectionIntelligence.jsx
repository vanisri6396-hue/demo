import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { 
  Users, 
  ChevronRight, 
  Search, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
  ArrowRight
} from 'lucide-react';

export default function SectionIntelligence() {
  const [sections, setSections] = useState([
    { name: 'CSE-A', totalStudents: 42, avgAttendance: 88, status: 'Healthy' },
    { name: 'CSE-B', totalStudents: 38, avgAttendance: 72, status: 'Critical' },
    { name: 'CSE-C', totalStudents: 45, avgAttendance: 84, status: 'Healthy' },
    { name: 'ECE-A', totalStudents: 40, avgAttendance: 79, status: 'Warning' },
  ]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-[1200px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Section Intelligence</h1>
          <p className="text-gray-500 font-medium mt-1">Cross-sectional performance analytics and department health.</p>
        </div>
        <div className="flex bg-white border border-gray-100 p-2 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 px-4 border-r">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-[10px] font-black uppercase text-gray-400">Healthy: 2</span>
          </div>
          <div className="flex items-center gap-2 px-4 border-r">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            <span className="text-[10px] font-black uppercase text-gray-400">Warning: 1</span>
          </div>
          <div className="flex items-center gap-2 px-4">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="text-[10px] font-black uppercase text-gray-400">Critical: 1</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section) => (
          <div key={section.name} className="glass-card bg-white border-gray-100 hover:border-primary-200 transition-all group overflow-hidden shadow-xl">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 group-hover:text-primary-600 transition-colors">{section.name}</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">B.Tech Computer Science</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  section.status === 'Healthy' ? 'bg-green-50 text-green-600' :
                  section.status === 'Critical' ? 'bg-red-50 text-red-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  {section.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Students</p>
                  <p className="text-xl font-bold text-gray-900">{section.totalStudents}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Attendance</p>
                  <p className={`text-xl font-bold ${section.avgAttendance < 75 ? 'text-red-600' : 'text-green-600'}`}>
                    {section.avgAttendance}%
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Alerts</p>
                  <p className="text-xl font-bold text-gray-900">{section.status === 'Healthy' ? '0' : '3'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1">
                  <span>Attendance Progress</span>
                  <span>Target: 85%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      section.avgAttendance >= 85 ? 'bg-green-500' :
                      section.avgAttendance >= 75 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${section.avgAttendance}%` }}
                  ></div>
                </div>
              </div>

              <button className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-2 group-hover:translate-y-[-2px]">
                View Section Details <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
