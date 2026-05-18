import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDocuments } from '../services/documentService';
import { 
  generateQuiz, 
  getUserQuizzes, 
  getQuizById, 
  submitAnswers, 
  deleteQuiz 
} from '../services/quizService';
import { 
  Trophy, 
  Clock, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  HelpCircle, 
  Calendar,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Trash2
} from 'lucide-react';

const QuizPage = () => {
  const navigate = useNavigate();
  
  // State lists
  const [documents, setDocuments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Quiz configurator
  const [selectedDocId, setSelectedDocId] = useState('');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [generating, setGenerating] = useState(false);
  
  // Active quiz variables
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionIdx: optionIdx }
  const [submitting, setSubmitting] = useState(false);
  const [quizResults, setQuizResults] = useState(null); // score, grading details

  const loadInitialData = async () => {
    try {
      const [docs, quizHistory] = await Promise.all([
        getDocuments(),
        getUserQuizzes()
      ]);
      setDocuments(docs);
      setHistory(quizHistory);
      if (docs.length > 0) {
        setSelectedDocId(docs[0]._id);
      }
    } catch (err) {
      console.error('Failed to load quiz metadata:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    if (!selectedDocId || generating) return;

    setGenerating(true);
    setQuizResults(null);
    setSelectedAnswers({});
    try {
      const quiz = await generateQuiz(selectedDocId, Number(count), difficulty);
      setActiveQuiz(quiz);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to compile conceptual quiz.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (qIdx, optIdx) => {
    if (quizResults) return; // disable modifying after submission
    setSelectedAnswers(prev => ({
      ...prev,
      [qIdx]: optIdx
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || submitting) return;

    // Verify all questions are answered
    const totalQuestions = activeQuiz.questions.length;
    const answeredCount = Object.keys(selectedAnswers).length;
    
    if (answeredCount < totalQuestions) {
      if (!window.confirm(`You have only answered ${answeredCount}/${totalQuestions} questions. Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      // Map answers to the indices requested
      const payloadAnswers = activeQuiz.questions.map((q, idx) => ({
        questionIndex: idx,
        selectedOption: selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1
      }));

      const results = await submitAnswers(activeQuiz._id, payloadAnswers);
      setQuizResults(results);
      loadInitialData(); // Reload history
    } catch (err) {
      alert(err.response?.data?.message || 'Quiz submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewHistoryQuiz = async (quizId) => {
    setLoading(true);
    try {
      const quiz = await getQuizById(quizId);
      setActiveQuiz(quiz);
      
      // Prefill user answers if they exist
      const prefilled = {};
      if (quiz.answers && quiz.answers.length > 0) {
        quiz.answers.forEach(ans => {
          prefilled[ans.questionIndex] = ans.selectedOption;
        });
      }
      setSelectedAnswers(prefilled);
      
      // If already submitted, prefill grading parameters
      if (quiz.score !== undefined) {
        setQuizResults({
          score: quiz.score,
          totalQuestions: quiz.questions.length,
          percentage: Math.round((quiz.score / quiz.questions.length) * 100),
          evaluations: quiz.questions.map((q, idx) => {
            const userAns = quiz.answers.find(a => a.questionIndex === idx);
            return {
              questionIndex: idx,
              selectedOption: userAns ? userAns.selectedOption : -1,
              correctOption: q.correctOption,
              isCorrect: userAns ? userAns.selectedOption === q.correctOption : false,
              explanation: q.explanation
            };
          })
        });
      } else {
        setQuizResults(null);
      }
    } catch (err) {
      alert('Failed to load quiz details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistoryQuiz = async (e, quizId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this quiz attempt from history?')) return;

    try {
      await deleteQuiz(quizId);
      loadInitialData();
    } catch (err) {
      alert('Failed to delete quiz.');
    }
  };

  const handleResetQuizView = () => {
    setActiveQuiz(null);
    setQuizResults(null);
    setSelectedAnswers({});
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-500"></div>
        <p className="mt-3 text-xs text-slate-500 font-semibold">Configuring testing suites...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. QUIZ ACTIVE PLAY BOARD */}
      {activeQuiz ? (
        <div className="space-y-6">
          {/* Header Action panel */}
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
            <div>
              <button
                onClick={handleResetQuizView}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Back to Dashboard
              </button>
              <h3 className="text-base font-bold text-white mt-2 truncate max-w-md">
                {activeQuiz.title}
              </h3>
            </div>
            {!quizResults && (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 disabled:opacity-40 transition-all cursor-pointer"
              >
                {submitting ? 'Submitting Answers...' : 'Submit Answers'}
              </button>
            )}
          </div>

          {/* Results Summary Box */}
          {quizResults && (
            <div className="rounded-2xl border border-indigo-500/10 bg-indigo-500/2 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Exam Summary</span>
                <h4 className="text-xl font-bold text-white mt-1">
                  You scored {quizResults.score} / {quizResults.totalQuestions}
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {quizResults.percentage >= 80 
                    ? 'Excellent job! You have fully mastered these curriculum blocks.' 
                    : quizResults.percentage >= 50 
                    ? 'Fair understanding! Review correct solutions below to secure full grade coverage.' 
                    : 'Needs revision! Read textbook segments and regenerate smaller concept checks.'}
                </p>
              </div>

              {/* Progress Wheel Mock */}
              <div className="relative flex items-center justify-center h-20 w-20 shrink-0 rounded-full border-4 border-indigo-500/20 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <span className="text-sm font-black text-white">{quizResults.percentage}%</span>
              </div>
            </div>
          )}

          {/* Questions Stream */}
          <div className="space-y-6">
            {activeQuiz.questions.map((q, qIdx) => {
              const evalItem = quizResults?.evaluations?.find(e => e.questionIndex === qIdx);
              const isUserAnswerCorrect = evalItem ? evalItem.isCorrect : null;
              
              return (
                <div
                  key={qIdx}
                  className={`rounded-2xl border p-6 backdrop-blur-xl transition-all shadow-sm ${
                    evalItem 
                      ? isUserAnswerCorrect 
                        ? 'border-emerald-500/20 bg-emerald-500/2'
                        : 'border-red-500/20 bg-red-500/2'
                      : 'border-slate-800 bg-slate-900/10 hover:border-slate-700/80'
                  }`}
                >
                  <div className="flex gap-2">
                    <span className="text-xs font-bold text-indigo-400">Q{qIdx + 1}.</span>
                    <h4 className="text-xs font-bold text-white leading-relaxed">{q.questionText}</h4>
                  </div>

                  {/* Options Grids */}
                  <div className="grid gap-3 mt-4 sm:grid-cols-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;
                      const showCorrect = quizResults && q.correctOption === optIdx;
                      const showIncorrect = quizResults && isSelected && q.correctOption !== optIdx;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(qIdx, optIdx)}
                          disabled={!!quizResults}
                          className={`w-full text-left rounded-xl p-3.5 border text-xs font-medium transition-all ${
                            showCorrect
                              ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
                              : showIncorrect
                              ? 'border-red-500 bg-red-500/10 text-white font-bold'
                              : isSelected
                              ? 'border-indigo-500 bg-indigo-600/10 text-white font-bold'
                              : 'border-slate-800 bg-slate-950/20 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{opt}</span>
                            {showCorrect && <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 ml-2" />}
                            {showIncorrect && <XCircle className="h-4.5 w-4.5 text-red-500 shrink-0 ml-2" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Grading Detailed Explanations */}
                  {evalItem && (
                    <div className="mt-5 rounded-xl border border-slate-800 bg-[#0A0D14]/80 p-4 text-[11px] leading-relaxed text-slate-400">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                        <span className="font-bold text-indigo-400 uppercase tracking-wider">AI Explanation</span>
                      </div>
                      <p className="whitespace-pre-line leading-relaxed">{evalItem.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Complete CTA */}
          {quizResults && (
            <div className="flex justify-end pt-4">
              <button
                onClick={handleResetQuizView}
                className="rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-800 px-6 py-3 cursor-pointer"
              >
                Return to Workspace
              </button>
            </div>
          )}
        </div>
      ) : (
        
        // 2. INITIAL CONFIGURATION BOARD
        <div className="grid gap-6 lg:grid-cols-5">
          
          {/* Form Side */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-6 backdrop-blur-xl lg:col-span-2 shadow-sm h-fit">
            <div className="mb-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Trophy className="h-4.5 w-4.5 text-indigo-400" />
                Configure Exam
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Generate conceptual multiple-choice testing pools from lectures</p>
            </div>

            <form onSubmit={handleGenerateQuiz} className="space-y-4">
              {/* Select Document */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Study Source Notes</label>
                {documents.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/20 p-4 text-xs text-center text-slate-600">
                    No indexed documents. Please <Link to="/upload" className="text-indigo-400 underline">Upload notes</Link> first.
                  </div>
                ) : (
                  <select
                    value={selectedDocId}
                    onChange={(e) => setSelectedDocId(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    {documents.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.title} ({doc.subject})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Grid for parameters */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Question count */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Total Questions</label>
                  <select
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-xs text-white focus:border-indigo-500"
                  >
                    {[3, 5, 8, 10].map(c => (
                      <option key={c} value={c}>{c} MCQs</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Difficulty Grade</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-xs text-white focus:border-indigo-500"
                  >
                    <option value="easy">Introductory</option>
                    <option value="medium">Conceptual (Standard)</option>
                    <option value="hard">Expert Academic</option>
                  </select>
                </div>
              </div>

              {/* Generate CTA */}
              <button
                type="submit"
                disabled={generating || !selectedDocId}
                className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-40 transition-all cursor-pointer mt-2"
              >
                {generating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Assembling MCQ pool...</span>
                  </div>
                ) : (
                  'Assemble MCQ practice test'
                )}
              </button>
            </form>
          </div>

          {/* Attempts History Side */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-6 backdrop-blur-xl lg:col-span-3 shadow-sm h-fit">
            <h3 className="text-sm font-bold text-white mb-4">Practice Attempt Records</h3>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
                <BookOpen className="h-10 w-10 text-slate-700 mb-3" />
                <p className="text-xs font-medium">No quiz attempts logged.</p>
                <p className="text-[10px] text-slate-650 mt-1 max-w-[200px]">Generate customized exams above to record evaluation streaks.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((h) => {
                  const percent = Math.round((h.score / (h.questions?.length || 1)) * 100);
                  
                  return (
                    <div
                      key={h._id}
                      onClick={() => handleReviewHistoryQuiz(h._id)}
                      className="group flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/20 p-4 hover:border-indigo-500/20 hover:bg-slate-900/20 cursor-pointer transition-all duration-200"
                    >
                      <div className="min-w-0">
                        <h4 className="truncate text-xs font-bold text-slate-200 group-hover:text-white max-w-[150px] sm:max-w-xs">
                          {h.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-500">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(h.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="uppercase text-indigo-400 font-semibold">{h.difficulty}</span>
                        </div>
                      </div>

                      {/* Score metrics */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-extrabold text-white">
                            {h.score} / {h.questions?.length}
                          </p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Score</p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteHistoryQuiz(e, h._id)}
                          className="rounded-lg p-1.5 text-slate-600 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
