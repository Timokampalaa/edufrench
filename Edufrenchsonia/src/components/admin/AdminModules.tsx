import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc } from '../../lib/db';
import { Plus, Trash2 } from 'lucide-react';
import { Module } from '../../types';

export default function AdminModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'modules'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setModules(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Module)));
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = crypto.randomUUID();
    const newMod = { name, code, description: desc, createdAt: Date.now() };
    await setDoc(doc(db, 'modules', id), newMod);
    setModules(prev => [...prev, { id, ...newMod } as Module]);
    setName(''); setCode(''); setDesc('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this module?')) {
      await deleteDoc(doc(db, 'modules', id));
      setModules(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in">
      <div className="welcome-banner">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Modules Management</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Manage courses and modules.</p>
      </div>

      <div className="app-card p-5">
        <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Add New Module</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input required placeholder="Module Code (e.g. CS101)" value={code} onChange={e=>setCode(e.target.value)} className="form-input" />
          <input required placeholder="Module Name" value={name} onChange={e=>setName(e.target.value)} className="form-input" />
          <input required placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} className="form-input" />
          <button type="submit" className="md:col-span-3 btn-primary flex justify-center items-center py-2.5">
            <Plus className="w-4 h-4 mr-2" /> Add Module
          </button>
        </form>
      </div>

      <div className="app-card p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Code</th>
                <th className="text-left">Name</th>
                <th className="text-left">Description</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {modules.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No modules found.</td></tr>
              ) : modules.map(mod => (
                <tr key={mod.id}>
                  <td>
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{mod.code}</span>
                  </td>
                  <td>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{mod.name}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{mod.description}</td>
                  <td className="text-right">
                    <button onClick={() => handleDelete(mod.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" style={{ border: '1px solid transparent' }}><Trash2 className="w-4 h-4"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
