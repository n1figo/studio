import type { LucideIcon } from 'lucide-react';

export type Task = {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
};

export type Post = {
  id: string;
  taskId: string;
  title: string;
  content: string;
  createdAt: string;
};

export type DailyStatus = 'O' | 'X' | ' ';

export type DailyRecord = {
  [taskId: string]: {
    [date: string]: DailyStatus;
  };
};
