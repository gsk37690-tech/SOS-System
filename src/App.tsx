import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Incident } from './types';
import { Header } from './components/Header';
import { EmergencyBanner } from './components/EmergencyBanner';
import { StudentPortal } from './components/student/StudentPortal';
import { SecurityPortal } from './components/security/SecurityPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { IncidentDetailModal } from './components/common/IncidentDetailModal';
import { Shield, LifeBuoy, MapPin, Phone } from 'lucide-react';

export const App: React.FC = () => {
  const { currentUser } = useApp();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />
      <EmergencyBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentUser.role === 'ROLE_STUDENT' && (
          <StudentPortal onSelectIncident={setSelectedIncident} />
        )}

        {currentUser.role === 'ROLE_SECURITY' && (
          <SecurityPortal onSelectIncident={setSelectedIncident} />
        )}

        {currentUser.role === 'ROLE_ADMIN' && (
          <AdminPortal onSelectIncident={setSelectedIncident} />
        )}
      </main>

      {/* Incident Detail / Triage Modal */}
      <IncidentDetailModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-xs text-slate-400 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-500" />
            <span className="font-semibold text-white">Smart Campus Guardian</span>
            <span className="text-slate-600">|</span>
            <span>Emergency Operations Center</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>24/7 Security Desk: (555) 019-SAFE</span>
            <span>•</span>
            <span>Medical Urgent: (555) 019-CARE</span>
            <span>•</span>
            <span>Campus Escort: (555) 019-WALK</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
