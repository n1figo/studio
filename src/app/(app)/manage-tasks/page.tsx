
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
import { getIcon, iconList } from '@/lib/icons';
import type { Task } from '@/lib/types';
import { AiProjectDiscoverer } from '@/components/ai-project-discoverer';

const colorPresets = [
  'hsl(347, 89%, 60%)', 'hsl(210, 89%, 60%)', 'hsl(110, 89%, 60%)',
  'hsl(45, 89%, 60%)', 'hsl(25, 89%, 60%)', 'hsl(300, 89%, 60%)',
  'hsl(180, 89%, 60%)', 'hsl(270, 89%, 60%)',
];

export default function ManageTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  
  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const apiTasks = await response.json();
        const formattedTasks: Task[] = apiTasks.map((task: any) => ({
          id: task.id,
          name: task.name,
          icon: task.icon,
          color: task.color,
          description: task.description || undefined,
        }));
        setTasks(formattedTasks);
      } else {
        throw new Error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error("Failed to load tasks", error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
    
    // Polling으로 주기적 데이터 업데이트
    const pollingInterval = setInterval(() => {
      loadTasks();
    }, 30000); // 30초마다 업데이트

    // Window focus 시 데이터 새로고침
    const handleWindowFocus = () => {
      loadTasks();
    };
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(pollingInterval);
      window.removeEventListener('focus', handleWindowFocus);
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


  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    
    try {
      setIsSyncing(true);
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: taskToDelete.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter((task) => task.id !== taskToDelete.id));
      toast({ title: '태스크 삭제됨', description: '태스크가 성공적으로 삭제되었습니다.' });
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
      
      // 사이드바 업데이트를 위한 커스텀 이벤트 발생
      window.dispatchEvent(new Event('tasksChanged'));
    } catch (error) {
      console.error("Failed to delete task", error);
      toast({ 
        variant: 'destructive',
        title: '오류', 
        description: '태스크 삭제 중 오류가 발생했습니다.' 
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleSave = async (taskData: Omit<Task, 'id'> & { id?: string }) => {
    try {
      setIsSyncing(true);
      if (taskData.id) {
        // Edit existing task
        const response = await fetch('/api/tasks', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) {
          throw new Error('Failed to update task');
        }

        const apiTask = await response.json();
        const updatedTask: Task = {
          id: apiTask.id,
          name: apiTask.name,
          icon: apiTask.icon,
          color: apiTask.color,
          description: apiTask.description || undefined,
        };
        
        setTasks(tasks.map(t => t.id === taskData.id ? updatedTask : t));
        toast({ title: '태스크 업데이트됨', description: '태스크가 저장되었습니다.' });
        
        // 사이드바 업데이트를 위한 커스텀 이벤트 발생
        window.dispatchEvent(new Event('tasksChanged'));
      } else {
        // Add new task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });

        if (!response.ok) {
          throw new Error('Failed to create task');
        }

        const apiTask = await response.json();
        const newTask: Task = {
          id: apiTask.id,
          name: apiTask.name,
          icon: apiTask.icon,
          color: apiTask.color,
          description: apiTask.description || undefined,
        };
        
        setTasks([...tasks, newTask]);
        toast({ title: '태스크 생성됨', description: '새로운 태스크가 준비되었습니다.' });
        
        // 사이드바 업데이트를 위한 커스텀 이벤트 발생
        window.dispatchEvent(new Event('tasksChanged'));
      }
      setIsDialogOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Failed to save task", error);
      toast({ 
        variant: 'destructive',
        title: '오류', 
        description: '태스크 저장 중 오류가 발생했습니다.' 
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">태스크 관리</h1>
          <p className="text-muted-foreground">
            사용자 지정 태스크를 생성, 편집 및 구성하세요.
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

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>태스크 삭제 확인</DialogTitle>
            <DialogDescription>
              정말로 "{taskToDelete?.name}" 태스크를 삭제하시겠습니까? 
              이 작업은 되돌릴 수 없으며, 관련된 모든 게시물도 함께 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSyncing}>
                취소
              </Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  삭제
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // 로딩 상태 표시
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="flex flex-col animate-pulse">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </CardHeader>
              <CardFooter className="mt-auto flex justify-end gap-2">
                <div className="w-8 h-8 bg-muted rounded"></div>
                <div className="w-8 h-8 bg-muted rounded"></div>
              </CardFooter>
            </Card>
          ))
        ) : tasks.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-semibold mb-2">태스크가 없습니다</h3>
            <p className="text-muted-foreground mb-4">첫 번째 태스크를 만들어 시작해보세요.</p>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> 새 태스크 추가
            </Button>
          </div>
        ) : (
          tasks.map((task) => {
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
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(task)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })
        )}
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
