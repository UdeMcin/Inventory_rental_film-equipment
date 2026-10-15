export type EquipmentCategory = string;

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
}

export interface UniversityCourse {
  code: string;
  title: string;
  faculty: string;
  description?: string;
}

export interface StudentBorrower {
  id: string;
  name: string;
  email: string;
  course: string;
  project: string;
  notes?: string;
}

export type EquipmentStatus = 'available' | 'checked_out' | 'maintenance' | 'overdue' | 'damaged';

export type EquipmentCondition = 'pristine' | 'good' | 'fair' | 'needs_service';

export type UserRole = 'manager' | 'crew';

export interface CurrentLoan {
  id: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  course: string;
  facultyAdvisor: string;
  projectTitle: string;
  checkoutDate: string; // ISO
  dueDate: string; // ISO
  checkoutStaff: string;
  studentSignature: string; // Data URL SVG or PNG
  notes: string;
}

export interface MaintenanceSchedule {
  lastServicedDate: string;
  nextServiceDate: string;
  serviceType: string;
  intervalDays: number;
  technician: string;
  notes: string;
}

export interface EquipmentItem {
  id: string;
  barcode: string;
  name: string;
  model: string;
  brand: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  condition: EquipmentCondition;
  serialNumber: string;
  location: string;
  eligibleCourses: string[];
  replacementValue: number;
  specs: Record<string, string>;
  maintenanceSchedule: MaintenanceSchedule;
  currentLoan: CurrentLoan | null;
}

export interface LoanRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  equipmentBarcode: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  course: string;
  projectTitle: string;
  checkoutDate: string;
  dueDate: string;
  returnDate: string | null;
  returnCondition?: EquipmentCondition;
  returnNotes?: string;
  checkoutSignature: string;
  returnSignature: string | null;
  status: 'active' | 'returned' | 'overdue';
  verifiedByStaff: string;
}

export interface MaintenanceTicket {
  id: string;
  equipmentId: string;
  equipmentName: string;
  barcode: string;
  reportedBy: string;
  reportDate: string;
  severity: 'minor' | 'major' | 'critical';
  issueType: 'physical_damage' | 'sensor_dust' | 'electronic_fault' | 'lost_accessory' | 'routine_calibration';
  description: string;
  photoUrl: string | null;
  status: 'open' | 'in_repair' | 'resolved';
  emailDispatched: boolean;
  dispatchedTo: string;
  dispatchTimestamp: string;
  resolutionNotes?: string;
  resolvedDate?: string;
}

export interface SyncQueueItem {
  id: string;
  action: 'checkout' | 'return' | 'damage_report' | 'schedule_service' | 'update_equipment';
  description: string;
  timestamp: string;
  payload: any;
  status: 'pending' | 'synced';
}

export interface EquipmentGroup {
  id: string;
  name: string;
  description: string;
  targetCourse: string;
  itemIds: string[];
  createdAt: string;
}

export interface AiRecognitionResult {
  identifiedEquipmentName: string;
  confidenceScore: number;
  matchedCatalogId: string | null;
  detectedCategory: EquipmentCategory | 'accessory' | 'unknown';
  conditionAssessment: 'pristine' | 'good' | 'fair' | 'damaged';
  visibleDefects: string[];
  opticalCleanlinessNotes: string;
  accessoriesDetected: string[];
  summaryNotes: string;
  recommendedAction: 'checkout' | 'return_checkin' | 'file_maintenance' | 'clean_optics';
}
