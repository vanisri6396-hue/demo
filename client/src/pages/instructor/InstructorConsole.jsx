import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { Play, Square, Settings, UserX, Mail, Download, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';

export default function InstructorConsole() {
  const [sessionActive, setSessionActive] = useState(false);
  const [qrToken, setQrToken] = useState('WAITING_FOR_SESSION');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [radius, setRadius] = useState(25); // Default 25m
  const [socket, setSocket] = useState(null);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  
  // Mock data
  const [stats, setStats] = useState({ present: 32, total: 40 });
  const [absentStudents, setAbsentStudents] = useState([
    { id: 'CS2024-001', name: 'Alex Marshall', lastSeen: 'Yesterday, 2:45 PM' },
    { id: 'CS2024-015', name: 'Lydia Wang', lastSeen: 'Today, 8:15 AM' },
    { id: 'CS2024-042', name: 'Jordan Knight', lastSeen: '2 days ago' },
  ]);

  useEffect(() => {
    // Connect to the backend socket
    const newSocket = io(BASE_URL);
    setSocket(newSocket);

    newSocket.on('new-qr-token', (token) => {
      setQrToken(token);
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    let timerInterval;

    if (sessionActive && timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && sessionActive) {
      stopSession();
    }

    return () => clearInterval(timerInterval);
  }, [sessionActive, timeLeft]);

  const startSession = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      const token = localStorage.getItem('token');

      if (!token) {
        alert("Session expired. Please login again.");
        return;
      }

      // Get teacher's current location
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        const res = await axios.post(`${BASE_URL}/api/qr/start`, {
          lat: latitude,
          lng: longitude,
          radius: parseInt(radius)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.sessionId) {
          setSessionActive(true);
          setTimeLeft(120);
          setQrToken(res.data.token || "SESSION_STARTED");
          socket.emit('join-session', res.data.sessionId);
        }
      });
    } catch (err) {
      console.error(err);
      alert("Failed to start session. Check console.");
    }
  };

  const stopSession = async () => {
    try {
      // await axios.post(`${BASE_URL}/api/qr/stop`, { sessionId: 'current' });
      setSessionActive(false);
      setTimeLeft(0);
      setQrToken('SESSION_ENDED');
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      {/* Live Session Header */}
      <div className="bg-gray-900 rounded-2xl p-6 flex items-center justify-between shadow-lg relative overflow-hidden">
        {/* Subtle orange glow behind the dark card */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/20 blur-[80px] rounded-full pointer-events-none"></div>
        
        <div className="flex items-center gap-4 z-10">
          <div className="w-12 h-12 bg-primary-500/20 rounded-xl border border-primary-500/30 flex items-center justify-center">
            {sessionActive ? (
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse shadow-[0_0_10px_#f97316]"></div>
            ) : (
              <Square className="text-gray-400" size={20} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sessionActive ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-gray-800 text-gray-400'}`}>
                {sessionActive ? 'LIVE SESSION' : 'OFFLINE'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">Computer Science 101</h1>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <span>Room 402B</span> • <span>09:00 AM - 11:00 AM</span>
            </p>
          </div>
        </div>

        <div className="flex gap-10 z-10">
          <div className="flex flex-col items-center">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Attendance</span>
            <span className="text-3xl font-bold text-white tracking-tight">{stats.present}<span className="text-gray-500 text-xl">/{stats.total}</span></span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Status</span>
            <span className="text-3xl font-bold text-green-400 tracking-tight">{Math.round((stats.present/stats.total)*100)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: QR & Settings */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* QR Code Card */}
          <div className="glass-card p-6 flex flex-col items-center justify-center text-center h-[380px]">
            <div className={`p-4 bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 transition-all duration-300 ${sessionActive ? 'shadow-glow border-primary-200 ring-4 ring-primary-50' : 'opacity-70'}`}>
              <QRCodeSVG 
                value={qrToken} 
                size={180} 
                fgColor={sessionActive ? "#1E293B" : "#94A3B8"} 
              />
            </div>
            
            {sessionActive ? (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{formatTime(timeLeft)}</h3>
                <p className="text-sm text-gray-500 mb-6">QR changes every 4s. Expires in {Math.ceil(timeLeft/60)} minutes.</p>
                <button 
                  onClick={stopSession}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 py-3 rounded-xl font-semibold transition-colors duration-200"
                >
                  <Square size={18} /> End Class Session
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Ready to Start</h3>
                <p className="text-sm text-gray-500 mb-6">Set radius and generate dynamic QR.</p>
                <button 
                  onClick={startSession}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                >
                  <Play size={18} /> Generate Dynamic QR
                </button>
              </>
            )}
          </div>

          {/* Settings & Geofence Card */}
          <div className="glass-card p-6 flex flex-col h-[380px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-900">Geofence Radius</h3>
              <span className="bg-primary-50 text-primary-700 font-bold px-3 py-1 rounded-full text-sm">
                {radius}m
              </span>
            </div>
            
            <div className="mb-8">
              <input 
                type="range" 
                min="10" 
                max="50" 
                step="5"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                disabled={sessionActive}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-xs text-gray-400 font-medium mt-2">
                <span>10m</span>
                <span>50m</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 mb-auto">
              <AlertCircle className="text-blue-500 flex-shrink-0" size={20} />
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Auto-Validation Active</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Students must be within the {radius}m radius of your device's location to successfully check-in via QR scan.
                </p>
              </div>
            </div>

            {sessionActive && (
               <button className="btn-secondary w-full flex items-center justify-center gap-2 mt-4 py-3 border-gray-200 text-gray-600">
                 Pause Session
               </button>
            )}
          </div>
        </div>

        {/* Right Col: Schedule & Stats */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Today's Schedule</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md font-medium">Oct 24</span>
            </div>
            
            <div className="space-y-4">
              <div className="relative pl-4 border-l-2 border-primary-500">
                <p className="text-[10px] font-bold text-primary-600 tracking-wider uppercase mb-0.5">NOW PLAYING</p>
                <p className="text-sm font-bold text-gray-900">Computer Science 101</p>
                <p className="text-xs text-gray-500">09:00 AM - 11:00 AM • Room 402B</p>
              </div>
              <div className="relative pl-4 border-l-2 border-gray-200 opacity-60">
                <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">UPCOMING</p>
                <p className="text-sm font-bold text-gray-700">Data Structures Lab</p>
                <p className="text-xs text-gray-500">11:30 AM - 01:30 PM • Lab 2</p>
              </div>
            </div>
            
            <button className="w-full mt-5 text-sm text-gray-500 font-medium hover:text-primary-600 transition-colors">
              View Full Week →
            </button>
          </div>

          <div className="bg-gradient-to-br from-[#242D45] to-[#1E293B] rounded-2xl p-6 text-white shadow-lg flex-1">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-semibold text-white/90">Weekly Overview</h3>
             </div>
             <div className="space-y-5">
               <div>
                 <div className="flex justify-between text-sm mb-2">
                   <span className="text-gray-300">Avg. Attendance</span>
                   <span className="font-bold">92.4%</span>
                 </div>
                 <div className="w-full bg-white/10 rounded-full h-1.5">
                   <div className="bg-primary-400 h-1.5 rounded-full shadow-[0_0_8px_#f97316]" style={{width: '92.4%'}}></div>
                 </div>
               </div>
               <div>
                 <div className="flex justify-between text-sm mb-2">
                   <span className="text-gray-300">Class Engagement</span>
                   <span className="font-bold">High</span>
                 </div>
                 <div className="w-full bg-white/10 rounded-full h-1.5">
                   <div className="bg-green-400 h-1.5 rounded-full" style={{width: '85%'}}></div>
                 </div>
               </div>
             </div>
          </div>
        </div>

      </div>

      {/* Bottom Row: Absent Students */}
      <div className="glass-card p-0 overflow-hidden mt-2">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Absent Students</h3>
            <p className="text-sm text-gray-500">{absentStudents.length} students yet to check in</p>
          </div>
          <button className="text-primary-600 text-sm font-semibold hover:text-primary-700 transition-colors">
            Notify All →
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Number</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Seen</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {absentStudents.map((student, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                        {student.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <span className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{student.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.lastSeen}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="btn-secondary py-1.5 px-3 text-xs">Manual Mark</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
