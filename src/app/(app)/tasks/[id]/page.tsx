
'use client';
import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Post, Task } from '@/lib/types';
import { getIcon } from '@/lib/icons';
import { useSupabaseSync, loadPostsFromSupabase, loadTasksFromSupabase, createPost, deletePost } from '@/hooks/use-supabase-sync';
import { supabase } from '@/lib/supabase';

export default function TaskBoardPage() {
  const params = useParams();
  const taskId = params.id as string;
  const { toast } = useToast();
  const { isOnline, isSyncing } = useSupabaseSync();

  const [posts, setPosts] = useState<Post[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Loading data for task ID:', taskId);
        
        const [tasksData, postsData] = await Promise.all([
          loadTasksFromSupabase(),
          loadPostsFromSupabase()
        ]);
        
        console.log('Loaded tasks:', tasksData.length);
        console.log('Loaded posts:', postsData.length);
        
        setTasks(tasksData);
        setPosts(postsData);
      } catch (error) {
        console.error("Failed to load data", error);
        setTasks([]);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Set up real-time subscriptions
    const postsChannel = supabase
      .channel('posts-changes-detail')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('Post change received in detail:', payload);
          loadData();
        }
      )
      .subscribe();
      
    const tasksChannel = supabase
      .channel('tasks-changes-detail')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Task change received in detail:', payload);
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, [taskId]);

  const taskPosts = useMemo(() => {
    return posts.filter(p => p.taskId === taskId)
      .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts, taskId]);

  const task = useMemo(() => {
    console.log('Looking for task with ID:', taskId);
    console.log('Available tasks:', tasks.map(t => ({ id: t.id, name: t.name })));
    return tasks.find(t => t.id === taskId);
  }, [tasks, taskId]);
  
  if (isLoading) {
    return (
      <div className="text-center space-y-4">
        <div>데이터를 불러오는 중...</div>
        <div className="text-sm text-muted-foreground">
          태스크 ID: {taskId}
        </div>
      </div>
    );
  }
  
  if (!task) {
    return (
      <div className="text-center space-y-4">
        <div>태스크를 찾을 수 없습니다.</div>
        <div className="text-sm text-muted-foreground">
          찾는 태스크 ID: {taskId}
        </div>
        <div className="text-sm text-muted-foreground">
          사용 가능한 태스크: {tasks.length}개
        </div>
        {tasks.length > 0 && (
          <div className="text-sm text-muted-foreground">
            사용 가능한 태스크들:
            <br />
            {tasks.map(t => `${t.name} (${t.id})`).join(', ')}
          </div>
        )}
      </div>
    );
  }

  const handleSavePost = async (newPostData: Omit<Post, 'id' | 'taskId' | 'createdAt'>) => {
    try {
      const newPost = await createPost({
        ...newPostData,
        taskId: task.id,
      });
      
      setPosts([newPost, ...posts]);
      toast({ title: '게시물 생성됨', description: '진행 상황이 기록되었습니다.' });
      setIsDialogOpen(false);
    } catch(error) {
      console.error("Failed to save post", error);
      toast({ 
        variant: 'destructive',
        title: '오류', 
        description: '게시물 생성 중 오류가 발생했습니다.' 
      });
    }
  };
  
  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts(posts.filter((post) => post.id !== postId));
      toast({
        title: '게시물 삭제됨',
        description: '게시물이 성공적으로 삭제되었습니다.',
      });
    } catch(error) {
      console.error("Failed to delete post", error);
      toast({ 
        variant: 'destructive',
        title: '오류', 
        description: '게시물 삭제 중 오류가 발생했습니다.' 
      });
    }
  };

  const Icon = getIcon(task.icon);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
           <span className="p-3 rounded-lg hidden sm:block" style={{ backgroundColor: `${task.color}20` }}>
              <Icon className="h-8 w-8" style={{ color: task.color }} />
           </span>
           <div>
            <h1 className="text-3xl font-bold tracking-tight">{task.name}</h1>
            <p className="text-muted-foreground">
              {task.description}
              {!isOnline && ' (오프라인 모드)'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isSyncing && (
            <Button variant="ghost" size="icon" disabled>
              <RefreshCw className="h-4 w-4 animate-spin" />
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> 게시물 추가
              </Button>
            </DialogTrigger>
            <PostFormDialog onSave={handleSavePost} />
          </Dialog>
        </div>
      </header>

      <div className="space-y-4">
        {taskPosts.length > 0 ? (
          taskPosts
          .map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>{format(new Date(post.createdAt), 'yyyy년 MMMM d일 - a h:mm', { locale: ko })}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeletePost(post.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{post.content}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>아직 게시물이 없습니다</CardTitle>
              <CardDescription>첫 게시물을 작성하여 진행 상황을 기록해보세요!</CardDescription>
            </CardHeader>
            <CardContent>
               <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> 첫 게시물 작성
                    </Button>
                  </DialogTrigger>
                  <PostFormDialog onSave={handleSavePost} />
                </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


function PostFormDialog({ onSave }: { onSave: (post: Omit<Post, 'id' | 'taskId'| 'createdAt'>) => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    onSave({ title, content });
  };
  
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>새 게시물 추가</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">제목</Label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 1장 노트" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">내용</Label>
          <Textarea id="content" value={content} onChange={e => setContent(e.target.value)} placeholder="달성한 내용에 대해 설명해주세요..." required />
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit">게시물 저장</Button>
        </div>
      </form>
    </DialogContent>
  );
}
