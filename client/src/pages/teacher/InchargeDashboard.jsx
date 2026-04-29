import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock, 
  AlertCircle,
  User,
  Loader2,
  Filter
} from 'lucide-react';

export default function InchargeDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchPending = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/authority/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter for requests needing Class Incharge approval (step 1)
      setRequests(res.data.pending.filter(r => r.approvals.classIncharge.status === 'pending'));
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleReview = async (id, status, feedback = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/api/authority/review`, {
        requestId: id,
        status, // 'approved' or 'rejected'
        feedback
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPending();
    } catch (err) {
      alert('Review submission failed');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Incharge Verification</h1>
          <p className="text-gray-500 font-medium mt-1">Review student applications before they reach the HOD.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100 flex items-center gap-3">
            <Clock className="text-amber-500" />
            <div>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Pending</p>
              <p className="text-xl font-black text-amber-900">{requests.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="p-32 flex flex-col items-center">
            <Loader2 className="animate-spin text-primary-500 mb-4" size={40} />
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Fetching requests...</p>
          </div>
        ) : requests.length > 0 ? (
          requests.map(req => (
            <div key={req._id} className="glass-card bg-white border-gray-100 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 hover:border-primary-200 transition-all shadow-xl">
              <div className="flex items-start gap-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  req.type === 'medical' ? 'bg-red-50 text-red-500' : 'bg-primary-50 text-primary-500'
                }`}>
                  {req.type === 'medical' ? <AlertCircle size={30} /> : <FileText size={30} />}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-black text-gray-900">{req.studentId?.name}</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-2 py-1 rounded text-gray-500">
                      {req.studentId?.rollNo}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-700">{req.reason}</p>
                  <p className="text-xs text-gray-400 font-medium mt-2 flex items-center gap-2">
                    <Clock size={12} /> Applied {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <button 
                  onClick={() => setSelectedDoc(req.documentUrl || 'https://via.placeholder.com/600x800?text=Prescription+Letter')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 text-gray-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all"
                >
                  <Eye size={16} /> View Proof
                </button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => handleReview(req._id, 'rejected')}
                    className="flex-1 sm:flex-none p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                  >
                    <XCircle size={20} />
                  </button>
                  <button 
                    onClick={() => handleReview(req._id, 'approved')}
                    className="flex-1 sm:flex-none px-8 py-3 bg-green-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
                  >
                    Verify & Forward
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-32 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-green-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Queue Cleared!</h3>
            <p className="text-gray-500 font-medium max-w-[300px] mx-auto mt-2">No pending verification requests from your students right now.</p>
          </div>
        )}
      </div>

      {/* Doc Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-4 max-w-[800px] w-full shadow-2xl relative">
            <button onClick={() => setSelectedDoc(null)} className="absolute -top-12 right-0 text-white flex items-center gap-2 font-black uppercase tracking-widest text-xs">
              Close <XCircle />
            </button>
            <img src={selectedDoc} alt="Document Proof" className="w-full rounded-2xl border border-gray-100 shadow-inner" />
          </div>
        </div>
      )}
    </div>
  );
}
