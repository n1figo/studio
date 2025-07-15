'use client';

import { useState, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your daily progress at a glance.</p>
      </header>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
              <CardDescription>Horizontally scroll to see all days.</CardDescription>
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
        <CardContent>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="relative">
              <div className="grid gap-2" style={{ gridTemplateColumns: `150px repeat(${daysInMonth.length}, 40px)` }}>
                {/* Header Row */}
                <div className="sticky left-0 z-10 bg-card font-semibold flex items-end">Task</div>
                {daysInMonth.map((day) => (
                  <div key={day.toString()} className="flex flex-col items-center justify-end font-semibold">
                    <span className="text-xs">{format(day, 'E')}</span>
                    <span>{format(day, 'd')}</span>
                  </div>
                ))}
                
                {/* Task Rows */}
                {tasks.map((task) => {
                  const Icon = getIcon(task.icon);
                  return (
                    <>
                      <div key={task.id} className="sticky left-0 z-10 bg-card flex items-center gap-2 text-sm font-medium py-2 pr-2 truncate">
                        <Icon className="w-5 h-5 shrink-0" style={{ color: task.color }} />
                        <span className="truncate">{task.name}</span>
                      </div>
                      {daysInMonth.map((day) => {
                        const dateString = format(day, 'yyyy-MM-dd');
                        const status = records[task.id]?.[dateString] || ' ';
                        const statusLabel = status === 'O' ? 'Success' : status === 'X' ? 'Failed' : 'Pending';
                        
                        return (
                          <TooltipProvider key={`${task.id}-${day.toString()}`} delayDuration={100}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={cn(
                                    'w-10 h-10 rounded-md flex items-center justify-center font-bold text-lg',
                                    statusStyles[status]
                                  )}
                                >
                                  {status !== ' ' && status}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{`${task.name} - ${format(day, 'MMM d')}`}</p>
                                <p>Status: {statusLabel}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })}
                    </>
                  );
                })}
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
