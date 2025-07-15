'use client';
import { useState } from 'react';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { mockTasks } from '@/lib/mock-data';
import { getIcon, iconList } from '@/lib/icons';
import type { Task } from '@/lib/types';
import { AiProjectDiscoverer } from '@/components/ai-project-discoverer';

const colorPresets = [
  'hsl(347, 89%, 60%)', 'hsl(210, 89%, 60%)', 'hsl(110, 89%, 60%)',
  'hsl(45, 89%, 60%)', 'hsl(25, 89%, 60%)', 'hsl(300, 89%, 60%)',
  'hsl(180, 89%, 60%)', 'hsl(270, 89%, 60%)',
];

export default function ManageTasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    toast({ title: 'Task Deleted', description: 'The task has been successfully removed.' });
  };
  
  const handleSave = (taskData: Omit<Task, 'id'> & { id?: string }) => {
    if (taskData.id) {
      // Edit existing task
      setTasks(tasks.map(t => t.id === taskData.id ? { ...t, ...taskData } : t));
      toast({ title: 'Task Updated', description: 'Your task has been saved.' });
    } else {
      // Add new task
      const newTask = { ...taskData, id: new Date().toISOString() };
      setTasks([...tasks, newTask]);
      toast({ title: 'Task Created', description: 'Your new task is ready.' });
    }
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Tasks</h1>
          <p className="text-muted-foreground">Create, edit, and organize your custom tasks.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> Add New Task
            </Button>
          </DialogTrigger>
          <TaskFormDialog
            task={editingTask}
            onSave={handleSave}
            onClose={() => setIsDialogOpen(false)}
          />
        </Dialog>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => {
          const Icon = getIcon(task.icon);
          return (
            <Card key={task.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <span className="p-3 rounded-lg" style={{ backgroundColor: `${task.color}20` }}>
                  <Icon className="h-6 w-6" style={{ color: task.color }} />
                </span>
                <div className="flex-1">
                  <CardTitle>{task.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{task.description || 'No description'}</CardDescription>
                </div>
              </CardHeader>
              <CardFooter className="mt-auto flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(task)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(task.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function TaskFormDialog({
  task,
  onSave,
  onClose,
}: {
  task: Task | null;
  onSave: (taskData: Omit<Task, 'id'> & { id?: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(task?.name || '');
  const [description, setDescription] = useState(task?.description || '');
  const [icon, setIcon] = useState(task?.icon || 'pen-square');
  const [color, setColor] = useState(task?.color || colorPresets[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSave({ id: task?.id, name, description, icon, color });
  };
  
  const IconComponent = getIcon(icon);

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogDescription>
          {task ? 'Update the details of your task.' : 'Create a new task to track your progress.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
        <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Task Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Daily Workout" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your task..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select value={icon} onValueChange={setIcon}>
                  <SelectTrigger id="icon">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5" style={{ color }}/>
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {iconList.map((iconName) => {
                      const ListItemIcon = getIcon(iconName);
                      return (
                        <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center gap-2">
                            <ListItemIcon className="h-5 w-5 text-muted-foreground" />
                            <span>{iconName.replace(/-/g, ' ')}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="grid grid-cols-4 gap-2">
                  {colorPresets.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant="outline"
                      size="icon"
                      className={`h-9 w-9 ${color === preset ? 'ring-2 ring-ring ring-offset-2' : ''}`}
                      style={{ backgroundColor: preset }}
                      onClick={() => setColor(preset)}
                    />
                  ))}
                </div>
              </div>
            </div>
        </div>
        <div className="space-y-4">
            <AiProjectDiscoverer taskDescription={description} />
        </div>
      </form>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </DialogClose>
        <Button type="submit" onClick={handleSubmit}>Save Task</Button>
      </DialogFooter>
    </DialogContent>
  );
}

