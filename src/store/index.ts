import { Project, Task, InventoryItem, TeamMember, Activity } from '../types';

const STORAGE_KEYS = {
  projects: 'pf_projects',
  tasks: 'pf_tasks',
  inventory: 'pf_inventory',
  team: 'pf_team',
  activities: 'pf_activities',
};

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Seed data
const seedProjects: Project[] = [
  {
    id: 'p1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern UI/UX',
    status: 'active',
    priority: 'high',
    startDate: '2026-01-15',
    endDate: '2026-04-30',
    budget: 25000,
    spent: 12500,
    teamMembers: ['t1', 't2', 't3'],
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'p2',
    name: 'Mobile App Development',
    description: 'Native mobile application for iOS and Android platforms',
    status: 'active',
    priority: 'critical',
    startDate: '2026-02-01',
    endDate: '2026-08-15',
    budget: 80000,
    spent: 22000,
    teamMembers: ['t1', 't4', 't5'],
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-03-05T00:00:00Z',
  },
  {
    id: 'p3',
    name: 'Office Renovation',
    description: 'Renovate the main office space including new furniture and equipment',
    status: 'planning',
    priority: 'medium',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    budget: 45000,
    spent: 3000,
    teamMembers: ['t2', 't6'],
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },
  {
    id: 'p4',
    name: 'Data Migration',
    description: 'Migrate legacy database systems to cloud infrastructure',
    status: 'on-hold',
    priority: 'high',
    startDate: '2026-03-01',
    endDate: '2026-05-15',
    budget: 15000,
    spent: 5000,
    teamMembers: ['t4', 't5'],
    createdAt: '2026-02-20T00:00:00Z',
    updatedAt: '2026-03-12T00:00:00Z',
  },
];

const seedTasks: Task[] = [
  { id: 'task1', projectId: 'p1', title: 'Design homepage mockup', description: 'Create wireframes and high-fidelity mockups for the new homepage', status: 'done', priority: 'high', assignee: 't2', dueDate: '2026-02-15', createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-02-15T00:00:00Z', tags: ['design', 'ui'] },
  { id: 'task2', projectId: 'p1', title: 'Implement responsive navigation', description: 'Build responsive navigation component with mobile menu', status: 'in-progress', priority: 'high', assignee: 't3', dueDate: '2026-03-20', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z', tags: ['frontend', 'development'] },
  { id: 'task3', projectId: 'p1', title: 'SEO optimization', description: 'Optimize meta tags, structured data, and page speed', status: 'todo', priority: 'medium', assignee: 't1', dueDate: '2026-04-10', createdAt: '2026-02-10T00:00:00Z', updatedAt: '2026-02-10T00:00:00Z', tags: ['seo', 'performance'] },
  { id: 'task4', projectId: 'p2', title: 'Setup React Native project', description: 'Initialize project with proper folder structure and dependencies', status: 'done', priority: 'critical', assignee: 't4', dueDate: '2026-02-10', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-10T00:00:00Z', tags: ['setup', 'mobile'] },
  { id: 'task5', projectId: 'p2', title: 'User authentication flow', description: 'Implement login, registration, and password reset', status: 'in-progress', priority: 'critical', assignee: 't5', dueDate: '2026-03-30', createdAt: '2026-02-15T00:00:00Z', updatedAt: '2026-03-05T00:00:00Z', tags: ['auth', 'backend'] },
  { id: 'task6', projectId: 'p2', title: 'Push notifications', description: 'Integrate push notification service for both platforms', status: 'todo', priority: 'medium', assignee: 't1', dueDate: '2026-05-01', createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z', tags: ['mobile', 'notifications'] },
  { id: 'task7', projectId: 'p3', title: 'Get contractor quotes', description: 'Request and compare quotes from at least 3 contractors', status: 'in-progress', priority: 'high', assignee: 't6', dueDate: '2026-03-25', createdAt: '2026-02-20T00:00:00Z', updatedAt: '2026-03-10T00:00:00Z', tags: ['planning', 'budget'] },
  { id: 'task8', projectId: 'p3', title: 'Select furniture', description: 'Choose office furniture within budget constraints', status: 'todo', priority: 'medium', assignee: 't2', dueDate: '2026-04-15', createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z', tags: ['procurement', 'design'] },
];

const seedInventory: InventoryItem[] = [
  { id: 'inv1', name: 'MacBook Pro 16"', category: 'Electronics', description: 'Apple MacBook Pro for development team', quantity: 5, unit: 'units', costPerUnit: 2499, supplier: 'Apple Inc.', location: 'IT Storage Room', minStock: 2, projectId: 'p1', status: 'in-use', lastUpdated: '2026-03-01T00:00:00Z', createdAt: '2026-01-10T00:00:00Z' },
  { id: 'inv2', name: 'Standing Desk', category: 'Furniture', description: 'Electric adjustable standing desk', quantity: 12, unit: 'units', costPerUnit: 599, supplier: 'OfficePro', location: 'Warehouse A', minStock: 3, projectId: 'p3', status: 'available', lastUpdated: '2026-02-20T00:00:00Z', createdAt: '2026-01-15T00:00:00Z' },
  { id: 'inv3', name: 'Ethernet Cable Cat6', category: 'Networking', description: 'Cat6 ethernet cables, 3m length', quantity: 50, unit: 'meters', costPerUnit: 2.5, supplier: 'NetSupply Co.', location: 'IT Storage Room', minStock: 20, status: 'available', lastUpdated: '2026-03-05T00:00:00Z', createdAt: '2026-01-20T00:00:00Z' },
  { id: 'inv4', name: 'A4 Paper', category: 'Office Supplies', description: 'Standard white A4 paper, 80gsm', quantity: 200, unit: 'reams', costPerUnit: 4.99, supplier: 'PaperWorld', location: 'Supply Closet B', minStock: 50, status: 'available', lastUpdated: '2026-03-10T00:00:00Z', createdAt: '2026-01-05T00:00:00Z' },
  { id: 'inv5', name: 'Projector - Epson 4K', category: 'Electronics', description: 'Epson 4K projector for conference room', quantity: 2, unit: 'units', costPerUnit: 1299, supplier: 'ElectroMart', location: 'Conference Room', minStock: 1, projectId: 'p3', status: 'available', lastUpdated: '2026-02-28T00:00:00Z', createdAt: '2026-02-01T00:00:00Z' },
  { id: 'inv6', name: 'Whiteboard Markers', category: 'Office Supplies', description: 'Assorted color whiteboard markers', quantity: 8, unit: 'packs', costPerUnit: 12.99, supplier: 'OfficeMax', location: 'Supply Closet A', minStock: 10, status: 'ordered', lastUpdated: '2026-03-12T00:00:00Z', createdAt: '2026-01-10T00:00:00Z' },
  { id: 'inv7', name: 'Server Rack 42U', category: 'Infrastructure', description: 'Standard 42U server rack with cooling', quantity: 1, unit: 'units', costPerUnit: 3500, supplier: 'RackSpace Solutions', location: 'Server Room', minStock: 1, projectId: 'p4', status: 'in-use', lastUpdated: '2026-03-01T00:00:00Z', createdAt: '2026-02-15T00:00:00Z' },
  { id: 'inv8', name: 'Safety Helmets', category: 'Safety Equipment', description: 'OSHA-approved construction helmets', quantity: 25, unit: 'units', costPerUnit: 35, supplier: 'SafetyFirst', location: 'Warehouse B', minStock: 10, projectId: 'p3', status: 'available', lastUpdated: '2026-03-08T00:00:00Z', createdAt: '2026-02-20T00:00:00Z' },
];

const seedTeam: TeamMember[] = [
  { id: 't1', name: 'Alex Johnson', email: 'alex@company.com', role: 'Project Manager', avatar: '👨‍💼', skills: ['Agile', 'Scrum', 'Planning'], status: 'active', createdAt: '2025-06-01T00:00:00Z' },
  { id: 't2', name: 'Sarah Chen', email: 'sarah@company.com', role: 'UI/UX Designer', avatar: '👩‍🎨', skills: ['Figma', 'CSS', 'User Research'], status: 'active', createdAt: '2025-07-15T00:00:00Z' },
  { id: 't3', name: 'Mike Rodriguez', email: 'mike@company.com', role: 'Frontend Developer', avatar: '👨‍💻', skills: ['React', 'TypeScript', 'Tailwind'], status: 'active', createdAt: '2025-08-01T00:00:00Z' },
  { id: 't4', name: 'Emily Watson', email: 'emily@company.com', role: 'Backend Developer', avatar: '👩‍💻', skills: ['Node.js', 'Python', 'PostgreSQL'], status: 'away', createdAt: '2025-09-01T00:00:00Z' },
  { id: 't5', name: 'David Kim', email: 'david@company.com', role: 'Mobile Developer', avatar: '🧑‍💻', skills: ['React Native', 'Swift', 'Kotlin'], status: 'active', createdAt: '2025-10-01T00:00:00Z' },
  { id: 't6', name: 'Lisa Park', email: 'lisa@company.com', role: 'Operations Manager', avatar: '👩‍💼', skills: ['Logistics', 'Budgeting', 'Procurement'], status: 'active', createdAt: '2025-11-01T00:00:00Z' },
];

const seedActivities: Activity[] = [
  { id: 'a1', type: 'project', action: 'updated', description: 'Website Redesign status changed to Active', timestamp: '2026-03-12T10:30:00Z', userId: 't1' },
  { id: 'a2', type: 'task', action: 'completed', description: 'Design homepage mockup marked as done', timestamp: '2026-03-12T09:15:00Z', userId: 't2' },
  { id: 'a3', type: 'inventory', action: 'added', description: 'Safety Helmets added to inventory (25 units)', timestamp: '2026-03-11T16:45:00Z', userId: 't6' },
  { id: 'a4', type: 'team', action: 'assigned', description: 'David Kim assigned to Mobile App Development', timestamp: '2026-03-11T14:20:00Z', userId: 't1' },
  { id: 'a5', type: 'project', action: 'created', description: 'New project "Office Renovation" created', timestamp: '2026-03-10T11:00:00Z', userId: 't1' },
];

// Initialize store with seed data if empty
function initStore() {
  if (!localStorage.getItem(STORAGE_KEYS.projects)) {
    save(STORAGE_KEYS.projects, seedProjects);
    save(STORAGE_KEYS.tasks, seedTasks);
    save(STORAGE_KEYS.inventory, seedInventory);
    save(STORAGE_KEYS.team, seedTeam);
    save(STORAGE_KEYS.activities, seedActivities);
  }
}

initStore();

// Generic CRUD operations
export function getAll<T>(key: keyof typeof STORAGE_KEYS): T[] {
  return load<T>(STORAGE_KEYS[key], []);
}

export function add<T extends { id: string }>(key: keyof typeof STORAGE_KEYS, item: T): T {
  const items = load<T>(STORAGE_KEYS[key], []);
  items.push(item);
  save(STORAGE_KEYS[key], items);
  return item;
}

export function update<T extends { id: string }>(key: keyof typeof STORAGE_KEYS, id: string, updates: Partial<T>): T | null {
  const items = load<T>(STORAGE_KEYS[key], []);
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates };
  save(STORAGE_KEYS[key], items);
  return items[index];
}

export function remove(key: keyof typeof STORAGE_KEYS, id: string): boolean {
  const items = load<{ id: string }>(STORAGE_KEYS[key], []);
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;
  save(STORAGE_KEYS[key], filtered);
  return true;
}

export function addActivity(activity: Omit<Activity, 'id'>) {
  const activities = load<Activity>(STORAGE_KEYS.activities, []);
  activities.unshift({ ...activity, id: `a${Date.now()}` });
  save(STORAGE_KEYS.activities, activities.slice(0, 50)); // Keep last 50
}

// Convenience typed getters
export const getProjects = () => getAll<Project>('projects');
export const getTasks = () => getAll<Task>('tasks');
export const getInventory = () => getAll<InventoryItem>('inventory');
export const getTeam = () => getAll<TeamMember>('team');
export const getActivities = () => getAll<Activity>('activities');

export const addProject = (p: Project) => add('projects', p);
export const updateProject = (id: string, u: Partial<Project>) => update('projects', id, u);
export const removeProject = (id: string) => remove('projects', id);

export const addTask = (t: Task) => add('tasks', t);
export const updateTask = (id: string, u: Partial<Task>) => update('tasks', id, u);
export const removeTask = (id: string) => remove('tasks', id);

export const addInventoryItem = (i: InventoryItem) => add('inventory', i);
export const updateInventoryItem = (id: string, u: Partial<InventoryItem>) => update('inventory', id, u);
export const removeInventoryItem = (id: string) => remove('inventory', id);

export const addTeamMember = (m: TeamMember) => add('team', m);
export const updateTeamMember = (id: string, u: Partial<TeamMember>) => update('team', id, u);
export const removeTeamMember = (id: string) => remove('team', id);
