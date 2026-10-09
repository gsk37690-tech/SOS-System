import React, { useState } from 'react';
import { LiveLocationState } from '../../types';
import {
  MapPin,
  Navigation,
  Compass,
  Gauge,
  Radio,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Crosshair,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface LiveLocationIndicatorProps {
  location: LiveLocationState;
  isSimulated: boolean;
  onToggleSimulation: () => void;
  onRefresh: () => void;
  compact?: boolean;
}

export const LiveLocationIndicator: React.FC<LiveLocationIndicatorProps> = ({
  location,
  isSimulated,
  onToggleSimulation,
  onRefresh,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all">
      {/* Main Bar */}
      <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Radar Beacon */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/80 shrink-0">
            <span className="absolute w-2 h-2 rounded-full bg-emerald-400" />
            <span className="absolute inset-0 rounded-full border border-emerald-400 animate-ping opacity-75" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                <span>Live Location Active</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700/60 font-mono">
                GPS LOCK (±{location.accuracy}m)
              </span>
              {isSimulated && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  Campus Beacon
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-300 font-mono flex-wrap">
              <span className="text-emerald-400 font-bold">
                {location.lat.toFixed(5)}° N, {Math.abs(location.lng).toFixed(5)}° W
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-sans">
                Near <strong className="text-white">{location.nearestZoneName}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            title="Update GPS fix"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1 transition"
          >
            <span>{expanded ? 'Hide Telemetry' : 'Telemetry'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Telemetry Drawer */}
      {expanded && (
        <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 text-xs space-y-3 animate-fadeIn">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                <Crosshair className="w-3 h-3 text-rose-400" />
                <span>Accuracy Radius</span>
              </span>
              <p className="font-mono font-bold text-white">±{location.accuracy} meters</p>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                <Gauge className="w-3 h-3 text-blue-400" />
                <span>Current Speed</span>
              </span>
              <p className="font-mono font-bold text-white">
                {location.speed !== null ? `${location.speed} m/s` : 'Stationary'}
              </p>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-400" />
                <span>Heading Bearing</span>
              </span>
              <p className="font-mono font-bold text-white">
                {location.heading !== null ? `${location.heading}°` : 'N/A'}
              </p>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400" />
                <span>Fix Source</span>
              </span>
              <p className="font-mono font-bold text-emerald-400">
                {isSimulated ? 'Campus High-Gain' : 'Device Hardware'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-[11px] text-slate-400 border-t border-slate-800/60">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Coordinates are automatically stamped to your SOS alert when emergency is triggered.
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleSimulation}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline"
            >
              {isSimulated ? 'Use Real Device GPS Sensor' : 'Simulate Walking Across Campus'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
