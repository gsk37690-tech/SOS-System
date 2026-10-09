import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Incident, IncidentSeverity, IncidentStatus } from '../../types';
import { SEVERITY_BADGES, TYPE_LABELS, VALID_TRANSITIONS } from '../../utils/constants';
import {
  X,
  Clock,
  Shield,
  MapPin,
  User,
  Phone,
  AlertTriangle,
  CheckCircle2,
  FileText,
  UserPlus,
  Send,
  Eye,
  Camera,
  Crosshair,
  ExternalLink,
} from 'lucide-react';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
}) => {
  const {
    currentUser,
    officers,
    assignOfficer,
    updateIncidentStatus,
    overrideSeverity,
    cancelIncident,
  } = useApp();

  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<IncidentSeverity>('HIGH');
  const [overrideJustification, setOverrideJustification] = useState('');

  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [assignNote, setAssignNote] = useState('');

  const [transitionNote, setTransitionNote] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!incident) return null;

  const typeConfig = TYPE_LABELS[incident.type];
  const severityConfig = SEVERITY_BADGES[incident.severity];
  const legalNextStatuses = VALID_TRANSITIONS[incident.status] || [];

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfficerId) return;
    assignOfficer(incident.id, selectedOfficerId, assignNote);
    setSelectedOfficerId('');
    setAssignNote('');
  };

  const handleStatusTransition = (status: IncidentStatus) => {
    const note = transitionNote.trim() || `Marked ${status} by ${currentUser.name} (${currentUser.role})`;
    updateIncidentStatus(incident.id, status, note);
    setTransitionNote('');
  };

  const handleSeveritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideJustification.trim()) return;
    overrideSeverity(incident.id, selectedSeverity, overrideJustification.trim());
    setOverrideModalOpen(false);
    setOverrideJustification('');
  };

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    cancelIncident(incident.id, cancelReason.trim());
    setShowCancelModal(false);
    setCancelReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl font-mono font-bold text-white tracking-wide">
                {incident.code}
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${severityConfig.bg} ${severityConfig.text} ${severityConfig.border}`}
              >
                {incident.severity}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {incident.status}
              </span>
              {incident.isSilent && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-700 animate-pulse">
                  SILENT BEACON
                </span>
              )}
            </div>
            <h2 className="text-base font-semibold text-slate-200">
              {typeConfig.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Location & Reporter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs tracking-wider uppercase">
                <MapPin className="w-4 h-4" />
                <span>Incident Location</span>
              </div>
              <p className="text-sm font-semibold text-white">{incident.zoneName}</p>
              <p className="text-xs text-slate-300">{incident.locationDetails}</p>
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] font-mono flex-wrap gap-1">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Crosshair className="w-3 h-3" />
                  <span>
                    GPS: {incident.coordinates.lat.toFixed(5)}°, {incident.coordinates.lng.toFixed(5)}°
                  </span>
                  {incident.coordinates.accuracy && (
                    <span className="text-slate-400 font-sans text-[10px]">(±{incident.coordinates.accuracy}m)</span>
                  )}
                </span>
                <a
                  href={`https://www.google.com/maps?q=${incident.coordinates.lat},${incident.coordinates.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline font-sans text-[11px] flex items-center gap-0.5"
                >
                  <span>Open Directions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs tracking-wider uppercase">
                <User className="w-4 h-4" />
                <span>Reporter Details</span>
              </div>
              <p className="text-sm font-semibold text-white">{incident.reporterName}</p>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{incident.reporterPhone}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Lodged: {new Date(incident.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Description / Circumstances
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {incident.description}
            </p>

            {/* Evidence attachment (Transmitted Scene Photo) */}
            {(incident.evidenceUrl || incident.evidenceName) && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                    <Camera className="w-4 h-4" />
                    <span>Emergency Scene Photo Transmitted with SOS</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded">
                    ✓ Verified Incident Media
                  </span>
                </div>

                {incident.evidenceUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black flex items-center justify-center">
                    <img
                      src={incident.evidenceUrl}
                      alt={incident.evidenceName || 'Emergency Scene Photo'}
                      className="w-full max-h-96 object-contain rounded-lg"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur px-2.5 py-1 rounded text-[11px] font-mono text-slate-300">
                      {incident.evidenceName || 'sos_scene_photo.jpg'}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900 rounded-lg flex items-center gap-2 text-xs text-slate-300">
                    <Camera className="w-4 h-4 text-slate-400" />
                    <span>File: {incident.evidenceName}</span>
                  </div>
                )}
                <p className="text-[11px] text-slate-400">
                  Transmitted directly by reporter to Campus Safety Authorities and dispatched patrol officers.
                </p>
              </div>
            )}
          </div>

          {/* Officer Assignment Bar */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Dispatched Security Unit</span>
              </span>
              {incident.assignedOfficerName ? (
                <div>
                  <span className="text-sm font-bold text-white">
                    {incident.assignedOfficerName}
                  </span>{' '}
                  <span className="text-xs font-mono text-blue-400">
                    ({incident.assignedBadge})
                  </span>
                </div>
              ) : (
                <span className="text-xs font-medium text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Unassigned - Awaiting Dispatch</span>
                </span>
              )}
            </div>

            {/* Admin Dispatch / Reassign Action */}
            {currentUser.role === 'ROLE_ADMIN' && incident.status !== 'RESOLVED' && incident.status !== 'CANCELLED' && (
              <form onSubmit={handleAssign} className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedOfficerId}
                  onChange={e => setSelectedOfficerId(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-rose-500"
                >
                  <option value="">Select Officer...</option>
                  {officers.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.badgeNumber}) - {o.status} [{o.assignedIncidentCount} active]
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={!selectedOfficerId}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold text-white rounded-lg transition"
                >
                  {incident.assignedOfficerId ? 'Reassign' : 'Dispatch'}
                </button>
              </form>
            )}
          </div>

          {/* Operational Workflow Controls (Admin & Security) */}
          {(currentUser.role === 'ROLE_ADMIN' || currentUser.role === 'ROLE_SECURITY') &&
            incident.status !== 'RESOLVED' &&
            incident.status !== 'CANCELLED' && (
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Workflow Actions ({incident.status})
                  </span>
                  {currentUser.role === 'ROLE_ADMIN' && (
                    <button
                      onClick={() => setOverrideModalOpen(true)}
                      className="text-xs text-amber-400 hover:text-amber-300 underline"
                    >
                      Override Severity (Triage Audit)
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={transitionNote}
                    onChange={e => setTransitionNote(e.target.value)}
                    placeholder="Enter dispatch note or status update details..."
                    className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    {legalNextStatuses
                      .filter(s => s !== 'CANCELLED')
                      .map(nextStatus => (
                        <button
                          key={nextStatus}
                          onClick={() => handleStatusTransition(nextStatus)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            nextStatus === 'RESOLVED'
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                              : 'bg-blue-600 hover:bg-blue-500 text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark {nextStatus}</span>
                        </button>
                      ))}

                    {legalNextStatuses.includes('CANCELLED') && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-red-950 text-red-400 border border-red-800/60 transition"
                      >
                        Cancel Incident
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Timeline of All Updates */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Audit Timeline ({incident.timeline.length} updates)</span>
            </h4>
            <div className="space-y-3 border-l-2 border-slate-800 ml-2 pl-4">
              {incident.timeline.map((update, index) => (
                <div key={update.id} className="relative group">
                  <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-slate-800 border-2 border-slate-600 group-hover:border-rose-500 transition" />
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-white">
                      {update.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(update.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{update.note}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Recorded by <strong className="text-slate-400">{update.actorName}</strong> ({update.actorRole})
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            ID: {incident.id}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>

      {/* Admin Severity Override Sub-Modal */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Admin Severity Override</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              As mandated by Smart Campus Guardian safety rules, any manual alteration to rule-based severity triage requires an auditable justification.
            </p>

            <form onSubmit={handleSeveritySubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">New Severity Level</label>
                <select
                  value={selectedSeverity}
                  onChange={e => setSelectedSeverity(e.target.value as IncidentSeverity)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  <option value="CRITICAL">CRITICAL (Immediate Life Threat)</option>
                  <option value="HIGH">HIGH (Urgent Safety Threat)</option>
                  <option value="MEDIUM">MEDIUM (Moderate Risk)</option>
                  <option value="LOW">LOW (Informational / Minor)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Auditable Justification <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={overrideJustification}
                  onChange={e => setOverrideJustification(e.target.value)}
                  placeholder="e.g. Upgraded to CRITICAL due to reports of weapon sighted..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-xs text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!overrideJustification.trim()}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-xs font-bold text-white rounded-lg"
                >
                  Confirm Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Incident Sub-Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Cancel Incident</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Provide a valid reason for aborting/cancelling this emergency dispatch.
            </p>

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Cancellation Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="e.g. Accidental false alarm or resolved independently..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-xs text-slate-300 rounded-lg"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!cancelReason.trim()}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-xs font-bold text-white rounded-lg"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
