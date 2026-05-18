import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { generateSummary, getSummary } from '../services/summaryService';
import { getDocumentById } from '../services/documentService';
import { 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  RotateCcw, 
  Clock, 
  Download, 
  ArrowLeft,
  GraduationCap
} from 'lucide-react';

// Lightweight regex markdown compiler to render premium academic layouts
const renderMarkdown = (text) => {
  if (!text) return null;
  
  // Split content by lines to build HTML tags mapping
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    
    // Header Level 3
    if (trimmed.startsWith('###')) {
      return (
        <h4 key={idx} className="text-sm font-extrabold text-white tracking-tight mt-6 mb-3 border-l-2 border-indigo-500 pl-2.5 font-sans">
          {trimmed.replace('###', '').trim()}
        </h4>
      );
    }
    
    // Header Level 2
    if (trimmed.startsWith('##')) {
      return (
        <h3 key={idx} className="text-base font-extrabold text-indigo-400 tracking-tight mt-8 mb-4 border-b border-slate-800 pb-2">
          {trimmed.replace('##', '').trim()}
        </h3>
      );
    }
    
    // Bullet lists
    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const content = trimmed.substring(1).trim();
      return (
        <li key={idx} className="list-disc list-inside text-xs text-slate-300 leading-relaxed pl-4 mb-2">
          {parseBoldText(content)}
        </li>
      );
    }
    
    // Code or Formula block indicator (simplified mock markdown rendering)
    if (trimmed.startsWith('```')) {
      return null; // hide fences
    }
    
    if (trimmed === '') {
      return <div key={idx} className="h-2"></div>;
    }
    
    return (
      <p key={idx} className="text-xs text-slate-350 leading-relaxed mb-3">
        {parseBoldText(trimmed)}
      </p>
    );
  });
};

// Parse inline **bold** tags
const parseBoldText = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-extrabold text-white bg-indigo-500/10 px-1 py-0.5 rounded text-[11px]">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const SummaryPage = () => {
  const { documentId } = useParams();
  
  const [document, setDocument] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadData = async () => {
    try {
      const doc = await getDocumentById(documentId);
      setDocument(doc);
      
      const sum = await getSummary(documentId);
      setSummary(sum.summary || '');
    } catch (err) {
      console.error('Failed to load summary metadata:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      loadData();
    }
  }, [documentId]);

  const handleGenerateSummary = async () => {
    setGenerating(true);
    try {
      const result = await generateSummary(documentId);
      setSummary(result.summary);
      loadData();
    } catch (err) {
      alert('Failed to generate summary. Try another notes file.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-500"></div>
        <p className="mt-3 text-xs text-slate-500 font-semibold">Decrypting vault notes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title Header Nav */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
        <div>
          <Link
            to="/upload"
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to study vault
          </Link>
          <h2 className="text-xl font-bold text-white mt-2 flex items-center gap-2">
            <Sparkles className="h-5.5 w-5.5 text-indigo-400 animate-pulse" />
            Lecture Summary Hub
          </h2>
        </div>
        
        {summary && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-850 bg-[#0B0F19] hover:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" /> Print Notes
          </button>
        )}
      </div>

      {/* Main Container Card */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/10 p-6 md:p-8 backdrop-blur-xl shadow-xl min-h-[400px]">
        {summary ? (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Textbook Metadata Badge */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-5">
              <span className="rounded bg-[#0B0F19] px-2.5 py-1 border border-slate-800 text-indigo-400 font-extrabold text-[10px] uppercase">
                {document?.subject || 'Engineering'}
              </span>
              <span className="text-slate-700">|</span>
              <h3 className="text-sm font-extrabold text-white">{document?.title}</h3>
            </div>

            {/* Structured Compilations view */}
            <div className="prose prose-invert max-w-none text-slate-350">
              {renderMarkdown(summary)}
            </div>

          </div>
        ) : (
          
          // LAZY GENERATOR COMPONENT (If no summary resides)
          <div className="flex flex-col items-center justify-center text-center py-16 max-w-md mx-auto h-full">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-5 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
              <GraduationCap className="h-8 w-8 text-indigo-400" />
            </div>
            
            <h3 className="text-base font-bold text-white mb-2">Generate Notes Summary</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Our AI analyzes your uploaded notes, extracts essential terms, highlights critical formulas, lists oral viva revision questions, and structures it into beautiful study guides.
            </p>

            {generating ? (
              <div className="w-full space-y-3 p-4 rounded-2xl border border-indigo-500/10 bg-slate-950/20">
                <div className="flex justify-between items-center text-[10px] font-semibold">
                  <span className="text-indigo-400 flex items-center gap-1.5 animate-pulse">
                    <Clock className="h-3.5 w-3.5 animate-spin" /> Compiling text blocks...
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 animate-[pulse_2s_infinite] w-[75%] shadow-[0_0_8px_rgba(99,102,241,0.4)]"></div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleGenerateSummary}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all duration-200 cursor-pointer"
              >
                Compile AI Study Guide
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default SummaryPage;
