import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  MessageSquare, 
  Trophy, 
  Copy, 
  Calendar, 
  BrainCircuit, 
  ChevronRight, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      title: 'RAG-Based Document Chat',
      desc: 'Ask your technical PDFs, formulas, and notes questions directly and retrieve grounded explanations instantly.',
      icon: MessageSquare,
      color: 'text-cyan-400 bg-cyan-400/10'
    },
    {
      title: 'Auto-Generated MCQ Quizzes',
      desc: 'Generate conceptual, multiple-choice testing pools from your study material to gauge your exam preparation.',
      icon: Trophy,
      color: 'text-amber-400 bg-amber-400/10'
    },
    {
      title: 'Active Recall Flashcards',
      desc: 'Transform confusing lectures into structured term flashcard decks with dynamic visual flipping and mastery trackers.',
      icon: Copy,
      color: 'text-purple-400 bg-purple-400/10'
    },
    {
      title: 'AI Study Timetable',
      desc: 'Formulate personalized calendars from today until the exam date, prioritizing your weaker topics.',
      icon: Calendar,
      color: 'text-emerald-400 bg-emerald-400/10'
    },
    {
      title: 'Core Topic Simplifier',
      desc: 'Struggling with a complex structural formula? Let the tutor explain concepts as if explaining to a 16-year-old.',
      icon: BrainCircuit,
      color: 'text-indigo-400 bg-indigo-400/10'
    },
    {
      title: 'Automatic Notes Summarizer',
      desc: 'Instantly pull compressed, clean academic summaries with key takeaways and bold formulas ready for revision.',
      icon: Sparkles,
      color: 'text-pink-400 bg-pink-400/10'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070B13] text-slate-100 font-sans antialiased overflow-hidden">
      {/* Dynamic Glow Background */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/40 bg-[#070B13]/70 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-indigo-500" />
            <span className="text-xl font-bold tracking-tight text-white">
              Study<span className="text-indigo-400">Mind</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="group flex items-center gap-1.5 rounded-full bg-indigo-600 px-4.5 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:bg-indigo-500 transition-all duration-200"
            >
              Get Started
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-20 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 px-4 py-1.5 text-xs font-semibold text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.1)] mb-8">
            <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-400" />
            Empowering Engineering Students with GenAI
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl font-sans">
            Supercharge Your <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Engineering Studies</span> With AI
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 sm:text-lg">
            Chat directly with lecture notes, generate custom conceptual quizzes, study dynamic active-recall flashcard decks, and build AI study planners tailored around your exam deadlines.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-sm font-bold text-white shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] transition-all duration-300 text-center"
            >
              Start Studying Free
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto rounded-full border border-slate-800 bg-slate-900/40 hover:bg-slate-800/40 hover:text-white px-8 py-4 text-sm font-semibold text-slate-300 transition-all duration-200 text-center"
            >
              Learn More
            </Link>
          </div>

          <div className="mt-6 flex justify-center items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-indigo-500/80" />
            No credit card required • Secure data sandboxing
          </div>
        </div>
      </section>

      {/* Grid of Key Features */}
      <section className="px-6 py-20 bg-[#070B13]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              An All-In-One Engineering Command Center
            </h2>
            <p className="mt-3 text-sm text-slate-500 max-w-xl mx-auto">
              ChatGPT + Notion + Quizlet, built specifically for engineering students to master difficult concepts.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feat) => (
              <div 
                key={feat.title}
                className="group relative rounded-2xl border border-slate-800/60 bg-slate-900/10 p-6 backdrop-blur-sm hover:border-indigo-500/30 transition-all duration-300 shadow-md"
              >
                {/* Accent glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-indigo-500/0 opacity-0 group-hover:opacity-10 group-hover:bg-indigo-500/5 transition-all duration-300 pointer-events-none"></div>

                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${feat.color} mb-5`}>
                  <feat.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 px-6 text-center text-xs text-slate-600 bg-[#06090F]">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-500/80" />
            <span className="font-semibold text-slate-400">StudyMind Platform</span>
          </div>
          <p>© 2026 StudyMind. Designed for Future Engineers. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
