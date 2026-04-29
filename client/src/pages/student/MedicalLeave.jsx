import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Calendar, 
  Activity,
  Loader2,
  AlertCircle,
  Upload,
  X
} from 'lucide-react';

export default function MedicalLeave() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ disease: '', date: '', description: '' });
  const [showTemplate, setShowTemplate] = useState(false);

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isPastDeadline = new Date().getHours() >= 17;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/student/leaves`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data.leaves.filter(l => l.type === 'medical'));
    } catch (err) {
      console.error('Error fetching medical requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateLetter = () => {
    setShowTemplate(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isPastDeadline && formData.date === new Date().toISOString().split('T')[0]) {
      alert("⚠️ Deadline Missed: Medical leave for today must be submitted before 5:00 PM. This request will be marked as 'Absent' by default.");
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/api/student/leaves`, {
        type: 'medical',
        date: formData.date,
        reason: formData.disease + ': ' + formData.description,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      alert("Submission failed");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Medical Leave</h1>
          <p className="text-gray-500 font-medium mt-1">Submit prescriptions before 5:00 PM to avoid being marked absent.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={generateLetter}
            className="px-6 py-4 bg-white border-2 border-gray-100 hover:border-red-200 text-gray-600 font-black uppercase tracking-widest text-sm rounded-2xl transition-all flex items-center gap-2"
          >
            <FileText size={20} /> Generate Letter
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="btn-primary bg-red-600 hover:bg-red-700 flex items-center gap-2 px-8 py-4 shadow-xl shadow-red-200 border-red-600"
          >
            <Plus size={20} /> Request Medical Leave
          </button>
        </div>
      </div>

      {isPastDeadline && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4 animate-pulse">
          <AlertCircle className="text-amber-500" />
          <p className="text-sm font-bold text-amber-900">
            5:00 PM Deadline Passed: Any medical leave submitted for today will result in an "Absent" mark unless verified manually by the Incharge.
          </p>
        </div>
      )}

      {/* Letter Template Modal */}
      {showTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-10 max-w-[700px] w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h2 className="text-xl font-black uppercase tracking-widest text-gray-400">Official Leave Format</h2>
              <button onClick={() => setShowTemplate(false)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
            </div>
            
            <div className="space-y-4 font-serif text-gray-800 p-8 border border-gray-100 rounded-xl bg-gray-50/30">
              <p className="font-bold">From,</p>
              <p>{user.name || '[STUDENT NAME]'}</p>
              <p>{user.rollNo || '[REGISTER NUMBER]'}</p>
              <p>{user.section || '[SECTION]'} - {user.department || '[DEPARTMENT]'}</p>
              <br />
              <p className="font-bold">To,</p>
              <p>The Class Incharge,</p>
              <p>Takshashila University.</p>
              <br />
              <p className="font-bold">Subject: Application for Medical Leave</p>
              <br />
              <p>Respected Sir/Madam,</p>
              <p>
                I am writing to inform you that I am unable to attend classes today due to <span className="font-bold underline text-red-600">{formData.disease || '[DISEASE REASON]'}</span>. I have consulted a doctor and have been advised rest. 
              </p>
              <p>
                I have attached my medical prescription as proof and I request you to kindly grant me leave for <span className="font-bold underline text-red-600">{formData.date || '[DATE]'}</span> and update my attendance accordingly.
              </p>
              <br />
              <p>Thanking You,</p>
              <p>Yours Sincerely,</p>
              <p className="font-bold underline italic">{user.name}</p>
            </div>
            
            <div className="mt-8 flex gap-4 justify-center">
              <button 
                onClick={() => window.print()}
                className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                Print Letter
              </button>
              <button 
                onClick={handleSubmit}
                className="px-10 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-red-200 hover:bg-red-700 transition-all flex items-center gap-2"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <div className="glass-card bg-white border-gray-100 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
            <Activity size={20} className="text-red-500" />
            <h3 className="text-xl font-black text-gray-900">Previous Requests</h3>
          </div>
          
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="animate-spin text-red-500" size={40} />
              <p className="text-gray-500 font-bold">Syncing medical records...</p>
            </div>
          ) : requests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-50">
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason / Diagnosis</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Applied On</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Certificate</th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req._id} className="border-b border-gray-50 last:border-0 hover:bg-red-50/10 transition-colors">
                      <td className="p-6">
                        <p className="font-bold text-gray-900">{req.reason.split(':')[0]}</p>
                        <p className="text-xs text-gray-500">{req.reason.split(':')[1] || 'No extra info'}</p>
                      </td>
                      <td className="p-6 text-center">
                        <p className="text-sm font-bold text-gray-700">
                          {new Date(req.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </p>
                      </td>
                      <td className="p-6 text-center">
                        <div className="flex justify-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 cursor-pointer hover:bg-primary-50 hover:text-primary-500 transition-all">
                            <FileText size={20} />
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 ${
                            req.status === 'approved' ? 'bg-green-50 text-green-600' :
                            req.status === 'rejected' ? 'bg-red-50 text-red-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {req.status === 'approved' ? <CheckCircle2 size={14} /> : 
                             req.status === 'rejected' ? <XCircle size={14} /> : 
                             <Clock size={14} />}
                            {req.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center flex flex-col items-center">
              <AlertCircle size={48} className="text-gray-200 mb-4" />
              <h3 className="text-lg font-bold text-gray-900">No medical leaves found</h3>
              <p className="text-gray-500 max-w-[250px] mx-auto mt-2">All your submitted medical documents will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-[500px] w-full shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Request Medical Leave</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Diagnosis / Reason</label>
                <input 
                  type="text" 
                  value={formData.disease}
                  onChange={(e) => setFormData({...formData, disease: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-red-400 transition-all"
                  placeholder="e.g. Viral Fever, Hospitalization"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Leave Date(s)</label>
                <input 
                  type="date" 
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-red-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Upload Certificate (PDF/JPG)</label>
                <div className="w-full p-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-red-50/30 hover:border-red-200 transition-all cursor-pointer">
                  <Upload size={32} className="text-gray-300" />
                  <p className="text-xs font-bold text-gray-400">Drag & drop or click to upload</p>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black uppercase tracking-widest text-sm rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-lg shadow-red-200 transition-all"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
