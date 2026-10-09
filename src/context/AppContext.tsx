import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AuditLog,
  CampusAlert,
  CampusZone,
  Incident,
  IncidentCoordinates,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
  IncidentUpdate,
  NotificationItem,
  Role,
  SafeWalkRequest,
  SafetyCheckIn,
  SecurityOfficer,
  User,
} from '../types';
import {
  DEMO_USERS,
  INITIAL_OFFICERS,
  INITIAL_ZONES,
  TYPE_DEFAULT_SEVERITY,
  VALID_TRANSITIONS,
} from '../utils/constants';

interface AppContextType {
  currentUser: User;
  switchRole: (role: Role) => void;
  incidents: Incident[];
  zones: CampusZone[];
  officers: SecurityOfficer[];
  alerts: CampusAlert[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  safeWalks: SafeWalkRequest[];
  safetyCheckIns: SafetyCheckIn[];
  
  // Incident Actions
  createIncident: (params: {
    type: IncidentType;
    zoneId: string;
    locationDetails: string;
    description: string;
    isSilent?: boolean;
    evidenceName?: string;
    evidenceUrl?: string;
    coordinates?: IncidentCoordinates;
  }) => Incident;
  assignOfficer: (incidentId: string, officerId: string, note?: string) => void;
  updateIncidentStatus: (incidentId: string, newStatus: IncidentStatus, note: string) => boolean;
  overrideSeverity: (incidentId: string, newSeverity: IncidentSeverity, justification: string) => void;
  cancelIncident: (incidentId: string, reason: string) => void;
  
  // Alert Actions
  broadcastAlert: (title: string, message: string, severity: 'EMERGENCY' | 'WARNING' | 'ADVISORY', targetZones: string[]) => void;
  acknowledgeAlert: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
  
  // Safe Walk & Safety Check-in
  requestSafeWalk: (pickup: string, destination: string) => void;
  updateSafeWalkStatus: (id: string, status: SafeWalkRequest['status']) => void;
  startSafetyCheckIn: (destination: string, durationMinutes: number) => void;
  completeSafetyCheckIn: (id: string) => void;
  
  // Officer Profile
  updateOfficerStatus: (officerId: string, status: SecurityOfficer['status'], currentZone?: string) => void;
  
  // Notifications
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Simulation Helpers
  triggerSimulatedSOS: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'SCG_DATA_STORE_V1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return DEMO_USERS.student;
  });

  const [zones, setZones] = useState<CampusZone[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_zones');
    return saved ? JSON.parse(saved) : INITIAL_ZONES;
  });

  const [officers, setOfficers] = useState<SecurityOfficer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_officers');
    return saved ? JSON.parse(saved) : INITIAL_OFFICERS;
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_incidents');
    if (saved) return JSON.parse(saved);

    // Initial baseline demo incidents
    const now = new Date();
    const tMinus10 = new Date(now.getTime() - 10 * 60000).toISOString();
    const tMinus5 = new Date(now.getTime() - 5 * 60000).toISOString();
    const tMinus25 = new Date(now.getTime() - 25 * 60000).toISOString();

    const sample1: Incident = {
      id: 'inc-demo-1',
      code: 'SCG-2026-0001',
      type: 'MEDICAL',
      severity: 'CRITICAL',
      status: 'RESPONDING',
      zoneId: 'zone-4',
      zoneName: 'South Residential Village',
      locationDetails: 'Dorm C - 2nd Floor Common Lounge',
      description: 'Student experiencing severe allergic reaction and breathing distress. First aid kit requested.',
      reporterId: 'user-stu-1',
      reporterName: 'Elena Rostova',
      reporterPhone: '(555) 321-9988',
      isSilent: false,
      assignedOfficerId: 'off-3',
      assignedOfficerName: 'Officer Maya Lin',
      assignedBadge: 'SCG-SEC-108',
      createdAt: tMinus10,
      updatedAt: tMinus5,
      coordinates: { lat: 34.0522, lng: -118.2437 },
      timeline: [
        {
          id: 'up-1',
          incidentId: 'inc-demo-1',
          timestamp: tMinus10,
          actorName: 'Elena Rostova',
          actorRole: 'ROLE_STUDENT',
          status: 'REPORTED',
          note: 'Emergency SOS activated via mobile app'
        },
        {
          id: 'up-2',
          incidentId: 'inc-demo-1',
          timestamp: new Date(now.getTime() - 8 * 60000).toISOString(),
          actorName: 'Director Marcus Vance',
          actorRole: 'ROLE_ADMIN',
          status: 'ASSIGNED',
          note: 'High priority dispatch assigned to Officer Maya Lin (closest unit)'
        },
        {
          id: 'up-3',
          incidentId: 'inc-demo-1',
          timestamp: new Date(now.getTime() - 7 * 60000).toISOString(),
          actorName: 'Officer Maya Lin',
          actorRole: 'ROLE_SECURITY',
          status: 'ACKNOWLEDGED',
          note: 'Dispatch acknowledged. Carrying campus EMT response pouch.'
        },
        {
          id: 'up-4',
          incidentId: 'inc-demo-1',
          timestamp: tMinus5,
          actorName: 'Officer Maya Lin',
          actorRole: 'ROLE_SECURITY',
          status: 'RESPONDING',
          note: 'En route via Campus Patrol Cart 4. ETA 2 minutes.'
        }
      ]
    };

    const sample2: Incident = {
      id: 'inc-demo-2',
      code: 'SCG-2026-0002',
      type: 'SUSPICIOUS',
      severity: 'HIGH',
      status: 'REPORTED',
      zoneId: 'zone-6',
      zoneName: 'East Commuter Parking & Transit',
      locationDetails: 'Structure B, Level 3 North Stairwell',
      description: 'Individual attempting multiple vehicle door handles with a crowbar/tool.',
      reporterId: 'user-stu-2',
      reporterName: 'Marcus Brody',
      reporterPhone: '(555) 443-8812',
      isSilent: false,
      createdAt: new Date(now.getTime() - 2 * 60000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 60000).toISOString(),
      coordinates: { lat: 34.0535, lng: -118.2415 },
      timeline: [
        {
          id: 'up-2-1',
          incidentId: 'inc-demo-2',
          timestamp: new Date(now.getTime() - 2 * 60000).toISOString(),
          actorName: 'Marcus Brody',
          actorRole: 'ROLE_STUDENT',
          status: 'REPORTED',
          note: 'Report submitted through incident report form.'
        }
      ]
    };

    const sample3: Incident = {
      id: 'inc-demo-3',
      code: 'SCG-2026-0003',
      type: 'SAFE_WALK',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      zoneId: 'zone-1',
      zoneName: 'North Quad & Library',
      locationDetails: 'Main Library entrance to East Commuter Parking',
      description: 'Late night study group escort request.',
      reporterId: 'user-stu-3',
      reporterName: 'Sophia Lee',
      reporterPhone: '(555) 776-1234',
      isSilent: false,
      assignedOfficerId: 'off-1',
      assignedOfficerName: 'Officer Alex Rivera',
      assignedBadge: 'SCG-SEC-101',
      createdAt: tMinus25,
      updatedAt: new Date(now.getTime() - 5 * 60000).toISOString(),
      resolvedAt: new Date(now.getTime() - 5 * 60000).toISOString(),
      coordinates: { lat: 34.0515, lng: -118.2450 },
      timeline: [
        {
          id: 'up-3-1',
          incidentId: 'inc-demo-3',
          timestamp: tMinus25,
          actorName: 'Sophia Lee',
          actorRole: 'ROLE_STUDENT',
          status: 'REPORTED',
          note: 'Safe walk requested'
        },
        {
          id: 'up-3-2',
          incidentId: 'inc-demo-3',
          timestamp: new Date(now.getTime() - 20 * 60000).toISOString(),
          actorName: 'Officer Alex Rivera',
          actorRole: 'ROLE_SECURITY',
          status: 'ARRIVED',
          note: 'Met student at Library steps.'
        },
        {
          id: 'up-3-3',
          incidentId: 'inc-demo-3',
          timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
          actorName: 'Officer Alex Rivera',
          actorRole: 'ROLE_SECURITY',
          status: 'RESOLVED',
          note: 'Student arrived safely at car. Escort complete.'
        }
      ]
    };

    return [sample1, sample2, sample3];
  });

  const [alerts, setAlerts] = useState<CampusAlert[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_alerts');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'alt-1',
        title: 'Safety Advisory: Low Light Patrols Active',
        severity: 'ADVISORY',
        message: 'Security officers are patrolling perimeter parking and residential quads. Use Blue Light call stations or the Safe Walk feature in this app.',
        active: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        acknowledgedCount: 142,
        targetZones: ['All Campus Zones']
      }
    ];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_audit');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'aud-1',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        actorName: 'Elena Rostova',
        actorRole: 'ROLE_STUDENT',
        action: 'SOS_CREATION',
        targetType: 'INCIDENT',
        targetId: 'SCG-2026-0001',
        details: 'Medical emergency SOS initiated in South Residential Village.'
      },
      {
        id: 'aud-2',
        timestamp: new Date(Date.now() - 480000).toISOString(),
        actorName: 'Director Marcus Vance',
        actorRole: 'ROLE_ADMIN',
        action: 'DISPATCH_ASSIGNMENT',
        targetType: 'INCIDENT',
        targetId: 'SCG-2026-0001',
        details: 'Dispatched Officer Maya Lin (SCG-SEC-108).'
      }
    ];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_notifications');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'notif-1',
        targetRole: 'ALL',
        title: 'Campus Safety System Online',
        message: 'Smart Campus Guardian service running. Emergency services simulated.',
        timestamp: new Date().toISOString(),
        read: false,
        priority: 'NORMAL'
      }
    ];
  });

  const [safeWalks, setSafeWalks] = useState<SafeWalkRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_safewalks');
    return saved ? JSON.parse(saved) : [];
  });

  const [safetyCheckIns, setSafetyCheckIns] = useState<SafetyCheckIn[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_checkins');
    return saved ? JSON.parse(saved) : [];
  });

  // LocalStorage persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_officers', JSON.stringify(officers));
  }, [officers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_safewalks', JSON.stringify(safeWalks));
  }, [safeWalks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_checkins', JSON.stringify(safetyCheckIns));
  }, [safetyCheckIns]);

  const addAuditLog = (action: string, targetType: AuditLog['targetType'], targetId: string, details: string) => {
    const newLog: AuditLog = {
      id: 'aud-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      targetType,
      targetId,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newItem: NotificationItem = {
      ...notif,
      id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newItem, ...prev]);
  };

  const switchRole = (role: Role) => {
    if (role === 'ROLE_STUDENT') setCurrentUser(DEMO_USERS.student);
    else if (role === 'ROLE_SECURITY') setCurrentUser(DEMO_USERS.security);
    else setCurrentUser(DEMO_USERS.admin);
  };

  const createIncident = ({
    type,
    zoneId,
    locationDetails,
    description,
    isSilent = false,
    evidenceName,
    evidenceUrl,
    coordinates,
  }: {
    type: IncidentType;
    zoneId: string;
    locationDetails: string;
    description: string;
    isSilent?: boolean;
    evidenceName?: string;
    evidenceUrl?: string;
    coordinates?: IncidentCoordinates;
  }): Incident => {
    const zone = zones.find(z => z.id === zoneId) || zones[0];
    const sequenceNum = incidents.length + 1;
    const year = new Date().getFullYear();
    const code = `SCG-${year}-${String(sequenceNum).padStart(4, '0')}`;
    const defaultSeverity = TYPE_DEFAULT_SEVERITY[type];
    const now = new Date().toISOString();

    const finalCoordinates: IncidentCoordinates = coordinates || {
      lat: 34.0522 + (Math.random() - 0.5) * 0.005,
      lng: -118.2437 + (Math.random() - 0.5) * 0.005,
      accuracy: 4.5,
      source: 'CAMPUS_BEACON',
      timestamp: now,
    };

    const gpsNote = ` [GPS: ${finalCoordinates.lat.toFixed(5)}°, ${finalCoordinates.lng.toFixed(5)}° (±${finalCoordinates.accuracy || 5}m)]`;

    const newIncident: Incident = {
      id: 'inc-' + Date.now(),
      code,
      type,
      severity: defaultSeverity,
      status: 'REPORTED',
      zoneId: zone.id,
      zoneName: zone.name,
      locationDetails,
      description,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterPhone: currentUser.phone || '(555) 321-9988',
      isSilent,
      createdAt: now,
      updatedAt: now,
      evidenceName,
      evidenceUrl,
      coordinates: finalCoordinates,
      timeline: [
        {
          id: 'up-' + Date.now(),
          incidentId: 'inc-' + Date.now(),
          timestamp: now,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          status: 'REPORTED',
          note: (isSilent
            ? 'Silent SOS beacon covertly triggered.' + (evidenceUrl ? ' [Scene photo attached directly to distress signal]' : '')
            : `Initial report lodged: ${description.slice(0, 80)}` + (evidenceUrl ? ' [Scene photo transmitted with SOS]' : '')) + gpsNote,
        },
      ],
    };

    setIncidents(prev => [newIncident, ...prev]);

    addAuditLog(
      'INCIDENT_CREATED',
      'INCIDENT',
      code,
      `New ${defaultSeverity} incident created: ${type} at ${zone.name} with live GPS coordinates (${finalCoordinates.lat.toFixed(5)}, ${finalCoordinates.lng.toFixed(5)})${evidenceName ? ` and photo (${evidenceName})` : ''}`
    );

    addNotification({
      targetRole: 'ROLE_ADMIN',
      title: `🚨 Emergency Alert: ${code}${evidenceUrl ? ' [📸 Photo Attached]' : ''}`,
      message: `${defaultSeverity} priority incident (${type}) reported at ${zone.name}${evidenceUrl ? ' — Scene photo transmitted by student' : ''}`,
      priority: defaultSeverity === 'CRITICAL' ? 'URGENT' : 'HIGH',
      incidentCode: code,
    });

    addNotification({
      targetRole: 'ROLE_SECURITY',
      title: `🚨 Dispatch Alert: ${code}${evidenceUrl ? ' [📸 Photo Attached]' : ''}`,
      message: `${type} reported at ${zone.name}${evidenceUrl ? ' — On-scene photo transmitted with alert' : ' - awaiting command assignment'}`,
      priority: defaultSeverity === 'CRITICAL' ? 'URGENT' : 'HIGH',
      incidentCode: code,
    });

    return newIncident;
  };

  const assignOfficer = (incidentId: string, officerId: string, note?: string) => {
    const officer = officers.find(o => o.id === officerId);
    if (!officer) return;

    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id !== incidentId) return inc;
        const now = new Date().toISOString();
        const update: IncidentUpdate = {
          id: 'up-' + Date.now(),
          incidentId: inc.id,
          timestamp: now,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          status: 'ASSIGNED',
          note: note || `Dispatched to ${officer.name} (${officer.badgeNumber}).`,
        };
        return {
          ...inc,
          status: 'ASSIGNED',
          assignedOfficerId: officer.id,
          assignedOfficerName: officer.name,
          assignedBadge: officer.badgeNumber,
          updatedAt: now,
          timeline: [...inc.timeline, update],
        };
      })
    );

    // Update officer assigned count & status
    setOfficers(prev =>
      prev.map(o =>
        o.id === officerId
          ? { ...o, status: 'RESPONDING', assignedIncidentCount: o.assignedIncidentCount + 1 }
          : o
      )
    );

    const targetInc = incidents.find(i => i.id === incidentId);
    if (targetInc) {
      addAuditLog(
        'OFFICER_ASSIGNED',
        'INCIDENT',
        targetInc.code,
        `Assigned to ${officer.name} (${officer.badgeNumber}) by ${currentUser.name}`
      );

      addNotification({
        targetRole: 'ROLE_SECURITY',
        title: `Dispatch Assigned: ${targetInc.code}`,
        message: `You have been assigned to ${targetInc.type} at ${targetInc.zoneName}.`,
        priority: 'URGENT',
        incidentCode: targetInc.code,
      });

      addNotification({
        targetRole: 'ROLE_STUDENT',
        targetUserId: targetInc.reporterId,
        title: `Officer Dispatched: ${targetInc.code}`,
        message: `${officer.name} (${officer.badgeNumber}) has been assigned to your report.`,
        priority: 'HIGH',
        incidentCode: targetInc.code,
      });
    }
  };

  const updateIncidentStatus = (incidentId: string, newStatus: IncidentStatus, note: string): boolean => {
    const targetInc = incidents.find(i => i.id === incidentId);
    if (!targetInc) return false;

    // Check legal workflow transition rules as mandated by AGENTS.md
    const allowed = VALID_TRANSITIONS[targetInc.status] || [];
    if (!allowed.includes(newStatus)) {
      console.warn(`Illegal transition attempted from ${targetInc.status} to ${newStatus}`);
      return false;
    }

    const now = new Date().toISOString();

    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id !== incidentId) return inc;
        const update: IncidentUpdate = {
          id: 'up-' + Date.now(),
          incidentId: inc.id,
          timestamp: now,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          status: newStatus,
          note,
        };
        return {
          ...inc,
          status: newStatus,
          updatedAt: now,
          resolvedAt: newStatus === 'RESOLVED' ? now : inc.resolvedAt,
          timeline: [...inc.timeline, update],
        };
      })
    );

    // If resolved or cancelled, release assigned officer
    if ((newStatus === 'RESOLVED' || newStatus === 'CANCELLED') && targetInc.assignedOfficerId) {
      setOfficers(prev =>
        prev.map(o =>
          o.id === targetInc.assignedOfficerId
            ? { ...o, status: 'AVAILABLE', assignedIncidentCount: Math.max(0, o.assignedIncidentCount - 1) }
            : o
        )
      );
    }

    addAuditLog(
      `STATUS_TRANSITION_${newStatus}`,
      'INCIDENT',
      targetInc.code,
      `Status changed from ${targetInc.status} to ${newStatus}. Note: ${note}`
    );

    // Notify student reporter
    addNotification({
      targetRole: 'ROLE_STUDENT',
      targetUserId: targetInc.reporterId,
      title: `Update on ${targetInc.code}: ${newStatus}`,
      message: note,
      priority: 'NORMAL',
      incidentCode: targetInc.code,
    });

    return true;
  };

  const overrideSeverity = (incidentId: string, newSeverity: IncidentSeverity, justification: string) => {
    const targetInc = incidents.find(i => i.id === incidentId);
    if (!targetInc) return;

    const oldSev = targetInc.severity;
    const now = new Date().toISOString();

    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id !== incidentId) return inc;
        const update: IncidentUpdate = {
          id: 'up-' + Date.now(),
          incidentId: inc.id,
          timestamp: now,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          status: inc.status,
          note: `[Triage Override] Severity altered from ${oldSev} to ${newSeverity}. Reason: ${justification}`,
        };
        return {
          ...inc,
          severity: newSeverity,
          updatedAt: now,
          timeline: [...inc.timeline, update],
        };
      })
    );

    addAuditLog(
      'SEVERITY_OVERRIDE',
      'INCIDENT',
      targetInc.code,
      `Admin override: changed from ${oldSev} to ${newSeverity}. Justification: ${justification}`
    );
  };

  const cancelIncident = (incidentId: string, reason: string) => {
    updateIncidentStatus(incidentId, 'CANCELLED', `Cancelled: ${reason}`);
  };

  const broadcastAlert = (
    title: string,
    message: string,
    severity: 'EMERGENCY' | 'WARNING' | 'ADVISORY',
    targetZones: string[]
  ) => {
    const newAlert: CampusAlert = {
      id: 'alt-' + Date.now(),
      title,
      severity,
      message,
      active: true,
      createdAt: new Date().toISOString(),
      acknowledgedCount: 0,
      targetZones,
    };

    setAlerts(prev => [newAlert, ...prev]);

    addAuditLog('CAMPUS_ALERT_BROADCAST', 'ALERT', newAlert.id, `Broadcast [${severity}]: ${title}`);

    addNotification({
      targetRole: 'ALL',
      title: `📣 Campus Broadcast: ${title}`,
      message,
      priority: severity === 'EMERGENCY' ? 'URGENT' : 'HIGH',
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, acknowledgedCount: a.acknowledgedCount + 1 } : a))
    );
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, active: false } : a)));
    addAuditLog('ALERT_DEACTIVATED', 'ALERT', alertId, `Deactivated campus broadcast by ${currentUser.name}`);
  };

  const requestSafeWalk = (pickup: string, destination: string) => {
    const newRequest: SafeWalkRequest = {
      id: 'sw-' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone || '(555) 321-9988',
      pickupLocation: pickup,
      destinationLocation: destination,
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
    };
    setSafeWalks(prev => [newRequest, ...prev]);

    addAuditLog('SAFE_WALK_REQUESTED', 'USER', currentUser.id, `Escort requested from ${pickup} to ${destination}`);

    addNotification({
      targetRole: 'ROLE_SECURITY',
      title: '🚶 Safe Walk Request',
      message: `${currentUser.name} requested escort from ${pickup} to ${destination}`,
      priority: 'HIGH',
    });
  };

  const updateSafeWalkStatus = (id: string, status: SafeWalkRequest['status']) => {
    setSafeWalks(prev =>
      prev.map(sw =>
        sw.id === id
          ? {
              ...sw,
              status,
              assignedOfficerName:
                currentUser.role === 'ROLE_SECURITY' ? currentUser.name : sw.assignedOfficerName,
            }
          : sw
      )
    );
  };

  const startSafetyCheckIn = (destination: string, durationMinutes: number) => {
    const now = new Date();
    const expected = new Date(now.getTime() + durationMinutes * 60000).toISOString();
    const checkIn: SafetyCheckIn = {
      id: 'chk-' + Date.now(),
      userId: currentUser.id,
      destination,
      startTime: now.toISOString(),
      expectedArrivalTime: expected,
      status: 'ACTIVE',
    };
    setSafetyCheckIns(prev => [checkIn, ...prev]);

    addAuditLog('CHECK_IN_STARTED', 'USER', currentUser.id, `Destination: ${destination}, window: ${durationMinutes} mins`);
  };

  const completeSafetyCheckIn = (id: string) => {
    setSafetyCheckIns(prev =>
      prev.map(c => (c.id === id ? { ...c, status: 'COMPLETED' } : c))
    );
    addAuditLog('CHECK_IN_COMPLETED', 'USER', currentUser.id, `Completed safe check-in`);
  };

  const updateOfficerStatus = (officerId: string, status: SecurityOfficer['status'], currentZone?: string) => {
    setOfficers(prev =>
      prev.map(o =>
        o.id === officerId
          ? { ...o, status, currentZone: currentZone || o.currentZone }
          : o
      )
    );
    addAuditLog('OFFICER_STATUS_UPDATED', 'OFFICER', officerId, `Status set to ${status}${currentZone ? ` at ${currentZone}` : ''}`);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const triggerSimulatedSOS = () => {
    // Generates a mock urgent beacon for demonstration
    createIncident({
      type: 'SILENT_SOS',
      zoneId: 'zone-6',
      locationDetails: 'East Parking Level 2 Stairwell (Auto Beacon)',
      description: 'Simulated high-priority automated distress beacon activated via rapid tap sequence.',
      isSilent: true,
    });
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY + '_incidents');
    localStorage.removeItem(STORAGE_KEY + '_officers');
    localStorage.removeItem(STORAGE_KEY + '_alerts');
    localStorage.removeItem(STORAGE_KEY + '_audit');
    localStorage.removeItem(STORAGE_KEY + '_notifications');
    localStorage.removeItem(STORAGE_KEY + '_safewalks');
    localStorage.removeItem(STORAGE_KEY + '_checkins');
    window.location.reload();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchRole,
        incidents,
        zones,
        officers,
        alerts,
        auditLogs,
        notifications,
        safeWalks,
        safetyCheckIns,
        createIncident,
        assignOfficer,
        updateIncidentStatus,
        overrideSeverity,
        cancelIncident,
        broadcastAlert,
        acknowledgeAlert,
        dismissAlert,
        requestSafeWalk,
        updateSafeWalkStatus,
        startSafetyCheckIn,
        completeSafetyCheckIn,
        updateOfficerStatus,
        markNotificationAsRead,
        clearAllNotifications,
        triggerSimulatedSOS,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
