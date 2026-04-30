import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { BASE_URL } from '../../config';
import { MapPin, Loader2, CheckCircle, AlertCircle, RefreshCcw, Wifi, Radio } from 'lucide-react';

export default function QRScanner() {
  const [activeSessionQr, setActiveSessionQr] = useState(null);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket to listen for active sessions
    const socket = io(BASE_URL);

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
      setActiveSessionQr(null);
    });

    socket.on('qr-update', (data) => {
      setActiveSessionQr(data.qr);
    });

    socket.on('session-stopped', () => {
      setActiveSessionQr(null);
      if (status.type === 'idle') {
        setStatus({ type: 'error', message: 'Class session has ended.' });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Clear active session if no ping for 10 seconds (in case teacher disconnects)
  useEffect(() => {
    if (!activeSessionQr) return;
    const timer = setTimeout(() => {
      setActiveSessionQr(null);
    }, 10000);
    return () => clearTimeout(timer);
  }, [activeSessionQr]);

  const handleCheckIn = () => {
    if (!activeSessionQr) {
      setStatus({ type: 'error', message: 'No active session found. Wait for teacher to start.' });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const token = localStorage.getItem('token');
          const res = await axios.post(`${BASE_URL}/api/attendance/scan`, {
            qr: activeSessionQr,
            lat: latitude,
            lng: longitude
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          setStatus({ type: 'success', message: res.data.message });
        } catch (err) {
          setStatus({ 
            type: 'error', 
            message: err.response?.data?.message || 'Check-in failed. Try again.' 
          });
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        setStatus({ type: 'error', message: 'GPS access denied. Please enable location.' });
      },
      { enableHighAccuracy: true }
    );
  };

  const resetScanner = () => {
    setStatus({ type: 'idle', message: '' });
  };

  return (
    <div className="max-w-[600px] mx-auto pb-20 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Smart Check-In</h1>
        <p className="text-gray-500 font-medium">Tap the button to verify your presence.</p>
      </div>

      <div className="glass-card overflow-hidden bg-white border-gray-100 shadow-2xl relative min-h-[400px] flex flex-col items-center justify-center p-8">
        
        {/* Status Overlays */}
        {status.type !== 'idle' && !loading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-8 text-center bg-white/95">
            {status.type === 'success' ? (
              <CheckCircle size={80} className="text-green-500 mb-4 animate-bounce" />
            ) : (
              <AlertCircle size={80} className="text-red-500 mb-4" />
            )}
            <h3 className={`text-2xl font-black mb-2 ${status.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
              {status.type === 'success' ? 'Attendance Marked!' : 'Check-In Failed'}
            </h3>
            <p className="text-gray-600 font-bold">{status.message}</p>
            <button onClick={resetScanner} className="mt-8 flex items-center gap-2 text-primary-600 font-black uppercase tracking-widest text-sm bg-primary-50 px-6 py-3 rounded-xl hover:bg-primary-100 transition-colors">
              <RefreshCcw size={18} /> Go Back
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
            <Loader2 className="animate-spin text-primary-500" size={50} />
            <p className="text-primary-900 font-black mt-4 uppercase tracking-widest text-xs">Verifying GPS Location...</p>
          </div>
        )}

        {/* Default View */}
        {status.type === 'idle' && !loading && (
          <div className="flex flex-col items-center w-full">
            <div className={`relative w-48 h-48 rounded-full flex items-center justify-center mb-10 transition-all duration-500 ${
              activeSessionQr 
                ? 'bg-primary-50 shadow-[0_0_60px_-15px_rgba(249,115,22,0.3)] border-4 border-primary-200' 
                : 'bg-gray-50 border-4 border-dashed border-gray-200'
            }`}>
              {activeSessionQr && (
                <div className="absolute inset-0 rounded-full border-4 border-primary-400 opacity-50 animate-ping"></div>
              )}
              {activeSessionQr ? (
                <Radio size={64} className="text-primary-500 animate-pulse" />
              ) : (
                <Wifi size={64} className="text-gray-300" />
              )}
            </div>

            <button 
              onClick={handleCheckIn}
              disabled={!activeSessionQr}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 text-lg ${
                activeSessionQr 
                  ? 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-200 active:scale-[0.98]' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <MapPin size={24} />
              {activeSessionQr ? 'Mark Attendance' : 'Waiting for Class...'}
            </button>

            {!activeSessionQr && (
              <p className="mt-6 text-sm text-gray-400 font-medium text-center">
                Listening for teacher's signal... <br/> Ensure your network is connected.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 items-start">
        <AlertCircle className="text-blue-500 shrink-0 mt-1" size={20} />
        <p className="text-xs font-medium text-blue-900 leading-relaxed">
          <strong>How it works:</strong> You no longer need to scan a QR code! Just wait for the teacher to start the session, then tap "Mark Attendance". The system will use your GPS to verify you are inside the classroom.
        </p>
      </div>
    </div>
  );
}
