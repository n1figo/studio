
'use client';
import React, { useState, useMemo } from 'react';
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
import { mockTasks, mockDailyRecords } from '@/lib/mock-data';
import { getIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { DailyStatus } from '@/lib/types';

const statusStyles: { [key in DailyStatus]: string } = {
  'O': 'bg-green-300 dark:bg-green-800 text-green-900 dark:text-green-200',
  'X': 'bg-red-300 dark:bg-red-800 text-red-900 dark:text-red-200',
  ' ': 'bg-muted/50',
};

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const tasks = mockTasks;
  const records = mockDailyRecords;

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
