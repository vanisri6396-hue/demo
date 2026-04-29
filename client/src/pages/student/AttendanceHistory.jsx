import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function AttendanceHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/student/attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogs(res.data.records || []);
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = (logs || []).filter(log => 
    filter === 'all' ? true : log.status === filter
  );

  return (
    <div className="max-w-[1200px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Attendance History</h1>
          <p className="text-gray-500 font-medium mt-1">Detailed log of all your marked classes.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          {['all', 'present', 'absent', 'onDuty'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card bg-white border-gray-100 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary-500" size={50} />
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Loading logs...</p>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 text-left border-b border-gray-100">
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="p-6">
                      <p className="font-black text-gray-900">{new Date(log.timestamp || log.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase">
                        <Clock size={10} /> {new Date(log.timestamp || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-gray-800">{log.subjectId?.name || 'General'}</p>
                      <p className="text-[10px] font-black text-primary-500 uppercase">{log.subjectId?.code || 'GEN'}</p>
                    </td>
                    <td className="p-6">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">
                        {log.sessionId?.type || 'QR Scan'}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        log.status === 'present' ? 'bg-green-50 text-green-600' :
                        log.status === 'absent' ? 'bg-red-50 text-red-600' :
                        'bg-primary-50 text-primary-600'
                      }`}>
                        {log.status === 'present' ? <CheckCircle2 size={12} /> : 
                         log.status === 'absent' ? <XCircle size={12} /> : 
                         <Calendar size={12} />}
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-32 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Clock size={40} className="text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900">No logs found</h3>
            <p className="text-gray-500 font-medium max-w-[250px] mx-auto mt-2">Your attendance history will start appearing once you scan QR codes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
