import React, { useState } from 'react';
import { CitizenReport, EarlyWarningAlert, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { ShieldAlert, AlertTriangle, Radio, CheckCircle, Clock, Send, Filter } from 'lucide-react';

interface AlertsFeedProps {
  alerts: EarlyWarningAlert[];
  citizenReports: CitizenReport[];
  language: SupportedLanguage;
  onOpenReportModal: () => void;
}

export const AlertsFeed: React.FC<AlertsFeedProps> = ({
  alerts,
  citizenReports,
  language,
  onOpenReportModal,
}) => {
  const t = TRANSLATIONS[language];
  const [viewMode, setViewMode] = useState<'all' | 'official' | 'citizen'>('all');
  const [simulatedDispatch, setSimulatedDispatch] = useState<string | null>(null);

  const handleSimulateBroadcast = (alertId: string) => {
    setSimulatedDispatch(alertId);
    setTimeout(() => {
      setSimulatedDispatch(null);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="rounded border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-rose-400 animate-pulse" />
              <h2 className="font-display text-lg font-bold text-white">
                Early Warning & Common Alerting Protocol (CAP) Broadcast Feed
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-400 max-w-3xl leading-relaxed">
              Standardized Multi-Agency Incident Dispatch Feed (Sachet / NDMA CAP-compliant). Fuses algorithmic triggers with verified ground-truth citizen reports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-500"
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Submit Ground Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 text-xs">
        <span className="text-slate-400 mr-2">Filter Stream:</span>
        <button
          onClick={() => setViewMode('all')}
          className={`rounded px-3 py-1 transition-colors ${
            viewMode === 'all'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Activity ({alerts.length + citizenReports.length})
        </button>
        <button
          onClick={() => setViewMode('official')}
          className={`rounded px-3 py-1 transition-colors ${
            viewMode === 'official'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Official Early Warnings ({alerts.length})
        </button>
        <button
          onClick={() => setViewMode('citizen')}
          className={`rounded px-3 py-1 transition-colors ${
            viewMode === 'citizen'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Ground Observations ({citizenReports.length})
        </button>
      </div>

      {/* Stream List */}
      <div className="space-y-4">
        {/* Official Alerts */}
        {(viewMode === 'all' || viewMode === 'official') &&
          alerts.map((alert) => {
            const isCritical = alert.level === 'critical';
            const isDispatched = alert.capProtocolStatus === 'DISPATCHED';

            return (
              <div
                key={alert.id}
                className={`rounded border p-4 transition-all ${
                  isCritical
                    ? 'border-rose-900/60 bg-rose-950/20 border-l-4 border-l-rose-500'
                    : 'border-amber-900/60 bg-amber-950/20 border-l-4 border-l-amber-500'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-xs font-bold uppercase px-2 py-0.5 rounded ${
                        isCritical
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {alert.level}
                    </span>
                    <span className="font-mono text-xs text-slate-300 font-semibold">
                      {alert.hazardType}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-xs text-slate-400">{alert.state}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                    <div className="flex items-center gap-1 text-cyan-300">
                      <Clock className="h-3 w-3" />
                      <span>Impact Window: ~{alert.timeToImpactHours}h</span>
                    </div>
                    <span aria-hidden="true" className="text-slate-700">|</span>
                    <span className="text-emerald-400">CAP: {alert.capProtocolStatus}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="font-display text-sm font-bold text-white">
                    {alert.headline}
                  </h3>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    {alert.details}
                  </p>
                </div>

                <div className="mt-3 rounded bg-slate-950/80 p-3 border border-slate-800/80 text-xs">
                  <span className="font-semibold text-amber-300 block mb-1">
                    Emergency Directive & Evacuation Action:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {alert.recommendedAction}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                  <span>Issued: {new Date(alert.issuedAt).toLocaleTimeString()}</span>
                  <button
                    onClick={() => handleSimulateBroadcast(alert.id)}
                    className="flex items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-300 hover:border-slate-600 hover:text-white"
                  >
                    <Send className="h-3 w-3 text-cyan-400" />
                    <span>
                      {simulatedDispatch === alert.id ? '✓ SMS Dispatched to Sirens' : 'Simulate Sirens / Cell Broadcast'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}

        {/* Citizen Reports */}
        {(viewMode === 'all' || viewMode === 'citizen') &&
          citizenReports.map((report) => (
            <div
              key={report.id}
              className="rounded border border-slate-800 bg-slate-950/60 p-4 border-l-4 border-l-cyan-500"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-cyan-950 px-2 py-0.5 font-mono text-[11px] text-cyan-300 border border-cyan-800">
                    FIELD CITIZEN REPORT
                  </span>
                  <span className="font-semibold text-slate-200">{report.districtName}</span>
                </div>
                <div className="font-mono text-slate-400 text-[11px]">
                  {new Date(report.timestamp).toLocaleTimeString()} · Status: {report.status.toUpperCase()}
                </div>
              </div>

              <div className="mt-2 text-xs text-slate-300 leading-relaxed">
                {report.description}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span>Reported by: <b className="text-slate-300">{report.reporterName}</b></span>
                  <span>({report.reporterRole.replace('_', ' ')})</span>
                </div>
                <div className="font-mono text-slate-400">
                  GPS: {report.lat.toFixed(4)}°N, {report.lng.toFixed(4)}°E
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
