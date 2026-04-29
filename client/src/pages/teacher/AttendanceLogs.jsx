import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { FileSpreadsheet, Download, Search, Filter, UserCheck, UserX, Clock } from 'lucide-react';

export default function AttendanceLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    // For demo, we'll use dummy data but set up for real API call
    const fetchLogs = async () => {
      try {
        // const res = await axios.get(`${BASE_URL}/api/attendance/teacher-logs/${user.id}`);
        // setLogs(res.data);
        
        // Dummy data for now
        setLogs([
          { date: '2026-04-24', subject: 'Operating Systems', section: 'CSE-A', present: 54, total: 60, time: '09:30 AM' },
          { date: '2026-04-23', subject: 'Operating Systems', section: 'CSE-A', present: 58, total: 60, time: '12:10 PM' },
          { date: '2026-04-21', subject: 'OS Lab', section: 'CSE-A', present: 59, total: 60, time: '11:20 AM' },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [user.id]);

  const exportToExcel = () => {
    if (logs.length === 0) return;

    // Create CSV header
    const headers = ['Date', 'Time', 'Subject', 'Section', 'Present', 'Total', 'Percentage'];
    
    // Map logs to CSV rows
    const rows = logs.map(log => [
      log.date,
      log.time,
      log.subject,
      log.section,
      log.present,
      log.total,
      `${Math.round((log.present / log.total) * 100)}%`
    ]);

    // Construct CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_Logs_${user.name || 'Teacher'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance History</h1>
          <p className="text-gray-500 font-medium">Review and export logs for your previous classes.</p>
        </div>
        <button 
          onClick={exportToExcel}
          className="btn-secondary flex items-center gap-2 border-primary-200 text-primary-700 hover:bg-primary-50 transition-all"
        >
          <Download size={18} /> Export as Excel
        </button>
      </div>
      {/* ... rest of the component ... */}

      <div className="glass-card overflow-hidden bg-white border-gray-100 shadow-xl">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                placeholder="Search date or section..." 
                className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-400 w-64"
              />
            </div>
            <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900">
              <Filter size={16} /> Filter by Subject
            </button>
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">3 Sessions Found</p>
        </div>

        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-gray-50">
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Section</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Attendance</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => {
              const percentage = Math.round((log.present / log.total) * 100);
              return (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{new Date(log.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p className="text-xs text-gray-500 font-medium">{log.time}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 font-bold text-gray-700">{log.subject}</td>
                  <td className="p-6 text-center">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-black text-gray-600 uppercase">{log.section}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-1 items-center">
                      <div className="flex items-center gap-2 text-sm font-black text-gray-900">
                        <UserCheck size={14} className="text-green-500" /> {log.present} <span className="text-gray-300">/</span> {log.total}
                      </div>
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${percentage > 90 ? 'bg-green-500' : 'bg-primary-500'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700">View Roster</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex gap-6">
        <div className="flex-1 glass-card p-6 flex items-center gap-4 bg-green-50 border-green-100">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-green-700 uppercase tracking-widest">Avg. Attendance</p>
            <p className="text-2xl font-black text-green-900">94.2%</p>
          </div>
        </div>
        <div className="flex-1 glass-card p-6 flex items-center gap-4 bg-primary-50 border-primary-100">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-sm">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-primary-700 uppercase tracking-widest">Total Reports</p>
            <p className="text-2xl font-black text-primary-900">248</p>
          </div>
        </div>
      </div>
    </div>
  );
}
