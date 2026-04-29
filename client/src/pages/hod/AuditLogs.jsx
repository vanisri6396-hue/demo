import { useState } from 'react';
import { Shield, Clock, Search, Filter, ArrowUpRight, CheckCircle2, XCircle, Info } from 'lucide-react';

export default function AuditLogs() {
  const [logs] = useState([
    { id: 1, action: 'OD Approved', user: 'HOD (Dr. Smith)', target: 'CS24001', time: '10 mins ago', type: 'SUCCESS' },
    { id: 2, action: 'Timetable Updated', user: 'Admin', target: 'CSE-A', time: '1 hour ago', type: 'INFO' },
    { id: 3, action: 'Medical Rejected', user: 'Class Incharge', target: 'CS24045', time: '3 hours ago', type: 'ERROR' },
    { id: 4, action: 'Event Published', user: 'HOD (Dr. Smith)', target: 'Tech Fest', time: '5 hours ago', type: 'SUCCESS' },
    { id: 5, action: 'QR Session Overridden', user: 'Admin', target: 'Room 302', time: 'Yesterday', type: 'WARNING' },
  ]);

  return (
    <div className="max-w-[1000px] mx-auto pb-20">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Audit Logs</h1>
          <p className="text-gray-500 font-medium mt-1">Immutable record of all administrative and system actions.</p>
        </div>
        <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
          <Shield size={24} />
        </div>
      </div>

      <div className="glass-card bg-white border-gray-100 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter by action or user..." 
              className="pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 w-80 outline-none font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all">
            <Filter size={16} /> Filter
          </button>
        </div>

        <div className="p-2">
          {logs.map(log => (
            <div key={log.id} className="group flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  log.type === 'SUCCESS' ? 'bg-green-50 text-green-600' :
                  log.type === 'ERROR' ? 'bg-red-50 text-red-600' :
                  log.type === 'WARNING' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {log.type === 'SUCCESS' ? <CheckCircle2 size={18} /> :
                   log.type === 'ERROR' ? <XCircle size={18} /> : <Info size={18} />}
                </div>
                <div>
                  <h4 className="font-black text-gray-900 flex items-center gap-2">
                    {log.action}
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-1.5 py-0.5 rounded">
                      {log.user}
                    </span>
                  </h4>
                  <p className="text-xs text-gray-500 font-medium">Target: <span className="font-bold text-gray-700">{log.target}</span></p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase flex items-center justify-end gap-1 mb-1">
                  <Clock size={10} /> {log.time}
                </p>
                <button className="text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-black uppercase tracking-widest flex items-center gap-1 justify-end ml-auto">
                  Details <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/30 text-center">
          <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary-600 transition-colors">
            Load Older Logs
          </button>
        </div>
      </div>
    </div>
  );
}
