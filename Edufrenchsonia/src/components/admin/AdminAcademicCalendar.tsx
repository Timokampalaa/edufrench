import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc } from '../../lib/db';
import { Plus, Trash2, CalendarDays, Clock3, MapPin, NotebookPen } from 'lucide-react';
import { AcademicEvent } from '../../types';

export default function AdminAcademicCalendar() {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<'lecture' | 'deadline' | 'exam' | 'holiday' | 'event'>('lecture');

  useEffect(() => {
    const q = query(collection(db, 'academicEvents'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as AcademicEvent));
      data.sort((a, b) => {
        const aDate = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
        const bDate = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
        return aDate - bDate;
      });
      setEvents(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      alert('Please enter a title and date for the academic event.');
      return;
    }

    const id = crypto.randomUUID();
    await setDoc(doc(db, 'academicEvents', id), {
      id,
      title: title.trim(),
      date,
      time,
      location: location.trim() || 'Campus / Online',
      type,
      createdAt: Date.now()
    });

    setTitle('');
    setDate('');
    setTime('09:00');
    setLocation('');
    setType('lecture');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this academic event?')) {
      await deleteDoc(doc(db, 'academicEvents', id));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in">
      <div className="welcome-banner">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Academic Calendar & Timetable</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Set academic events and schedule items that students will see in their timetable and calendar.</p>
      </div>

      <div className="app-card p-5">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <CalendarDays className="w-4 h-4 text-indigo-600" /> Add Schedule Item
        </h2>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-2">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Title</label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="French Speaking Lab" className="form-input" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Date</label>
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="form-input" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)} className="form-input">
              <option value="lecture">Lecture</option>
              <option value="deadline">Deadline</option>
              <option value="exam">Exam</option>
              <option value="holiday">Holiday</option>
              <option value="event">Event</option>
            </select>
          </div>

          <div className="md:col-span-2 xl:col-span-3">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Location / Link</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Room A1 / https://meet.google.com/..." className="form-input" />
          </div>

          <div className="md:col-span-2 xl:col-span-2 flex items-end">
            <button type="submit" className="btn-primary flex items-center justify-center py-2.5 w-full">
              <Plus className="w-4 h-4 mr-2" /> Add Event
            </button>
          </div>
        </form>
      </div>

      <div className="app-card p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Title</th>
                <th className="text-left">Date</th>
                <th className="text-left">Time</th>
                <th className="text-left">Type</th>
                <th className="text-left">Location</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No academic schedule items yet.</td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{event.title}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{event.date}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-2"><Clock3 className="w-3.5 h-3.5 text-indigo-500" /> {event.time || '09:00'}</div>
                    </td>
                    <td>
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700">{event.type}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-amber-500" /> {event.location || 'Campus / Online'}</div>
                    </td>
                    <td className="text-right">
                      <button onClick={() => handleDelete(event.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete item">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
