import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, MoreHorizontal } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-[#121212] border-b border-zinc-800/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-semibold text-lg text-white tracking-wide hover:opacity-90 transition">
          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
          <span>Healio</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/search" className="text-sm font-medium text-zinc-300 hover:text-white transition duration-200">
            Find doctors
          </Link>

          {user ? (
            user.role === 'DOCTOR' ? (
              <>
                <Link to="/doctor/dashboard" className="text-sm font-medium text-zinc-300 hover:text-white transition duration-200 flex items-center gap-1.5">
                  <UserIcon size={16} />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-sm font-medium text-red-400 hover:text-red-300 transition duration-200 flex items-center gap-1.5"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/profile" className="text-sm font-medium text-zinc-300 hover:text-white transition duration-200 flex items-center gap-1.5">
                  <UserIcon size={16} />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="text-sm font-medium text-red-400 hover:text-red-300 transition duration-200 flex items-center gap-1.5"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            )
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-zinc-300 hover:text-white transition duration-200"
              >
                Login / Register
              </Link>
              <Link
                to="/doctor/login"
                className="text-sm font-medium text-zinc-300 hover:text-white transition duration-200"
              >
                Doctor portal
              </Link>
            </>
          )}

          <button className="text-zinc-400 hover:text-white transition">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
