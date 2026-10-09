import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Incident, IncidentType } from '../../types';
import { TYPE_DEFAULT_SEVERITY, TYPE_LABELS, SEVERITY_BADGES } from '../../utils/constants';
import { PhotoCaptureModal } from '../common/PhotoCaptureModal';
import { LiveLocationIndicator } from '../common/LiveLocationIndicator';
import { useLiveLocation } from '../../hooks/useLiveLocation';
import {
  ShieldAlert,
  AlertOctagon,
  Radio,
  MapPin,
  Clock,
  Send,
  Phone,
  UserCheck,
  Footprints,
  QrCode,
  HeartPulse,
  EyeOff,
  Flame,
  CheckCircle2,
  Camera,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  X,
  Upload,
  Eye,
  Trash2,
  Image as ImageIcon,
  Crosshair,
  Navigation,
  ExternalLink,
} from 'lucide-react';

interface StudentPortalProps {
  onSelectIncident: (incident: Incident) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ onSelectIncident }) => {
  const {
    currentUser,
    zones,
    incidents,
    createIncident,
    safeWalks,
    requestSafeWalk,
    safetyCheckIns,
    startSafetyCheckIn,
    completeSafetyCheckIn,
  } = useApp();

  // Tab state for Student Portal views
  const [activeTab, setActiveTab] = useState<'SOS' | 'REPORT' | 'ACTIVE' | 'SAFE_WALK' | 'SAFETY_ID'>('SOS');

  // Real-time GPS location tracking hook
  const { location, isSimulated, toggleSimulation, refreshLocation } = useLiveLocation();

  // SOS Countdown state
  const [sosCountingDown, setSosCountingDown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(3);
  const [selectedSosZone, setSelectedSosZone] = useState(zones[0]?.id || 'zone-1');
  const [sosLocationDetails, setSosLocationDetails] = useState('Near main pathway fountain');

  // Sync nearest campus zone when location updates if zone not manually locked
  useEffect(() => {
    if (location.nearestZoneId && !sosCountingDown) {
      setSelectedSosZone(location.nearestZoneId);
    }
  }, [location.nearestZoneId]);

  // Emergency SOS Scene Photo state
  const [sosPhoto, setSosPhoto] = useState<{ url: string; name: string } | null>(null);
  const [showSosPhotoModal, setShowSosPhotoModal] = useState(false);

  // Silent SOS mode state
  const [isSilentMode, setIsSilentMode] = useState(false);
  const [silentBeaconActive, setSilentBeaconActive] = useState(false);

  // Report Form state
  const [reportType, setReportType] = useState<IncidentType>('SUSPICIOUS');
  const [reportZoneId, setReportZoneId] = useState(zones[0]?.id || 'zone-1');
  const [reportLocation, setReportLocation] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [evidenceFileName, setEvidenceFileName] = useState('');
  const [reportPhoto, setReportPhoto] = useState<{ url: string; name: string } | null>(null);
  const [showReportPhotoModal, setShowReportPhotoModal] = useState(false);
  const [reportSuccessCode, setReportSuccessCode] = useState<string | null>(null);

  // Safe Walk form state
  const [pickupLocation, setPickupLocation] = useState('Main Library West Entrance');
  const [destLocation, setDestLocation] = useState('South Dormitory Quad Alpha');
  const [walkSuccess, setWalkSuccess] = useState(false);

  // Check-In form state
  const [checkInDest, setCheckInDest] = useState('Dorm Room 314');
  const [checkInDuration, setCheckInDuration] = useState(15);

  // Countdown timer effect
  useEffect(() => {
    let timer: any;
    if (sosCountingDown && countdownSeconds > 0) {
      timer = setTimeout(() => {
        setCountdownSeconds(s => s - 1);
      }, 1000);
    } else if (sosCountingDown && countdownSeconds === 0) {
      // Fire the SOS incident with attached photo and real-time GPS coordinates
      const inc = createIncident({
        type: isSilentMode ? 'SILENT_SOS' : 'DANGER',
        zoneId: selectedSosZone || location.nearestZoneId,
        locationDetails: sosLocationDetails || `Near ${location.nearestZoneName}`,
        description: isSilentMode
          ? 'Emergency Silent SOS beacon transmitted. Discreet assistance requested.' + (sosPhoto ? ' [Scene photo transmitted with beacon]' : '')
          : 'URGENT 1-TAP SOS ACTIVATED BY STUDENT! Immediate dispatch required.' + (sosPhoto ? ' [Scene photo transmitted to authorities]' : ''),
        isSilent: isSilentMode,
        evidenceUrl: sosPhoto?.url,
        evidenceName: sosPhoto?.name,
        coordinates: {
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy,
          altitude: location.altitude,
          speed: location.speed,
          heading: location.heading,
          source: isSimulated ? 'CAMPUS_BEACON' : 'DEVICE_GPS',
          timestamp: location.timestamp,
        },
      });
      setSosCountingDown(false);
      setCountdownSeconds(3);
      if (isSilentMode) {
        setSilentBeaconActive(true);
      } else {
        setActiveTab('ACTIVE');
      }
    }
    return () => clearTimeout(timer);
  }, [sosCountingDown, countdownSeconds, isSilentMode, selectedSosZone, sosLocationDetails, sosPhoto, location, isSimulated]);

  const handleStartSos = () => {
    setSosCountingDown(true);
    setCountdownSeconds(3);
  };

  const handleCancelSos = () => {
    setSosCountingDown(false);
    setCountdownSeconds(3);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim() || !reportLocation.trim()) return;

    const newInc = createIncident({
      type: reportType,
      zoneId: reportZoneId,
      locationDetails: reportLocation.trim(),
      description: reportDescription.trim(),
      evidenceName: reportPhoto?.name || evidenceFileName || undefined,
      evidenceUrl: reportPhoto?.url || undefined,
      coordinates: {
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy,
        altitude: location.altitude,
        speed: location.speed,
        heading: location.heading,
        source: isSimulated ? 'CAMPUS_BEACON' : 'DEVICE_GPS',
        timestamp: location.timestamp,
      },
    });

    setReportSuccessCode(newInc.code);
    setReportDescription('');
    setReportLocation('');
    setEvidenceFileName('');
    setReportPhoto(null);
  };

  const handleSafeWalkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupLocation || !destLocation) return;
    requestSafeWalk(pickupLocation, destLocation);
    setWalkSuccess(true);
    setTimeout(() => setWalkSuccess(false), 4000);
  };

  // Incidents reported by this user or general active incidents
  const myIncidents = incidents.filter(
    i => i.reporterId === currentUser.id || i.type === 'SILENT_SOS' || i.type === 'MEDICAL'
  );
  const activeIncident = myIncidents.find(i => i.status !== 'RESOLVED' && i.status !== 'CANCELLED');

  return (
    <div className="space-y-6">
      {/* Student Navigation Sub-bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('SOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'SOS'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-300" />
            <span>Emergency SOS</span>
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 relative ${
              activeTab === 'ACTIVE'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4 text-blue-400" />
            <span>Live Incident Status</span>
            {activeIncident && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('REPORT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'REPORT'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Send className="w-4 h-4 text-emerald-400" />
            <span>Report Incident</span>
          </button>
          <button
            onClick={() => setActiveTab('SAFE_WALK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'SAFE_WALK'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Footprints className="w-4 h-4 text-purple-400" />
            <span>Safe Walk & Check-in</span>
          </button>
          <button
            onClick={() => setActiveTab('SAFETY_ID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'SAFETY_ID'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Digital Safety ID</span>
          </button>
        </div>

        {/* Student Profile snippet */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-white font-medium">{currentUser.name}</span>
          <span className="font-mono text-[11px] text-slate-500">({currentUser.studentId})</span>
        </div>
      </div>

      {/* Live Location Active Indicator (Required on Student Dashboard) */}
      <LiveLocationIndicator
        location={location}
        isSimulated={isSimulated}
        onToggleSimulation={toggleSimulation}
        onRefresh={refreshLocation}
      />

      {/* TAB 1: EMERGENCY SOS (BIG BUTTON) */}
      {activeTab === 'SOS' && (
        <div className="space-y-6 max-w-2xl mx-auto text-center">
          {/* Silent SOS Discreet Mode Toggle */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5">
              <EyeOff className={`w-5 h-5 ${isSilentMode ? 'text-rose-400' : 'text-slate-500'}`} />
              <div>
                <span className="text-xs font-bold text-white block">
                  Discreet Silent SOS Mode
                </span>
                <span className="text-[11px] text-slate-400">
                  Sends covert high-priority distress signal with blacked-out screen & zero sound.
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsSilentMode(!isSilentMode)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                isSilentMode
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isSilentMode ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

          {/* Location Context Selector */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Current Location Verification (Auto-Captured GPS)
              </span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>GPS Live Fixed</span>
              </span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-emerald-900/50 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-300">
                <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {location.lat.toFixed(5)}° N, {Math.abs(location.lng).toFixed(5)}° W
                </span>
                <span className="text-slate-400 text-[10px]">(±{location.accuracy}m)</span>
              </div>
              <span className="text-slate-400 text-[11px] font-sans">
                Nearest Zone: <strong className="text-white">{location.nearestZoneName}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Campus Zone</label>
                <select
                  value={selectedSosZone}
                  onChange={e => setSelectedSosZone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Specific Landmark / Floor</label>
                <input
                  type="text"
                  value={sosLocationDetails}
                  onChange={e => setSosLocationDetails(e.target.value)}
                  placeholder="e.g. 2nd floor library near elevator"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Emergency Scene Photo Upload/Camera Attachment */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-left space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Emergency Scene Photo (Sent Directly to Authorities)
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Optional</span>
            </div>

            {sosPhoto ? (
              <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                    <img
                      src={sosPhoto.url}
                      alt="Emergency Scene"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Photo Armed for Transmission</span>
                    </span>
                    <p className="text-[11px] text-slate-300 font-mono mt-0.5 truncate max-w-[200px] sm:max-w-xs">
                      {sosPhoto.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Will be sent directly to security dispatch when you tap SOS
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowSosPhotoModal(true)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                    title="Change Photo"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setSosPhoto(null)}
                    className="p-1.5 bg-slate-800 hover:bg-red-950 text-red-400 rounded-lg text-xs"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Take a live camera picture or upload an image of the threat, injury, or hazard. It will be dispatched immediately with your SOS alert.
                </p>
                <button
                  type="button"
                  onClick={() => setShowSosPhotoModal(true)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-rose-950 hover:border-rose-700 border border-slate-700 text-rose-300 font-bold text-xs rounded-xl flex items-center gap-2 whitespace-nowrap transition shadow-sm"
                >
                  <Camera className="w-4 h-4 text-rose-400" />
                  <span>Take / Upload Photo</span>
                </button>
              </div>
            )}
          </div>

          {/* MAIN SOS ACTIVATION AREA */}
          <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-6">
            {!sosCountingDown ? (
              <>
                <div className="relative group">
                  <div className="absolute inset-0 rounded-full bg-rose-600/30 blur-2xl group-hover:bg-rose-600/50 transition-all duration-500 animate-pulse" />
                  <button
                    onClick={handleStartSos}
                    className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-rose-700 via-red-600 to-rose-500 text-white font-extrabold shadow-2xl shadow-rose-950 flex flex-col items-center justify-center gap-2 transform active:scale-95 hover:scale-105 transition-all border-4 border-rose-400/40"
                  >
                    <AlertOctagon className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-md animate-bounce" />
                    <span className="text-2xl sm:text-3xl tracking-widest font-black uppercase">
                      SOS
                    </span>
                    <span className="text-[10px] tracking-wider font-semibold opacity-90 uppercase">
                      Tap for Dispatch
                    </span>
                  </button>
                </div>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Pressing SOS initiates an immediate Critical priority dispatch. A 3-second abort window lets you cancel accidental activations.
                </p>
              </>
            ) : (
              /* COUNTDOWN ACTIVE VIEW */
              <div className="space-y-6 py-4 animate-fadeIn">
                <div className="text-rose-400 text-sm font-bold uppercase tracking-wider animate-pulse">
                  TRANSMITTING DISTRESS BEACON IN
                </div>
                <div className="w-36 h-36 rounded-full border-4 border-rose-500 bg-rose-950/60 flex items-center justify-center mx-auto shadow-2xl shadow-rose-600/50">
                  <span className="text-6xl font-black text-white font-mono">
                    {countdownSeconds}
                  </span>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleCancelSos}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl border border-slate-600 transition"
                  >
                    Abort / Cancel SOS
                  </button>
                  <p className="text-[11px] text-slate-400">
                    Emergency response officers will be notified at 0 seconds.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Contacts Quick Dial Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-left">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Campus Security</span>
              <span className="text-xs font-bold text-white block mt-0.5">(555) 019-SAFE</span>
              <span className="text-[10px] text-emerald-400">24/7 Dispatch Unit</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-left">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Student Health Clinic</span>
              <span className="text-xs font-bold text-white block mt-0.5">(555) 019-CARE</span>
              <span className="text-[10px] text-blue-400">Urgent Nurse Line</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-left col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Dorm Safety RA</span>
              <span className="text-xs font-bold text-white block mt-0.5">(555) 019-DORM</span>
              <span className="text-[10px] text-purple-400">South Quad Dorm C</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE INCIDENT TRACKER */}
      {activeTab === 'ACTIVE' && (
        <div className="space-y-6">
          {activeIncident ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Tracker Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-bold text-white">
                      {activeIncident.code}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        SEVERITY_BADGES[activeIncident.severity].bg
                      } ${SEVERITY_BADGES[activeIncident.severity].text} ${
                        SEVERITY_BADGES[activeIncident.severity].border
                      }`}
                    >
                      {activeIncident.severity}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                      STATUS: {activeIncident.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 mt-1">
                    {TYPE_LABELS[activeIncident.type].title} • {activeIncident.zoneName}
                  </h3>
                </div>

                <button
                  onClick={() => onSelectIncident(activeIncident)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition"
                >
                  View Full Audit Details
                </button>
              </div>

              {/* Status Progression Stepper */}
              <div className="py-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                  Live Dispatch Progression
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                  {[
                    { step: 'REPORTED', label: '1. Lodged' },
                    { step: 'ASSIGNED', label: '2. Assigned' },
                    { step: 'ACKNOWLEDGED', label: '3. Acknowledged' },
                    { step: 'RESPONDING', label: '4. En Route' },
                    { step: 'ARRIVED', label: '5. On Scene' },
                    { step: 'RESOLVED', label: '6. Resolved' },
                  ].map((s, idx) => {
                    const stepOrder = ['REPORTED', 'ASSIGNED', 'ACKNOWLEDGED', 'RESPONDING', 'ARRIVED', 'RESOLVED'];
                    const currentIdx = stepOrder.indexOf(activeIncident.status);
                    const isDone = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div
                        key={s.step}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition ${
                          isCurrent
                            ? 'bg-rose-950/80 border-rose-500 text-white ring-2 ring-rose-500/30'
                            : isDone
                            ? 'bg-emerald-950/40 border-emerald-700 text-emerald-300'
                            : 'bg-slate-950/40 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span className="text-[10px] font-bold block">{s.label}</span>
                        {isCurrent && (
                          <span className="text-[9px] text-rose-400 font-semibold animate-pulse mt-0.5">
                            Active Stage
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assigned Officer Contact Box */}
              {activeIncident.assignedOfficerName ? (
                <div className="bg-slate-950/60 p-4 rounded-xl border border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-950 rounded-xl text-blue-400 border border-blue-800">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs text-blue-400 font-semibold block uppercase tracking-wider">
                        Assigned Responding Officer
                      </span>
                      <h4 className="text-base font-bold text-white">
                        {activeIncident.assignedOfficerName}
                      </h4>
                      <span className="text-xs font-mono text-slate-400">
                        Badge ID: {activeIncident.assignedBadge} • Unit Active
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-700 text-emerald-400 text-xs font-bold">
                      Estimated ETA: ~2-3 mins
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/60 p-4 rounded-xl border border-amber-900/40 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                  <p className="text-xs text-amber-200">
                    Awaiting dispatch assignment by Campus Safety Operations Center. Stay in place if safe to do so.
                  </p>
                </div>
              )}

              {/* Attached Incident Scene Photo */}
              {activeIncident.evidenceUrl && (
                <div className="bg-slate-950/60 p-4 rounded-xl border border-rose-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4" />
                      <span>Transmitted Scene Photo (Received by Authorities)</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      ✓ Dispatched with Alert
                    </span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 max-h-60 bg-black flex items-center justify-center">
                    <img
                      src={activeIncident.evidenceUrl}
                      alt="Transmitted incident evidence"
                      className="w-full max-h-60 object-contain rounded-lg"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    File: {activeIncident.evidenceName || 'emergency_photo.jpg'}
                  </p>
                </div>
              )}

              {/* Latest Timeline Activity */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Transmitted Real-Time GPS Coordinates
                </span>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-white font-bold">Fix:</span>
                    <span className="text-emerald-400">
                      {activeIncident.coordinates.lat.toFixed(5)}° N, {Math.abs(activeIncident.coordinates.lng).toFixed(5)}° W
                    </span>
                    {activeIncident.coordinates.accuracy && (
                      <span className="text-slate-500 font-sans text-[10px]">
                        (±{activeIncident.coordinates.accuracy}m)
                      </span>
                    )}
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${activeIncident.coordinates.lat},${activeIncident.coordinates.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline font-sans text-xs flex items-center gap-1"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Latest Timeline Activity */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Latest Operations Note
                </span>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                  {activeIncident.timeline[activeIncident.timeline.length - 1]?.note || 'No notes yet'}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Active Emergency Reports</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You have no pending SOS dispatches or open incident reports. If you require assistance, use the Emergency SOS button or submit a report.
              </p>
              <button
                onClick={() => setActiveTab('SOS')}
                className="mt-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white rounded-lg transition"
              >
                Go to Emergency SOS
              </button>
            </div>
          )}

          {/* Past Incident History */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              My Incident History ({myIncidents.length})
            </h4>
            <div className="space-y-2">
              {myIncidents.map(inc => (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className="p-3.5 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-white">{inc.code}</span>
                    <span className="text-xs text-slate-300">{TYPE_LABELS[inc.type].title}</span>
                    <span className="text-[11px] text-slate-500">• {inc.zoneName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        inc.status === 'RESOLVED'
                          ? 'bg-emerald-950 text-emerald-400'
                          : inc.status === 'CANCELLED'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-rose-950 text-rose-400'
                      }`}
                    >
                      {inc.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REPORT AN INCIDENT FORM */}
      {activeTab === 'REPORT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-400" />
              <span>Campus Incident Reporting Form</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Submit reports regarding campus hazards, suspicious behavior, property damage, or non-acute safety concerns.
            </p>
          </div>

          {reportSuccessCode && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-600 rounded-xl text-emerald-200 text-xs flex items-center justify-between gap-2">
              <div>
                <strong>Report Lodged Successfully:</strong> Reference code{' '}
                <span className="font-mono font-bold text-white underline">{reportSuccessCode}</span>.
                Campus Safety Dispatch will review and triage.
              </div>
              <button
                onClick={() => setReportSuccessCode(null)}
                className="text-emerald-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleReportSubmit} className="space-y-4">
            {/* Category / Type */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Incident Category <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(TYPE_LABELS) as IncidentType[])
                  .filter(t => t !== 'SILENT_SOS')
                  .map(t => {
                    const cfg = TYPE_LABELS[t];
                    const isSelected = reportType === t;
                    const defaultSev = TYPE_DEFAULT_SEVERITY[t];

                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setReportType(t)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition ${
                          isSelected
                            ? 'bg-rose-950/80 border-rose-500 text-white ring-1 ring-rose-500'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="font-bold block">{cfg.title}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Triage: {defaultSev}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Campus Zone */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Campus Location / Zone <span className="text-red-400">*</span>
              </label>
              <select
                value={reportZoneId}
                onChange={e => setReportZoneId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              >
                {zones.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.name} ({z.code}) — {z.riskLevel} Risk Zone
                  </option>
                ))}
              </select>
            </div>

            {/* Specific Landmark */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Specific Location Details <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={reportLocation}
                onChange={e => setReportLocation(e.target.value)}
                placeholder="e.g. West Stairwell between 3rd & 4th floors, near room 302"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Detailed Description <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={reportDescription}
                onChange={e => setReportDescription(e.target.value)}
                placeholder="Provide accurate details of the situation, persons involved, or hazards observed..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Evidence attachment (Camera / Upload Photo) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Photo Evidence / Scene Photograph (Optional)
              </label>
              {reportPhoto ? (
                <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={reportPhoto.url}
                      alt="Report evidence"
                      className="w-14 h-14 rounded-lg object-cover border border-slate-700"
                    />
                    <div>
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Evidence Photo Attached</span>
                      </span>
                      <p className="text-[11px] text-slate-300 font-mono mt-0.5">{reportPhoto.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowReportPhotoModal(true)}
                      className="px-2.5 py-1.5 bg-slate-800 text-xs text-slate-300 rounded-lg hover:bg-slate-700"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportPhoto(null)}
                      className="p-1.5 bg-slate-800 text-red-400 rounded-lg hover:bg-red-950"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReportPhotoModal(true)}
                    className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
                  >
                    <Camera className="w-4 h-4 text-rose-400" />
                    <span>Take or Upload Scene Photo</span>
                  </button>
                  <span className="text-[11px] text-slate-500">
                    Live camera capture, image files (JPEG, PNG), or emergency presets
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition"
            >
              Submit Official Incident Report
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: SAFE WALK & CHECK-IN */}
      {activeTab === 'SAFE_WALK' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Safe Walk Escort Request */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Footprints className="w-5 h-5" />
              <span>Safe Walk Campus Escort</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Walking across campus at night? Request a trained student safety patrol officer or campus security escort to accompany you directly to your dorm or vehicle.
            </p>

            {walkSuccess && (
              <div className="p-3 bg-purple-950/80 border border-purple-600 rounded-xl text-purple-200 text-xs">
                Safe Walk escort requested! Security command has been notified.
              </div>
            )}

            <form onSubmit={handleSafeWalkSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Pickup Location</label>
                <input
                  type="text"
                  required
                  value={pickupLocation}
                  onChange={e => setPickupLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Destination</label>
                <input
                  type="text"
                  required
                  value={destLocation}
                  onChange={e => setDestLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white rounded-xl transition"
              >
                Request Safety Escort
              </button>
            </form>

            {/* List active safe walks */}
            {safeWalks.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Recent Escort Requests
                </span>
                {safeWalks.map(sw => (
                  <div key={sw.id} className="p-2.5 bg-slate-950 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">To: {sw.destinationLocation}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300">
                        {sw.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">From: {sw.pickupLocation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safety Check-in Timer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Clock className="w-5 h-5" />
              <span>Timed Safety Check-In</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Set a timer when walking alone. If you do not tap "Arrived Safely" before time expires, your emergency contacts and campus security will be alerted.
            </p>

            {safetyCheckIns.filter(c => c.status === 'ACTIVE').length > 0 ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-600 rounded-xl space-y-3">
                {safetyCheckIns
                  .filter(c => c.status === 'ACTIVE')
                  .map(chk => (
                    <div key={chk.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">Active Walk: {chk.destination}</span>
                        <span className="text-emerald-400 font-mono animate-pulse font-bold">
                          TIMER ACTIVE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Expected by: {new Date(chk.expectedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <button
                        onClick={() => completeSafetyCheckIn(chk.id)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-lg transition"
                      >
                        ✓ I Have Arrived Safely
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Expected Destination</label>
                  <input
                    type="text"
                    value={checkInDest}
                    onChange={e => setCheckInDest(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Estimated Walk Time (Minutes)</label>
                  <select
                    value={checkInDuration}
                    onChange={e => setCheckInDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  >
                    <option value={10}>10 Minutes</option>
                    <option value={15}>15 Minutes</option>
                    <option value={25}>25 Minutes</option>
                    <option value={45}>45 Minutes</option>
                  </select>
                </div>
                <button
                  onClick={() => startSafetyCheckIn(checkInDest, checkInDuration)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-xl transition"
                >
                  Start Safety Timer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: DIGITAL SAFETY ID */}
      {activeTab === 'SAFETY_ID' && (
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                Digital Student Safety Pass
              </span>
              <h3 className="text-lg font-bold text-white">Smart Campus Guardian</h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white font-bold text-xs">
              ID
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center text-slate-300 text-xl font-bold shadow-inner">
              ER
            </div>
            <div>
              <h4 className="text-base font-bold text-white">{currentUser.name}</h4>
              <p className="text-xs font-mono text-slate-400">ID: {currentUser.studentId}</p>
              <p className="text-xs text-slate-400">{currentUser.dormLocation}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Blood Type</span>
              <span className="font-bold text-white">{currentUser.bloodType || 'O+'}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Medical Alerts</span>
              <span className="font-bold text-rose-400">{currentUser.allergies || 'Penicillin'}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 col-span-2">
              <span className="text-[10px] text-slate-500 uppercase block">Emergency Contact</span>
              <span className="font-bold text-white">
                {currentUser.emergencyContactName || 'Maria Rostova (Mother)'}
              </span>
              <span className="text-slate-400 block text-[11px]">
                {currentUser.emergencyContactPhone || '(555) 441-2390'}
              </span>
            </div>
          </div>

          {/* Simulated QR Code / Barcode */}
          <div className="p-4 bg-white rounded-2xl flex flex-col items-center justify-center space-y-2">
            <div className="font-mono text-black text-xs font-bold tracking-widest">
              ||| | ||||| || |||| ||| |||||
            </div>
            <span className="text-[10px] font-mono text-slate-700 tracking-wider font-semibold">
              SCG-VERIFIED-PASS-2026
            </span>
          </div>
        </div>
      )}

      {/* Photo Capture & Upload Modals */}
      <PhotoCaptureModal
        isOpen={showSosPhotoModal}
        onClose={() => setShowSosPhotoModal(false)}
        onPhotoSelected={photo => setSosPhoto(photo)}
        title="Take or Upload Photo for SOS Alert"
      />

      <PhotoCaptureModal
        isOpen={showReportPhotoModal}
        onClose={() => setShowReportPhotoModal(false)}
        onPhotoSelected={photo => setReportPhoto(photo)}
        title="Attach Incident Evidence Photo"
      />
    </div>
  );
};
