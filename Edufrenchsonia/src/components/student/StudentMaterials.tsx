import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { collection, query, getDocs, doc, getDoc, mutationEmitter } from '../../lib/db';
import { FileDown, BookOpen } from 'lucide-react';
import { Module } from '../../types';
import { logActivity } from '../../lib/activity-logger';

export default function StudentMaterials({ studentId }: { studentId: string }) {
  const [materials, setMaterials] = useState<{mod: Module, mat: any}[]>([]);

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;
    let lastHash = '';
    
    const fetchMaterials = async () => {
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

        const allMats: {mod: Module, mat: any}[] = [];
        for (const m of enrolledMods) {
          const matSnap = await getDocs(collection(db, `modules/${m.id}/learningMaterials`));
          matSnap.docs.forEach(d => {
            allMats.push({ mod: m, mat: { id: d.id, ...d.data() } });
          });
        }
        
        if (!isMounted) return;
        const newHash = JSON.stringify(allMats);
        if (newHash !== lastHash) {
          setMaterials(allMats);
          lastHash = newHash;
        }
      } catch (err) {
        console.error(err);
      } finally {
        isFetching = false;
      }
    };
    
    fetchMaterials();
    const interval = setInterval(fetchMaterials, 3000);
    const unsub = mutationEmitter.subscribe(fetchMaterials);

    return () => {
      isMounted = false;
      clearInterval(interval);
      unsub();
    };
  }, [studentId]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in">
      <div className="welcome-banner">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Learning Materials</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Download course materials and notes.</p>
      </div>

      <div className="app-card overflow-hidden">
        <ul className="divide-y" style={{ divideColor: 'var(--border)' }}>
          {materials.map((item, idx) => (
            <li key={idx} className="p-4 hover:bg-[var(--app-bg)] transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-center">
                  <FileDown className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.mat.title}</h3>
                  <div className="flex items-center text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    <span className="font-bold px-2 py-0.5 rounded-full mr-2" style={{ background: '#ede9fe', color: '#6c63ff' }}>{item.mod.code}</span>
                    <span>{item.mod.name}</span>
                  </div>
                </div>
              </div>
              <div>
                <a 
                  href={item.mat.fileUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  onClick={() => logActivity('Material Downloaded', `Downloaded ${item.mat.title} for ${item.mod.code}`, studentId, 'student')}
                  className="btn-secondary py-2 px-4 text-xs font-semibold flex items-center gap-1.5"
                >
                  <FileDown className="w-4 h-4 text-indigo-600" /> Download
                </a>
              </div>
            </li>
          ))}
          {materials.length === 0 && (
            <li className="p-8 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              No learning materials have been uploaded yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
