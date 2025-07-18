import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zvmwjdrdalnjvhnddssy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2bXdqZHJkYWxuanZobmRkc3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NzUxNDMsImV4cCI6MjA2ODI1MTE0M30.yqrPtKVIO-QG13mqtzmPHYs9BYIcVV_Sh5TUk3j-QYI';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          name: string;
          icon: string;
          color: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          icon: string;
          color: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          color?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          task_id: string;
          title: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          title: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          title?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
  };
};