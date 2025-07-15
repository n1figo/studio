
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
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Home, Settings, Plus, Star, Pencil, Check, X } from 'lucide-react';
import { mockTasks } from '@/lib/mock-data';
import { getIcon } from '@/lib/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Task } from '@/lib/types';


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { toast } = useToast();
  // In a real app, this data would come from an API call
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskName, setEditingTaskName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSaveEdit = () => {
    if (!editingTaskName.trim()) {
      toast({
        variant: 'destructive',
        title: '오류',
        description: '태스크 이름은 비워둘 수 없습니다.',
      });
      return;
    }
    setTasks(tasks.map(t => t.id === editingTaskId ? { ...t, name: editingTaskName } : t));
    toast({
        title: '태스크 업데이트됨',
        description: '태스크 이름이 성공적으로 저장되었습니다.',
    });
    handleCancelEdit();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };


  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-muted/40">
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
                      <Link href={`/tasks/${task.id}`}>
                        <SidebarMenuButton tooltip={task.name} isActive={pathname === `/tasks/${task.id}`}>
                          <Icon style={{ color: task.color }} />
                          <span>{task.name}</span>
                           <SidebarMenuAction
                              showOnHover
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleEditClick(task);
                              }}
                            >
                              <Pencil />
                            </SidebarMenuAction>
                        </SidebarMenuButton>
                      </Link>
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
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-card px-6 sticky top-0 z-30">
             <div className="flex-1">
                 <SidebarTrigger className="md:hidden" />
             </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
