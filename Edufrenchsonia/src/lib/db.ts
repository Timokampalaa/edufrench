import { supabase } from './supabase';

export const db = {};
export const storage = {};

const LOCAL_DB_KEY = 'edufrench_local_db_v1';

function makeLocalSeedData() {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const mod1 = 'mod-beginner';
  const mod2 = 'mod-conversation';
  const mod3 = 'mod-culture';
  const asn1 = 'asn-grammer';
  const asn2 = 'asn-dialogue';
  const asn3 = 'asn-culture';
  const lec1 = 'lec-pronunciation';
  const lec2 = 'lec-dialogue';
  const lec3 = 'lec-culture';

  return {
    students: [
      {
        id: 'admin-001',
        reg_number: 'REG-ADMIN-2026',
        full_name: 'Sonia Admin',
        email: 'admin@edufrench.com',
        password: 'Admin123',
        course: 'Administration',
        status: 'active',
        photo_url: '',
        created_at: now - 1000 * 60 * 60 * 24 * 180
      },
      {
        id: 'student-001',
        reg_number: 'REG-STU-1001',
        full_name: 'Amina Bensaid',
        email: 'amina@edufrench.com',
        password: 'Student123',
        course: 'French Communication',
        status: 'active',
        photo_url: '',
        created_at: now - 1000 * 60 * 60 * 24 * 60
      },
      {
        id: 'student-002',
        reg_number: 'REG-STU-1002',
        full_name: 'Yassine El Idrissi',
        email: 'yassine@edufrench.com',
        password: 'Student123',
        course: 'French Communication',
        status: 'active',
        photo_url: '',
        created_at: now - 1000 * 60 * 60 * 24 * 42
      }
    ],
    modules: [
      { id: mod1, code: 'FR101', name: 'Beginner French', description: 'Foundations in pronunciation, greetings, and core vocabulary.', created_at: now - 12 * dayMs },
      { id: mod2, code: 'FR202', name: 'Conversational French', description: 'Speaking practice for real-life everyday communication and travel situations.', created_at: now - 9 * dayMs },
      { id: mod3, code: 'FR303', name: 'French Culture & Writing', description: 'Writing and cultural literacy for essays, note-taking, and expression.', created_at: now - 6 * dayMs }
    ],
    enrollments: [
      { id: 'student-001', student_id: 'student-001', module_id: mod1, enrolled_at: now - 10 * dayMs },
      { id: 'student-001', student_id: 'student-001', module_id: mod2, enrolled_at: now - 8 * dayMs },
      { id: 'student-001', student_id: 'student-001', module_id: mod3, enrolled_at: now - 7 * dayMs },
      { id: 'student-002', student_id: 'student-002', module_id: mod1, enrolled_at: now - 10 * dayMs }
    ],
    lectures: [
      { id: lec1, module_id: mod1, title: 'Pronunciation Lab', meet_link: 'https://meet.google.com/xyz-pronunciation', date: '2026-09-15', time: '09:00', created_at: now - 2 * dayMs },
      { id: lec2, module_id: mod2, title: 'Everyday Conversation Practice', meet_link: 'https://meet.google.com/xyz-conversation', date: '2026-09-18', time: '11:30', created_at: now - 2 * dayMs },
      { id: lec3, module_id: mod3, title: 'French Culture Mini-Lecture', meet_link: 'https://meet.google.com/xyz-culture', date: '2026-09-22', time: '14:00', created_at: now - 2 * dayMs }
    ],
    assignments: [
      { id: asn1, module_id: mod1, title: 'Greetings & Basic Vocabulary Quiz', description: 'Write a short self-introduction in French using greetings, places, and verbs.', start_time: now - 3 * dayMs, deadline: now + 4 * dayMs, marks: 20, file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', created_at: now - 6 * dayMs },
      { id: asn2, module_id: mod2, title: 'Roleplay Dialogue', description: 'Create a dialogue between two friends discussing plans for the weekend in French.', start_time: now - 2 * dayMs, deadline: now + 5 * dayMs, marks: 25, file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', created_at: now - 5 * dayMs },
      { id: asn3, module_id: mod3, title: 'Culture Reflection Essay', description: 'Write a short reflection on a cultural tradition and compare it to your own context.', start_time: now - 1 * dayMs, deadline: now + 7 * dayMs, marks: 30, file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', created_at: now - 4 * dayMs }
    ],
    learning_materials: [
      { id: 'mat-1', module_id: mod1, title: 'Beginner French Workbook', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', created_at: now - 3 * dayMs },
      { id: 'mat-2', module_id: mod2, title: 'Conversational Phrases PDF', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', created_at: now - 2 * dayMs },
      { id: 'mat-3', module_id: mod3, title: 'Culture Notes & Essay Tips', file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', created_at: now - 2 * dayMs }
    ],
    submissions: [
      { id: 'student-001', student_id: 'student-001', module_id: mod1, assignment_id: asn1, content: '<p>Bonjour, je m’appelle Amina. Je suis à l’université et j’aime apprendre le français.</p>', file_url: '', submitted_at: now - 2 * dayMs, grade: 18, feedback: 'Strong introductory paragraph with clear structure and accurate vocabulary.' },
      { id: 'student-001', student_id: 'student-001', module_id: mod2, assignment_id: asn2, content: '<p>Salut! On va au cinéma ce soir ?</p>', file_url: '', submitted_at: now - 1 * dayMs, grade: 22, feedback: 'Good fluency and natural language use.' }
    ],
    activity_logs: [
      { id: 'log-1', action: 'System Init', description: 'Activity logging subsystem initialized.', action_type: 'system', details: 'Activity logging subsystem initialized.', user_id: 'system', user_type: 'system', created_at: now - 36 * 60 * 60 * 1000 },
      { id: 'log-2', action: 'Login', description: 'Admin logged into the system', action_type: 'admin', details: 'Admin logged into the system', user_id: 'admin', user_type: 'admin', created_at: now - 30 * 60 * 1000 },
      { id: 'log-3', action: 'Login', description: 'Student Amina Bensaid logged in.', action_type: 'student', details: 'Student Amina Bensaid logged in.', user_id: 'REG-STU-1001', user_type: 'student', created_at: now - 5 * 60 * 1000 }
    ],
    academic_events: [
      { id: 'evt-intro-lab', title: 'Orientation & Placement Test', date: '2026-09-12', time: '10:00', location: 'Room A1', type: 'event', created_at: now - 2 * dayMs },
      { id: 'evt-pronunciation', title: 'Pronunciation Lab', date: '2026-09-15', time: '09:00', location: 'Online / Meet Room', type: 'lecture', created_at: now - 2 * dayMs },
      { id: 'evt-dialogue', title: 'Conversation Workshop', date: '2026-09-18', time: '11:30', location: 'Language Hub', type: 'lecture', created_at: now - 2 * dayMs },
      { id: 'evt-assignment', title: 'Dialogue Assignment Deadline', date: '2026-09-21', time: '17:00', location: 'Submission Portal', type: 'deadline', created_at: now - 1 * dayMs }
    ],
    files: {}
  };
}

function readLocalDb(): any {
  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return makeLocalSeedData();
  }
  const raw = window.localStorage.getItem(LOCAL_DB_KEY);
  if (!raw) {
    const seed = makeLocalSeedData();
    window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    const state = JSON.parse(raw);
    if (!state.students || !state.modules) {
      const seed = makeLocalSeedData();
      window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(seed));
      return seed;
    }
    return state;
  } catch (error) {
    const seed = makeLocalSeedData();
    window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(seed));
    return seed;
  }
}

function writeLocalDb(state: any) {
  if (typeof window !== 'undefined' && 'localStorage' in window) {
    window.localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(state));
  }
}

function localTable(tableName: string) {
  const state = readLocalDb();
  return state[tableName] || [];
}

function toCamelCase(field: string) {
  return field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function matchLocalValue(item: any, rawField: string, expected: any) {
  const fieldNames = new Set([rawField, toCamelCase(rawField), rawField.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`)]);
  for (const name of fieldNames) {
    if (item[name] !== undefined && item[name] === expected) return true;
  }
  return false;
}

function listLocalDocs(table: string, conditions: Record<string, any> = {}, constraints: any[] = []) {
  const rows = localTable(table);
  const filtered = rows.filter((row: any) => {
    let pass = true;
    for (const [key, value] of Object.entries(conditions)) {
      if (!matchLocalValue(row, key, value)) {
        pass = false;
        break;
      }
    }
    if (!pass) return false;
    for (const constraint of constraints) {
      if (constraint.type === 'where') {
        const field = constraint.field;
        const fieldNames = new Set([field, toCamelCase(field), field.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`)]);
        const actual = Array.from(fieldNames).map(name => row[name]).find((v) => v !== undefined);
        if (constraint.op === '==') {
          if (actual !== constraint.val) return false;
        }
      }
    }
    return true;
  });

  return filtered;
}

export function collection(dbInstance: any, path: string) {
  return { type: 'collection', path };
}

export function doc(dbInstance: any, path: string, id?: string) {
  return { type: 'doc', path: id ? `${path}/${id}` : path };
}

export function query(collectionRef: any, ...constraints: any[]) {
  return { ...collectionRef, constraints };
}

export function where(field: string, op: string, val: any) {
  return { type: 'where', field, op, val };
}

// Helper to convert object keys from camelCase to snake_case
function camelToSnake(obj: any): any {
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      let val = obj[key];
      if (typeof val === 'number' && val > 1000000000000 && (key.endsWith('At') || key === 'deadline' || key === 'startTime')) {
        val = new Date(val).toISOString();
      }
      acc[snakeKey] = camelToSnake(val);
      return acc;
    }, {} as any);
  }
  return obj;
}

function snakeToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      let val = obj[key];
      if (typeof val === 'string' && (camelKey.endsWith('At') || camelKey === 'deadline' || camelKey === 'startTime')) {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          val = d.getTime();
        }
      }
      acc[camelKey] = snakeToCamel(val);
      return acc;
    }, {} as any);
  }
  return obj;
}

function parsePath(path: string) {
  const parts = path.split('/').filter(Boolean);
  const camelTable = parts[parts.length - 1];
  const table = camelTable.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

  const isDoc = parts.length % 2 === 0;
  const collectionName = isDoc ? parts[parts.length - 2] : parts[parts.length - 1];
  const docId = isDoc ? parts[parts.length - 1] : undefined;

  const conditions: Record<string, string> = {};
  if (parts.length >= 3) {
    conditions['module_id'] = parts[1];
  }
  if (parts.length >= 5) {
    conditions['assignment_id'] = parts[3];
  }

  return { table: collectionName.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`), docId, conditions };
}

export async function getDoc(docRef: any) {
  const { table, docId, conditions } = parsePath(docRef.path);

  if (typeof window !== 'undefined' && 'localStorage' in window) {
    const rows = listLocalDocs(table, conditions);
    const row = rows.find((r: any) => {
      if (table === 'enrollments' || table === 'submissions') {
        return r.student_id === docId;
      }
      return r.id === docId;
    });

    if (!row) {
      return { exists: () => false, data: () => null, id: docId };
    }

    let resultData = snakeToCamel(row);
    if (table === 'students' && resultData.email && resultData.email.includes('|PASS|')) {
      const parts = resultData.email.split('|PASS|');
      resultData.email = parts[0];
      resultData.password = parts[1];
    }

    return { exists: () => true, data: () => resultData, id: docId };
  }

  let idField = 'id';
  if (table === 'enrollments' || table === 'submissions') {
    idField = 'student_id';
  }

  let q: any = supabase.from(table).select('*').eq(idField, docId);
  for (const [k, v] of Object.entries(conditions)) {
    if (table === 'submissions' && k === 'module_id') continue;
    q = q.eq(k, v);
  }

  const { data, error } = await q.single();

  if (error || !data) {
    return { exists: () => false, data: () => null, id: docId };
  }

  let resultData = snakeToCamel(data);
  if (table === 'students' && resultData.email && resultData.email.includes('|PASS|')) {
    const parts = resultData.email.split('|PASS|');
    resultData.email = parts[0];
    resultData.password = parts[1];
  }

  return { exists: () => true, data: () => resultData, id: docId };
}

export async function getDocs(queryRef: any) {
  const { table, conditions } = parsePath(queryRef.path);

  if (typeof window !== 'undefined' && 'localStorage' in window) {
    const rows = listLocalDocs(table, conditions, queryRef.constraints || []);
    const docs = rows.map((row: any) => {
      let resultData = snakeToCamel(row);
      if (table === 'students' && resultData.email && resultData.email.includes('|PASS|')) {
        const parts = resultData.email.split('|PASS|');
        resultData.email = parts[0];
        resultData.password = parts[1];
      }
      return {
        id: row.id || row.student_id,
        data: () => resultData
      };
    });

    return {
      empty: docs.length === 0,
      size: docs.length,
      docs
    };
  }

  if (table === 'activity_logs') {
    let data = JSON.parse(localStorage.getItem('activity_logs') || '[]');
    if (data.length === 0) {
      data = [
        { id: '1', action: 'System Init', details: 'Activity logging subsystem initialized.', userId: 'system', userType: 'system', createdAt: Date.now() - 3600000 },
        { id: '2', action: 'Admin Action', details: 'System checks completed.', userId: 'admin', userType: 'admin', createdAt: Date.now() - 1800000 }
      ];
      localStorage.setItem('activity_logs', JSON.stringify(data));
    }
    return {
      empty: data.length === 0,
      size: data.length,
      docs: data.map((d: any) => ({ id: d.id, data: () => d }))
    };
  }

  let q: any = supabase.from(table).select('*');
  for (const [k, v] of Object.entries(conditions)) {
    if (table === 'submissions' && k === 'module_id') continue;
    q = q.eq(k, v);
  }

  if (queryRef.constraints) {
    for (const c of queryRef.constraints) {
      if (c.type === 'where') {
        const field = c.field.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);
        if (c.op === '==') {
          q = q.eq(field, c.val);
        }
      }
    }
  }

  const { data, error } = await q;
  if (error) throw error;

  return {
    empty: data.length === 0,
    size: data.length,
    docs: data.map((d: any) => {
      let resultData = snakeToCamel(d);
      if (table === 'students' && resultData.email && resultData.email.includes('|PASS|')) {
        const parts = resultData.email.split('|PASS|');
        resultData.email = parts[0];
        resultData.password = parts[1];
      }
      return {
        id: d.id || d.student_id,
        data: () => resultData
      };
    })
  };
}

class LocalEmitter {
  listeners: Set<Function> = new Set();
  emit() {
    this.listeners.forEach(fn => fn());
  }
  subscribe(fn: Function) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}
export const mutationEmitter = new LocalEmitter();

function localIdForDoc(table: string, docId: string, conditions: Record<string, any>) {
  if (table === 'enrollments' || table === 'submissions') {
    return `${docId}:${conditions.module_id || ''}:${conditions.assignment_id || ''}`;
  }
  return docId;
}

export async function setDoc(docRef: any, data: any, options: { merge?: boolean } = {}) {
  if (typeof window !== 'undefined' && 'localStorage' in window) {
    const { table, docId, conditions } = parsePath(docRef.path);
    let d = { ...data };
    if (table === 'students') {
      if ('password' in d || 'email' in d) {
        let currentEmail = d.email;
        let currentPass = d.password;
        if (typeof currentEmail === 'undefined' || typeof currentPass === 'undefined' || currentPass === '') {
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            if (typeof currentEmail === 'undefined') currentEmail = snap.data().email;
            if (typeof currentPass === 'undefined' || currentPass === '') currentPass = snap.data().password || '';
          }
        }
        currentEmail = currentEmail || '';
        currentPass = currentPass || '';
        d.email = currentPass ? `${currentEmail}|PASS|${currentPass}` : currentEmail;
        delete d.password;
      }
    }

    const payload = camelToSnake({ ...d, ...conditions });
    const state = readLocalDb();
    const rows = state[table] || [];
    const rowId = localIdForDoc(table, docId, conditions);
    const index = rows.findIndex((row: any) => {
      if (table === 'enrollments' || table === 'submissions') {
        return row.student_id === docId && (row.module_id === conditions.module_id || !conditions.module_id) && (row.assignment_id === conditions.assignment_id || !conditions.assignment_id);
      }
      return row.id === docId;
    });

    const nextRow = { ...rows[index] || {}, ...payload };
    if (table === 'enrollments' || table === 'submissions') {
      nextRow.student_id = docId;
    }
    nextRow.id = nextRow.id || rowId;

    if (index >= 0) rows[index] = nextRow;
    else rows.push(nextRow);

    state[table] = rows;
    writeLocalDb(state);
    mutationEmitter.emit();
    return;
  }

  const { table, docId, conditions } = parsePath(docRef.path);

  let d = { ...data };
  if (table === 'students') {
    if ('password' in d || 'email' in d) {
      let currentEmail = d.email;
      let currentPass = d.password;
      if (typeof currentEmail === 'undefined' || typeof currentPass === 'undefined' || currentPass === '') {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          if (typeof currentEmail === 'undefined') currentEmail = snap.data().email;
          if (typeof currentPass === 'undefined' || currentPass === '') currentPass = snap.data().password || '';
        }
      }
      currentEmail = currentEmail || '';
      currentPass = currentPass || '';
      d.email = currentPass ? `${currentEmail}|PASS|${currentPass}` : currentEmail;
      delete d.password;
    }
  }

  let payload = camelToSnake({ ...d, ...conditions });
  if (table === 'submissions') delete payload.module_id;

  if (table === 'enrollments' || table === 'submissions') {
    payload.student_id = docId;
    let queryObj: any = supabase.from(table).select('id').eq('student_id', docId);
    for (const [k, v] of Object.entries(conditions)) {
      queryObj = queryObj.eq(k, v);
    }
    const { data: existingData } = await queryObj.single();
    if (existingData && existingData.id) {
      payload.id = existingData.id;
    }
  } else {
    payload.id = docId;
  }

  const { error } = await supabase.from(table).upsert(payload);
  if (error) throw error;
  mutationEmitter.emit();
}

export async function updateDoc(docRef: any, data: any) {
  if (typeof window !== 'undefined' && 'localStorage' in window) {
    const { table, docId, conditions } = parsePath(docRef.path);
    const state = readLocalDb();
    const rows = state[table] || [];
    const index = rows.findIndex((row: any) => {
      if (table === 'enrollments' || table === 'submissions') {
        return row.student_id === docId && (row.module_id === conditions.module_id || !conditions.module_id) && (row.assignment_id === conditions.assignment_id || !conditions.assignment_id);
      }
      return row.id === docId;
    });
    if (index === -1) return;

    let d = { ...data };
    if (table === 'students') {
      if ('password' in d || 'email' in d) {
        let currentEmail = d.email;
        let currentPass = d.password;
        if (typeof currentEmail === 'undefined' || typeof currentPass === 'undefined' || currentPass === '') {
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            if (typeof currentEmail === 'undefined') currentEmail = snap.data().email;
            if (typeof currentPass === 'undefined' || currentPass === '') currentPass = snap.data().password || '';
          }
        }
        currentEmail = currentEmail || rows[index].email || '';
        currentPass = currentPass || rows[index].password || '';
        d.email = currentPass ? `${currentEmail}|PASS|${currentPass}` : currentEmail;
        delete d.password;
      }
    }

    rows[index] = { ...rows[index], ...camelToSnake(d), ...conditions };
    state[table] = rows;
    writeLocalDb(state);
    mutationEmitter.emit();
    return;
  }

  const { table, docId, conditions } = parsePath(docRef.path);

  let d = { ...data };
  if (table === 'students') {
    if ('password' in d || 'email' in d) {
      let currentEmail = d.email;
      let currentPass = d.password;
      if (typeof currentEmail === 'undefined' || typeof currentPass === 'undefined' || currentPass === '') {
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          if (typeof currentEmail === 'undefined') currentEmail = snap.data().email;
          if (typeof currentPass === 'undefined' || currentPass === '') currentPass = snap.data().password || '';
        }
      }
      currentEmail = currentEmail || '';
      currentPass = currentPass || '';
      d.email = currentPass ? `${currentEmail}|PASS|${currentPass}` : currentEmail;
      delete d.password;
    }
  }

  let q: any = supabase.from(table).update(camelToSnake(d));
  if (table === 'enrollments' || table === 'submissions') {
    q = q.eq('student_id', docId);
  } else {
    q = q.eq('id', docId);
  }

  for (const [k, v] of Object.entries(conditions)) {
    if (table === 'submissions' && k === 'module_id') continue;
    q = q.eq(k, v);
  }

  const { error } = await q;
  if (error) throw error;
  mutationEmitter.emit();
}

export async function deleteDoc(docRef: any) {
  if (typeof window !== 'undefined' && 'localStorage' in window) {
    const { table, docId, conditions } = parsePath(docRef.path);
    const state = readLocalDb();
    const rows = state[table] || [];
    const next = rows.filter((row: any) => {
      if (table === 'enrollments' || table === 'submissions') {
        return !(row.student_id === docId && (row.module_id === conditions.module_id || !conditions.module_id) && (row.assignment_id === conditions.assignment_id || !conditions.assignment_id));
      }
      return row.id !== docId;
    });
    state[table] = next;
    writeLocalDb(state);
    mutationEmitter.emit();
    return;
  }

  const { table, docId, conditions } = parsePath(docRef.path);

  let q: any = supabase.from(table).delete();
  if (table === 'enrollments' || table === 'submissions') {
    q = q.eq('student_id', docId);
  } else {
    q = q.eq('id', docId);
  }

  for (const [k, v] of Object.entries(conditions)) {
    if (table === 'submissions' && k === 'module_id') continue;
    q = q.eq(k, v);
  }

  const { error } = await q;
  if (error) throw error;
  mutationEmitter.emit();
}

export async function addDoc(collectionRef: any, data: any) {
  if (typeof window !== 'undefined' && 'localStorage' in window) {
    const { table } = parsePath(collectionRef.path);
    const state = readLocalDb();
    const rows = state[table] || [];
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    const payload = camelToSnake({ id, ...data });
    rows.push(payload);
    state[table] = rows;
    writeLocalDb(state);
    mutationEmitter.emit();
    return { id };
  }

  const { table } = parsePath(collectionRef.path);
  const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  const payload = camelToSnake({ id, ...data });

  if (table === 'activity_logs') {
    const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
    logs.push(data);
    data.id = id;
    localStorage.setItem('activity_logs', JSON.stringify(logs));
    mutationEmitter.emit();
    return { id };
  }

  const { error } = await supabase.from(table).insert([payload]);
  if (error) throw error;
  mutationEmitter.emit();
  return { id };
}

export function onSnapshot(ref: any, callback: Function, errorCb?: Function) {
  let isMounted = true;
  let lastData = '';

  const fetchData = async () => {
    try {
      let snap;
      if (ref.type === 'doc') {
        snap = await getDoc(ref);
      } else {
        snap = await getDocs(ref);
      }

      if (!isMounted) return;

      const extractedData = ref.type === 'doc' ? snap.data() : snap.docs.map((d: any) => d.data());
      const newData = JSON.stringify(extractedData);

      if (newData !== lastData) {
        lastData = newData;
        callback(snap);
      }
    } catch (err) {
      if (isMounted && errorCb) errorCb(err);
    }
  };

  fetchData();
  const intervalId = setInterval(fetchData, 3000);
  const unsubMutation = mutationEmitter.subscribe(fetchData);

  return () => {
    isMounted = false;
    clearInterval(intervalId);
    unsubMutation();
  };
}

export function ref(storageInstance: any, path: string) {
  return { path };
}

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

export async function uploadBytes(storageRef: any, file: File) {
  if (typeof window !== 'undefined' && 'localStorage' in window) {
    const state = readLocalDb();
    const url = await fileToDataUrl(file);
    state.files = state.files || {};
    state.files[storageRef.path] = url;
    writeLocalDb(state);
    return { ref: storageRef };
  }

  const { data, error } = await supabase.storage.from('files').upload(storageRef.path, file);
  if (error) throw error;
  return { ref: storageRef };
}

export async function getDownloadURL(storageRef: any) {
  if (typeof window !== 'undefined' && 'localStorage' in window) {
    const state = readLocalDb();
    const file = state.files?.[storageRef.path];
    if (file) return file;
    return `data:application/octet-stream;base64,${btoa('local-file')}`;
  }

  const { data } = supabase.storage.from('files').getPublicUrl(storageRef.path);
  return data.publicUrl;
}
