import { useState } from 'react';
import { 
  BarChart3, Activity, AlertCircle, QrCode, 
  CheckCircle2, Clock, Play, FileText, ChevronRight
} from 'lucide-react';

export default function DepartmentIntelligence() {
  const sections = [
    { name: 'CSE-A', incharge: 'Dr. Sarah Johnson', attendance: 92, status: 'Healthy' },
    { name: 'CSE-B', incharge: 'Prof. Alan Turing', attendance: 85, status: 'Healthy' },
    { name: 'CSE-C', incharge: 'Dr. Grace Hopper', attendance: 64, status: 'Critical' },
    { name: 'CSE-D', incharge: 'Prof. John von Neumann', attendance: 78, status: 'Stable' },
  ];

  const facultyStatus = [
    { name: 'Dr. Emily Watson', subject: 'Algorithms Lab (L-102)', status: 'ACTIVE QR', lastGen: '4m ago' },
    { name: 'Prof. Robert Smith', subject: 'Computer Networks (S-401)', status: 'COMPLETED', lastGen: '12m ago' },
    { name: 'Dr. Lisa Chen', subject: 'Database Systems (L-105)', status: 'ACTIVE QR', lastGen: '1m ago' },
    { name: 'Dr. James Wilson', subject: 'Software Eng. (S-202)', status: 'ACTIVE QR', lastGen: '8m ago' },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto">
      {/* Header Actions */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Departmental Intelligence</h1>
          <p className="text-gray-500">Real-time attendance analytics for Computer Science & Engineering</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Activity size={18} /> System Audit Logs
          </button>
          <button className="btn-primary flex items-center gap-2">
            <FileText size={18} /> Generate Department Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analytics Card */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="glass-card p-8 bg-white">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Average Attendance</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CURRENT ACADEMIC WEEK</p>
              </div>
              <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                +2.4% vs last week
              </span>
            </div>
            
            <div className="flex items-end gap-10 mb-8">
              <h2 className="text-7xl font-black text-gray-900 tracking-tighter">88.4%</h2>
              <div className="flex-1 flex items-end gap-2 h-24 mb-2">
                {[40, 60, 45, 70, 50, 85, 95, 80].map((h, i) => (
                  <div key={i} className="flex-1 bg-gray-100 rounded-t-sm relative group">
                    <div 
                      className={`absolute bottom-0 w-full rounded-t-sm transition-all duration-500 ${i === 6 ? 'bg-primary-500' : 'bg-primary-200 group-hover:bg-primary-300'}`} 
                      style={{ height: `${h}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Total Students</p>
                <p className="text-lg font-bold text-gray-900">1,240</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Active Sessions</p>
                <p className="text-lg font-bold text-gray-900">14/18</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Avg. Time to Scan</p>
                <p className="text-lg font-bold text-gray-900">1.2s</p>
              </div>
            </div>
          </div>

          {/* Section-wise Overview */}
          <div className="glass-card p-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-lg">Section-wise Overview</h3>
              <button className="text-primary-600 hover:text-primary-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                View Full List <ChevronRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Section</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">In-Charge</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Attendance</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sections.map((section, i) => (
                    <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-700">{section.name}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">{section.incharge}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${section.attendance < 75 ? 'bg-red-500' : 'bg-green-500'}`} 
                              style={{ width: `${section.attendance}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-bold ${section.attendance < 75 ? 'text-red-500' : 'text-gray-900'}`}>{section.attendance}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${section.status === 'Critical' ? 'text-red-600' : section.status === 'Healthy' ? 'text-green-600' : 'text-blue-600'}`}>
                          {section.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Critical Alerts */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 text-red-600 mb-6">
              <AlertCircle size={20} />
              <h3 className="font-bold text-gray-900">Critical Alerts</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl flex gap-3">
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                  <Activity size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-900 mb-1">Section CSE-C Alert</h4>
                  <p className="text-xs text-red-700 leading-relaxed">Attendance dropped to 64% (Threshold: 75%)</p>
                </div>
              </div>
              <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl flex gap-3">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center shrink-0">
                  <QrCode size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-orange-900 mb-1">Scan Timeout</h4>
                  <p className="text-xs text-orange-700 leading-relaxed">Professor Miller's session QR expired prematurely.</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 text-xs text-gray-400 font-bold uppercase tracking-wider hover:text-primary-500 transition-colors">
              View All Alerts (5)
            </button>
          </div>

          {/* Faculty Live Status */}
          <div className="glass-card p-6">
            <h3 className="font-bold text-gray-900 mb-6">Faculty Live Status</h3>
            <div className="space-y-6">
              {facultyStatus.map((f, i) => (
                <div key={i} className="flex gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden">
                      <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                        {f.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-gray-900 leading-tight">{f.name}</h4>
                      <div className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 ${f.status === 'COMPLETED' ? 'bg-gray-100 text-gray-500' : 'bg-primary-50 text-primary-600'}`}>
                        {f.status === 'ACTIVE QR' ? <Play size={8} className="fill-current" /> : <CheckCircle2 size={8} />}
                        {f.status}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{f.subject}</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Gen: {f.lastGen}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
