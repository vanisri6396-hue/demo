import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Clock, AlertCircle, Download } from 'lucide-react';

const data = [
  { name: 'Mon', attendance: 85, target: 80 },
  { name: 'Tue', attendance: 88, target: 80 },
  { name: 'Wed', attendance: 76, target: 80 },
  { name: 'Thu', attendance: 82, target: 80 },
  { name: 'Fri', attendance: 90, target: 80 },
];

const subjectData = [
  { name: 'DBMS', avg: 82 },
  { name: 'OS', avg: 74 },
  { name: 'Networks', avg: 88 },
  { name: 'AI', avg: 91 },
  { name: 'Math', avg: 65 },
];

export default function HODStatistics() {
  return (
    <div className="max-w-[1200px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Department Statistics</h1>
          <p className="text-gray-500 font-medium mt-1">Deep dive into attendance analytics and academic health.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-100 hover:border-primary-200 text-gray-600 font-black uppercase tracking-widest text-xs rounded-2xl transition-all">
          <Download size={18} /> Detailed PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 glass-card p-8 bg-white border-gray-100 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-gray-900">Weekly Attendance Trend</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-primary-500 rounded-full"></span>
                <span className="text-[10px] font-black text-gray-400 uppercase">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-gray-200 rounded-full"></span>
                <span className="text-[10px] font-black text-gray-400 uppercase">Target</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="attendance" stroke="#f97316" strokeWidth={4} dot={{ r: 6, fill: '#f97316', strokeWidth: 0 }} />
                <Line type="monotone" dataKey="target" stroke="#e2e8f0" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 bg-white border-gray-100 shadow-xl">
          <h3 className="text-xl font-black text-gray-900 mb-8">Subject Comparison</h3>
          <div className="space-y-6">
            {subjectData.map(sub => (
              <div key={sub.name} className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-gray-700">{sub.name}</span>
                  <span className={`text-xs font-black ${sub.avg < 75 ? 'text-red-600' : 'text-gray-900'}`}>{sub.avg}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${sub.avg < 75 ? 'bg-red-500' : 'bg-primary-500'}`}
                    style={{ width: `${sub.avg}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-4 bg-gray-50 border border-gray-100 text-gray-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:border-primary-300 transition-all">
            Analyze All Subjects
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-8 bg-white border-gray-100">
          <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">MoM Growth</p>
          <h4 className="text-2xl font-black text-gray-900">+4.2%</h4>
        </div>
        <div className="glass-card p-8 bg-white border-gray-100">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Students</p>
          <h4 className="text-2xl font-black text-gray-900">96.5%</h4>
        </div>
        <div className="glass-card p-8 bg-white border-gray-100">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
            <Clock size={24} />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Late Marked</p>
          <h4 className="text-2xl font-black text-gray-900">2.1%</h4>
        </div>
        <div className="glass-card p-8 bg-white border-gray-100">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Critical Units</p>
          <h4 className="text-2xl font-black text-gray-900">03</h4>
        </div>
      </div>
    </div>
  );
}
