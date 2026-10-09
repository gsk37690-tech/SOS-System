import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertCircle, BellRing, Check, Info } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  const { alerts, acknowledgeAlert, dismissAlert, currentUser } = useApp();
  const activeAlerts = alerts.filter(a => a.active);

  return (
    <div className="space-y-2">
      {/* Simulation Disclaimer Bar - Mandatory per AGENTS.md safety guidelines */}
      <div className="bg-slate-950/80 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-300/90 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-amber-200">DEMONSTRATION & TRAINING ENVIRONMENT:</strong> Fictional campus simulation. Does NOT transmit to real 911 dispatchers or off-campus police.
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Campus Dispatch Desk: <span className="text-amber-300 font-bold">(555) 019-SAFE</span>
        </div>
      </div>

      {/* Campus Emergency Broadcast Banners */}
      {activeAlerts.map(alert => (
        <div
          key={alert.id}
          className={`mx-4 mt-2 p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg ${
            alert.severity === 'EMERGENCY'
              ? 'bg-red-950/90 border-red-600 text-red-100 shadow-red-950/40'
              : alert.severity === 'WARNING'
              ? 'bg-amber-950/90 border-amber-600 text-amber-100 shadow-amber-950/40'
              : 'bg-blue-950/90 border-blue-600 text-blue-100 shadow-blue-950/40'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-black/30 shrink-0 mt-0.5">
              <BellRing className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm tracking-wide uppercase">{alert.title}</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/40">
                  {alert.severity}
                </span>
                <span className="text-xs opacity-75">
                  {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90">{alert.message}</p>
              <div className="mt-1 text-[11px] opacity-75">
                Targeted Zones: {alert.targetZones.join(', ')} • {alert.acknowledgedCount} student{alert.acknowledgedCount === 1 ? '' : 's'} acknowledged
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => acknowledgeAlert(alert.id)}
              className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-semibold flex items-center gap-1.5 transition text-white"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Acknowledge</span>
            </button>
            {currentUser.role === 'ROLE_ADMIN' && (
              <button
                onClick={() => dismissAlert(alert.id)}
                className="px-2.5 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-xs text-slate-300 transition"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
