import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc } from '../../lib/db';
import { Plus, Trash2, Video } from 'lucide-react';
import { Module } from '../../types';

export default function AdminLectures() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [lectures, setLectures] = useState<any[]>([]);

  const [title, setTitle] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'modules'));
    return onSnapshot(q, snap => setModules(snap.docs.map(d => ({ id: d.id, ...d.data() } as Module))));
  }, []);

  useEffect(() => {
    if (!selectedModule) return;
    const q = query(collection(db, `modules/${selectedModule}/lectures`));
    return onSnapshot(q, snap => {
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const validLectures: any[] = [];
      
      snap.docs.forEach(d => {
        const data = d.data();
        let isPast = false;
        if (data.date) {
           const parts = data.date.split('-');
           if (parts.length === 3) {
              const lecDay = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
              if (lecDay.getTime() < today.getTime()) {
                isPast = true;
              }
           }
        }
        
        if (isPast) {
          deleteDoc(doc(db, `modules/${selectedModule}/lectures`, d.id)).catch(console.error);
        } else {
          validLectures.push({ id: d.id, ...data });
        }
      });
      
      setLectures(validLectures);
    });
  }, [selectedModule]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;
    const id = crypto.randomUUID();
    const newLec = { title, meetLink, date, time, createdAt: Date.now() };
    await setDoc(doc(db, `modules/${selectedModule}/lectures`, id), newLec);
    setLectures(prev => [...prev, { id, ...newLec }]);
    setTitle(''); setMeetLink(''); setDate(''); setTime('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this lecture?')) {
      await deleteDoc(doc(db, `modules/${selectedModule}/lectures`, id));
      setLectures(prev => prev.filter(l => l.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in">
      <div className="welcome-banner">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Lectures Management</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Schedule video lectures for modules.</p>
      </div>

      <div className="app-card p-5">
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Select Module</label>
        <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)} className="form-input">
          <option value="">-- Choose Module --</option>
          {modules.map(m => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}
        </select>
      </div>

      {selectedModule && (
        <>
          <div className="app-card p-5">
            <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Add New Lecture</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Lecture Title</label>
                <input required placeholder="Lecture Title" value={title} onChange={e=>setTitle(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Meet Link</label>
                <input required placeholder="Meet Link (URL)" value={meetLink} onChange={e=>setMeetLink(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Date</label>
                <input required type="date" value={date} onChange={e=>setDate(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Time</label>
                <input required type="time" value={time} onChange={e=>setTime(e.target.value)} className="form-input" />
              </div>
              <button type="submit" className="md:col-span-2 btn-primary flex justify-center items-center py-2.5 mt-2">
                <Plus className="w-4 h-4 mr-2" /> Schedule Lecture
              </button>
            </form>
          </div>

          <div className="app-card p-5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full data-table">
                <thead>
                  <tr>
                    <th className="text-left">Title</th>
                    <th className="text-left">Date & Time</th>
                    <th className="text-left">Link</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lectures.map(lec => (
                    <tr key={lec.id}>
                      <td>
                        <div className="flex items-center font-semibold" style={{ color: 'var(--text-primary)' }}>
                          <Video className="w-4 h-4 mr-2 text-indigo-500"/>
                          {lec.title}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{lec.date} at {lec.time}</td>
                      <td>
                        <a href={lec.meetLink} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">Join Meeting</a>
                      </td>
                      <td className="text-right">
                        <button onClick={() => handleDelete(lec.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" style={{ border: '1px solid transparent' }}><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  ))}
                  {lectures.length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No lectures scheduled.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
