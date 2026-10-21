import React, { useState } from 'react';
import { db, storage } from '../../lib/db';
import { doc, updateDoc } from '../../lib/db';
import { ref, uploadBytes, getDownloadURL } from '../../lib/db';
import { Loader2, Camera, Mail, Lock, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { Student } from '../../types';

export default function StudentSettings({ student, studentId }: { student: Student | null, studentId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(student?.photoUrl || '');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
      setPhotoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      setError('Cannot edit student profile. Invalid student ID.');
      return;
    }

    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updates: any = {};
      
      if (email && email !== student?.email) {
        updates.email = email;
      }
      if (password) {
        updates.password = password;
      }
      if (photo) {
        const photoRef = ref(storage, `students/${studentId}/photo`);
        await uploadBytes(photoRef, photo);
        updates.photoUrl = await getDownloadURL(photoRef);
      }

      if (Object.keys(updates).length > 0) {
        const docRef = doc(db, 'students', studentId);
        await updateDoc(docRef, updates);
        setSuccess('Profile updated successfully! Refreshing...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setSuccess('No changes to save.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!student) {
    return <div className="p-8 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading student details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      <div className="welcome-banner">
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-heading)' }}>Account Settings</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Manage your personal information and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="app-card p-6 flex flex-col items-center text-center surface-primary">
            <div className="relative group cursor-pointer mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-50 shadow-inner flex items-center justify-center bg-neutral-100">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-indigo-500 font-bold">{student.fullName.charAt(0)}</span>
                )}
              </div>
              <label className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="w-8 h-8 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </label>
            </div>
            <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--text-heading)' }}>Profile Picture</h3>
            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{student.fullName}</h3>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{student.regNumber}</p>
            <div className="mt-6 w-full flex flex-col space-y-3 text-xs text-left">
              <div className="flex justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Course</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{student.course}</span>
              </div>
              <div className="flex justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span className="font-bold text-emerald-600 capitalize">{student.status}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span style={{ color: 'var(--text-muted)' }}>Joined</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{new Date(student.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="app-card overflow-hidden surface-primary">
            <div className="p-6 space-y-6">
              {error && (
                <div className="p-3 rounded-xl flex items-center text-xs font-semibold" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>
                  <AlertCircle className="w-4 h-4 mr-2" /> {error}
                </div>
              )}
              {success && (
                <div className="p-3 rounded-xl flex items-center text-xs font-semibold" style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' }}>
                  <CheckCircle className="w-4 h-4 mr-2" /> {success}
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}><Mail className="w-4 h-4 mr-2 text-indigo-500" /> Contact Information</h3>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={student.email}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-bold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}><Lock className="w-4 h-4 mr-2 text-indigo-500" /> Security Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Type a new password..."
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password..."
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 flex justify-end surface-secondary" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary py-2.5 px-6 text-xs font-bold"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
