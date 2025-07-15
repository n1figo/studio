import {
  Book,
  Code,
  Dumbbell,
  Heart,
  Plane,
  PenSquare,
  BrainCircuit,
  type LucideIcon,
  Star,
  Plus,
  Settings,
  Home,
  Menu,
} from 'lucide-react';

export const taskIcons: { [key: string]: LucideIcon } = {
  book: Book,
  code: Code,
  dumbbell: Dumbbell,
  heart: Heart,
  plane: Plane,
  'pen-square': PenSquare,
  'brain-circuit': BrainCircuit,
  star: Star,
  plus: Plus,
  settings: Settings,
  home: Home,
  menu: Menu,
};

export const getIcon = (name?: string): LucideIcon => {
  if (!name) return PenSquare;
  return taskIcons[name] || PenSquare;
};

export const iconList = Object.keys(taskIcons).filter(
  (key) => !['plus', 'settings', 'home', 'menu', 'star'].includes(key)
);
