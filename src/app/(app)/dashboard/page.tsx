
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { mockTasks as fallbackTasks, mockPosts as fallbackPosts } from '@/lib/mock-data';
import { getIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { DailyStatus, DailyRecord, Post, Task } from '@/lib/types';

const POSTS_STORAGE_KEY = 'taskforge-posts';
const TASKS_STORAGE_KEY = 'taskforge-tasks';

const statusStyles: { [key in DailyStatus]: string } = {
  'O': 'bg-green-300 dark:bg-green-800 text-green-900 dark:text-green-200',
  'X': 'bg-red-300 dark:bg-red-800 text-red-900 dark:text-red-200',
  ' ': 'bg-muted/50',
};

const generateDailyRecords = (tasks: Task[], posts: Post[]): DailyRecord => {
  return tasks.reduce((acc, task) => {
    acc[task.id] = {};
    for (let i = 0; i < 31; i++) { // Generate for the last 31 days for context
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = format(date, 'yyyy-MM-dd');
      
      const postExists = posts.some(
        (post) => post.taskId === task.id && format(new Date(post.createdAt), 'yyyy-MM-dd') === dateString
      );
      
      if (postExists) {
        acc[task.id][dateString] = 'O';
      } else if (date < new Date(new Date().setHours(0,0,0,0))) { // Mark past days without posts as 'X'
        acc[task.id][dateString] = 'X';
      } else {
        acc[task.id][dateString] = ' ';
      }
    }
    return acc;
  }, {} as DailyRecord);
};


export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState<DailyRecord>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  const loadData = () => {
    let storedPosts: Post[];
    let storedTasks: Task[];
    try {
      const storedPostsRaw = localStorage.getItem(POSTS_STORAGE_KEY);
      storedPosts = storedPostsRaw ? JSON.parse(storedPostsRaw) : fallbackPosts;
      setPosts(storedPosts);

      const storedTasksRaw = localStorage.getItem(TASKS_STORAGE_KEY);
      storedTasks = storedTasksRaw ? JSON.parse(storedTasksRaw) : fallbackTasks;
      setTasks(storedTasks);
      
      const dynamicRecords = generateDailyRecords(storedTasks, storedPosts);
      setRecords(dynamicRecords);

    } catch (error) {
      console.error("Failed to access localStorage", error);
      setPosts(fallbackPosts);
      setTasks(fallbackTasks);
      const dynamicRecords = generateDailyRecords(fallbackTasks, fallbackPosts);
      setRecords(dynamicRecords);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for storage changes to update the dashboard
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === POSTS_STORAGE_KEY || event.key === TASKS_STORAGE_KEY) {
             loadData();
        }
    }
    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));

  const subtotalForAllTasks = useMemo(() => {
    return tasks.map(task => {
        const taskRecords = records[task.id] || {};
        return daysInMonth.reduce((acc, day) => {
            const dateString = format(day, 'yyyy-MM-dd');
            if (taskRecords[dateString] === 'O') {
                return acc + 1;
            }
            return acc;
        }, 0);
    });
  }, [tasks, records, daysInMonth]);

  return (
    <div className="flex flex-col h-full">
      <header className="pb-4">
        <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground">일일 진행 상황을 한눈에 파악하세요.</p>
      </header>
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>{format(currentDate, 'yyyy년 MMMM', { locale: ko })}</CardTitle>
              <CardDescription>월별 진행 상황을 확인하세요.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col overflow-hidden">
          <div className="flex h-full">
            {/* Task Names and Subtotal Column */}
            <div className="sticky left-0 bg-card z-10 flex flex-col border-r">
              <div className="flex">
                <div className="pr-4 w-40">
                  <div className="h-16 flex items-end pb-1 font-semibold">태스크</div>
                </div>
                <div className="pr-4 border-l w-20">
                    <div className="h-16 flex items-end justify-center pb-1 font-semibold">소계</div>
                </div>
              </div>
              <div className="flex-grow">
                {tasks.map((task, index) => {
                  const Icon = getIcon(task.icon);
                  return (
                    <div key={task.id} className="flex">
                      <div className="h-12 flex items-center gap-2 text-sm font-medium pr-2 w-40">
                        <div className="p-1.5 rounded-md" style={{ backgroundColor: `${task.color}20`}}>
                          <Icon className="w-5 h-5" style={{ color: task.color }} />
                        </div>
                        <span className="truncate flex-1">{task.name}</span>
                      </div>
                      <div className="h-12 flex items-center justify-center text-sm font-bold pr-4 border-l w-20">
                          {subtotalForAllTasks[index]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="w-full h-full overflow-x-auto">
              <div className="flex-grow h-full">
                <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${daysInMonth.length}, minmax(44px, 1fr))`, gridTemplateRows: `4rem repeat(${tasks.length}, 3rem)`}}>
                  {/* Header Row - Dates */}
                  {daysInMonth.map((day) => (
                    <div key={day.toString()} className="flex flex-col items-center justify-end font-semibold text-center gap-1 pb-1">
                      <span className="text-xs text-muted-foreground">{format(day, 'E', { locale: ko })}</span>
                      <span className="font-semibold">{format(day, 'd')}</span>
                    </div>
                  ))}

                  {/* Task Rows */}
                  {tasks.map((task) => (
                    <React.Fragment key={task.id}>
                      {daysInMonth.map((day) => {
                        const dateString = format(day, 'yyyy-MM-dd');
                        const status = records[task.id]?.[dateString] || ' ';
                        const statusLabel = status === 'O' ? '성공' : status === 'X' ? '실패' : '대기 중';

                        return (
                          <TooltipProvider key={`${task.id}-${day.toString()}`} delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex justify-center items-center">
                                  <div
                                    className={cn(
                                      'w-10 h-10 rounded-md flex items-center justify-center font-bold text-lg',
                                      statusStyles[status]
                                    )}
                                  >
                                    {status !== ' ' && status}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{`${task.name} - ${format(day, 'MMM d일', { locale: ko })}`}</p>
                                <p>상태: {statusLabel}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
