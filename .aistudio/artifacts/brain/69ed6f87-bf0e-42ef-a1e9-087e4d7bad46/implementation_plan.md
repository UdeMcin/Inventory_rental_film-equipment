# CineTrack Pro: University Film Studies Equipment Depot & Checkout OS

CineTrack Pro is a specialized equipment checkout, maintenance scheduling, and fleet management platform tailored for University Film Studies and Media Production departments. Designed for university equipment cages and media depots, it streamlines student borrowing for coursework and thesis productions without rental fees. It features real-time availability tracking, barcode/student ID scanning, overdue return alerts, digital custody signatures, instant damage reporting with automated email dispatch to maintenance, and academic usage reports.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Academic Context & Fee Elimination**:
> - **Zero Rental Fees**: All rental pricing, deposits, and daily rental rates are eliminated in favor of university student loans, student ID tracking, course codes (e.g. *FILM 401: Senior Thesis*, *CINE 210: Cinematography I*, *DOC 320: Documentary Practicum*), and faculty advisor assignments.
> - **Academic Monthly Usage Reports**: The analytics dashboard tracks student borrowing volume, course and project utilization, peak loan periods across the academic semester, gear turnaround times, return compliance rates, and preventative maintenance downtime.
> - **Two-Tier University Roles**:
>   - **Equipment Cage Manager (Lab Coordinator / Faculty Supervisor)**: Fleet catalog oversight, course gear allocations, maintenance and calibration schedules, damage resolutions, policy settings, and academic usage reports.
>   - **Check-out Crew (Student Depot Worker / Tech Assistant)**: High-speed barcode scanning for check-out and return, student ID lookup, digital student signature custody agreements, gear return inspections, and instant damage reporting with maintenance dispatch.
> - **Offline & Field Shoot Capability**: Offline-first IndexedDB repository with automatic synchronization queue, enabling student check-ins and check-outs on remote field shoots, soundstages, or external filming locations with zero network connectivity.

---

## 1. Overview & Academic Concept

### What It Does
University film departments manage hundreds of thousands of dollars in cinema cameras, prime lenses, sound packages, and lighting kits. CineTrack Pro gives the equipment cage complete control over student borrowing:
1. **Live Equipment Availability**: Real-time status indicators (Available in Cage, Checked Out to Student, In Maintenance / Calibration, Overdue for Class Return).
2. **Barcode & Student ID Scanning**: Rapid barcode and QR scanning for gear serials and student university badges using device cameras or manual entry.
3. **Overdue Return & Hold Alerts**: Immediate automated alerts for equipment not returned by class deadlines or call-sheet wrap times, with overdue flag notifications.
4. **Digital Custody Signatures**: Built-in canvas signature pad for students to sign academic custody agreements and equipment condition return slips.
5. **Instant Damage & Incident Dispatch**: Comprehensive damage reporting form (with photographic upload simulation and severity rating) that immediately formats and dispatches email alerts to `film-maintenance@university.edu`.
6. **Academic Monthly Usage & Semester Analytics**: Detailed breakdown of gear utilization by course, student major, camera tier, and maintenance wear-and-tear, exportable to CSV/PDF for department chair and provost reporting.
7. **Cross-Platform & Offline-Ready**: Works smoothly across desktop workstations in the cage (Mac, PC) and mobile tablets/phones on student sets (iOS, Android).

### Target Audience & Persona
- **Cage Managers & Film Lab Supervisors**: Managing asset inventory, equipment safety, calibration schedules, and course reservations.
- **Student Cage Workers & Film Techs**: Logging outgoing and incoming packages, inspecting returned gear, and assisting fellow film students.
- **Film Students & Directors / Cinematographers**: Borrowing cinema packages for coursework and student thesis films, signing custody forms.

---

## 2. User Experience & Visual Design

### Aesthetic Direction & Visual Identity
- **Modern Studio Crisp (Film School Edition)**: Crisp slate canvas (`slate-950` / `white`), university indigo accent (`indigo-600` / `indigo-400`), clean tabular typography, and dark/light mode toggle.
- **Zero-Pill Typography**: Clear, unboxed status tags and metadata separated by typographic bullets (`·`), avoiding cluttered badge boxes.
- **Ergonomic Field Views**: Clean desktop data grids for cage dispatchers, paired with thumb-friendly touch targets on mobile devices for students and techs on set.

### Key Academic User Flows

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STUDENT BORROWING FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘
  [Scan Equipment Barcode] ──► [Scan / Enter Student ID & Course]
                                           │
                                  [Check-Out Review]
                                           │
                         [Student Signs Digital Custody Agreement]
                                           │
                         [Item Marked: Checked Out / Due Date Set]
                                           │
                                    (Student Shoots)
                                           │
  [Scan Barcode on Return] ──► [Condition Inspection & Check-In]
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
                [Pristine Condition]                  [Damage / Missing Part]
                        │                                     │
          [Digital Return Sign-off]             [Auto-Email to Maintenance]
                        │                                     │
             [Returned to Cage Shelf]               [Marked In Repair / Lab]
```

1. **Dashboard & Alert Center**: Quick metrics on total department assets, active student loans, equipment in maintenance, overdue returns, and upcoming service countdowns.
2. **Barcode Scanner & Fast Logger**: Camera viewport with scanning reticle, beep audio feedback, rapid student ID search, and batch check-out cart.
3. **Equipment Catalog**: Full cinema gear list categorized by Cameras (ARRI Alexa 35, RED V-Raptor, Sony FX6/FX9), Lenses (Cooke Panchro, Zeiss CP.3, Canon Cinema Primes), Lighting (Aputure 600d, Astera Titan Tubes), Audio (Sound Devices MixPre, Sennheiser MKH 416), and Grip.
4. **Digital Custody Signer**: Canvas signature pad with agreement terms, capturing student signature, student email, course name, and timestamp.
5. **Damage Report & Auto-Email Dispatch**: Direct damage ticket intake with severity selector, condition notes, and realistic auto-generated email alert sent to the maintenance team.
6. **Monthly Academic Usage Reports**: Charts and summaries illustrating monthly check-out volumes, course utilization rates, equipment downtime, and student return compliance.
7. **Offline Mode & Sync Queue**: Toggleable network simulator demonstrating offline local caching and auto-sync when back on university Wi-Fi.

---

## 3. Key Product Decisions & Trade-Offs

- **No Financial Calculations / 100% Academic Workflow**:
  - *Chosen Approach*: Replace rental rates, invoices, and deposits with course codes, student IDs, project titles, and faculty advisor fields.
  - *Why*: Perfectly aligns with university film school operations where gear is a departmental educational resource.
- **Automated Maintenance Dispatch System**:
  - *Chosen Approach*: Real-time incident logger that immediately generates an official dispatch email preview to `film-maintenance@university.edu` and logs the ticket in the maintenance queue.
  - *Why*: Ensures prompt inspection and repair without needing external SMTP configurations, while keeping a complete digital paper trail.
- **Two-Tier Role Switcher**:
  - *Chosen Approach*: Top bar role toggle between `Cage Manager` and `Check-out Crew / Student Tech` to test and demonstrate permission constraints.
  - *Why*: Allows easy evaluation of administrative vs. frontline student-worker capabilities.

---

## 4. Technical Architecture & Data Strategy

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    UNIVERSITY FILM DEPOT ARCHITECTURE                         │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │                          Presentation Layer                             │  │
│  │  - Top Bar Contract (Wordmark, Breadcrumbs, Role Switcher, Sync Status) │  │
│  │  - Cage Dashboard & Alert Banners (Overdue loans, maintenance dates)    │  │
│  │  - Camera Barcode & QR Scanner (Camera stream + audio beep feedback)    │  │
│  │  - Equipment Fleet Explorer (Specs, course restrictions, history)       │  │
│  │  - Student Digital Custody Pad (HTML5 Canvas signature capture)         │  │
│  │  - Incident & Damage Dispatcher (Email alert generator, repair status)  │  │
│  │  - Academic Usage & Semester Analytics (Charts, course breakdown, CSV)  │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                        │
│  ┌───────────────────────────────────▼─────────────────────────────────────┐  │
│  │                         State & Store Layer                             │  │
│  │  - Fleet & Loan Store (Reactive state with localStorage / IndexedDB)    │  │
│  │  - Offline Sync Queue (Captures checkouts/returns while disconnected)   │  │
│  │  - Alert & Notification Dispatcher (Calculates overdue class deadlines) │  │
│  │  - Barcode & QR Generator / Scanner Service                             │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                        │
│  ┌───────────────────────────────────▼─────────────────────────────────────┐  │
│  │                       Data Persistence Layer                            │  │
│  │  - LocalStorage / IndexedDB (Pre-seeded with university film inventory) │  │
│  │  - Offline Mutation Queue (Auto-replays pending tasks upon reconnect)   │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Academic Data Models

- **EquipmentItem**:
  - `id`: string (e.g. `EQ-ARRI-35-01`)
  - `barcode`: string (e.g. `BC-984210`)
  - `name`: string (e.g. `ARRI Alexa 35 Cinema Package`)
  - `category`: `'camera' | 'lens' | 'lighting' | 'audio' | 'grip' | 'monitoring'`
  - `status`: `'available' | 'checked_out' | 'maintenance' | 'overdue' | 'damaged'`
  - `serialNumber`: string
  - `eligibleCourses`: string[] (e.g., `["FILM 401", "CINE 310"]`)
  - `location`: string (e.g., `Cage Bay 1 - Shelf A`)
  - `currentLoan`: `{ studentName, studentId, studentEmail, course, projectTitle, checkoutDate, dueDate, signatureData } | null`
  - `maintenanceSchedule`: `{ lastServicedDate, nextServiceDate, serviceType, notes }`
  - `condition`: `'pristine' | 'good' | 'fair' | 'damaged'`
  - `specs`: Record<string, string>
- **BorrowingRecord**:
  - `id`: string
  - `equipmentId`: string
  - `studentName`: string
  - `studentId`: string
  - `studentEmail`: string
  - `course`: string
  - `projectTitle`: string
  - `checkoutDate`: string
  - `dueDate`: string
  - `returnDate`: string | null
  - `status`: `'active' | 'returned' | 'overdue'`
  - `checkoutSignature`: string
  - `returnSignature`: string | null
  - `inspectionNotes`: string
- **MaintenanceTicket & DamageReport**:
  - `id`: string
  - `equipmentId`: string
  - `reportedBy`: string
  - `reportDate`: string
  - `severity`: `'minor' | 'major' | 'total_loss'`
  - `description`: string
  - `emailDispatched`: boolean
  - `dispatchTimestamp`: string
  - `status`: `'open' | 'in_progress' | 'resolved'`

---

## 5. Verification Plan

1. **Compilation & Syntax**: Run `compile_applet` to ensure error-free TypeScript execution.
2. **Student Check-Out & Digital Signature**: Test check-out with student ID, course selection, and digital canvas signature; verify instant availability status change.
3. **Overdue & Service Alerts**: Verify items with passed due dates trigger prominent alert banners and overdue badges in the dashboard.
4. **Barcode Scanning**: Test camera barcode scanning and quick manual code/preset lookup.
5. **Damage Reporting & Maintenance Email Dispatch**: File a damage report with simulated photo attachment and inspect the dispatched email alert sent to the maintenance department.
6. **Academic Usage Analytics**: Verify monthly borrowing charts, course utilization breakdowns, and CSV export.
7. **Offline Mode Simulation**: Toggle offline mode, process check-ins and check-outs, verify sync queue counts, and verify automatic sync upon reconnection.
