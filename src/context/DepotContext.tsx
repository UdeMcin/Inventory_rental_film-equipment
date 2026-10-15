import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { EquipmentItem, LoanRecord, MaintenanceTicket, SyncQueueItem, UserRole, EquipmentCondition, EquipmentGroup, CategoryItem, UniversityCourse, StudentBorrower } from '../types';
import { INITIAL_EQUIPMENT, INITIAL_LOAN_HISTORY, INITIAL_MAINTENANCE_TICKETS, INITIAL_GROUPS, INITIAL_CATEGORIES, UNIVERSITY_COURSES, PRESET_STUDENTS } from '../data/initialData';
import { playScanSuccessTone } from '../utils/audio';

const STORAGE_KEY_EQUIPMENT = 'cinetrack_equipment_v1';
const STORAGE_KEY_LOANS = 'cinetrack_loans_v1';
const STORAGE_KEY_TICKETS = 'cinetrack_tickets_v1';
const STORAGE_KEY_SYNC_QUEUE = 'cinetrack_sync_queue_v1';
const STORAGE_KEY_ROLE = 'cinetrack_user_role_v1';
const STORAGE_KEY_GROUPS = 'cinetrack_groups_v1';
const STORAGE_KEY_CATEGORIES = 'cinetrack_categories_v1';
const STORAGE_KEY_COURSES = 'cinetrack_courses_v1';
const STORAGE_KEY_BORROWERS = 'cinetrack_borrowers_v1';

export interface EmailPreviewData {
  recipient: string;
  sender: string;
  subject: string;
  equipmentName: string;
  barcode: string;
  serialNumber: string;
  severity: string;
  description: string;
  reportedBy: string;
  timestamp: string;
  ticketId: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface DepotContextType {
  equipment: EquipmentItem[];
  loanHistory: LoanRecord[];
  maintenanceTickets: MaintenanceTicket[];
  syncQueue: SyncQueueItem[];
  role: UserRole;
  isOfflineSimulated: boolean;
  isNetworkOnline: boolean;
  effectiveOnline: boolean;
  lastSyncTime: string;
  toasts: ToastMessage[];
  
  // Stats
  overdueItems: EquipmentItem[];
  upcomingServiceItems: EquipmentItem[];
  availableCount: number;
  checkedOutCount: number;
  maintenanceCount: number;

  // Actions
  setRole: (role: UserRole) => void;
  toggleOfflineSimulation: () => void;
  syncNow: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  
  checkoutItem: (equipmentId: string, loanData: {
    studentName: string;
    studentId: string;
    studentEmail: string;
    course: string;
    facultyAdvisor: string;
    projectTitle: string;
    dueDate: string;
    signature: string;
    notes: string;
  }) => boolean;
  
  returnItem: (equipmentId: string, returnData: {
    condition: EquipmentCondition;
    notes: string;
    signature: string;
    staffName: string;
  }) => boolean;

  reportDamage: (data: {
    equipmentId: string;
    severity: 'minor' | 'major' | 'critical';
    issueType: 'physical_damage' | 'sensor_dust' | 'electronic_fault' | 'lost_accessory' | 'routine_calibration';
    description: string;
    photoUrl?: string | null;
    reportedBy: string;
  }) => { ticket: MaintenanceTicket; emailPreview: EmailPreviewData };

  scheduleService: (equipmentId: string, schedule: {
    nextServiceDate: string;
    serviceType: string;
    intervalDays: number;
    technician: string;
    notes: string;
  }) => void;

  resolveTicket: (ticketId: string, notes: string) => void;
  groups: EquipmentGroup[];
  addGroup: (group: Omit<EquipmentGroup, 'id' | 'createdAt'>) => void;
  updateGroup: (id: string, updates: Partial<EquipmentGroup>) => void;
  deleteGroup: (id: string) => void;
  checkoutGroup: (groupId: string, loanData: {
    studentName: string;
    studentId: string;
    studentEmail: string;
    course: string;
    facultyAdvisor: string;
    projectTitle: string;
    dueDate: string;
    signature: string;
    notes: string;
  }) => boolean;
  returnGroup: (groupId: string, returnData: {
    condition: EquipmentCondition;
    notes: string;
    signature: string;
    staffName: string;
  }) => boolean;

  addNewEquipment: (item: Omit<EquipmentItem, 'id' | 'status' | 'currentLoan'>) => void;
  importEquipmentBatch: (items: Omit<EquipmentItem, 'id' | 'status' | 'currentLoan'>[]) => number;
  updateEquipmentItem: (id: string, updates: Partial<EquipmentItem>) => void;
  deleteEquipmentItem: (id: string) => void;

  // Categories
  categories: CategoryItem[];
  addCategory: (category: { id: string; name: string; description?: string }) => boolean;
  removeCategory: (id: string) => boolean;

  // Courses
  courses: UniversityCourse[];
  addCourse: (course: UniversityCourse) => boolean;
  removeCourse: (code: string) => boolean;

  // Borrowers
  borrowers: StudentBorrower[];
  addBorrower: (borrower: StudentBorrower) => boolean;
  removeBorrower: (id: string) => boolean;
  updateBorrower: (id: string, updates: Partial<StudentBorrower>) => void;

  resetAllData: () => void;
}

const DepotContext = createContext<DepotContextType | undefined>(undefined);

export const DepotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load persistent state
  const [equipment, setEquipment] = useState<EquipmentItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EQUIPMENT);
      return saved ? JSON.parse(saved) : INITIAL_EQUIPMENT;
    } catch {
      return INITIAL_EQUIPMENT;
    }
  });

  const [loanHistory, setLoanHistory] = useState<LoanRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOANS);
      return saved ? JSON.parse(saved) : INITIAL_LOAN_HISTORY;
    } catch {
      return INITIAL_LOAN_HISTORY;
    }
  });

  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TICKETS);
      return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_TICKETS;
    } catch {
      return INITIAL_MAINTENANCE_TICKETS;
    }
  });

  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SYNC_QUEUE);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [groups, setGroups] = useState<EquipmentGroup[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GROUPS);
      return saved ? JSON.parse(saved) : INITIAL_GROUPS;
    } catch {
      return INITIAL_GROUPS;
    }
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [courses, setCourses] = useState<UniversityCourse[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COURSES);
      return saved ? JSON.parse(saved) : UNIVERSITY_COURSES;
    } catch {
      return UNIVERSITY_COURSES;
    }
  });

  const [borrowers, setBorrowers] = useState<StudentBorrower[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BORROWERS);
      return saved ? JSON.parse(saved) : PRESET_STUDENTS;
    } catch {
      return PRESET_STUDENTS;
    }
  });

  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROLE);
      return saved === 'crew' ? 'crew' : 'manager';
    } catch {
      return 'manager';
    }
  });

  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(false);
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const effectiveOnline = isNetworkOnline && !isOfflineSimulated;

  // Persist items
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EQUIPMENT, JSON.stringify(equipment));
    } catch (e) {
      console.error(e);
    }
  }, [equipment]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOANS, JSON.stringify(loanHistory));
    } catch (e) {
      console.error(e);
    }
  }, [loanHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(maintenanceTickets));
    } catch (e) {
      console.error(e);
    }
  }, [maintenanceTickets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SYNC_QUEUE, JSON.stringify(syncQueue));
    } catch (e) {
      console.error(e);
    }
  }, [syncQueue]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(groups));
    } catch (e) {
      console.error(e);
    }
  }, [groups]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses));
    } catch (e) {
      console.error(e);
    }
  }, [courses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BORROWERS, JSON.stringify(borrowers));
    } catch (e) {
      console.error(e);
    }
  }, [borrowers]);

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsNetworkOnline(true);
    const handleOffline = () => setIsNetworkOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem(STORAGE_KEY_ROLE, newRole);
    addToast({
      type: 'info',
      title: `Switched to ${newRole === 'manager' ? 'Cage Supervisor' : 'Check-out Crew'}`,
      message: `Permissions updated for ${newRole === 'manager' ? 'full fleet management & reports' : 'student check-outs, returns & inspection mode'}.`
    });
  };

  const toggleOfflineSimulation = () => {
    setIsOfflineSimulated(prev => {
      const next = !prev;
      addToast({
        type: next ? 'warning' : 'success',
        title: next ? 'Simulated Field Mode (Offline)' : 'Online Cloud Connection Restored',
        message: next
          ? 'Network simulated off. Checkouts and digital signatures will buffer to local sync queue.'
          : 'Back online. Any pending sync queue actions can now cloud-replicate.'
      });
      return next;
    });
  };

  const syncNow = () => {
    if (!effectiveOnline) {
      addToast({
        type: 'warning',
        title: 'Cannot Synchronize',
        message: 'Device is offline. Connect to network or disable offline simulation to sync with depot cloud.'
      });
      return;
    }
    const count = syncQueue.length;
    setSyncQueue([]);
    setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    addToast({
      type: 'success',
      title: 'Cloud Synchronization Complete',
      message: count > 0 ? `Successfully reconciled ${count} queued field operation(s) with master depot database.` : 'Depot catalog is completely in sync with cloud server.'
    });
  };

  // Automated Overdue and Maintenance calculations
  const overdueItems = useMemo(() => {
    const now = new Date().toISOString();
    return equipment.filter(item => {
      if (item.status === 'overdue') return true;
      if (item.status === 'checked_out' && item.currentLoan) {
        return item.currentLoan.dueDate < now;
      }
      return false;
    });
  }, [equipment]);

  const upcomingServiceItems = useMemo(() => {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return equipment.filter(item => {
      if (!item.maintenanceSchedule?.nextServiceDate) return false;
      const serviceDate = new Date(item.maintenanceSchedule.nextServiceDate);
      return serviceDate <= in7Days;
    });
  }, [equipment]);

  const availableCount = useMemo(() => equipment.filter(e => e.status === 'available').length, [equipment]);
  const checkedOutCount = useMemo(() => equipment.filter(e => e.status === 'checked_out' || e.status === 'overdue').length, [equipment]);
  const maintenanceCount = useMemo(() => equipment.filter(e => e.status === 'maintenance' || e.status === 'damaged').length, [equipment]);

  // Checkout item
  const checkoutItem = (equipmentId: string, loanData: {
    studentName: string;
    studentId: string;
    studentEmail: string;
    course: string;
    facultyAdvisor: string;
    projectTitle: string;
    dueDate: string;
    signature: string;
    notes: string;
  }) => {
    const item = equipment.find(e => e.id === equipmentId);
    if (!item) return false;

    const loanId = `LN-${Date.now().toString().slice(-6)}`;
    const checkoutDate = new Date().toISOString();

    const newLoan = {
      id: loanId,
      studentName: loanData.studentName,
      studentId: loanData.studentId,
      studentEmail: loanData.studentEmail,
      course: loanData.course,
      facultyAdvisor: loanData.facultyAdvisor,
      projectTitle: loanData.projectTitle,
      checkoutDate,
      dueDate: loanData.dueDate,
      checkoutStaff: role === 'manager' ? 'Cage Supervisor' : 'Check-out Tech',
      studentSignature: loanData.signature,
      notes: loanData.notes
    };

    setEquipment(prev => prev.map(eq => {
      if (eq.id === equipmentId) {
        return {
          ...eq,
          status: 'checked_out',
          currentLoan: newLoan
        };
      }
      return eq;
    }));

    // Record in loan history
    const record: LoanRecord = {
      id: loanId,
      equipmentId: item.id,
      equipmentName: item.name,
      equipmentBarcode: item.barcode,
      studentName: loanData.studentName,
      studentId: loanData.studentId,
      studentEmail: loanData.studentEmail,
      course: loanData.course,
      projectTitle: loanData.projectTitle,
      checkoutDate,
      dueDate: loanData.dueDate,
      returnDate: null,
      checkoutSignature: loanData.signature,
      returnSignature: null,
      status: 'active',
      verifiedByStaff: role === 'manager' ? 'Cage Supervisor' : 'Check-out Tech'
    };

    setLoanHistory(prev => [record, ...prev]);

    // Handle offline queue
    if (!effectiveOnline) {
      setSyncQueue(prev => [...prev, {
        id: `SQ-${Date.now()}`,
        action: 'checkout',
        description: `Checked out ${item.name} to ${loanData.studentName} (${loanData.course})`,
        timestamp: new Date().toISOString(),
        payload: { equipmentId, newLoan },
        status: 'pending'
      }]);
    }

    playScanSuccessTone();
    addToast({
      type: 'success',
      title: 'Equipment Loan Issued',
      message: `${item.name} checked out to ${loanData.studentName}. Due: ${new Date(loanData.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.`
    });

    return true;
  };

  // Return item
  const returnItem = (equipmentId: string, returnData: {
    condition: EquipmentCondition;
    notes: string;
    signature: string;
    staffName: string;
  }) => {
    const item = equipment.find(e => e.id === equipmentId);
    if (!item || !item.currentLoan) return false;

    const returnTimestamp = new Date().toISOString();
    const loanId = item.currentLoan.id;

    // Update loan history
    setLoanHistory(prev => prev.map(rec => {
      if (rec.id === loanId || (rec.equipmentId === equipmentId && rec.status === 'active')) {
        return {
          ...rec,
          returnDate: returnTimestamp,
          returnCondition: returnData.condition,
          returnNotes: returnData.notes,
          returnSignature: returnData.signature,
          status: 'returned'
        };
      }
      return rec;
    }));

    // Determine target status
    const targetStatus = returnData.condition === 'needs_service' ? 'maintenance' : 'available';

    setEquipment(prev => prev.map(eq => {
      if (eq.id === equipmentId) {
        return {
          ...eq,
          status: targetStatus,
          condition: returnData.condition,
          currentLoan: null
        };
      }
      return eq;
    }));

    if (!effectiveOnline) {
      setSyncQueue(prev => [...prev, {
        id: `SQ-${Date.now()}`,
        action: 'return',
        description: `Returned ${item.name} (${returnData.condition})`,
        timestamp: returnTimestamp,
        payload: { equipmentId, returnData },
        status: 'pending'
      }]);
    }

    playScanSuccessTone();
    addToast({
      type: 'success',
      title: 'Equipment Returned to Cage',
      message: `${item.name} returned and verified by ${returnData.staffName}. Condition: ${returnData.condition}.`
    });

    return true;
  };

  // Report Damage & dispatch email to maintenance
  const reportDamage = (data: {
    equipmentId: string;
    severity: 'minor' | 'major' | 'critical';
    issueType: 'physical_damage' | 'sensor_dust' | 'electronic_fault' | 'lost_accessory' | 'routine_calibration';
    description: string;
    photoUrl?: string | null;
    reportedBy: string;
  }) => {
    const item = equipment.find(e => e.id === data.equipmentId);
    const itemName = item?.name || 'Equipment';
    const barcode = item?.barcode || 'N/A';
    const serial = item?.serialNumber || 'N/A';
    const ticketId = `TKT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const nowIso = new Date().toISOString();

    const newTicket: MaintenanceTicket = {
      id: ticketId,
      equipmentId: data.equipmentId,
      equipmentName: itemName,
      barcode,
      reportedBy: data.reportedBy,
      reportDate: nowIso,
      severity: data.severity,
      issueType: data.issueType,
      description: data.description,
      photoUrl: data.photoUrl || null,
      status: 'open',
      emailDispatched: true,
      dispatchedTo: 'film-maintenance@university.edu',
      dispatchTimestamp: nowIso
    };

    setMaintenanceTickets(prev => [newTicket, ...prev]);

    // Transition equipment to maintenance or damaged
    setEquipment(prev => prev.map(eq => {
      if (eq.id === data.equipmentId) {
        return {
          ...eq,
          status: data.severity === 'critical' ? 'damaged' : 'maintenance',
          condition: 'needs_service'
        };
      }
      return eq;
    }));

    if (!effectiveOnline) {
      setSyncQueue(prev => [...prev, {
        id: `SQ-${Date.now()}`,
        action: 'damage_report',
        description: `Damage reported for ${itemName}: ${data.severity.toUpperCase()}`,
        timestamp: nowIso,
        payload: newTicket,
        status: 'pending'
      }]);
    }

    const emailPreview: EmailPreviewData = {
      recipient: 'film-maintenance@university.edu',
      sender: `${data.reportedBy} <cage-dispatch@university.edu>`,
      subject: `[CINETRACK ALERT] ${data.severity.toUpperCase()} Damage Report: ${itemName} (${barcode})`,
      equipmentName: itemName,
      barcode,
      serialNumber: serial,
      severity: data.severity,
      description: data.description,
      reportedBy: data.reportedBy,
      timestamp: new Date().toLocaleString(),
      ticketId
    };

    addToast({
      type: 'warning',
      title: 'Incident Logged & Email Dispatched',
      message: `Ticket ${ticketId} created. Automated notification dispatched to film-maintenance@university.edu.`
    });

    return { ticket: newTicket, emailPreview };
  };

  const scheduleService = (equipmentId: string, schedule: {
    nextServiceDate: string;
    serviceType: string;
    intervalDays: number;
    technician: string;
    notes: string;
  }) => {
    setEquipment(prev => prev.map(eq => {
      if (eq.id === equipmentId) {
        return {
          ...eq,
          maintenanceSchedule: {
            ...eq.maintenanceSchedule,
            ...schedule,
            lastServicedDate: new Date().toISOString().split('T')[0]
          }
        };
      }
      return eq;
    }));

    addToast({
      type: 'success',
      title: 'Maintenance Schedule Updated',
      message: `Next service booked for ${schedule.nextServiceDate}.`
    });
  };

  const resolveTicket = (ticketId: string, notes: string) => {
    const ticket = maintenanceTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    setMaintenanceTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'resolved',
          resolutionNotes: notes,
          resolvedDate: new Date().toISOString()
        };
      }
      return t;
    }));

    // If equipment was in maintenance due to this ticket, mark available
    setEquipment(prev => prev.map(eq => {
      if (eq.id === ticket.equipmentId) {
        return {
          ...eq,
          status: 'available',
          condition: 'good'
        };
      }
      return eq;
    }));

    addToast({
      type: 'success',
      title: 'Maintenance Ticket Resolved',
      message: `${ticket.equipmentName} restored to available status in cage.`
    });
  };

  const addNewEquipment = (itemData: Omit<EquipmentItem, 'id' | 'status' | 'currentLoan'>) => {
    const id = `EQ-${itemData.brand.toUpperCase().slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newItem: EquipmentItem = {
      ...itemData,
      id,
      status: 'available',
      currentLoan: null
    };

    setEquipment(prev => [newItem, ...prev]);
    addToast({
      type: 'success',
      title: 'New Equipment Registered',
      message: `${newItem.name} registered with barcode ${newItem.barcode}.`
    });
  };

  const importEquipmentBatch = (itemsData: Omit<EquipmentItem, 'id' | 'status' | 'currentLoan'>[]): number => {
    if (!itemsData || itemsData.length === 0) return 0;

    const newItems: EquipmentItem[] = itemsData.map((itemData, index) => {
      const id = `EQ-${itemData.brand.toUpperCase().slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}-${index + 1}`;
      return {
        ...itemData,
        id,
        status: 'available',
        currentLoan: null
      };
    });

    setEquipment(prev => [...newItems, ...prev]);
    playScanSuccessTone();
    addToast({
      type: 'success',
      title: 'Bulk CSV Import Succeeded',
      message: `Successfully imported and registered ${newItems.length} assets into depot ledger.`
    });

    return newItems.length;
  };

  const updateEquipmentItem = (id: string, updates: Partial<EquipmentItem>) => {
    setEquipment(prev => prev.map(eq => eq.id === id ? { ...eq, ...updates } : eq));
    addToast({
      type: 'info',
      title: 'Equipment Updated',
      message: 'Asset details and specifications saved.'
    });
  };

  const deleteEquipmentItem = (id: string) => {
    const item = equipment.find(e => e.id === id);
    setEquipment(prev => prev.filter(eq => eq.id !== id));
    addToast({
      type: 'info',
      title: 'Equipment Removed',
      message: `${item?.name || 'Item'} decommissioned from depot inventory.`
    });
  };

  const addGroup = (groupData: Omit<EquipmentGroup, 'id' | 'createdAt'>) => {
    const newGroup: EquipmentGroup = {
      ...groupData,
      id: `GRP-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setGroups(prev => [newGroup, ...prev]);
    addToast({
      type: 'success',
      title: 'Equipment Kit Group Created',
      message: `"${newGroup.name}" created with ${newGroup.itemIds.length} bundled assets.`
    });
  };

  const updateGroup = (id: string, updates: Partial<EquipmentGroup>) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    addToast({
      type: 'info',
      title: 'Kit Group Updated',
      message: 'Group package configuration updated.'
    });
  };

  const deleteGroup = (id: string) => {
    const g = groups.find(group => group.id === id);
    setGroups(prev => prev.filter(group => group.id !== id));
    addToast({
      type: 'info',
      title: 'Kit Group Disbanded',
      message: `"${g?.name || 'Group'}" unbundled. Individual assets remain in inventory.`
    });
  };

  const checkoutGroup = (groupId: string, loanData: any) => {
    const g = groups.find(group => group.id === groupId);
    if (!g) return false;

    const availableItems = equipment.filter(e => g.itemIds.includes(e.id) && e.status === 'available');
    if (availableItems.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Available Items in Kit',
        message: 'All equipment in this package is currently on loan or in maintenance.'
      });
      return false;
    }

    availableItems.forEach(item => {
      checkoutItem(item.id, {
        ...loanData,
        notes: `[Kit Loan: ${g.name}] ${loanData.notes || ''}`
      });
    });

    addToast({
      type: 'success',
      title: `Kit Package Checked Out (${availableItems.length} items)`,
      message: `"${g.name}" checked out to ${loanData.studentName}. Manifest verified.`
    });
    return true;
  };

  const returnGroup = (groupId: string, returnData: any) => {
    const g = groups.find(group => group.id === groupId);
    if (!g) return false;

    const activeItems = equipment.filter(e => g.itemIds.includes(e.id) && (e.status === 'checked_out' || e.status === 'overdue'));
    if (activeItems.length === 0) {
      addToast({
        type: 'info',
        title: 'No Active Loans in Kit',
        message: 'All items in this group are already in the depot.'
      });
      return false;
    }

    activeItems.forEach(item => {
      returnItem(item.id, {
        ...returnData,
        notes: `[Kit Return: ${g.name}] ${returnData.notes || ''}`
      });
    });

    addToast({
      type: 'success',
      title: `Kit Restocked (${activeItems.length} items)`,
      message: `All items for "${g.name}" checked in and verified by ${returnData.staffName}.`
    });
    return true;
  };

  // Categories management
  const addCategory = (categoryData: { id: string; name: string; description?: string }): boolean => {
    const cleanId = categoryData.id.trim().toLowerCase().replace(/[\s-]+/g, '_');
    if (!cleanId || !categoryData.name.trim()) {
      addToast({
        type: 'warning',
        title: 'Invalid Category Details',
        message: 'Category identifier and display name are required.'
      });
      return false;
    }

    if (categories.some(c => c.id === cleanId || c.name.toLowerCase() === categoryData.name.trim().toLowerCase())) {
      addToast({
        type: 'warning',
        title: 'Category Already Exists',
        message: `Category "${categoryData.name}" or code "${cleanId}" is already registered.`
      });
      return false;
    }

    const newCat: CategoryItem = {
      id: cleanId,
      name: categoryData.name.trim(),
      description: categoryData.description?.trim() || `${categoryData.name} gear inventory`
    };

    setCategories(prev => [...prev, newCat]);
    addToast({
      type: 'success',
      title: 'Category Created',
      message: `Asset category "${newCat.name}" is now available across depot.`
    });
    return true;
  };

  const removeCategory = (id: string): boolean => {
    const count = equipment.filter(e => e.category === id).length;
    if (count > 0) {
      addToast({
        type: 'error',
        title: 'Cannot Remove Category',
        message: `${count} equipment item(s) are currently categorized under "${id}". Reassign or delete those assets first.`
      });
      return false;
    }

    const target = categories.find(c => c.id === id);
    setCategories(prev => prev.filter(c => c.id !== id));
    addToast({
      type: 'info',
      title: 'Category Removed',
      message: `Asset category "${target?.name || id}" removed from catalog.`
    });
    return true;
  };

  // Courses management
  const addCourse = (courseData: UniversityCourse): boolean => {
    const cleanCode = courseData.code.trim().toUpperCase();
    if (!cleanCode || !courseData.title.trim()) {
      addToast({
        type: 'warning',
        title: 'Invalid Course Details',
        message: 'Course code and title are required.'
      });
      return false;
    }

    if (courses.some(c => c.code === cleanCode)) {
      addToast({
        type: 'warning',
        title: 'Course Code Exists',
        message: `Course "${cleanCode}" is already in the curriculum directory.`
      });
      return false;
    }

    const newCourse: UniversityCourse = {
      code: cleanCode,
      title: courseData.title.trim(),
      faculty: courseData.faculty.trim() || 'Department Faculty',
      description: courseData.description?.trim() || 'Film studies curriculum course'
    };

    setCourses(prev => [...prev, newCourse]);
    addToast({
      type: 'success',
      title: 'Course Added',
      message: `${newCourse.code}: ${newCourse.title} added to curriculum.`
    });
    return true;
  };

  const removeCourse = (code: string): boolean => {
    const activeLoansCount = equipment.filter(e => e.currentLoan?.course === code || e.currentLoan?.course.startsWith(code)).length;
    if (activeLoansCount > 0) {
      addToast({
        type: 'error',
        title: 'Cannot Remove Course',
        message: `There are ${activeLoansCount} active equipment loans tagged to course "${code}". Complete those returns first.`
      });
      return false;
    }

    setCourses(prev => prev.filter(c => c.code !== code));
    addToast({
      type: 'info',
      title: 'Course Removed',
      message: `Course ${code} removed from film studies curriculum.`
    });
    return true;
  };

  // Borrowers management
  const addBorrower = (borrowerData: StudentBorrower): boolean => {
    const cleanId = borrowerData.id.trim().toUpperCase();
    if (!cleanId || !borrowerData.name.trim()) {
      addToast({
        type: 'warning',
        title: 'Invalid Student Details',
        message: 'Student ID and name are required.'
      });
      return false;
    }

    if (borrowers.some(b => b.id === cleanId)) {
      addToast({
        type: 'warning',
        title: 'Borrower ID Exists',
        message: `Student ID "${cleanId}" is already registered in the directory.`
      });
      return false;
    }

    const newBorrower: StudentBorrower = {
      id: cleanId,
      name: borrowerData.name.trim(),
      email: borrowerData.email.trim() || `${borrowerData.name.toLowerCase().replace(/\s+/g, '.')}@university.edu`,
      course: borrowerData.course.trim() || courses[0]?.code || 'FILM 401',
      project: borrowerData.project.trim() || 'Academic Production Project',
      notes: borrowerData.notes?.trim()
    };

    setBorrowers(prev => [newBorrower, ...prev]);
    addToast({
      type: 'success',
      title: 'Borrower Registered',
      message: `${newBorrower.name} (${newBorrower.id}) added to borrowing directory.`
    });
    return true;
  };

  const removeBorrower = (id: string): boolean => {
    const activeLoan = equipment.find(e => e.currentLoan?.studentId === id);
    if (activeLoan) {
      addToast({
        type: 'error',
        title: 'Cannot Remove Active Borrower',
        message: `${activeLoan.currentLoan?.studentName} currently has "${activeLoan.name}" on loan. Return equipment before removing borrower.`
      });
      return false;
    }

    const target = borrowers.find(b => b.id === id);
    setBorrowers(prev => prev.filter(b => b.id !== id));
    addToast({
      type: 'info',
      title: 'Borrower Removed',
      message: `${target?.name || id} removed from borrowing directory.`
    });
    return true;
  };

  const updateBorrower = (id: string, updates: Partial<StudentBorrower>) => {
    setBorrowers(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    addToast({
      type: 'info',
      title: 'Borrower Updated',
      message: 'Student profile and course details updated.'
    });
  };

  const resetAllData = () => {
    setEquipment(INITIAL_EQUIPMENT);
    setLoanHistory(INITIAL_LOAN_HISTORY);
    setMaintenanceTickets(INITIAL_MAINTENANCE_TICKETS);
    setGroups(INITIAL_GROUPS);
    setCategories(INITIAL_CATEGORIES);
    setCourses(UNIVERSITY_COURSES);
    setBorrowers(PRESET_STUDENTS);
    setSyncQueue([]);
    localStorage.removeItem(STORAGE_KEY_EQUIPMENT);
    localStorage.removeItem(STORAGE_KEY_LOANS);
    localStorage.removeItem(STORAGE_KEY_TICKETS);
    localStorage.removeItem(STORAGE_KEY_GROUPS);
    localStorage.removeItem(STORAGE_KEY_CATEGORIES);
    localStorage.removeItem(STORAGE_KEY_COURSES);
    localStorage.removeItem(STORAGE_KEY_BORROWERS);
    localStorage.removeItem(STORAGE_KEY_SYNC_QUEUE);
    addToast({
      type: 'info',
      title: 'Database Reset to University Defaults',
      message: 'Catalog, categories, courses, borrowers, kits, and loans refreshed.'
    });
  };

  return (
    <DepotContext.Provider
      value={{
        equipment,
        loanHistory,
        maintenanceTickets,
        syncQueue,
        groups,
        role,
        isOfflineSimulated,
        isNetworkOnline,
        effectiveOnline,
        lastSyncTime,
        toasts,
        overdueItems,
        upcomingServiceItems,
        availableCount,
        checkedOutCount,
        maintenanceCount,
        setRole,
        toggleOfflineSimulation,
        syncNow,
        addToast,
        removeToast,
        checkoutItem,
        returnItem,
        reportDamage,
        scheduleService,
        resolveTicket,
        addNewEquipment,
        importEquipmentBatch,
        updateEquipmentItem,
        deleteEquipmentItem,
        addGroup,
        updateGroup,
        deleteGroup,
        checkoutGroup,
        returnGroup,
        categories,
        addCategory,
        removeCategory,
        courses,
        addCourse,
        removeCourse,
        borrowers,
        addBorrower,
        removeBorrower,
        updateBorrower,
        resetAllData
      }}
    >
      {children}
    </DepotContext.Provider>
  );
};

export const useDepot = () => {
  const context = useContext(DepotContext);
  if (!context) {
    throw new Error('useDepot must be used within a DepotProvider');
  }
  return context;
};
