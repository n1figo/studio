'use client';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
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
    return <div className="text-center">Task not found.</div>;
  }

  const handleSavePost = (newPost: Omit<Post, 'id' | 'taskId' | 'createdAt'>) => {
    const post: Post = {
      ...newPost,
      id: new Date().toISOString(),
      taskId: task.id,
      createdAt: new Date(),
    };
    setPosts(prev => [post, ...prev]);
    toast({ title: 'Post Created', description: 'Your progress has been logged.' });
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
              <Plus className="mr-2 h-4 w-4" /> Add Post
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
                <CardDescription>{format(post.createdAt, 'MMMM d, yyyy - h:mm a')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{post.content}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>No Posts Yet</CardTitle>
              <CardDescription>Start logging your progress by creating your first post!</CardDescription>
            </CardHeader>
            <CardContent>
               <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" /> Create First Post
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
        <DialogTitle>Add a New Post</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Chapter 1 Notes" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea id="content" value={content} onChange={e => setContent(e.target.value)} placeholder="Describe your achievement..." required />
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit">Save Post</Button>
        </div>
      </form>
    </DialogContent>
  );
}
