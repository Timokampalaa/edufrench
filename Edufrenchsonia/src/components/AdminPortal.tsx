import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { db } from '../lib/db';
import { collection, query, getDocs, onSnapshot } from '../lib/db';
import { 
  LayoutDashboard, BookOpen, Video, FileText, 
  FileDown, LogOut, Menu, X, Bell, Users, Activity, Calendar
} from 'lucide-react';
import clsx from 'clsx';
import ThemeToggle from './ThemeToggle';
import InstallButton from './InstallButton';

import AdminModules from './admin/AdminModules';
import AdminStudents from './admin/AdminStudents';
import AdminLectures from './admin/AdminLectures';
import AdminAssignments from './admin/AdminAssignments';
import AdminMaterials from './admin/AdminMaterials';
import AdminActivityLogs from './admin/AdminActivityLogs';
import AdminAcademicCalendar from './admin/AdminAcademicCalendar';

export default function AdminPortal({ setRole }: { setRole: (role: string | null) => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setRole(null);
    sessionStorage.removeItem('edufrench_role');
    localStorage.removeItem('edufrench_role');
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Modules', href: '/admin/modules', icon: BookOpen },
    { name: 'Lectures', href: '/admin/lectures', icon: Video },
    { name: 'Academic Calendar', href: '/admin/calendar', icon: Calendar },
    { name: 'Assignments', href: '/admin/assignments', icon: FileText },
    { name: 'Materials', href: '/admin/materials', icon: FileDown },
    { name: 'Activity Logs', href: '/admin/logs', icon: Activity },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--app-bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
          <span style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">Loading Admin Portal...</span>
        </div>
      </div>
    );
  }

  const initials = 'AD';

  return (
    <div className="min-h-screen flex print:block" style={{ background: 'var(--app-bg)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden print:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-60 app-sidebar flex flex-col p-4">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="EduFrench by Sonia" className="h-9 w-9 object-contain rounded-full border-2 border-white/30" />
                <div>
                  <div className="text-white font-extrabold text-sm leading-none">
                    <span>Edu</span><span style={{ color: '#FFC85C' }}>French</span>
                  </div>
                  <div className="text-white/60 text-[9px] italic">by Sonia</div>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-white hover:text-amber-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {navigation.map((item) => {
                const current = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={clsx('nav-item', current && 'active')}
                  >
                    <item.icon className="flex-shrink-0 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-white/10">
              <button onClick={handleLogout} className="nav-item w-full hover:bg-white/10">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 app-sidebar print:hidden" style={{ zIndex: 30 }}>
        {/* Logo at top */}
        <div className="flex flex-col items-center pt-6 pb-3 px-4 text-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <img src="/logo.png" alt="EduFrench by Sonia" className="h-20 w-20 object-contain mb-2 drop-shadow-lg" />
          <div className="font-extrabold text-lg leading-none text-white tracking-tight">
            <span>Edu</span><span style={{ color: '#FFC85C' }}>French</span>
          </div>
          <div className="text-white/60 text-xs italic font-semibold tracking-wider">by Sonia</div>
          <div className="mt-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/20 text-white/50">Admin Portal</div>
        </div>
        {/* Admin Avatar */}
        <div className="flex flex-col items-center pt-4 pb-2 px-4 text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-[4px] border-[#FFC85C] shadow-lg bg-white/20 flex items-center justify-center text-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}>
              {initials}
            </div>
          </div>
          <h3 className="text-white font-bold text-base mt-3">
            Admin Portal 👋
          </h3>
          <p className="text-xs text-white/60 mt-1">System Administrator</p>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-4">
          {navigation.map((item) => {
            const current = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx('nav-item', current && 'active')}
              >
                <item.icon className="flex-shrink-0 h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <button onClick={handleLogout} className="nav-item w-full my-0 py-2 hover:bg-white/10">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-60 flex flex-col min-h-screen print:pl-0">
        <header className="sticky top-0 z-20 h-16 px-4 sm:px-6 print:hidden app-header w-full border-b border-[var(--border)] bg-[var(--app-bg)]/80 backdrop-blur-md lg:border-none lg:bg-transparent lg:backdrop-blur-none">
          <div className="content-wrapper h-full flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-2" style={{ color: 'var(--text-secondary)' }}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-sm font-semibold hidden md:block" style={{ color: 'var(--text-secondary)' }}>
              Welcome back to EduFrench <span className="font-bold" style={{ color: 'var(--accent)' }}>by Sonia</span> Admin Control Panel.
            </div>
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              <InstallButton />
              <ThemeToggle />
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-blue-100 border border-blue-200 overflow-hidden shadow-sm">
                <div className="w-full h-full flex items-center justify-center text-xs sm:text-sm font-bold text-blue-700">
                  {initials}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-5 md:p-6 w-full max-w-full overflow-x-hidden">
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/students" element={<AdminStudents />} />
              <Route path="/modules" element={<AdminModules />} />
              <Route path="/lectures" element={<AdminLectures />} />
              <Route path="/calendar" element={<AdminAcademicCalendar />} />
              <Route path="/assignments" element={<AdminAssignments />} />
              <Route path="/materials" element={<AdminMaterials />} />
              <Route path="/logs" element={<AdminActivityLogs />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    modules: 0,
    lectures: 0,
    assignments: 0
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const studentsSnap = await getDocs(query(collection(db, 'students')));
        const modulesSnap = await getDocs(query(collection(db, 'modules')));
        
        let lecturesCount = 0;
        let assignmentsCount = 0;
        
        // Count sub-collections
        for (const mDoc of modulesSnap.docs) {
          const lSnap = await getDocs(query(collection(db, `modules/${mDoc.id}/lectures`)));
          const aSnap = await getDocs(query(collection(db, `modules/${mDoc.id}/assignments`)));
          lecturesCount += lSnap.size;
          assignmentsCount += aSnap.size;
        }

        setStats({
          students: studentsSnap.size,
          modules: modulesSnap.size,
          lectures: lecturesCount,
          assignments: assignmentsCount
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };

    const unsubscribeLogs = onSnapshot(
      query(collection(db, 'activityLogs')),
      (snapshot) => {
        const data: any[] = [];
        snapshot.docs.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setRecentLogs(data.slice(0, 5));
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching logs:', err);
        setLoading(false);
      }
    );

    fetchStats();
    return () => unsubscribeLogs();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6 animate-in">
      <div className="welcome-banner flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-4xl">🔑</div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              EduFrench Administration Dashboard
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-blue-100 font-medium">
              Monitor systems, manage student profiles, configure learning modules, assignments, and lectures.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="stat-card-custom">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4 bg-blue-100">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Total Students</p>
          <h3 className="text-xl sm:text-2xl font-bold mt-1" style={{ color: 'var(--text-heading)' }}>{stats.students}</h3>
        </div>

        <div className="stat-card-custom">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4 bg-green-100">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          </div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Modules</p>
          <h3 className="text-xl sm:text-2xl font-bold mt-1" style={{ color: 'var(--text-heading)' }}>{stats.modules}</h3>
        </div>

        <div className="stat-card-custom">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4 bg-amber-100">
            <Video className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
          </div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Lectures</p>
          <h3 className="text-xl sm:text-2xl font-bold mt-1" style={{ color: 'var(--text-heading)' }}>{stats.lectures}</h3>
        </div>

        <div className="stat-card-custom">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4 bg-rose-100">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
          </div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Assignments</p>
          <h3 className="text-xl sm:text-2xl font-bold mt-1" style={{ color: 'var(--text-heading)' }}>{stats.assignments}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="app-card p-5">
          <h2 className="font-bold text-base mb-4" style={{ color: 'var(--text-heading)' }}>Recent Activity Logs</h2>
          {loading ? (
            <div className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>Loading activities...</div>
          ) : recentLogs.length === 0 ? (
            <div className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No activities logged yet.</div>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {recentLogs.map((log, logIdx) => (
                  <li key={log.id}>
                    <div className="relative pb-8">
                      {logIdx !== recentLogs.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white ring-8 ring-white dark:ring-slate-900">
                            <Activity className="w-4 h-4" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              {log.description}{' '}
                              <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                                ({log.actionType})
                              </span>
                            </p>
                          </div>
                          <div className="text-right text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                            {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
