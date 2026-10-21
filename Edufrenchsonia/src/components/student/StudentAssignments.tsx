import React, { useState, useEffect } from 'react';
import { db, collection, query, getDocs, doc, setDoc, getDoc, storage, ref, uploadBytes, getDownloadURL, mutationEmitter } from '../../lib/db';
import { FileText, Clock, Upload, CheckCircle, Loader2, Edit3, X, Send } from 'lucide-react';
import clsx from 'clsx';
import { Module } from '../../types';

const CountdownTimer = ({ targetTime, onExpire }: { targetTime: number, onExpire?: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(targetTime - Date.now());
  const onExpireRef = React.useRef(onExpire);
  
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const int = setInterval(() => {
      const remaining = targetTime - Date.now();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(int);
        if (onExpireRef.current) onExpireRef.current();
      }
    }, 1000);
    return () => clearInterval(int);
  }, [targetTime]);

  if (timeLeft <= 0) return <span>00:00:00</span>;

  const m = Math.floor(timeLeft / 1000 / 60);
  const s = Math.floor((timeLeft / 1000) % 60);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return <span>{h.toString().padStart(2, '0')}:{mm.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}</span>;
};

const RichTextEditor = ({ value, onChange, onFocus }: { value: string, onChange: (v: string) => void, onFocus?: () => void }) => {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const isInternalChange = React.useRef(false);
  const [showTableMenu, setShowTableMenu] = React.useState(false);
  const [tableRows, setTableRows] = React.useState(2);
  const [tableCols, setTableCols] = React.useState(3);
  
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (!isInternalChange.current) {
        editorRef.current.innerHTML = value;
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const exec = (cmd: string, val: string | undefined = undefined) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    isInternalChange.current = true;
    onChange(editorRef.current?.innerHTML || '');
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    isInternalChange.current = true;
    onChange(e.currentTarget.innerHTML);
  };

  const insertTable = () => {
    let rowsHtml = '';
    for (let r = 0; r < tableRows; r++) {
      rowsHtml += '<tr>';
      for (let c = 0; c < tableCols; c++) {
        rowsHtml += '<td style="border: 1px solid #ddd; padding: 8px;">&nbsp;</td>';
      }
      rowsHtml += '</tr>';
    }
    const tableHTML = `
      <table style="border-collapse: collapse; width: 100%; margin-bottom: 1rem; border: 1px solid #ddd;">
        <tbody>
          ${rowsHtml}
        </tbody>
      </table><br/>
    `;
    exec('insertHTML', tableHTML);
    setShowTableMenu(false);
  };

  return (
    <div className="border rounded-2xl overflow-hidden flex flex-col surface-primary" style={{ borderColor: 'var(--border)' }}>
      <div className="flex flex-wrap gap-1 p-2 editor-toolbar items-center">
        <select 
          onChange={(e) => exec('fontSize', e.target.value)} 
          className="p-1 border rounded text-xs bg-white focus:outline-none"
          style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          defaultValue="3"
          title="Font Size"
        >
          <option value="1">Smallest</option>
          <option value="2">Small</option>
          <option value="3">Normal</option>
          <option value="4">Large</option>
          <option value="5">Largest</option>
        </select>
        <div className="w-px h-6 bg-neutral-200 mx-1" />
        <button type="button" onClick={() => exec('bold')} className="p-1 px-2.5 hover:bg-neutral-200 rounded font-bold text-sm text-neutral-700" title="Bold">B</button>
        <button type="button" onClick={() => exec('italic')} className="p-1 px-2.5 hover:bg-neutral-200 rounded italic font-serif text-sm text-neutral-700" title="Italic">I</button>
        <button type="button" onClick={() => exec('underline')} className="p-1 px-2.5 hover:bg-neutral-200 rounded underline text-sm text-neutral-700" title="Underline">U</button>
        <div className="w-px h-6 bg-neutral-200 mx-1" />
        <button type="button" onClick={() => exec('insertOrderedList')} className="p-1 px-2 hover:bg-neutral-200 rounded text-xs text-neutral-700" title="Numbered List">1.</button>
        <button type="button" onClick={() => exec('insertUnorderedList')} className="p-1 px-2 hover:bg-neutral-200 rounded text-xs text-neutral-700" title="Bulleted List">•</button>
        <div className="w-px h-6 bg-neutral-200 mx-1" />
        <button type="button" onClick={() => exec('justifyLeft')} className="p-1 px-2 hover:bg-neutral-200 rounded text-xs text-neutral-700" title="Align Left">Left</button>
        <button type="button" onClick={() => exec('justifyCenter')} className="p-1 px-2 hover:bg-neutral-200 rounded text-xs text-neutral-700" title="Align Center">Center</button>
        <div className="w-px h-6 bg-neutral-200 mx-1" />
        <div className="relative">
          <button type="button" onClick={() => setShowTableMenu(!showTableMenu)} className="p-1 px-2 hover:bg-neutral-200 rounded text-xs text-neutral-700 font-semibold" title="Insert Table">Table</button>
          
          {showTableMenu && (
            <div className="absolute top-full mt-1 left-0 bg-white border shadow-xl rounded-2xl p-3 z-10 w-48" style={{ borderColor: 'var(--border)' }}>
              <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Rows</label>
                  <input type="number" min="1" max="20" value={tableRows} onChange={(e) => setTableRows(parseInt(e.target.value) || 1)} className="w-16 p-1 border rounded text-xs focus:outline-none" style={{ borderColor: 'var(--border)' }} />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Cols</label>
                  <input type="number" min="1" max="20" value={tableCols} onChange={(e) => setTableCols(parseInt(e.target.value) || 1)} className="w-16 p-1 border rounded text-xs focus:outline-none" style={{ borderColor: 'var(--border)' }} />
                </div>
                <button type="button" onClick={insertTable} className="w-full mt-2 py-1.5 btn-primary text-xs">Insert Table</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div 
        ref={editorRef}
        className="p-4 min-h-[250px] outline-none max-h-[500px] overflow-y-auto text-sm surface-primary"
        contentEditable
        onBlur={handleInput}
        onInput={handleInput}
        onFocus={onFocus}
        suppressContentEditableWarning
        style={{ color: 'var(--text-primary)' }}
      />
    </div>
  );
};

export default function StudentAssignments({ studentId }: { studentId: string }) {
  const [assignments, setAssignments] = useState<{mod: Module, asn: any, sub: any | null}[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [viewingSubmission, setViewingSubmission] = useState<string | null>(null);
  const [submitMenuOpen, setSubmitMenuOpen] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{file: File, moduleId: string, assignmentId: string} | null>(null);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;
    
    let isMounted = true;
    let isFetching = false;
    let lastHash = '';
    
    const fetchAssignments = async () => {
      if (isFetching) return;
      isFetching = true;
      try {
        const q = query(collection(db, 'modules'));
        const snap = await getDocs(q);
        if (!isMounted) return;
        
        const mods = snap.docs.map(d => ({ id: d.id, ...d.data() } as Module));

        const enrolledMods: Module[] = [];
        for (const m of mods) {
          const docRef = doc(db, `modules/${m.id}/enrollments`, studentId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            enrolledMods.push(m);
          }
        }

        const allAsn: {mod: Module, asn: any, sub: any | null}[] = [];
        for (const m of enrolledMods) {
          const asnSnap = await getDocs(collection(db, `modules/${m.id}/assignments`));
          for (const asnDoc of asnSnap.docs) {
            const asnData = { id: asnDoc.id, ...asnDoc.data() };
            const subDocRef = doc(db, `modules/${m.id}/assignments/${asnDoc.id}/submissions`, studentId);
            const subDocSnap = await getDoc(subDocRef);
            
            allAsn.push({ 
              mod: m, 
              asn: asnData,
              sub: subDocSnap.exists() ? subDocSnap.data() : null
            });
          }
        }
        
        if (!isMounted) return;
        
        const sorted = allAsn.sort((a,b) => new Date(a.asn.deadline).getTime() - new Date(b.asn.deadline).getTime());
        const newHash = JSON.stringify(sorted);
        if (newHash !== lastHash) {
          setAssignments(sorted);
          lastHash = newHash;
        }
      } catch (err) {
        console.error(err);
      } finally {
        isFetching = false;
      }
    };
    
    fetchAssignments();
    const interval = setInterval(fetchAssignments, 3000);
    const unsub = mutationEmitter.subscribe(fetchAssignments);

    return () => {
      isMounted = false;
      clearInterval(interval);
      unsub();
    };
  }, [studentId]);

  const handleUpload = async (moduleId: string, assignmentId: string, file: File) => {
    if (!studentId) return;
    setUploading(assignmentId);
    
    try {
      const fileRef = ref(storage, `submissions/${moduleId}_${assignmentId}_${studentId}_${file.name}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      const subRef = doc(db, `modules/${moduleId}/assignments/${assignmentId}/submissions`, studentId);
      const subData = {
        fileUrl,
        type: 'file',
        submittedAt: Date.now()
      };
      await setDoc(subRef, subData);

      setAssignments(prev => prev.map(item => {
        if (item.asn.id === assignmentId) {
          return { ...item, sub: { ...item.sub, ...subData } };
        }
        return item;
      }));
      setActiveSheet(null);
      setAnswerText('');
      
      alert("Assignment submitted successfully!");
      setSelectedFile(null);
      setPreviewFileUrl(null);
    } catch(err: any) {
      console.error(err);
      alert(err.message || JSON.stringify(err) || "Failed to submit assignment.");
    } finally {
      setUploading(null);
    }
  };

  const handleOnlineSubmit = async (moduleId: string, assignmentId: string, editorContent: string) => {
    if (!studentId || !editorContent.trim()) return;
    setUploading(assignmentId);
    
    try {
      const subRef = doc(db, `modules/${moduleId}/assignments/${assignmentId}/submissions`, studentId);
      const subData = {
        content: editorContent,
        type: 'text',
        submittedAt: Date.now()
      };
      await setDoc(subRef, subData);

      setAssignments(prev => prev.map(item => {
        if (item.asn.id === assignmentId) {
          return { ...item, sub: { ...item.sub, ...subData } };
        }
        return item;
      }));
      
      setActiveSheet(null);
      setAnswerText('');
      alert("Online assignment submitted successfully!");
    } catch(err: any) {
      console.error(err);
      alert(err.message || JSON.stringify(err) || "Failed to submit assignment.");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in">
      <div className="welcome-banner">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Assignments</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>View and submit coursework tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignments.map((item, idx) => {
          const isWriting = activeSheet === item.asn.id;
          const isSubmitted = !!item.sub;
          
          let data = { text: item.asn.description, start: item.asn.createdAt || Date.now() };
          if (typeof item.asn.description === 'string' && item.asn.description.startsWith('{')) {
            try { data = JSON.parse(item.asn.description); } catch(e) {}
          }
          const hasStarted = Date.now() >= data.start;
          const hasEnded = Date.now() > item.asn.deadline;

          if (!isWriting && !isSubmitted) {
            return (
              <div key={idx} className="app-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="badge-purple font-semibold">{item.mod.code}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.asn.marks} Marks</span>
                  </div>
                  <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{item.asn.title}</h3>
                  <div className="space-y-2 mb-6">
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Start Time:</span> {new Date(data.start).toLocaleString()}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Deadline:</span> {new Date(item.asn.deadline).toLocaleString()}</p>
                  </div>
                </div>
                {!hasStarted ? (
                  <button 
                    disabled
                    className="w-full py-2.5 rounded-xl text-xs font-semibold flex justify-center items-center opacity-70 cursor-not-allowed"
                    style={{ background: 'var(--app-bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                  >
                    <Clock className="w-3.5 h-3.5 mr-2" /> Starts in: <span className="ml-1 font-mono font-bold"><CountdownTimer targetTime={data.start} /></span>
                  </button>
                ) : hasEnded ? (
                  <button 
                    disabled
                    className="w-full py-2.5 rounded-xl text-xs font-semibold flex justify-center items-center opacity-70 cursor-not-allowed"
                    style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca' }}
                  >
                    Deadline Passed
                  </button>
                ) : (
                  <button 
                    onClick={() => { setActiveSheet(item.asn.id); setAnswerText(''); setSubmitMenuOpen(null); }}
                    className="w-full btn-primary py-2.5 text-xs font-bold"
                  >
                    Start Assignment
                  </button>
                )}
              </div>
            );
          }

          return (
            <div key={idx} className={clsx("app-card overflow-hidden flex flex-col", isWriting && "md:col-span-2")}>
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="badge-purple font-semibold">
                    {item.mod.code}
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.asn.marks} Marks</span>
                </div>
                <h3 className="text-lg font-bold mb-2 flex items-center" style={{ color: 'var(--text-primary)' }}>
                  <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                  {item.asn.title}
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{data.text}</p>
                {item.asn.fileUrl && (
                  <a href={item.asn.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline font-semibold block mb-4">Download Assignment Attachment</a>
                )}
                
                {item.sub && item.sub.grade !== undefined && item.sub.grade !== null && (
                  <div className="mt-4 p-4 rounded-xl border mb-4 bg-emerald-50/50" style={{ borderColor: '#a7f3d0' }}>
                    <p className="text-sm font-bold text-emerald-800">Grade: {item.sub.grade} / {item.asn.marks}</p>
                    {item.sub.feedback && <p className="text-xs text-emerald-700 mt-1">Feedback: {item.sub.feedback}</p>}
                  </div>
                )}
                
                {isWriting && (
                  <div className="mt-6 border-t pt-6 flex flex-col flex-1" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0 w-full relative">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Online Answer Sheet</span>
                        <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 shadow-sm" title="Time Remaining">
                          <Clock className="w-4 h-4" />
                          <CountdownTimer targetTime={item.asn.deadline} onExpire={() => {
                            if (answerText.trim() && !uploading) {
                               alert("Time is up! Your answers are being automatically submitted.");
                               handleOnlineSubmit(item.mod.id, item.asn.id, answerText);
                            } else {
                               alert("Time is up! You are being logged out of this assignment.");
                               setActiveSheet(null);
                            }
                          }} />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <button 
                            onClick={() => setSubmitMenuOpen(submitMenuOpen === item.asn.id ? null : item.asn.id)}
                            className="btn-primary py-2 px-4 text-xs font-bold"
                          >
                            {uploading === item.asn.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Send className="w-4 h-4 mr-2" />}
                            Submit Answer Sheet
                          </button>
                          
                          {submitMenuOpen === item.asn.id && (
                            <div className="absolute right-0 top-full mt-2 bg-white border shadow-xl rounded-2xl p-2 z-20 w-56 flex flex-col space-y-1" style={{ borderColor: 'var(--border)' }}>
                              <label className="cursor-pointer w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-xl flex items-center font-semibold">
                                <Upload className="w-4 h-4 mr-2 text-neutral-500" />
                                Upload File Answer
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  accept=".pdf,.doc,.docx,.zip"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setSelectedFile({ file, moduleId: item.mod.id, assignmentId: item.asn.id });
                                      setPreviewFileUrl(URL.createObjectURL(file));
                                    }
                                    e.target.value = '';
                                    setSubmitMenuOpen(null);
                                  }} 
                                  disabled={uploading === item.asn.id}
                                />
                              </label>
                              
                              <button 
                                onClick={() => {
                                  handleOnlineSubmit(item.mod.id, item.asn.id, answerText);
                                  setSubmitMenuOpen(null);
                                }}
                                disabled={uploading === item.asn.id || !answerText.trim()}
                                className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-xl disabled:opacity-50 flex items-center font-semibold"
                              >
                                <Edit3 className="w-4 h-4 mr-2 text-neutral-500" />
                                Submit Text Answer
                              </button>
                            </div>
                          )}
                        </div>
                        <button onClick={() => {setActiveSheet(null); setAnswerText(''); setSubmitMenuOpen(null);}} className="btn-secondary p-2 flex items-center justify-center h-[38px] w-[38px]" title="Close Editor">
                            <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="rounded-2xl flex-1 surface-primary">
                      <RichTextEditor 
                        value={answerText}
                        onChange={setAnswerText}
                      />
                    </div>
                  </div>
                )}
                
              </div>
              
              {!isWriting && item.sub && (
                 <div className="px-6 py-4 bg-emerald-50/30 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                   <div className="flex items-center text-emerald-600 text-sm font-semibold">
                     <CheckCircle className="w-4 h-4 mr-1.5" /> Submitted Coursework
                   </div>
                   {item.sub.type === 'text' && (
                     <button onClick={() => setViewingSubmission(item.sub.content)} className="text-xs text-indigo-600 hover:underline font-bold">View Submitted Text</button>
                   )}
                   {item.sub.type === 'file' && item.sub.fileUrl && (
                     <a href={item.sub.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline font-bold">View Submitted File</a>
                   )}
                 </div>
              )}
            </div>
          );
        })}
        {assignments.length === 0 && (
          <div className="col-span-full app-card p-8 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            No assignments due.
          </div>
        )}
      </div>

      {viewingSubmission && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="app-card max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden" style={{ boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div className="px-5 py-4 flex justify-between items-center bg-[var(--app-bg)] shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Your Submitted Answer</h3>
              <button onClick={() => setViewingSubmission(null)} className="btn-secondary py-1 px-3 text-xs">Close</button>
            </div>
            <div 
              className="p-6 overflow-y-auto text-sm leading-relaxed" 
              style={{ color: 'var(--text-primary)' }}
              dangerouslySetInnerHTML={{ __html: viewingSubmission }}
            />
          </div>
        </div>
      )}

      {selectedFile && previewFileUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="app-card max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden border border-neutral-200 shadow-2xl">
            <div className="px-5 py-4 flex justify-between items-center bg-[var(--app-bg)] shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="font-bold text-base flex items-center" style={{ color: 'var(--text-primary)' }}>
                <FileText className="w-5 h-5 mr-3 text-indigo-500" />
                Upload Preview
              </h3>
              <button 
                onClick={() => { setSelectedFile(null); setPreviewFileUrl(null); }} 
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto bg-neutral-50 p-6 flex flex-col items-center justify-center relative">
              {selectedFile.file.type.startsWith('image/') ? (
                <img src={previewFileUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded shadow" />
              ) : selectedFile.file.type === 'application/pdf' ? (
                <iframe src={previewFileUrl} className="w-full h-full border-0 bg-white rounded shadow" title="PDF Preview" />
              ) : (
                <div className="text-center p-8 bg-white rounded-2xl border shadow-sm max-w-md w-full" style={{ borderColor: 'var(--border)' }}>
                  <FileText className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                  <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{selectedFile.file.name}</p>
                  <p className="text-xs mb-6 font-mono" style={{ color: 'var(--text-muted)' }}>{(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p className="text-xs px-4 py-2 bg-neutral-50 rounded-xl" style={{ color: 'var(--text-secondary)' }}>Preview not available for this file type.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-[var(--app-bg)] flex justify-end space-x-3 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
              <button 
                onClick={() => { setSelectedFile(null); setPreviewFileUrl(null); }} 
                disabled={uploading === selectedFile.assignmentId}
                className="btn-secondary px-5 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleUpload(selectedFile.moduleId, selectedFile.assignmentId, selectedFile.file)} 
                disabled={uploading === selectedFile.assignmentId}
                className="btn-primary px-5 py-2 text-xs font-bold flex items-center"
              >
                {uploading === selectedFile.assignmentId ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Send className="w-4 h-4 mr-2" />}
                Submit Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
