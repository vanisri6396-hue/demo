import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import { LogIn, Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user || { role: res.data.role }));
      
      const role = res.data.role;
      if (role === "teacher") navigate("/teacher");
      else if (role === "student") navigate("/student");
      else if (role === "admin") navigate("/admin");
      else if (role === "authority") navigate("/hod");
      else if (role === "invigilator") navigate("/invigilator");
      else navigate("/");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 bg-[radial-gradient(#f9731610_1px,transparent_1px)] [background-size:20px_20px]">
      <div className="w-full max-w-[450px]">
        {/* Logo/Brand */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-24 h-24 mb-6 relative group">
            <div className="absolute inset-0 bg-primary-600/20 rounded-full blur-2xl group-hover:bg-primary-600/30 transition-all"></div>
            <img 
              src="/logo.png" 
              alt="Takshashila University Logo" 
              className="w-full h-full object-contain relative z-10 drop-shadow-2xl animate-in zoom-in-50 duration-700" 
            />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-1">
            TAKSHASHILA <br />
            <span className="text-primary-600">UNIVERSITY</span>
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-3">Smart Attendance System</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-10 bg-white/80 backdrop-blur-xl border-white shadow-2xl">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your credentials to access your portal.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-50 transition-all font-medium text-gray-700"
                  placeholder="name@university.edu"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                <a href="#" className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700">Forgot?</a>
              </div>
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-100 hover:bg-primary-700 hover:shadow-primary-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {loading ? "Authenticating..." : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-50">
            <p className="text-center text-sm text-gray-400 font-medium">
              New to the platform?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-primary-600 font-black hover:text-primary-700 transition-colors"
              >
                Create an Account
              </button>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex justify-center gap-6">
          <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 flex items-center gap-2">
            University Open Source
          </button>
          <span className="w-1 h-1 rounded-full bg-gray-300 self-center"></span>
          <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600">
            Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
}