import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, query, doc, getDoc, mutationEmitter } from '../lib/db';
import { format, startOfWeek, endOfWeek, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth } from 'date-fns';
import { Video, Calendar, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Module } from '../types';

export default function Timetable({ studentId }: { studentId?: string }) {
  const [lectures, setLectures] = useState<{ mod: Module, lec: any }[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;
    let lastHash = '';

    const fetchSchedule = async () => {
      if (isFetching) return;
      isFetching = true;
      try {
        const q = query(collection(db, 'modules'));
        const snap = await getDocs(q);
        if (!isMounted) return;
        const mods = snap.docs.map(d => ({ id: d.id, ...d.data() } as Module));

        const enrolledMods: Module[] = [];
        if (studentId) {
          for (const m of mods) {
           const docRef = doc(db, `modules/${m.id}/enrollments`, studentId);
           const docSnap = await getDoc(docRef);
           if (docSnap.exists()) {
             enrolledMods.push(m);
           }
          }
        }

        const allLecs: { mod: Module, lec: any }[] = [];
        for (const m of studentId ? enrolledMods : mods) {
          const lecsSnap = await getDocs(collection(db, `modules/${m.id}/lectures`));
          lecsSnap.docs.forEach(d => {
           allLecs.push({ mod: m, lec: { id: d.id, ...d.data() } });
          });
        }

        const eventsSnap = await getDocs(query(collection(db, 'academicEvents')));
        const adminEvents = eventsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (!isMounted) return;

        const newHash = JSON.stringify({ lectures: allLecs, events: adminEvents });
        if (newHash !== lastHash) {
          setLectures(allLecs);
          setCalendarEvents(adminEvents);
          lastHash = newHash;
        }
      } catch (err) {
        console.error(err);
      } finally {
        isFetching = false;
        if (isMounted) setLoading(false);
      }
    };

    fetchSchedule();

    const interval = setInterval(fetchSchedule, 3000);
    const unsub = mutationEmitter.subscribe(fetchSchedule);

    return () => {
      isMounted = false;
      clearInterval(interval);
      unsub();
    };
  }, [studentId]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const mergedSchedule = [
    ...lectures,
    ...calendarEvents.map((event) => ({
      mod: { id: 'calendar', code: 'CAL', name: 'Academic Calendar' } as Module,
      lec: {
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time || '09:00',
        meetLink: event.location || '#',
        type: event.type,
        isEvent: true
      },
      kind: 'event'
    }))
  ];

  const selectedDayLectures = mergedSchedule
    .filter((item) => isSameDay(new Date(item.lec.date), selectedDate))
    .sort((a, b) => a.lec.time.localeCompare(b.lec.time));

  return (
    <div className="max-w-4xl mx-auto space-y-6 flex flex-col h-full print:bg-white print:text-black animate-in">
      <div className="welcome-banner flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
           <Calendar className="w-6 h-6 text-indigo-500" />
           Class Timetable
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Calendar view of all scheduled classes and academic events.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex app-card min-h-[400px] justify-center items-center">
          <p style={{ color: 'var(--text-muted)' }}>Loading timetable...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="app-card overflow-hidden">
           <div className="flex items-center justify-between p-4 border-b bg-[var(--app-bg)]" style={{ borderColor: 'var(--border)' }}>
             <button onClick={handlePrevMonth} className="p-2 rounded-xl transition-all hover:bg-neutral-100" style={{ color: 'var(--text-muted)' }}>
               <ChevronLeft className="w-5 h-5" />
             </button>
             <div className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
               {format(currentDate, 'MMMM yyyy')}
             </div>
             <button onClick={handleNextMonth} className="p-2 rounded-xl transition-all hover:bg-neutral-100" style={{ color: 'var(--text-muted)' }}>
               <ChevronRight className="w-5 h-5" />
             </button>
           </div>

           <div className="p-4 surface-primary">
             <div className="grid grid-cols-7 gap-1 mb-2">
               {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                 <div key={day} className="text-center text-xs font-bold py-2" style={{ color: 'var(--text-muted)' }}>
                   {day}
                 </div>
               ))}
             </div>

             <div className="grid grid-cols-7 gap-1">
               {calendarDays.map((day, idx) => {
                 const dayHasClasses = mergedSchedule.some(item => isSameDay(new Date(item.lec.date), day));
                 const isCurrentMonth = isSameMonth(day, currentDate);
                 const isToday = isSameDay(day, new Date());
                 const isSelected = isSameDay(day, selectedDate);

                 return (
                   <button
                     key={idx}
                     onClick={() => setSelectedDate(day)}
                     className={`
                       flex flex-col items-center justify-center p-2 rounded-xl transition-all aspect-square relative text-sm
                       ${!isCurrentMonth ? 'text-neutral-300' : 'text-neutral-700 font-medium'}
                       ${isSelected ? 'bg-indigo-600 font-bold text-white shadow-md' : 'hover:bg-neutral-100'}
                       ${isToday && !isSelected ? 'border border-indigo-500/50 text-indigo-500' : ''}
                     `}
                   >
                     <span>{format(day, 'd')}</span>
                     {dayHasClasses && (
                       <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${isSelected ? 'bg-white' : 'bg-indigo-500'}`} />
                     )}
                   </button>
                 );
               })}
             </div>
           </div>
          </div>

          <div className="app-card flex flex-col h-[400px]">
            <div className="p-4 border-b bg-[var(--app-bg)] flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
                <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                  Schedule for {format(selectedDate, 'MMM do')}
                </h3>
                {isSameDay(selectedDate, new Date()) && (
                  <span className="badge-purple font-bold">Today</span>
                )}
             </div>
             <div className="p-4 space-y-3 overflow-y-auto flex-1 surface-primary">
                {selectedDayLectures.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                     No classes scheduled
                  </div>
                ) : (
                  selectedDayLectures.map((item, i) => {
                    const lecDateTime = new Date(`${item.lec.date}T${item.lec.time}`);
                    const isPast = lecDateTime.getTime() < Date.now();
                    const isEvent = Boolean(item.kind === 'event' || item.lec.isEvent);

                    return (
                      <div key={i} className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${isPast ? 'bg-neutral-50 border-neutral-100 opacity-60' : 'bg-neutral-50/50 hover:bg-neutral-50'} `} style={{ borderColor: 'var(--border)' }}>
                        <div className="flex justify-between items-start">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${isEvent ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>{item.lec.time}</span>
                          <span className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><BookOpen className="w-3.5 h-3.5"/>{item.mod.code}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{item.lec.title}</p>
                          {isEvent && (
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 mt-1">{item.lec.type || 'Event'}</p>
                          )}
                        </div>
                        {studentId && !isPast && !isEvent && (
                          <a href={item.lec.meetLink} target="_blank" rel="noreferrer" className="mt-2 w-full btn-primary py-1.5 text-xs flex justify-center items-center gap-1.5">
                            <Video className="w-3.5 h-3.5" /> Join Focus
                          </a>
                        )}
                      </div>
                    );
                  })
                )}
             </div>
          </div>

        </div>
      )}
    </div>
  );
}
