'use client';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Home, Settings, Plus, Star } from 'lucide-react';
import { mockTasks } from '@/lib/mock-data';
import { getIcon } from '@/lib/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // In a real app, this data would come from an API call
  const tasks = mockTasks;

  return (
    <SidebarProvider>
      <div className="min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/20 rounded-lg">
                  <Star className="text-primary" />
                </div>
                <h1 className="text-xl font-semibold">Task Forge</h1>
              </Link>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard" legacyBehavior passHref>
                  <SidebarMenuButton tooltip="Dashboard" isActive={pathname === '/dashboard'}>
                    <Home />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/manage-tasks" legacyBehavior passHref>
                  <SidebarMenuButton tooltip="Manage Tasks" isActive={pathname === '/manage-tasks'}>
                    <Settings />
                    <span>Manage Tasks</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>

            <div className="mt-4 px-2 text-sm font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">
              Your Tasks
            </div>
            <SidebarMenu>
              {tasks.map((task) => {
                const Icon = getIcon(task.icon);
                return (
                  <SidebarMenuItem key={task.id}>
                    <Link href={`/tasks/${task.id}`} legacyBehavior passHref>
                      <SidebarMenuButton tooltip={task.name} isActive={pathname === `/tasks/${task.id}`}>
                        <Icon style={{ color: task.color }} />
                        <span>{task.name}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
              <SidebarMenuItem>
                <Link href="/manage-tasks" legacyBehavior passHref>
                  <SidebarMenuButton variant="outline">
                    <Plus />
                    <span>New Task</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/40x40" alt="User avatar" data-ai-hint="user avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-semibold text-sm">User</span>
                <span className="text-xs text-muted-foreground">user@taskforge.com</span>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8">
            <header className="flex items-center justify-between md:hidden mb-4">
               <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-primary/20 rounded-lg">
                    <Star className="text-primary h-5 w-5" />
                  </div>
                 <h1 className="text-lg font-semibold">Task Forge</h1>
               </div>
              <SidebarTrigger />
            </header>
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
