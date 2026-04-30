import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { Camera, MapPin, Loader2, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react';

export default function QRScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get location immediately
    const getLoc = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          console.error("GPS Error:", err);
          setStatus({ type: 'error', message: 'Please enable GPS location to mark attendance.' });
        },
        { enableHighAccuracy: true }
      );
    };

    getLoc();

    const scanner = new Html5QrcodeScanner('reader', {
      fps: 15,
      qrbox: { width: 280, height: 280 },
      rememberLastUsedCamera: true,
      aspectRatio: 1.0
    });

    scanner.render(
      async (decodedText) => {
        // Only stop if we have location
        setScanning(false);
        await handleScanSuccess(decodedText);
        scanner.clear();
      },
      (error) => {
        // Ignore minor scan errors
      }
    );

    return () => {
      try {
        scanner.clear();
      } catch (e) {
        console.error("Scanner cleanup error:", e);
      }
    };
  }, []);

  const handleScanSuccess = async (qrValue) => {
    setScanResult(qrValue);
    if (!location) {
      setStatus({ type: 'error', message: 'Waiting for GPS location...' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${BASE_URL}/api/attendance/scan`, {
        qr: qrValue,
        lat: location.lat,
        lng: location.lng
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStatus({ type: 'success', message: res.data.message });
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Scan failed. Try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    window.location.reload(); // Simplest way to re-init scanner
  };

  return (
    <div className="max-w-[600px] mx-auto pb-20">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mark Attendance</h1>
        <p className="text-gray-500 font-medium">Scan the QR code displayed on your teacher's screen.</p>
      </div>

      <div className="glass-card overflow-hidden bg-white border-gray-100 shadow-2xl relative">
        {/* Status Overlay */}
        {status.type !== 'idle' && !loading && (
          <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300 ${
            status.type === 'success' ? 'bg-white/95' : 'bg-white/95'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle size={80} className="text-green-500 mb-4" />
            ) : (
              <AlertCircle size={80} className="text-red-500 mb-4" />
            )}
            <h3 className={`text-2xl font-black mb-2 ${
              status.type === 'success' ? 'text-green-900' : 'text-red-900'
            }`}>
              {status.type === 'success' ? 'Verified!' : 'Scan Failed'}
            </h3>
            <p className="text-gray-600 font-bold max-w-[250px]">{status.message}</p>
            
            <button 
              onClick={resetScanner}
              className="mt-8 flex items-center gap-2 text-primary-600 font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform"
            >
              <RefreshCcw size={18} /> Restart Scanner
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader2 className="animate-spin text-primary-500" size={50} />
            <p className="text-primary-900 font-black mt-4 uppercase tracking-widest text-xs">Validating Location...</p>
          </div>
        )}

        {/* Scanner Body */}
        <div className="p-4 bg-gray-900 aspect-square flex flex-col">
          <div id="reader" className="w-full h-full overflow-hidden rounded-xl"></div>
        </div>

        {/* Info Footer */}
        <div className="p-6 bg-white border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${location ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">GPS Status</p>
              <p className="text-xs font-bold text-gray-900">{location ? 'Coordinates Locked' : 'Searching for satellites...'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-50 text-primary-600">
              <Camera size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Camera</p>
              <p className="text-xs font-bold text-gray-900">{scanning ? 'Active' : 'Standby'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-primary-50 border border-primary-100 rounded-2xl flex gap-4">
        <AlertCircle className="text-primary-500 shrink-0" size={24} />
        <p className="text-sm font-medium text-primary-900">
          Make sure your camera is clean and you are within the classroom radius. Fake GPS attempts are automatically reported to the HOD.
        </p>
      </div>
    </div>
  );
}
