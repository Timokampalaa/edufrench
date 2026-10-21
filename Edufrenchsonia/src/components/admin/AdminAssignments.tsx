import React, { useState, useEffect } from 'react';
import { db, collection, query, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDocs, storage, ref, uploadBytes, getDownloadURL } from '../../lib/db';
import { Plus, Trash2, FileText, Loader2, Users, CheckCircle, ChevronLeft, X } from 'lucide-react';
import { Module } from '../../types';

export default function AdminAssignments() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [startTime, setStartTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [marks, setMarks] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'modules'));
    return onSnapshot(q, snap => setModules(snap.docs.map(d => ({ id: d.id, ...d.data() } as Module))));
  }, []);

  useEffect(() => {
    if (!selectedModule) return;
    const q = query(collection(db, `modules/${selectedModule}/assignments`));
    return onSnapshot(q, snap => setAssignments(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [selectedModule]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedModule) return;
    
    const form = e.currentTarget;
    setUploading(true);
    try {
      const id = crypto.randomUUID();
      let fileUrl = '';
      if (file) {
        const fileRef = ref(storage, `assignments/${id}_${file.name}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
      }

      const payloadDesc = JSON.stringify({ text: desc, start: new Date(startTime).getTime() });

      const newAssignment = {
        title, description: payloadDesc, deadline: new Date(deadline).getTime(), marks: Number(marks), fileUrl, createdAt: Date.now()
      };
      await setDoc(doc(db, `modules/${selectedModule}/assignments`, id), newAssignment);
      
      setAssignments(prev => [...prev, { id, ...newAssignment }]);

      setTitle(''); setDesc(''); setStartTime(''); setDeadline(''); setMarks(''); setFile(null);
      form.reset();
    } catch (err: any) {
      console.error("Upload failed", err);
      alert(err.message || "Failed to upload assignment.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this assignment?')) {
      try {
        const subsSnap = await getDocs(collection(db, `modules/${selectedModule}/assignments/${id}/submissions`));
        for (const subDoc of subsSnap.docs) {
          await deleteDoc(doc(db, `modules/${selectedModule}/assignments/${id}/submissions`, subDoc.id));
        }
        await deleteDoc(doc(db, `modules/${selectedModule}/assignments`, id));
        setAssignments(prev => prev.filter(ast => ast.id !== id));
        if (selectedAssignment?.id === id) setSelectedAssignment(null);
      } catch (err: any) {
        alert(err.message || "Failed to delete assignment.");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in">
      <div className="welcome-banner">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Assignments Management</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Create assignments for modules and grade submissions.</p>
      </div>

      {!selectedAssignment && (
        <div className="app-card p-5">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Select Module</label>
          <select value={selectedModule} onChange={(e) => {setSelectedModule(e.target.value); setSelectedAssignment(null);}} className="form-input">
            <option value="">-- Choose Module --</option>
            {modules.map(m => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}
          </select>
        </div>
      )}

      {selectedModule && !selectedAssignment && (
        <>
          <div className="app-card p-5">
            <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Add New Assignment</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Assignment Title</label>
                <input required placeholder="Assignment Title" value={title} onChange={e=>setTitle(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Total Marks</label>
                <input required placeholder="Total Marks" type="number" min="0" value={marks} onChange={e=>setMarks(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Assignment File (Optional)</label>
                <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="form-input" title="Assignment File" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Start Time</label>
                <input required type="datetime-local" value={startTime} onChange={e=>setStartTime(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Deadline</label>
                <input required type="datetime-local" value={deadline} onChange={e=>setDeadline(e.target.value)} className="form-input" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Instructions / Description</label>
                <textarea required placeholder="Instructions / Description" value={desc} onChange={e=>setDesc(e.target.value)} className="form-input" rows={3}></textarea>
              </div>
              <button type="submit" disabled={uploading} className="md:col-span-2 btn-primary flex justify-center items-center py-2.5 mt-2">
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />} 
                {uploading ? 'Uploading & Publishing...' : 'Publish Assignment'}
              </button>
            </form>
          </div>

          <div className="app-card p-5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full data-table">
                <thead>
                  <tr>
                    <th className="text-left">Assignment</th>
                    <th className="text-left">Timing</th>
                    <th className="text-left">Marks</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map(ast => {
                    const isJson = typeof ast.description === 'string' && ast.description.startsWith('{');
                    const data = isJson ? JSON.parse(ast.description) : { text: ast.description, start: ast.createdAt || Date.now() };
                    return (
                    <tr key={ast.id}>
                      <td>
                        <div className="flex items-center font-semibold" style={{ color: 'var(--text-primary)' }}>
                          <FileText className="w-4 h-4 mr-2 text-indigo-500"/>
                          {ast.title}
                        </div>
                        {ast.fileUrl && <a href={ast.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline mt-1 block font-medium">View Attachment</a>}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        <div><span className="font-semibold text-xs" style={{ color: 'var(--text-muted)' }}>Start:</span> {new Date(data.start).toLocaleString()}</div>
                        <div><span className="font-semibold text-xs" style={{ color: 'var(--text-muted)' }}>End:</span> {new Date(ast.deadline).toLocaleString()}</div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{ast.marks}</td>
                      <td className="text-right whitespace-nowrap">
                        <button onClick={() => setSelectedAssignment(ast)} className="btn-secondary py-1 px-3 mr-2 text-xs">Submissions</button>
                        <button onClick={() => handleDelete(ast.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  )})}
                  {assignments.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No assignments posted.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {selectedModule && selectedAssignment && (
        <AssignmentSubmissions 
          moduleId={selectedModule} 
          assignment={selectedAssignment} 
          onBack={() => setSelectedAssignment(null)} 
        />
      )}
    </div>
  );
}

function AssignmentSubmissions({ moduleId, assignment, onBack }: { moduleId: string, assignment: any, onBack: () => void }) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [students, setStudents] = useState<Record<string, any>>({});
  
  // Grading state
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState<string>('');
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [viewingContent, setViewingContent] = useState<{name: string, content: string} | null>(null);
  const [viewingFileUrl, setViewingFileUrl] = useState<{name: string, url: string} | null>(null);

  useEffect(() => {
    // Fetch students list to map IDs to Names
    const qS = query(collection(db, 'students'));
    const unsubS = onSnapshot(qS, snap => {
      const sMap: Record<string, any> = {};
      snap.docs.forEach(d => sMap[d.id] = d.data());
      setStudents(sMap);
    });

    const q = query(collection(db, `modules/${moduleId}/assignments/${assignment.id}/submissions`));
    const unsub = onSnapshot(q, snap => {
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubS(); unsub(); };
  }, [moduleId, assignment.id]);

  const startGrading = (sub: any) => {
    setGradingId(sub.id);
    setGradeInput(sub.grade?.toString() || '');
    setFeedbackInput(sub.feedback || '');
  };

  const saveGrade = async (studentId: string) => {
    try {
      await updateDoc(doc(db, `modules/${moduleId}/assignments/${assignment.id}/submissions`, studentId), {
        grade: Number(gradeInput) || 0,
        feedback: feedbackInput
      });
      setGradingId(null);
    } catch (e: any) {
      alert("Failed to update grade.");
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <button onClick={onBack} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center hover:underline">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Assignments
      </button>

      <div className="app-card p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{assignment.title}</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Total Marks: {assignment.marks} • Deadline: {new Date(assignment.deadline).toLocaleString()}</p>
        </div>
        <div className="sm:text-right">
          <span className="badge-purple font-semibold">{submissions.length} Submissions</span>
        </div>
      </div>

      <div className="app-card p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Student</th>
                <th className="text-left">Submitted At</th>
                <th className="text-left">File/Text</th>
                <th className="text-left">Grade & Feedback</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(sub => {
                const student = students[sub.studentId || sub.id] || { fullName: 'Unknown Student', regNumber: sub.studentId || sub.id };
                const isGrading = gradingId === sub.id;
                
                return (
                  <tr key={sub.id}>
                    <td>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{student.fullName}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{student.regNumber}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(sub.submittedAt).toLocaleString()}
                    </td>
                    <td>
                      {sub.type === 'text' ? (
                        <button onClick={() => setViewingContent({name: student.fullName, content: sub.content})} className="font-bold text-indigo-600 hover:underline">Read Answer</button>
                      ) : (
                        <button onClick={() => setViewingFileUrl({name: student.fullName, url: sub.fileUrl})} className="font-bold text-indigo-600 hover:underline">View Work</button>
                      )}
                    </td>
                    <td>
                      {isGrading ? (
                        <div className="space-y-2 max-w-xs">
                          <div className="flex items-center space-x-2">
                            <input 
                              type="number" 
                              className="form-input py-1 px-2 w-20" 
                              placeholder={`/ ${assignment.marks}`}
                              value={gradeInput}
                              onChange={e => setGradeInput(e.target.value)}
                              autoFocus
                            />
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ {assignment.marks}</span>
                          </div>
                          <input 
                            type="text" 
                            className="form-input py-1 px-2 w-full" 
                            placeholder="Add feedback..."
                            value={feedbackInput}
                            onChange={e => setFeedbackInput(e.target.value)}
                          />
                        </div>
                      ) : (
                        sub.grade !== undefined ? (
                          <div className="max-w-sm">
                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{sub.grade}/{assignment.marks}</span>
                            {sub.feedback && <span className="ml-2 text-xs block" style={{ color: 'var(--text-muted)' }}>{sub.feedback}</span>}
                          </div>
                        ) : (
                          <span className="text-amber-600 italic text-xs font-semibold">Not graded</span>
                        )
                      )}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {isGrading ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => setGradingId(null)} className="btn-secondary py-1 px-3 text-xs">Cancel</button>
                          <button onClick={() => saveGrade(sub.studentId || sub.id)} className="btn-primary py-1 px-3 text-xs">Save</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => startGrading(sub)} 
                          className="btn-secondary py-1 px-3 text-xs"
                        >
                          {sub.grade !== undefined ? 'Edit Grade' : 'Grade'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {submissions.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No submissions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewingContent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="app-card max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden" style={{ boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div className="px-5 py-4 flex justify-between items-center bg-[var(--app-bg)] shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Online Answer: {viewingContent.name}</h3>
              <button onClick={() => setViewingContent(null)} className="btn-secondary py-1 px-3 text-xs">Close</button>
            </div>
            <div 
              className="p-6 overflow-y-auto text-sm font-medium leading-relaxed" 
              style={{ color: 'var(--text-primary)' }}
              dangerouslySetInnerHTML={{ __html: viewingContent.content }}
            />
          </div>
        </div>
      )}

      {viewingFileUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="app-card max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden border border-neutral-200" style={{ boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
            <div className="px-5 py-4 flex justify-between items-center bg-[var(--app-bg)] shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="font-bold text-base flex items-center" style={{ color: 'var(--text-primary)' }}>
                <FileText className="w-5 h-5 mr-3 text-indigo-500" />
                Document: {viewingFileUrl.name}
              </h3>
              <div className="flex items-center space-x-3">
                <a href={viewingFileUrl.url} target="_blank" rel="noreferrer" className="btn-secondary py-1.5 px-3 text-xs font-semibold">
                  Download File
                </a>
                <button onClick={() => setViewingFileUrl(null)} style={{ color: 'var(--text-muted)' }}>
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="flex-1 w-full bg-neutral-100 flex items-center justify-center overflow-hidden">
              <iframe 
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(viewingFileUrl.url)}&embedded=true`} 
                className="w-full h-full border-0 bg-white" 
                title="Document Preview" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
