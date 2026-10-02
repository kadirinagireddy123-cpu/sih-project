import React, { useEffect, useState, useCallback } from 'react';
import { DistrictData, EarthquakeEvent, GlacialZone, CitizenReport, EarlyWarningAlert, SupportedLanguage } from './types';
import { INITIAL_NER_DISTRICTS } from './data/nerDistricts';
import { MONITORED_GLACIAL_ZONES } from './data/glaciers';
import {
  getDistricts,
  fetchLiveEarthquakes,
  getGlacialZones,
  getCitizenReports,
  addCitizenReport,
  generateEarlyWarningAlerts,
} from './services/api';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { RiskMap } from './components/RiskMap';
import { GlacierWatch } from './components/GlacierWatch';
import { SafePathViewer } from './components/SafePathViewer';
import { AlertsFeed } from './components/AlertsFeed';
import { DistrictDetailModal } from './components/DistrictDetailModal';
import { CitizenReportModal } from './components/CitizenReportModal';
import { DataSourcesMatrixModal } from './components/DataSourcesMatrixModal';
import { SitrepModal } from './components/SitrepModal';
import { StressScenario } from './components/ScenarioSimulator';
import { predictHci, calculateGlacierFallSusceptibility } from './services/mlEngine';
import { tacticalAudio } from './services/soundEffects';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'map' | 'glaciers' | 'safepath' | 'alerts'>('dashboard');
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  const [districts, setDistricts] = useState<DistrictData[]>(INITIAL_NER_DISTRICTS);
  const [glaciers, setGlaciers] = useState<GlacialZone[]>(MONITORED_GLACIAL_ZONES);
  const [earthquakes, setEarthquakes] = useState<EarthquakeEvent[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>([]);

  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [isSitrepModalOpen, setIsSitrepModalOpen] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<StressScenario>('live');

  // Initial load
  useEffect(() => {
    let mounted = true;

    async function initData() {
      const [eqList, distList] = await Promise.all([
        fetchLiveEarthquakes(),
        getDistricts(false),
      ]);
      if (!mounted) return;

      const gList = await getGlacialZones(eqList);
      if (!mounted) return;

      const repList = getCitizenReports();
      const altList = generateEarlyWarningAlerts(distList, gList);

      setEarthquakes(eqList);
      setDistricts(distList);
      setGlaciers(gList);
      setCitizenReports(repList);
      setAlerts(altList);
    }

    initData();

    return () => {
      mounted = false;
    };
  }, []);

  // Recalculate Live HCI using live Open-Meteo & USGS feeds
  const handleRecalculateHci = useCallback(async () => {
    try {
      setIsRecalculating(true);
      setCurrentScenario('live');
      const [updatedEq, updatedDistricts] = await Promise.all([
        fetchLiveEarthquakes(),
        getDistricts(true),
      ]);
      setEarthquakes(updatedEq);
      setDistricts(updatedDistricts);

      const updatedGlaciers = await getGlacialZones(updatedEq);
      setGlaciers(updatedGlaciers);

      const updatedAlerts = generateEarlyWarningAlerts(updatedDistricts, updatedGlaciers);
      setAlerts(updatedAlerts);
    } catch (e) {
      console.error('Error during recalculation', e);
    } finally {
      setIsRecalculating(false);
    }
  }, []);

  // Scenario stress-test injector
  const handleApplyScenario = useCallback((scenario: StressScenario) => {
    setCurrentScenario(scenario);

    if (scenario === 'live') {
      handleRecalculateHci();
      return;
    }

    // Apply scenario dynamic adjustments
    setDistricts((prev) =>
      prev.map((d) => {
        let rain24 = d.rainfallMm24h ?? 25.0;
        let rain72 = d.rainfallMm72h ?? 60.0;
        let soil = d.soilMoisturePct ?? 70;
        let pPress = d.poreWaterPressureKpa ?? 28.5;
        let creep = d.inclinometerCreepMmDay ?? 1.5;
        let fos = d.factorOfSafety ?? 1.25;
        let hwStatus = d.highwayStatus || 'OPEN';

        if (scenario === 'cloudburst') {
          rain24 += 55.0;
          rain72 += 95.0;
          soil = Math.min(99, soil + 14);
          pPress = Math.min(85, pPress + 18.5);
          creep = Number((creep * 2.1).toFixed(1));
          fos = Number(Math.max(0.62, fos - 0.32).toFixed(2));
          hwStatus = fos < 1.0 ? 'CLOSED_SLIP' : 'RESTRICTED';
        } else if (scenario === 'earthquake') {
          // Dynamic seismic trigger
          creep = Number((creep * 2.8).toFixed(1));
          fos = Number(Math.max(0.58, fos - 0.38).toFixed(2));
          hwStatus = 'CLOSED_SLIP';
        } else if (scenario === 'basal_melt') {
          soil = Math.min(95, soil + 8);
          pPress = Math.min(65, pPress + 8.0);
          creep = Number((creep * 1.5).toFixed(1));
          fos = Number(Math.max(0.75, fos - 0.15).toFixed(2));
        } else if (scenario === 'fair_weather') {
          rain24 = Math.max(0, rain24 * 0.15);
          rain72 = Math.max(5, rain72 * 0.3);
          soil = Math.max(35, soil - 25);
          pPress = Math.max(18, pPress - 18);
          creep = Number((creep * 0.35).toFixed(1));
          fos = Number(Math.min(1.85, fos + 0.35).toFixed(2));
          hwStatus = 'OPEN';
        }

        const prediction = predictHci({
          rainfallMm24h: rain24,
          rainfallMm72h: rain72,
          slopeDegrees: d.slopeDegrees,
          soilMoisturePct: soil,
          ndviIndex: d.ndviIndex,
          historicalIncidentsDecade: d.historicalIncidentsDecade,
          seismicMagnitude: scenario === 'earthquake' ? 5.6 : 3.0,
          distanceToEpicenterKm: scenario === 'earthquake' ? 45 : 300,
        });

        return {
          ...d,
          rainfallMm24h: Number(rain24.toFixed(1)),
          rainfallMm72h: Number(rain72.toFixed(1)),
          soilMoisturePct: soil,
          poreWaterPressureKpa: Number(pPress.toFixed(1)),
          inclinometerCreepMmDay: creep,
          factorOfSafety: fos,
          highwayStatus: hwStatus,
          hciScore: prediction.hciScore,
          riskLevel: prediction.riskLevel,
          factorContributions: prediction.factorContributions,
        };
      })
    );

    // Glaciers adjustment in scenario
    setGlaciers((prev) =>
      prev.map((g) => {
        let glof = g.glofRiskScore;
        let fallScore = g.glacierFallPrecursor.fallSusceptibilityScore;
        let velAnomaly = g.glacierFallPrecursor.channels.glacierVelocityAnomalyPct;
        let basalMelt = g.glacierFallPrecursor.channels.basalMeltSignalScore;
        let quakes = g.glacierFallPrecursor.channels.seismicIceQuakeCount24h;

        if (scenario === 'earthquake') {
          glof = Math.min(99, glof + 16);
          quakes += 8;
        } else if (scenario === 'basal_melt') {
          velAnomaly = Math.min(68, velAnomaly + 26);
          basalMelt = Math.min(96, basalMelt + 22);
        } else if (scenario === 'cloudburst') {
          glof = Math.min(99, glof + 10);
        } else if (scenario === 'fair_weather') {
          glof = Math.max(30, glof - 20);
          velAnomaly = Math.max(8, velAnomaly - 18);
        }

        const fallRec = calculateGlacierFallSusceptibility(
          g.glacierFallPrecursor.channels.terrainSteepnessScore,
          velAnomaly,
          basalMelt,
          quakes
        );

        return {
          ...g,
          glofRiskScore: glof,
          riskLevel: glof >= 80 ? 'critical' : glof >= 60 ? 'high' : 'moderate',
          glacierFallPrecursor: {
            ...g.glacierFallPrecursor,
            fallSusceptibilityScore: fallRec.score,
            riskLevel: fallRec.riskLevel,
            channelStatus: fallRec.channelStatus,
            interpretation: fallRec.interpretation,
            channels: {
              ...g.glacierFallPrecursor.channels,
              glacierVelocityAnomalyPct: Number(velAnomaly.toFixed(1)),
              basalMeltSignalScore: basalMelt,
              seismicIceQuakeCount24h: quakes,
            },
          },
        };
      })
    );
  }, [handleRecalculateHci]);

  // Handle citizen report submission
  const handleCitizenReportSubmit = useCallback((reportData: Omit<CitizenReport, 'id' | 'timestamp' | 'status'>) => {
    tacticalAudio.playRadioChirp();
    const created = addCitizenReport(reportData);
    setCitizenReports((prev) => [created, ...prev]);

    // Micro-update the affected district's HCI
    setDistricts((prev) =>
      prev.map((d) => {
        if (d.id === reportData.districtId) {
          const bump = reportData.severity === 'critical' ? 6 : reportData.severity === 'high' ? 3 : 1;
          const newHci = Math.min(99, d.hciScore + bump);
          return {
            ...d,
            hciScore: newHci,
            riskLevel: newHci >= 80 ? 'critical' : newHci >= 60 ? 'high' : d.riskLevel,
            inclinometerCreepMmDay: Number(((d.inclinometerCreepMmDay ?? 1.5) + 4.5).toFixed(1)),
          };
        }
        return d;
      })
    );
  }, []);

  const handleSelectDistrict = useCallback((district: DistrictData) => {
    setSelectedDistrict(district);
  }, []);

  const handleViewMapDistrict = useCallback((district: DistrictData) => {
    setSelectedDistrict(district);
    setActiveTab('map');
  }, []);

  const handleSelectGlacier = useCallback(() => {
    setActiveTab('glaciers');
  }, []);

  const handleViewMap = useCallback(() => {
    setActiveTab('map');
  }, []);

  const handleOpenReportModal = useCallback(() => setIsReportModalOpen(true), []);
  const handleCloseReportModal = useCallback(() => setIsReportModalOpen(false), []);

  const handleOpenMatrixModal = useCallback(() => setIsMatrixModalOpen(true), []);
  const handleCloseMatrixModal = useCallback(() => setIsMatrixModalOpen(false), []);

  const handleOpenSitrepModal = useCallback(() => setIsSitrepModalOpen(true), []);
  const handleCloseSitrepModal = useCallback(() => setIsSitrepModalOpen(false), []);

  const handleCloseDistrictModal = useCallback(() => setSelectedDistrict(null), []);

  return (
    <div className="min-h-screen bg-topo-pattern text-slate-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        onRecalculateHci={handleRecalculateHci}
        isRecalculating={isRecalculating}
        onOpenReportModal={handleOpenReportModal}
        onOpenMatrixModal={handleOpenMatrixModal}
        onOpenSitrepModal={handleOpenSitrepModal}
      />

      {/* Main Command Console Area */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            districts={districts}
            glaciers={glaciers}
            earthquakes={earthquakes}
            language={language}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={handleSelectDistrict}
            onViewMapDistrict={handleViewMapDistrict}
            currentScenario={currentScenario}
            onApplyScenario={handleApplyScenario}
            isRecalculating={isRecalculating}
            onOpenSitrepModal={handleOpenSitrepModal}
          />
        )}

        {activeTab === 'map' && (
          <div className="space-y-4">
            <RiskMap
              districts={districts}
              glaciers={glaciers}
              earthquakes={earthquakes}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={handleSelectDistrict}
              onSelectGlacier={handleSelectGlacier}
              language={language}
            />
          </div>
        )}

        {activeTab === 'glaciers' && (
          <GlacierWatch
            glaciers={glaciers}
            earthquakes={earthquakes}
            language={language}
            onViewOnMap={handleViewMap}
          />
        )}

        {activeTab === 'safepath' && (
          <SafePathViewer
            language={language}
            onViewOnMap={handleViewMap}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsFeed
            alerts={alerts}
            citizenReports={citizenReports}
            language={language}
            onOpenReportModal={handleOpenReportModal}
          />
        )}
      </main>

      {/* Modals */}
      <DistrictDetailModal
        district={selectedDistrict}
        onClose={handleCloseDistrictModal}
        language={language}
        onViewMap={handleViewMapDistrict}
      />

      <CitizenReportModal
        districts={districts}
        isOpen={isReportModalOpen}
        onClose={handleCloseReportModal}
        onSubmitReport={handleCitizenReportSubmit}
        language={language}
      />

      <DataSourcesMatrixModal
        isOpen={isMatrixModalOpen}
        onClose={handleCloseMatrixModal}
      />

      <SitrepModal
        isOpen={isSitrepModalOpen}
        onClose={handleCloseSitrepModal}
        districts={districts}
        glaciers={glaciers}
        earthquakes={earthquakes}
      />

      {/* Military / Government Footer */}
      <footer className="border-t border-slate-800 bg-[#04070c] py-3 text-xs font-mono text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">PROJECT TRISHUL // TELEMETRY CELL</span>
            <span>·</span>
            <span>SIH 2026 #26001</span>
            <span>·</span>
            <span>TEAM TECH TROJANS (ID 119478)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>OPERATIONAL STANDARD: NDMA-MHA-SOP-2024</span>
            <span aria-hidden="true">·</span>
            <span>SHILLONG / GANGTOK DISASTER GRID</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
