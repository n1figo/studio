'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { mockTasks, mockPosts } from '@/lib/mock-data';
import type { Post } from '@/lib/types';
import { getIcon } from '@/lib/icons';

export default function TaskBoardPage() {
  const params = useParams();
  const taskId = params.id as string;
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>(mockPosts.filter(p => p.taskId === taskId));
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const task = useMemo(() => mockTasks.find(t => t.id === taskId), [taskId]);
  
  if (!task) {
    return <div className="text-center">태스크를 찾을 수 없습니다.</div>;
  }

  const handleSavePost = (newPost: Omit<Post, 'id' | 'taskId' | 'createdAt'>) => {
    const post: Post = {
      ...newPost,
      id: new Date().toISOString(),
      taskId: task.id,
      createdAt: new Date(),
    };
    setPosts(prev => [post, ...prev]);
    toast({ title: '게시물 생성됨', description: '진행 상황이 기록되었습니다.' });
    setIsDialogOpen(false);
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
            <p className="text-muted-foreground">{task.description}</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> 게시물 추가
            </Button>
          </DialogTrigger>
          <PostFormDialog onSave={handleSavePost} />
        </Dialog>
      </header>

      <div className="space-y-4">
        {posts.length > 0 ? (
          posts
          .sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())
          .map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>{format(post.createdAt, 'yyyy년 MMMM d일 - a h:mm', { locale: ko })}</CardDescription>
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
