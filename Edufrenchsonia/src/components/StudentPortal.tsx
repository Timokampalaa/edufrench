import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { db } from '../lib/db';
import { doc, getDoc, collection, query, getDocs } from '../lib/db';
import { 
  LayoutDashboard, BookOpen, Video, FileText, 
  Calendar, FileDown, LogOut, Menu, X, Bell, Settings, PieChart, ChevronLeft, ChevronRight, TrendingUp, Search
} from 'lucide-react';
import clsx from 'clsx';
import { Student, Module } from '../types';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isToday } from 'date-fns';
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import ThemeToggle from './ThemeToggle';
import InstallButton from './InstallButton';
import BrandLogo from './BrandLogo';

import StudentModules from './student/StudentModules';
import StudentLectures from './student/StudentLectures';
import StudentAssignments from './student/StudentAssignments';
import StudentMaterials from './student/StudentMaterials';
import StudentResults from './student/StudentResults';
import StudentSettings from './student/StudentSettings';
import Timetable from './Timetable';
import { Award } from 'lucide-react';

export default function StudentPortal({ setRole }: { setRole: (role: string | null) => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchStudent = async () => {
      const studentId = sessionStorage.getItem('edufrench_student_id') || localStorage.getItem('edufrench_student_id');
      
      if (studentId) {
        try {
          const docRef = doc(db, 'students', studentId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setStudent({ id: docSnap.id, ...docSnap.data() } as Student);
          } else {
            handleLogout();
            return;
          }
        } catch (e) {
          console.error(e);
          handleLogout();
          return;
        }
      } else {
        handleLogout();
        return;
      }
      setLoading(false);
    };
    
    fetchStudent();
  }, []);

  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem('edufrench_student_reg');
    localStorage.removeItem('edufrench_student_id');
    sessionStorage.removeItem('edufrench_student_reg');
    sessionStorage.removeItem('edufrench_student_id');
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { name: 'Modules', href: '/student/modules', icon: BookOpen },
    { name: 'Lectures', href: '/student/lectures', icon: Video },
    { name: 'Assignments', href: '/student/assignments', icon: FileText },
    { name: 'Results', href: '/student/results', icon: Award },
    { name: 'Timetable', href: '/student/timetable', icon: Calendar },
    { name: 'Materials', href: '/student/materials', icon: FileDown },
    { name: 'Settings', href: '/student/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--app-bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
          <span style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">Loading your portal...</span>
        </div>
      </div>
    );
  }

  const initials = student?.fullName?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'S';
  const firstName = student?.fullName?.split(' ')[0] || 'Student';

  return (
    <div className="min-h-screen flex print:block" style={{ background: 'var(--app-bg)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden print:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 flex flex-col shadow-2xl app-sidebar">
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
              <BrandLogo size="xs" variant="dark" showTagline={true} className="items-start text-left" />
              <button onClick={() => setSidebarOpen(false)} style={{ color: 'rgba(255,255,255,0.7)' }} className="hover:opacity-70 transition-opacity ml-auto">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Mobile Profile area */}
            <div className="flex flex-col items-center py-6 px-4 text-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-[3px] border-[#FFC85C] shadow-md bg-white/20">
                {student?.photoUrl ? (
                  <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold text-white" style={{ background: 'linear-gradient(135deg, #8E82F7, #6c63ff)' }}>
                    {initials}
                  </div>
                )}
              </div>
              <h3 className="text-white font-bold text-sm mt-2">Hi, {firstName}! 👋</h3>
            </div>

            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
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
            <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <button onClick={handleLogout} className="nav-item w-full">
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
        <div className="flex flex-col items-center pt-5 pb-4 px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <BrandLogo size="md" variant="dark" showTagline={true} />
        </div>
        {/* Profile / Avatar area */}
        <div className="flex flex-col items-center pt-5 pb-2 px-4 text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-[4px] border-[#FFC85C] shadow-lg bg-white/20">
              {student?.photoUrl ? (
                <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #8E82F7, #6c63ff)' }}>
                  {initials}
                </div>
              )}
            </div>
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-violet-400">3</span>
          </div>
          <h3 className="text-white font-bold text-base mt-3 flex items-center justify-center gap-1">
            Hi, {firstName}! 👋
          </h3>
        </div>

        {/* Navigation */}
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

        {/* Go Premium upgrade card */}
        <div className="premium-card mt-auto mx-4 mb-4 text-center">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12">
            <img src="/crown_premium.png" alt="Premium Crown" className="w-full h-full object-contain" />
          </div>
          <div className="pt-6">
            <h4 className="font-bold text-sm text-amber-950">Go Premium</h4>
            <p className="text-[10px] text-amber-900/80 mt-0.5 mb-3 leading-snug">Unlock ad-free learning and resources!</p>
            <button className="clay-btn-pink w-full py-1.5 text-xs">Upgrade</button>
          </div>
        </div>

        {/* Sign Out */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <button onClick={handleLogout} className="nav-item w-full my-0 py-2 hover:bg-white/10">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:pl-60 flex flex-col min-h-screen print:pl-0">
        {/* Top header bar */}
        <header className="sticky top-0 z-20 h-16 px-4 sm:px-6 print:hidden app-header w-full border-b border-[var(--border)] bg-[var(--app-bg)]/80 backdrop-blur-md lg:border-none lg:bg-transparent lg:backdrop-blur-none">
          <div className="content-wrapper h-full flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-2" style={{ color: 'var(--text-secondary)' }}>
              <Menu className="h-5 w-5" />
            </button>
            <div className="search-wrap hidden sm:flex">
              <Search className="search-icon h-4 w-4" />
              <input type="text" className="search-input" placeholder="Search for lessons, resources..." />
            </div>
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">
              <InstallButton />
              <ThemeToggle />
              <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center relative" style={{ background: '#E0F2FE', color: '#0284C7', border: 'none', boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.05)' }}>
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#FF6584] text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#FAF7F5]">3</span>
              </button>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-purple-200 border border-purple-300 overflow-hidden shadow-sm">
                {student?.photoUrl ? (
                  <img src={student.photoUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs sm:text-sm font-bold text-purple-700">
                    {initials}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-5 md:p-6 w-full max-w-full overflow-x-hidden">
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<StudentDashboard student={student} />} />
              <Route path="/modules" element={<StudentModules studentId={student?.id || ''} />} />
              <Route path="/lectures" element={<StudentLectures studentId={student?.id || ''} />} />
              <Route path="/assignments" element={<StudentAssignments studentId={student?.id || ''} />} />
              <Route path="/results" element={<StudentResults student={student} />} />
              <Route path="/timetable" element={<Timetable studentId={student?.id || ''} />} />
              <Route path="/materials" element={<StudentMaterials studentId={student?.id || ''} />} />
              <Route path="/settings" element={<StudentSettings student={student} studentId={student?.id || ''} />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function StudentDashboard({ student }: { student: Student | null }) {
  const [upcomingLectures, setUpcomingLectures] = useState<{mod: Module, lec: any}[]>([]);
  const [allLectures, setAllLectures] = useState<{mod: Module, lec: any}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student?.id) {
      setLoading(false);
      return;
    }

    const fetchLectures = async () => {
      try {
        const q = query(collection(db, 'modules'));
        const snap = await getDocs(q);
        const mods = snap.docs.map(d => ({ id: d.id, ...d.data() } as Module));

        const enrolledMods: Module[] = [];
        for (const m of mods) {
          const docRef = doc(db, `modules/${m.id}/enrollments`, student.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            enrolledMods.push(m);
          }
        }

        const allLecs: {mod: Module, lec: any}[] = [];
        for (const m of enrolledMods) {
          const lecsSnap = await getDocs(collection(db, `modules/${m.id}/lectures`));
          lecsSnap.docs.forEach(d => {
            allLecs.push({ mod: m, lec: { id: d.id, ...d.data() } });
          });
        }

        allLecs.sort((a,b) => {
          const dateA = new Date(`${a.lec.date}T${a.lec.time}`).getTime();
          const dateB = new Date(`${b.lec.date}T${b.lec.time}`).getTime();
          return dateA - dateB;
        });
        
        setAllLectures(allLecs);

        const now = new Date();
        now.setHours(0,0,0,0);
        
        const upcoming = allLecs.filter(l => {
          const lDate = new Date(`${l.lec.date}T${l.lec.time}`);
          return lDate.getTime() >= now.getTime();
        });

        setUpcomingLectures(upcoming.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLectures();
  }, [student]);

  const [currentDate, setCurrentDate] = useState(new Date());
  
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, "d");
      const cloneDay = day;
      const isLectureDay = allLectures.some(item => isSameDay(new Date(`${item.lec.date}T${item.lec.time}`), cloneDay));
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isCurrentDay = isToday(day);
      
      days.push(
        <div 
          key={day.toString()} 
          className="flex flex-col items-center justify-center text-xs font-semibold aspect-square rounded-full transition-all"
          style={{
            color: !isCurrentMonth ? 'var(--text-muted)' : isCurrentDay ? '#fff' : isLectureDay ? '#8E82F7' : 'var(--text-primary)',
            background: isCurrentDay ? 'linear-gradient(135deg, #9C8EFA, #7D6DF2)' : isLectureDay && isCurrentMonth ? '#F0EDFF' : 'transparent',
            opacity: !isCurrentMonth ? 0.4 : 1,
            fontWeight: isCurrentDay || isLectureDay ? 800 : 600,
            boxShadow: isCurrentDay ? '0px 4px 10px rgba(125,109,242,0.3)' : 'none',
          }}
        >
          {formattedDate}
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7 gap-1" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  const studyHoursData = [
    { name: 'Mon', hours: 3.2, color: '#9E90F3' },
    { name: 'Tue', hours: 4.5, color: '#FF7696' },
    { name: 'Wed', hours: 3.8, color: '#FFAFA4' },
    { name: 'Thu', hours: 5.2, color: '#FFC85C' },
    { name: 'Fri', hours: 2.5, color: '#90E0A5' },
    { name: 'Sat', hours: 4.8, color: '#82C2F7' },
    { name: 'Sun', hours: 3.0, color: '#9E90F3' },
  ];

  const studyCategoryData = [
    { name: 'Vocabulary', value: 45, color: '#9E90F3' },
    { name: 'Grammar', value: 25, color: '#FF7696' },
    { name: 'Speaking', value: 15, color: '#FFC85C' },
    { name: 'Listening', value: 10, color: '#90E0A5' },
    { name: 'Other', value: 5, color: '#82C2F7' }
  ];

  const firstName = student?.fullName?.split(' ')[0] || 'Student';

  const recentItems = upcomingLectures.length > 0 ? upcomingLectures.map(item => ({
    title: item.lec.title,
    subtitle: `${item.mod.code} · ${item.lec.date} at ${item.lec.time}`,
    link: item.lec.meetLink,
            icon: <Video className="w-5 h-5 text-purple-600" />,
            bg: '#EDE9FE',
          })) : [
            { title: 'Sunset Drive', subtitle: 'Lofi Chill · French Vibe', link: '/student/modules', icon: <BookOpen className="w-5 h-5 text-purple-600" />, bg: '#EDE9FE' },
            { title: 'Golden Hour', subtitle: 'JVKE · Language Practice', link: '/student/modules', icon: <Award className="w-5 h-5 text-pink-600" />, bg: '#FCE7F3' },
            { title: 'Coffee Shop', subtitle: 'Beabadoobee · Listening Study', link: '/student/modules', icon: <Video className="w-5 h-5 text-amber-600" />, bg: '#FEF3C7' },
          ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-in">
      {/* Welcome banner */}
      <div className="welcome-banner flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <img src="/girl_banner.png" alt="Girl listening to music" className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-contain" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-1">
              Good Morning, {firstName}! ☀️
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-purple-100 font-medium">
              Let's enjoy some French learning today!
            </p>
            <div className="mt-3 sm:mt-4">
              <Link to="/student/modules" className="clay-btn-dark text-[11px] sm:text-xs">
                ▶ Play Something
              </Link>
            </div>
          </div>
        </div>
        <div className="hidden lg:block pr-4">
          <span className="text-5xl">🪴</span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Stat Card 1 */}
        <div className="stat-card-custom">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4" style={{ background: 'var(--accent-light)' }}>
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: 'var(--accent)' }} />
          </div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Attendance</p>
          <h3 className="text-xl sm:text-2xl font-bold mt-1" style={{ color: 'var(--text-heading)' }}>85%</h3>
          <p className="text-[10px] sm:text-[11px] font-semibold mt-1" style={{ color: 'var(--stat-sub)' }}>+18% this week</p>
        </div>
        
        {/* Stat Card 2 */}
        <div className="stat-card-custom">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-pink-100 flex items-center justify-center mb-3 sm:mb-4">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
          </div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Enrolled</p>
          <h3 className="text-xl sm:text-2xl font-bold mt-1" style={{ color: 'var(--text-heading)' }}>3 Modules</h3>
          <p className="text-[10px] sm:text-[11px] font-semibold mt-1" style={{ color: 'var(--stat-sub)' }}>+8 this week</p>
        </div>

        {/* Stat Card 3 */}
        <div className="stat-card-custom">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-3 sm:mb-4">
            <Video className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
          </div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Hours Listened</p>
          <h3 className="text-xl sm:text-2xl font-bold mt-1" style={{ color: 'var(--text-heading)' }}>34.6</h3>
          <p className="text-[10px] sm:text-[11px] font-semibold mt-1" style={{ color: 'var(--stat-sub)' }}>+6.2 this week</p>
        </div>

        {/* Stat Card 4 */}
        <div className="stat-card-custom">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-100 flex items-center justify-center mb-3 sm:mb-4">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600" />
          </div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Current Streak</p>
          <h3 className="text-xl sm:text-2xl font-bold mt-1" style={{ color: 'var(--text-heading)' }}>7</h3>
          <p className="text-[10px] sm:text-[11px] font-semibold mt-1" style={{ color: 'var(--stat-sub)' }}>days in a row</p>
        </div>
      </div>

      {/* Middle row: Bar Chart + Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Study Hours Overview Bar Chart */}
        <div className="lg:col-span-2 app-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-base" style={{ color: 'var(--text-heading)' }}>Listening Overview</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Weekly study time distribution</p>
            </div>
            <select className="text-xs font-bold bg-transparent border-none outline-none cursor-pointer" style={{ color: 'var(--accent)' }}>
              <option>This Week</option>
            </select>
          </div>
          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} barSize={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--chart-text)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--chart-text)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)' }} />
                <Bar dataKey="hours" radius={[8, 8, 8, 8]}>
                  {studyHoursData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study Category Donut Chart */}
        <div className="app-card p-5">
          <h2 className="font-bold text-base mb-2" style={{ color: 'var(--text-heading)' }}>Top Genres</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Subject matter activity</p>
          <div className="flex items-center justify-between gap-2">
            <div className="relative w-36 h-36 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={studyCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={56}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {studyCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, '']}
                    contentStyle={{ borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '11px' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>45%</span>
                <span className="text-[9px] font-bold" style={{ color: 'var(--text-muted)' }}>Pop</span>
              </div>
            </div>
            <div className="flex-1 space-y-1 ml-2">
              {studyCategoryData.map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                    <span className="truncate max-w-[70px]">{entry.name}</span>
                  </div>
                  <span style={{ color: 'var(--text-heading)' }}>{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Recently Played (Lectures/Studies) + Recommended Daily Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recently Studied / Lectures */}
        <div className="lg:col-span-2 app-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base" style={{ color: 'var(--text-heading)' }}>Recently Played</h2>
              <Link to="/student/modules" className="text-xs font-bold" style={{ color: 'var(--accent)' }}>See All</Link>
            </div>
            
            {loading ? (
              <div className="py-10 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading studies...</div>
            ) : (
              <div className="space-y-3">
                {recentItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl hover:shadow-sm transition-all" style={{ background: 'var(--item-bg)', border: '1px solid var(--item-border)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm" style={{ color: 'var(--text-heading)' }}>{item.title}</h4>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{item.subtitle}</p>
                      </div>
                    </div>
                    <a 
                      href={item.link} 
                      target={item.link.startsWith('http') ? "_blank" : "_self"}
                      rel="noreferrer"
                      className="w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
                      style={{ background: 'var(--card-bg)', color: 'var(--accent)' }}
                    >
                      <span className="ml-0.5 text-xs">▶</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recommended Cozy Study Session */}
        <div className="app-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base" style={{ color: 'var(--text-heading)' }}>Daily Mix</h2>
            <Link to="/student/modules" className="text-xs font-bold" style={{ color: 'var(--accent)' }}>See All</Link>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] group shadow-inner">
            <img src="/cozy_study_room.png" alt="Cozy Study Room" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm">Chill Mibes</h3>
                  <p className="text-white/80 text-[11px] font-semibold mt-0.5">80 songs</p>
                </div>
                <Link to="/student/modules" className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all text-[#8E82F7]">
                  <span className="ml-0.5 text-xs">▶</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Star banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-[28px] gap-4" style={{ background: 'linear-gradient(135deg, #B5A7F7 0%, #9584F2 100%)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center gap-4">
          <img src="/star_character.png" alt="Cute Star" className="w-16 h-16 object-contain" />
          <div>
            <h3 className="font-bold text-white text-base">Discover new music</h3>
            <p className="text-xs text-purple-100 font-medium">Play songs we think you'll love</p>
          </div>
        </div>
        <Link to="/student/materials" className="btn-primary" style={{ background: '#FFFFFF', color: '#7D6DF2', boxShadow: '0px 8px 16px rgba(0,0,0,0.06)' }}>
          Explore Now
        </Link>
      </div>

      {/* Original Platform components grid (Calendar and Announcements) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Announcements */}
        <div className="app-card p-5">
          <h2 className="font-bold text-base flex items-center gap-2 mb-4" style={{ color: 'var(--text-heading)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-100">
              <Bell className="w-4 h-4 text-amber-600" />
            </div>
            Announcements
          </h2>
          <div className="space-y-3">
            <div className="reminder-item">
              <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-heading)' }}>Welcome to EDUFRENCH BY SONIA</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Check your enrolled modules for required materials and resources.</p>
            </div>
            <div className="reminder-item" style={{ borderLeftColor: '#d97706' }}>
              <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-heading)' }}>Upcoming Exam Schedule</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>The final schedule will be posted next week on the dashboard.</p>
            </div>
          </div>
        </div>

        {/* Academic Calendar */}
        <div className="xl:col-span-2 app-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sky-100">
                <Calendar className="w-4 h-4 text-sky-600" />
              </div>
              Academic Calendar
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={handlePrevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center hover:shadow-sm transition-all" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold w-28 text-center" style={{ color: 'var(--text-heading)' }}>
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <button onClick={handleNextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center hover:shadow-sm transition-all" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-center text-xs font-bold py-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{d}</div>
              ))}
            </div>
            <div className="space-y-1">
              {rows}
            </div>
            <div className="mt-4 pt-4 flex items-center gap-4 text-xs font-semibold" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg,#9C8EFA,#7D6DF2)' }} />
                Today
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ background: '#F0EDFF' }} />
                Scheduled Lecture
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
