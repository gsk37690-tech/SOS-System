import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Incident, IncidentStatus, SecurityOfficer } from '../../types';
import { SEVERITY_BADGES, TYPE_LABELS } from '../../utils/constants';
import {
  Radio,
  Shield,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Navigation,
  AlertTriangle,
  FileCheck,
  ChevronRight,
  User,
  ShieldCheck,
  BellRing,
  Camera,
  Eye,
  Crosshair,
} from 'lucide-react';

interface SecurityPortalProps {
  onSelectIncident: (incident: Incident) => void;
}

export const SecurityPortal: React.FC<SecurityPortalProps> = ({ onSelectIncident }) => {
  const {
    currentUser,
    officers,
    incidents,
    zones,
    updateOfficerStatus,
    updateIncidentStatus,
    selfAssignAndAcknowledge,
  } = useApp();

  // Current security officer profile
  const myOfficer = officers.find(o => o.userId === currentUser.id) || officers[0];

  const [activeTab, setActiveTab] = useState<'DISPATCH' | 'ALL_ACTIVE' | 'HISTORY'>('DISPATCH');
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolvingIncidentId, setResolvingIncidentId] = useState<string | null>(null);

  // Filter incidents assigned to me
  const myAssignedIncidents = incidents.filter(
    i => (i.assignedOfficerId === myOfficer?.id || !i.assignedOfficerId) &&
         i.status !== 'RESOLVED' &&
         i.status !== 'CANCELLED'
  );

  const myHistoryIncidents = incidents.filter(
    i => (i.assignedOfficerId === myOfficer?.id) && (i.status === 'RESOLVED' || i.status === 'CANCELLED')
  );

  const handleStatusUpdate = (incident: Incident, newStatus: IncidentStatus) => {
    if (incident.status === 'REPORTED' && newStatus === 'ACKNOWLEDGED') {
      selfAssignAndAcknowledge(incident.id, myOfficer.id);
      return;
    }
    let note = '';
    if (newStatus === 'ACKNOWLEDGED') {
      note = `Dispatch acknowledged by ${myOfficer.name} (${myOfficer.badgeNumber}). Proceeding to call.`;
    } else if (newStatus === 'RESPONDING') {
      note = `Officer en route to ${incident.zoneName}. Code 2 response initialized.`;
    } else if (newStatus === 'ARRIVED') {
      note = `Officer arrived on scene at ${incident.locationDetails}. Assessing situation.`;
    }
    updateIncidentStatus(incident.id, newStatus, note);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingIncidentId || !resolutionNote.trim()) return;
    updateIncidentStatus(
      resolvingIncidentId,
      'RESOLVED',
      `Incident resolved on scene by ${myOfficer.name}. Resolution summary: ${resolutionNote.trim()}`
    );
    setResolvingIncidentId(null);
    setResolutionNote('');
  };

  return (
    <div className="space-y-6">
      {/* Officer Operational Status Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-950 rounded-2xl text-blue-400 border border-blue-800">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{myOfficer?.name || 'Officer Alex Rivera'}</h2>
              <span className="text-xs font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                {myOfficer?.badgeNumber || 'SCG-SEC-101'}
              </span>
              <span className="text-xs text-slate-400">({myOfficer?.callSign})</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Patrol Zone: <strong className="text-slate-200">{myOfficer?.currentZone}</strong> • {myOfficer?.assignedIncidentCount} Active Dispatch{myOfficer?.assignedIncidentCount === 1 ? '' : 'es'}
            </p>
          </div>
        </div>

        {/* Status Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 mr-1">Duty Status:</span>
          {(['AVAILABLE', 'ON_PATROL', 'RESPONDING', 'OFF_DUTY'] as SecurityOfficer['status'][]).map(st => {
            const isSelected = myOfficer?.status === st;
            return (
              <button
                key={st}
                onClick={() => myOfficer && updateOfficerStatus(myOfficer.id, st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  isSelected
                    ? st === 'AVAILABLE'
                      ? 'bg-emerald-600 text-white'
                      : st === 'ON_PATROL'
                      ? 'bg-blue-600 text-white'
                      : st === 'RESPONDING'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-slate-700 text-slate-300'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('DISPATCH')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'DISPATCH'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-950'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>My Dispatch Queue ({myAssignedIncidents.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('ALL_ACTIVE')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'ALL_ACTIVE'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>All Campus Active ({(incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CANCELLED')).length})</span>
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'HISTORY'
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Resolved Log ({myHistoryIncidents.length})</span>
        </button>
      </div>

      {/* TAB: MY DISPATCH QUEUE */}
      {activeTab === 'DISPATCH' && (
        <div className="space-y-4">
          {myAssignedIncidents.length === 0 ? (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No Pending Dispatches</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No active dispatches currently assigned to your call sign. Continue regular zone patrol or monitor the campus radar.
              </p>
            </div>
          ) : (
            myAssignedIncidents.map(inc => {
              const typeCfg = TYPE_LABELS[inc.type];
              const sevCfg = SEVERITY_BADGES[inc.severity];
              const isAssignedToMe = inc.assignedOfficerId === myOfficer?.id;

              return (
                <div
                  key={inc.id}
                  className={`bg-slate-900 border rounded-2xl p-5 shadow-xl transition-all space-y-4 ${
                    inc.severity === 'CRITICAL'
                      ? 'border-red-600/80 bg-red-950/20'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Incident Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-base font-black text-white">
                        {inc.code}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${sevCfg.bg} ${sevCfg.text} ${sevCfg.border}`}
                      >
                        {inc.severity}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
                        {inc.status}
                      </span>
                      {inc.isSilent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-900 text-red-200 animate-pulse">
                          SILENT SOS BEACON
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onSelectIncident(inc)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <span>Full Timeline</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Incident Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-bold text-rose-400 uppercase block mb-1">
                        Location / Campus Zone
                      </span>
                      <p className="font-bold text-white text-sm">{inc.zoneName}</p>
                      <p className="text-slate-300 mt-0.5">{inc.locationDetails}</p>
                      <p className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                        <Crosshair className="w-3 h-3 text-emerald-400" />
                        <span>GPS: {inc.coordinates.lat.toFixed(5)}°, {inc.coordinates.lng.toFixed(5)}°</span>
                      </p>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-bold text-blue-400 uppercase block mb-1">
                        Caller / Reporter
                      </span>
                      <p className="font-bold text-white text-sm">{inc.reporterName}</p>
                      <p className="text-slate-300 mt-0.5">{inc.reporterPhone}</p>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-bold text-amber-400 uppercase block mb-1">
                        Dispatched Unit
                      </span>
                      <p className="font-bold text-white text-sm">
                        {inc.assignedOfficerName || 'Awaiting assignment'}
                      </p>
                      <p className="text-slate-300 mt-0.5">
                        {inc.assignedBadge ? `Badge: ${inc.assignedBadge}` : 'Unassigned'}
                      </p>
                    </div>
                  </div>

                  {/* Transmitted Emergency Scene Photo */}
                  {inc.evidenceUrl && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-rose-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                      <div className="flex items-center gap-3">
                        <img
                          src={inc.evidenceUrl}
                          alt="Emergency Scene"
                          className="w-16 h-12 object-cover rounded-lg border border-slate-700 cursor-pointer hover:opacity-90 transition shrink-0"
                          onClick={() => onSelectIncident(inc)}
                        />
                        <div>
                          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5" />
                            <span>ON-SCENE PHOTO TRANSMITTED WITH SOS ALERT</span>
                          </span>
                          <span className="text-xs text-white font-mono font-semibold block mt-0.5">
                            {inc.evidenceName || 'emergency_photo.jpg'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Captured on caller device and routed to patrol unit
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectIncident(inc)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-rose-300 rounded-lg flex items-center gap-1.5 self-end sm:self-center transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Full Photo</span>
                      </button>
                    </div>
                  )}

                  {/* Description */}
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80 text-xs text-slate-200 leading-relaxed">
                    <strong>Report:</strong> {inc.description}
                  </div>

                  {/* Security Workflow Actions (Mandated Transitions) */}
                  <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                    <div className="text-xs text-slate-400">
                      Action Required: <strong className="text-white">Next Stage</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {inc.status === 'REPORTED' && (
                        <button
                          type="button"
                          onClick={() => selfAssignAndAcknowledge(inc.id, myOfficer.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-lg transition shadow-md flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Self-Assign & Acknowledge</span>
                        </button>
                      )}

                      {inc.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleStatusUpdate(inc, 'ACKNOWLEDGED')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-lg transition shadow-md"
                        >
                          ✓ Acknowledge Dispatch
                        </button>
                      )}

                      {inc.status === 'ACKNOWLEDGED' && (
                        <button
                          onClick={() => handleStatusUpdate(inc, 'RESPONDING')}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white rounded-lg transition shadow-md flex items-center gap-1.5"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>En Route / Responding</span>
                        </button>
                      )}

                      {inc.status === 'RESPONDING' && (
                        <button
                          onClick={() => handleStatusUpdate(inc, 'ARRIVED')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-lg transition shadow-md flex items-center gap-1.5"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Arrived On Scene</span>
                        </button>
                      )}

                      {inc.status === 'ARRIVED' && (
                        <button
                          onClick={() => setResolvingIncidentId(inc.id)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-xs font-bold text-white rounded-lg transition shadow-md flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve Incident</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB: ALL CAMPUS ACTIVE */}
      {activeTab === 'ALL_ACTIVE' && (
        <div className="space-y-3">
          {incidents
            .filter(i => i.status !== 'RESOLVED' && i.status !== 'CANCELLED')
            .map(inc => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/80 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-xs">{inc.code}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        SEVERITY_BADGES[inc.severity].bg
                      } ${SEVERITY_BADGES[inc.severity].text} ${
                        SEVERITY_BADGES[inc.severity].border
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold">{TYPE_LABELS[inc.type].title}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{inc.zoneName} — {inc.locationDetails}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-blue-400 block">{inc.status}</span>
                  <span className="text-[11px] text-slate-500">
                    {inc.assignedOfficerName || 'No unit assigned'}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* TAB: RESOLVED LOG */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-3">
          {myHistoryIncidents.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-500">No resolved history yet.</p>
          ) : (
            myHistoryIncidents.map(inc => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-800 transition"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-white">{inc.code}</span>
                  <span className="text-xs text-slate-400 ml-2">{TYPE_LABELS[inc.type].title} ({inc.zoneName})</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400">
                  {inc.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Resolve Incident Note Modal */}
      {resolvingIncidentId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Complete Incident Resolution</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter official officer debrief and resolution actions taken prior to closing this dispatch record.
            </p>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Resolution Notes <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={resolutionNote}
                  onChange={e => setResolutionNote(e.target.value)}
                  placeholder="e.g. Student administered first aid by campus EMT. Situation stabilized; transported to university health center."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingIncidentId(null)}
                  className="px-3 py-1.5 bg-slate-800 text-xs text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!resolutionNote.trim()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white rounded-lg"
                >
                  Confirm Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
