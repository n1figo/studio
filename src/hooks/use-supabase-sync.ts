import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Task, Post } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function useSupabaseSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: '오프라인 모드',
        description: '인터넷 연결을 확인해주세요.',
        variant: 'destructive',
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

  return { isOnline, isSyncing };
}

export async function loadTasksFromSupabase(): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading tasks:', error);
      throw error;
    }

    return data?.map(task => ({
      id: task.id,
      name: task.name,
      icon: task.icon,
      color: task.color,
      description: task.description || undefined,
    })) || [];
  } catch (error) {
    console.error('Failed to load tasks from Supabase:', error);
    throw error;
  }
}

export async function loadPostsFromSupabase(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading posts:', error);
      throw error;
    }

    return data?.map(post => ({
      id: post.id,
      taskId: post.task_id,
      title: post.title,
      content: post.content,
      createdAt: post.created_at,
    })) || [];
  } catch (error) {
    console.error('Failed to load posts from Supabase:', error);
    throw error;
  }
}

export async function createTask(taskData: Omit<Task, 'id'>): Promise<Task> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        name: taskData.name,
        icon: taskData.icon,
        color: taskData.color,
        description: taskData.description || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      icon: data.icon,
      color: data.color,
      description: data.description || undefined,
    };
  } catch (error) {
    console.error('Failed to create task:', error);
    throw error;
  }
}

export async function updateTask(id: string, taskData: Partial<Omit<Task, 'id'>>): Promise<Task> {
  try {
    const updateData: any = {};
    if (taskData.name !== undefined) updateData.name = taskData.name;
    if (taskData.icon !== undefined) updateData.icon = taskData.icon;
    if (taskData.color !== undefined) updateData.color = taskData.color;
    if (taskData.description !== undefined) updateData.description = taskData.description || null;

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      icon: data.icon,
      color: data.color,
      description: data.description || undefined,
    };
  } catch (error) {
    console.error('Failed to update task:', error);
    throw error;
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete task:', error);
    throw error;
  }
}

export async function createPost(postData: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        task_id: postData.taskId,
        title: postData.title,
        content: postData.content,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating post:', error);
      throw error;
    }

    return {
      id: data.id,
      taskId: data.task_id,
      title: data.title,
      content: data.content,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Failed to create post:', error);
    throw error;
  }
}

export async function deletePost(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete post:', error);
    throw error;
  }
}