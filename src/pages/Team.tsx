import { useState } from 'react';
import { Plus, Search, Mail, Briefcase, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import { getTeam, getProjects, getTasks, addTeamMember, updateTeamMember, removeTeamMember, addActivity } from '../store';
import { TeamMember } from '../types';
import { v4 as uuid } from 'uuid';

export default function Team() {
  const [team, setTeam] = useState(getTeam());
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const projects = getProjects();
  const tasks = getTasks();

  const filtered = team.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const getMemberStats = (memberId: string) => {
    const assignedProjects = projects.filter((p) => p.teamMembers.includes(memberId)).length;
    const assignedTasks = tasks.filter((t) => t.assignee === memberId).length;
    const completedTasks = tasks.filter((t) => t.assignee === memberId && t.status === 'done').length;
    return { assignedProjects, assignedTasks, completedTasks };
  };

  const handleSave = (data: Partial<TeamMember>) => {
    if (editingMember) {
      updateTeamMember(editingMember.id, data);
    } else {
      const newMember: TeamMember = {
        id: uuid(),
        name: data.name || '',
        email: data.email || '',
        role: data.role || '',
        avatar: data.avatar || '👤',
        skills: data.skills || [],
        status: data.status || 'active',
        createdAt: new Date().toISOString(),
      };
      addTeamMember(newMember);
      addActivity({ type: 'team', action: 'added', description: `${data.name} joined the team as ${data.role}`, timestamp: new Date().toISOString(), userId: 't1' });
    }
    setTeam(getTeam());
    setShowModal(false);
    setEditingMember(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this team member?')) {
      removeTeamMember(id);
      setTeam(getTeam());
    }
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-400',
    away: 'bg-yellow-400',
    offline: 'bg-gray-400',
  };

  const avatars = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎨', '👩‍🎨', '🧑‍🔧', '👨‍🔬', '👩‍🔬'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => { setEditingMember(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Member
        </button>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((member) => {
          const stats = getMemberStats(member.id);
          return (
            <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-2xl">
                      {member.avatar}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${statusColors[member.status]}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{member.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Briefcase size={12} />
                      {member.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditingMember(member); setShowModal(true); }} className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 mt-3 text-sm text-gray-500">
                <Mail size={12} />
                <span className="truncate">{member.email}</span>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mt-3">
                {member.skills.map((skill) => (
                  <span key={skill} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{skill}</span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800">{stats.assignedProjects}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Projects</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-800">{stats.assignedTasks}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">{stats.completedTasks}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Done</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">No team members found</div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingMember(null); }} title={editingMember ? 'Edit Member' : 'Add Team Member'}>
        <TeamForm member={editingMember} avatars={avatars} onSave={handleSave} onCancel={() => { setShowModal(false); setEditingMember(null); }} />
      </Modal>
    </div>
  );
}

function TeamForm({ member, avatars, onSave, onCancel }: { member: TeamMember | null; avatars: string[]; onSave: (data: Partial<TeamMember>) => void; onCancel: () => void }) {
  const [name, setName] = useState(member?.name || '');
  const [email, setEmail] = useState(member?.email || '');
  const [role, setRole] = useState(member?.role || '');
  const [avatar, setAvatar] = useState(member?.avatar || '👤');
  const [skills, setSkills] = useState(member?.skills?.join(', ') || '');
  const [status, setStatus] = useState<TeamMember['status']>(member?.status || 'active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, email, role, avatar, skills: skills.split(',').map((s) => s.trim()).filter(Boolean), status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
        <div className="flex flex-wrap gap-2">
          {avatars.map((a) => (
            <button key={a} type="button" onClick={() => setAvatar(a)} className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 transition-colors ${avatar === a ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              {a}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as TeamMember['status'])} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="active">Active</option>
            <option value="away">Away</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
        <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Design, Planning" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">{member ? 'Update' : 'Add'} Member</button>
      </div>
    </form>
  );
}
