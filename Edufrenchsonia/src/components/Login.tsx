import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { collection, query, where, getDocs } from '../lib/db';
import { db } from '../lib/db';
import ThemeToggle from './ThemeToggle';
import InstallButton from './InstallButton';
import { logActivity } from '../lib/activity-logger';
import BrandLogo from './BrandLogo';

export default function Login({ setRole }: { setRole: (role: string | null) => void }) {
  const [regNumber, setRegNumber] = useState(localStorage.getItem('edufrench_saved_reg') || '');
  const [password, setPassword] = useState(localStorage.getItem('edufrench_saved_pass') || '');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(localStorage.getItem('edufrench_saved_reg') !== null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const useDemoLogin = (demoRegNumber: string, demoPassword: string) => {
    setRegNumber(demoRegNumber);
    setPassword(demoPassword);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rememberMe) {
      localStorage.setItem('edufrench_saved_reg', regNumber);
      localStorage.setItem('edufrench_saved_pass', password);
    } else {
      localStorage.removeItem('edufrench_saved_reg');
      localStorage.removeItem('edufrench_saved_pass');
    }

    if (regNumber === 'REG-ADMIN-2026') {
      if (password === 'Admin123') {
        sessionStorage.setItem('edufrench_role', 'admin');
        setRole('admin');
        logActivity('Login', 'Admin logged into the system', 'admin', 'admin');
        return;
      } else {
        setError('Invalid admin credentials.');
        return;
      }
    }

    setLoading(true);
    try {
      const q = query(collection(db, 'students'), where('regNumber', '==', regNumber));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        setError('Student not found. Please check your registration number.');
        setLoading(false);
        return;
      } else {
        const docSnap = snap.docs[0];
        const studentData = docSnap.data();
        
        if (!studentData.password || studentData.password !== password) {
          setError('Invalid login credentials.');
          setLoading(false);
          return;
        }

        sessionStorage.setItem('edufrench_student_reg', regNumber);
        sessionStorage.setItem('edufrench_student_id', docSnap.id);
        sessionStorage.setItem('edufrench_role', 'student');
        if (rememberMe) {
          localStorage.setItem('edufrench_student_reg', regNumber);
          localStorage.setItem('edufrench_student_id', docSnap.id);
          localStorage.setItem('edufrench_role', 'student');
        }
        logActivity('Login', `Student ${studentData.fullName} logged in.`, regNumber, 'student');
        setRole('student');
      }
    } catch (err: any) {
      console.error(err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--app-bg)' }}>
      {/* Left panel – brand */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] flex-shrink-0 p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #A195F2 0%, #7D6DF2 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />

        <div className="relative z-10">
          <div className="flex flex-col items-center gap-0 mb-10">
            <BrandLogo size="xl" variant="dark" showTagline={true} />
          </div>
          
          <h1 className="text-3xl font-bold text-white leading-tight mb-4">
            Learn French,<br />Unlock the World.
          </h1>
          <p className="text-white/80 text-base leading-relaxed">
            Access your courses, lectures, and assignments all in one place. Your journey to fluency starts here.
          </p>
        </div>

        <div className="relative z-10">
          <div className="p-5 rounded-2xl border border-white/20" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}>
            <p className="text-white text-sm font-semibold mb-1">📚 E-Learning Management System</p>
            <p className="text-white/70 text-xs">Students & Administrators</p>
          </div>
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative w-full">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <InstallButton />
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md p-6 sm:p-10 app-card mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-6 sm:mb-8">
            <BrandLogo size="lg" variant="light" showTagline={true} />
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-heading)' }}>Welcome back!</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Sign in to your student or admin account.</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-2xl text-sm" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="regNumber" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-heading)' }}>
                Registration Number
              </label>
              <input
                id="regNumber"
                name="regNumber"
                type="text"
                required
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                className="form-input"
                placeholder="REG-XXXX-XXXX"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-heading)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded"
                style={{ accentColor: '#7D6DF2' }}
              />
              <label htmlFor="remember-me" className="ml-2 text-sm font-semibold" style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
              Demo accounts
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => useDemoLogin('REG-ADMIN-2026', 'Admin123')}
                className="w-full text-left p-3 rounded-xl border transition-colors hover:bg-black/5"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <span className="block text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>Administrator</span>
                <span className="block text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>REG-ADMIN-2026 &middot; Admin123</span>
              </button>
              <button
                type="button"
                onClick={() => useDemoLogin('REG-STU-1001', 'Student123')}
                className="w-full text-left p-3 rounded-xl border transition-colors hover:bg-black/5"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <span className="block text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>Student</span>
                <span className="block text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>REG-STU-1001 &middot; Student123</span>
              </button>
            </div>
          </div>

          <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
            Contact your administrator if you have trouble signing in.
          </p>
        </div>
      </div>
    </div>
  );
}
