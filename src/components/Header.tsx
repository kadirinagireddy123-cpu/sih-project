import React, { useState, useEffect } from 'react';
import { SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { generateProjectZip } from '../services/zipExporter';
import { tacticalAudio } from '../services/soundEffects';
import {
  ShieldAlert,
  Download,
  Globe,
  Radio,
  RefreshCw,
  FileText,
  Volume2,
  VolumeX,
  Printer,
  Compass,
  BellRing,
  Activity,
  Layers
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'map' | 'glaciers' | 'safepath' | 'alerts';
  setActiveTab: (tab: 'dashboard' | 'map' | 'glaciers' | 'safepath' | 'alerts') => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  onRecalculateHci: () => Promise<void>;
  isRecalculating: boolean;
  onOpenReportModal: () => void;
  onOpenMatrixModal: () => void;
  onOpenSitrepModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  onRecalculateHci,
  isRecalculating,
  onOpenReportModal,
  onOpenMatrixModal,
  onOpenSitrepModal,
}) => {
  const t = TRANSLATIONS[language];
  const [isExporting, setIsExporting] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Live IST & UTC ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const ist = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false });
      const utc = now.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false });
      const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
      setCurrentTimeStr(`${date} ${ist} IST (${utc}Z)`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    tacticalAudio.enabled = next;
    if (next) tacticalAudio.playRadioChirp();
  };

  const handleSirenTest = () => {
    tacticalAudio.playSirenPing();
  };

  const handleDownloadZip = async () => {
    try {
      tacticalAudio.playRadioChirp();
      setIsExporting(true);
      const blob = await generateProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project-trishul-ner-sih2026.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to generate project zip', e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#060a10]/95 backdrop-blur-md">
      {/* Topmost Government & Defense Identity Ribbon */}
      <div className="border-b border-slate-800/80 bg-[#04070c] px-4 py-1.5 text-[10px] sm:text-[11px] font-mono text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-bold tracking-wider">
              भारत सरकार · GOVT OF INDIA
            </span>
            <span aria-hidden="true" className="text-slate-700">|</span>
            <span className="text-slate-300">
              MINISTRY OF DEVELOPMENT OF NORTH EASTERN REGION (MDoNER) & NDMA
            </span>
            <span aria-hidden="true" className="text-slate-700 hidden lg:inline">|</span>
            <span className="hidden lg:inline text-slate-400">
              BRO TASK FORCE SECTOR (PROJECTS SWASTIK / PUSHPAK / VARTAK)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-semibold tabular-nums">
              {currentTimeStr || '27-SEP-2026 19:25:00 IST'}
            </span>
            <span aria-hidden="true" className="text-slate-700 hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>INSAT-3DR / GSAT-7A: LOCK</span>
            </div>
            <span aria-hidden="true" className="text-slate-700 hidden sm:inline">|</span>
            <span className="hidden sm:inline font-bold text-rose-400 bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-900">
              STATUS: DEFCON-3
            </span>
          </div>
        </div>
      </div>

      {/* Main Tactical Command Header */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Unit Designation & Wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 shadow-inner">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-base sm:text-lg font-bold tracking-tight text-white">
                PROJECT TRISHUL
              </span>
              <span className="hidden sm:inline font-mono text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                NER-OPS-26001
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              Multi-Hazard Landslide & GLOF Early Warning Center · Northeast India
            </p>
          </div>
        </div>

        {/* Tactical Navigation Tabs */}
        <nav className="hidden items-center gap-1 sm:flex lg:gap-1.5">
          <button
            onClick={() => {
              tacticalAudio.playRadioChirp();
              setActiveTab('dashboard');
            }}
            className={`px-3 py-1.5 text-xs font-mono transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            [1] {t.earlyWarningDashboard}
          </button>
          <button
            onClick={() => {
              tacticalAudio.playRadioChirp();
              setActiveTab('map');
            }}
            className={`px-3 py-1.5 text-xs font-mono transition-colors whitespace-nowrap ${
              activeTab === 'map'
                ? 'border-b-2 border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            [2] {t.gisRiskMap}
          </button>
          <button
            onClick={() => {
              tacticalAudio.playRadioChirp();
              setActiveTab('glaciers');
            }}
            className={`px-3 py-1.5 text-xs font-mono transition-colors whitespace-nowrap ${
              activeTab === 'glaciers'
                ? 'border-b-2 border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            [3] {t.glacierWatch}
          </button>
          <button
            onClick={() => {
              tacticalAudio.playRadioChirp();
              setActiveTab('safepath');
            }}
            className={`px-3 py-1.5 text-xs font-mono transition-colors whitespace-nowrap ${
              activeTab === 'safepath'
                ? 'border-b-2 border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            [4] {t.safePathAi}
          </button>
          <button
            onClick={() => {
              tacticalAudio.playRadioChirp();
              setActiveTab('alerts');
            }}
            className={`px-3 py-1.5 text-xs font-mono transition-colors whitespace-nowrap ${
              activeTab === 'alerts'
                ? 'border-b-2 border-cyan-400 text-cyan-300 font-bold bg-cyan-950/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            [5] {t.alertsFeed}
          </button>
        </nav>

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Official SITREP Generator */}
          <button
            onClick={() => {
              tacticalAudio.playRadioChirp();
              onOpenSitrepModal();
            }}
            title="Generate Official Government Situation Report (SITREP)"
            className="flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-mono text-slate-200 hover:border-slate-500 hover:text-white transition-colors"
          >
            <Printer className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden xl:inline">SITREP</span>
          </button>

          {/* Siren Audio Test */}
          <button
            onClick={handleSirenTest}
            title="Test Civil Defense Alert Siren Tone"
            className="flex items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-rose-400 hover:border-rose-700 hover:bg-rose-950/30"
          >
            <BellRing className="h-3.5 w-3.5" />
            <span className="hidden xl:inline text-[11px] font-mono">SIREN TEST</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleAudio}
            title={audioEnabled ? 'Mute Tactical Audio' : 'Unmute Tactical Audio'}
            className="rounded border border-slate-800 bg-slate-950 p-1.5 text-slate-400 hover:text-white"
          >
            {audioEnabled ? <Volume2 className="h-3.5 w-3.5 text-cyan-400" /> : <VolumeX className="h-3.5 w-3.5 text-slate-600" />}
          </button>

          {/* Live Sync / Recalculate button */}
          <button
            onClick={async () => {
              tacticalAudio.playRadioChirp();
              await onRecalculateHci();
            }}
            disabled={isRecalculating}
            title="Recalculate live telemetry across Open-Meteo & USGS feeds"
            className="flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-mono text-slate-300 hover:border-slate-600 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span className="hidden lg:inline text-[11px]">SYNC</span>
          </button>

          {/* Field Crowdsource Report */}
          <button
            onClick={() => {
              tacticalAudio.playRadioChirp();
              onOpenReportModal();
            }}
            className="flex items-center gap-1.5 rounded border border-amber-600/50 bg-amber-950/40 px-2.5 py-1.5 text-xs font-mono font-medium text-amber-300 hover:bg-amber-900/50"
          >
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span className="hidden md:inline text-[11px]">DISPATCH REPORT</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center rounded border border-slate-800 bg-slate-950 p-0.5 text-xs font-mono">
            <Globe className="mx-1 h-3 w-3 text-slate-500" />
            <button
              onClick={() => {
                tacticalAudio.playRadioChirp();
                setLanguage('en');
              }}
              className={`px-1.5 py-0.5 rounded text-[11px] ${
                language === 'en' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => {
                tacticalAudio.playRadioChirp();
                setLanguage('as');
              }}
              className={`px-1.5 py-0.5 rounded text-[11px] ${
                language === 'as' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              অসমীয়া
            </button>
            <button
              onClick={() => {
                tacticalAudio.playRadioChirp();
                setLanguage('kha');
              }}
              className={`px-1.5 py-0.5 rounded text-[11px] ${
                language === 'kha' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Khasi
            </button>
          </div>

          {/* Download Project ZIP */}
          <button
            onClick={handleDownloadZip}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded bg-cyan-700 px-3 py-1.5 text-xs font-mono font-bold text-white shadow-sm hover:bg-cyan-600 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">ZIP</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex overflow-x-auto border-t border-slate-800/80 bg-slate-950/80 px-3 py-1.5 sm:hidden font-mono text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2.5 py-1 whitespace-nowrap ${
            activeTab === 'dashboard' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          [1] Dashboard
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-2.5 py-1 whitespace-nowrap ${
            activeTab === 'map' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          [2] GIS Map
        </button>
        <button
          onClick={() => setActiveTab('glaciers')}
          className={`px-2.5 py-1 whitespace-nowrap ${
            activeTab === 'glaciers' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          [3] Glaciers
        </button>
        <button
          onClick={() => setActiveTab('safepath')}
          className={`px-2.5 py-1 whitespace-nowrap ${
            activeTab === 'safepath' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          [4] SafePath
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-2.5 py-1 whitespace-nowrap ${
            activeTab === 'alerts' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          [5] Alerts
        </button>
      </div>
    </header>
  );
};
