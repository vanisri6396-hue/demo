import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Trophy, 
  Building, 
  Tag, 
  Loader2, 
  AlertCircle,
  X
} from 'lucide-react';

export default function EventManager() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    organizer: '',
    category: 'Tech',
    description: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data.events);
    } catch (err) {
      console.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/api/events`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      setFormData({ name: '', date: '', organizer: '', category: 'Tech', description: '' });
      fetchEvents();
    } catch (err) {
      alert('Failed to create event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this event?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-20">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Event Manager</h1>
          <p className="text-gray-500 font-medium mt-1">Add or remove events available for OD applications.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 px-8 py-4 shadow-xl shadow-primary-200"
        >
          <Plus size={20} /> Create New Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary-500" size={40} />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing events...</p>
          </div>
        ) : events.length > 0 ? (
          events.map(event => (
            <div key={event._id} className="glass-card p-6 bg-white border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative group">
              <button 
                onClick={() => handleDelete(event._id)}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                  <Trophy size={24} />
                </div>
                <span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black uppercase rounded-lg">
                  {event.category}
                </span>
              </div>
              
              <h3 className="text-lg font-black text-gray-900 mb-1">{event.name}</h3>
              <p className="text-xs font-bold text-gray-400 flex items-center gap-1 mb-4">
                <Building size={12} /> {event.organizer}
              </p>
              
              <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-primary-500" />
                  <span className="text-xs font-bold text-gray-700">{event.date}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <AlertCircle size={48} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-900">No events posted</h3>
            <p className="text-gray-500 font-medium max-w-[250px] mx-auto mt-2">Start adding events so students can apply for OD.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-[500px] w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-900">Create New Event</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><X /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Event Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-primary-400"
                  placeholder="e.g. Annual Sports Day"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Event Date(s)</label>
                  <input 
                    type="text" 
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-primary-400"
                    placeholder="e.g. May 12-14"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-primary-400 font-bold"
                  >
                    <option>Tech</option>
                    <option>Sports</option>
                    <option>Cultural</option>
                    <option>Social</option>
                    <option>Academic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Organizer</label>
                <input 
                  type="text" 
                  required
                  value={formData.organizer}
                  onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-primary-400"
                  placeholder="e.g. Department of CSE"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary-200 transition-all"
              >
                Publish Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
