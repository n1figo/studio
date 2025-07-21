
'use client';
import { useState, useRef, useEffect } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenuAction,
  useSidebar
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Home, Settings, Plus, Star, Pencil, Check, X, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { getIcon } from '@/lib/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { SupabaseProvider } from '@/components/supabase-provider';

const TASKS_STORAGE_KEY = 'taskforge-tasks';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskName, setEditingTaskName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { state: sidebarState } = useSidebar();

  const loadTasks = async () => {
    try {
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
    }
  }

  useEffect(() => {
    loadTasks();
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === TASKS_STORAGE_KEY && event.newValue) {
        setTasks(JSON.parse(event.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (editingTaskId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingTaskId]);

  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskName(task.name);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTaskName('');
  };

  const handleSaveEdit = async () => {
    if (!editingTaskName.trim()) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '태스크 이름은 비워둘 수 없습니다.',
      });
      return;
    }
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingTaskId,
          name: editingTaskName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTaskData = await response.json();
      const updatedTask: Task = {
        id: updatedTaskData.id,
        name: updatedTaskData.name,
        icon: updatedTaskData.icon,
        color: updatedTaskData.color,
        description: updatedTaskData.description || undefined,
      };

      setTasks(tasks.map(t => t.id === editingTaskId ? updatedTask : t));
    } catch (error) {
      console.error("Failed to update task", error);
      toast({
        variant: 'destructive',
        title: '오류',
        description: '태스크 업데이트 중 오류가 발생했습니다.',
      });
      return;
    }

    toast({
        title: '태스크 업데이트됨',
        description: '태스크 이름이 성공적으로 저장되었습니다.',
    });
    handleCancelEdit();
  };

  const handleDeleteClick = (task: Task, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    
    try {
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
    } catch (error) {
      console.error("Failed to delete task", error);
      toast({ 
        variant: 'destructive',
        title: '오류', 
        description: '태스크 삭제 중 오류가 발생했습니다.' 
      });
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };


  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/20 rounded-lg">
                <Star className="text-primary" />
              </div>
              <h1 className="text-xl font-semibold">태스크 포지</h1>
            </Link>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard">
                <SidebarMenuButton tooltip="대시보드" isActive={pathname === '/dashboard'}>
                  <Home />
                  <span>대시보드</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/manage-tasks">
                <SidebarMenuButton tooltip="태스크 관리" isActive={pathname === '/manage-tasks'}>
                  <Settings />
                  <span>태스크 관리</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>

          <div className="mt-4 px-2 text-sm font-semibold text-muted-foreground group-data-[collapsed=true]:hidden">
            내 태스크
          </div>
          <SidebarMenu>
            {tasks.map((task) => {
              const Icon = getIcon(task.icon);
              const isEditing = editingTaskId === task.id;
              return (
                <SidebarMenuItem key={task.id}>
                  {isEditing ? (
                    <div className="flex w-full items-center gap-1 px-2">
                      <Icon className="h-4 w-4 shrink-0" style={{ color: task.color }} />
                      <Input
                        ref={inputRef}
                        value={editingTaskName}
                        onChange={(e) => setEditingTaskName(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        onBlur={handleCancelEdit}
                        className="h-7 flex-grow"
                      />
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleSaveEdit}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full group">
                      <Link href={`/tasks/${task.id}`} className="flex-1">
                        <SidebarMenuButton tooltip={task.name} isActive={pathname === `/tasks/${task.id}`} className="w-full justify-between">
                          <div className="flex items-center gap-2">
                            <Icon style={{ color: task.color }} />
                            <span>{task.name}</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEditClick(task);
                              }}
                              className="p-1 rounded hover:bg-muted transition-colors duration-200"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(task, e)}
                              className="p-1 rounded text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </SidebarMenuButton>
                      </Link>
                    </div>
                  )}
                </SidebarMenuItem>
              );
            })}
            <SidebarMenuItem>
              <Link href="/manage-tasks">
                <SidebarMenuButton variant="outline">
                  <Plus />
                  <span>새 태스크</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://placehold.co/40x40" alt="사용자 아바타" data-ai-hint="user avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsed=true]:hidden">
              <span className="font-semibold text-sm">사용자</span>
              <span className="text-xs text-muted-foreground">user@taskforge.com</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center sm:text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">태스크 삭제</DialogTitle>
              </div>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              <strong>"{taskToDelete?.name}"</strong> 태스크를 삭제하시겠습니까?
              <br />
              <span className="text-xs mt-1 block text-destructive/70">
                ⚠️ 이 작업은 되돌릴 수 없으며, 관련된 모든 게시물도 함께 삭제됩니다.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 flex-col sm:flex-row">
            <DialogClose asChild>
              <Button variant="outline" className="order-2 sm:order-1">
                취소
              </Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              className="order-1 sm:order-2"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              영구 삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <div className={cn("flex flex-1 flex-col transition-[margin-left] duration-300 ease-in-out", sidebarState === 'collapsed' ? "md:ml-16" : "md:ml-64")}>
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-card px-6 sticky top-0 z-30">
           <div className="flex-1">
               <SidebarTrigger className="md:hidden" />
           </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <SidebarProvider>
        <div className="flex min-h-screen bg-muted/40">
          <AppLayoutContent>{children}</AppLayoutContent>
        </div>
      </SidebarProvider>
    </SupabaseProvider>
  )
}
