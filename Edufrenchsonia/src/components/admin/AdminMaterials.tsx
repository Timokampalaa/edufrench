import React, { useState, useEffect } from 'react';
import { db, collection, query, onSnapshot, doc, setDoc, deleteDoc, storage, ref, uploadBytes, getDownloadURL } from '../../lib/db';
import { Plus, Trash2, FileDown, Loader2 } from 'lucide-react';
import { Module } from '../../types';

export default function AdminMaterials() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [materials, setMaterials] = useState<any[]>([]);

  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'modules'));
    return onSnapshot(q, snap => setModules(snap.docs.map(d => ({ id: d.id, ...d.data() } as Module))));
  }, []);

  useEffect(() => {
    if (!selectedModule) return;
    const q = query(collection(db, `modules/${selectedModule}/learningMaterials`));
    return onSnapshot(q, snap => setMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [selectedModule]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedModule || !file) return;
    
    const form = e.currentTarget;
    setUploading(true);
    try {
      const id = crypto.randomUUID();
      const fileRef = ref(storage, `materials/${id}_${file.name}`);
      await uploadBytes(fileRef, file);
      const fileUrl = await getDownloadURL(fileRef);

      const newMat = { title, fileUrl, createdAt: Date.now() };
      await setDoc(doc(db, `modules/${selectedModule}/learningMaterials`, id), newMat);
      setMaterials(prev => [...prev, { id, ...newMat }]);
      setTitle(''); setFile(null);
      form.reset();
    } catch(err: any) {
      console.error("Upload material failed", err);
      alert(err.message || "Failed to upload material.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this material?')) {
      await deleteDoc(doc(db, `modules/${selectedModule}/learningMaterials`, id));
      setMaterials(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in">
      <div className="welcome-banner">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Learning Materials</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Upload notes, slides, and files.</p>
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
            <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Add Material</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Title / Description</label>
                <input required placeholder="Title / Description" value={title} onChange={e=>setTitle(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>File Attachment</label>
                <input required type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="form-input" />
              </div>
              <button type="submit" disabled={uploading || !file} className="md:col-span-2 btn-primary flex justify-center items-center py-2.5 mt-2">
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />} 
                {uploading ? 'Uploading...' : 'Upload Material'}
              </button>
            </form>
          </div>

          <div className="app-card p-5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full data-table">
                <thead>
                  <tr>
                    <th className="text-left">Title</th>
                    <th className="text-left">Link</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map(mat => (
                    <tr key={mat.id}>
                      <td>
                        <div className="flex items-center font-semibold" style={{ color: 'var(--text-primary)' }}>
                          <FileDown className="w-4 h-4 mr-2 text-indigo-500"/>
                          {mat.title}
                        </div>
                      </td>
                      <td>
                        <a href={mat.fileUrl} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline">Download / View</a>
                      </td>
                      <td className="text-right">
                        <button onClick={() => handleDelete(mat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" style={{ border: '1px solid transparent' }}><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  ))}
                  {materials.length === 0 && (
                    <tr><td colSpan={3} className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No materials uploaded.</td></tr>
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
