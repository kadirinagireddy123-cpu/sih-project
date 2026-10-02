import React, { useState } from 'react';
import { CloudLightning, Activity, Sun, RotateCcw, Flame, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { tacticalAudio } from '../services/soundEffects';

export type StressScenario = 'live' | 'cloudburst' | 'earthquake' | 'basal_melt' | 'fair_weather';

interface ScenarioSimulatorProps {
  currentScenario: StressScenario;
  onApplyScenario: (scenario: StressScenario) => void;
  isRecalculating: boolean;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  currentScenario,
  onApplyScenario,
  isRecalculating,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (scenario: StressScenario) => {
    tacticalAudio.playRadioChirp();
    onApplyScenario(scenario);
  };

  return (
    <div className="rounded border border-slate-800 bg-slate-950/90 shadow-lg text-xs overflow-hidden">
      {/* Drawer Toggle Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between border-b border-slate-800 px-4 py-2.5 bg-slate-900/60 hover:bg-slate-900 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            Tactical Stress-Test Simulator & What-If Hazard Injection
          </span>
          <span className="hidden sm:inline font-mono text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            {currentScenario === 'live' ? 'CURRENT: LIVE TELEMETRY' : `SCENARIO: ${currentScenario.toUpperCase()}`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-[11px] hidden md:inline">
            {isOpen ? 'Collapse Simulator' : 'Simulate Extreme Weather / Seismic Triggers'}
          </span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {/* Expanded Scenario Buttons */}
      {isOpen && (
        <div className="p-4 space-y-3 bg-[#080d14]">
          <p className="text-[11px] text-slate-400 leading-normal">
            Inject extreme weather or geodynamic stress events to evaluate how the Hazard Confidence Index (HCI),
            SafePath AI evacuation corridors, and GLOF freeboard metrics respond across the 10 NER sectors:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* Scenario 1: Live Baseline */}
            <button
              onClick={() => handleSelect('live')}
              disabled={isRecalculating}
              className={`p-2.5 rounded border text-left transition-all ${
                currentScenario === 'live'
                  ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-sm'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs">
                <span>1. Live Baseline Feeds</span>
                <RotateCcw className="h-3.5 w-3.5 text-cyan-400" />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Real Open-Meteo & USGS feeds with current baseline readings.
              </p>
            </button>

            {/* Scenario 2: Cloudburst Pluvial Surge */}
            <button
              onClick={() => handleSelect('cloudburst')}
              disabled={isRecalculating}
              className={`p-2.5 rounded border text-left transition-all ${
                currentScenario === 'cloudburst'
                  ? 'border-rose-500 bg-rose-950/40 text-rose-200 shadow-sm'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs text-rose-300">
                <span>2. Monsoon Cloudburst</span>
                <CloudLightning className="h-3.5 w-3.5 text-rose-400" />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                +65mm pluvial shock; pore pressure &gt; 60 kPa, triggering multiple highway slips.
              </p>
            </button>

            {/* Scenario 3: M5.6 Earthquake Shockwave */}
            <button
              onClick={() => handleSelect('earthquake')}
              disabled={isRecalculating}
              className={`p-2.5 rounded border text-left transition-all ${
                currentScenario === 'earthquake'
                  ? 'border-amber-500 bg-amber-950/40 text-amber-200 shadow-sm'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs text-amber-300">
                <span>3. M5.6 Seismic Shock</span>
                <Activity className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Shallow epicentral shaking; triggers moraine slope fracturing & rock avalanches.
              </p>
            </button>

            {/* Scenario 4: Extreme Glacial Basal Melt */}
            <button
              onClick={() => handleSelect('basal_melt')}
              disabled={isRecalculating}
              className={`p-2.5 rounded border text-left transition-all ${
                currentScenario === 'basal_melt'
                  ? 'border-purple-500 bg-purple-950/40 text-purple-200 shadow-sm'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs text-purple-300">
                <span>4. Basal Ice-Slab Surge</span>
                <Flame className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                +50% ice velocity surge & subglacial hydraulic pressure spike on hanging cliffs.
              </p>
            </button>

            {/* Scenario 5: Clear Weather Dry Egress */}
            <button
              onClick={() => handleSelect('fair_weather')}
              disabled={isRecalculating}
              className={`p-2.5 rounded border text-left transition-all ${
                currentScenario === 'fair_weather'
                  ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 shadow-sm'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-xs text-emerald-300">
                <span>5. Post-Rain Drainage</span>
                <Sun className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Pore water pressure recedes; factor of safety stabilises across ridge sections.
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
