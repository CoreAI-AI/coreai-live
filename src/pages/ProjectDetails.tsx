import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Plus, 
  FolderKanban, 
  Calendar,
  CheckCircle2,
  Circle,
  Trash2,
  MoreVertical
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  status: 'active' | 'completed' | 'paused';
  tasks: Task[];
}

// Sample projects data (would come from database in real app)
const projectsData: Record<string, Project> = {
  '1': {
    id: '1',
    name: 'Website Redesign',
    description: 'Redesign the company website with modern UI',
    createdAt: '2024-01-15',
    status: 'active',
    tasks: [
      { id: 't1', title: 'Create wireframes', completed: true, createdAt: '2024-01-15' },
      { id: 't2', title: 'Design homepage mockup', completed: true, createdAt: '2024-01-16' },
      { id: 't3', title: 'Implement responsive layout', completed: false, createdAt: '2024-01-17' },
      { id: 't4', title: 'Add animations', completed: false, createdAt: '2024-01-18' },
    ]
  },
  '2': {
    id: '2',
    name: 'Mobile App',
    description: 'Build a cross-platform mobile application',
    createdAt: '2024-01-10',
    status: 'active',
    tasks: [
      { id: 't5', title: 'Setup React Native project', completed: true, createdAt: '2024-01-10' },
      { id: 't6', title: 'Create navigation structure', completed: false, createdAt: '2024-01-11' },
      { id: 't7', title: 'Implement authentication', completed: false, createdAt: '2024-01-12' },
    ]
  },
  '3': {
    id: '3',
    name: 'API Integration',
    description: 'Integrate third-party APIs for payment processing',
    createdAt: '2024-01-05',
    status: 'completed',
    tasks: [
      { id: 't8', title: 'Research payment APIs', completed: true, createdAt: '2024-01-05' },
      { id: 't9', title: 'Implement Stripe integration', completed: true, createdAt: '2024-01-06' },
      { id: 't10', title: 'Add error handling', completed: true, createdAt: '2024-01-07' },
    ]
  }
};

const ProjectDetails = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [project, setProject] = useState<Project | null>(
    projectId ? projectsData[projectId] || null : null
  );
  const [newTaskTitle, setNewTaskTitle] = useState("");

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/');
    return null;
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Project not found</h3>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const completedTasks = project.tasks.filter(t => t.completed).length;
  const totalTasks = project.tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const toggleTask = (taskId: string) => {
    setProject({
      ...project,
      tasks: project.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    });
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: `t${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setProject({
      ...project,
      tasks: [...project.tasks, newTask]
    });
    setNewTaskTitle("");
  };

  const deleteTask = (taskId: string) => {
    setProject({
      ...project,
      tasks: project.tasks.filter(task => task.id !== taskId)
    });
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500';
      case 'completed': return 'bg-blue-500/20 text-blue-500';
      case 'paused': return 'bg-yellow-500/20 text-yellow-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/projects')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-73px)]">
        <div className="max-w-4xl mx-auto p-6">
          {/* Project Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                <FolderKanban className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-muted-foreground">{project.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-lg p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Progress</h2>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">{completedTasks}</span>
                <span className="text-muted-foreground">/ {totalTasks} tasks</span>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {progressPercentage.toFixed(0)}% complete
            </p>
          </motion.div>

          {/* Tasks Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
            </div>

            {/* Add Task Input */}
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Add a new task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                className="flex-1"
              />
              <Button onClick={addTask} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Tasks List */}
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {project.tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors group ${
                      task.completed 
                        ? 'bg-muted/30 border-border/50' 
                        : 'bg-background border-border hover:border-primary/30'
                    }`}
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${
                        task.completed 
                          ? 'text-muted-foreground line-through' 
                          : 'text-foreground'
                      }`}>
                        {task.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.completed && (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {project.tasks.length === 0 && (
                <div className="text-center py-8">
                  <Circle className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No tasks yet. Add your first task above!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProjectDetails;