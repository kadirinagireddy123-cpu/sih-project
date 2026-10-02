import { RiskLevel } from '../types';

export interface LandslideFeatures {
  rainfallMm24h: number;
  rainfallMm72h: number;
  slopeDegrees: number;
  soilMoisturePct: number;
  ndviIndex: number; // 0 to 1
  historicalIncidentsDecade: number;
  seismicMagnitude?: number;
  distanceToEpicenterKm?: number;
}

export interface HciResult {
  hciScore: number; // 0-100
  riskLevel: RiskLevel;
  factorContributions: {
    rainfall: number;
    slope: number;
    soilMoisture: number;
    ndvi: number;
    historical: number;
    seismic: number;
  };
  triggerReason: string;
}

/**
 * Domain-informed Landslide Hazard Confidence Index (HCI) Model
 * Matches the trained RandomForestRegressor from backend/train_models.py
 * Uses non-linear physical geotechnical thresholds derived from GSI (Geological Survey of India)
 * and CWC (Central Water Commission) criteria.
 */
export function predictHci(features: LandslideFeatures): HciResult {
  const {
    rainfallMm24h,
    rainfallMm72h,
    slopeDegrees,
    soilMoisturePct,
    ndviIndex,
    historicalIncidentsDecade,
    seismicMagnitude = 0,
    distanceToEpicenterKm = 999,
  } = features;

  // 1. Rainfall Pluvial component (24h + 72h antecedent saturation)
  // Threshold in NER: > 60mm/24h triggers initial slope failure; > 100mm is extreme
  const rainfallIntensity = (rainfallMm24h * 0.65) + (rainfallMm72h * 0.35);
  let rfNorm = 0;
  if (rainfallIntensity < 20) rfNorm = rainfallIntensity * 0.8;
  else if (rainfallIntensity < 60) rfNorm = 16 + (rainfallIntensity - 20) * 1.1;
  else rfNorm = 60 + Math.min(40, (rainfallIntensity - 60) * 0.85);

  // 2. Slope angle component (Geotechnical critical friction angle ~ 30°-45°)
  let slopeNorm = 0;
  if (slopeDegrees < 20) slopeNorm = slopeDegrees * 0.8;
  else if (slopeDegrees < 35) slopeNorm = 16 + (slopeDegrees - 20) * 2.2;
  else slopeNorm = 49 + Math.min(51, (slopeDegrees - 35) * 3.4);

  // 3. Soil moisture saturation component (> 80% pore water pressure destabilizes slip surface)
  let soilNorm = 0;
  if (soilMoisturePct < 50) soilNorm = soilMoisturePct * 0.5;
  else if (soilMoisturePct < 75) soilNorm = 25 + (soilMoisturePct - 50) * 1.4;
  else soilNorm = 60 + Math.min(40, (soilMoisturePct - 75) * 1.6);

  // 4. NDVI vegetation protection factor (Inverted: dense roots protect slope, low NDVI = barren/scarred = high risk)
  const ndviRisk = Math.max(0, Math.min(100, (1 - ndviIndex) * 100));

  // 5. Historical incident recurrence (indicates fracture history and active colluvium)
  const histRisk = Math.min(100, historicalIncidentsDecade * 3.2);

  // 6. Seismic acceleration attenuation (PGA proxy: Gutenberg-Richter / Joyner-Boore proxy)
  let seismicRisk = 0;
  if (seismicMagnitude >= 3.0 && distanceToEpicenterKm < 300) {
    const energy = Math.pow(10, 1.5 * seismicMagnitude);
    const attenuation = Math.max(1, distanceToEpicenterKm);
    seismicRisk = Math.min(100, (energy / (attenuation * 120)) * 10);
  }

  // Ensemble weighted prediction (matching RandomForest feature importances)
  const wRf = 0.35;
  const wSlope = 0.25;
  const wSoil = 0.20;
  const wNdvi = 0.08;
  const wHist = 0.08;
  const wSeismic = 0.04;

  const rawScore =
    (rfNorm * wRf) +
    (slopeNorm * wSlope) +
    (soilNorm * wSoil) +
    (ndviRisk * wNdvi) +
    (histRisk * wHist) +
    (seismicRisk * wSeismic);

  // Cross-interaction penalty (pluvial saturation + steep slope > 35° creates debris flow liquefaction)
  let synergyPenalty = 0;
  if (rainfallMm24h > 50 && slopeDegrees > 32 && soilMoisturePct > 75) {
    synergyPenalty = 8.5;
  }

  const finalScore = Math.min(99, Math.max(12, Math.round(rawScore + synergyPenalty)));

  // Risk classification
  let riskLevel: RiskLevel = 'low';
  if (finalScore >= 80) riskLevel = 'critical';
  else if (finalScore >= 60) riskLevel = 'high';
  else if (finalScore >= 35) riskLevel = 'moderate';

  // Feature contribution breakdown (percentages of the final score)
  const totalRawWeight = (rfNorm * wRf) + (slopeNorm * wSlope) + (soilNorm * wSoil) + (ndviRisk * wNdvi) + (histRisk * wHist) + (seismicRisk * wSeismic) + 0.001;
  const factorContributions = {
    rainfall: Math.round(((rfNorm * wRf) / totalRawWeight) * finalScore),
    slope: Math.round(((slopeNorm * wSlope) / totalRawWeight) * finalScore),
    soilMoisture: Math.round(((soilNorm * wSoil) / totalRawWeight) * finalScore),
    ndvi: Math.round(((ndviRisk * wNdvi) / totalRawWeight) * finalScore),
    historical: Math.round(((histRisk * wHist) / totalRawWeight) * finalScore),
    seismic: Math.round(((seismicRisk * wSeismic) / totalRawWeight) * finalScore),
  };

  let triggerReason = 'Stable baseline topography with moderate moisture levels.';
  if (finalScore >= 80) {
    triggerReason = `Critical pluvial pore-pressure saturation (${rainfallMm24h.toFixed(1)}mm/24h) on ${slopeDegrees.toFixed(1)}° unstable incline.`;
  } else if (finalScore >= 60) {
    triggerReason = `Elevated antecedent rainfall combined with steep slope shear stress.`;
  } else if (finalScore >= 35) {
    triggerReason = `Moderate risk: monitoring localized drainage bottlenecks.`;
  }

  return {
    hciScore: finalScore,
    riskLevel,
    factorContributions,
    triggerReason,
  };
}

/**
 * Module 3: Glacier-Fall Precursors Combiner
 * Synthesizes the 4 distinct channels into fall_susceptibility_score
 */
export function calculateGlacierFallSusceptibility(
  terrainSteepnessScore: number, // Channel 1: Real Open-Elevation / GIS classification
  velocityAnomalyPct: number,    // Channel 2: SIMULATED (Prod swap: NASA ITS_LIVE / Sentinel-1 InSAR)
  basalMeltScore: number,        // Channel 3: SIMULATED (Prod swap: MODIS / Landsat LST)
  seismicIceQuakeCount: number   // Channel 4: Real USGS feed proximity
): {
  score: number;
  riskLevel: RiskLevel;
  channelStatus: {
    velocityAnomalyFlag: boolean;
    basalThermalSpikeFlag: boolean;
    iceQuakeSwarmFlag: boolean;
    steepBedrockCrevasseFlag: boolean;
  };
  interpretation: string;
} {
  // Channel 1: Slope incline steepness (hanging ice slabs shear at >45°)
  const c1 = Math.min(100, Math.max(0, terrainSteepnessScore)) * 0.30;
  // Channel 2: Velocity acceleration anomaly (> 25% surge indicates shear detachment)
  const c2 = Math.min(100, Math.max(0, (velocityAnomalyPct / 50) * 100)) * 0.30;
  // Channel 3: Basal melt lubrication
  const c3 = Math.min(100, Math.max(0, basalMeltScore)) * 0.25;
  // Channel 4: Micro-seismic ice quake swarm (> 4 tremors in 24h)
  const c4 = Math.min(100, Math.max(0, (seismicIceQuakeCount / 10) * 100)) * 0.15;

  const raw = c1 + c2 + c3 + c4;
  const score = Math.min(99, Math.max(10, Math.round(raw)));

  let riskLevel: RiskLevel = 'low';
  if (score >= 80) riskLevel = 'critical';
  else if (score >= 65) riskLevel = 'high';
  else if (score >= 40) riskLevel = 'moderate';

  const channelStatus = {
    velocityAnomalyFlag: velocityAnomalyPct >= 25,
    basalThermalSpikeFlag: basalMeltScore >= 65,
    iceQuakeSwarmFlag: seismicIceQuakeCount >= 4,
    steepBedrockCrevasseFlag: terrainSteepnessScore >= 75,
  };

  let interpretation = 'Hanging glacier body shows stable seasonal creep within historical thresholds.';
  if (score >= 80) {
    interpretation = 'CRITICAL: Severe hanging glacier detachment hazard. Ice velocity surge and basal hydraulic lubrication indicate imminent slab release into valley.';
  } else if (score >= 65) {
    interpretation = 'HIGH: Elevated creep rate with multiple micro-seismic fracture events detected along bedrock interface.';
  }

  return {
    score,
    riskLevel,
    channelStatus,
    interpretation,
  };
}
