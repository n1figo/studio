import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Task, Post } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const TASKS_STORAGE_KEY = 'taskforge-tasks';
const POSTS_STORAGE_KEY = 'taskforge-posts';
const SYNC_STATUS_KEY = 'taskforge-sync-status';

export function useSupabaseSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: '오프라인 모드',
        description: '변경사항은 로컬에 저장되며 온라인 시 동기화됩니다.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const syncOfflineData = async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);

    try {
      const syncStatus = localStorage.getItem(SYNC_STATUS_KEY);
      if (syncStatus === 'synced') {
        setIsSyncing(false);
        return;
      }

      // Sync tasks
      const localTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      if (localTasks) {
        const tasks = JSON.parse(localTasks) as Task[];
        for (const task of tasks) {
          await supabase.from('tasks').upsert({
            id: task.id,
            name: task.name,
            icon: task.icon,
            color: task.color,
            description: task.description || null,
          });
        }
      }

      // Sync posts
      const localPosts = localStorage.getItem(POSTS_STORAGE_KEY);
      if (localPosts) {
        const posts = JSON.parse(localPosts) as Post[];
        for (const post of posts) {
          await supabase.from('posts').upsert({
            id: post.id,
            task_id: post.taskId,
            title: post.title,
            content: post.content,
            created_at: post.createdAt,
          });
        }
      }

      localStorage.setItem(SYNC_STATUS_KEY, 'synced');
      toast({
        title: '동기화 완료',
        description: '모든 데이터가 클라우드와 동기화되었습니다.',
      });
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: '동기화 실패',
        description: '데이터 동기화 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    isSyncing,
    syncOfflineData,
  };
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  localStorage.setItem(SYNC_STATUS_KEY, 'pending');

  if (navigator.onLine) {
    try {
      const { error } = await supabase.from('tasks').upsert(
        tasks.map(task => ({
          id: task.id,
          name: task.name,
          icon: task.icon,
          color: task.color,
          description: task.description || null,
        }))
      );

      if (!error) {
        localStorage.setItem(SYNC_STATUS_KEY, 'synced');
      }
    } catch (error) {
      console.error('Failed to sync tasks:', error);
    }
  }
}

export async function savePosts(posts: Post[]): Promise<void> {
  localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  localStorage.setItem(SYNC_STATUS_KEY, 'pending');

  if (navigator.onLine) {
    try {
      const { error } = await supabase.from('posts').upsert(
        posts.map(post => ({
          id: post.id,
          task_id: post.taskId,
          title: post.title,
          content: post.content,
          created_at: post.createdAt,
        }))
      );

      if (!error) {
        localStorage.setItem(SYNC_STATUS_KEY, 'synced');
      }
    } catch (error) {
      console.error('Failed to sync posts:', error);
    }
  }
}

export async function loadTasksFromSupabase(): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(task => ({
      id: task.id,
      name: task.name,
      icon: task.icon,
      color: task.color,
      description: task.description || undefined,
    }));
  } catch (error) {
    console.error('Failed to load tasks from Supabase:', error);
    return [];
  }
}

export async function loadPostsFromSupabase(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(post => ({
      id: post.id,
      taskId: post.task_id,
      title: post.title,
      content: post.content,
      createdAt: post.created_at,
    }));
  } catch (error) {
    console.error('Failed to load posts from Supabase:', error);
    return [];
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  if (navigator.onLine) {
    try {
      await supabase.from('tasks').delete().eq('id', taskId);
    } catch (error) {
      console.error('Failed to delete task from Supabase:', error);
    }
  }
}

export async function deletePost(postId: string): Promise<void> {
  if (navigator.onLine) {
    try {
      await supabase.from('posts').delete().eq('id', postId);
    } catch (error) {
      console.error('Failed to delete post from Supabase:', error);
    }
  }
}