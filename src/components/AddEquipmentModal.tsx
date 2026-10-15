import React, { useState } from 'react';
import { useDepot } from '../context/DepotContext';
import { EquipmentCategory, EquipmentCondition } from '../types';
import { X, Plus, Tag, Film, ArrowRight, Sparkles, MapPin, Wrench, ShieldCheck, FileSpreadsheet, Layers } from 'lucide-react';

interface AddEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImportCsv?: () => void;
  onOpenManageTaxonomy?: (tab?: 'categories' | 'courses' | 'borrowers') => void;
}

interface EquipmentTemplate {
  name: string;
  brand: string;
  model: string;
  category: EquipmentCategory;
  replacementValue: number;
  location: string;
  specs: Record<string, string>;
  courses: string[];
}

const EQUIPMENT_TEMPLATES: EquipmentTemplate[] = [
  {
    name: 'Sony FX3 Cinema Line Full-Frame Kit',
    brand: 'Sony',
    model: 'ILME-FX3',
    category: 'camera' as EquipmentCategory,
    replacementValue: 4100,
    location: 'Cage Locker B-03',
    specs: { Sensor: 'Full Frame 12.1MP Back-Illuminated', Mount: 'Sony E-Mount', Codec: 'XAVC S-I 4:2:2 10-bit', ISO: 'Dual Base ISO 800 / 12,800' },
    courses: ['CINE 210', 'DOC 320', 'FILM 401']
  },
  {
    name: 'Canon EOS C70 4K RF Cinema Camera',
    brand: 'Canon',
    model: 'EOS C70',
    category: 'camera' as EquipmentCategory,
    replacementValue: 5499,
    location: 'Cage Locker B-04',
    specs: { Sensor: 'Super 35mm DGO Sensor', Mount: 'Canon RF Mount', Codec: 'XF-AVC 4:2:2 10-bit', 'Dynamic Range': '16+ Stops' },
    courses: ['CINE 210', 'CINE 350', 'DOC 320']
  },
  {
    name: 'Canon CN-E 50mm T1.3 Cinema Prime Lens',
    brand: 'Canon',
    model: 'CN-E 50mm T1.3 L F',
    category: 'lens' as EquipmentCategory,
    replacementValue: 3950,
    location: 'Lens Vault Safe 3',
    specs: { Aperture: 'T1.3 Maximum Aperture', Mount: 'EF Mount Cinema', Coverage: 'Full Frame 35mm', Focus: '300-degree rotation' },
    courses: ['CINE 210', 'CINE 350', 'FILM 401']
  },
  {
    name: 'Nanlite Forza 720B Bi-Color Spot LED Light',
    brand: 'Nanlite',
    model: 'Forza 720B',
    category: 'lighting' as EquipmentCategory,
    replacementValue: 2200,
    location: 'Lighting Rack Bay C-3',
    specs: { Output: '800W Draw (84,460 lux @ 1m)', CCT: '2700K - 6500K Bi-Color', CRI: '96 / TLCI 97', Mount: 'Bowens Mount' },
    courses: ['CINE 350', 'FILM 401']
  },
  {
    name: 'Sennheiser EW-DP ME2 Wireless Lav Audio System',
    brand: 'Sennheiser',
    model: 'EW-DP ME2 Set',
    category: 'audio' as EquipmentCategory,
    replacementValue: 699,
    location: 'Audio Locker A-5',
    specs: { Range: '100m line of sight', Latency: '1.9ms ultra-low digital', Frequency: 'UHF band 520 - 576 MHz', 'Dynamic Range': '134 dB' },
    courses: ['FILM 240', 'DOC 220', 'DOC 320', 'FILM 401']
  },
  {
    name: 'Atomos Ninja Ultra 5-inch 8K RAW Monitor',
    brand: 'Atomos',
    model: 'Ninja Ultra 5.2"',
    category: 'monitoring' as EquipmentCategory,
    replacementValue: 799,
    location: 'Video Village Locker C-4',
    specs: { Display: '1000 nits HDR 1920x1080', Codec: 'ProRes RAW recording up to 8K30p', Inputs: 'HDMI 2.0 In/Out', Tools: 'False Color, Peaking, Waveform' },
    courses: ['CINE 210', 'CINE 350', 'FILM 401']
  },
  {
    name: 'DJI RS 3 Pro Gimbal Stabilizer Combo',
    brand: 'DJI',
    model: 'RS 3 Pro Combo',
    category: 'grip' as EquipmentCategory,
    replacementValue: 1099,
    location: 'Grip Bay Locker G-3',
    specs: { Payload: '10 lbs (4.5 kg)', Arms: 'Extended carbon fiber axis arms', LiDAR: 'LiDAR range finder autofocus support' },
    courses: ['CINE 350', 'FILM 401']
  }
];

export const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({
  isOpen,
  onClose,
  onOpenImportCsv,
  onOpenManageTaxonomy
}) => {
  const { addNewEquipment, addToast, categories, courses, addCategory } = useDepot();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Sony');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>(() =>
    categories.length > 0 ? categories[0].id : 'camera'
  );
  const [condition, setCondition] = useState<EquipmentCondition>('pristine');
  const [serialNumber, setSerialNumber] = useState('');
  const [barcode, setBarcode] = useState(`BC-${Math.floor(100000 + Math.random() * 900000)}`);
  const [location, setLocation] = useState('Cage Locker B-03');
  const [replacementValue, setReplacementValue] = useState(4500);
  const [selectedCourses, setSelectedCourses] = useState<string[]>(['FILM 401', 'CINE 350']);

  // Quick category inline adder
  const [showQuickAddCat, setShowQuickAddCat] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [quickCatId, setQuickCatId] = useState('');
  const [nextServiceDate, setNextServiceDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d.toISOString().split('T')[0];
  });
  const [serviceType, setServiceType] = useState('Routine inspection & sensor cleaning');
  const [technician, setTechnician] = useState('Depot Staff');
  const [specKey, setSpecKey] = useState('Sensor');
  const [specVal, setSpecVal] = useState('Full Frame 4K');
  const [additionalSpecs, setAdditionalSpecs] = useState<Record<string, string>>({
    Mount: 'Standard PL / E Mount'
  });

  if (!isOpen) return null;

  const applyTemplate = (tpl: typeof EQUIPMENT_TEMPLATES[0]) => {
    setName(tpl.name);
    setBrand(tpl.brand);
    setModel(tpl.model);
    setCategory(tpl.category);
    setReplacementValue(tpl.replacementValue);
    setLocation(tpl.location);
    setSelectedCourses(tpl.courses);
    setAdditionalSpecs(tpl.specs);
    const keys = Object.keys(tpl.specs);
    if (keys.length > 0) {
      setSpecKey(keys[0]);
      setSpecVal(tpl.specs[keys[0]]);
    }
    setSerialNumber(`SN-${tpl.brand.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  const toggleCourse = (code: string) => {
    setSelectedCourses(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const generateNewBarcode = () => {
    setBarcode(`BC-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !serialNumber.trim()) {
      addToast({
        type: 'error',
        title: 'Missing Required Fields',
        message: 'Please provide equipment name and serial number.'
      });
      return;
    }

    const compiledSpecs = {
      ...additionalSpecs,
      [specKey || 'Spec']: specVal || 'Standard'
    };

    addNewEquipment({
      name,
      brand,
      model: model || name,
      category,
      condition,
      serialNumber,
      barcode,
      location,
      replacementValue: Number(replacementValue) || 1000,
      eligibleCourses: selectedCourses.length > 0 ? selectedCourses : ['FILM 401'],
      specs: compiledSpecs,
      maintenanceSchedule: {
        lastServicedDate: new Date().toISOString().split('T')[0],
        nextServiceDate,
        serviceType,
        intervalDays: 60,
        technician: technician || 'Depot Staff',
        notes: 'Initial registration inspection passed. Stored in depot.'
      }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-500" />
              Register New Cinema Equipment Asset
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Add manually to university equipment fleet catalog and barcode ledger
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onOpenImportCsv && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenImportCsv();
                }}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition-colors"
                title="Bulk import assets from CSV file"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Import from CSV</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          {/* Quick Preset Templates */}
          <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Quick Gear Presets (Click to autofill specifications):
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EQUIPMENT_TEMPLATES.map(tpl => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all ${
                    name === tpl.name
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  {tpl.name.split(' ')[0]} {tpl.name.split(' ')[1]} ({tpl.category})
                </button>
              ))}
            </div>
          </div>

          {/* Primary details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Equipment Full Package Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sony FX3 Cinema Line Full-Frame Kit"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Category *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickAddCat(!showQuickAddCat)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showQuickAddCat ? 'Cancel' : 'New Category'}</span>
                  </button>
                  {onOpenManageTaxonomy && (
                    <button
                      type="button"
                      onClick={() => onOpenManageTaxonomy('categories')}
                      className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                    >
                      Manage
                    </button>
                  )}
                </div>
              </div>

              {showQuickAddCat && (
                <div className="mb-2 p-2 bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg space-y-1.5 animate-in fade-in">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block">
                    Quick Add Category
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Name (e.g. Drones)"
                      value={quickCatName}
                      onChange={e => {
                        setQuickCatName(e.target.value);
                        setQuickCatId(e.target.value.toLowerCase().replace(/[\s-]+/g, '_'));
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (quickCatName.trim()) {
                          const id = quickCatId.trim() || quickCatName.toLowerCase().replace(/[\s-]+/g, '_');
                          addCategory({ id, name: quickCatName.trim() });
                          setCategory(id);
                          setQuickCatName('');
                          setQuickCatId('');
                          setShowQuickAddCat(false);
                        }
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}

              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Manufacturer / Brand *
              </label>
              <input
                type="text"
                required
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. Sony, ARRI, RED, Canon"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Model Number
              </label>
              <input
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="e.g. ILME-FX3"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Condition
              </label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
              >
                <option value="pristine">Pristine (Like new)</option>
                <option value="good">Good (Nominal set wear)</option>
                <option value="fair">Fair (Cosmetic scuffs)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Serial Number *
              </label>
              <input
                type="text"
                required
                value={serialNumber}
                onChange={e => setSerialNumber(e.target.value)}
                placeholder="e.g. SN-FX3-99412"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Depot Barcode Tag *
                </label>
                <button
                  type="button"
                  onClick={generateNewBarcode}
                  className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Generate Random
                </button>
              </div>
              <input
                type="text"
                required
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Depot Bay / Locker Shelf Location *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Cage Locker B-03, Vault Safe 2"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Replacement Value ($USD)
              </label>
              <input
                type="number"
                value={replacementValue}
                onChange={e => setReplacementValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Course Eligibility */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Eligible Film Courses for Student Borrowing:
              </label>
              {onOpenManageTaxonomy && (
                <button
                  type="button"
                  onClick={() => onOpenManageTaxonomy('courses')}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  + Add Course
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {courses.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => toggleCourse(c.code)}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all ${
                    selectedCourses.includes(c.code)
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  {c.code}
                </button>
              ))}
            </div>
          </div>

          {/* Specifications */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
              Technical Specifications:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Feature / Spec Name</label>
                <input
                  type="text"
                  value={specKey}
                  onChange={e => setSpecKey(e.target.value)}
                  placeholder="e.g. Sensor, Mount, Output"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Specification Value</label>
                <input
                  type="text"
                  value={specVal}
                  onChange={e => setSpecVal(e.target.value)}
                  placeholder="e.g. Full Frame 4K 120fps"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Preventative Maintenance Calibration */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-indigo-500" />
              Preventative Maintenance Schedule Settings:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Next Calibration Date</label>
                <input
                  type="date"
                  value={nextServiceDate}
                  onChange={e => setNextServiceDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Assigned Technician</label>
                <input
                  type="text"
                  value={technician}
                  onChange={e => setTechnician(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-[11px]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-0.5">Calibration & Maintenance Procedure</label>
              <input
                type="text"
                value={serviceType}
                onChange={e => setServiceType(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-[11px]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <span>Add Asset to Depot Fleet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
