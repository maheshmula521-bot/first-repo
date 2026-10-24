import React from 'react';
import { Shield, Lock, Eye, Database, FileText, CheckCircle } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onBackToStations: () => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onBackToStations }) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400 mb-2">
          <Shield className="w-4 h-4" />
          <span>Security & Compliance Documentation</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mt-1">
          Effective Date: October 24, 2026 • Version 2.4.0
        </p>
      </div>

      {/* Overview Card */}
      <div className="p-6 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3">
        <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-400" />
          Core Data Principles
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          VoltPulse is engineered with data minimization as a primary architectural constraint. We only collect location and vehicle telemetry strictly required to deliver charging stall availability, compute accurate battery consumption, and authenticate session handshakes. We do not sell driver telemetry, route histories, or location profiles to data brokers.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6 text-sm text-slate-300">
        <section className="space-y-3 border-t border-slate-800/80 pt-6">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            1. Information Collected and Processing Scope
          </h3>
          <p className="text-slate-400 leading-relaxed">
            When utilizing VoltPulse services, the following technical data categories are processed:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-300">
            <li>
              <strong className="text-slate-200">Precise Geolocation:</strong> Used solely during active navigation to pinpoint surrounding stations within your vehicle's physical driving radius. Geolocation queries are ephemeral and discarded after station list rendering unless you save an explicit favorite.
            </li>
            <li>
              <strong className="text-slate-200">Vehicle Specifications & Telemetry:</strong> Vehicle make, battery pack capacity (kWh), EPA range, and connector preference used to run local deterministic consumption algorithms.
            </li>
            <li>
              <strong className="text-slate-200">Hardware Session Logs:</strong> When reserving a stall, station identifiers, stall numbers, reservation timestamps, and temporary PIN tokens are stored to authenticate charger lock states.
            </li>
            <li>
              <strong className="text-slate-200">Payment & Transaction Tokens:</strong> Payment credentials are processed directly through certified PCI-DSS Level 1 tokenized processors. Full payment card numbers are never stored on VoltPulse infrastructure.
            </li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-slate-800/80 pt-6">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            2. Usage of Information
          </h3>
          <p className="text-slate-400 leading-relaxed">
            Collected technical information is applied strictly to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <span className="font-semibold text-slate-200 text-xs block mb-1">Route & Energy Computation</span>
              <span className="text-xs text-slate-400">Determining distance-based battery reserve buffer and optimal charging stops without uploading continuous GPS logs.</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <span className="font-semibold text-slate-200 text-xs block mb-1">Station Hardware Reliability</span>
              <span className="text-xs text-slate-400">Aggregating anonymous connector speed measurements (delivered kW vs nameplate kW) to detect broken or throttled charge points.</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <span className="font-semibold text-slate-200 text-xs block mb-1">Stall Queue Reservation</span>
              <span className="text-xs text-slate-400">Locking selected connector bays and preventing double-booking across participating charging networks.</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <span className="font-semibold text-slate-200 text-xs block mb-1">System Fraud Prevention</span>
              <span className="text-xs text-slate-400">Preventing reservation spam, malicious rate-limiting exhaustion, or automated denial of charging bays.</span>
            </div>
          </div>
        </section>

        <section className="space-y-3 border-t border-slate-800/80 pt-6">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            3. Data Retention and User Rights
          </h3>
          <p className="text-slate-400 leading-relaxed">
            Under California Consumer Privacy Act (CCPA) and European General Data Protection Regulation (GDPR) mandates, drivers retain full sovereignty over their telemetry:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>Right to access all stored vehicle and reservation records.</li>
            <li>Right to permanent deletion of reservation logs and garage configurations.</li>
            <li>Right to opt-out of anonymous speed telemetry aggregation at any point.</li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-slate-800/80 pt-6">
          <h3 className="text-base font-semibold text-slate-100">
            4. Infrastructure Security & Operator Governance
          </h3>
          <p className="text-slate-400 leading-relaxed">
            All API communications between web clients, charging point controllers (OCPP 2.0.1 protocol), and backend relays utilize TLS 1.3 encryption. Access to station host controls and SCADA telemetry requires multi-factor authentication with automated audit trail logging.
          </p>
        </section>

        <section className="space-y-3 border-t border-slate-800/80 pt-6">
          <h3 className="text-base font-semibold text-slate-100">
            5. Contact Infrastructure Security Officer
          </h3>
          <p className="text-slate-400 leading-relaxed">
            For technical data inquiries, telemetry erasure requests, or security vulnerability disclosures:
          </p>
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
            <div>Office of Data Governance: privacy@voltpulse.internal</div>
            <div>PGP Key Fingerprint: 4E91 B27C 90FA 3122 8C59 1B80 77E2 44D9</div>
            <div>VoltPulse Telemetry & Infrastructure Systems Inc.</div>
          </div>
        </section>
      </div>

      {/* Back button */}
      <div className="pt-6 border-t border-slate-800 flex justify-between items-center">
        <button
          onClick={onBackToStations}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
        >
          Return to Station Explorer
        </button>
        <span className="text-xs text-slate-500 font-mono">Document Ref: VP-SEC-2026.10</span>
      </div>
    </div>
  );
};
