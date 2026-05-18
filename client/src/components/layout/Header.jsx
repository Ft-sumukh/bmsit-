import React, { useEffect, useState } from 'react';
import { Menu, Flame, GraduationCap, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getDashboardStats } from '../../services/dashboardService';

const Header = ({ toggleSidebar }) => {
  const { user } = useAuthStore();
  const [streak, setStreak] = useState(0);

  // Lazy pull streak stats on load
  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const stats = await getDashboardStats();
        setStreak(stats.streak || 0);
      } catch (err) {
        console.warn('Stats streak loading failed:', err.message);
      }
    };
    if (user) {
      fetchStreak();
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-[#0F172A]/70 px-6 backdrop-blur-md">
      {/* Left side: Hamburger Toggle & Context */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => toggleSidebar(true)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {user?.college || 'BMSIT Engineering College'}
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-xs font-medium text-indigo-400">
            Sem {user?.semester || 1} • {user?.branch || 'General'}
          </span>
        </div>
      </div>

      {/* Right side: Quick info, Streaks & profile */}
      <div className="flex items-center gap-4">
        {/* Streak Counter Widget */}
        <div className="flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 px-3 py-1 shadow-[0_0_15px_rgba(249,115,22,0.05)]">
          <Flame className="h-4.5 w-4.5 text-orange-500 animate-pulse" />
          <span className="text-xs font-bold text-orange-400">
            {streak} {streak === 1 ? 'Day' : 'Days'} Streak
          </span>
        </div>

        {/* Notifications mock icon */}
        <button className="relative rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500"></span>
        </button>

        {/* User badge */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-white leading-3">
              {user?.name ? user.name : 'Engineering Student'}
            </span>
            <span className="text-[10px] text-indigo-400 uppercase font-semibold tracking-wider mt-0.5">
              {user?.role || 'student'}
            </span>
          </div>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-[0_0_10px_rgba(99,102,241,0.3)]">
            <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#0F172A] text-xs font-bold text-white">
              {user?.name ? user.name[0].toUpperCase() : 'S'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
