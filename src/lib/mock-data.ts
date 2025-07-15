import type { Task, Post, DailyRecord } from './types';
import { format, subDays } from 'date-fns';

export const mockTasks: Task[] = [
  { id: '1', name: '책 읽기', icon: 'book', color: 'hsl(347, 89%, 60%)', description: '매일 최소 10페이지의 책을 읽으세요.' },
  { id: '2', name: '데일리 코딩', icon: 'code', color: 'hsl(210, 89%, 60%)', description: 'LeetCode에서 코딩 챌린지 하나를 해결하세요.' },
  { id: '3', name: '운동', icon: 'dumbbell', color: 'hsl(110, 89%, 60%)', description: '헬스장에 가거나 30분 홈 트레이닝을 하세요.' },
  { id: '4', name: '일기 쓰기', icon: 'pen-square', color: 'hsl(45, 89%, 60%)', description: '15분 동안 생각과 성찰을 기록하세요.' },
  { id: '5', name: '스페인어 배우기', icon: 'plane', color: 'hsl(25, 89%, 60%)', description: 'Duolingo 레슨 하나를 완료하세요.' },
  { id: '6', name: '명상하기', icon: 'heart', color: 'hsl(300, 89%, 60%)', description: '10분간 마음챙김 명상을 실천하세요.'},
];

export const mockPosts: Post[] = [
  { id: 'p1', taskId: '1', title: '"듄" 읽기', content: '3장 완료. 세계관이 정말 대단하다.', createdAt: subDays(new Date(), 2).toISOString() },
  { id: 'p2', taskId: '2', title: 'Two Sum 문제', content: '해시 맵을 사용해서 해결했다. 꽤 간단했다.', createdAt: subDays(new Date(), 2).toISOString() },
  { id: 'p3', taskId: '1', title: '"듄" 계속 읽기', content: '폴 아트레이드는 정말 매력적인 주인공이다.', createdAt: subDays(new Date(), 1).toISOString() },
  { id: 'p4', taskId: '3', title: '하체 운동', content: '스쿼트와 런지에 집중했다. 불타는 느낌!', createdAt: subDays(new Date(), 1).toISOString() },
  { id: 'p5', taskId: '4', title: '아침 생각', content: '다가오는 한 주의 목표에 대해 썼다.', createdAt: subDays(new Date(), 1).toISOString() },
  { id: 'p6', taskId: '2', title: 'JS 알고리즘', content: '팩토리얼 함수로 재귀를 연습했다.', createdAt: new Date().toISOString() },
  { id: 'p7', taskId: '5', title: '여행 어휘', content: '음식 주문에 필요한 새로운 표현을 배웠다.', createdAt: new Date().toISOString() },
];

export const mockDailyRecords: DailyRecord = mockTasks.reduce((acc, task) => {
  acc[task.id] = {};
  for (let i = 0; i < 31; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = format(date, 'yyyy-MM-dd');
    
    // Check if a post exists for this task on this date
    const postExists = mockPosts.some(
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
