import React, { useState, useEffect } from 'react';
import { useDepot } from '../context/DepotContext';
import { EquipmentItem } from '../types';
import { DigitalSignaturePad } from './DigitalSignaturePad';
import { X, Calendar, Clock, User, BookOpen, AlertCircle, FileCheck2, ArrowRight, Plus } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: EquipmentItem | null;
  prefilledStudent?: {
    name: string;
    id: string;
    email: string;
    course: string;
    project: string;
  } | null;
  onOpenManageTaxonomy?: (tab?: 'categories' | 'courses' | 'borrowers') => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  item,
  prefilledStudent,
  onOpenManageTaxonomy
}) => {
  const { checkoutItem, addToast, courses, borrowers, addBorrower } = useDepot();

  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [course, setCourse] = useState(() =>
    courses.length > 0 ? `${courses[0].code}: ${courses[0].title}` : 'FILM 401: Senior Thesis Production'
  );
  const [facultyAdvisor, setFacultyAdvisor] = useState(() =>
    courses.length > 0 ? courses[0].faculty : 'Prof. Marcus Vance'
  );
  const [projectTitle, setProjectTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [signature, setSignature] = useState('');
  const [notes, setNotes] = useState('');

  // Quick add borrower inline toggle
  const [showQuickAddBorrower, setShowQuickAddBorrower] = useState(false);
  const [newBorrowerId, setNewBorrowerId] = useState('');
  const [newBorrowerName, setNewBorrowerName] = useState('');
  const [newBorrowerEmail, setNewBorrowerEmail] = useState('');

  // Default due date: tomorrow at 17:00
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(17, 0, 0, 0);
      setDueDate(tomorrow.toISOString().slice(0, 16));

      if (courses.length > 0 && !course) {
        setCourse(`${courses[0].code}: ${courses[0].title}`);
        setFacultyAdvisor(courses[0].faculty);
      }

      if (prefilledStudent) {
        setStudentName(prefilledStudent.name);
        setStudentId(prefilledStudent.id);
        setStudentEmail(prefilledStudent.email);
        setProjectTitle(prefilledStudent.project);
        const matchedCourse = courses.find(
          c => `${c.code}: ${c.title}` === prefilledStudent.course || prefilledStudent.course.includes(c.code)
        );
        if (matchedCourse) {
          setCourse(`${matchedCourse.code}: ${matchedCourse.title}`);
          setFacultyAdvisor(matchedCourse.faculty);
        } else {
          setCourse(prefilledStudent.course);
        }
      } else if (!studentName && borrowers.length > 0) {
        applyStudentPreset(borrowers[0]);
      }
    }
  }, [isOpen, prefilledStudent, courses, borrowers]);

  const applyStudentPreset = (stu: { name: string; id: string; email: string; course: string; project: string }) => {
    setStudentName(stu.name);
    setStudentId(stu.id);
    setStudentEmail(stu.email);
    setProjectTitle(stu.project);
    const matchedCourse = courses.find(c => c.code === stu.course || `${c.code}: ${c.title}` === stu.course || stu.course.includes(c.code));
    if (matchedCourse) {
      setCourse(`${matchedCourse.code}: ${matchedCourse.title}`);
      setFacultyAdvisor(matchedCourse.faculty);
    }
  };

  const handleCourseChange = (courseStr: string) => {
    setCourse(courseStr);
    const found = courses.find(c => `${c.code}: ${c.title}` === courseStr || c.code === courseStr);
    if (found) {
      setFacultyAdvisor(found.faculty);
    }
  };

  const setPresetDuration = (hours: number) => {
    const d = new Date();
    d.setTime(d.getTime() + hours * 60 * 60 * 1000);
    setDueDate(d.toISOString().slice(0, 16));
  };

  const handleQuickRegisterBorrower = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBorrowerId.trim() || !newBorrowerName.trim()) {
      addToast({
        type: 'warning',
        title: 'Missing Details',
        message: 'Student ID and name are required.'
      });
      return;
    }

    const cleanId = newBorrowerId.trim().toUpperCase();
    const cleanEmail = newBorrowerEmail.trim() || `${newBorrowerName.toLowerCase().replace(/\s+/g, '.')}@university.edu`;

    const success = addBorrower({
      id: cleanId,
      name: newBorrowerName.trim(),
      email: cleanEmail,
      course: courses[0]?.code || 'FILM 401',
      project: 'Depot Checkout Loan'
    });

    if (success) {
      setStudentName(newBorrowerName.trim());
      setStudentId(cleanId);
      setStudentEmail(cleanEmail);
      setShowQuickAddBorrower(false);
      setNewBorrowerId('');
      setNewBorrowerName('');
      setNewBorrowerEmail('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    if (!studentName.trim() || !studentId.trim() || !dueDate) {
      addToast({
        type: 'error',
        title: 'Missing Required Fields',
        message: 'Please provide student name, university ID, and return deadline.'
      });
      return;
    }

    if (!signature) {
      addToast({
        type: 'warning',
        title: 'Signature Required',
        message: 'Student must sign the digital custody agreement before loan release.'
      });
      return;
    }

    const success = checkoutItem(item.id, {
      studentName,
      studentId,
      studentEmail,
      course,
      facultyAdvisor,
      projectTitle: projectTitle || 'Course Production Exercise',
      dueDate: new Date(dueDate).toISOString(),
      signature,
      notes
    });

    if (success) {
      onClose();
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">
              Film Studies Equipment Depot · Loan Agreement
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <span>Check Out: {item.name}</span>
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Tag: {item.barcode} · Serial: {item.serialNumber} · {item.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Quick student picker */}
          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Select Registered Film Student ({borrowers.length}):
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickAddBorrower(!showQuickAddBorrower)}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{showQuickAddBorrower ? 'Close Form' : 'Register New Student'}</span>
                </button>
                {onOpenManageTaxonomy && (
                  <button
                    type="button"
                    onClick={() => onOpenManageTaxonomy('borrowers')}
                    className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                  >
                    Directory
                  </button>
                )}
              </div>
            </div>

            {/* Inline Quick Add Student */}
            {showQuickAddBorrower && (
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-indigo-200 dark:border-indigo-800 space-y-2 animate-in fade-in">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Add New Borrower to Directory
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="ID (e.g. STU-2026-11)"
                    value={newBorrowerId}
                    onChange={e => setNewBorrowerId(e.target.value.toUpperCase())}
                    className="px-2 py-1 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Student Name"
                    value={newBorrowerName}
                    onChange={e => setNewBorrowerName(e.target.value)}
                    className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                  />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={newBorrowerEmail}
                    onChange={e => setNewBorrowerEmail(e.target.value)}
                    className="px-2 py-1 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowQuickAddBorrower(false)}
                    className="px-2 py-1 text-[10px] text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickRegisterBorrower}
                    className="px-3 py-1 text-[10px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded"
                  >
                    Register & Select
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {borrowers.map(stu => (
                <button
                  key={stu.id}
                  type="button"
                  onClick={() => applyStudentPreset(stu)}
                  className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all ${
                    studentId === stu.id
                      ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  {stu.name} ({stu.course.split(':')[0]})
                </button>
              ))}
            </div>
          </div>

          {/* Student details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                University Student ID *
              </label>
              <input
                type="text"
                required
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                placeholder="STU-992144"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                University Email *
              </label>
              <input
                type="email"
                required
                value={studentEmail}
                onChange={e => setStudentEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Academic Context */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Course Assignment
                </label>
                {onOpenManageTaxonomy && (
                  <button
                    type="button"
                    onClick={() => onOpenManageTaxonomy('courses')}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Manage Courses
                  </button>
                )}
              </div>
              <select
                value={course}
                onChange={e => handleCourseChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {courses.map(c => (
                  <option key={c.code} value={`${c.code}: ${c.title}`}>
                    {c.code}: {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Faculty Advisor
              </label>
              <input
                type="text"
                value={facultyAdvisor}
                onChange={e => setFacultyAdvisor(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600 dark:text-slate-300"
              />
            </div>
          </div>

          {/* Project Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Production Project Title
            </label>
            <input
              type="text"
              value={projectTitle}
              onChange={e => setProjectTitle(e.target.value)}
              placeholder="e.g. Senior Capstone: The Silent Frame"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Due date picker with rapid hour presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Mandatory Return Deadline *
              </label>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 font-mono">Quick window:</span>
                <button
                  type="button"
                  onClick={() => setPresetDuration(4)}
                  className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded font-mono"
                >
                  4h
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDuration(24)}
                  className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded font-mono"
                >
                  24h
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDuration(72)}
                  className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded font-mono"
                >
                  72h Weekend
                </button>
              </div>
            </div>
            <input
              type="datetime-local"
              required
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          {/* Digital Signature Pad */}
          <div className="space-y-1.5">
            <DigitalSignaturePad
              signerName={studentName || 'Student Borrower'}
              roleDescription="Student Borrower Custody Verification"
              onSignatureChange={setSignature}
            />
          </div>

          {/* Checkout Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Inspection Notes / Included Accessories
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Includes Pelican flight case, 2x Gold-Mount batteries, dual charger, and HDMI cable."
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Verify Signature & Release Equipment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
