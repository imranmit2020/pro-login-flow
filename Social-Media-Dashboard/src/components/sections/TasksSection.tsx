"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle, Clock, AlertTriangle, Calendar, User, Phone, Bot, RefreshCw, Loader2, X } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Static tasks array removed - now using real data from Supabase

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-500/20 text-red-400 border-red-500/30 dark:bg-red-500/30 dark:text-red-300";
    case "medium": return "bg-orange-500/20 text-orange-400 border-orange-500/30 dark:bg-orange-500/30 dark:text-orange-300";
    case "low": return "bg-green-500/20 text-green-400 border-green-500/30 dark:bg-green-500/30 dark:text-green-300";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed": return <CheckCircle className="w-4 h-4 text-green-600" />;
    case "in-progress": return <Clock className="w-4 h-4 text-orange-600" />;
    case "pending": return <AlertTriangle className="w-4 h-4 text-red-600" />;
    default: return <Clock className="w-4 h-4 text-gray-600" />;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Call Summary": return <Phone className="w-4 h-4" />;
    case "Patient Care": return <User className="w-4 h-4" />;
    case "Operations": return <AlertTriangle className="w-4 h-4" />;
    case "Administration": return <Calendar className="w-4 h-4" />;
    case "Training": return <CheckCircle className="w-4 h-4" />;
    case "Communication": return <Bot className="w-4 h-4" />;
    default: return <Clock className="w-4 h-4" />;
  }
};

export function TasksSection() {
  const { transformedTasks, loading, error, fetchTasks, createTask, updateTaskStatus } = useTasks();
  const [filter, setFilter] = useState("all");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    from_email: '',
    task_name: '',
    task_purpose: '',
    due_date: ''
  });
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  
  const filteredTasks = transformedTasks.filter(task => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const taskStats = {
    total: transformedTasks.length,
    pending: transformedTasks.filter(t => t.status === "pending").length,
    completed: transformedTasks.filter(t => t.status === "completed").length,
  };

  const handleRefresh = async () => {
    await fetchTasks();
  };

  const handleCreateTask = async () => {
    if (!newTaskForm.from_email || !newTaskForm.task_name || !newTaskForm.task_purpose) {
      return;
    }

    setIsCreatingTask(true);
    try {
      const taskData = {
        from_email: newTaskForm.from_email,
        task_name: newTaskForm.task_name,
        task_purpose: newTaskForm.task_purpose,
        ...(newTaskForm.due_date && { due_date: newTaskForm.due_date })
      };
      await createTask(taskData);
      setShowAddTaskModal(false);
      setNewTaskForm({ from_email: '', task_name: '', task_purpose: '', due_date: '' });
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    setUpdatingTaskId(taskId);
    try {
      await updateTaskStatus(taskId, 'completed');
    } catch (error) {
      console.error('Failed to complete task:', error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleReopenTask = async (taskId: string) => {
    setUpdatingTaskId(taskId);
    try {
      await updateTaskStatus(taskId, 'pending');
    } catch (error) {
      console.error('Failed to reopen task:', error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage your dental practice tasks and call summaries efficiently</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddTaskModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading tasks...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {!loading && !error && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Total Tasks</p>
                <p className="text-2xl font-bold text-foreground">{taskStats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-400 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-foreground">{taskStats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-500/10 border-green-500/20 hover:bg-green-500/20 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-foreground">{taskStats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Filter Buttons */}
      {!loading && !error && (
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "completed"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status === "all" ? "All Tasks" : status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>
      )}

      {/* Tasks List */}
      {!loading && !error && (
      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No tasks found</p>
                <p className="text-sm">
                  {filter === "all" 
                    ? "No tasks have been created yet. Add your first task to get started." 
                    : `No ${filter.replace("-", " ")} tasks found. Try a different filter.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(task.status)}
                    <div className="p-1 rounded-full bg-muted">
                      {getCategoryIcon(task.category)}
                    </div>
                    <h3 className="font-semibold text-lg text-foreground">{task.title}</h3>
                    <Badge className={getPriorityColor(task.priority)} variant="outline">
                      {task.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-3">{task.description}</p>
                  
                  {/* Task metadata */}
                  <div className="bg-muted/50 rounded-md p-3 mb-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        From: {task.from_email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Created: {new Date(task.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {task.assignedTo}
                    </div>
                    <Badge variant="secondary">{task.category}</Badge>
                  </div>
                </div>
                
                <div className="ml-6 flex flex-col gap-2">
                  {task.status === 'pending' ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCompleteTask(task.id)}
                      disabled={updatingTaskId === task.id}
                      className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                    >
                      {updatingTaskId === task.id ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      Complete
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReopenTask(task.id)}
                      disabled={updatingTaskId === task.id}
                      className="bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
                    >
                      {updatingTaskId === task.id ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      Reopen
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )))}
      </div>
      )}



      {/* Add Task Modal */}
      <Dialog open={showAddTaskModal} onOpenChange={setShowAddTaskModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task to track your dental practice activities.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="from_email">From Email</Label>
              <Input
                id="from_email"
                type="email"
                placeholder="Enter your email"
                value={newTaskForm.from_email}
                onChange={(e) => setNewTaskForm(prev => ({ ...prev, from_email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task_name">Task Name</Label>
              <Input
                id="task_name"
                placeholder="Enter task name"
                value={newTaskForm.task_name}
                onChange={(e) => setNewTaskForm(prev => ({ ...prev, task_name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task_purpose">Task Purpose</Label>
              <Textarea
                id="task_purpose"
                placeholder="Describe the purpose of this task"
                value={newTaskForm.task_purpose}
                onChange={(e) => setNewTaskForm(prev => ({ ...prev, task_purpose: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="due_date">Due Date (Optional)</Label>
              <Input
                id="due_date"
                type="date"
                value={newTaskForm.due_date}
                onChange={(e) => setNewTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTaskModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTask}
              disabled={isCreatingTask || !newTaskForm.from_email || !newTaskForm.task_name || !newTaskForm.task_purpose}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isCreatingTask ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}