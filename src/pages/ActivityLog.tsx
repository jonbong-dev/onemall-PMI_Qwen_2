import { getActivities, getTeam } from '../store';
import { formatDistanceToNow } from 'date-fns';
import { FolderKanban, CheckSquare, Package, Users, Filter } from 'lucide-react';
import { useState } from 'react';

export default function ActivityLog() {
  const activities = getActivities();
  const team = getTeam();
  const [filterType, setFilterType] = useState<string>('all');

  const getTeamMember = (id: string) => team.find((m) => m.id === id);

  const filtered = filterType === 'all' ? activities : activities.filter((a) => a.type === filterType);

  const typeIcons: Record<string, any> = {
    project: FolderKanban,
    task: CheckSquare,
    inventory: Package,
    team: Users,
  };

  const typeColors: Record<string, string> = {
    project: 'bg-blue-100 text-blue-600',
    task: 'bg-green-100 text-green-600',
    inventory: 'bg-orange-100 text-orange-600',
    team: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter size={16} className="text-gray-400" />
        <div className="flex gap-2 flex-wrap">
          {['all', 'project', 'task', 'inventory', 'team'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filtered.map((activity, index) => {
            const member = getTeamMember(activity.userId);
            const Icon = typeIcons[activity.type] || FolderKanban;
            return (
              <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[activity.type]}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{member?.avatar || '👤'}</span>
                      <span className="text-xs text-gray-500">{member?.name || 'Unknown'}</span>
                    </div>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${typeColors[activity.type]}`}>
                      {activity.type}
                    </span>
                  </div>
                </div>
                {index === 0 && (
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium flex-shrink-0">Latest</span>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No activity found</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Activity log keeps the last 50 entries. Data is stored locally in your browser using localStorage.
          For a multi-user setup, consider connecting to a free database like Supabase (free tier: 500MB).
        </p>
      </div>
    </div>
  );
}
