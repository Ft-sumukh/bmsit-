import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  uploadDocument, 
  getDocuments, 
  deleteDocument 
} from '../services/documentService';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Sparkles,
  MessageSquare,
  Trophy,
  Copy
} from 'lucide-react';

const UploadPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  
  // Form fields
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [tags, setTags] = useState('');
  
  // Feedback alerts
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);

  const loadDocuments = async () => {
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError(null);
    setSuccess(null);

    if (selectedFile.type !== 'application/pdf') {
      setError('Invalid file type. Only PDF documents are supported.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File is too large. Maximum PDF size is limited to 10MB.');
      return;
    }

    setFile(selectedFile);
    // Autofill title if empty
    if (!title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a physical PDF file first.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setStatusMsg('Transferring notes to secure vault...');
    setError(null);
    setSuccess(null);

    try {
      await uploadDocument(
        file,
        title,
        subject,
        tags,
        (percent) => {
          setProgress(percent);
          if (percent === 100) {
            setStatusMsg('AI parsing semantic layers...');
          }
        }
      );

      setSuccess('Study material successfully registered & parsed.');
      setFile(null);
      setTitle('');
      setTags('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadDocuments();
    } catch (err) {
      setError(err.response?.data?.message || 'Notes processing failed. Please retry.');
    } finally {
      setUploading(false);
      setProgress(0);
      setStatusMsg('');
    }
  };

  const handleDelete = async (docId) => {
    setError(null);
    setSuccess(null);
    if (!window.confirm('Are you sure you want to permanently delete this textbook from StudyMind?')) {
      return;
    }

    try {
      await deleteDocument(docId);
      setSuccess('Document removed successfully.');
      loadDocuments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove document.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">Study Vault</h2>
        <p className="text-xs text-slate-500 mt-1">Upload lecture notes, tutorials, or textbooks in PDF format (Max 10MB)</p>
      </div>

      {/* Main Grid: Upload Form + Table */}
      <div className="grid gap-6 lg:grid-cols-5">
        
        {/* Upload Column */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-6 backdrop-blur-xl lg:col-span-2 shadow-sm h-fit">
          <h3 className="text-sm font-bold text-white mb-4">Register New Notes</h3>
          
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            
            {/* Feedback Alerts */}
            {error && (
              <div className="flex gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="flex gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-400">
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-8 px-4 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-500/5'
                  : file
                  ? 'border-indigo-500/40 bg-indigo-500/2'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
              />
              
              <UploadCloud className={`h-10 w-10 mb-3 ${file ? 'text-indigo-400 animate-pulse' : 'text-slate-600'}`} />
              
              {file ? (
                <div>
                  <p className="text-xs font-bold text-white truncate max-w-[200px]">{file.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {Math.round((file.size / (1024 * 1024)) * 100) / 100} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-slate-300">Drag and drop notes here</p>
                  <p className="text-[10px] text-slate-500 mt-1">or click to browse local folders</p>
                </div>
              )}
            </div>

            {/* Document Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 px-4 text-xs text-white placeholder-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g., Computer Networks Unit 3"
                required
              />
            </div>

            {/* Subject Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Subject Category</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-4 text-xs text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Electronics & Communication">Electronics & Comm</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Other Engineering">Other Specialization</option>
              </select>
            </div>

            {/* Tags Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Keywords / Tags (Semicolon separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/40 py-2.5 px-4 text-xs text-white placeholder-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g., networking; layers; OSI model"
              />
            </div>

            {/* Uploading Status Overlay */}
            {uploading && (
              <div className="space-y-2 rounded-xl bg-slate-950/60 p-4 border border-indigo-500/10">
                <div className="flex justify-between items-center text-[10px] font-semibold">
                  <span className="text-indigo-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 animate-spin" />
                    {statusMsg}
                  </span>
                  <span className="text-slate-400">{progress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-900 overflow-hidden">
                  <div
                    style={{ width: `${progress}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_8px_rgba(99,102,241,0.4)] transition-all duration-300"
                  ></div>
                </div>
              </div>
            )}

            {/* Upload Action CTA */}
            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-500 hover:shadow-indigo-500/10 active:scale-[0.99] disabled:opacity-40 transition-all cursor-pointer"
            >
              Parse & Index PDF Notes
            </button>
          </form>
        </div>

        {/* Documents Table Column */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/10 p-6 backdrop-blur-xl lg:col-span-3 shadow-sm h-fit">
          <h3 className="text-sm font-bold text-white mb-4">Indexed Study Library</h3>
          
          {loading ? (
            <div className="flex h-48 flex-col items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-800 border-t-indigo-500"></div>
              <p className="mt-3 text-[10px] text-slate-500 font-semibold">Scanning digital files vault...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FileText className="h-12 w-12 text-slate-700 mb-4" />
              <p className="text-xs text-slate-400 font-medium">No study materials in vault.</p>
              <p className="text-[10px] text-slate-600 max-w-[200px] mt-1">Upload lecture slides, chapters, or syllabus lists to initiate AI chat.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/60 pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="pb-3 pr-3 font-semibold">Material Title</th>
                    <th className="pb-3 px-3 font-semibold">Subject</th>
                    <th className="pb-3 px-3 font-semibold hidden md:table-cell">Tags</th>
                    <th className="pb-3 pl-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-xs">
                  {documents.map((doc) => (
                    <tr key={doc._id} className="hover:bg-slate-900/10 transition-colors">
                      {/* Name / Title */}
                      <td className="py-3.5 pr-3 font-bold text-white truncate max-w-[120px] sm:max-w-[180px]">
                        {doc.title}
                      </td>
                      
                      {/* Subject badge */}
                      <td className="py-3.5 px-3">
                        <span className="rounded bg-[#0B0F19] px-2 py-0.5 border border-slate-800 text-indigo-400 font-semibold tracking-wide text-[10px]">
                          {doc.subject}
                        </span>
                      </td>

                      {/* Tags */}
                      <td className="py-3.5 px-3 text-slate-500 hidden md:table-cell truncate max-w-[100px]">
                        {doc.tags?.join(', ') || '—'}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 pl-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Chat */}
                          <Link
                            to={`/chat/${doc._id}`}
                            title="Open Chat"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-600/10 hover:text-indigo-400 transition-colors"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Link>
                          {/* Summary */}
                          <Link
                            to={`/summary/${doc._id}`}
                            title="Generate Summary"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-pink-600/10 hover:text-pink-400 transition-colors"
                          >
                            <Sparkles className="h-4 w-4" />
                          </Link>
                          {/* Trash */}
                          <button
                            onClick={() => handleDelete(doc._id)}
                            title="Delete Material"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-600/10 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
