import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, DollarSign, Users, Edit2, CheckCircle, Circle, Clock, Eye } from 'lucide-react';
import Modal from '../components/Modal';
import { getProjects, getTasks, getTeam, updateTask, addTask, removeTask, updateProject, addActivity } from '../store';
import { Task } from '../types';
import { v4 as uuid } from 'uuid';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [tasks, setTasks] = useState(getTasks());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditProject, setShowEditProject] = useState(false);

  const project = getProjects().find((p) => p.id === id);
  const team = getTeam();
  const projectTasks = tasks.filter((t) => t.projectId === id);

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <Link to="/projects" className="text-blue-600 text-sm mt-2 inline-block">← Back to Projects</Link>
      </div>
    );
  }

  const columns = [
    { key: 'todo', label: 'To Do', icon: Circle, color: 'gray' },
    { key: 'in-progress', label: 'In Progress', icon: Clock, color: 'blue' },
    { key: 'review', label: 'In Review', icon: Eye, color: 'yellow' },
    { key: 'done', label: 'Done', icon: CheckCircle, color: 'green' },
  ];

  const handleTaskSave = (data: Partial<Task>) => {
    if (editingTask) {
      updateTask(editingTask.id, { ...data, updatedAt: new Date().toISOString() });
    } else {
      const newTask: Task = {
        id: uuid(),
        projectId: project.id,
        title: data.title || '',
        description: data.description || '',
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        assignee: data.assignee || '',
        dueDate: data.dueDate || '',
        tags: data.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addTask(newTask);
    }
    addActivity({ type: 'task', action: editingTask ? 'updated' : 'created', description: `Task "${data.title}" ${editingTask ? 'updated' : 'created'} in ${project.name}`, timestamp: new Date().toISOString(), userId: 't1' });
    setTasks(getTasks());
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Delete this task?')) {
      removeTask(taskId);
      setTasks(getTasks());
    }
  };

  const handleBudgetUpdate = (newSpent: number) => {
    updateProject(project.id, { spent: newSpent, updatedAt: new Date().toISOString() });
  };

  const statusColors: Record<string, string> = {
    gray: 'border-gray-200 bg-gray-50',
    blue: 'border-blue-200 bg-blue-50',
    yellow: 'border-amber-200 bg-amber-50',
    green: 'border-green-200 bg-green-50',
  };

  const headerColors: Record<string, string> = {
    gray: 'text-gray-700',
    blue: 'text-blue-700',
    yellow: 'text-amber-700',
    green: 'text-green-700',
  };

  const completedTasks = projectTasks.filter((t) => t.status === 'done').length;
  const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} />
        Back to Projects
      </Link>

      {/* Project Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
            <p className="text-gray-500 mt-1">{project.description}</p>
          </div>
          <button
            onClick={() => setShowEditProject(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit2 size={14} />
            Edit
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Timeline</p>
              <p className="text-sm font-medium">{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Budget</p>
              <p className="text-sm font-medium">${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Team</p>
              <p className="text-sm font-medium">{project.teamMembers.length} members</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Progress</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Team avatars */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">Team:</span>
          <div className="flex -space-x-2">
            {project.teamMembers.map((mId) => {
              const member = team.find((m) => m.id === mId);
              return member ? (
                <div key={mId} className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs" title={member.name}>
                  {member.avatar}
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>

      {/* Task Board */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Tasks ({projectTasks.length})</h2>
        <button
          onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} />
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = projectTasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className={`rounded-xl border-2 ${statusColors[col.color]} p-3`}>
              <div className={`flex items-center gap-2 mb-3 px-1 ${headerColors[col.color]}`}>
                <col.icon size={14} />
                <span className="text-sm font-semibold">{col.label}</span>
                <span className="text-xs bg-white/80 px-1.5 py-0.5 rounded-full">{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map((task) => {
                  const assignee = team.find((m) => m.id === task.assignee);
                  const isOverdue = task.status !== 'done' && new Date(task.dueDate) < new Date();
                  return (
                    <div key={task.id} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setEditingTask(task); setShowTaskModal(true); }}>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-gray-800 line-clamp-2">{task.title}</h4>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }} className="text-gray-300 hover:text-red-500 flex-shrink-0">
                          ×
                        </button>
                      </div>
                      {task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                        <div className="flex items-center gap-1">
                          {assignee && <span className="text-xs">{assignee.avatar}</span>}
                          {task.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{tag}</span>
                          ))}
                        </div>
                        <span className={`text-[10px] ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      <Modal isOpen={showTaskModal} onClose={() => { setShowTaskModal(false); setEditingTask(null); }} title={editingTask ? 'Edit Task' : 'New Task'}>
        <TaskForm task={editingTask} team={team} onSave={handleTaskSave} onCancel={() => { setShowTaskModal(false); setEditingTask(null); }} />
      </Modal>

      {/* Edit Project Modal */}
      <Modal isOpen={showEditProject} onClose={() => setShowEditProject(false)} title="Edit Project" size="lg">
        <ProjectEditForm project={project} team={team} onSave={(data) => { updateProject(project.id, { ...data, updatedAt: new Date().toISOString() }); setShowEditProject(false); }} onCancel={() => setShowEditProject(false)} onBudgetUpdate={handleBudgetUpdate} />
      </Modal>
    </div>
  );
}

function TaskForm({ task, team, onSave, onCancel }: { task: Task | null; team: any[]; onSave: (data: Partial<Task>) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<Task['status']>(task?.status || 'todo');
  const [priority, setPriority] = useState<Task['priority']>(task?.priority || 'medium');
  const [assignee, setAssignee] = useState(task?.assignee || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [tags, setTags] = useState(task?.tags?.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description, status, priority, assignee, dueDate, tags: tags.split(',').map((t) => t.trim()).filter(Boolean) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Task['status'])} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">In Review</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
            <option value="">Unassigned</option>
            {team.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="frontend, design, urgent" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">{task ? 'Update' : 'Create'} Task</button>
      </div>
    </form>
  );
}

function ProjectEditForm({ project, team, onSave, onCancel, onBudgetUpdate }: { project: any; team: any[]; onSave: (data: any) => void; onCancel: () => void; onBudgetUpdate: (spent: number) => void }) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [status, setStatus] = useState(project.status);
  const [priority, setPriority] = useState(project.priority);
  const [startDate, setStartDate] = useState(project.startDate);
  const [endDate, setEndDate] = useState(project.endDate);
  const [budget, setBudget] = useState(project.budget.toString());
  const [spent, setSpent] = useState(project.spent.toString());
  const [teamMembers, setTeamMembers] = useState<string[]>(project.teamMembers);

  const toggleMember = (id: string) => {
    setTeamMembers((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBudgetUpdate(Number(spent) || 0);
    onSave({ name, description, status, priority, startDate, endDate, budget: Number(budget) || 0, teamMembers });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
          <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Spent ($)</label>
          <input type="number" value={spent} onChange={(e) => setSpent(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>
        <div className="flex flex-wrap gap-2">
          {team.map((m) => (
            <button key={m.id} type="button" onClick={() => toggleMember(m.id)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${teamMembers.includes(m.id) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
              <span>{m.avatar}</span>{m.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save Changes</button>
      </div>
    </form>
  );
}
