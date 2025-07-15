import type { Task, Post, DailyRecord } from './types';
import { format } from 'date-fns';

export const mockTasks: Task[] = [
  { id: '1', name: 'Read a Book', icon: 'book', color: 'hsl(347, 89%, 60%)', description: 'Read at least 10 pages of a book every day.' },
  { id: '2', name: 'Daily Coding', icon: 'code', color: 'hsl(210, 89%, 60%)', description: 'Solve one coding challenge on LeetCode.' },
  { id: '3', name: 'Workout', icon: 'dumbbell', color: 'hsl(110, 89%, 60%)', description: 'Go to the gym or do a 30-minute home workout.' },
  { id: '4', name: 'Journaling', icon: 'pen-square', color: 'hsl(45, 89%, 60%)', description: 'Write down thoughts and reflections for 15 minutes.' },
  { id: '5', name: 'Learn Spanish', icon: 'plane', color: 'hsl(25, 89%, 60%)', description: 'Complete one Duolingo lesson.' },
  { id: '6', name: 'Meditate', icon: 'heart', color: 'hsl(300, 89%, 60%)', description: 'Practice 10 minutes of mindfulness meditation.'},
];

export const mockPosts: Post[] = [
  { id: 'p1', taskId: '1', title: 'Read "Dune"', content: 'Finished chapter 3. The world-building is incredible.', createdAt: new Date(new Date().setDate(new Date().getDate() - 2)) },
  { id: 'p2', taskId: '2', title: 'Two Sum problem', content: 'Solved it using a hash map. Pretty straightforward.', createdAt: new Date(new Date().setDate(new Date().getDate() - 2)) },
  { id: 'p3', taskId: '1', title: 'Continued "Dune"', content: 'Paul Atreides is a fascinating protagonist.', createdAt: new Date(new Date().setDate(new Date().getDate() - 1)) },
  { id: 'p4', taskId: '3', title: 'Leg Day', content: 'Focused on squats and lunges. Feeling the burn!', createdAt: new Date(new Date().setDate(new Date().getDate() - 1)) },
  { id: 'p5', taskId: '4', title: 'Morning thoughts', content: 'Wrote about my goals for the upcoming week.', createdAt: new Date(new Date().setDate(new Date().getDate() - 1)) },
  { id: 'p6', taskId: '2', title: 'JS Algorithm', content: 'Practiced recursion with a factorial function.', createdAt: new Date() },
  { id: 'p7', taskId: '5', title: 'Travel vocabulary', content: 'Learned new phrases for ordering food.', createdAt: new Date() },
];

export const mockDailyRecords: DailyRecord = mockTasks.reduce((acc, task) => {
  acc[task.id] = {};
  for (let i = 0; i < 31; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Check if a post exists for this task on this date
    const postExists = mockPosts.some(
      (post) => post.taskId === task.id && format(post.createdAt, 'yyyy-MM-dd') === dateString
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
