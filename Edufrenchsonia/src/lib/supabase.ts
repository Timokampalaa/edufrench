import { createClient } from '@supabase/supabase-js';

const env = (typeof process !== 'undefined' && process.env) || (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://edthhsjsragwnkefkzgb.supabase.co';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkdGhoc2pzcmFnd25rZWZremdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1OTY5NTIsImV4cCI6MjA5OTE3Mjk1Mn0.ol6pvf6PgnjGW4CfcXY61IBwMBCHN14Gj9qIjDhbWAM';

export const supabase = createClient(supabaseUrl, supabaseKey);
