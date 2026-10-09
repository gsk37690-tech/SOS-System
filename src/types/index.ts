export type Role = 'ROLE_STUDENT' | 'ROLE_SECURITY' | 'ROLE_ADMIN';

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus = 
  | 'REPORTED'
  | 'ASSIGNED'
  | 'ACKNOWLEDGED'
  | 'RESPONDING'
  | 'ARRIVED'
  | 'RESOLVED'
  | 'CANCELLED';

export type IncidentType =
  | 'MEDICAL'
  | 'DANGER'
  | 'FIRE'
  | 'SUSPICIOUS'
  | 'HARASSMENT'
  | 'INFRASTRUCTURE'
  | 'SAFE_WALK'
  | 'MENTAL_HEALTH'
  | 'SILENT_SOS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  studentId?: string;
  dormLocation?: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodType?: string;
  allergies?: string;
}

export interface SecurityOfficer {
  id: string;
  userId: string;
  badgeNumber: string;
  name: string;
  callSign: string;
  status: 'AVAILABLE' | 'ON_PATROL' | 'RESPONDING' | 'OFF_DUTY';
  currentZone: string;
  phone: string;
  assignedIncidentCount: number;
}

export interface CampusZone {
  id: string;
  name: string;
  code: string;
  riskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';
  blueLightBoxes: number;
  coordinates: { x: number; y: number }; // Percentage for campus map
  description: string;
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  timestamp: string;
  actorName: string;
  actorRole: Role;
  status: IncidentStatus;
  note: string;
}

export interface IncidentCoordinates {
  lat: number;
  lng: number;
  accuracy?: number; // In meters
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp?: string;
  source?: 'DEVICE_GPS' | 'CAMPUS_BEACON';
}

export interface LiveLocationState {
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: string;
  status: 'ACTIVE' | 'ACQUIRING' | 'PERMISSION_DENIED' | 'SIMULATED';
  nearestZoneId: string;
  nearestZoneName: string;
}

export interface Incident {
  id: string;
  code: string; // e.g. SCG-2026-0001
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  zoneId: string;
  zoneName: string;
  locationDetails: string;
  description: string;
  reporterId: string;
  reporterName: string;
  reporterPhone: string;
  isSilent: boolean;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  assignedBadge?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  timeline: IncidentUpdate[];
  evidenceUrl?: string;
  evidenceName?: string;
  coordinates: IncidentCoordinates;
}

export interface CampusAlert {
  id: string;
  title: string;
  severity: 'EMERGENCY' | 'WARNING' | 'ADVISORY';
  message: string;
  active: boolean;
  createdAt: string;
  acknowledgedCount: number;
  targetZones: string[];
}

export interface SafetyCheckIn {
  id: string;
  userId: string;
  destination: string;
  startTime: string;
  expectedArrivalTime: string;
  status: 'ACTIVE' | 'COMPLETED' | 'OVERDUE';
}

export interface SafeWalkRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  pickupLocation: string;
  destinationLocation: string;
  status: 'REQUESTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedOfficerName?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: Role;
  action: string;
  targetType: 'INCIDENT' | 'OFFICER' | 'ALERT' | 'USER' | 'SETTINGS';
  targetId: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  targetRole: Role | 'ALL';
  targetUserId?: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  incidentCode?: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
}
