import React, { useState, useEffect } from 'react';
import { generateStudyPlan, getStudyPlan } from '../services/studyPlanService';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  Compass, 
  Trophy, 
  Flame, 
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

const StudyPlanPage = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form states
  const [subjects, setSubjects] = useState('');
  const [examDate, setExamDate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [weakSubjects, setWeakSubjects] = useState('');
  const [strongSubjects, setStrongSubjects] = useState('');

  const loadPlan = async () => {
    try {
      const activePlan = await getStudyPlan();
      if (activePlan && activePlan.timetable && activePlan.timetable.length > 0) {
        setPlan(activePlan);
      } else {
        setPlan(null);
      }
    } catch (err) {
      console.warn('Failed to load study timetable:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    if (!subjects || !examDate || generating) return;

    setGenerating(true);
    try {
      const generated = await generateStudyPlan(
        subjects,
        examDate,
        Number(hoursPerDay),
        weakSubjects,
        strongSubjects
      );
      setPlan(generated);
      loadPlan(); // reload
    } catch (err) {
      alert('Plan generation failed. Please check date configurations.');
    } finally {
      setGenerating(false);
    }
  };

  const handleResetPlan = () => {
    if (window.confirm('Are you sure you want to delete this study plan? You will need to regenerate your calendar.')) {
      setPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-500"></div>
        <p className="mt-3 text-xs text-slate-500 font-semibold">Mapping custom calendars...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. PLAY TIMETABLE CALENDAR VIEW */}
      {plan ? (
        <div className="grid gap-6 lg:grid-cols-4">
          
          {/* Left panel metrics */}
          <div className="rounded-2xl border border-slate-800/85 bg-slate-900/10 p-5 backdrop-blur-xl h-fit space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Plan Summary</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/20">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Exam Date Target</p>
                <p className="text-white font-extrabold mt-1">{new Date(plan.examDate).toLocaleDateString()}</p>
              </div>
              
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/20">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Study Hours Load</p>
                <p className="text-white font-extrabold mt-1">{plan.hoursPerDay} Hrs / Day</p>
              </div>

              {plan.weakSubjects && (
                <div className="p-3.5 rounded-xl border border-red-500/10 bg-red-500/2">
                  <p className="text-[10px] font-bold text-red-400 uppercase">Prioritized Focus</p>
                  <p className="text-slate-300 font-semibold mt-1 truncate">{plan.weakSubjects}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleResetPlan}
              className="w-full rounded-xl border border-slate-800 hover:border-red-500/20 bg-slate-950/30 hover:bg-red-500/5 hover:text-red-400 py-3 text-xs font-bold text-slate-400 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Rebuild Calendar
            </button>
          </div>

          {/* Right panel days stream */}
          <div className="lg:col-span-3 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Compass className="h-4.5 w-4.5 text-indigo-400" />
                Study Curriculum Timeline
              </h3>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">
                Active Streak Boosted
              </span>
            </div>

            {/* Timetable Items */}
            <div className="space-y-4">
              {plan.timetable.map((dayItem, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-850 bg-slate-900/10 p-5 hover:border-slate-800 backdrop-blur-sm transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-4 border-b border-slate-800/40 pb-3">
                    <span className="text-xs font-black text-indigo-400 font-sans uppercase">
                      Day {dayItem.day || idx + 1}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-indigo-400/80" /> {dayItem.hours || plan.hoursPerDay} study hours
                    </span>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-xs font-bold text-white leading-normal">
                      Topics: <span className="text-slate-300 font-semibold">{dayItem.topic}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      💡 <span className="font-medium">{dayItem.tasks || 'Complete active reading, notes Q&A prompt sessions, and clear quiz questions.'}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* AI General tips */}
            {plan.tips && plan.tips.length > 0 && (
              <div className="rounded-2xl border border-slate-850 bg-[#0F172A]/40 p-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <Lightbulb className="h-4 w-4 text-amber-400 animate-bounce" />
                  <span className="text-xs font-bold text-white">AI Revision Tips</span>
                </div>
                <ul className="space-y-2.5 text-[11px] text-slate-400 leading-relaxed list-disc list-inside">
                  {plan.tips.map((tip, tIdx) => (
                    <li key={tIdx} className="marker:text-indigo-400 pl-1">{tip}</li>
                  ))}
                </ul>
              </div>
            )}

          </div>

        </div>
      ) : (
        
        // 2. TIMETABLE CONFIGURATOR FORM
        <div className="max-w-2xl mx-auto rounded-3xl border border-slate-800/80 bg-slate-900/10 p-8 backdrop-blur-xl shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-4 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Formulate AI Study Calendar</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Build custom, week-by-week revisions and checklists leading up to exam date target schedules.
            </p>
          </div>

          <form onSubmit={handleGeneratePlan} className="space-y-5">
            {/* Subjects Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Curriculum Subjects (Comma separated)</label>
              <input
                type="text"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 px-4 text-xs text-white placeholder-slate-700 focus:border-indigo-500 focus:outline-none"
                placeholder="e.g., Computer Networks, Software Engineering, Discrete Maths"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Exam Date Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Target Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {/* Hours per Day Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Daily Study Hours (Allocations)</label>
                <select
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map(h => (
                    <option key={h} value={h}>{h} Hours / Day</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Weak Subjects Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Weaker Subjects (Prioritize Revisions)</label>
                <input
                  type="text"
                  value={weakSubjects}
                  onChange={(e) => setWeakSubjects(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 px-4 text-xs text-white placeholder-slate-700 focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g., Computer Networks IP Addressing"
                />
              </div>

              {/* Strong Subjects Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Stronger Subjects (Rapid Checks)</label>
                <input
                  type="text"
                  value={strongSubjects}
                  onChange={(e) => setStrongSubjects(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 px-4 text-xs text-white placeholder-slate-700 focus:border-indigo-500 focus:outline-none"
                  placeholder="e.g., Software Engineering models"
                />
              </div>
            </div>

            {generating ? (
              <div className="space-y-2.5 rounded-xl bg-slate-950/50 p-4 border border-indigo-500/10">
                <div className="flex justify-between items-center text-[10px] font-semibold">
                  <span className="text-indigo-400 flex items-center gap-1.5 animate-pulse">
                    <Clock className="h-3.5 w-3.5 animate-spin" /> Structuring daily calendars...
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 animate-[pulse_2s_infinite] w-[80%] shadow-[0_0_8px_rgba(99,102,241,0.4)]"></div>
                </div>
              </div>
            ) : (
              <button
                type="submit"
                disabled={generating || !subjects || !examDate}
                className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-500 hover:shadow-indigo-500/10 active:scale-[0.99] disabled:opacity-40 transition-all cursor-pointer mt-2"
              >
                Assemble Study Plan
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default StudyPlanPage;
