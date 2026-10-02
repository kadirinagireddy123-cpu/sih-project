import React, { useState, useMemo } from 'react';
import { DistrictData, EarthquakeEvent, GlacialZone, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { ScenarioSimulator, StressScenario } from './ScenarioSimulator';
import { RiskMap } from './RiskMap';
import { tacticalAudio } from '../services/soundEffects';
import {
  AlertTriangle,
  CloudRain,
  Mountain,
  Activity,
  ShieldAlert,
  Gauge,
  Layers,
  FileText,
  Truck,
  Flame,
  Radio,
  Clock,
  Compass,
  Zap,
  Info,
  Map,
  Table as TableIcon,
  Columns
} from 'lucide-react';

interface DashboardProps {
  districts: DistrictData[];
  glaciers: GlacialZone[];
  earthquakes: EarthquakeEvent[];
  language: SupportedLanguage;
  selectedDistrict?: DistrictData | null;
  onSelectDistrict: (district: DistrictData) => void;
  onViewMapDistrict: (district: DistrictData) => void;
  currentScenario: StressScenario;
  onApplyScenario: (scenario: StressScenario) => void;
  isRecalculating: boolean;
  onOpenSitrepModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  districts,
  glaciers,
  earthquakes,
  language,
  selectedDistrict = null,
  onSelectDistrict,
  onViewMapDistrict,
  currentScenario,
  onApplyScenario,
  isRecalculating,
  onOpenSitrepModal,
}) => {
  const t = TRANSLATIONS[language];
  const [consoleMode, setConsoleMode] = useState<'map' | 'table' | 'split'>('map');
  const [filterState, setFilterState] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewDensity, setViewDensity] = useState<'detailed' | 'compact'>('detailed');

  // Statistics
  const criticalCount = districts.filter((d) => d.riskLevel === 'critical').length;
  const highCount = districts.filter((d) => d.riskLevel === 'high').length;
  const closedRoadsCount = districts.filter((d) => d.highwayStatus === 'CLOSED_SLIP').length;
  const restrictedRoadsCount = districts.filter((d) => d.highwayStatus === 'RESTRICTED').length;
  const maxHciDistrict = [...districts].sort((a, b) => (b.hciScore ?? 0) - (a.hciScore ?? 0))[0];
  const maxRainDistrict = [...districts].sort((a, b) => (b.rainfallMm24h ?? 0) - (a.rainfallMm24h ?? 0))[0];
  const lowestFosDistrict = [...districts].sort((a, b) => (a.factorOfSafety ?? 99) - (b.factorOfSafety ?? 99))[0];
  const totalPopAtRisk = districts.reduce((acc, d) => acc + (d.riskLevel === 'critical' || d.riskLevel === 'high' ? (d.populationAtRisk ?? 0) : 0), 0);
  const latestEq = earthquakes[0];

  const filteredDistricts = useMemo(() => {
    return districts.filter((d) => {
      const matchesState = filterState === 'all' || d.state === filterState;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (d.name || '').toLowerCase().includes(q) ||
        (d.state || '').toLowerCase().includes(q) ||
        (d.awsStationId || '').toLowerCase().includes(q) ||
        (d.broProjectName || '').toLowerCase().includes(q) ||
        (d.geologyRockType || '').toLowerCase().includes(q);
      return matchesState && matchesSearch;
    });
  }, [districts, filterState, searchQuery]);

  const uniqueStates = Array.from(new Set(districts.map((d) => d.state)));

  return (
    <div className="space-y-5">
      {/* 1. Tactical Scenario Stress-Test Console */}
      <ScenarioSimulator
        currentScenario={currentScenario}
        onApplyScenario={onApplyScenario}
        isRecalculating={isRecalculating}
      />

      {/* 2. Critical Alert Banner if failure thresholds breached */}
      {criticalCount > 0 && (
        <div className="rounded border border-rose-800 bg-rose-950/30 p-3.5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-rose-900/60 border border-rose-700 text-rose-300 shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-rose-300 uppercase tracking-wider">
                    OPERATIONAL FLASH: RED EXCLUSION PROTOCOL ACTIVE
                  </span>
                  <span className="font-mono text-[10px] text-rose-400 bg-rose-900/50 px-1.5 py-0.2 rounded border border-rose-800">
                    SOP-NDMA-04
                  </span>
                </div>
                <p className="mt-1 text-xs text-rose-200/90 leading-relaxed">
                  Geotechnical Limit Equilibrium breached in <b>{criticalCount} sectors</b> ({districts.filter(d => d.riskLevel === 'critical').map(d => d.name).join(', ')}).
                  Factor of safety $F_s &lt; 1.0$ indicates progressive plastic shear rupture.
                  Civilian traffic diverted to SafePath ridge egress. BRO Task Forces pre-positioned at highway chokepoints.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                tacticalAudio.playRadioChirp();
                onOpenSitrepModal();
              }}
              className="hidden sm:flex items-center gap-1.5 rounded border border-rose-700 bg-rose-900/80 px-2.5 py-1 text-xs font-mono font-bold text-rose-100 hover:bg-rose-800 shrink-0"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>DISPATCH SITREP</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Primary Geotechnical Telemetry KPI Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 font-mono text-xs">
        {/* Card 1: Factor of Safety & Critical Sectors */}
        <div className="rounded border border-slate-800 bg-[#090e17] p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-1.5 mb-2">
            <span className="uppercase tracking-wider text-[11px]">Slope Stability Factor ($F_s$)</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold tabular-nums text-rose-400">
                {(lowestFosDistrict?.factorOfSafety ?? 0.84).toFixed(2)}
              </span>
              <span className="text-[11px] text-slate-500 ml-1">Limit Eq.</span>
            </div>
            <div className="text-right text-[11px]">
              <span className="font-bold text-rose-400">{criticalCount} Critical</span>
              <span className="block text-amber-400">{highCount} High Risk</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 truncate">
            Worst sector: <b className="text-slate-200">{lowestFosDistrict?.name || 'North Sikkim'}</b>
          </div>
        </div>

        {/* Card 2: Peak Hazard Confidence Index */}
        <div className="rounded border border-slate-800 bg-[#090e17] p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-1.5 mb-2">
            <span className="uppercase tracking-wider text-[11px]">Peak HCI Risk Score</span>
            <Gauge className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold tabular-nums text-rose-400">
                {maxHciDistrict?.hciScore || 0}
              </span>
              <span className="text-[11px] text-slate-500 ml-1">/ 100</span>
            </div>
            <div className="text-right text-[11px]">
              <span className="text-slate-300 font-semibold">{totalPopAtRisk.toLocaleString()}</span>
              <span className="block text-slate-500 text-[10px]">Citizens in corridor</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 truncate">
            Sector: <b className="text-slate-200">{maxHciDistrict?.name || 'Monitoring Grid'}</b>
          </div>
        </div>

        {/* Card 3: Pluvial Saturation & Pore Pressure */}
        <div className="rounded border border-slate-800 bg-[#090e17] p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-1.5 mb-2">
            <span className="uppercase tracking-wider text-[11px]">Pluvial Surge (24h Peak)</span>
            <CloudRain className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold tabular-nums text-cyan-300">
                {(maxRainDistrict?.rainfallMm24h ?? 0.0).toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-500 ml-1">mm</span>
            </div>
            <div className="text-right text-[11px]">
              <span className="text-cyan-400 font-bold">{(maxRainDistrict?.poreWaterPressureKpa ?? 28.5).toFixed(1)} kPa</span>
              <span className="block text-slate-500 text-[10px]">Pore Pressure ($u_w$)</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 truncate">
            Source: <b className="text-slate-200">{maxRainDistrict?.awsStationId || 'AWS-NER-01'}</b>
          </div>
        </div>

        {/* Card 4: Highway Lifelines & BRO Operations */}
        <div className="rounded border border-slate-800 bg-[#090e17] p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-1.5 mb-2">
            <span className="uppercase tracking-wider text-[11px]">Strategic Highway Status</span>
            <Truck className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold tabular-nums text-rose-400">
                {closedRoadsCount}
              </span>
              <span className="text-[11px] text-slate-500 ml-1">Closed Slips</span>
            </div>
            <div className="text-right text-[11px]">
              <span className="text-amber-400 font-bold">{restrictedRoadsCount} Restricted</span>
              <span className="block text-emerald-400 text-[10px]">
                {districts.length - closedRoadsCount - restrictedRoadsCount} Open
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 truncate">
            BRO Operations: <b className="text-slate-200">Projects Swastik / Pushpak</b>
          </div>
        </div>
      </div>

      {/* 4. Telemetry Command Strip: Search, State Filters, View Density */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-y border-slate-800/80 py-2.5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px]">SEARCH:</span>
          <input
            type="text"
            placeholder="Station code, highway, rock series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 rounded border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-500 mr-1">STATE:</span>
          <button
            onClick={() => {
              tacticalAudio.playRadioChirp();
              setFilterState('all');
            }}
            className={`rounded px-2 py-0.5 transition-colors ${
              filterState === 'all'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All (10)
          </button>
          {uniqueStates.map((st) => (
            <button
              key={st}
              onClick={() => {
                tacticalAudio.playRadioChirp();
                setFilterState(st);
              }}
              className={`rounded px-2 py-0.5 transition-colors ${
                filterState === st
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
          <div className="h-3 w-px bg-slate-800 mx-1" />
          
          {/* Operational View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
            <button
              onClick={() => {
                tacticalAudio.playRadioChirp();
                setConsoleMode('map');
              }}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                consoleMode === 'map'
                  ? 'bg-cyan-900 text-cyan-200 font-bold border border-cyan-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="h-3 w-3 text-cyan-400" />
              <span>GIS Map</span>
            </button>
            <button
              onClick={() => {
                tacticalAudio.playRadioChirp();
                setConsoleMode('table');
              }}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                consoleMode === 'table'
                  ? 'bg-cyan-900 text-cyan-200 font-bold border border-cyan-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="h-3 w-3 text-cyan-400" />
              <span>Table</span>
            </button>
            <button
              onClick={() => {
                tacticalAudio.playRadioChirp();
                setConsoleMode('split');
              }}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors ${
                consoleMode === 'split'
                  ? 'bg-cyan-900 text-cyan-200 font-bold border border-cyan-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="h-3 w-3 text-cyan-400" />
              <span>Dual</span>
            </button>
          </div>

          <div className="h-3 w-px bg-slate-800 mx-1" />
          <button
            onClick={() => setViewDensity(viewDensity === 'detailed' ? 'compact' : 'detailed')}
            className="text-slate-400 hover:text-slate-200 border border-slate-800 bg-slate-900 px-2 py-0.5 rounded"
          >
            Density: {viewDensity.toUpperCase()}
          </button>
        </div>
      </div>

      {/* 5. GIS Map Display (Rendered when consoleMode is 'map' or 'split') */}
      {(consoleMode === 'map' || consoleMode === 'split') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-cyan-400" />
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
                LIVE GIS RISK TOPOGRAPHIC SENSOR MAP ({filteredDistricts.length} SECTORS)
              </h2>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span className="text-cyan-400">● LIVE WGS84 GIS ENGINE</span>
              <span aria-hidden="true" className="text-slate-700">|</span>
              <span>CARTO / OSM / ESRI TILES</span>
            </div>
          </div>

          <RiskMap
            districts={filteredDistricts}
            glaciers={glaciers}
            earthquakes={earthquakes}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={onSelectDistrict}
            language={language}
            height={consoleMode === 'split' ? '460px' : '580px'}
          />

          {/* Quick Sector Dispatch Cards under the map */}
          {consoleMode === 'map' && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 font-mono text-xs">
              {filteredDistricts.map((d) => {
                const isCrit = d.riskLevel === 'critical';
                const isHi = d.riskLevel === 'high';
                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      tacticalAudio.playRadioChirp();
                      onSelectDistrict(d);
                    }}
                    className={`cursor-pointer rounded border p-2.5 transition-all hover:border-slate-500 bg-[#090e17] ${
                      isCrit
                        ? 'border-rose-900/80 bg-rose-950/20'
                        : isHi
                        ? 'border-amber-900/80 bg-amber-950/20'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 truncate text-[11px]">
                        {d.name.split(' (')[0]}
                      </span>
                      <span
                        className={`text-[10px] px-1 rounded font-bold ${
                          isCrit
                            ? 'bg-rose-900 text-rose-200'
                            : isHi
                            ? 'bg-amber-900 text-amber-200'
                            : 'bg-cyan-950 text-cyan-300'
                        }`}
                      >
                        {d.hciScore}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Fs: {(d.factorOfSafety ?? 1.15).toFixed(2)}</span>
                      <span>{(d.rainfallMm24h ?? 0).toFixed(0)}mm</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. Master Geotechnical Operations Table (Rendered when consoleMode is 'table' or 'split') */}
      {(consoleMode === 'table' || consoleMode === 'split') && (
      <div className="overflow-hidden rounded border border-slate-800 bg-[#080d14] shadow-md">
        <div className="border-b border-slate-800 bg-[#0c121e] px-4 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-200 uppercase tracking-wide">
                  NER SECTOR GEOTECHNICAL TELEMETRY GRID & STABILITY LEDGER
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  REF: NDMA-TECH-26
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Limit equilibrium factor of safety ($F_s$), pore water pressure, subsurface borehole shear rate, and highway blockages.
              </p>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span>ACTIVE SECTORS: <b>{filteredDistricts.length}</b></span>
              <span aria-hidden="true" className="text-slate-700">|</span>
              <span className="text-cyan-400">TELEMETRY: LIVE ML ENSEMBLE</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 bg-[#060a10] text-[10px] text-slate-400 uppercase">
              <tr>
                <th className="px-3.5 py-2.5">Station & Sector</th>
                <th className="px-3 py-2.5">State</th>
                <th className="px-3 py-2.5 text-right">Slope</th>
                <th className="px-3 py-2.5 text-right">Rain (24h)</th>
                <th className="px-3 py-2.5 text-right">Pore Press ($u_w$)</th>
                <th className="px-3 py-2.5 text-right">Creep ($\Delta d$)</th>
                <th className="px-3 py-2.5 text-center">F.o.S ($F_s$)</th>
                <th className="px-3.5 py-2.5">HCI Risk Index</th>
                <th className="px-3 py-2.5">Highway Lifeline Status</th>
                <th className="px-3 py-2.5 text-center">Tactical Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-[#080d14]">
              {filteredDistricts.map((district) => {
                const isCritical = district.riskLevel === 'critical';
                const isHigh = district.riskLevel === 'high';
                const isModerate = district.riskLevel === 'moderate';

                return (
                  <tr
                    key={district.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isCritical ? 'bg-rose-950/10' : ''
                    }`}
                  >
                    {/* Station & Sector */}
                    <td className="px-3.5 py-2.5">
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{district.name}</span>
                        {isCritical && (
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span className="text-cyan-400 font-semibold">{district.awsStationId}</span>
                        <span>·</span>
                        <span>{district.elevationMeters}m elev</span>
                        <span>·</span>
                        <span className="truncate max-w-[120px]">{district.geologyRockType}</span>
                      </div>
                    </td>

                    {/* State */}
                    <td className="px-3 py-2.5 text-slate-300 font-sans text-xs">
                      {district.state}
                    </td>

                    {/* Slope Angle */}
                    <td className="px-3 py-2.5 text-right text-slate-200 tabular-nums">
                      {(district.slopeDegrees ?? 0).toFixed(1)}°
                    </td>

                    {/* Rain 24h */}
                    <td className="px-3 py-2.5 text-right text-cyan-300 tabular-nums font-semibold">
                      {(district.rainfallMm24h ?? 0).toFixed(1)} mm
                    </td>

                    {/* Pore Water Pressure uw */}
                    <td className="px-3 py-2.5 text-right text-slate-300 tabular-nums">
                      {(district.poreWaterPressureKpa ?? 0).toFixed(1)} kPa
                    </td>

                    {/* Inclinometer Creep */}
                    <td className="px-3 py-2.5 text-right text-slate-300 tabular-nums">
                      <span className={(district.inclinometerCreepMmDay ?? 0) > 15 ? 'text-rose-400 font-bold' : ''}>
                        {(district.inclinometerCreepMmDay ?? 0).toFixed(1)} mm/d
                      </span>
                    </td>

                    {/* Factor of Safety Fs */}
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-bold tabular-nums ${
                          (district.factorOfSafety ?? 1.15) < 1.0
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : (district.factorOfSafety ?? 1.15) < 1.3
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {(district.factorOfSafety ?? 1.15).toFixed(2)}
                      </span>
                    </td>

                    {/* HCI Score */}
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            isCritical
                              ? 'text-rose-400'
                              : isHigh
                              ? 'text-amber-400'
                              : isModerate
                              ? 'text-yellow-400'
                              : 'text-cyan-400'
                          }`}
                        >
                          {district.hciScore}
                        </span>
                        <div className="h-1.5 w-16 overflow-hidden rounded bg-slate-800">
                          <div
                            className={`h-full ${
                              isCritical
                                ? 'bg-rose-500'
                                : isHigh
                                ? 'bg-amber-500'
                                : isModerate
                                ? 'bg-yellow-500'
                                : 'bg-cyan-500'
                            }`}
                            style={{ width: `${district.hciScore}%` }}
                          />
                        </div>
                        <span className="text-[10px] uppercase text-slate-500">
                          {district.riskLevel}
                        </span>
                      </div>
                    </td>

                    {/* Highway Lifeline Status */}
                    <td className="px-3 py-2.5">
                      <div>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            district.highwayStatus === 'CLOSED_SLIP'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : district.highwayStatus === 'RESTRICTED'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {district.highwayStatus}
                        </span>
                        <span className="block text-[10px] text-slate-400 truncate max-w-[130px] mt-0.5">
                          {district.criticalInfrastructure[0]}
                        </span>
                      </div>
                    </td>

                    {/* Tactical Actions */}
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            tacticalAudio.playRadioChirp();
                            onSelectDistrict(district);
                          }}
                          className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-200 hover:border-slate-500 hover:text-white"
                          title="View Limit Equilibrium Breakdown & Geological Details"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => {
                            tacticalAudio.playRadioChirp();
                            onViewMapDistrict(district);
                          }}
                          className="rounded border border-cyan-800 bg-cyan-950 px-2 py-0.5 text-[10px] font-medium text-cyan-300 hover:bg-cyan-900"
                          title="Focus on Leaflet GIS Map"
                        >
                          GIS
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="border-t border-slate-800 bg-[#060a10] px-4 py-2 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="h-3.5 w-3.5 text-cyan-400" />
            <span>
              Geotechnical Limit Eq. Method: Bishop Simplified & Janbu Generalized Rigorous Analysis.
            </span>
          </div>
          <div>
            BRO EMERGENCY HOTLINE: <b>PROJECT SWASTIK SECTOR DESK (1800-BRO-NER)</b>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
