import { GlacialZone } from '../types';

export const MONITORED_GLACIAL_ZONES: GlacialZone[] = [
  {
    id: 'glacier-south-lhonak',
    name: 'South Lhonak Glacial Lake',
    location: 'North Sikkim Trans-Himalaya',
    region: 'Teesta River Basin',
    lat: 27.9150,
    lng: 88.2040,
    elevationMeters: 5200,
    lakeAreaSqKm: 1.68,
    areaExpansionPct5yr: 28.4,
    moraineStability: 'Critical Overburden',
    freeboardMeters: 6.8,
    downstreamSettlements: ['Chungthang (Dam Site)', 'Mangan', 'Dikchu', 'Singtam'],
    glofRiskScore: 92,
    riskLevel: 'critical',
    seismicProximityKm: 42.0,
    latestEarthquakeMag: 3.4,
    earthquakeDepthKm: 12.0,
    glacierFallPrecursor: {
      fallSusceptibilityScore: 88,
      riskLevel: 'critical',
      channels: {
        terrainSteepnessScore: 92, // Hanging cliff incline > 52° (Real GIS)
        glacierVelocityAnomalyPct: 44.5, // Channel 2: SIMULATED (Prod swap: NASA ITS_LIVE / Sentinel-1 InSAR)
        basalMeltSignalScore: 78, // Channel 3: SIMULATED (Prod swap: MODIS/Landsat LST thermal anomaly)
        seismicIceQuakeCount24h: 9, // Channel 4: Real USGS feed micro-tremor proximity
      },
      channelStatus: {
        velocityAnomalyFlag: true,
        basalThermalSpikeFlag: true,
        iceQuakeSwarmFlag: true,
        steepBedrockCrevasseFlag: true,
      },
      interpretation: 'Severe hanging glacier detachment threat. High velocity surge (+44.5%) combined with basal water pressure lubrication creates imminent risk of ice-slab collapse into the moraine reservoir.',
    },
  },
  {
    id: 'glacier-shako-cho',
    name: 'Shako Cho Proglacial Lake',
    location: 'North Sikkim High Basin',
    region: 'Lachen Chu River System',
    lat: 27.8930,
    lng: 88.4870,
    elevationMeters: 4960,
    lakeAreaSqKm: 0.94,
    areaExpansionPct5yr: 18.2,
    moraineStability: 'Unstable',
    freeboardMeters: 9.4,
    downstreamSettlements: ['Thangu Valley', 'Lachen', 'Chungthang'],
    glofRiskScore: 78,
    riskLevel: 'high',
    seismicProximityKm: 65.0,
    latestEarthquakeMag: 3.1,
    earthquakeDepthKm: 15.0,
    glacierFallPrecursor: {
      fallSusceptibilityScore: 74,
      riskLevel: 'high',
      channels: {
        terrainSteepnessScore: 81,
        glacierVelocityAnomalyPct: 29.8, // SIMULATED
        basalMeltSignalScore: 68, // SIMULATED
        seismicIceQuakeCount24h: 5,
      },
      channelStatus: {
        velocityAnomalyFlag: true,
        basalThermalSpikeFlag: false,
        iceQuakeSwarmFlag: true,
        steepBedrockCrevasseFlag: true,
      },
      interpretation: 'Moderate-to-high frontal tongue shearing observed. Crevasse expansion detected at upper firn line with recurring micro-seismic signatures.',
    },
  },
  {
    id: 'glacier-gurudongmar',
    name: 'Gurudongmar - Chho Lhamo Complex',
    location: 'North Sikkim Tibetan Plateau Rim',
    region: 'Upper Teesta Source Headwaters',
    lat: 28.0260,
    lng: 88.7080,
    elevationMeters: 5430,
    lakeAreaSqKm: 1.18,
    areaExpansionPct5yr: 12.0,
    moraineStability: 'Moderately Stable',
    freeboardMeters: 14.5,
    downstreamSettlements: ['Gaoligong Military Outpost', 'Thangu Valley'],
    glofRiskScore: 56,
    riskLevel: 'moderate',
    seismicProximityKm: 98.0,
    latestEarthquakeMag: 2.8,
    earthquakeDepthKm: 18.0,
    glacierFallPrecursor: {
      fallSusceptibilityScore: 49,
      riskLevel: 'moderate',
      channels: {
        terrainSteepnessScore: 58,
        glacierVelocityAnomalyPct: 14.2, // SIMULATED
        basalMeltSignalScore: 45, // SIMULATED
        seismicIceQuakeCount24h: 2,
      },
      channelStatus: {
        velocityAnomalyFlag: false,
        basalThermalSpikeFlag: false,
        iceQuakeSwarmFlag: false,
        steepBedrockCrevasseFlag: false,
      },
      interpretation: 'Permafrost degradation around lateral moraines is steady. Cold-based glacier core remains predominantly anchored to bedrock.',
    },
  },
  {
    id: 'glacier-upper-siang',
    name: 'Upper Siang Yarlung Tsangpo Tributary',
    location: 'Arunachal Pradesh High Himalaya',
    region: 'Siang / Brahmaputra Main Gorge',
    lat: 28.9850,
    lng: 95.0210,
    elevationMeters: 3820,
    lakeAreaSqKm: 2.35,
    areaExpansionPct5yr: 32.1,
    moraineStability: 'Critical Overburden',
    freeboardMeters: 5.2,
    downstreamSettlements: ['Tuting Town', 'Geku', 'Yingkiong', 'Pasighat'],
    glofRiskScore: 87,
    riskLevel: 'critical',
    seismicProximityKm: 54.0,
    latestEarthquakeMag: 4.2,
    earthquakeDepthKm: 10.0,
    glacierFallPrecursor: {
      fallSusceptibilityScore: 84,
      riskLevel: 'critical',
      channels: {
        terrainSteepnessScore: 89,
        glacierVelocityAnomalyPct: 38.7, // SIMULATED
        basalMeltSignalScore: 82, // SIMULATED
        seismicIceQuakeCount24h: 8,
      },
      channelStatus: {
        velocityAnomalyFlag: true,
        basalThermalSpikeFlag: true,
        iceQuakeSwarmFlag: true,
        steepBedrockCrevasseFlag: true,
      },
      interpretation: 'High risk of rock-ice avalanche damming the tributary canyon. Transverse fracture lines active; high surface runoff indicates elevated subglacial hydraulic pressure.',
    },
  },
  {
    id: 'glacier-langtang-lirung',
    name: 'Langtang Lirung (Nepal Calibration Reference)',
    location: 'Central Himalaya (Nepal-Tibet Border)',
    region: 'Trishuli / Gandaki Basin Calibration Benchmark',
    lat: 28.2160,
    lng: 85.5530,
    elevationMeters: 4750,
    lakeAreaSqKm: 1.42,
    areaExpansionPct5yr: 24.6,
    moraineStability: 'Unstable',
    freeboardMeters: 7.1,
    downstreamSettlements: ['Kyanjin Gompa', 'Langtang Village Restored Sector', 'Syabrubesi'],
    glofRiskScore: 83,
    riskLevel: 'critical',
    seismicProximityKm: 38.0,
    latestEarthquakeMag: 3.8,
    earthquakeDepthKm: 14.0,
    glacierFallPrecursor: {
      fallSusceptibilityScore: 81,
      riskLevel: 'critical',
      channels: {
        terrainSteepnessScore: 86,
        glacierVelocityAnomalyPct: 35.1, // SIMULATED
        basalMeltSignalScore: 76, // SIMULATED
        seismicIceQuakeCount24h: 7,
      },
      channelStatus: {
        velocityAnomalyFlag: true,
        basalThermalSpikeFlag: true,
        iceQuakeSwarmFlag: true,
        steepBedrockCrevasseFlag: true,
      },
      interpretation: 'Used as reference calibration model following the August 2026 trans-Himalayan flood sequence. Verifies model sensitivity to sudden glacial lake breach under combined seismic and pluvial triggering.',
    },
  },
];
