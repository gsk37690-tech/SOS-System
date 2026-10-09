import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import {
  ShieldAlert,
  Bell,
  Radio,
  UserCheck,
  RefreshCw,
  AlertTriangle,
  Flame,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    switchRole,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    triggerSimulatedSOS,
    resetAllData,
    incidents,
  } = useApp();

  const [showNotifs, setShowNotifs] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalActiveIncidents = incidents.filter(
    i => (i.severity === 'CRITICAL' || i.severity === 'HIGH') && i.status !== 'RESOLVED' && i.status !== 'CANCELLED'
  );

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      {/* Top Banner Alert Ticker if critical incidents exist */}
      {criticalActiveIncidents.length > 0 && (
        <div className="bg-red-600/90 text-white text-xs px-4 py-1.5 flex items-center justify-between font-medium">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex h-2 w-2 rounded-full bg-white animate-ping" />
            <span className="font-bold tracking-wide uppercase">ACTIVE EMERGENCIES:</span>
            <span>
              {criticalActiveIncidents.length} priority emergency response{criticalActiveIncidents.length > 1 ? 's' : ''} active across campus ({criticalActiveIncidents.map(i => i.code).join(', ')})
            </span>
          </div>
          <span className="hidden sm:inline bg-red-800 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider">
            Live Ops
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 shadow-lg shadow-rose-950/50">
              <ShieldAlert className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">Smart Campus Guardian</span>
                <span className="text-[10px] font-bold bg-slate-800 border border-slate-700 text-rose-400 px-1.5 py-0.5 rounded">
                  v2.6 SEC
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Emergency Dispatch & Incident Triage System
              </p>
            </div>
          </div>

          {/* Role Navigation Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => switchRole('ROLE_STUDENT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentUser.role === 'ROLE_STUDENT'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
            <button
              onClick={() => switchRole('ROLE_SECURITY')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentUser.role === 'ROLE_SECURITY'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Security Officer</span>
            </button>
            <button
              onClick={() => switchRole('ROLE_ADMIN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                currentUser.role === 'ROLE_ADMIN'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Center</span>
            </button>
          </div>

          {/* Quick Action Tools & Notifications */}
          <div className="flex items-center gap-2">
            {/* Simulate SOS Beacon */}
            <button
              onClick={triggerSimulatedSOS}
              title="Trigger a simulated SOS beacon for triage testing"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/40 border border-rose-900/60 rounded-lg hover:bg-rose-900/40 transition"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Simulate SOS</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-900">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-semibold text-white">System Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs text-rose-400 hover:text-rose-300"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-xs text-center text-slate-500">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-3 text-left transition hover:bg-slate-800/60 cursor-pointer ${
                            !n.read ? 'bg-slate-800/30' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`text-xs font-semibold ${
                                n.priority === 'URGENT'
                                  ? 'text-rose-400'
                                  : n.priority === 'HIGH'
                                  ? 'text-amber-400'
                                  : 'text-slate-200'
                              }`}
                            >
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-500 whitespace-nowrap">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                          {n.incidentCode && (
                            <span className="inline-block mt-1 text-[10px] font-mono bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                              {n.incidentCode}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reset Data Button */}
            <button
              onClick={resetAllData}
              title="Reset state to initial scenario data"
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
