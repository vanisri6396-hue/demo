import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import { UserPlus, User, Mail, Lock, Shield, ArrowRight } from "lucide-react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [extraData, setExtraData] = useState({ rollNo: '', section: '', department: '', employeeId: '' });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        name,
        email,
        password,
        role,
        ...extraData
      });

      alert("Account created successfully ✅");
      navigate("/");

    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || "Signup failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 bg-[radial-gradient(#f9731610_1px,transparent_1px)] [background-size:20px_20px]">
      <div className="w-full max-w-[600px]">
        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-20 h-20 mb-6 relative group">
            <div className="absolute inset-0 bg-primary-600/10 rounded-full blur-xl group-hover:bg-primary-600/20 transition-all"></div>
            <img 
              src="/logo.png" 
              alt="Takshashila University Logo" 
              className="w-full h-full object-contain relative z-10 drop-shadow-xl" 
            />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Join the Takshashila University Network</p>
        </div>

        {/* Signup Card */}
        <div className="glass-card p-10 bg-white/80 backdrop-blur-xl border-white shadow-2xl">
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-gray-700"
                    placeholder="John Doe"
                    required
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Account Type</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <select 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-gray-700 appearance-none"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="classIncharge">Class Incharge</option>
                    <option value="authority">Authority/HOD</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-gray-700"
                    placeholder="john@university.edu"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-gray-700"
                    placeholder="••••••••"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Role Specific Fields */}
            {role === 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-primary-50/50 rounded-3xl border border-primary-100 animate-in slide-in-from-top-4 duration-500">
                <div>
                  <label className="block text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2 ml-1">Roll Number</label>
                  <input 
                    className="w-full px-4 py-3 bg-white border border-primary-100 rounded-xl focus:outline-none focus:border-primary-400 font-bold text-gray-700"
                    placeholder="e.g. CS24001"
                    onChange={(e) => setExtraData({...extraData, rollNo: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2 ml-1">Section</label>
                  <input 
                    className="w-full px-4 py-3 bg-white border border-primary-100 rounded-xl focus:outline-none focus:border-primary-400 font-bold text-gray-700"
                    placeholder="e.g. CSE-A"
                    onChange={(e) => setExtraData({...extraData, section: e.target.value})}
                  />
                </div>
              </div>
            )}

            {(role === 'teacher' || role === 'classIncharge' || role === 'authority' || role === 'admin') && (
              <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 animate-in slide-in-from-top-4 duration-500 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 ml-1">Employee ID / Faculty ID</label>
                  <input 
                    className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl focus:outline-none focus:border-blue-400 font-bold text-gray-700"
                    placeholder="e.g. FAC001"
                    onChange={(e) => setExtraData({...extraData, employeeId: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-red-600 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
                    <Shield size={12} /> Faculty Verification Key
                  </label>
                  <input 
                    type="password"
                    className="w-full px-4 py-3 bg-white border border-red-100 rounded-xl focus:outline-none focus:border-red-400 font-bold text-gray-700"
                    placeholder="Enter Staff Key"
                    onChange={(e) => setExtraData({...extraData, verificationKey: e.target.value})}
                  />
                  <p className="text-[9px] text-gray-400 font-bold mt-2 italic">Only authorized university staff can create faculty accounts.</p>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-100 hover:bg-primary-700 hover:shadow-primary-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] mt-4"
            >
              {loading ? "Creating Account..." : (
                <>
                  Complete Registration <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-50">
            <p className="text-center text-sm text-gray-400 font-medium">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/")}
                className="text-primary-600 font-black hover:text-primary-700 transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
          By registering, you agree to the university's academic integrity policies <br /> and digital conduct guidelines.
        </p>
      </div>
    </div>
  );
}