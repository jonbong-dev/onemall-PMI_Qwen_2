import { useState } from 'react';
import { Plus, Search, Filter, Package, AlertTriangle, Edit2, Trash2, ArrowUpDown } from 'lucide-react';
import Modal from '../components/Modal';
import { getInventory, getProjects, addInventoryItem, updateInventoryItem, removeInventoryItem, addActivity } from '../store';
import { InventoryItem } from '../types';
import { v4 as uuid } from 'uuid';

export default function Inventory() {
  const [inventory, setInventory] = useState(getInventory());
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'cost'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const projects = getProjects();
  const categories = [...new Set(inventory.map((i) => i.category))];

  const filtered = inventory
    .filter((i) => {
      const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()) || i.supplier.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === 'all' || i.category === filterCategory;
      const matchStatus = filterStatus === 'all' || i.status === filterStatus;
      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'quantity') return a.quantity - b.quantity;
      return (b.quantity * b.costPerUnit) - (a.quantity * a.costPerUnit);
    });

  const totalValue = inventory.reduce((sum, i) => sum + i.quantity * i.costPerUnit, 0);
  const lowStockCount = inventory.filter((i) => i.quantity <= i.minStock).length;
  const totalItems = inventory.reduce((sum, i) => sum + i.quantity, 0);

  const handleSave = (data: Partial<InventoryItem>) => {
    if (editingItem) {
      updateInventoryItem(editingItem.id, { ...data, lastUpdated: new Date().toISOString() });
      addActivity({ type: 'inventory', action: 'updated', description: `Inventory item "${data.name}" updated`, timestamp: new Date().toISOString(), userId: 't1' });
    } else {
      const newItem: InventoryItem = {
        id: uuid(),
        name: data.name || '',
        category: data.category || '',
        description: data.description || '',
        quantity: data.quantity || 0,
        unit: data.unit || 'units',
        costPerUnit: data.costPerUnit || 0,
        supplier: data.supplier || '',
        location: data.location || '',
        minStock: data.minStock || 0,
        projectId: data.projectId,
        status: data.status || 'available',
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      addInventoryItem(newItem);
      addActivity({ type: 'inventory', action: 'added', description: `New item "${data.name}" added to inventory`, timestamp: new Date().toISOString(), userId: 't1' });
    }
    setInventory(getInventory());
    setShowModal(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this inventory item?')) {
      removeInventoryItem(id);
      setInventory(getInventory());
    }
  };

  const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-700',
    'in-use': 'bg-blue-100 text-blue-700',
    depleted: 'bg-red-100 text-red-700',
    ordered: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Package size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{totalItems.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Items in Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">$</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">${totalValue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Inventory Value</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${lowStockCount > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
              <AlertTriangle size={18} className={lowStockCount > 0 ? 'text-red-600' : 'text-gray-400'} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{lowStockCount}</p>
              <p className="text-xs text-gray-500">Low Stock Alerts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search items, suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="in-use">In Use</option>
            <option value="depleted">Depleted</option>
            <option value="ordered">Ordered</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSortBy(sortBy === 'name' ? 'quantity' : sortBy === 'quantity' ? 'cost' : 'name')} className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
            <ArrowUpDown size={14} />
            {sortBy === 'name' ? 'Name' : sortBy === 'quantity' ? 'Qty' : 'Value'}
          </button>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('table')} className={`px-3 py-2 text-sm ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}>Table</button>
            <button onClick={() => setViewMode('grid')} className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}>Grid</button>
          </div>
          <button
            onClick={() => { setEditingItem(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Item</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Qty</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Cost/Unit</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total Value</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Location</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => {
                  const isLow = item.quantity <= item.minStock;
                  const project = item.projectId ? projects.find((p) => p.id === item.projectId) : null;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800">{item.name}</p>
                          {project && <p className="text-xs text-gray-400">→ {project.name}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.category}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-medium ${isLow ? 'text-red-600' : 'text-gray-800'}`}>
                          {item.quantity}
                        </span>
                        <span className="text-gray-400 ml-1">{item.unit}</span>
                        {isLow && <AlertTriangle size={12} className="inline ml-1 text-red-500" />}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">${item.costPerUnit.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">${(item.quantity * item.costPerUnit).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-600">{item.location}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500">No items found</div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const isLow = item.quantity <= item.minStock;
            return (
              <div key={item.id} className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all ${isLow ? 'border-red-200' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Quantity</span>
                    <span className={`font-medium ${isLow ? 'text-red-600' : 'text-gray-800'}`}>
                      {item.quantity} {item.unit}
                      {isLow && <AlertTriangle size={10} className="inline ml-1" />}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Value</span>
                    <span className="font-medium text-gray-800">${(item.quantity * item.costPerUnit).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Location</span>
                    <span className="text-gray-600">{item.location}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Supplier</span>
                    <span className="text-gray-600">{item.supplier}</span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditingItem(null); }} title={editingItem ? 'Edit Item' : 'Add Inventory Item'} size="lg">
        <InventoryForm item={editingItem} projects={projects} onSave={handleSave} onCancel={() => { setShowModal(false); setEditingItem(null); }} />
      </Modal>
    </div>
  );
}

function InventoryForm({ item, projects, onSave, onCancel }: { item: InventoryItem | null; projects: any[]; onSave: (data: Partial<InventoryItem>) => void; onCancel: () => void }) {
  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState(item?.category || '');
  const [description, setDescription] = useState(item?.description || '');
  const [quantity, setQuantity] = useState(item?.quantity?.toString() || '');
  const [unit, setUnit] = useState(item?.unit || 'units');
  const [costPerUnit, setCostPerUnit] = useState(item?.costPerUnit?.toString() || '');
  const [supplier, setSupplier] = useState(item?.supplier || '');
  const [location, setLocation] = useState(item?.location || '');
  const [minStock, setMinStock] = useState(item?.minStock?.toString() || '');
  const [projectId, setProjectId] = useState(item?.projectId || '');
  const [status, setStatus] = useState<InventoryItem['status']>(item?.status || 'available');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, category, description, quantity: Number(quantity) || 0, unit, costPerUnit: Number(costPerUnit) || 0, supplier, location, minStock: Number(minStock) || 0, projectId: projectId || undefined, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Electronics, Furniture..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as InventoryItem['status'])} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="available">Available</option>
            <option value="in-use">In Use</option>
            <option value="depleted">Depleted</option>
            <option value="ordered">Ordered</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
          <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="units, kg, meters" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cost/Unit ($)</label>
          <input type="number" step="0.01" value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
          <input type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Level</label>
          <input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Project</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">None</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
        <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">{item ? 'Update' : 'Add'} Item</button>
      </div>
    </form>
  );
}
