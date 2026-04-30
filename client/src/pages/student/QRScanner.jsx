import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { Camera, MapPin, Loader2, CheckCircle, AlertCircle, RefreshCcw, CameraOff } from 'lucide-react';

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  
  const scannerRef = useRef(null);

  useEffect(() => {
    // Get location immediately
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setStatus({ type: 'error', message: 'Please enable GPS location to mark attendance.' }),
      { enableHighAccuracy: true }
    );

    return () => stopScanner();
  }, []);

  const startScanner = async () => {
    try {
      setCameraError(null);
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      const config = { fps: 15, qrbox: { width: 250, height: 250 } };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          await handleScanSuccess(decodedText);
        }
      );
      setScanning(true);
    } catch (err) {
      console.error("Camera Start Error:", err);
      setCameraError("Camera access denied or not found. Please check browser permissions.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
      scannerRef.current.clear();
      setScanning(false);
    }
  };

  const handleScanSuccess = async (qrValue) => {
    if (qrValue === 'WAITING_FOR_SESSION' || qrValue === 'SESSION_ENDED') {
      setStatus({ type: 'error', message: 'Class session is not active.' });
      await stopScanner();
      return;
    }

    if (!location) {
      setLoading(true);
      // Wait for a few seconds to see if GPS connects
      let retries = 0;
      const checkLoc = setInterval(async () => {
        retries++;
        if (location) {
          clearInterval(checkLoc);
          await proceedWithAttendance(qrValue);
        } else if (retries > 5) {
          clearInterval(checkLoc);
          setLoading(false);
          setStatus({ type: 'error', message: 'GPS signal is weak. Move near a window and try again.' });
        }
      }, 1000);
      return;
    }

    await proceedWithAttendance(qrValue);
  };

  const proceedWithAttendance = async (qrValue) => {
    await stopScanner();
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
    window.location.reload();
  };

  const retryGPS = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setStatus({ type: 'error', message: 'Please enable GPS location to mark attendance.' }),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="max-w-[600px] mx-auto pb-20 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mark Attendance</h1>
        <p className="text-gray-500 font-medium">Scan the QR code on your teacher's screen.</p>
      </div>

      <div className="glass-card overflow-hidden bg-white border-gray-100 shadow-2xl relative min-h-[400px] flex flex-col">
        {/* Status Overlay */}
        {status.type !== 'idle' && !loading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-8 text-center bg-white/95">
            {status.type === 'success' ? (
              <CheckCircle size={80} className="text-green-500 mb-4 animate-bounce" />
            ) : (
              <AlertCircle size={80} className="text-red-500 mb-4" />
            )}
            <h3 className={`text-2xl font-black mb-2 ${status.type === 'success' ? 'text-green-900' : 'text-red-900'}`}>
              {status.type === 'success' ? 'Attendance Marked!' : 'Scan Failed'}
            </h3>
            <p className="text-gray-600 font-bold">{status.message}</p>
            <button onClick={resetScanner} className="mt-8 flex items-center gap-2 text-primary-600 font-black uppercase tracking-widest text-sm">
              <RefreshCcw size={18} /> Restart
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader2 className="animate-spin text-primary-500" size={50} />
            <p className="text-primary-900 font-black mt-4 uppercase tracking-widest text-xs">Waiting for GPS & Processing...</p>
          </div>
        )}

        {/* Scanner Body */}
        <div className="flex-1 bg-gray-950 relative flex items-center justify-center overflow-hidden">
          <div id="reader" className="w-full h-full"></div>
          
          {!scanning && status.type === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              {cameraError ? (
                <>
                  <CameraOff size={48} className="text-red-500 mb-4" />
                  <p className="text-white font-bold mb-6">{cameraError}</p>
                </>
              ) : (
                <>
                  <Camera size={48} className="text-gray-600 mb-4" />
                  <p className="text-gray-400 font-medium mb-6">Camera is ready</p>
                </>
              )}
              <button 
                onClick={startScanner}
                disabled={!location}
                className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${
                  location ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {location ? 'Open Camera' : 'Waiting for GPS...'}
              </button>
              {!location && (
                <button onClick={retryGPS} className="mt-4 text-xs text-primary-400 font-bold underline">Retry GPS</button>
              )}
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="p-6 bg-white border-t border-gray-50 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${location ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">GPS</p>
              <p className="text-xs font-bold text-gray-900 truncate">
                {location ? 'Connected' : 'Searching...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${scanning ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-400'}`}>
              <Camera size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scanner</p>
              <p className="text-xs font-bold text-gray-900">{scanning ? 'Active' : 'Off'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-primary-50 border border-primary-100 rounded-2xl flex gap-3 items-start">
        <AlertCircle className="text-primary-500 shrink-0 mt-1" size={20} />
        <p className="text-xs font-medium text-primary-900 leading-relaxed">
          Ensure you are in the classroom. The system will cross-verify your live GPS location against the teacher's position.
        </p>
      </div>
    </div>
  );
}
