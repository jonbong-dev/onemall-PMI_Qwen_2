import { useMemo } from 'react';
import { FolderKanban, Package, Users, AlertTriangle, TrendingUp, Clock, CheckCircle2, DollarSign } from 'lucide-react';
import { getProjects, getTasks, getInventory, getTeam, getActivities } from '../store';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const projects = getProjects();
  const tasks = getTasks();
  const inventory = getInventory();
  const team = getTeam();
  const activities = getActivities();

  const stats = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'done').length;
    const lowStockItems = inventory.filter((i) => i.quantity <= i.minStock).length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
    const overdueTasks = tasks.filter((t) => t.status !== 'done' && new Date(t.dueDate) < new Date()).length;

    return { activeProjects, totalTasks, completedTasks, lowStockItems, totalBudget, totalSpent, overdueTasks };
  }, [projects, tasks, inventory]);

  const taskStats = useMemo(() => {
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const review = tasks.filter((t) => t.status === 'review').length;
    const done = tasks.filter((t) => t.status === 'done').length;
    return { todo, inProgress, review, done };
  }, [tasks]);

  const getTeamMember = (id: string) => team.find((m) => m.id === id);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FolderKanban} label="Active Projects" value={stats.activeProjects} color="blue" subtitle={`${projects.length} total`} />
        <StatCard icon={CheckCircle2} label="Tasks Completed" value={stats.completedTasks} color="green" subtitle={`of ${stats.totalTasks} total`} />
        <StatCard icon={AlertTriangle} label="Low Stock Items" value={stats.lowStockItems} color={stats.lowStockItems > 0 ? 'red' : 'gray'} subtitle="Need reorder" />
        <StatCard icon={Users} label="Team Members" value={team.length} color="purple" subtitle={`${team.filter((m) => m.status === 'active').length} active`} />
      </div>

      {/* Budget & Task Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign size={18} className="text-green-600" />
              Budget Overview
            </h3>
            <span className="text-sm text-gray-500">
              {((stats.totalSpent / stats.totalBudget) * 100).toFixed(0)}% used
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Budget</span>
              <span className="font-semibold">${stats.totalBudget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Spent</span>
              <span className="font-semibold text-orange-600">${stats.totalSpent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Remaining</span>
              <span className="font-semibold text-green-600">${(stats.totalBudget - stats.totalSpent).toLocaleString()}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.totalSpent / stats.totalBudget) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Per project budget */}
          <div className="mt-4 space-y-2">
            {projects.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-32 truncate">{p.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${p.spent / p.budget > 0.8 ? 'bg-red-400' : 'bg-blue-400'}`}
                    style={{ width: `${Math.min((p.spent / p.budget) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-12 text-right">{Math.round((p.spent / p.budget) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              Task Status
            </h3>
            {stats.overdueTasks > 0 && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                {stats.overdueTasks} overdue
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TaskStatusCard label="To Do" count={taskStats.todo} color="gray" />
            <TaskStatusCard label="In Progress" count={taskStats.inProgress} color="blue" />
            <TaskStatusCard label="In Review" count={taskStats.review} color="yellow" />
            <TaskStatusCard label="Done" count={taskStats.done} color="green" />
          </div>

          {/* Recent tasks */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">UPCOMING DEADLINES</p>
            <div className="space-y-2">
              {tasks
                .filter((t) => t.status !== 'done')
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .slice(0, 3)
                .map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate flex-1">{t.title}</span>
                    <span className={`text-xs ml-2 whitespace-nowrap ${new Date(t.dueDate) < new Date() ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section: Inventory alerts + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Package size={18} className="text-orange-600" />
            Inventory Alerts
          </h3>
          {inventory.filter((i) => i.quantity <= i.minStock).length === 0 ? (
            <p className="text-sm text-gray-500">All items are well-stocked!</p>
          ) : (
            <div className="space-y-2">
              {inventory
                .filter((i) => i.quantity <= i.minStock)
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-100">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">{item.quantity} {item.unit}</p>
                      <p className="text-xs text-gray-500">Min: {item.minStock}</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Clock size={18} className="text-purple-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {activities.slice(0, 6).map((activity) => {
              const member = getTeamMember(activity.userId);
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">
                    {member?.avatar || '👤'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{activity.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {member?.name} · {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, subtitle }: { icon: any; label: string; value: number; color: string; subtitle: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-100',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className={`w-11 h-11 rounded-lg border flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function TaskStatusCard({ label, count, color }: { label: string; count: number; color: string }) {
  const colors: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-amber-100 text-amber-700',
    green: 'bg-green-100 text-green-700',
  };

  return (
    <div className={`p-3 rounded-lg ${colors[color]}`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs font-medium">{label}</p>
    </div>
  );
}
