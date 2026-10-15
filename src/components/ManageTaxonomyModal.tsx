import React, { useState } from 'react';
import { useDepot } from '../context/DepotContext';
import { CategoryItem, UniversityCourse, StudentBorrower } from '../types';
import {
  Tag,
  BookOpen,
  Users,
  X,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Layers,
  Sparkles,
  Info,
  Search,
  ExternalLink,
  Mail,
  GraduationCap,
  ShieldAlert
} from 'lucide-react';

interface ManageTaxonomyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'categories' | 'courses' | 'borrowers';
  onOpenUserRentals?: (studentId: string) => void;
}

export const ManageTaxonomyModal: React.FC<ManageTaxonomyModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'categories',
  onOpenUserRentals
}) => {
  const {
    categories,
    addCategory,
    removeCategory,
    courses,
    addCourse,
    removeCourse,
    borrowers,
    addBorrower,
    removeBorrower,
    equipment
  } = useDepot();

  const [activeTab, setActiveTab] = useState<'categories' | 'courses' | 'borrowers'>(defaultTab);

  // Search filters for tables
  const [catSearch, setCatSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [borrowerSearch, setBorrowerSearch] = useState('');

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatId, setNewCatId] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // New Course Form State
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseFaculty, setNewCourseFaculty] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');

  // New Borrower Form State
  const [newBorrowerId, setNewBorrowerId] = useState('');
  const [newBorrowerName, setNewBorrowerName] = useState('');
  const [newBorrowerEmail, setNewBorrowerEmail] = useState('');
  const [newBorrowerCourse, setNewBorrowerCourse] = useState('');
  const [newBorrowerProject, setNewBorrowerProject] = useState('');
  const [newBorrowerNotes, setNewBorrowerNotes] = useState('');

  if (!isOpen) return null;

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const idToUse = newCatId.trim() || newCatName.toLowerCase().replace(/[\s-]+/g, '_');
    const success = addCategory({
      id: idToUse,
      name: newCatName.trim(),
      description: newCatDesc.trim()
    });

    if (success) {
      setNewCatName('');
      setNewCatId('');
      setNewCatDesc('');
    }
  };

  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = addCourse({
      code: newCourseCode.trim().toUpperCase(),
      title: newCourseTitle.trim(),
      faculty: newCourseFaculty.trim() || 'Department Faculty',
      description: newCourseDesc.trim() || 'Film studies curriculum course'
    });

    if (success) {
      setNewCourseCode('');
      setNewCourseTitle('');
      setNewCourseFaculty('');
      setNewCourseDesc('');
    }
  };

  const handleAddBorrowerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedCourseCode = newBorrowerCourse || (courses.length > 0 ? courses[0].code : 'FILM 401');
    const emailToUse =
      newBorrowerEmail.trim() ||
      `${newBorrowerName.toLowerCase().replace(/\s+/g, '.')}@university.edu`;

    const success = addBorrower({
      id: newBorrowerId.trim().toUpperCase(),
      name: newBorrowerName.trim(),
      email: emailToUse,
      course: selectedCourseCode,
      project: newBorrowerProject.trim() || 'Academic Production Project',
      notes: newBorrowerNotes.trim()
    });

    if (success) {
      setNewBorrowerId('');
      setNewBorrowerName('');
      setNewBorrowerEmail('');
      setNewBorrowerProject('');
      setNewBorrowerNotes('');
    }
  };

  // Filtered lists
  const filteredCategories = categories.filter(c => {
    if (!catSearch.trim()) return true;
    const q = catSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q));
  });

  const filteredCourses = courses.filter(c => {
    if (!courseSearch.trim()) return true;
    const q = courseSearch.toLowerCase();
    return c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.faculty.toLowerCase().includes(q);
  });

  const filteredBorrowers = borrowers.filter(b => {
    if (!borrowerSearch.trim()) return true;
    const q = borrowerSearch.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      b.course.toLowerCase().includes(q) ||
      b.project.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Department Directory & Taxonomy Management
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Add and remove asset categories, curriculum courses, and authorized student borrowers
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

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-100/50 dark:bg-slate-800/30 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('borrowers')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'borrowers'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Student Borrowers ({borrowers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'categories'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Asset Categories ({categories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'courses'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Curriculum Courses ({courses.length})</span>
          </button>
        </div>

        {/* Tab 1: Student Borrowers */}
        {activeTab === 'borrowers' && (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Create Borrower Form */}
            <form onSubmit={handleAddBorrowerSubmit} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-500" />
                Register New Student Borrower
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student ID Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBorrowerId}
                    onChange={e => setNewBorrowerId(e.target.value.toUpperCase())}
                    placeholder="e.g. STU-2026-09"
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBorrowerName}
                    onChange={e => setNewBorrowerName(e.target.value)}
                    placeholder="e.g. Maya Chen"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    University Email
                  </label>
                  <input
                    type="email"
                    value={newBorrowerEmail}
                    onChange={e => setNewBorrowerEmail(e.target.value)}
                    placeholder="m.chen@university.edu"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enrolled Film Course
                  </label>
                  <select
                    value={newBorrowerCourse || (courses[0]?.code || '')}
                    onChange={e => setNewBorrowerCourse(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {courses.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code}: {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Production / Thesis Project
                  </label>
                  <input
                    type="text"
                    value={newBorrowerProject}
                    onChange={e => setNewBorrowerProject(e.target.value)}
                    placeholder="e.g. Senior Capstone Short: Echoes"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Borrower</span>
                </button>
              </div>
            </form>

            {/* Existing Borrowers Table */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                  Registered Student Directory ({borrowers.length})
                </span>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={borrowerSearch}
                    onChange={e => setBorrowerSearch(e.target.value)}
                    placeholder="Search borrowers by name, ID, course..."
                    className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">ID Number</th>
                      <th className="py-2.5 px-3">Course / Project</th>
                      <th className="py-2.5 px-3 text-center">Active Gear</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredBorrowers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-xs text-slate-400 font-mono">
                          No registered borrowers match filter.
                        </td>
                      </tr>
                    ) : (
                      filteredBorrowers.map(b => {
                        const activeLoans = equipment.filter(
                          e =>
                            e.currentLoan &&
                            (e.currentLoan.studentId === b.id ||
                              e.currentLoan.studentName.toLowerCase() === b.name.toLowerCase())
                        );
                        const hasOverdue = activeLoans.some(e => e.status === 'overdue' || new Date(e.currentLoan!.dueDate) < new Date());

                        return (
                          <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 px-3">
                              <p className="font-semibold text-slate-900 dark:text-white">{b.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono truncate max-w-xs">{b.email}</p>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">
                              {b.id}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{b.course.split(':')[0]}</span>
                              <p className="text-[10px] text-slate-500 truncate max-w-xs">{b.project}</p>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono">
                              {activeLoans.length > 0 ? (
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    hasOverdue
                                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                                  }`}
                                >
                                  {activeLoans.length} item{activeLoans.length !== 1 ? 's' : ''}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">None</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {onOpenUserRentals && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onClose();
                                      onOpenUserRentals(b.id);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                                    title="View student rental history ledger"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeBorrower(b.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                  title={
                                    activeLoans.length > 0
                                      ? `Cannot remove: ${activeLoans.length} gear item(s) currently checked out`
                                      : 'Remove borrower from directory'
                                  }
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Asset Categories */}
        {activeTab === 'categories' && (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Create Category Form */}
            <form onSubmit={handleAddCategorySubmit} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-500" />
                Add New Asset Category
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={e => {
                      setNewCatName(e.target.value);
                      if (!newCatId || newCatId === newCatName.toLowerCase().replace(/[\s-]+/g, '_')) {
                        setNewCatId(e.target.value.toLowerCase().replace(/[\s-]+/g, '_'));
                      }
                    }}
                    placeholder="e.g. Drones & Aerial, Power & Batteries..."
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    System Identifier / Code
                  </label>
                  <input
                    type="text"
                    value={newCatId}
                    onChange={e => setNewCatId(e.target.value.toLowerCase().replace(/[\s-]+/g, '_'))}
                    placeholder="e.g. drone, power, teleprompter"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Department Notes
                </label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={e => setNewCatDesc(e.target.value)}
                  placeholder="e.g. Certified aerial filming platforms and controllers..."
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Category</span>
                </button>
              </div>
            </form>

            {/* Existing Categories Table */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                  Active Catalog Categories ({categories.length})
                </span>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={catSearch}
                    onChange={e => setCatSearch(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Category Name</th>
                      <th className="py-2.5 px-3">Code / ID</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Assigned Assets</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredCategories.map(cat => {
                      const assignedCount = equipment.filter(e => e.category === cat.id).length;

                      return (
                        <tr key={cat.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                            {cat.name}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-indigo-600 dark:text-indigo-400 text-[11px]">
                            {cat.id}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-xs">
                            {cat.description || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                            <span
                              className={`px-2 py-0.5 rounded font-bold ${
                                assignedCount > 0
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                                  : 'text-slate-400'
                              }`}
                            >
                              {assignedCount} unit{assignedCount !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => removeCategory(cat.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title={
                                assignedCount > 0
                                  ? `Cannot delete: ${assignedCount} items assigned`
                                  : 'Remove this category'
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Academic Courses */}
        {activeTab === 'courses' && (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Create Course Form */}
            <form onSubmit={handleAddCourseSubmit} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-500" />
                Add New Film Studies Course
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCourseCode}
                    onChange={e => setNewCourseCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ANIM 310, CINE 480"
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCourseTitle}
                    onChange={e => setNewCourseTitle(e.target.value)}
                    placeholder="e.g. Virtual Production & LED Volume"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty Advisor / Instructor
                  </label>
                  <input
                    type="text"
                    value={newCourseFaculty}
                    onChange={e => setNewCourseFaculty(e.target.value)}
                    placeholder="e.g. Prof. David Miller"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Syllabus / Course Description
                </label>
                <input
                  type="text"
                  value={newCourseDesc}
                  onChange={e => setNewCourseDesc(e.target.value)}
                  placeholder="e.g. Advanced camera tracking, Unreal Engine virtual sets and lighting..."
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Course</span>
                </button>
              </div>
            </form>

            {/* Existing Courses Table */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                  Active Curriculum Directory ({courses.length})
                </span>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={e => setCourseSearch(e.target.value)}
                    placeholder="Search courses by code or title..."
                    className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Course Title</th>
                      <th className="py-2.5 px-3">Faculty Advisor</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Active Loans</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredCourses.map(course => {
                      const activeLoansCount = equipment.filter(
                        e => e.currentLoan?.course === course.code || e.currentLoan?.course.includes(course.code)
                      ).length;

                      return (
                        <tr key={course.code} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {course.code}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                            {course.title}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                            {course.faculty}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-xs">
                            {course.description || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">
                            {activeLoansCount > 0 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                {activeLoansCount} active
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">0</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => removeCourse(course.code)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title={
                                activeLoansCount > 0
                                  ? `Cannot delete: ${activeLoansCount} active gear loans tagged`
                                  : 'Remove course from curriculum'
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-xs text-slate-500 font-mono">
            {activeTab === 'borrowers'
              ? `${borrowers.length} registered student borrowers`
              : activeTab === 'categories'
              ? `${categories.length} equipment categories`
              : `${courses.length} courses registered`}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
