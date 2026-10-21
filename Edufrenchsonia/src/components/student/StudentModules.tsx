import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, getDoc } from '../../lib/db';
import { BookOpen, Check, Save, Loader2, Lock } from 'lucide-react';
import clsx from 'clsx';
import { Module } from '../../types';

export default function StudentModules({ studentId }: { studentId: string }) {
  const [modules, setModules] = useState<Module[]>([]);
  const [initialEnrolled, setInitialEnrolled] = useState<Set<string>>(new Set());
  const [selectedModuleIds, setSelectedModuleIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'modules'));
    const unsub = onSnapshot(q, async snap => {
      const mods = snap.docs.map(d => ({ id: d.id, ...d.data() } as Module)).sort((a,b) => a.createdAt - b.createdAt);
      setModules(mods);
      
      if (studentId) {
        const enrolled = new Set<string>();
        for (const m of mods) {
          const docRef = doc(db, `modules/${m.id}/enrollments`, studentId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            enrolled.add(m.id);
          }
        }
        setInitialEnrolled(enrolled);
        setSelectedModuleIds(enrolled);
      }
      setLoading(false);
    });
    return unsub;
  }, [studentId]);

  const toggleSelection = (moduleId: string) => {
    if (initialEnrolled.has(moduleId)) return;
    setSelectedModuleIds(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const saveChanges = async () => {
    if (!studentId) return;
    setSaving(true);
    try {
      for (const m of modules) {
        const wasEnrolled = initialEnrolled.has(m.id);
        const isSelected = selectedModuleIds.has(m.id);
        
        const docRef = doc(db, `modules/${m.id}/enrollments`, studentId);
        
        if (isSelected && !wasEnrolled) {
          await setDoc(docRef, {
            studentId: studentId,
            enrolledAt: Date.now()
          });
        } else if (!isSelected && wasEnrolled) {
          await deleteDoc(docRef);
        }
      }
      setInitialEnrolled(new Set(selectedModuleIds));
      alert("Module selections saved successfully!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = Array.from(selectedModuleIds).sort().join(',') !== Array.from(initialEnrolled).sort().join(',');

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 welcome-banner">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Select Modules</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Select the modules you are doing and save changes to see their updates.</p>
        </div>
        <button
          onClick={saveChanges}
          disabled={!hasChanges || saving}
          className={clsx(
            "flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm",
            !hasChanges ? "opacity-50 cursor-not-allowed bg-neutral-200 text-neutral-400 border border-neutral-300" : 
            saving ? "bg-indigo-400 text-white cursor-wait" :
            "bg-indigo-600 hover:bg-indigo-700 text-white"
          )}
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {loading ? (
        <div className="text-center p-12 text-neutral-400 flex flex-col items-center app-card">
           <Loader2 className="w-8 h-8 mx-auto animate-spin mb-4 text-indigo-500" />
           Loading modules...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map(mod => {
            const isSelected = selectedModuleIds.has(mod.id);
            const isLocked = initialEnrolled.has(mod.id);
            return (
              <div 
                key={mod.id} 
                className={clsx(
                  "app-card rounded-2xl transition-all overflow-hidden relative group p-6 flex flex-col justify-between min-h-[220px]",
                  isLocked ? "cursor-default opacity-85" : "cursor-pointer",
                  isSelected 
                    ? "border-indigo-500 shadow-[0_0_15px_rgba(108,99,255,0.08)] bg-indigo-50/20" 
                    : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/30"
                )}
                style={{ border: '1px solid var(--border)' }}
                onClick={() => toggleSelection(mod.id)}
              >
                <div>
                   <div className="flex justify-between items-start mb-5">
                      <div className={clsx(
                         "w-11 h-11 flex items-center justify-center rounded-xl",
                         isSelected ? "bg-indigo-600 text-white" : "bg-neutral-100 border text-neutral-500"
                      )} style={{ borderColor: 'var(--border)' }}>
                         <BookOpen className="w-5 h-5" />
                      </div>
                      <div className={clsx(
                         "w-7 h-7 flex items-center justify-center rounded-lg border text-xs",
                         isLocked ? "bg-indigo-50 border-indigo-100 text-indigo-600 font-bold" : 
                            isSelected ? "bg-indigo-600 border-indigo-600 text-white shadow-sm font-bold" : "border-neutral-300 bg-white"
                      )}>
                         {isLocked ? <Lock className="w-3.5 h-3.5" /> : isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                   </div>
                   <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{mod.name}</h3>
                   <span className="text-[11px] font-bold uppercase tracking-wider mb-3 block" style={{ color: 'var(--text-muted)' }}>{mod.code}</span>
                   <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>{mod.description}</p>
                </div>
              </div>
            );
          })}
          {modules.length === 0 && (
            <div className="col-span-full app-card p-8 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              No modules available.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
