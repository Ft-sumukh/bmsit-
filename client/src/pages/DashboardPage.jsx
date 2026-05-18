import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getDashboardStats } from '../services/dashboardService';
import { getDocuments } from '../services/documentService';
import { 
  Flame, 
  BookOpen, 
  Clock, 
  Trophy, 
  MessageSquare, 
  Sparkles, 
  Copy, 
  UploadCloud, 
  ChevronRight,
  TrendingUp,
  Brain
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, docsData] = await Promise.all([
          getDashboardStats(),
          getDocuments()
        ]);
        setStats(statsData);
        setDocuments(docsData.slice(0, 3)); // show top 3 recent docs
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-500"></div>
        <p className="mt-4 text-xs text-slate-500 font-semibold tracking-wider">Compiling dashboard analytics...</p>
      </div>
    );
  }

  // Fallback default stats if backend is empty
  const activeStats = stats || {
    totalDocs: 0,
    totalSessions: 0,
    totalHours: 0,
    avgQuizScore: 0,
    flashcards: { total: 0, mastered: 0, pending: 0 },
    streak: 0,
    weeklyLogs: [
      { day: 'Sun', minutes: 0 },
      { day: 'Mon', minutes: 0 },
      { day: 'Tue', minutes: 0 },
      { day: 'Wed', minutes: 0 },
      { day: 'Thu', minutes: 0 },
      { day: 'Fri', minutes: 0 },
      { day: 'Sat', minutes: 0 }
    ]
  };

  const metricCards = [
    {
      label: 'Study Streak',
      value: `${activeStats.streak} ${activeStats.streak === 1 ? 'Day' : 'Days'}`,
      desc: 'Consecutive active learning days',
      icon: Flame,
      color: 'from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-400'
    },
    {
      label: 'Uploaded Notes',
      value: activeStats.totalDocs,
      desc: 'Technical PDFs in workspace',
      icon: BookOpen,
      color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400'
    },
    {
      label: 'Revision Hours',
      value: `${activeStats.totalHours} Hrs`,
      desc: 'Total active revision modules',
      icon: Clock,
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-400'
    },
    {
      label: 'Avg Quiz Score',
      value: `${activeStats.avgQuizScore}%`,
      desc: 'Academic accuracy score',
      icon: Trophy,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400'
    }
  ];

  // Calculate dynamic weekly max for bar scaling
  const maxWeeklyMinutes = Math.max(...activeStats.weeklyLogs.map(l => l.minutes), 30);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl border border-indigo-500/10 bg-gradient-to-r from-indigo-950/20 via-slate-900/10 to-[#0A0E1A] p-6 md:p-8 overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-indigo-500/5 blur-[50px] pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-4">
            <Sparkles className="h-3 w-3 animate-pulse" /> Engineering Portal Active
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl font-sans">
            Welcome, {user?.name || 'Engineer'}!
          </h2>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Ready to master your syllabus? Upload lecture notes or textbooks, ask our RAG Chatbot complex conceptual questions, or trigger instant mock viva exams.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/upload"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4.5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all duration-200"
            >
              <UploadCloud className="h-4 w-4" /> Upload PDF Material
            </Link>
            <Link
              to="/studyplan"
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/40 hover:text-white px-4.5 py-2.5 text-xs font-semibold text-slate-300 transition-all duration-200"
            >
              Analyze Study Calendar
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-sm shadow-sm ${card.color.split(' ')[0]} ${card.color.split(' ')[1]} ${card.color.split(' ')[2]}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{card.label}</span>
              <card.icon className={`h-5 w-5 ${card.color.split(' ')[3]}`} />
            </div>
            <div className="mt-3.5">
              <h3 className="text-2xl font-extrabold text-white tracking-tight leading-7">
                {card.value}
              </h3>
              <p className="mt-1 text-[10px] text-slate-500">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Charts + Activities */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Progress Analytics */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-6 backdrop-blur-xl lg:col-span-2 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
                Weekly Study Metrics
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Active review time logged per day (minutes)</p>
            </div>
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wide">
              Goal: 180 min/week
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="flex h-56 items-end justify-between gap-2.5 pt-6 border-b border-slate-800/50 pb-2">
            {activeStats.weeklyLogs.map((log) => {
              const heightPercent = Math.min((log.minutes / maxWeeklyMinutes) * 100, 100);
              return (
                <div key={log.day} className="group flex flex-1 flex-col items-center gap-2 h-full justify-end">
                  {/* Tooltip on Hover */}
                  <span className="opacity-0 group-hover:opacity-100 bg-slate-900 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/20 transition-all duration-200 pointer-events-none mb-1">
                    {log.minutes}m
                  </span>
                  
                  {/* Bar Visualizer */}
                  <div className="w-full relative rounded-t-lg bg-slate-800/30 overflow-hidden h-40">
                    <div
                      style={{ height: `${heightPercent || 3}%` }}
                      className={`absolute bottom-0 left-0 w-full rounded-t-lg transition-all duration-500 ${
                        log.minutes > 0
                          ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                          : 'bg-slate-800/40'
                      }`}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{log.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Learning Advice / Quick Revision Tips */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-6 backdrop-blur-xl shadow-sm">
          <h3 className="text-base font-bold text-white flex items-center gap-1.5 mb-5">
            <Brain className="h-4.5 w-4.5 text-indigo-400" />
            Study Methodology
          </h3>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800/50 bg-[#0F172A]/40 p-4">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Active Recall</span>
              <p className="mt-1 text-xs text-slate-400 leading-normal">
                Don't just re-read notes. Use our generated **Flashcards** to force your brain to retrieve terms from memory, sealing pathways.
              </p>
            </div>
            <div className="rounded-xl border border-slate-800/50 bg-[#0F172A]/40 p-4">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Feynman Simplification</span>
              <p className="mt-1 text-xs text-slate-400 leading-normal">
                If you cannot explain a concept to a child, you don't grasp it. Use the **Topic Simplifier** to breakdown equations into analogies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Notes Workspace */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-6 backdrop-blur-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Active Document Workspace</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Quick revision shortcuts for uploaded notes</p>
          </div>
          <Link
            to="/upload"
            className="flex items-center gap-0.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Manage Material <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-850 rounded-xl bg-slate-950/20 text-center">
            <BookOpen className="h-10 w-10 text-slate-600 mb-3" />
            <p className="text-xs text-slate-400 font-medium">No study materials registered yet.</p>
            <Link to="/upload" className="text-xs font-bold text-indigo-400 hover:underline mt-1.5">
              Upload your first PDF notes now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4.5 first:pt-0 last:pb-0"
              >
                <div>
                  <h4 className="text-sm font-bold text-white leading-normal truncate max-w-xs md:max-w-md">{doc.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                    <span className="rounded bg-slate-900 px-2 py-0.5 border border-slate-800 text-indigo-400 font-semibold">{doc.subject}</span>
                    <span>•</span>
                    <span>Uploaded {new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Direct Study Shortcuts */}
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/chat/${doc._id}`}
                    className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0F172A] hover:bg-indigo-600 hover:border-indigo-600 hover:text-white px-3 py-1.5 text-xs text-slate-300 font-medium transition-all"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Chat
                  </Link>
                  <Link
                    to={`/summary/${doc._id}`}
                    className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0F172A] hover:bg-pink-600 hover:border-pink-600 hover:text-white px-3 py-1.5 text-xs text-slate-300 font-medium transition-all"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Summary
                  </Link>
                  <button
                    onClick={async () => {
                      // Handled in sub routing transitions or prompt popups
                    }}
                    className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#0F172A] hover:bg-amber-600 hover:border-amber-600 hover:text-white px-3 py-1.5 text-xs text-slate-300 font-medium transition-all"
                  >
                    <Trophy className="h-3.5 w-3.5" /> Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
