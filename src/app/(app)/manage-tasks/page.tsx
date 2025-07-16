
'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { mockTasks as fallbackTasks } from '@/lib/mock-data';
import { getIcon, iconList } from '@/lib/icons';
import type { Task } from '@/lib/types';
import { AiProjectDiscoverer } from '@/components/ai-project-discoverer';
import { useSupabaseSync, saveTasks, loadTasksFromSupabase, deleteTask as deleteTaskFromSupabase } from '@/hooks/use-supabase-sync';
import { supabase } from '@/lib/supabase';

const TASKS_STORAGE_KEY = 'taskforge-tasks';

const colorPresets = [
  'hsl(347, 89%, 60%)', 'hsl(210, 89%, 60%)', 'hsl(110, 89%, 60%)',
  'hsl(45, 89%, 60%)', 'hsl(25, 89%, 60%)', 'hsl(300, 89%, 60%)',
  'hsl(180, 89%, 60%)', 'hsl(270, 89%, 60%)',
];

export default function ManageTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();
  const { isOnline, isSyncing, syncOfflineData } = useSupabaseSync();
  
  const loadTasks = async () => {
    try {
      // Always load from localStorage first for immediate display
      const storedTasksRaw = localStorage.getItem(TASKS_STORAGE_KEY);
      if (storedTasksRaw) {
        setTasks(JSON.parse(storedTasksRaw));
      } else {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(fallbackTasks));
        setTasks(fallbackTasks);
      }

      // Then try to load from Supabase if online
      if (navigator.onLine) {
        try {
          const supabaseTasks = await loadTasksFromSupabase();
          if (supabaseTasks.length > 0) {
            setTasks(supabaseTasks);
            localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(supabaseTasks));
          }
        } catch (supabaseError) {
          console.error("Failed to load from Supabase, using local data", supabaseError);
        }
      }
    } catch (error) {
      console.error("Failed to load tasks", error);
      setTasks(fallbackTasks);
    }
  }

  useEffect(() => {
    loadTasks();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Task change received:', payload);
          loadTasks(); // Reload tasks when changes occur
        }
      )
      .subscribe();
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === TASKS_STORAGE_KEY && event.newValue) {
        setTasks(JSON.parse(event.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const updateLocalStorage = async (updatedTasks: Task[]) => {
    try {
      await saveTasks(updatedTasks);
    } catch (error) {
      console.error("Failed to save tasks", error);
    }
  }

  const handleDelete = async (taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    await updateLocalStorage(updatedTasks);
    await deleteTaskFromSupabase(taskId);
    toast({ title: '태스크 삭제됨', description: '태스크가 성공적으로 삭제되었습니다.' });
  };
  
  const handleSave = async (taskData: Omit<Task, 'id'> & { id?: string }) => {
    let updatedTasks;
    if (taskData.id) {
      // Edit existing task
      updatedTasks = tasks.map(t => t.id === taskData.id ? { ...t, ...taskData } : t);
      toast({ title: '태스크 업데이트됨', description: '태스크가 저장되었습니다.' });
    } else {
      // Add new task
      const newTask = { ...taskData, id: crypto.randomUUID() };
      updatedTasks = [...tasks, newTask];
      toast({ title: '태스크 생성됨', description: '새로운 태스크가 준비되었습니다.' });
    }
    setTasks(updatedTasks);
    await updateLocalStorage(updatedTasks);
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">태스크 관리</h1>
          <p className="text-muted-foreground">
            사용자 지정 태스크를 생성, 편집 및 구성하세요.
            {!isOnline && ' (오프라인 모드)'}
          </p>
        </div>
        <div className="flex gap-2">
          {isSyncing && (
            <Button variant="ghost" size="icon" disabled>
              <RefreshCw className="h-4 w-4 animate-spin" />
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" /> 새 태스크 추가
              </Button>
            </DialogTrigger>
            <TaskFormDialog
              task={editingTask}
              onSave={handleSave}
              onClose={() => setIsDialogOpen(false)}
            />
          </Dialog>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => {
          const Icon = getIcon(task.icon);
          return (
            <Card key={task.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <span className="p-3 rounded-lg" style={{ backgroundColor: `${task.color}20` }}>
                  <Icon className="h-6 w-6" style={{ color: task.color }} />
                </span>
                <div className="flex-1">
                  <CardTitle>{task.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{task.description || '설명 없음'}</CardDescription>
                </div>
              </CardHeader>
              <CardFooter className="mt-auto flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(task)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(task.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function TaskFormDialog({
  task,
  onSave,
  onClose,
}: {
  task: Task | null;
  onSave: (taskData: Omit<Task, 'id'> & { id?: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(task?.name || '');
  const [description, setDescription] = useState(task?.description || '');
  const [icon, setIcon] = useState(task?.icon || 'pen-square');
  const [color, setColor] = useState(task?.color || colorPresets[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSave({ id: task?.id, name, description, icon, color });
  };
  
  const IconComponent = getIcon(icon);

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{task ? '태스크 편집' : '새 태스크 추가'}</DialogTitle>
        <DialogDescription>
          {task ? '태스크의 세부 정보를 업데이트하세요.' : '진행 상황을 추적할 새 태스크를 만드세요.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
        <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">태스크 이름</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 매일 운동하기" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="태스크에 대해 설명해주세요..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">아이콘</Label>
                <Select value={icon} onValueChange={setIcon}>
                  <SelectTrigger id="icon">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5" style={{ color }}/>
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {iconList.map((iconName) => {
                      const ListItemIcon = getIcon(iconName);
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center gap-2">
                            <ListItemIcon className="h-5 w-5 text-muted-foreground" />
                            <span>{iconName.replace(/-/g, ' ')}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">색상</Label>
                <div className="grid grid-cols-4 gap-2">
                  {colorPresets.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant="outline"
                      size="icon"
                      className={`h-9 w-9 ${color === preset ? 'ring-2 ring-ring ring-offset-2' : ''}`}
                      style={{ backgroundColor: preset }}
                      onClick={() => setColor(preset)}
                    />
                  ))}
                </div>
              </div>
            </div>
        </div>
        <div className="space-y-4">
            <AiProjectDiscoverer taskDescription={description} />
        </div>
      </form>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onClose}>취소</Button>
        </DialogClose>
        <Button type="submit" onClick={handleSubmit}>태스크 저장</Button>
      </DialogFooter>
    </DialogContent>
  );
}
