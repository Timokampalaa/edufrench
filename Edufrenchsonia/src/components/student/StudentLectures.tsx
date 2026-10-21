import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { collection, query, getDocs, doc, getDoc, mutationEmitter } from '../../lib/db';
import { Video, Calendar as CalendarIcon } from 'lucide-react';
import { Module } from '../../types';

export default function StudentLectures({ studentId }: { studentId: string }) {
  const [modules, setModules] = useState<Module[]>([]);
  const [lectures, setLectures] = useState<{mod: Module, lec: any}[]>([]);

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;
    let lastHash = '';
    
    const fetchLectures = async () => {
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
        
        setModules(enrolledMods);

        const allLecs: {mod: Module, lec: any}[] = [];
        const today = new Date();
        today.setHours(0,0,0,0);
        
        for (const m of enrolledMods) {
          const lecsSnap = await getDocs(collection(db, `modules/${m.id}/lectures`));
          lecsSnap.docs.forEach(d => {
            const data = d.data();
            if (data.date) {
               const parts = data.date.split('-');
               if (parts.length === 3) {
                  const lecDay = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                  if (lecDay.getTime() < today.getTime()) {
                    return;
                  }
               }
            }
            allLecs.push({ mod: m, lec: { id: d.id, ...data } });
          });
        }
        
        if (!isMounted) return;
        
        const newHash = JSON.stringify(allLecs);
        if (newHash !== lastHash) {
          setLectures(allLecs);
          lastHash = newHash;
        }
      } catch (err) {
        console.error(err);
      } finally {
        isFetching = false;
      }
    };
    
    fetchLectures();
    const interval = setInterval(fetchLectures, 3000);
    const unsub = mutationEmitter.subscribe(fetchLectures);

    return () => {
      isMounted = false;
      clearInterval(interval);
      unsub();
    };
  }, [studentId]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in">
      <div className="welcome-banner">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Upcoming Lectures</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Access your scheduled video classes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lectures.map((item, idx) => (
          <div key={idx} className="app-card p-6 flex flex-col justify-between min-h-[180px]">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-50 border border-indigo-100">
                  <Video className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="badge-purple font-semibold">
                  {item.mod.code}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{item.lec.title}</h3>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                <CalendarIcon className="w-4 h-4 mr-2" style={{ color: 'var(--text-muted)' }} />
                Scheduled for: <strong className="ml-1" style={{ color: 'var(--text-primary)' }}>{item.lec.date}</strong> at <strong className="ml-1" style={{ color: 'var(--text-primary)' }}>{item.lec.time}</strong>
              </div>
              {(() => {
                const lecDate = new Date(`${item.lec.date}T${item.lec.time}`).getTime();
                const now = Date.now();
                if (lecDate > now) {
                   return (
                     <button disabled className="w-full flex justify-center items-center px-4 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 text-neutral-400 border border-neutral-200 opacity-80 cursor-not-allowed">
                       Starts later
                     </button>
                   );
                }
                return (
                  <a href={item.lec.meetLink} target="_blank" rel="noreferrer" className="w-full btn-primary py-2.5 text-xs font-bold flex justify-center items-center">
                    Join Video Class
                  </a>
                );
              })()}
            </div>
          </div>
        ))}
        {lectures.length === 0 && (
          <div className="col-span-full app-card p-8 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            No lectures scheduled across your modules.
          </div>
        )}
      </div>
    </div>
  );
}
