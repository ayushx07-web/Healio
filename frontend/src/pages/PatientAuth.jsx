import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User as UserIcon, Phone } from 'lucide-react';

export default function PatientAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        navigate(from);
      } else {
        await register(email, password, name, phone);
        navigate('/complete-profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#1c1c1e] border border-zinc-850 rounded-3xl shadow-xl p-8 mt-12 animate-in fade-in duration-300">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl mb-4">
          <UserIcon size={22} className="stroke-[2.5]" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-zinc-400 text-sm mt-1 font-medium">
          {isLogin ? 'Sign in to book doctor appointments & check health history' : 'Register to manage medical info & appointments'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#242426] p-1 rounded-xl mb-6">
        <button
          onClick={() => { setIsLogin(true); setError(''); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition duration-200 ${isLogin ? 'bg-[#0e4d38] text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          Sign In
        </button>
        <button
          onClick={() => { setIsLogin(false); setError(''); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition duration-200 ${!isLogin ? 'bg-[#0e4d38] text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <>
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <div className="relative">
                <UserIcon size={18} className="absolute left-3.5 top-3.5 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3.5 top-3.5 text-zinc-500" />
                <input
                  type="text"
                  required
                  pattern="^[6-9]\d{9}$"
                  title="Enter a valid 10-digit Indian mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Indian Mobile Number"
                  className="w-full pl-10 pr-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-3.5 text-zinc-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@example.com"
              className="w-full pl-10 pr-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Password
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-3.5 text-zinc-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-[#242426] border border-zinc-805 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-950/20 text-red-400 text-sm p-4 rounded-xl border border-red-900/40 font-semibold animate-shake">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0e4d38] text-white py-4 rounded-xl font-bold hover:bg-[#0b3b2b] transition duration-200 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
