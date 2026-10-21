import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc } from '../../lib/db';
import { Plus, Trash2, UserPlus, Mail, ShieldCheck } from 'lucide-react';
import { Student } from '../../types';

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [fullName, setFullName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [course, setCourse] = useState('French Communication');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    const q = query(collection(db, 'students'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as Student));
      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setStudents(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = fullName.trim();
    const trimmedReg = regNumber.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedReg || !trimmedEmail || !password.trim()) {
      alert('Please complete all student details, including the password.');
      return;
    }

    const id = crypto.randomUUID();
    const newStudent: Student = {
      id,
      fullName: trimmedName,
      regNumber: trimmedReg,
      email: trimmedEmail,
      password: password.trim(),
      course,
      status,
      createdAt: Date.now()
    };

    await setDoc(doc(db, 'students', id), newStudent);
    setFullName('');
    setRegNumber('');
    setEmail('');
    setPassword('');
    setCourse('French Communication');
    setStatus('active');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this student record?')) {
      await deleteDoc(doc(db, 'students', id));
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in">
      <div className="welcome-banner">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Student Management</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Create student accounts and manage their registration details.</p>
      </div>

      <div className="app-card p-5">
        <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <UserPlus className="w-4 h-4 text-indigo-600" /> Add New Student
        </h2>

        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-1">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Full Name</label>
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" className="form-input" />
          </div>

          <div className="xl:col-span-1">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Registration Number</label>
            <input required value={regNumber} onChange={(e) => setRegNumber(e.target.value)} placeholder="REG-STU-XXXX" className="form-input" />
          </div>

          <div className="xl:col-span-1">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Course</label>
            <input required value={course} onChange={(e) => setCourse(e.target.value)} placeholder="French Communication" className="form-input" />
          </div>

          <div className="xl:col-span-1">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" className="form-input" />
          </div>

          <div className="xl:col-span-1">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create password" className="form-input" />
          </div>

          <div className="xl:col-span-1">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')} className="form-input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="md:col-span-2 xl:col-span-3">
            <button type="submit" className="btn-primary flex items-center justify-center py-2.5 w-full md:w-auto px-5">
              <Plus className="w-4 h-4 mr-2" /> Add Student
            </button>
          </div>
        </form>
      </div>

      <div className="app-card p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Name</th>
                <th className="text-left">Registration</th>
                <th className="text-left">Email</th>
                <th className="text-left">Course</th>
                <th className="text-left">Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No students found yet.</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{student.fullName}</div>
                    </td>
                    <td>
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{student.regNumber}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-indigo-500" /> {student.email}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{student.course}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${student.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button onClick={() => handleDelete(student.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete student">
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
