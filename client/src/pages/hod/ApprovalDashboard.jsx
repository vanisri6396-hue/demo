import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { 
  CheckCircle2, 
  XCircle, 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  Search,
  Filter,
  Loader2,
  AlertCircle,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export default function ApprovalDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('hod'); // Default to HOD view
  const [filterType, setFilterType] = useState('all');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [step]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/authority/pending?step=${step}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data.requests);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/api/authority/review`, {
        requestId,
        status,
        note: reviewNote,
        step
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReviewModal(null);
      setReviewNote('');
      fetchRequests(); // Refresh list
    } catch (err) {
      alert('Review failed. Please try again.');
    }
  };

  const filteredRequests = requests.filter(r => 
    filterType === 'all' ? true : r.type === filterType
  );

  return (
    <div className="max-w-[1200px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Authority Approvals</h1>
          <p className="text-gray-500 font-medium mt-1">Review and verify student OD and Medical leave requests.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={() => setStep('classIncharge')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              step === 'classIncharge' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Class Incharge
          </button>
          <button 
            onClick={() => setStep('hod')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              step === 'hod' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            HOD View
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        {['all', 'onDuty', 'medical'].map(type => (
          <button 
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              filterType === type ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200'
            }`}
          >
            {type === 'onDuty' ? 'OD Requests' : type === 'medical' ? 'Medical' : 'All Requests'}
          </button>
        ))}
      </div>

      <div className="glass-card bg-white border-gray-100 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary-500" size={50} />
            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Loading requests...</p>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 text-left border-b border-gray-100">
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Details</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Request Info</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Documentation</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(req => (
                  <tr key={req._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 font-black text-lg">
                          {req.studentId?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900">{req.studentId?.name}</p>
                          <p className="text-xs font-bold text-gray-400 uppercase">{req.studentId?.rollNo} • {req.studentId?.section}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <span className={`w-fit px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          req.type === 'onDuty' ? 'bg-primary-50 text-primary-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {req.type === 'onDuty' ? 'On-Duty' : 'Medical Leave'}
                        </span>
                        <p className="text-sm font-bold text-gray-800 line-clamp-1">{req.reason}</p>
                        <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                          <Calendar size={10} /> {req.date}
                        </p>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-primary-50 text-primary-600 rounded-xl text-xs font-bold transition-all">
                          <FileText size={14} /> View Letter
                        </button>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setReviewModal(req)}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-100"
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-32 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Inbox is empty!</h3>
            <p className="text-gray-500 font-medium max-w-[250px] mx-auto mt-2">All pending requests for this stage have been processed.</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-[500px] w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Review Request</h2>
                <p className="text-sm text-gray-500 font-medium">Reviewing {reviewModal.studentId?.name}'s request</p>
              </div>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                reviewModal.type === 'onDuty' ? 'bg-primary-50 text-primary-600' : 'bg-red-50 text-red-600'
              }`}>
                {reviewModal.type}
              </span>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Student Reason</p>
                <p className="text-gray-900 font-bold">{reviewModal.reason}</p>
              </div>

              <button className="w-full flex items-center justify-center gap-3 p-4 bg-primary-50 text-primary-600 rounded-2xl border border-primary-100 hover:bg-primary-100 transition-all font-black uppercase tracking-widest text-xs">
                <ExternalLink size={18} /> Open Supporting Document
              </button>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Reviewer Note (Optional)</label>
                <textarea 
                  rows="3" 
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-primary-400 transition-all"
                  placeholder="e.g. Documentation verified, approved for 2 days."
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => handleReview(reviewModal._id, 'rejected')}
                  className="flex-1 py-4 bg-red-50 hover:bg-red-100 text-red-600 font-black uppercase tracking-widest text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> Reject
                </button>
                <button 
                  onClick={() => handleReview(reviewModal._id, 'approved')}
                  className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary-200 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> Approve
                </button>
              </div>
              
              <button 
                onClick={() => setReviewModal(null)}
                className="w-full py-2 text-gray-400 font-bold text-xs hover:text-gray-600"
              >
                Close without changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
