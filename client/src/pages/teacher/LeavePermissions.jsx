import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { ShieldCheck, CheckCircle, XCircle, Clock, FileText, User, Calendar } from 'lucide-react';

export default function LeavePermissions() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dummy data for leave requests (OD and Medical)
    setRequests([
      { id: 1, student: 'Amit Kumar', type: 'On-Duty (OD)', reason: 'Inter-College Hackathon', date: '2026-05-10', status: 'pending' },
      { id: 2, student: 'Sneha Rao', type: 'Medical Leave', reason: 'Severe Viral Fever', date: '2026-04-28', status: 'pending' },
      { id: 3, student: 'Rahul V', type: 'On-Duty (OD)', reason: 'Sports Meet', date: '2026-05-12', status: 'pending' },
    ]);
    setLoading(false);
  }, []);

  const handleAction = (id, action) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' } : req
    ));
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Student Permissions</h1>
        <p className="text-gray-500 font-medium mt-1">Review and approve digital OD letters and Medical leave requests.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests.map((req) => (
          <div key={req.id} className="glass-card p-6 bg-white border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                req.type.includes('Medical') ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
              }`}>
                <FileText size={28} />
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{req.student}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    req.type.includes('Medical') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {req.type}
                  </span>
                </div>
                <p className="text-gray-600 font-medium text-sm flex items-center gap-2">
                   <ShieldCheck size={14} className="text-gray-400" /> {req.reason}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 font-bold uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Calendar size={12} /> {req.date}</span>
                  <span className="flex items-center gap-1.5"><Clock size={12} /> Applied 2h ago</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {req.status === 'pending' ? (
                <>
                  <button 
                    onClick={() => handleAction(req.id, 'reject')}
                    className="flex-1 md:flex-none px-6 py-3 border-2 border-red-50 text-red-500 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                  <button 
                    onClick={() => handleAction(req.id, 'approve')}
                    className="flex-1 md:flex-none px-6 py-3 bg-primary-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-700 shadow-lg shadow-primary-100 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                </>
              ) : (
                <span className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 ${
                  req.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {req.status === 'approved' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  Request {req.status}
                </span>
              )}
              <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:text-gray-900 transition-all">
                <FileText size={20} />
              </button>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="glass-card p-20 text-center flex flex-col items-center bg-white opacity-50">
            <ShieldCheck size={48} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest">No Pending Requests</h3>
          </div>
        )}
      </div>
    </div>
  );
}
