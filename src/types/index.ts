export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface DistrictData {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  elevationMeters: number;
  slopeDegrees: number;
  soilMoisturePct: number;
  ndviIndex: number; // 0 to 1
  rainfallMm24h: number;
  rainfallMm72h: number;
  historicalIncidentsDecade: number;
  geologyRockType: string;
  populationAtRisk: number;
  criticalInfrastructure: string[];
  hciScore: number; // 0-100
  riskLevel: RiskLevel;
  factorOfSafety: number; // Geotechnical limit equilibrium (Fs < 1.0 is failure)
  poreWaterPressureKpa: number; // Piezometric pore pressure in kPa
  inclinometerCreepMmDay: number; // Subsurface borehole shear displacement rate
  broProjectName: string; // Border Roads Organisation task force assignment
  awsStationId: string; // IMD/State Automatic Weather Station callsign
  highwayStatus: 'OPEN' | 'RESTRICTED' | 'CLOSED_SLIP';
  sdrfUnitCallsign: string;
  factorContributions: {
    rainfall: number;
    slope: number;
    soilMoisture: number;
    ndvi: number;
    historical: number;
    seismic: number;
  };
  lastUpdated: string;
  dataSource: 'live_api' | 'cached_baseline';
}

export interface GlacialZone {
  id: string;
  name: string;
  location: string;
  region: string;
  lat: number;
  lng: number;
  elevationMeters: number;
  lakeAreaSqKm: number;
  areaExpansionPct5yr: number;
  moraineStability: 'Unstable' | 'Moderately Stable' | 'Critical Overburden';
  freeboardMeters: number; // distance to dam crest
  downstreamSettlements: string[];
  glofRiskScore: number; // 0-100
  riskLevel: RiskLevel;
  seismicProximityKm?: number;
  latestEarthquakeMag?: number;
  earthquakeDepthKm?: number;
  // Module 3: Glacier-Fall Precursors Layer
  glacierFallPrecursor: {
    fallSusceptibilityScore: number; // 0-100
    riskLevel: RiskLevel;
    channels: {
      terrainSteepnessScore: number; // 0-100 (channel 1: Real GIS/Elevation)
      glacierVelocityAnomalyPct: number; // Channel 2 (Simulated, prod swap: NASA ITS_LIVE / Sentinel-1 InSAR)
      basalMeltSignalScore: number; // Channel 3 (Simulated, prod swap: MODIS/Landsat LST)
      seismicIceQuakeCount24h: number; // Channel 4 (Real USGS feed proximity)
    };
    channelStatus: {
      velocityAnomalyFlag: boolean;
      basalThermalSpikeFlag: boolean;
      iceQuakeSwarmFlag: boolean;
      steepBedrockCrevasseFlag: boolean;
    };
    interpretation: string;
  };
}

export interface EarthquakeEvent {
  id: string;
  place: string;
  mag: number;
  time: number;
  depthKm: number;
  lat: number;
  lng: number;
  distanceToNERKm: number;
}

export interface CitizenReport {
  id: string;
  districtId: string;
  districtName: string;
  hazardType: 'slope_crack' | 'soil_subsidence' | 'debris_flow' | 'blocked_culvert' | 'glacial_mudflow';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reporterName: string;
  reporterRole: 'citizen' | 'community_volunteer' | 'bro_engineer' | 'disaster_mgmt_officer';
  lat: number;
  lng: number;
  timestamp: string;
  status: 'verified' | 'under_review' | 'resolved';
  photoUrl?: string;
}

export interface EarlyWarningAlert {
  id: string;
  targetZone: string;
  state: string;
  level: RiskLevel;
  hazardType: 'Landslide Warning' | 'GLOF Threat' | 'Ice-Rock Avalanche' | 'Flash Flood Surge';
  headline: string;
  details: string;
  recommendedAction: string;
  issuedAt: string;
  timeToImpactHours: number;
  capProtocolStatus: 'DISPATCHED' | 'STANDBY' | 'ACKNOWLEDGED';
}

export interface SafePathNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  elevation: number;
  isShelter?: boolean;
}

export interface SafePathEdge {
  from: string;
  to: string;
  distanceKm: number;
  segmentHci: number; // 0-100 hazard along this road section
  roadType: 'National Highway' | 'District Ridge Road' | 'Narrow Hill Pass';
}

export interface EvacuationRouteResult {
  origin: SafePathNode;
  destination: SafePathNode;
  safeRoute: {
    nodes: SafePathNode[];
    totalDistanceKm: number;
    estimatedMinutes: number;
    maxHciEncountered: number;
    avgHci: number;
  };
  directDangerousRoute: {
    nodes: SafePathNode[];
    totalDistanceKm: number;
    estimatedMinutes: number;
    maxHciEncountered: number;
    avgHci: number;
  };
  safetyAdvantagePct: number;
  instructions: string[];
}

export type SupportedLanguage = 'en' | 'as' | 'kha';
