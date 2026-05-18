import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocuments } from '../services/documentService';
import { 
  askDocumentQuestion, 
  getChatHistory, 
  clearChatHistory, 
  simplifyTopic 
} from '../services/chatService';
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  BrainCircuit, 
  FileText, 
  Bot, 
  User, 
  HelpCircle,
  HelpCircle as HelpIcon,
  Sparkles,
  ArrowLeftRight
} from 'lucide-react';

const ChatPage = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  
  // State
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Feynman Topic Simplifier State
  const [simplifyInput, setSimplifyInput] = useState('');
  const [simplifyExplanation, setSimplifyExplanation] = useState('');
  const [simplifying, setSimplifying] = useState(false);

  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load all documents
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docs = await getDocuments();
        setDocuments(docs);
        
        if (documentId) {
          const active = docs.find(d => d._id === documentId);
          if (active) setSelectedDoc(active);
        } else if (docs.length > 0) {
          // Pre-select first document if none in URL
          setSelectedDoc(docs[0]);
          navigate(`/chat/${docs[0]._id}`);
        }
      } catch (err) {
        console.error('Failed to load study vault materials:', err.message);
      }
    };
    fetchDocs();
  }, [documentId, navigate]);

  // Load history when selectedDoc changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedDoc) return;
      setHistoryLoading(true);
      try {
        const history = await getChatHistory(selectedDoc._id);
        setMessages(history.map(msg => ({
          role: msg.role,
          content: msg.message
        })));
      } catch (err) {
        console.warn('Failed to load chat history:', err.message);
        setMessages([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
    // Clear old simplifications
    setSimplifyExplanation('');
    setSimplifyInput('');
  }, [selectedDoc]);

  const handleDocChange = (doc) => {
    setSelectedDoc(doc);
    navigate(`/chat/${doc._id}`);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedDoc || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await askDocumentQuestion(selectedDoc._id, userMessage);
      
      // Append AI response
      setMessages(prev => [...prev, { role: 'assistant', content: response.answer }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: "I couldn't find this in your notes. Try asking something else." 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!selectedDoc) return;
    if (!window.confirm('Delete all conceptual dialog history for this document?')) return;

    try {
      await clearChatHistory(selectedDoc._id);
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear history:', err.message);
    }
  };

  const handleSimplifyTopic = async (e) => {
    e.preventDefault();
    if (!simplifyInput.trim() || simplifying) return;

    setSimplifying(true);
    setSimplifyExplanation('');
    try {
      const response = await simplifyTopic(
        simplifyInput.trim(), 
        selectedDoc?._id || null
      );
      setSimplifyExplanation(response.explanation);
    } catch (err) {
      setSimplifyExplanation('Failed to simplify topic. Please try another expression.');
    } finally {
      setSimplifying(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-4 h-[calc(100vh-140px)] min-h-[500px]">
      
      {/* 1. Left Column: Study Materials List */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-4 backdrop-blur-xl flex flex-col h-full shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3.5 px-2">Study Materials</h3>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {documents.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="h-8 w-8 text-slate-700 mx-auto mb-2" />
              <p className="text-[10px] text-slate-500 font-medium">Vault is empty.</p>
              <Link to="/upload" className="text-[10px] text-indigo-400 hover:underline mt-1 block">Upload Notes</Link>
            </div>
          ) : (
            documents.map((doc) => (
              <button
                key={doc._id}
                onClick={() => handleDocChange(doc)}
                className={`w-full text-left rounded-xl p-3 border text-xs font-medium transition-all duration-200 cursor-pointer ${
                  selectedDoc?._id === doc._id
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-white font-bold'
                    : 'bg-slate-950/20 border-slate-850 hover:bg-slate-900/30 text-slate-400'
                }`}
              >
                <div className="truncate mb-1">{doc.title}</div>
                <div className="text-[9px] text-slate-500 truncate font-semibold uppercase">{doc.subject}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 2. Middle Columns: Dialogue Dashboard */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#0B0F17]/40 lg:col-span-2 flex flex-col h-full shadow-sm relative overflow-hidden">
        
        {/* Chat Title bar */}
        <div className="flex items-center justify-between border-b border-slate-800/60 p-4 bg-slate-950/15">
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-white truncate max-w-xs">{selectedDoc ? selectedDoc.title : 'Study chatbot'}</h3>
            <p className="text-[9px] text-slate-500 font-semibold tracking-wide uppercase mt-0.5">
              {selectedDoc ? `${selectedDoc.subject} • RAG Prompting Mode` : 'Select a textbook to begin'}
            </p>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              title="Clear Conversations"
              className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Chat message history box */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {historyLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-800 border-t-indigo-500"></div>
            </div>
          ) : !selectedDoc ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
              <MessageSquare className="h-10 w-10 text-slate-700 mb-3" />
              <p className="text-xs font-medium">Select a textbook from the list to start chatting.</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 max-w-xs mx-auto py-10">
              <Bot className="h-10 w-10 text-indigo-400/80 animate-pulse mb-3" />
              <p className="text-xs font-bold text-white mb-1.5">Interactive Document Assistant Initialized</p>
              <p className="text-[10px] text-slate-500 leading-normal">
                Ask simple queries, request code implementations, or ask formulas contextually. AI answers strictly based on this document.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar Icon */}
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                    : 'bg-pink-500/10 border-pink-500/30 text-pink-400'
                }`}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Speech Bubble */}
                <div className={`rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-[#1E293B]/60 text-slate-200 border border-slate-800/60 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))
          )}

          {/* AI generating loader */}
          {loading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-pink-500/10 border-pink-500/30 text-pink-400">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-none border border-slate-800 bg-[#1E293B]/30 p-4 text-xs text-slate-400 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span>Analyzing text blocks...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat input box form */}
        <form onSubmit={handleSendMessage} className="border-t border-slate-800/60 p-4 bg-slate-950/15">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!selectedDoc || loading}
              className="flex-1 rounded-xl border border-slate-800 bg-slate-950/50 py-3 px-4 text-xs text-white placeholder-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-40"
              placeholder={selectedDoc ? "Ask anything about this document..." : "Select notes to start"}
              required
            />
            <button
              type="submit"
              disabled={!selectedDoc || loading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 transition-all cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* 3. Right Column: Feynman Topic Simplifier Command center */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-5 backdrop-blur-xl flex flex-col h-full shadow-sm overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <BrainCircuit className="h-4 w-4 text-indigo-400" />
            Feynman Simplifier
          </h3>
          <p className="text-[9px] text-slate-500 mt-0.5">Explains complex engineering terms in plain analogies</p>
        </div>

        {/* Input box */}
        <form onSubmit={handleSimplifyTopic} className="space-y-3">
          <input
            type="text"
            value={simplifyInput}
            onChange={(e) => setSimplifyInput(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 px-4 text-xs text-white placeholder-slate-700 focus:border-indigo-500 focus:outline-none"
            placeholder="e.g., Dijkstra Algorithm"
            required
          />
          <button
            type="submit"
            disabled={simplifying || !simplifyInput.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 text-[10px] font-bold text-white hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
          >
            {simplifying ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" /> Explain Simply
              </>
            )}
          </button>
        </form>

        {/* Explanation area */}
        <div className="flex-1 mt-5 overflow-y-auto pr-1">
          {simplifyExplanation ? (
            <div className="rounded-xl border border-indigo-500/10 bg-indigo-500/2 p-4 text-xs leading-relaxed text-slate-300">
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wide block mb-2">
                Feynman Explanation
              </span>
              <p className="whitespace-pre-line font-medium">{simplifyExplanation}</p>
            </div>
          ) : simplifying ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-600">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-800 border-t-indigo-500 mb-2"></div>
              <p className="text-[9px] font-medium text-slate-500">Formulating analogies...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-850 rounded-xl bg-slate-950/10 text-center text-slate-600">
              <HelpIcon className="h-8 w-8 text-slate-700 mb-2" />
              <p className="text-[10px] font-medium text-slate-500 max-w-[150px]">
                Type a key term and query to break it down simply.
              </p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default ChatPage;
