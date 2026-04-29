import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { 
  BarChart3, 
  Download, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  FileSpreadsheet,
  Loader2,
  Calendar
} from 'lucide-react';

export default function MonthlyReport() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    section: 'CSE-A'
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/authority/monthly-report`, {
        params: filters,
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(res.data.report);
    } catch (err) {
      console.error('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const exportCSV = () => {
    const headers = "Roll No,Name,Total Classes,Attended,Percentage\n";
    const rows = report.map(r => `${r.rollNo},${r.name},${r.totalClasses},${r.attended},${r.percentage}%`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Attendance_Report_${months[filters.month]}_${filters.year}_${filters.section}.csv`;
    a.click();
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Monthly Reports</h1>
          <p className="text-gray-500 font-medium mt-1">Analyze department-wide attendance patterns and trends.</p>
        </div>
        <button 
          onClick={exportCSV}
          disabled={report.length === 0}
          className="flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-green-100 transition-all disabled:opacity-50"
        >
          <FileSpreadsheet size={20} /> Export Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="glass-card p-4 bg-white border-gray-100 flex flex-col gap-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Month</label>
          <select 
            value={filters.month}
            onChange={(e) => setFilters({...filters, month: e.target.value})}
            className="bg-transparent font-bold text-gray-900 outline-none"
          >
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
        <div className="glass-card p-4 bg-white border-gray-100 flex flex-col gap-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Year</label>
          <select 
            value={filters.year}
            onChange={(e) => setFilters({...filters, year: e.target.value})}
            className="bg-transparent font-bold text-gray-900 outline-none"
          >
            {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="glass-card p-4 bg-white border-gray-100 flex flex-col gap-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Section</label>
          <select 
            value={filters.section}
            onChange={(e) => setFilters({...filters, section: e.target.value})}
            className="bg-transparent font-bold text-gray-900 outline-none"
          >
            {['CSE-A', 'CSE-B', 'CSE-C', 'ECE-A', 'MECH-A'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button 
          onClick={fetchReport}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-100 transition-all"
        >
          Generate Report
        </button>
      </div>

      <div className="glass-card bg-white border-gray-100 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary-500" size={50} />
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs text-center">
              Processing data for {months[filters.month]}...
            </p>
          </div>
        ) : report.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 text-left border-b border-gray-100">
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Name</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Roll Number</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Classes</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Present</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Progress</th>
                </tr>
              </thead>
              <tbody>
                {report.map(row => (
                  <tr key={row._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="p-6">
                      <p className="font-black text-gray-900">{row.name}</p>
                    </td>
                    <td className="p-6">
                      <p className="text-xs font-bold text-gray-500 uppercase">{row.rollNo}</p>
                    </td>
                    <td className="p-6 text-center">
                      <span className="font-bold text-gray-700">{row.totalClasses}</span>
                    </td>
                    <td className="p-6 text-center">
                      <span className="font-bold text-gray-900">{row.attended}</span>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black ${
                            row.percentage >= 75 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {row.percentage}%
                          </span>
                          {row.percentage < 75 && <AlertTriangle size={14} className="text-red-500" />}
                        </div>
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              row.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${row.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-32 text-center flex flex-col items-center">
            <Calendar size={60} className="text-gray-100 mb-6" />
            <h3 className="text-xl font-black text-gray-900">No data available</h3>
            <p className="text-gray-500 font-medium max-w-[300px] mx-auto mt-2">
              There are no attendance records for {months[filters.month]} {filters.year} in {filters.section}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
