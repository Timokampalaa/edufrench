/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './components/Login';
import AdminPortal from './components/AdminPortal';
import StudentPortal from './components/StudentPortal';
import InstallPrompt from './components/InstallPrompt';

export default function App() {
  const [role, setRole] = useState<string | null>(sessionStorage.getItem('edufrench_role') || localStorage.getItem('edufrench_role'));

  useEffect(() => {
    if (!role) {
      sessionStorage.removeItem('edufrench_role');
      localStorage.removeItem('edufrench_role');
    }
  }, [role]);

  return (
    <Router>
      <InstallPrompt />
      <Routes>
        <Route path="/" element={role ? <Navigate to={role === 'admin' ? "/admin" : "/student"} /> : <Login setRole={setRole} />} />
        <Route path="/admin/*" element={role === 'admin' ? <AdminPortal setRole={setRole} /> : <Navigate to="/" />} />
        <Route path="/student/*" element={role === 'student' ? <StudentPortal setRole={setRole} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

