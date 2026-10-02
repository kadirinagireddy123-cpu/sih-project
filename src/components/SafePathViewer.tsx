import React, { useState } from 'react';
import { EVACUATION_NETWORKS, calculateSafePath } from '../data/evacuationNetworks';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { Compass, ShieldCheck, AlertTriangle, ArrowRight, Clock, MapPin, CheckCircle2 } from 'lucide-react';

interface SafePathViewerProps {
  language: SupportedLanguage;
  onViewOnMap?: (districtId: string) => void;
}

export const SafePathViewer: React.FC<SafePathViewerProps> = ({ language, onViewOnMap }) => {
  const t = TRANSLATIONS[language];
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>('dist-east-sikkim');

  const network = EVACUATION_NETWORKS[selectedNetworkId];
  const [originId, setOriginId] = useState<string>(network?.defaultOriginId || 'gkt-center');
  const [destinationId, setDestinationId] = useState<string>(network?.defaultDestinationId || 'gkt-penlong');

  // Handle corridor switch
  const handleCorridorChange = (id: string) => {
    setSelectedNetworkId(id);
    const newNet = EVACUATION_NETWORKS[id];
    if (newNet) {
      setOriginId(newNet.defaultOriginId);
      setDestinationId(newNet.defaultDestinationId);
    }
  };

  const routeResult = network ? calculateSafePath(network, originId, destinationId) : null;

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="rounded border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-400" />
              <h2 className="font-display text-lg font-bold text-white">
                SafePath AI — Dynamic Hazard-Avoidant Evacuation Routing
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-400 max-w-3xl leading-relaxed">
              Standard GPS routing directs traffic through low-elevation valley highways that intersect active landslide chutes and debris flow runouts.
              SafePath AI uses risk-weighted graph shortest-path logic (Cost = Distance × [1 + 5 × (HCI / 100)^2.5]) to steer evacuees onto secure ridge corridors.
            </p>
          </div>
          <div className="font-mono text-xs text-emerald-400 border border-emerald-800/60 bg-emerald-950/40 px-3 py-1.5 rounded">
            DIJKSTRA / A* RISK-WEIGHTED
          </div>
        </div>
      </div>

      {/* Control Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded border border-slate-800 bg-slate-950/80 p-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Evacuation Corridor & District:
          </label>
          <select
            value={selectedNetworkId}
            onChange={(e) => handleCorridorChange(e.target.value)}
            className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="dist-east-sikkim">East Sikkim: Gangtok Urban & Ridge Corridor</option>
            <option value="dist-north-sikkim">North Sikkim: Mangan - Chungthang High Axis</option>
            <option value="dist-dima-hasao">Assam: Haflong - Jatinga Hill Section</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Starting Point (At Risk):
          </label>
          <select
            value={originId}
            onChange={(e) => setOriginId(e.target.value)}
            className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            {network &&
              Object.values(network.nodes).map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.elevation}m)
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Destination / Emergency Shelter:
          </label>
          <select
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            {network &&
              Object.values(network.nodes)
                .filter((n) => n.id !== originId)
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.isShelter ? '★ ' : ''}
                    {n.name} ({n.elevation}m)
                  </option>
                ))}
          </select>
        </div>
      </div>

      {/* Comparison: SafePath AI vs Direct Route */}
      {routeResult && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* SafePath Route Card (Emerald) */}
          <div className="rounded border-2 border-emerald-500/80 bg-slate-900/80 p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="font-display text-base font-bold text-white">
                  SafePath AI Recommended Route
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                RECOMMENDED
              </span>
            </div>

            {/* Metrics */}
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded bg-slate-950 p-2 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Distance</span>
                <span className="font-mono text-lg font-bold text-white">
                  {routeResult.safeRoute.totalDistanceKm} km
                </span>
              </div>
              <div className="rounded bg-slate-950 p-2 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Est. Time</span>
                <span className="font-mono text-lg font-bold text-emerald-300">
                  {routeResult.safeRoute.estimatedMinutes} min
                </span>
              </div>
              <div className="rounded bg-slate-950 p-2 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Peak Risk Encountered</span>
                <span className="font-mono text-lg font-bold text-cyan-300">
                  {routeResult.safeRoute.maxHciEncountered}/100
                </span>
              </div>
            </div>

            {/* Node path sequence */}
            <div className="mt-4 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">
                Waypoints Sequence:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {routeResult.safeRoute.nodes.map((node, i) => (
                  <React.Fragment key={node.id}>
                    <span
                      className={`rounded px-2 py-1 font-mono text-[11px] ${
                        node.isShelter
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold'
                          : 'bg-slate-950 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {node.name}
                    </span>
                    {i < routeResult.safeRoute.nodes.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-slate-600" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-5 rounded bg-emerald-950/20 p-3 border border-emerald-900/40 text-xs space-y-1.5 text-emerald-200/90">
              <span className="font-semibold block text-emerald-300">Evacuation Directives:</span>
              {routeResult.instructions.map((ins, idx) => (
                <div key={idx} className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{ins}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dangerous Baseline Route Card (Crimson) */}
          <div className="rounded border border-rose-900/60 bg-slate-900/40 p-5">
            <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                <h3 className="font-display text-base font-bold text-white">
                  Direct Valley Highway Route (High Hazard)
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                CRITICAL CHOKEPOINT
              </span>
            </div>

            {/* Metrics */}
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded bg-slate-950 p-2 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Distance</span>
                <span className="font-mono text-lg font-bold text-white">
                  {routeResult.directDangerousRoute.totalDistanceKm} km
                </span>
              </div>
              <div className="rounded bg-slate-950 p-2 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Est. Time</span>
                <span className="font-mono text-lg font-bold text-rose-300">
                  {routeResult.directDangerousRoute.estimatedMinutes} min
                </span>
              </div>
              <div className="rounded bg-slate-950 p-2 border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Peak Risk Encountered</span>
                <span className="font-mono text-lg font-bold text-rose-400">
                  {routeResult.directDangerousRoute.maxHciEncountered}/100
                </span>
              </div>
            </div>

            {/* Warning Details */}
            <div className="mt-4 space-y-2 text-xs text-slate-400 leading-relaxed">
              <p>
                Standard navigation algorithms optimize purely for mileage, routing civilian traffic and emergency ambulances straight through active debris chutes with HCI scores exceeding 85/100.
              </p>
              <div className="rounded bg-rose-950/30 p-3 border border-rose-900/40 text-rose-300 text-xs">
                <b>Danger Assessment:</b> High risk of vehicle entrapment due to sudden mudflow or bridge collapse along valley drainage channels.
              </div>
            </div>

            {/* Benefit banner */}
            <div className="mt-6 rounded border border-cyan-800/60 bg-cyan-950/30 p-3 text-center">
              <span className="text-xs text-slate-400 block">SafePath AI Safety Advantage:</span>
              <span className="font-mono text-2xl font-bold text-cyan-300">
                +{routeResult.safetyAdvantagePct}%
              </span>
              <span className="text-xs text-slate-300 block mt-0.5">
                Reduction in average route hazard exposure
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
