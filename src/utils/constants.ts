import { CampusZone, IncidentSeverity, IncidentStatus, IncidentType, SecurityOfficer, User } from '../types';

export const TYPE_DEFAULT_SEVERITY: Record<IncidentType, IncidentSeverity> = {
  MEDICAL: 'CRITICAL',
  DANGER: 'CRITICAL',
  FIRE: 'CRITICAL',
  SILENT_SOS: 'CRITICAL',
  SUSPICIOUS: 'HIGH',
  MENTAL_HEALTH: 'HIGH',
  HARASSMENT: 'MEDIUM',
  SAFE_WALK: 'MEDIUM',
  INFRASTRUCTURE: 'LOW',
};

export const TYPE_LABELS: Record<IncidentType, { title: string; color: string; desc: string }> = {
  MEDICAL: { title: 'Medical Emergency', color: 'rose', desc: 'Severe injury, unconsciousness, overdose, sudden illness' },
  DANGER: { title: 'Physical Danger / Assault', color: 'red', desc: 'Armed intruder, violent fight, imminent physical assault' },
  SILENT_SOS: { title: 'Silent SOS Beacon', color: 'red', desc: 'Covert distress signal without screen glare or audio' },
  FIRE: { title: 'Fire & Smoke Hazard', color: 'amber', desc: 'Active flames, heavy smoke, explosion, chemical spill' },
  SUSPICIOUS: { title: 'Suspicious Activity', color: 'orange', desc: 'Trespassing, prowling, unauthorized access, vehicle prowler' },
  MENTAL_HEALTH: { title: 'Mental Health Crisis', color: 'purple', desc: 'Severe psychological distress, crisis counselor needed' },
  HARASSMENT: { title: 'Harassment / Stalking', color: 'yellow', desc: 'Unwanted following, threats, intimidation on campus' },
  SAFE_WALK: { title: 'Safe Walk Escort', color: 'blue', desc: 'Safety escort across campus during late evening hours' },
  INFRASTRUCTURE: { title: 'Facility / Lighting Hazard', color: 'slate', desc: 'Broken locks, dark pathways, flooding, structural fault' },
};

export const SEVERITY_BADGES: Record<IncidentSeverity, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: 'bg-red-950/80', text: 'text-red-400', border: 'border-red-600' },
  HIGH: { bg: 'bg-amber-950/80', text: 'text-amber-400', border: 'border-amber-600' },
  MEDIUM: { bg: 'bg-yellow-950/80', text: 'text-yellow-400', border: 'border-yellow-600' },
  LOW: { bg: 'bg-blue-950/80', text: 'text-blue-400', border: 'border-blue-600' },
};

export const STATUS_FLOW: IncidentStatus[] = [
  'REPORTED',
  'ASSIGNED',
  'ACKNOWLEDGED',
  'RESPONDING',
  'ARRIVED',
  'RESOLVED'
];

export const VALID_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  REPORTED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['ACKNOWLEDGED', 'ASSIGNED', 'CANCELLED'], // re-assign allowed
  ACKNOWLEDGED: ['RESPONDING', 'CANCELLED'],
  RESPONDING: ['ARRIVED', 'CANCELLED'],
  ARRIVED: ['RESOLVED'],
  RESOLVED: [],
  CANCELLED: [],
};

export const INITIAL_ZONES: CampusZone[] = [
  {
    id: 'zone-1',
    name: 'North Quad & Library',
    code: 'NQ-01',
    riskLevel: 'LOW',
    blueLightBoxes: 8,
    coordinates: { x: 30, y: 25 },
    description: 'Main academic library, humanities hall, reading lawns, 24/7 study hub.'
  },
  {
    id: 'zone-2',
    name: 'Science & Engineering Complex',
    code: 'SEC-02',
    riskLevel: 'MODERATE',
    blueLightBoxes: 6,
    coordinates: { x: 70, y: 22 },
    description: 'Biochemistry laboratories, robotic bays, lecture halls, hazardous materials storage.'
  },
  {
    id: 'zone-3',
    name: 'Central Student Plaza',
    code: 'CSP-03',
    riskLevel: 'LOW',
    blueLightBoxes: 10,
    coordinates: { x: 50, y: 48 },
    description: 'Campus center, dining commons, bookstore, high pedestrian density area.'
  },
  {
    id: 'zone-4',
    name: 'South Residential Village',
    code: 'SRV-04',
    riskLevel: 'ELEVATED',
    blueLightBoxes: 12,
    coordinates: { x: 35, y: 75 },
    description: 'Undergraduate dormitories Alpha through Delta, dining pavilion, night access.'
  },
  {
    id: 'zone-5',
    name: 'West Athletics & Gymnasium',
    code: 'WAG-05',
    riskLevel: 'LOW',
    blueLightBoxes: 5,
    coordinates: { x: 18, y: 55 },
    description: 'Aquatic center, stadium turf, fitness pavilion, perimeter running tracks.'
  },
  {
    id: 'zone-6',
    name: 'East Commuter Parking & Transit',
    code: 'ECP-06',
    riskLevel: 'HIGH',
    blueLightBoxes: 9,
    coordinates: { x: 82, y: 72 },
    description: 'Multi-level parking garages, bus terminal, peripheral lighting watchpoint.'
  }
];

export const INITIAL_OFFICERS: SecurityOfficer[] = [
  {
    id: 'off-1',
    userId: 'user-sec-1',
    badgeNumber: 'SCG-SEC-101',
    name: 'Officer Alex Rivera',
    callSign: 'Guardian Alpha',
    status: 'AVAILABLE',
    currentZone: 'Central Student Plaza',
    phone: '(555) 019-2831',
    assignedIncidentCount: 0
  },
  {
    id: 'off-2',
    userId: 'user-sec-2',
    badgeNumber: 'SCG-SEC-104',
    name: 'Officer David Kim',
    callSign: 'Guardian Bravo',
    status: 'ON_PATROL',
    currentZone: 'East Commuter Parking & Transit',
    phone: '(555) 019-2834',
    assignedIncidentCount: 0
  },
  {
    id: 'off-3',
    userId: 'user-sec-3',
    badgeNumber: 'SCG-SEC-108',
    name: 'Officer Maya Lin',
    callSign: 'Guardian Charlie',
    status: 'RESPONDING',
    currentZone: 'South Residential Village',
    phone: '(555) 019-2838',
    assignedIncidentCount: 1
  },
  {
    id: 'off-4',
    userId: 'user-sec-4',
    badgeNumber: 'SCG-SEC-112',
    name: 'Officer Marcus Cole',
    callSign: 'Guardian Delta',
    status: 'AVAILABLE',
    currentZone: 'Science & Engineering Complex',
    phone: '(555) 019-2842',
    assignedIncidentCount: 0
  }
];

export const DEMO_USERS: Record<string, User> = {
  student: {
    id: 'user-stu-1',
    name: 'Elena Rostova',
    email: 'elena.rostova@campus.edu',
    role: 'ROLE_STUDENT',
    studentId: 'STU-2026-8941',
    dormLocation: 'South Village Dorm C - Room 314',
    phone: '(555) 321-9988',
    emergencyContactName: 'Maria Rostova (Mother)',
    emergencyContactPhone: '(555) 441-2390',
    bloodType: 'O+',
    allergies: 'Penicillin'
  },
  security: {
    id: 'user-sec-1',
    name: 'Officer Alex Rivera',
    email: 'alex.rivera@guardian.campus.edu',
    role: 'ROLE_SECURITY',
    phone: '(555) 019-2831'
  },
  admin: {
    id: 'user-adm-1',
    name: 'Director Marcus Vance',
    email: 'marcus.vance@campus.edu',
    role: 'ROLE_ADMIN',
    phone: '(555) 900-1122'
  }
};
