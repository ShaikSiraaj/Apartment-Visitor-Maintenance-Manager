const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key_for_testing';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// In-Memory Storage Engine for fallback when Supabase keys are default / mock
class MemoryDB {
  constructor() {
    this.users = [];
    this.apartments = [];
    this.visitors = [];
    this.maintenance = [];
    this.alerts = [];
  }

  generateId() {
    return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
  }
}

const memoryDb = new MemoryDB();

module.exports = {
  supabase,
  memoryDb,
  isMock: !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('xyzcompany'),
};
