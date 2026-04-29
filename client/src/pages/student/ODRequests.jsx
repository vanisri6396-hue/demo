import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Calendar, 
  Trophy,
  Loader2,
  AlertCircle,
  Upload
} from 'lucide-react';

export default function ODRequests() {
  const [requests, setRequests] = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ eventName: '', date: '', reason: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [reqRes, eventRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/student/leaves`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/events`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setRequests(reqRes.data.leaves.filter(l => l.type === 'od'));
        setAvailableEvents(eventRes.data.events);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simulate submission for now
    const newRequest = {
      _id: Date.now().toString(),
      type: 'od',
      status: 'pending',
      reason: formData.eventName + ' - ' + formData.reason,
      createdAt: new Date().toISOString(),
      subjectId: { name: 'Multiple Subjects' }
    };
    setRequests([newRequest, ...requests]);
    setShowModal(false);
    setFormData({ eventName: '', date: '', reason: '' });
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">On-Duty Requests</h1>
          <p className="text-gray-500 font-medium mt-1">Submit and track OD requests for college events.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 px-8 py-4 shadow-xl shadow-primary-200"
        >
          <Plus size={20} /> New OD Request
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Events Sidebar */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Trophy size={22} className="text-primary-500" /> Available Events
          </h3>
          <div className="space-y-4">
            {availableEvents.map(event => (
              <div key={event._id} className="glass-card p-5 bg-white border-gray-100 hover:border-primary-200 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 bg-primary-50 text-primary-600 text-[10px] font-black uppercase rounded-lg">
                    {event.category}
                  </span>
                  <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                    <Calendar size={12} /> {event.date}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{event.name}</h4>
                <p className="text-xs text-gray-500 mb-4">{event.organizer}</p>
                <button 
                  onClick={() => {
                    setFormData({ ...formData, eventName: event.name });
                    setShowModal(true);
                  }}
                  className="w-full py-2 bg-gray-50 hover:bg-primary-500 hover:text-white text-gray-600 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  Apply OD
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Status Table */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Clock size={22} className="text-gray-400" /> Recent Status
          </h3>
          <div className="glass-card bg-white border-gray-100 overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary-500" size={40} />
                <p className="text-gray-500 font-bold">Fetching status...</p>
              </div>
            ) : requests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left border-b border-gray-100">
                      <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Event / Reason</th>
                      <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Applied On</th>
                      <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(req => (
                      <tr key={req._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                        <td className="p-6">
                          <p className="font-bold text-gray-900">{req.reason.split(' - ')[0]}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{req.reason.split(' - ')[1] || 'No additional details'}</p>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${
                                req.approvals?.classIncharge?.status === 'approved' ? 'bg-green-500' :
                                req.approvals?.classIncharge?.status === 'rejected' ? 'bg-red-500' : 'bg-amber-400'
                              }`}></div>
                              <span className="text-[10px] font-black text-gray-400 uppercase">Incharge</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${
                                req.approvals?.hod?.status === 'approved' ? 'bg-green-500' :
                                req.approvals?.hod?.status === 'rejected' ? 'bg-red-500' : 'bg-amber-400'
                              }`}></div>
                              <span className="text-[10px] font-black text-gray-400 uppercase">HOD Approval</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 w-fit ${
                            req.status === 'approved' ? 'bg-green-50 text-green-600' :
                            req.status === 'rejected' ? 'bg-red-50 text-red-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {req.status === 'approved' ? 'Active OD' : req.status}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                            <ExternalLink size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-20 text-center flex flex-col items-center">
                <AlertCircle size={48} className="text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-900">No requests found</h3>
                <p className="text-gray-500 max-w-[250px] mx-auto mt-2">Submit your first OD request by clicking the button above.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-[500px] w-full shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            <h2 className="text-2xl font-black text-gray-900 mb-6">New OD Request</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Event Name</label>
                <input 
                  type="text" 
                  value={formData.eventName}
                  onChange={(e) => setFormData({...formData, eventName: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-primary-400 transition-all"
                  placeholder="e.g. Smart India Hackathon"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Start Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-primary-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">End Date</label>
                  <input type="date" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-primary-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Reason / Details</label>
                <textarea 
                  rows="4" 
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-primary-400"
                  placeholder="Explain why you need OD..."
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Upload Request Letter (PDF/JPG)</label>
                <div className="w-full p-6 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-primary-50 hover:border-primary-200 transition-all cursor-pointer">
                  <Upload size={24} className="text-gray-300" />
                  <p className="text-[10px] font-bold text-gray-400">Click to upload signed letter</p>
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
                  className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-lg shadow-primary-200 transition-all"
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
