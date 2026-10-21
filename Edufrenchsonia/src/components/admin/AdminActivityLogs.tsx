import React, { useState, useEffect } from 'react';
import { db, collection, query, onSnapshot } from '../../lib/db';
import { Activity, Clock, User, Filter } from 'lucide-react';

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'activityLogs'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.docs.forEach((doc: any) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setLogs(data);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching logs:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter(log => filter === 'all' || log.userType === filter);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in">
      <div className="sm:flex sm:items-center sm:justify-between welcome-banner">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Activity Logs</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Monitor usage and actions across the application.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2 bg-white rounded-xl px-3 py-1.5 shadow-sm border" style={{ borderColor: 'var(--border)' }}>
          <Filter className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm font-semibold focus:outline-none bg-transparent"
            style={{ color: 'var(--text-primary)' }}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      <div className="app-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading activities...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No activities logged yet.</div>
        ) : (
          <ul className="divide-y" style={{ divideColor: 'var(--border)' }}>
            {filteredLogs.map((log) => (
              <li key={log.id} className="p-4 hover:bg-[var(--app-bg)] transition-colors duration-150">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#ede9fe', color: '#6c63ff' }}>{log.action}</span>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{log.details}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-xs" style={{ color: 'var(--text-muted)' }}>
                        <User className="w-3.5 h-3.5 mr-1" />
                        <span className="font-semibold">{log.userId}</span> <span className="mx-1">({log.userType})</span>
                      </div>
                      <div className="flex items-center text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {new Date(log.createdAt || log.timestamp || Date.now()).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
