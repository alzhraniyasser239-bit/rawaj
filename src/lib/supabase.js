import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kfsmvibesdcbsfikrcgm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc212aWJlc2RjYnNmaWtyY2dtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NDgyNTUsImV4cCI6MjA5OTQyNDI1NX0.z5bom2V5_iRRSm51En9aqXyuDHqTGeKjL9KA3lRQ_v8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
