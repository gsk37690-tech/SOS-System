import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CampusZone, Incident } from '../../types';
import { SEVERITY_BADGES } from '../../utils/constants';
import { Shield, AlertCircle, PhoneCall, Radio, Eye } from 'lucide-react';

interface CampusMapProps {
  onSelectIncident?: (incident: Incident) => void;
  selectedIncidentId?: string;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  onSelectIncident,
  selectedIncidentId,
}) => {
  const { zones, incidents, officers } = useApp();
  const [selectedZone, setSelectedZone] = useState<CampusZone | null>(null);

  const activeIncidents = incidents.filter(
    i => i.status !== 'RESOLVED' && i.status !== 'CANCELLED'
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-white">Live Campus Safety Radar</h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Blue Light (48)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Patrols ({officers.filter(o => o.status !== 'OFF_DUTY').length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Active Incidents ({activeIncidents.length})</span>
          </div>
        </div>
      </div>

      {/* Map Graphic Area */}
      <div className="relative w-full h-80 sm:h-96 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden border-b border-slate-800">
        {/* Subtle grid lines background */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(to right, #475569 1px, transparent 1px), linear-gradient(to bottom, #475569 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        {/* Campus Roadways / Walkways paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 stroke-slate-700" strokeWidth="3" strokeDasharray="4 4">
          <line x1="30%" y1="25%" x2="50%" y2="48%" />
          <line x1="70%" y1="22%" x2="50%" y2="48%" />
          <line x1="50%" y1="48%" x2="35%" y2="75%" />
          <line x1="50%" y1="48%" x2="82%" y2="72%" />
          <line x1="18%" y1="55%" x2="50%" y2="48%" />
        </svg>

        {/* Zones overlay */}
        {zones.map(zone => {
          const zoneIncidents = activeIncidents.filter(i => i.zoneId === zone.id);
          const hasCritical = zoneIncidents.some(i => i.severity === 'CRITICAL');
          const isSelected = selectedZone?.id === zone.id;

          return (
            <div
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              style={{
                left: `${zone.coordinates.x}%`,
                top: `${zone.coordinates.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute cursor-pointer transition-all duration-300 p-2.5 rounded-xl border flex flex-col items-center justify-center text-center max-w-[140px] sm:max-w-[160px] ${
                isSelected
                  ? 'ring-2 ring-rose-500 bg-slate-800/95 border-rose-500 z-20'
                  : hasCritical
                  ? 'bg-red-950/80 border-red-500/80 hover:bg-red-900/80 z-10'
                  : zone.riskLevel === 'HIGH'
                  ? 'bg-amber-950/60 border-amber-500/70 hover:bg-slate-800/80'
                  : zone.riskLevel === 'ELEVATED'
                  ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-800'
                  : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/90'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-black/40 px-1 py-0.5 rounded">
                  {zone.code}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    zone.riskLevel === 'HIGH'
                      ? 'bg-red-500'
                      : zone.riskLevel === 'ELEVATED'
                      ? 'bg-amber-500'
                      : zone.riskLevel === 'MODERATE'
                      ? 'bg-yellow-500'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>
              <span className="text-xs font-semibold text-white mt-1 leading-tight line-clamp-2">
                {zone.name}
              </span>

              {/* Badges for active incidents */}
              {zoneIncidents.length > 0 && (
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                    {zoneIncidents.length} alert{zoneIncidents.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Security Officers Position Indicators */}
        {officers
          .filter(o => o.status !== 'OFF_DUTY')
          .map((officer, idx) => {
            // Find corresponding zone coords
            const zone = zones.find(z => z.name === officer.currentZone) || zones[idx % zones.length];
            const offsetX = (idx % 2 === 0 ? 4 : -4);
            const offsetY = (idx % 2 === 0 ? -4 : 4);

            return (
              <div
                key={officer.id}
                title={`${officer.name} (${officer.callSign}) - ${officer.status}`}
                style={{
                  left: `${zone.coordinates.x + offsetX}%`,
                  top: `${zone.coordinates.y + offsetY}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute z-20 pointer-events-auto"
              >
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-900/90 border border-blue-400/80 text-blue-200 text-[10px] font-mono shadow-md">
                  <Radio className="w-2.5 h-2.5 text-blue-300 animate-pulse" />
                  <span className="hidden sm:inline">{officer.badgeNumber}</span>
                </div>
              </div>
            );
          })}

        {/* Active Incident Beacon Markers */}
        {activeIncidents.map(inc => {
          const zone = zones.find(z => z.id === inc.zoneId);
          if (!zone) return null;
          const isSelected = selectedIncidentId === inc.id;

          return (
            <div
              key={inc.id}
              onClick={e => {
                e.stopPropagation();
                if (onSelectIncident) onSelectIncident(inc);
              }}
              style={{
                left: `${zone.coordinates.x}%`,
                top: `${zone.coordinates.y - 6}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-30 cursor-pointer group"
            >
              <div
                className={`relative flex items-center justify-center w-7 h-7 rounded-full text-white shadow-xl ${
                  inc.severity === 'CRITICAL'
                    ? 'bg-red-600 animate-sos-radar'
                    : inc.severity === 'HIGH'
                    ? 'bg-amber-600'
                    : 'bg-yellow-600'
                } ${isSelected ? 'ring-4 ring-white' : ''}`}
              >
                <AlertCircle className="w-4 h-4 text-white" />
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block whitespace-nowrap bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[11px] text-white z-40 shadow-xl">
                <span className="font-bold">{inc.code}:</span> {inc.type} ({inc.status})
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Zone Detail Footer Drawer */}
      {selectedZone && (
        <div className="p-4 bg-slate-950/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border-t border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{selectedZone.name}</span>
              <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                Code: {selectedZone.code}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  selectedZone.riskLevel === 'HIGH'
                    ? 'bg-red-950 text-red-400 border border-red-700'
                    : selectedZone.riskLevel === 'ELEVATED'
                    ? 'bg-amber-950 text-amber-400 border border-amber-700'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                }`}
              >
                Risk: {selectedZone.riskLevel}
              </span>
            </div>
            <p className="text-slate-400 mt-1 leading-relaxed">{selectedZone.description}</p>
            <div className="flex items-center gap-3 mt-1.5 text-slate-500 text-[11px]">
              <span>Blue Light Callboxes: {selectedZone.blueLightBoxes} active</span>
              <span>•</span>
              <span>
                Active Dispatches:{' '}
                {activeIncidents.filter(i => i.zoneId === selectedZone.id).length}
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedZone(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
          >
            Close Details
          </button>
        </div>
      )}
    </div>
  );
};
