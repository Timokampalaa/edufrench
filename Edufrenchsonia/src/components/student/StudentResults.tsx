import React, { useState, useEffect } from 'react';
import { db } from '../../lib/db';
import { collection, query, getDocs, doc, getDoc, mutationEmitter } from '../../lib/db';
import { Award, FileText, CheckCircle, Printer } from 'lucide-react';
import { Module, Student } from '../../types';

export default function StudentResults({ student }: { student: Student | null }) {
  const [results, setResults] = useState<{mod: Module, asn: any, sub: any}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student?.id) return;
    
    let isMounted = true;
    let isFetching = false;
    let lastHash = '';
    
    const fetchResults = async () => {
      if (isFetching) return;
      isFetching = true;
      try {
        const q = query(collection(db, 'modules'));
        const snap = await getDocs(q);
        if (!isMounted) return;
        const mods = snap.docs.map(d => ({ id: d.id, ...d.data() } as Module));

        const gradedSubmissions: {mod: Module, asn: any, sub: any}[] = [];
        
        for (const m of mods) {
          const asnSnap = await getDocs(collection(db, `modules/${m.id}/assignments`));
          for (const asnDoc of asnSnap.docs) {
            const asnData = { id: asnDoc.id, ...asnDoc.data() };
            const subDocRef = doc(db, `modules/${m.id}/assignments/${asnDoc.id}/submissions`, student.id);
            const subDocSnap = await getDoc(subDocRef);
            
            if (subDocSnap.exists()) {
              const subData = subDocSnap.data();
              if (subData.grade !== undefined && subData.grade !== null) {
                 gradedSubmissions.push({ 
                  mod: m, 
                  asn: asnData,
                  sub: subData
                });
              }
            }
          }
        }
        if (!isMounted) return;
        
        const sorted = gradedSubmissions.sort((a,b) => b.sub.submittedAt - a.sub.submittedAt);
        const newHash = JSON.stringify(sorted);
        if (newHash !== lastHash) {
          setResults(sorted);
          lastHash = newHash;
        }
      } catch (err) {
        console.error(err);
      } finally {
        isFetching = false;
        if (isMounted) setLoading(false);
      }
    };
    
    fetchResults();
    const interval = setInterval(fetchResults, 3000);
    const unsub = mutationEmitter.subscribe(fetchResults);

    return () => {
      isMounted = false;
      clearInterval(interval);
      unsub();
    };
  }, [student?.id]);

  const handlePrint = async () => {
    if (!student) return;
    try {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();

      // Try to load user logo
      try {
        const response = await fetch('/icon.png');
        const blob = await response.blob();
        const base64data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        doc.addImage(base64data, 'PNG', 14, 15, 20, 20);
      } catch (e) {
        console.warn("Could not load icon", e);
      }

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text('EDUFRENCH BY SONIA STUDY INITIATIVE', 40, 25);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.text('Student Official Result Slip', 40, 33);
      
      // Details
      doc.setFontSize(11);
      doc.text(`Student Name: ${student.fullName || 'N/A'}`, 14, 50);
      doc.text(`Registration No: ${student.regNumber || 'N/A'}`, 14, 56);
      doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 14, 62);
      
      doc.text(`Course: ${student.course || 'N/A'}`, 120, 50);
      const totalE = results.reduce((acc, curr) => acc + (Number(curr.sub.grade) || 0), 0);
      const totalP = results.reduce((acc, curr) => acc + (Number(curr.asn.marks) || 0), 0);
      const oP = totalP > 0 ? ((totalE / totalP) * 100).toFixed(1) : '0.0';
      doc.text(`Overall Average: ${oP}%`, 120, 56);
      doc.text(`Total Assignments Graded: ${results.length}`, 120, 62);

      const tableBody = results.map(item => [
        `${item.asn.title}\n${item.mod.code} - ${item.mod.name}`,
        new Date(item.sub.submittedAt).toLocaleDateString(),
        `${item.sub.grade} / ${item.asn.marks}`,
        item.sub.feedback || 'No feedback provided'
      ]);

      autoTable(doc, {
        startY: 70,
        head: [['Module & Assignment', 'Submitted On', 'Grade', 'Feedback']],
        body: tableBody,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [108, 99, 255] }
      });

      doc.save(`${student.regNumber || 'Student'}_Results.pdf`);
    } catch (err) { 
      console.error('PDF generation failed', err); 
      alert('Failed to generate PDF'); 
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 app-card">
        <div style={{ color: 'var(--text-muted)' }}>Loading your results...</div>
      </div>
    );
  }

  const totalEarned = results.reduce((acc, curr) => acc + (Number(curr.sub.grade) || 0), 0);
  const totalPossible = results.reduce((acc, curr) => acc + (Number(curr.asn.marks) || 0), 0);
  const overallPercentage = totalPossible > 0 ? ((totalEarned / totalPossible) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 max-w-5xl mx-auto print:m-0 print:p-0 print:max-w-none animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 welcome-banner">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Academic Results</h1>
          <p className="mt-1 text-sm print:hidden" style={{ color: 'var(--text-secondary)' }}>View your graded assignments and overall performance.</p>
        </div>
        <button 
          onClick={handlePrint}
          className="print:hidden btn-primary flex items-center gap-2 py-2.5 px-4 text-xs font-bold"
        >
          <Printer className="w-4 h-4" />
          Download Slip
        </button>
      </div>

      <div className="print:hidden grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="app-card p-6 flex flex-col justify-between h-36 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 bg-indigo-500/10 w-24 h-24 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between z-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 border border-indigo-100">
              <Award className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-4xl font-bold tracking-tight text-indigo-600">{overallPercentage}%</span>
          </div>
          <p className="text-sm font-semibold mt-auto" style={{ color: 'var(--text-secondary)' }}>Overall Grade Average</p>
        </div>

        <div className="app-card p-6 flex flex-col justify-between h-36 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 bg-emerald-500/10 w-24 h-24 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between z-10">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-100">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-emerald-600">{results.length}</span>
          </div>
          <p className="text-sm font-semibold mt-auto" style={{ color: 'var(--text-secondary)' }}>Graded Assignments</p>
        </div>
      </div>

      {/* Print summary visible only in print mode */}
      <div className="hidden print:block mb-8 pb-4 border-b print:border-black flex flex-col items-center text-center">
        <div className="flex flex-col items-center justify-center gap-3 mb-4">
           <img src="/icon.png" alt="App Icon Badge" className="w-20 h-20 object-contain print:inline-block" />
           <h1 className="text-2xl font-bold print:text-black uppercase tracking-widest text-center">EDUFRENCH BY SONIA STUDY INITIATIVE</h1>
        </div>
        <h2 className="text-xl font-bold print:text-black mb-4 whitespace-nowrap">Student Official Result Slip</h2>
        <div className="flex justify-between w-full text-sm print:text-black mt-4 text-left px-2">
          <div>
            <p className="mb-1"><strong>Student Name:</strong> {student?.fullName || 'N/A'}</p>
            <p className="mb-1"><strong>Registration No:</strong> {student?.regNumber || 'N/A'}</p>
            <p><strong>Date Issued:</strong> {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="mb-1"><strong>Course:</strong> {student?.course || 'N/A'}</p>
            <p className="mb-1"><strong>Overall Average:</strong> {overallPercentage}%</p>
            <p><strong>Total Assignments Graded:</strong> {results.length}</p>
          </div>
        </div>
      </div>

      <div className="app-card overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block print:block">
          <table className="min-w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Module & Assignment</th>
                <th className="text-left">Submitted On</th>
                <th className="text-left">Grade</th>
                <th className="text-left">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-indigo-500 print:text-black mr-3 hidden sm:block" />
                      <div>
                        <div className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>{item.asn.title}</div>
                        <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{item.mod.code} - {item.mod.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(item.sub.submittedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex items-baseline">
                      <span className="text-base font-bold" style={{ color: 'var(--text-heading)' }}>{item.sub.grade}</span>
                      <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>/ {item.asn.marks}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {item.sub.feedback ? (
                      <p className="text-sm line-clamp-2 print:line-clamp-none" title={item.sub.feedback}>
                        {item.sub.feedback}
                      </p>
                    ) : (
                      <span className="text-sm italic" style={{ color: 'var(--text-muted)' }}>No feedback provided</span>
                    )}
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <Award className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>No Grades Yet</h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Your graded assignments will appear here once marked by an administrator.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden print:hidden flex flex-col divide-y" style={{ divideColor: 'var(--border)' }}>
          {results.map((item, idx) => (
            <div key={idx} className="p-4 flex flex-col space-y-3 hover:bg-[var(--app-bg)] transition-colors surface-primary">
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <FileText className="w-5 h-5 text-indigo-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>{item.asn.title}</div>
                    <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.mod.code} - {item.mod.name}</div>
                  </div>
                </div>
                <div className="flex items-baseline whitespace-nowrap ml-4">
                  <span className="text-lg font-bold" style={{ color: 'var(--text-heading)' }}>{item.sub.grade}</span>
                  <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>/ {item.asn.marks}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Submitted</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(item.sub.submittedAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="p-3 rounded-xl border bg-neutral-50/50" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Feedback</span>
                 {item.sub.feedback ? (
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {item.sub.feedback}
                    </p>
                  ) : (
                    <span className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No feedback provided</span>
                  )}
              </div>
            </div>
          ))}
          {results.length === 0 && (
            <div className="px-6 py-12 text-center surface-primary">
              <Award className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-heading)' }}>No Grades Yet</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Your graded assignments will appear here once marked by an administrator.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
