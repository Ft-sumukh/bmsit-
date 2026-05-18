import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  LayoutDashboard, 
  CalendarDays, 
  UploadCloud, 
  MessageSquareCode, 
  Trophy, 
  Copy, 
  LogOut, 
  GraduationCap 
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload Notes', path: '/upload', icon: UploadCloud },
    { name: 'Document Chat', path: '/chat', icon: MessageSquareCode },
    { name: 'Practice Quizzes', path: '/quiz', icon: Trophy },
    { name: 'Flashcards', path: '/flashcards', icon: Copy },
    { name: 'Study Timetable', path: '/studyplan', icon: CalendarDays },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-[#0B0F19]/90 backdrop-blur-xl transition-transform duration-300 md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800/60">
        <GraduationCap className="h-8 w-8 text-indigo-500 animate-pulse" />
        <span className="text-xl font-bold tracking-tight text-white font-sans">
          Study<span className="text-indigo-400">Mind</span>
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => toggleSidebar && toggleSidebar(false)}
            className={({ isActive }) =>
              `flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium tracking-wide transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Profile Footer */}
      <div className="border-t border-slate-800/60 p-4 bg-[#0B0F19]/40">
        <div className="flex items-center gap-3 rounded-xl p-2 bg-slate-900/40 border border-slate-800/20">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold text-sm">
            {user?.name ? user.name[0].toUpperCase() : 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-semibold text-white">{user?.name || 'Student'}</p>
            <p className="truncate text-[10px] text-slate-500">{user?.branch || 'Engineering'}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
