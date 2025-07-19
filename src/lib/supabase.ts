import { createClient } from '@supabase/supabase-js';

// 로컬 개발환경에서는 환경변수가 없으면 에러 처리
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment check:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Not set');

// 로컬 개발환경에서 Supabase 환경변수가 없으면 더미 클라이언트 생성
let supabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Using dummy client for development.');
  // 더미 URL로 클라이언트 생성 (실제 연결 없음)
  supabaseClient = createClient('http://localhost:54321', 'dummy-key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

export const supabase = supabaseClient;

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