import React from 'react';
import { X, CheckCircle2, AlertCircle, Database, ArrowRight } from 'lucide-react';

interface DataSourcesMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataSourcesMatrixModal: React.FC<DataSourcesMatrixModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const dataSources = [
    {
      parameter: 'Rainfall (24h / 72h Pluvial Saturation)',
      module: 'Module 1: Landslide HCI',
      prototypeSource: 'Open-Meteo Weather API',
      status: 'REAL_LIVE',
      statusLabel: 'Real Live API (No Key)',
      prodSwap: 'IMD Doppler Weather Radar (Mausam) + NASA GPM IMERG',
      notes: 'Real-time rainfall precipitation and antecedent pluvial accumulation queried per district coordinates with offline fallback.',
    },
    {
      parameter: 'Terrain Slope Angle & Elevation Profile',
      module: 'Module 1 & 4: HCI & SafePath',
      prototypeSource: 'Open-Elevation / SRTM DEM',
      status: 'REAL_LIVE',
      statusLabel: 'Real Live API (No Key)',
      prodSwap: 'ISRO Bhuvan CartoDEM (10m) / Copernicus DEM (30m)',
      notes: 'Derives critical friction angle (>35°) and topographic relief. High elevation contours feed directly into slope stability equations.',
    },
    {
      parameter: 'Seismic Tremors & Earthquake Epicenters',
      module: 'Module 1 & 2: Landslide & GLOF',
      prototypeSource: 'USGS Earthquake Hazards Feed',
      status: 'REAL_LIVE',
      statusLabel: 'Real Live API (No Key)',
      prodSwap: 'National Center for Seismology (NCS India) + USGS Webhooks',
      notes: 'Real-time GeoJSON feed filtering seismic events (M >= 2.5) within 1200km radius of the North Eastern Region centroid.',
    },
    {
      parameter: 'Glacial Lake Extent & Freeboard Height',
      module: 'Module 2: Glacier Watch',
      prototypeSource: 'Sentinel-2 Multispectral GIS Ground-Truth',
      status: 'REAL_GIS',
      statusLabel: 'Real GIS Baseline',
      prodSwap: 'Google Earth Engine Automated NDWI Lake Delineation Pipeline',
      notes: 'Accurate surface areas and moraine dams for South Lhonak, Shako Cho, Gurudongmar, Upper Siang, and Langtang Lirung calibrated post-2023/2026 events.',
    },
    {
      parameter: 'Glacier Surface Velocity Anomaly (Ice Creep Surge)',
      module: 'Module 3: Glacier Fall Precursor',
      prototypeSource: 'Domain-Informed Synthetic Creep Anomaly',
      status: 'SIMULATED',
      statusLabel: 'SIMULATED (Explicitly Tagged)',
      prodSwap: 'NASA ITS_LIVE / Sentinel-1 InSAR Offset-Tracking',
      notes: 'Simulates ice velocity surges (+15% to +45% above seasonal baseline). Flagged transparently in compliance with SIH rules.',
    },
    {
      parameter: 'Basal Melt & Subglacial Water Pressure',
      module: 'Module 3: Glacier Fall Precursor',
      prototypeSource: 'Domain-Informed Hydro-Thermal Score',
      status: 'SIMULATED',
      statusLabel: 'SIMULATED (Explicitly Tagged)',
      prodSwap: 'MODIS Terra/Aqua / Landsat 9 Land Surface Temperature (LST)',
      notes: 'Simulates basal hydraulic lubrication at the ice-bedrock boundary prior to sudden hanging glacier release.',
    },
    {
      parameter: 'Historical Landslide Recurrence & Geology',
      module: 'Module 1: HCI Model',
      prototypeSource: 'GSI National Landslide Susceptibility Mapping (NLSM)',
      status: 'REAL_GIS',
      statusLabel: 'Domain-Informed Real GIS',
      prodSwap: 'GSI Bhukosh Enterprise Spatial Database & CWC Gauge Networks',
      notes: 'Incorporates rock series (Daling phyllites, Barail sandstones, Disang shales) and documented failure frequency per decade.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg border border-slate-700 bg-[#0c121e] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-cyan-400" />
            <h2 className="font-display text-lg font-bold text-white">
              Project TRISHUL — Real vs. Simulated Data Source Matrix & Production Swap Architecture
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            SIH 2026 Evaluation Protocol: Full transparency regarding data streams. Every simulated channel is explicitly tagged in API payloads with documented production drop-in targets.
          </p>
        </div>

        {/* Matrix Table */}
        <div className="mt-5 overflow-x-auto rounded border border-slate-800 bg-slate-950/60">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950 font-mono text-[11px] text-slate-400 uppercase">
              <tr>
                <th className="px-4 py-3">Parameter & Layer</th>
                <th className="px-4 py-3">Prototype Source</th>
                <th className="px-4 py-3">Audit Status</th>
                <th className="px-4 py-3">Production Swap Target</th>
                <th className="px-4 py-3">Domain Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {dataSources.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-200">{item.parameter}</div>
                    <div className="font-mono text-[10px] text-cyan-400">{item.module}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">
                    {item.prototypeSource}
                  </td>
                  <td className="px-4 py-3">
                    {item.status === 'REAL_LIVE' && (
                      <span className="rounded bg-emerald-950 px-2 py-0.5 font-mono text-[10px] text-emerald-300 border border-emerald-800 font-semibold">
                        ● REAL LIVE API
                      </span>
                    )}
                    {item.status === 'REAL_GIS' && (
                      <span className="rounded bg-sky-950 px-2 py-0.5 font-mono text-[10px] text-sky-300 border border-sky-800 font-semibold">
                        ◆ REAL GIS CALIBRATED
                      </span>
                    )}
                    {item.status === 'SIMULATED' && (
                      <span className="rounded bg-amber-950 px-2 py-0.5 font-mono text-[10px] text-amber-300 border border-amber-800 font-semibold">
                        ▲ SIMULATED (TAGGED)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-[11px] text-slate-200">{item.prodSwap}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-[11px] leading-relaxed max-w-xs">
                    {item.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Production Swap Architecture Summary */}
        <div className="mt-5 rounded border border-cyan-900/40 bg-cyan-950/20 p-4 text-xs">
          <h4 className="font-display font-semibold text-cyan-300 mb-2">
            Production Swap Deployment Roadmap (Zero Architecture Rewrite):
          </h4>
          <p className="text-slate-300 leading-relaxed">
            The FastAPI/Express backend abstracts all data ingestors through standard interfaces. Swapping prototype feeds (Open-Meteo / simulated SAR) for enterprise satellite pipelines (ISRO NISAR, Sentinel-1 InSAR via Google Earth Engine) requires only updating environment endpoints in the ingestion worker—the downstream RandomForest models, SafePath Dijkstra router, and GIS frontend consume identical normalized schemas.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
