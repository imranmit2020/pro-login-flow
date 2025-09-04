import { useState, useEffect, useCallback } from 'react';

export interface Task {
  id: string;
  from_email: string;
  task_name: string;
  task_purpose: string;
  status: 'pending' | 'completed';
  due_date?: string;
  created_at: string;
}

export interface TransformedTask {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  assignedTo: string;
  category: string;
  from_email: string;
  created_at: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tasks');
      }
      
      setTasks(data.tasks || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData: {
    from_email: string;
    task_name: string;
    task_purpose: string;
    due_date?: string;
  }) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task');
      }
      
      // Refresh tasks after creating a new one
      await fetchTasks();
      
      return data.task;
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  }, [fetchTasks]);

  const updateTaskStatus = useCallback(async (taskId: string, newStatus: 'pending' | 'completed') => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task status');
      }
      
      // Refresh tasks after updating status
      await fetchTasks();
      
      return data.task;
    } catch (err) {
      console.error('Error updating task status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task status');
      throw err;
    }
  }, [fetchTasks]);

  // Transform tasks to match the existing component format
  const transformedTasks: TransformedTask[] = tasks.map((task) => ({
    id: task.id,
    title: task.task_name,
    description: task.task_purpose,
    priority: 'medium' as const, // Default priority since not in DB
    status: task.status, // Use real status from DB
    dueDate: task.due_date || new Date(task.created_at).toISOString().split('T')[0], // Use due_date if available, otherwise created_at
    assignedTo: task.from_email, // Use from_email as assignee
    category: 'General', // Default category since not in DB
    from_email: task.from_email,
    created_at: task.created_at,
  }));

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    transformedTasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTaskStatus,
  };
} 