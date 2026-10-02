import React from 'react';
import { DistrictData, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { tacticalAudio } from '../services/soundEffects';
import {
  X,
  CloudRain,
  Mountain,
  Layers,
  TreePine,
  History,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Truck,
  Radio,
  FileText
} from 'lucide-react';

interface DistrictDetailModalProps {
  district: DistrictData | null;
  onClose: () => void;
  language: SupportedLanguage;
  onViewMap?: (district: DistrictData) => void;
}

export const DistrictDetailModal: React.FC<DistrictDetailModalProps> = ({
  district,
  onClose,
  language,
  onViewMap,
}) => {
  if (!district) return null;
  const t = TRANSLATIONS[language];

  const { factorContributions } = district;
  const isCritical = district.riskLevel === 'critical';
  const isHigh = district.riskLevel === 'high';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded border border-slate-700 bg-[#090e17] p-6 shadow-2xl font-mono text-xs">
        {/* Close Button */}
        <button
          onClick={() => {
            tacticalAudio.playRadioChirp();
            onClose();
          }}
          className="absolute top-4 right-4 rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              STATION: {district.awsStationId}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 uppercase">{district.state} REGIONAL SECTOR</span>
          </div>
          <h2 className="font-display text-xl font-bold text-white mt-1">
            {district.name}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-sans">
            <span>Coordinates: <b>{(district.lat ?? 0).toFixed(4)}°N, {(district.lng ?? 0).toFixed(4)}°E</b></span>
            <span>·</span>
            <span>Elevation: <b>{district.elevationMeters}m MSL</b></span>
            <span>·</span>
            <span>Bedrock: <b>{district.geologyRockType}</b></span>
          </div>
        </div>

        {/* Geotechnical Engineering Summary Box */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
            <span className="text-[10px] text-slate-400 block uppercase">Factor of Safety ($F_s$)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-xl font-bold ${(district.factorOfSafety ?? 1.15) < 1.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {(district.factorOfSafety ?? 1.15).toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">Limit Eq.</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {(district.factorOfSafety ?? 1.15) < 1.0 ? '⚠ Plastic Shear Failure' : 'Stable Margin'}
            </span>
          </div>

          <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
            <span className="text-[10px] text-slate-400 block uppercase">Pore Water Press. ($u_w$)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold text-cyan-300">
                {(district.poreWaterPressureKpa ?? 28.5).toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-500">kPa</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Piezometer sensor reading
            </span>
          </div>

          <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
            <span className="text-[10px] text-slate-400 block uppercase">Borehole Creep Rate</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-xl font-bold ${(district.inclinometerCreepMmDay ?? 0) > 15 ? 'text-rose-400' : 'text-amber-300'}`}>
                {(district.inclinometerCreepMmDay ?? 1.2).toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-500">mm/d</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Inclinometer displacement
            </span>
          </div>

          <div className="rounded border border-slate-800 bg-slate-950 p-2.5">
            <span className="text-[10px] text-slate-400 block uppercase">HCI Risk Index</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-xl font-bold ${isCritical ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-cyan-400'}`}>
                {district.hciScore}
              </span>
              <span className="text-[10px] text-slate-500">/ 100</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-rose-300 block mt-1">
              {district.riskLevel} Level
            </span>
          </div>
        </div>

        {/* Explainable AI / Geotechnical Decomposition */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              RandomForest Geotechnical Attribution Decomposition
            </h3>
            <span className="text-[10px] text-slate-500">SHAP-STYLE WEIGHTS</span>
          </div>

          <div className="space-y-2 rounded border border-slate-800 bg-slate-950/80 p-3.5">
            {/* 1. Rainfall Pluvial */}
            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <CloudRain className="h-3.5 w-3.5 text-cyan-400" />
                  Pluvial Saturation (24h: {district.rainfallMm24h} mm | 72h: {district.rainfallMm72h} mm)
                </span>
                <span className="font-bold text-cyan-300">
                  +{factorContributions.rainfall} pts
                </span>
              </div>
              <div className="h-1.5 w-full rounded bg-slate-800 overflow-hidden">
                <div className="h-full bg-cyan-500" style={{ width: `${(factorContributions.rainfall / (district.hciScore || 1)) * 100}%` }} />
              </div>
            </div>

            {/* 2. Slope Incline */}
            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Mountain className="h-3.5 w-3.5 text-amber-400" />
                  Topographic Slope Shear Angle ({(district.slopeDegrees ?? 0).toFixed(1)}° Incline)
                </span>
                <span className="font-bold text-amber-300">
                  +{factorContributions.slope} pts
                </span>
              </div>
              <div className="h-1.5 w-full rounded bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${(factorContributions.slope / (district.hciScore || 1)) * 100}%` }} />
              </div>
            </div>

            {/* 3. Soil Moisture */}
            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Layers className="h-3.5 w-3.5 text-sky-400" />
                  Soil Pore Saturation ({district.soilMoisturePct}% Saturation)
                </span>
                <span className="font-bold text-sky-300">
                  +{factorContributions.soilMoisture} pts
                </span>
              </div>
              <div className="h-1.5 w-full rounded bg-slate-800 overflow-hidden">
                <div className="h-full bg-sky-500" style={{ width: `${(factorContributions.soilMoisture / district.hciScore) * 100}%` }} />
              </div>
            </div>

            {/* 4. NDVI Vegetation */}
            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <TreePine className="h-3.5 w-3.5 text-emerald-400" />
                  NDVI Root Cohesion Anchorage (Index {district.ndviIndex})
                </span>
                <span className="font-bold text-emerald-300">
                  +{factorContributions.ndvi} pts
                </span>
              </div>
              <div className="h-1.5 w-full rounded bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${(factorContributions.ndvi / district.hciScore) * 100}%` }} />
              </div>
            </div>

            {/* 5. Historical */}
            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <History className="h-3.5 w-3.5 text-indigo-400" />
                  GSI Historical Recurrence ({district.historicalIncidentsDecade} events / decade)
                </span>
                <span className="font-bold text-indigo-300">
                  +{factorContributions.historical} pts
                </span>
              </div>
              <div className="h-1.5 w-full rounded bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${(factorContributions.historical / district.hciScore) * 100}%` }} />
              </div>
            </div>

            {/* 6. Seismic */}
            <div>
              <div className="flex justify-between mb-1 text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Activity className="h-3.5 w-3.5 text-rose-400" />
                  USGS Seismic Shaking Waveform
                </span>
                <span className="font-bold text-rose-300">
                  +{factorContributions.seismic} pts
                </span>
              </div>
              <div className="h-1.5 w-full rounded bg-slate-800 overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${(factorContributions.seismic / district.hciScore) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Operational Deployment Directives (BRO / SDRF) */}
        <div className="mt-4 rounded border border-slate-800 bg-[#080d14] p-3.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-bold text-slate-200 uppercase text-[11px]">
              CIVIL DEFENSE & BORDER ROADS DIRECTIVES
            </span>
            <span className="text-amber-400 font-bold">{district.highwayStatus}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-300">
            <div>
              <span className="text-slate-500 block">BRO TASK FORCE:</span>
              <b className="text-slate-200">{district.broProjectName}</b>
              <span className="text-slate-400 block mt-1">
                Pre-positioned heavy hydraulic equipment at chokepoint: {district.criticalInfrastructure[0]}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">SDRF UNIT:</span>
              <b className="text-slate-200">{district.sdrfUnitCallsign}</b>
              <span className="text-slate-400 block mt-1">
                Evacuation cordon active for ~{district.populationAtRisk.toLocaleString()} citizens in valley runout.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-800 pt-3">
          <button
            onClick={() => {
              tacticalAudio.playRadioChirp();
              onClose();
            }}
            className="rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
          >
            Dismiss
          </button>
          {onViewMap && (
            <button
              onClick={() => {
                tacticalAudio.playRadioChirp();
                onViewMap(district);
                onClose();
              }}
              className="rounded bg-cyan-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-600"
            >
              Focus on Leaflet GIS Map
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
