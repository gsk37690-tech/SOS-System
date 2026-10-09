import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Incident, IncidentSeverity, IncidentStatus } from '../../types';
import { SEVERITY_BADGES, TYPE_LABELS } from '../../utils/constants';
import { CampusMap } from '../common/CampusMap';
import {
  ShieldAlert,
  Radio,
  Users,
  AlertTriangle,
  Send,
  BarChart3,
  FileText,
  Clock,
  CheckCircle2,
  Filter,
  UserCheck,
  Flame,
  Activity,
  Layers,
  Search,
  Camera,
} from 'lucide-react';

interface AdminPortalProps {
  onSelectIncident: (incident: Incident) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onSelectIncident }) => {
  const {
    currentUser,
    incidents,
    officers,
    zones,
    assignOfficer,
    broadcastAlert,
    auditLogs,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'TRIAGE' | 'RADAR' | 'BROADCAST' | 'DRILLS' | 'ANALYTICS' | 'AUDIT'>('TRIAGE');

  // Filters for Triage Board
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick dispatch state
  const [quickAssignIncidentId, setQuickAssignIncidentId] = useState<string | null>(null);
  const [quickOfficerId, setQuickOfficerId] = useState('');

  // Broadcast Alert Form state
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'EMERGENCY' | 'WARNING' | 'ADVISORY'>('WARNING');
  const [alertBroadcastSuccess, setAlertBroadcastSuccess] = useState(false);

  // Drill simulator state
  const [activeDrill, setActiveDrill] = useState<string | null>(null);
  const [drillParticipants, setDrillParticipants] = useState(0);

  const filteredIncidents = incidents.filter(inc => {
    if (filterSeverity !== 'ALL' && inc.severity !== filterSeverity) return false;
    if (filterStatus === 'ACTIVE' && (inc.status === 'RESOLVED' || inc.status === 'CANCELLED')) return false;
    if (filterStatus === 'RESOLVED' && inc.status !== 'RESOLVED') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inc.code.toLowerCase().includes(q) ||
        inc.zoneName.toLowerCase().includes(q) ||
        inc.reporterName.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleQuickAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAssignIncidentId || !quickOfficerId) return;
    assignOfficer(quickAssignIncidentId, quickOfficerId);
    setQuickAssignIncidentId(null);
    setQuickOfficerId('');
  };

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim() || !alertMessage.trim()) return;
    broadcastAlert(alertTitle.trim(), alertMessage.trim(), alertSeverity, ['All Campus Zones']);
    setAlertTitle('');
    setAlertMessage('');
    setAlertBroadcastSuccess(true);
    setTimeout(() => setAlertBroadcastSuccess(false), 4000);
  };

  const startDrill = (drillType: string) => {
    setActiveDrill(drillType);
    setDrillParticipants(184);
    broadcastAlert(
      `CAMPUS DRILL: ${drillType}`,
      `This is a scheduled campus safety drill. Practice standard protocols. Confirm check-in on this device.`,
      'WARNING',
      ['All Campus Zones']
    );
  };

  // Analytics calculation
  const totalIncidents = incidents.length;
  const activeCount = incidents.filter(i => i.status !== 'RESOLVED' && i.status !== 'CANCELLED').length;
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED').length;
  const resolvedCount = incidents.filter(i => i.status === 'RESOLVED').length;
  const resolutionRate = totalIncidents > 0 ? Math.round((resolvedCount / totalIncidents) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Admin KPI Header Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Queue</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {criticalCount}
          </div>
          <span className="text-[11px] text-rose-400 font-medium">
            Immediate Response Units
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Dispatches</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {activeCount}
          </div>
          <span className="text-[11px] text-amber-400 font-medium">
            Across {zones.length} Campus Zones
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Officers on Duty</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {officers.filter(o => o.status !== 'OFF_DUTY').length} / {officers.length}
          </div>
          <span className="text-[11px] text-blue-400 font-medium">
            {officers.filter(o => o.status === 'AVAILABLE').length} Available for Dispatch
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {resolutionRate}%
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">
            Avg Triage to Scene: 3.2m
          </span>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('TRIAGE')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'TRIAGE'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Incident Triage & Dispatch ({activeCount})</span>
        </button>
        <button
          onClick={() => setActiveTab('RADAR')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'RADAR'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Campus Radar & Zones</span>
        </button>
        <button
          onClick={() => setActiveTab('BROADCAST')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'BROADCAST'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Campus Broadcast Alerts</span>
        </button>
        <button
          onClick={() => setActiveTab('DRILLS')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'DRILLS'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Safety Drills</span>
        </button>
        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'ANALYTICS'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Risk Analytics</span>
        </button>
        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'AUDIT'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Immutable Audit Log ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: INCIDENT TRIAGE & DISPATCH BOARD */}
      {activeTab === 'TRIAGE' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search code, zone, reporter..."
                className="bg-slate-950 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 w-full sm:w-64 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400">Severity:</span>
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition ${
                    filterSeverity === sev
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}

              <span className="text-slate-400 ml-2">Scope:</span>
              <button
                onClick={() => setFilterStatus('ACTIVE')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                  filterStatus === 'ACTIVE'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-950 text-slate-400'
                }`}
              >
                Active Only
              </button>
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                  filterStatus === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-950 text-slate-400'
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Triage Cards List */}
          <div className="space-y-3">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-500">
                No incidents match the selected filter criteria.
              </div>
            ) : (
              filteredIncidents.map(inc => {
                const sevCfg = SEVERITY_BADGES[inc.severity];
                const typeCfg = TYPE_LABELS[inc.type];

                return (
                  <div
                    key={inc.id}
                    className={`bg-slate-900 border rounded-2xl p-5 shadow-xl transition-all space-y-4 ${
                      inc.severity === 'CRITICAL' && inc.status !== 'RESOLVED'
                        ? 'border-red-600 bg-red-950/20'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-base font-bold text-white">
                          {inc.code}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${sevCfg.bg} ${sevCfg.text} ${sevCfg.border}`}
                        >
                          {inc.severity}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {inc.status}
                        </span>
                        {inc.isSilent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-900 text-white animate-pulse">
                            SILENT SOS
                          </span>
                        )}
                        {inc.evidenceUrl && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1">
                            <Camera className="w-3 h-3 text-rose-400" />
                            <span>Photo Attached</span>
                          </span>
                        )}
                        <span className="text-xs font-semibold text-slate-300">
                          {typeCfg.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectIncident(inc)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg transition"
                        >
                          Open Triage Window
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Location</span>
                        <p className="font-bold text-white text-sm">{inc.zoneName}</p>
                        <p className="text-slate-300">{inc.locationDetails}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Reporter</span>
                        <p className="font-bold text-white text-sm">{inc.reporterName}</p>
                        <p className="text-slate-300">{inc.reporterPhone}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Assignment</span>
                        {inc.assignedOfficerName ? (
                          <p className="font-bold text-blue-400 text-sm">
                            {inc.assignedOfficerName} ({inc.assignedBadge})
                          </p>
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-amber-400 font-semibold">Unassigned</span>
                            <button
                              onClick={() => setQuickAssignIncidentId(inc.id)}
                              className="text-[11px] px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded"
                            >
                              Dispatch Now
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {inc.evidenceUrl && (
                      <div className="flex items-center gap-3 p-2.5 bg-slate-950/80 rounded-xl border border-rose-900/40">
                        <img
                          src={inc.evidenceUrl}
                          alt="Incident Photo"
                          className="w-14 h-11 object-cover rounded-lg border border-slate-700 cursor-pointer hover:opacity-80 transition shrink-0"
                          onClick={() => onSelectIncident(inc)}
                        />
                        <div className="text-xs">
                          <span className="font-bold text-rose-400 block text-[11px] uppercase tracking-wider">
                            Caller Photo Evidence Dispatched:
                          </span>
                          <span className="font-mono text-slate-300 text-[11px]">
                            {inc.evidenceName || 'emergency_photo.jpg'}
                          </span>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      {inc.description}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Quick Dispatch Modal */}
      {quickAssignIncidentId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white">Select Officer to Dispatch</h3>
            <form onSubmit={handleQuickAssign} className="space-y-4">
              <select
                value={quickOfficerId}
                onChange={e => setQuickOfficerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              >
                <option value="">Choose Security Officer...</option>
                {officers.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.badgeNumber}) — {o.status} [{o.assignedIncidentCount} assigned]
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickAssignIncidentId(null)}
                  className="px-3 py-1.5 bg-slate-800 text-xs text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!quickOfficerId}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-bold text-white rounded-lg"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: CAMPUS RADAR & ZONES */}
      {activeTab === 'RADAR' && (
        <div className="space-y-6">
          <CampusMap onSelectIncident={onSelectIncident} />

          {/* Zones Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map(zone => {
              const zoneIncidents = incidents.filter(
                i => i.zoneId === zone.id && i.status !== 'RESOLVED' && i.status !== 'CANCELLED'
              );

              return (
                <div key={zone.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{zone.name}</span>
                    <span className="text-[10px] font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-400">
                      {zone.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{zone.description}</p>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Blue Lights: {zone.blueLightBoxes}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        zoneIncidents.length > 0 ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'
                      }`}
                    >
                      {zoneIncidents.length} Active Dispatch{zoneIncidents.length === 1 ? '' : 'es'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: BROADCAST ALERTS */}
      {activeTab === 'BROADCAST' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <Send className="w-5 h-5" />
            <span>Emergency Broadcast Alert System</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Transmit instant high-priority emergency notifications to all enrolled students and on-duty security devices.
          </p>

          {alertBroadcastSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-600 rounded-xl text-emerald-200 text-xs">
              Broadcast successfully delivered to all campus client terminals!
            </div>
          )}

          <form onSubmit={handleBroadcastSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Alert Headline</label>
              <input
                type="text"
                required
                value={alertTitle}
                onChange={e => setAlertTitle(e.target.value)}
                placeholder="e.g. Severe Lightning Alert / Shelter Indoors"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Broadcast Severity</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'EMERGENCY', label: 'EMERGENCY', bg: 'bg-red-900 border-red-600' },
                  { id: 'WARNING', label: 'WARNING', bg: 'bg-amber-900 border-amber-600' },
                  { id: 'ADVISORY', label: 'ADVISORY', bg: 'bg-blue-900 border-blue-600' },
                ].map(s => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setAlertSeverity(s.id as any)}
                    className={`p-2 rounded-lg border text-xs font-bold transition ${
                      alertSeverity === s.id ? s.bg + ' text-white ring-1 ring-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Official Message Body</label>
              <textarea
                rows={4}
                required
                value={alertMessage}
                onChange={e => setAlertMessage(e.target.value)}
                placeholder="Provide direct instructions (e.g. avoid science quad, remain inside dorms until all-clear is sounded)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg"
            >
              Transmit Campus-Wide Broadcast
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: SAFETY DRILLS */}
      {activeTab === 'DRILLS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Campus Safety Drill Simulator</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Launch scheduled simulation drills to verify alarm propagation, student device responsiveness, and officer readiness metrics.
            </p>

            <div className="space-y-3">
              {[
                { title: 'Campus Evacuation Drill', type: 'EVACUATION', icon: Users },
                { title: 'Severe Weather / Shelter Drill', type: 'WEATHER', icon: Activity },
                { title: 'Fire Alarm & Response Drill', type: 'FIRE_DRILL', icon: Flame },
                { title: 'Lockdown & Safety Protocol Drill', type: 'LOCKDOWN', icon: ShieldAlert },
              ].map(d => (
                <div key={d.type} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <d.icon className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">{d.title}</span>
                  </div>
                  <button
                    onClick={() => startDrill(d.title)}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white rounded-lg transition"
                  >
                    Simulate
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">Active Drill Metrics</h3>
            {activeDrill ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-950/40 border border-amber-600 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-amber-300 block uppercase">
                    ACTIVE DRILL IN PROGRESS: {activeDrill}
                  </span>
                  <div className="text-2xl font-black text-white font-mono">
                    {drillParticipants} Student Check-ins
                  </div>
                  <p className="text-[11px] text-slate-300">
                    System response test active across all 6 zones.
                  </p>
                </div>
                <button
                  onClick={() => setActiveDrill(null)}
                  className="px-4 py-2 bg-slate-800 text-xs font-bold text-white rounded-lg hover:bg-slate-700"
                >
                  End Drill Simulation
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-8 text-center">
                No active drill currently running. Select a drill from the left panel to test emergency protocols.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: RISK ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Incidents by Campus Zone
              </h4>
              <div className="space-y-2">
                {zones.map(z => {
                  const count = incidents.filter(i => i.zoneId === z.id).length;
                  const pct = totalIncidents > 0 ? Math.round((count / totalIncidents) * 100) : 0;

                  return (
                    <div key={z.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{z.name}</span>
                        <span className="font-mono text-slate-400">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Severity Breakdown
              </h4>
              <div className="space-y-3">
                {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as IncidentSeverity[]).map(sev => {
                  const count = incidents.filter(i => i.severity === sev).length;
                  const pct = totalIncidents > 0 ? Math.round((count / totalIncidents) * 100) : 0;
                  const badge = SEVERITY_BADGES[sev];

                  return (
                    <div key={sev} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-bold ${badge.text}`}>{sev}</span>
                        <span className="font-mono text-slate-400">{count} incidents ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            sev === 'CRITICAL' ? 'bg-red-500' : sev === 'HIGH' ? 'bg-amber-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.max(5, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: IMMUTABLE AUDIT LOG */}
      {activeTab === 'AUDIT' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Campus Security Audit Trail ({auditLogs.length} events)</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Immutable chronological record per AGENTS.md compliance
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-white whitespace-nowrap">{log.actorName}</td>
                    <td className="p-3 text-slate-400 whitespace-nowrap">{log.actorRole}</td>
                    <td className="p-3 text-amber-400 font-bold whitespace-nowrap">{log.action}</td>
                    <td className="p-3 text-slate-300 whitespace-nowrap">{log.targetId}</td>
                    <td className="p-3 font-sans text-xs text-slate-300 max-w-xs">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
