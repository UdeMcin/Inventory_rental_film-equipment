import { EquipmentItem, LoanRecord, MaintenanceTicket, EquipmentGroup, CategoryItem, UniversityCourse, StudentBorrower } from '../types';

export const INITIAL_EQUIPMENT: EquipmentItem[] = [
  {
    id: 'EQ-ARRI-35-01',
    barcode: 'BC-109283',
    name: 'ARRI Alexa 35 Cinema Package',
    model: 'Alexa 35',
    brand: 'ARRI',
    category: 'camera',
    status: 'checked_out',
    condition: 'pristine',
    serialNumber: 'ARRI-35-88210',
    location: 'Vault Bay A-01',
    eligibleCourses: ['FILM 401', 'FILM 490', 'CINE 350'],
    replacementValue: 78500,
    specs: {
      Sensor: 'Super 35 4.6K Native',
      Mount: 'LPL / PL mount with LDS-2',
      Recording: 'Apple ProRes 4444 XQ / ARRIRAW',
      'Dynamic Range': '17 stops',
      Weight: '2.9 kg (body only)'
    },
    maintenanceSchedule: {
      lastServicedDate: '2026-09-10',
      nextServiceDate: '2026-10-18', // Upcoming in 4 days!
      serviceType: 'Sensor inspection, firmware verification & optical low pass cleaning',
      intervalDays: 45,
      technician: 'Marcus Vance (Chief Cine Tech)',
      notes: 'Scheduled for bi-monthly collimation verification.'
    },
    currentLoan: {
      id: 'LN-2026-104',
      studentName: 'Elena Rostova',
      studentId: 'STU-992144',
      studentEmail: 'e.rostova@university.edu',
      course: 'FILM 401: Senior Thesis Production',
      facultyAdvisor: 'Prof. David Cronenberg',
      projectTitle: 'Echoes of Silence (Thesis Film)',
      checkoutDate: '2026-10-12T09:00:00Z',
      dueDate: '2026-10-15T17:00:00Z', // Due tomorrow
      checkoutStaff: 'Sam Rodriguez (Depot Tech)',
      studentSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><path d="M10,25 Q40,5 70,25 T130,20 T150,30" stroke="%234f46e5" stroke-width="2" fill="none"/></svg>',
      notes: 'Includes EVF, Codex 2TB card, 4x B-Mount 150Wh batteries, and bridge plate.'
    }
  },
  {
    id: 'EQ-RED-RAPTOR-01',
    barcode: 'BC-109284',
    name: 'RED V-Raptor 8K VV Production Kit',
    model: 'V-Raptor 8K VV',
    brand: 'RED Digital Cinema',
    category: 'camera',
    status: 'overdue', // Overdue to demonstrate real-time overdue alerts!
    condition: 'good',
    serialNumber: 'RED-VR-44102',
    location: 'Vault Bay A-02',
    eligibleCourses: ['FILM 401', 'CINE 350'],
    replacementValue: 24500,
    specs: {
      Sensor: 'Full Frame 35.4 Megapixel CMOS',
      Resolution: '8192 x 4320 at up to 120 fps',
      Format: 'REDCODE RAW (16-bit) & ProRes',
      Mount: 'RF Mount with PL Adapter'
    },
    maintenanceSchedule: {
      lastServicedDate: '2026-08-20',
      nextServiceDate: '2026-11-20',
      serviceType: 'Cooling fan dust purge & calibration',
      intervalDays: 90,
      technician: 'Marcus Vance',
      notes: 'Sensor glass spotless.'
    },
    currentLoan: {
      id: 'LN-2026-098',
      studentName: 'Marcus Chen',
      studentId: 'STU-883921',
      studentEmail: 'm.chen@university.edu',
      course: 'CINE 350: Advanced Lighting & Camera',
      facultyAdvisor: 'Prof. Sarah Sterling',
      projectTitle: 'Neon Nocturne (Class Short)',
      checkoutDate: '2026-10-09T14:00:00Z',
      dueDate: '2026-10-13T12:00:00Z', // Was due yesterday!
      checkoutStaff: 'Maya Lin (Cage Supervisor)',
      studentSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><path d="M10,20 Q30,35 60,15 T110,25 T150,15" stroke="%234f46e5" stroke-width="2" fill="none"/></svg>',
      notes: 'URGENT: Student notified via automated alert. Borrowing hold applied to student record.'
    }
  },
  {
    id: 'EQ-SONY-FX9-01',
    barcode: 'BC-109285',
    name: 'Sony FX9 Full-Frame Cinema Package',
    model: 'PXW-FX9',
    brand: 'Sony',
    category: 'camera',
    status: 'available',
    condition: 'pristine',
    serialNumber: 'SN-FX9-77192',
    location: 'Cage Locker B-01',
    eligibleCourses: ['CINE 210', 'CINE 350', 'DOC 320', 'FILM 401'],
    replacementValue: 12000,
    specs: {
      Sensor: '6K Full-Frame Exmor R CMOS with 4K Oversampling',
      'Dual Base ISO': 'ISO 800 / ISO 4000',
      Autofocus: 'Fast Hybrid AF with Face/Eye Detection',
      Filter: 'Electronic Variable ND 1/4 to 1/128'
    },
    maintenanceSchedule: {
      lastServicedDate: '2026-09-28',
      nextServiceDate: '2026-12-28',
      serviceType: 'ND filter optical alignment & audio XLR check',
      intervalDays: 90,
      technician: 'Depot Staff',
      notes: 'In clean prep bay ready for checkout.'
    },
    currentLoan: null
  },
  {
    id: 'EQ-SONY-FX6-01',
    barcode: 'BC-109286',
    name: 'Sony FX6 Cinema Line Kit',
    model: 'ILME-FX6V',
    brand: 'Sony',
    category: 'camera',
    status: 'available',
    condition: 'pristine',
    serialNumber: 'SN-FX6-99312',
    location: 'Cage Locker B-02',
    eligibleCourses: ['CINE 210', 'DOC 220', 'DOC 320'],
    replacementValue: 6500,
    specs: {
      Sensor: '4K Full-Frame 10.2MP Back-Illuminated CMOS',
      Sensitivity: 'Expandable to ISO 409,600',
      Weight: '890g ultra-compact',
      Codec: 'XAVC-I 422 10-bit'
    },
    maintenanceSchedule: {
      lastServicedDate: '2026-10-01',
      nextServiceDate: '2026-10-17', // Upcoming service in 3 days!
      serviceType: 'Grip control handle connector test',
      intervalDays: 30,
      technician: 'Marcus Vance',
      notes: 'Upcoming check on top handle audio mini-jack.'
    },
    currentLoan: null
  },
  {
    id: 'EQ-COOKE-S4-SET',
    barcode: 'BC-201844',
    name: 'Cooke S4/i Cine Prime 4-Lens Set',
    model: 'S4/i Set (25, 32, 50, 75mm)',
    brand: 'Cooke',
    category: 'lens',
    status: 'checked_out',
    condition: 'good',
    serialNumber: 'COOKE-S4-401',
    location: 'Lens Vault Safe 1',
    eligibleCourses: ['FILM 401', 'CINE 350'],
    replacementValue: 48000,
    specs: {
      Aperture: 'T2.0 across all focal lengths',
      Mount: 'PL Mount with /i Technology metadata',
      Coverage: 'Super 35 format',
      Look: 'Signature warm Cooke Look with smooth skin tones'
    },
    maintenanceSchedule: {
      lastServicedDate: '2026-09-01',
      nextServiceDate: '2026-12-01',
      serviceType: 'Lens collimator focal bench test & barrel torque check',
      intervalDays: 90,
      technician: 'Master Optics Lab',
      notes: 'Glass pristine, zero haze or fungus.'
    },
    currentLoan: {
      id: 'LN-2026-105',
      studentName: 'Julian Alvarez',
      studentId: 'STU-940122',
      studentEmail: 'j.alvarez@university.edu',
      course: 'FILM 401: Senior Thesis Production',
      facultyAdvisor: 'Prof. David Cronenberg',
      projectTitle: 'The Last Rehearsal (Short Film)',
      checkoutDate: '2026-10-11T11:30:00Z',
      dueDate: '2026-10-16T15:00:00Z',
      checkoutStaff: 'Sam Rodriguez',
      studentSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><path d="M10,25 Q30,5 60,30 T120,10 T150,25" stroke="%234f46e5" stroke-width="2" fill="none"/></svg>',
      notes: 'Supplied in Pelican 1510 flight case with custom laser cut foam.'
    }
  },
  {
    id: 'EQ-ZEISS-CP3-SET',
    barcode: 'BC-201845',
    name: 'Zeiss CP.3 Compact Prime Set (28, 50, 85mm)',
    model: 'CP.3 Trio',
    brand: 'Zeiss',
    category: 'lens',
    status: 'available',
    condition: 'pristine',
    serialNumber: 'CP3-TRIO-882',
    location: 'Lens Vault Safe 2',
    eligibleCourses: ['CINE 210', 'CINE 350', 'DOC 320'],
    replacementValue: 14500,
    specs: {
      Aperture: 'T2.1',
      Mount: 'Interchangeable PL/EF Mount',
      Coverage: 'Full Frame sensor coverage',
      Coating: 'T* anti-reflective coating'
    },
    maintenanceSchedule: {
      lastServicedDate: '2026-09-15',
      nextServiceDate: '2026-12-15',
      serviceType: 'Focus ring smoothness & aperture click-stop check',
      intervalDays: 90,
      technician: 'Depot Staff',
      notes: 'Ready for loan.'
    },
    currentLoan: null
  },
  {
    id: 'EQ-APUTURE-600D-01',
    barcode: 'BC-304910',
    name: 'Aputure LS 600d Pro Daylight LED Kit',
    model: 'LS 600d Pro',
    brand: 'Aputure',
    category: 'lighting',
    status: 'available',
    condition: 'pristine',
    serialNumber: 'AP-600D-5512',
    location: 'Lighting Rack Bay C-1',
    eligibleCourses: ['CINE 210', 'CINE 350', 'FILM 401', 'DOC 320'],
    replacementValue: 1990,
    specs: {
      Output: '600W Daylight Point-Source LED (98,500 lux @ 1m)',
      CCT: '5600K Daylight',
      CRI: '96+, TLCI 96+',
      Mount: 'Bowens Mount with F10 Fresnel included',
      Weather: 'Weather-resistant IP54 rating'
    },
    maintenanceSchedule: {
      lastServicedDate: '2026-08-30',
      nextServiceDate: '2026-10-20',
      serviceType: 'Thermal ballast safety test & cable continuity',
      intervalDays: 60,
      technician: 'Marcus Vance',
      notes: 'Heavy duty rolling stand included.'
    },
    currentLoan: null
  },
  {
    id: 'EQ-ASTERA-TITAN-01',
    barcode: 'BC-304911',
    name: 'Astera Titan Tube 8-Light Charging Case',
    model: 'FP1 Titan 8-Tube Kit',
    brand: 'Astera',
    category: 'lighting',
    status: 'maintenance', // In maintenance to demonstrate maintenance queue
    condition: 'needs_service',
    serialNumber: 'AST-TITAN-889',
    location: 'Service Prep Bench 4',
    eligibleCourses: ['CINE 350', 'FILM 401'],
    replacementValue: 5600,
    specs: {
      LED: 'RGBMA Full Spectrum with ultra-high CRI 96',
      Control: 'CRMX Wireless DMX, Bluetooth app control',
      Battery: 'Up to 20 hours runtime on internal lithium battery',
      IP: 'IP65 waterproof rating'
    },
    maintenanceSchedule: {
      lastServicedDate: '2026-10-10',
      nextServiceDate: '2026-10-15',
      serviceType: 'Tube #4 battery cell cycle rebalance & charging contact cleaning',
      intervalDays: 30,
      technician: 'Marcus Vance',
      notes: 'Currently testing battery bank. Estimated release date: Oct 16.'
    },
    currentLoan: null
  },
  {
    id: 'EQ-SOUND-MIXPRE-01',
    barcode: 'BC-402918',
    name: 'Sound Devices MixPre-10 II 8-Channel Recorder',
    model: 'MixPre-10 II',
    brand: 'Sound Devices',
    category: 'audio',
    status: 'available',
    condition: 'pristine',
    serialNumber: 'SD-MP10-3301',
    location: 'Audio Locker A-3',
    eligibleCourses: ['FILM 240', 'DOC 320', 'FILM 401'],
    replacementValue: 1850,
    specs: {
      Preamps: '8 Kashmir ultra-low-noise discrete mic preamps',
      Recording: '32-bit float audio bit depth (zero clip guarantee)',
      Timecode: 'Internal ultra-accurate timecode generator/reader with HDMI sync',
      Inputs: '8 balanced XLR/TRS combination inputs'
    },
    maintenanceSchedule: {
      lastServicedDate: '2026-09-05',
      nextServiceDate: '2026-11-05',
      serviceType: '32-bit float analog-to-digital converter signal calibration',
      intervalDays: 60,
      technician: 'Sound Lab Tech',
      notes: 'Supplied with Orca audio mixer bag & Hirose battery distro.'
    },
    currentLoan: null
  },
  {
    id: 'EQ-SENN-416-01',
    barcode: 'BC-402919',
    name: 'Sennheiser MKH 416 Boom Microphone Rig',
    model: 'MKH 416-P48U3',
    brand: 'Sennheiser',
    category: 'audio',
    status: 'available',
    condition: 'good',
    serialNumber: 'SENN-416-190',
    location: 'Audio Locker A-4',
    eligibleCourses: ['FILM 240', 'CINE 210', 'DOC 220', 'DOC 320', 'FILM 401'],
    replacementValue: 1100,
    specs: {
      Type: 'Short shotgun interference tube microphone',
      Pattern: 'Supercardioid / Lobar',
      Capsule: 'RF condenser technology, impervious to outdoor humidity',
      Accessories: 'Rycote Super-Shield blimp, deadcat windshield, K-Tek carbon boompole'
    },
    maintenanceSchedule: {
      lastServicedDate: '2026-08-14',
      nextServiceDate: '2026-10-14', // Due for service today!
      serviceType: 'Boom internal coiled cable continuity & shockmount elastic test',
      intervalDays: 60,
      technician: 'Sound Lab Tech',
      notes: 'Due for periodic suspension band replacement.'
    },
    currentLoan: null
  },
  {
    id: 'EQ-TERADEK-BOLT-01',
    barcode: 'BC-508821',
    name: 'Teradek Bolt 4K LT 750 TX/RX Wireless Video',
    model: 'Bolt 4K LT 750',
    brand: 'Teradek',
    category: 'monitoring',
    status: 'available',
    condition: 'pristine',
    serialNumber: 'TD-BOLT-772',
    location: 'Video Village Locker C-2',
    eligibleCourses: ['CINE 350', 'FILM 401'],
    replacementValue: 2790,
    specs: {
      Range: '750 ft line-of-sight zero-delay (<0.001 sec)',
      Resolution: 'Up to 4K30p and 1080p60 over 12G-SDI & HDMI',
      Encryption: 'AES-256 with RSA 1024 key pairing'
    },
    maintenanceSchedule: {
      lastServicedDate: '2026-09-22',
      nextServiceDate: '2026-12-22',
      serviceType: 'RF spectrum frequency lock & antenna SMA socket torque',
      intervalDays: 90,
      technician: 'Marcus Vance',
      notes: 'All 7 paddle antennas inspected.'
    },
    currentLoan: null
  },
  {
    id: 'EQ-SMALLHD-CINE7-01',
    barcode: 'BC-508822',
    name: 'SmallHD Cine 7 Touchscreen Director Monitor',
    model: 'Cine 7 Smart 7',
    brand: 'SmallHD',
    category: 'monitoring',
    status: 'checked_out',
    condition: 'good',
    serialNumber: 'SHD-C7-6612',
    location: 'Video Village Locker C-3',
    eligibleCourses: ['CINE 210', 'CINE 350', 'FILM 401'],
    replacementValue: 1900,
    specs: {
      Screen: '7-inch 1920x1200 Daylight Viewable 1800 nits IPS',
      Tools: 'PageOS 5, EL Zone false color, custom 3D LUTs, waveform',
      Power: 'Gold-mount battery plate & 2-pin LEMO'
    },
    maintenanceSchedule: {
      lastServicedDate: '2026-09-12',
      nextServiceDate: '2026-11-12',
      serviceType: 'Screen colorimeter calibration with X-Rite probe',
      intervalDays: 60,
      technician: 'Marcus Vance',
      notes: 'Color profile rec.709 verified.'
    },
    currentLoan: {
      id: 'LN-2026-106',
      studentName: 'Tariq Al-Mansoor',
      studentId: 'STU-771890',
      studentEmail: 't.almansoor@university.edu',
      course: 'DOC 320: Documentary Practicum',
      facultyAdvisor: 'Prof. Laura Poitras',
      projectTitle: 'City Lights (Documentary)',
      checkoutDate: '2026-10-13T10:00:00Z',
      dueDate: '2026-10-16T12:00:00Z',
      checkoutStaff: 'Sam Rodriguez',
      studentSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><path d="M10,20 Q40,30 80,15 T130,25 T150,20" stroke="%234f46e5" stroke-width="2" fill="none"/></svg>',
      notes: 'Includes sunhood and side handle cage.'
    }
  },
  {
    id: 'EQ-RONIN-2-01',
    barcode: 'BC-601930',
    name: 'DJI Ronin 2 3-Axis Professional Gimbal Rig',
    model: 'Ronin 2 Professional Combo',
    brand: 'DJI',
    category: 'grip',
    status: 'available',
    condition: 'pristine',
    serialNumber: 'DJI-R2-9901',
    location: 'Grip Bay Locker G-1',
    eligibleCourses: ['CINE 350', 'FILM 401'],
    replacementValue: 7500,
    specs: {
      Payload: 'Up to 30 lbs (13.6 kg) supporting full cinema packages',
      Motors: 'High-torque brushless motors with GPS algorithm',
      Power: 'Dual TB50 hot-swappable batteries powering camera and accessories'
    },
    maintenanceSchedule: {
      lastServicedDate: '2026-09-02',
      nextServiceDate: '2026-11-02',
      serviceType: 'IMU sensor calibration, motor belt tensioning & grip ring lock check',
      intervalDays: 60,
      technician: 'Marcus Vance',
      notes: 'All tuning axes balanced.'
    },
    currentLoan: null
  },
  {
    id: 'EQ-EASYRIG-VARIO-01',
    barcode: 'BC-601931',
    name: 'Easyrig Vario 5 with Gimbal Rig Vest & Flowcine',
    model: 'Vario 5 + Serene',
    brand: 'Easyrig',
    category: 'grip',
    status: 'available',
    condition: 'good',
    serialNumber: 'ER-V5-4420',
    location: 'Grip Bay Locker G-2',
    eligibleCourses: ['CINE 210', 'CINE 350', 'DOC 320', 'FILM 401'],
    replacementValue: 4200,
    specs: {
      Payload: 'Adjustable line tension 5 to 17 kg (11 to 38 lbs)',
      Vest: 'Cinema Gimbal Rig Vest with broad hip support',
      Arm: 'Extended +130mm arm with Flowcine Serene vibration arm'
    },
    maintenanceSchedule: {
      lastServicedDate: '2026-08-25',
      nextServiceDate: '2026-10-25',
      serviceType: 'Spectra high-strength cord fray inspection & tension hex bolt test',
      intervalDays: 60,
      technician: 'Depot Staff',
      notes: 'Cord in pristine condition, zero wear.'
    },
    currentLoan: null
  }
];

export const INITIAL_MAINTENANCE_TICKETS: MaintenanceTicket[] = [
  {
    id: 'TKT-2026-041',
    equipmentId: 'EQ-ASTERA-TITAN-01',
    equipmentName: 'Astera Titan Tube 8-Light Charging Case',
    barcode: 'BC-304911',
    reportedBy: 'Sam Rodriguez (Depot Tech)',
    reportDate: '2026-10-10T14:30:00Z',
    severity: 'minor',
    issueType: 'electronic_fault',
    description: 'Tube #4 displays intermittent battery charge status when seated in the power charging case. Cleaned contacts, testing discharge curve in lab.',
    photoUrl: null,
    status: 'in_repair',
    emailDispatched: true,
    dispatchedTo: 'film-maintenance@university.edu',
    dispatchTimestamp: '2026-10-10T14:31:00Z'
  },
  {
    id: 'TKT-2026-039',
    equipmentId: 'EQ-SONY-FX6-01',
    equipmentName: 'Sony FX6 Cinema Line Kit',
    barcode: 'BC-109286',
    reportedBy: 'Maya Lin (Cage Supervisor)',
    reportDate: '2026-10-02T11:00:00Z',
    severity: 'minor',
    issueType: 'sensor_dust',
    description: 'Faint sensor dust particle visible at f/16 in the top right quadrant. Completed wet sensor swab cleaning and certified clean.',
    photoUrl: null,
    status: 'resolved',
    emailDispatched: true,
    dispatchedTo: 'film-maintenance@university.edu',
    dispatchTimestamp: '2026-10-02T11:01:00Z',
    resolutionNotes: 'Sensor wet swabbed with Eclipse solution. Sensor test chart clean at f/22.',
    resolvedDate: '2026-10-02T15:20:00Z'
  }
];

export const INITIAL_LOAN_HISTORY: LoanRecord[] = [
  {
    id: 'LN-2026-088',
    equipmentId: 'EQ-SONY-FX9-01',
    equipmentName: 'Sony FX9 Full-Frame Cinema Package',
    equipmentBarcode: 'BC-109285',
    studentName: 'Zoe Deschanel-Cole',
    studentId: 'STU-662810',
    studentEmail: 'z.cole@university.edu',
    course: 'DOC 320: Documentary Practicum',
    projectTitle: 'Whispering Archive (Final Doc)',
    checkoutDate: '2026-09-24T10:00:00Z',
    dueDate: '2026-09-27T16:00:00Z',
    returnDate: '2026-09-27T14:15:00Z',
    returnCondition: 'pristine',
    returnNotes: 'Returned cleanly with all lens caps and dual V-mount batteries charged.',
    checkoutSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><path d="M10,20 Q50,10 90,30 T150,20" stroke="%234f46e5" stroke-width="2" fill="none"/></svg>',
    returnSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><path d="M10,25 Q50,30 90,15 T150,25" stroke="%234f46e5" stroke-width="2" fill="none"/></svg>',
    status: 'returned',
    verifiedByStaff: 'Sam Rodriguez'
  },
  {
    id: 'LN-2026-089',
    equipmentId: 'EQ-APUTURE-600D-01',
    equipmentName: 'Aputure LS 600d Pro Daylight LED Kit',
    equipmentBarcode: 'BC-304910',
    studentName: 'Liam O’Connor',
    studentId: 'STU-554190',
    studentEmail: 'l.oconnor@university.edu',
    course: 'CINE 350: Advanced Lighting & Camera',
    projectTitle: 'Chiaroscuro Night',
    checkoutDate: '2026-09-25T13:00:00Z',
    dueDate: '2026-09-28T10:00:00Z',
    returnDate: '2026-09-28T09:30:00Z',
    returnCondition: 'pristine',
    returnNotes: 'Lamp head, reflector, and rolling stand in excellent order.',
    checkoutSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><path d="M10,15 Q60,35 110,15 T150,25" stroke="%234f46e5" stroke-width="2" fill="none"/></svg>',
    returnSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><path d="M10,20 Q60,10 110,30 T150,15" stroke="%234f46e5" stroke-width="2" fill="none"/></svg>',
    status: 'returned',
    verifiedByStaff: 'Maya Lin'
  },
  {
    id: 'LN-2026-090',
    equipmentId: 'EQ-ZEISS-CP3-SET',
    equipmentName: 'Zeiss CP.3 Compact Prime Set (28, 50, 85mm)',
    equipmentBarcode: 'BC-201845',
    studentName: 'Chloe Bennett',
    studentId: 'STU-441920',
    studentEmail: 'c.bennett@university.edu',
    course: 'CINE 210: Cinematography I',
    projectTitle: 'Light & Shadow Exercise',
    checkoutDate: '2026-09-29T09:00:00Z',
    dueDate: '2026-10-02T12:00:00Z',
    returnDate: '2026-10-02T11:45:00Z',
    returnCondition: 'pristine',
    returnNotes: 'All optics verified scratch-free under inspection light.',
    checkoutSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><path d="M10,25 Q40,5 80,30 T150,20" stroke="%234f46e5" stroke-width="2" fill="none"/></svg>',
    returnSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><path d="M10,20 Q50,35 90,15 T150,25" stroke="%234f46e5" stroke-width="2" fill="none"/></svg>',
    status: 'returned',
    verifiedByStaff: 'Sam Rodriguez'
  },
  {
    id: 'LN-2026-091',
    equipmentId: 'EQ-SOUND-MIXPRE-01',
    equipmentName: 'Sound Devices MixPre-10 II 8-Channel Recorder',
    equipmentBarcode: 'BC-402918',
    studentName: 'Devon Vance',
    studentId: 'STU-331829',
    studentEmail: 'd.vance@university.edu',
    course: 'FILM 240: Production Sound Recording',
    projectTitle: 'Field Soundscapes (Midterm Project)',
    checkoutDate: '2026-10-03T11:00:00Z',
    dueDate: '2026-10-06T17:00:00Z',
    returnDate: '2026-10-06T15:30:00Z',
    returnCondition: 'pristine',
    returnNotes: 'SD cards wiped and formatted in exFAT, all knobs verified.',
    checkoutSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><path d="M10,20 Q50,15 100,30 T150,20" stroke="%234f46e5" stroke-width="2" fill="none"/></svg>',
    returnSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40"><path d="M10,25 Q50,30 100,10 T150,25" stroke="%234f46e5" stroke-width="2" fill="none"/></svg>',
    status: 'returned',
    verifiedByStaff: 'Sam Rodriguez'
  }
];

export const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'camera', name: 'Cameras', description: 'Cinema and broadcast camera bodies, digital cinema systems, and camcorders' },
  { id: 'lens', name: 'Lenses', description: 'Cine prime sets, cinema zooms, anamorphic lenses, and photographic glass' },
  { id: 'lighting', name: 'Lighting', description: 'LED point source fixtures, softboxes, RGB pixel tubes, and ballast controllers' },
  { id: 'audio', name: 'Audio', description: 'Field audio multi-track recorders, wireless lavalier systems, and shotgun microphones' },
  { id: 'monitoring', name: 'Monitors & Video', description: 'On-camera monitors, director high-bright wireless monitors, and SDI/HDMI video transmitters' },
  { id: 'grip', name: 'Grip & Support', description: 'Cinema 3-axis gimbals, Easyrigs, heavy-duty fluid head tripods, C-stands, and rigging' }
];

export const UNIVERSITY_COURSES: UniversityCourse[] = [
  { code: 'FILM 401', title: 'Senior Thesis Production', faculty: 'Prof. David Cronenberg', description: 'Advanced senior capstone narrative cinema project' },
  { code: 'CINE 350', title: 'Advanced Lighting & Camera', faculty: 'Prof. Sarah Sterling', description: 'Cinematic lighting setups, color contrast, and high-end camera rigs' },
  { code: 'DOC 320', title: 'Documentary Practicum', faculty: 'Prof. Laura Poitras', description: 'Location non-fiction fieldwork and investigative documentary filming' },
  { code: 'CINE 210', title: 'Cinematography I', faculty: 'Prof. Vittorio Storaro', description: 'Foundations of exposure, framing, lens optics, and camera operation' },
  { code: 'FILM 240', title: 'Production Sound Recording', faculty: 'Prof. Ben Burtt', description: 'Boom mic operation, multi-track field recording, and lavalier placement' },
  { code: 'DOC 220', title: 'Non-Fiction Storytelling', faculty: 'Prof. Ken Burns', description: 'Archival research, interview techniques, and verite filming' },
  { code: 'FILM 490', title: 'Independent Directed Study', faculty: 'Faculty Chair', description: 'Special approved student film and media projects' }
];

export const PRESET_STUDENTS: StudentBorrower[] = [
  { name: 'Elena Rostova', id: 'STU-992144', email: 'e.rostova@university.edu', course: 'FILM 401', project: 'Echoes of Silence (Thesis Film)' },
  { name: 'Marcus Chen', id: 'STU-883921', email: 'm.chen@university.edu', course: 'CINE 350', project: 'Neon Nocturne (Class Short)' },
  { name: 'Julian Alvarez', id: 'STU-940122', email: 'j.alvarez@university.edu', course: 'FILM 401', project: 'The Last Rehearsal (Short Film)' },
  { name: 'Tariq Al-Mansoor', id: 'STU-771890', email: 't.almansoor@university.edu', course: 'DOC 320', project: 'City Lights (Documentary)' },
  { name: 'Maya Hernandez', id: 'STU-661299', email: 'm.hernandez@university.edu', course: 'CINE 210', project: 'Shadows of the City' },
  { name: 'Lucas Scott', id: 'STU-552811', email: 'l.scott@university.edu', course: 'FILM 240', project: 'Acoustic Portraits' }
];

export const INITIAL_GROUPS: EquipmentGroup[] = [
  {
    id: 'GRP-THESIS-ALEXA',
    name: 'ARRI Alexa 35 Master Cinema Package',
    description: 'Flagship narrative production package including camera body, 4-lens prime set, director monitor, and wireless video transmitter.',
    targetCourse: 'FILM 401: Senior Thesis Production',
    itemIds: ['EQ-ARRI-35-01', 'EQ-COOKE-S4-SET', 'EQ-SMALLHD-CINE7-01', 'EQ-TERADEK-BOLT-01'],
    createdAt: '2026-09-01'
  },
  {
    id: 'GRP-DOC-RUN-GUN',
    name: 'Documentary Run-and-Gun Field Kit',
    description: 'Lightweight high-mobility 4K kit with directional audio recorder and shotgun boom mic for location documentary coursework.',
    targetCourse: 'DOC 320: Documentary Practicum',
    itemIds: ['EQ-SONY-FX6-01', 'EQ-SOUND-MIXPRE-01', 'EQ-SENN-416-01'],
    createdAt: '2026-09-05'
  },
  {
    id: 'GRP-STUDIO-LIGHTING',
    name: 'Studio Master Lighting & Tube Package',
    description: 'High-output daylight point source LED paired with 8-tube wireless RGB pixel tube charging case for creative studio cinematography.',
    targetCourse: 'CINE 350: Advanced Lighting & Camera',
    itemIds: ['EQ-APUTURE-600D-01', 'EQ-ASTERA-TITAN-01'],
    createdAt: '2026-09-10'
  },
  {
    id: 'GRP-MOTION-SUPPORT',
    name: 'Camera Stabilization & Motion Support Rig',
    description: 'Full cinema gimbal support package combining heavy-duty 3-axis stabilizer with ergonomic body-mounted line vest.',
    targetCourse: 'CINE 350: Advanced Lighting & Camera',
    itemIds: ['EQ-RONIN-2-01', 'EQ-EASYRIG-VARIO-01'],
    createdAt: '2026-09-12'
  }
];
