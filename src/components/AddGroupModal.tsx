import React, { useState } from 'react';
import { useDepot } from '../context/DepotContext';
import { X, Layers, Plus, Check, Search, Tag, Sparkles, Box } from 'lucide-react';

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_PACKAGE_TEMPLATES = [
  {
    name: 'Solo Documentary Mobile Rig',
    course: 'DOC 320: Documentary Practicum',
    description: 'Ultra-portable 4K cinema setup for single-operator field documentary interviews with wireless lav and shotgun boom.',
    categoryFilter: ['camera', 'audio']
  },
  {
    name: 'Narrative Studio Lighting Grid',
    course: 'CINE 350: Advanced Lighting & Camera',
    description: 'Complete 3-point key, fill, and rim lighting package with wireless DMX control for studio drama productions.',
    categoryFilter: ['lighting']
  },
  {
    name: 'Wireless Video Village Kit',
    course: 'FILM 401: Senior Thesis Production',
    description: 'Director 7-inch high-bright monitor paired with zero-delay wireless HDMI/SDI transmitter and cage handles.',
    categoryFilter: ['monitoring']
  }
];

export const AddGroupModal: React.FC<AddGroupModalProps> = ({ isOpen, onClose }) => {
  const { equipment, addGroup, addToast, courses } = useDepot();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetCourse, setTargetCourse] = useState(() =>
    courses.length > 0 ? `${courses[0].code}: ${courses[0].title}` : 'FILM 401'
  );
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleApplyTemplate = (tmpl: typeof PRESET_PACKAGE_TEMPLATES[0]) => {
    setName(tmpl.name);
    setTargetCourse(tmpl.course);
    setDescription(tmpl.description);

    // Auto-select items matching the template categories
    const matching = equipment
      .filter(e => tmpl.categoryFilter.includes(e.category))
      .slice(0, 3)
      .map(e => e.id);
    setSelectedItemIds(matching);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast({
        type: 'warning',
        title: 'Package Name Required',
        message: 'Please enter a name for the equipment group / package.'
      });
      return;
    }

    if (selectedItemIds.length === 0) {
      addToast({
        type: 'warning',
        title: 'Assets Required',
        message: 'Please select at least one piece of equipment to bundle into this group.'
      });
      return;
    }

    addGroup({
      name: name.trim(),
      description: description.trim() || 'Custom academic production equipment package.',
      targetCourse,
      itemIds: selectedItemIds
    });

    onClose();
  };

  const filteredEquipment = equipment.filter(item => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.barcode.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Create Asset Group & Kit Package
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Bundle individual cameras, lenses, lighting & audio into unified borrowable packages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Quick Package Presets */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Quick Production Package Templates:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_PACKAGE_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="p-2.5 text-left border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all text-xs"
                >
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{tmpl.name}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{tmpl.course.split(':')[0]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Package Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Group Package Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Master Interview Lighting Package"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Film Studies Course
              </label>
              <select
                value={targetCourse}
                onChange={e => setTargetCourse(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {courses.map(c => (
                  <option key={c.code} value={`${c.code}: ${c.title}`}>
                    {c.code}: {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Package Description & Manifest Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Bundles camera body with prime lens, matte box, director monitor, and heavy-duty flight case..."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Asset Selection Ledger */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-indigo-500" />
                Select Equipment Assets to Bundle ({selectedItemIds.length} selected)
              </label>
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder="Filter catalog..."
                  className="w-full pl-8 pr-2.5 py-1 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 max-h-56 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/40">
              {filteredEquipment.map(item => {
                const isSelected = selectedItemIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`flex items-center justify-between p-2.5 text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-l-4 border-l-indigo-600'
                        : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate mr-3">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {item.barcode} · {item.brand} · <span className="capitalize">{item.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded capitalize ${
                        item.status === 'available'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-mono">
              {selectedItemIds.length} item{selectedItemIds.length !== 1 ? 's' : ''} bundled in package
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Asset Group</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
