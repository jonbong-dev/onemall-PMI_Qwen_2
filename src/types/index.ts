export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  teamMembers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  location: string;
  minStock: number;
  projectId?: string;
  status: 'available' | 'in-use' | 'depleted' | 'ordered';
  lastUpdated: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  skills: string[];
  status: 'active' | 'away' | 'offline';
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'project' | 'task' | 'inventory' | 'team';
  action: string;
  description: string;
  timestamp: string;
  userId: string;
}
