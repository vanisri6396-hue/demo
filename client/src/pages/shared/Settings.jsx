import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';
import { User, Shield, Bell, Smartphone, Save, Lock, Globe, Loader2 } from 'lucide-react';

export default function Settings() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    department: user.department || '',
  });

  // Password State
  const [passwords, setPasswords] = useState({ current: '', new: '' });

  // Notifications State
  const [notifications, setNotifications] = useState(user.notificationSettings || {
    attendanceConfirmation: true,
    leaveAlerts: true,
    weeklySummary: true,
    securityAlerts: true,
  });

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${BASE_URL}/api/auth/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully! ✅' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BASE_URL}/api/auth/change-password`, {
        currentPassword: passwords.current,
        newPassword: passwords.new
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPasswords({ current: '', new: '' });
      setMessage({ type: 'success', text: 'Password changed successfully! ✅' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Change failed' });
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BASE_URL}/api/auth/notifications`, { notifications: updated }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local user object too
      const updatedUser = { ...user, notificationSettings: updated };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'profile', title: 'Profile Settings', icon: User },
    { id: 'security', title: 'Security', icon: Shield },
    { id: 'notifications', title: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Settings</h1>
          <p className="text-gray-500 font-medium">Manage your personal preferences and account security.</p>
        </div>
        {message.text && (
          <div className={`px-4 py-2 rounded-lg text-xs font-bold animate-bounce ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex flex-col gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMessage({ type: '', text: '' }); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-100' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                {tab.title}
              </button>
            );
          })}
        </div>

        <div className="flex-1">
          <div className="glass-card p-8 bg-white border-gray-100 shadow-xl">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-gray-50">
                  <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 text-3xl font-black">
                    {user.name?.[0]}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">{user.role} Account</p>
                    <button className="text-primary-600 text-xs font-black uppercase mt-2 tracking-widest">Change Photo</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                    <input 
                      className="input-field w-full" 
                      value={profileData.name} 
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Address (Read-only)</label>
                    <input className="input-field w-full bg-gray-50 opacity-60" value={profileData.email} disabled />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                    <input 
                      className="input-field w-full" 
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Department</label>
                    <input 
                      className="input-field w-full" 
                      value={profileData.department}
                      onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
                    Update Profile
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-4">
                  <Lock className="text-amber-600 shrink-0" size={24} />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">Password Security</h4>
                    <p className="text-xs text-amber-700 mt-1">Changing your password will log you out of other sessions.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                    <input 
                      type="password" 
                      className="input-field w-full" 
                      value={passwords.current}
                      onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                    <input 
                      type="password" 
                      className="input-field w-full"
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handlePasswordChange}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Change Password
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900">Email Notifications</h3>
                <div className="space-y-4">
                  {[
                    { key: 'attendanceConfirmation', label: 'Attendance confirmation emails' },
                    { key: 'leaveAlerts', label: 'New leave request alerts' },
                    { key: 'weeklySummary', label: 'Weekly summary reports' },
                    { key: 'securityAlerts', label: 'Security alerts and login notifications' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-gray-700">{item.label}</span>
                      <button 
                        onClick={() => toggleNotification(item.key)}
                        className={`w-12 h-6 rounded-full flex items-center px-1 transition-all duration-300 ${
                          notifications[item.key] ? 'bg-primary-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                          notifications[item.key] ? 'ml-auto' : 'ml-0'
                        }`}></div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
