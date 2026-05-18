import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDocuments } from '../services/documentService';
import { 
  generateFlashcards, 
  getUserFlashcards, 
  updateCardMastery, 
  deleteFlashcardDeck 
} from '../services/flashcardService';
import { 
  Copy, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw,
  BookOpen, 
  Trash2,
  Sparkles,
  Trophy
} from 'lucide-react';

const FlashcardsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Deck generation form
  const [selectedDocId, setSelectedDocId] = useState('');
  const [count, setCount] = useState(6);
  const [generating, setGenerating] = useState(false);

  // Reviewing board
  const [activeDeck, setActiveDeck] = useState(null);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const loadInitialData = async () => {
    try {
      const [docs, flashDecks] = await Promise.all([
        getDocuments(),
        getUserFlashcards()
      ]);
      setDocuments(docs);
      setDecks(flashDecks);
      if (docs.length > 0) {
        setSelectedDocId(docs[0]._id);
      }
    } catch (err) {
      console.error('Failed to load flashcard metadata:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleGenerateDeck = async (e) => {
    e.preventDefault();
    if (!selectedDocId || generating) return;

    setGenerating(true);
    try {
      const newDeck = await generateFlashcards(selectedDocId, Number(count));
      setActiveDeck(newDeck);
      setCurrentCardIdx(0);
      setIsFlipped(false);
      loadInitialData(); // reload deck lists
    } catch (err) {
      alert('Flashcards generation failed. Try another document.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleCardMastery = async (masteredState) => {
    if (!activeDeck) return;
    
    const activeCard = activeDeck.cards[currentCardIdx];
    try {
      const updatedDeck = await updateCardMastery(
        activeDeck._id, 
        activeCard._id, 
        masteredState
      );
      
      // Update in activeDeck reference state to update visual cues instantly
      const copy = { ...activeDeck };
      copy.cards[currentCardIdx].mastered = masteredState;
      setActiveDeck(copy);

      // Auto advance to next card if not on the last card
      if (currentCardIdx < activeDeck.cards.length - 1) {
        setTimeout(() => {
          setIsFlipped(false);
          setCurrentCardIdx(prev => prev + 1);
        }, 300);
      }
      
      loadInitialData(); // reload sidebar metrics
    } catch (err) {
      console.error('Failed to update card mastery:', err.message);
    }
  };

  const handleDeleteDeck = async (e, deckId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this revision flashcard deck permanently?')) return;

    try {
      await deleteFlashcardDeck(deckId);
      loadInitialData();
    } catch (err) {
      alert('Failed to delete flashcard deck.');
    }
  };

  const handleBackToDecks = () => {
    setActiveDeck(null);
    setCurrentCardIdx(0);
    setIsFlipped(false);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-500"></div>
        <p className="mt-3 text-xs text-slate-500 font-semibold">Aligning study decks...</p>
      </div>
    );
  }

  // Calculated variables for deck play
  const activeDeckLength = activeDeck ? activeDeck.cards.length : 0;
  const currentCard = activeDeck ? activeDeck.cards[currentCardIdx] : null;
  const totalMasteredInActive = activeDeck 
    ? activeDeck.cards.filter(c => c.mastered).length 
    : 0;

  return (
    <div className="space-y-8">
      
      {/* 1. PLAYING ACTIVE STUDY DECK */}
      {activeDeck ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
            <div>
              <button
                onClick={handleBackToDecks}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Back to Decks
              </button>
              <h3 className="text-base font-bold text-white mt-1.5 truncate max-w-sm sm:max-w-md">
                {activeDeck.title}
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500">
              Mastered: {totalMasteredInActive} / {activeDeckLength}
            </span>
          </div>

          {/* 3D FLIP CARD ELEMENT FRAME */}
          <div className="h-72 w-full perspective group select-none">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`relative h-full w-full rounded-3xl border border-slate-800/80 bg-slate-900/10 cursor-pointer shadow-xl duration-500 preserve-3d backdrop-blur-xl ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* CARD FRONT: QUESTION */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center backface-hidden">
                <span className="absolute top-5 left-6 text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
                  Card {currentCardIdx + 1} of {activeDeckLength}
                </span>
                
                {currentCard?.mastered && (
                  <span className="absolute top-4 right-4 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 text-[8px] font-bold uppercase">
                    Mastered
                  </span>
                )}

                <HelpCircle className="h-8 w-8 text-indigo-400/60 mb-5" />
                <h4 className="text-sm font-bold text-white max-w-md leading-relaxed px-4">
                  {currentCard?.front}
                </h4>
                <p className="absolute bottom-5 text-[9px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1 animate-pulse">
                  <RefreshCw className="h-3 w-3" /> Click card to flip
                </p>
              </div>

              {/* CARD BACK: EXPLANATION / DEFINITION */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center rotate-y-180 backface-hidden">
                <span className="absolute top-5 left-6 text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
                  Solution Breakdown
                </span>

                <Sparkles className="h-7 w-7 text-pink-400/80 mb-4" />
                <p className="text-xs font-semibold text-slate-200 max-w-md leading-relaxed px-4">
                  {currentCard?.back}
                </p>
                <p className="absolute bottom-5 text-[9px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <RefreshCw className="h-3 w-3" /> Click card to show question
                </p>
              </div>
            </div>
          </div>

          {/* Play Navigation and Mastery Actions */}
          <div className="flex flex-col gap-4">
            
            {/* Mastery Toggles (Only visible when flipped) */}
            <div className={`flex items-center justify-center gap-3 transition-all duration-300 ${
              isFlipped ? 'opacity-100 scale-100' : 'opacity-20 scale-95 pointer-events-none'
            }`}>
              <button
                onClick={() => handleToggleCardMastery(false)}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 px-5 py-2.5 text-xs font-bold transition-all cursor-pointer"
              >
                <XCircle className="h-4.5 w-4.5" /> Still Learning
              </button>
              <button
                onClick={() => handleToggleCardMastery(true)}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 px-5 py-2.5 text-xs font-bold transition-all cursor-pointer"
              >
                <CheckCircle className="h-4.5 w-4.5" /> Got it! (Master)
              </button>
            </div>

            {/* Slider Navigation arrows */}
            <div className="flex items-center justify-between border-t border-slate-900 pt-4">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentCardIdx(prev => Math.max(prev - 1, 0));
                }}
                disabled={currentCardIdx === 0}
                className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ArrowLeft className="h-4.5 w-4.5" /> Prev Card
              </button>

              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentCardIdx(prev => Math.min(prev + 1, activeDeckLength - 1));
                }}
                disabled={currentCardIdx === activeDeckLength - 1}
                className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                Next Card <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>

          </div>
        </div>
      ) : (
        
        // 2. CONFIGURATORS AND DECKS LISTS
        <div className="grid gap-6 lg:grid-cols-5">
          
          {/* Deck builder card */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-6 backdrop-blur-xl lg:col-span-2 shadow-sm h-fit">
            <div className="mb-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Copy className="h-4.5 w-4.5 text-indigo-400" />
                Build Flashcards
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Extract high-yield active-recall double sided term study cards</p>
            </div>

            <form onSubmit={handleGenerateDeck} className="space-y-4">
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

              {/* Grid cards count */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Total Cards</label>
                <select
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  {[4, 6, 8, 12].map(c => (
                    <option key={c} value={c}>{c} Study Cards</option>
                  ))}
                </select>
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
                    <span>Extracting term blocks...</span>
                  </div>
                ) : (
                  'Generate revision deck'
                )}
              </button>
            </form>
          </div>

          {/* Decks Workspace listing */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-6 backdrop-blur-xl lg:col-span-3 shadow-sm h-fit">
            <h3 className="text-sm font-bold text-white mb-4">Revision Flashcard Decks</h3>

            {decks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
                <BookOpen className="h-10 w-10 text-slate-700 mb-3" />
                <p className="text-xs font-medium">No flashcard decks logged.</p>
                <p className="text-[10px] text-slate-650 mt-1 max-w-[200px]">Create revision boards above to check formulas and algorithms.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {decks.map((deck) => {
                  const mastered = deck.cards.filter(c => c.mastered).length;
                  const total = deck.cards.length;
                  const scorePercent = Math.round((mastered / total) * 100);

                  return (
                    <div
                      key={deck._id}
                      onClick={() => {
                        setActiveDeck(deck);
                        setCurrentCardIdx(0);
                        setIsFlipped(false);
                      }}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/20 p-4.5 hover:border-indigo-500/20 hover:bg-slate-900/15 cursor-pointer transition-all duration-200 shadow-sm relative overflow-hidden"
                    >
                      <div>
                        {/* Subject Header */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="rounded bg-[#0B0F19] px-2 py-0.5 border border-slate-800 text-indigo-400 font-semibold tracking-wide text-[9px] uppercase">
                            {deck.documentId?.subject || 'Engineering'}
                          </span>
                          <button
                            onClick={(e) => handleDeleteDeck(e, deck._id)}
                            className="rounded p-1 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Title */}
                        <h4 className="truncate text-xs font-bold text-slate-200 group-hover:text-white leading-normal">
                          {deck.title}
                        </h4>
                      </div>

                      {/* Mastery Bar */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] font-bold">
                          <span className="text-slate-500">Mastered: {mastered} / {total}</span>
                          <span className="text-indigo-400">{scorePercent}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                          <div
                            style={{ width: `${scorePercent || 5}%` }}
                            className={`h-full rounded-full bg-indigo-500 transition-all duration-300`}
                          ></div>
                        </div>
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

export default FlashcardsPage;
