import { SupportedLanguage } from '../types';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  hazardConfidenceIndex: string;
  earlyWarningDashboard: string;
  gisRiskMap: string;
  glacierWatch: string;
  safePathAi: string;
  citizenReport: string;
  alertsFeed: string;
  dataSourcesMatrix: string;
  downloadProjectZip: string;
  recalculateHci: string;
  liveWeatherSync: string;
  offlineMode: string;
  liveApiActive: string;
  lowRisk: string;
  moderateRisk: string;
  highRisk: string;
  criticalRisk: string;
  rainfallContribution: string;
  slopeContribution: string;
  soilMoistureContribution: string;
  ndviContribution: string;
  historicalContribution: string;
  seismicContribution: string;
  evacuateImmediate: string;
  evacuateAlert: string;
  roadBlockReported: string;
  submitFieldReport: string;
  glacierFallPrecursor: string;
  fallSusceptibility: string;
  seismicTriggerFactor: string;
  lakeVolume: string;
  freeboardHeight: string;
  downstreamImpact: string;
  safeRouteCalculated: string;
  directDangerousRoute: string;
  safetyAdvantage: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    appTitle: 'PROJECT TRISHUL',
    appSubtitle: 'AI-Based Early Warning & Multi-Hazard Landslide/GLOF Risk Monitoring System for NER',
    hazardConfidenceIndex: 'Hazard Confidence Index (HCI)',
    earlyWarningDashboard: 'Early Warning Grid',
    gisRiskMap: 'GIS Topo Risk Map',
    glacierWatch: 'Glacier Watch & GLOF',
    safePathAi: 'SafePath AI Evacuation',
    citizenReport: 'Citizen Field Report',
    alertsFeed: 'CAP Alert Dispatch Feed',
    dataSourcesMatrix: 'Data Matrix & Production Swap',
    downloadProjectZip: 'Download Full Project ZIP',
    recalculateHci: 'Recalculate HCI Live',
    liveWeatherSync: 'Live Open-Meteo & USGS Feed Connected',
    offlineMode: 'Offline Cache Active',
    liveApiActive: 'Live Satellite & Geo Feeds',
    lowRisk: 'LOW RISK',
    moderateRisk: 'MODERATE RISK',
    highRisk: 'HIGH RISK',
    criticalRisk: 'CRITICAL HAZARD',
    rainfallContribution: '24h/72h Rainfall Pluvial Saturation',
    slopeContribution: 'DEM Terrain Slope Steepness',
    soilMoistureContribution: 'Subsurface Soil Moisture Saturation',
    ndviContribution: 'NDVI Vegetation Root Anchorage',
    historicalContribution: 'GSI Historical Incident Recurrence',
    seismicContribution: 'USGS Dynamic Seismic Proximity',
    evacuateImmediate: 'Immediate Evacuation Recommended',
    evacuateAlert: 'Pre-emptive evacuation triggered for vulnerable valley floor structures.',
    roadBlockReported: 'Road crack and slope subsidence reported by field observer.',
    submitFieldReport: 'Submit Verified Field Report',
    glacierFallPrecursor: 'Glacier-Fall Precursors Layer',
    fallSusceptibility: 'Fall Susceptibility Score',
    seismicTriggerFactor: 'Seismic Trigger Factor',
    lakeVolume: 'Moraine Lake Surface Extent',
    freeboardHeight: 'Freeboard Crest Clearance',
    downstreamImpact: 'Downstream Inundation Settlement Threat',
    safeRouteCalculated: 'Risk-Avoidant SafePath Route',
    directDangerousRoute: 'Direct Valley Highway Route (High Hazard)',
    safetyAdvantage: 'Exposure Reduction vs Direct Road',
  },
  as: {
    appTitle: 'প্ৰজেক্ট ত্ৰিশূল',
    appSubtitle: 'উত্তৰ-পূৰ্বাঞ্চলৰ বাবে এআই-আধাৰিত ভূমিস্খলন আৰু হিমবাহ বিস্ফোৰণ আগতীয়া সতৰ্কবাণী ব্যৱস্থা',
    hazardConfidenceIndex: 'বিপদ সম্ভাৱনা সূচক (HCI)',
    earlyWarningDashboard: 'আগতীয়া সতৰ্কবাণী ফলক',
    gisRiskMap: 'জিআইএছ মানচিত্ৰ',
    glacierWatch: 'হিমবাহ নিৰীক্ষণ (GLOF)',
    safePathAi: 'নিৰাপদ পথ এআই (SafePath)',
    citizenReport: 'নাগৰিক ফিল্ড প্ৰতিবেদন',
    alertsFeed: 'জৰুৰী সতৰ্কতা বাৰ্তা',
    dataSourcesMatrix: 'তথ্য উৎস আৰু প্ৰযুক্তি সংহতি',
    downloadProjectZip: 'সম্পূৰ্ণ প্ৰকল্প জিপ ডাউনলোড',
    recalculateHci: 'লাইভ পুনৰ গণনা কৰক',
    liveWeatherSync: 'লাইভ বতৰ আৰু ভূকম্পন সংযোগ সক্ৰিয়',
    offlineMode: 'অফলাইন সংৰক্ষিত তথ্য ব্যৱহৃত',
    liveApiActive: 'উপগ্ৰহ আৰু ভূ-তথ্য সক্ৰিয়',
    lowRisk: 'কম বিপদ',
    moderateRisk: 'মধ্যমীয়া বিপদ',
    highRisk: 'উচ্চ বিপদ',
    criticalRisk: 'চৰম বিপদ সংকেত',
    rainfallContribution: '২৪/৭২ ঘণ্টাৰ বৃষ্টিপাতৰ মাত্ৰা',
    slopeContribution: 'পাহাৰীয়া ঢালৰ তীক্ষ্ণতা',
    soilMoistureContribution: 'মাটিৰ আৰ্দ্ৰতা সংপৃক্ততা',
    ndviContribution: 'উদ্ভিদ আৱৰণ স্থিৰতা (NDVI)',
    historicalContribution: 'পূৰ্বৰ ভূমিস্খলন ইতিহাস (GSI)',
    seismicContribution: 'ভূকম্পন নিকটৱৰ্তী প্ৰভাৱ',
    evacuateImmediate: 'তৎক্ষণাৎ নিৰাপদ স্থানলৈ স্থানান্তৰ হওক',
    evacuateAlert: 'উপত্যকাৰ বিপদজনক অংশৰ বাবে স্থানান্তৰ সতৰ্কতা জাৰি কৰা হৈছে।',
    roadBlockReported: 'পথত ফাঁট আৰু মাটি খহনীয়াৰ প্ৰতিবেদন দাখিল।',
    submitFieldReport: 'ফিল্ড তথ্য জমা দিয়ক',
    glacierFallPrecursor: 'হিমবাহ পতন পূৰ্বসূচক স্তৰ',
    fallSusceptibility: 'হিমবাহ স্খলন সম্ভাৱনা স্কোৰ',
    seismicTriggerFactor: 'ভূকম্পন প্ৰভাৱ কাৰক',
    lakeVolume: 'হিমবাহ হ্ৰদৰ আকাৰ',
    freeboardHeight: 'হ্ৰদৰ পাৰৰ সুৰক্ষিত উচ্চতা',
    downstreamImpact: 'ভাটী অঞ্চলৰ জনবসতিৰ প্ৰতি ভাবুকি',
    safeRouteCalculated: 'বিপদমুক্ত বিকল্প পথ',
    directDangerousRoute: 'পোনপটীয়া বিপদজনক পথ (উচ্চ ঝুঁকি)',
    safetyAdvantage: 'বিপদ হ্ৰাসৰ মাত্ৰা',
  },
  kha: {
    appTitle: 'PROJECT TRISHUL',
    appSubtitle: 'Ka AI ban ai jingmaham kloi na ka bynta ki jingshlei bad jingtwad khyndew ha NER',
    hazardConfidenceIndex: 'HCI - Ka Jingthew ia ka Jingma (0-100)',
    earlyWarningDashboard: 'Ka Kyndon Jingmaham Kloi',
    gisRiskMap: 'Ka Map Jingma GIS',
    glacierWatch: 'Jingkhmih ia ki Glasiar (GLOF)',
    safePathAi: 'SafePath AI - Ka Lynti ba Shngain',
    citizenReport: 'Ka Jingpyntip na ki Nongshongshnong',
    alertsFeed: 'Ki Khubor Jingmaham ba Kyrkieh',
    dataSourcesMatrix: 'Ki Thympei Jingtip bad Technology',
    downloadProjectZip: 'Download ia ka Project ZIP baroh',
    recalculateHci: 'Thew biang ia ka HCI',
    liveWeatherSync: 'Ka jingiasoh bad ka Open-Meteo & USGS',
    offlineMode: 'Ka Rukom Trei Offline',
    liveApiActive: 'Ki Satellite Feeds ba trei kam',
    lowRisk: 'JINGMA BA RIKHON',
    moderateRisk: 'JINGMA BA MAR-IAKAP',
    highRisk: 'JINGMA BA JUR',
    criticalRisk: 'JINGMA BA SHYRKHIEI',
    rainfallContribution: 'Ka Jinghap slap 24h/72h',
    slopeContribution: 'Ka Jingran ka riat lum',
    soilMoistureContribution: 'Ka Jingmadem ka khyndew',
    ndviContribution: 'Ki Dien bad ki jingshai (NDVI)',
    historicalContribution: 'Ka Jingjia twad khyndew mynshuwa',
    seismicContribution: 'Ka Jingkhynniuh Jumai (USGS)',
    evacuateImmediate: 'Kynriah noh mardor sha kaba shngain',
    evacuateAlert: 'La pynmih hukum ban kynriah sha ki jaka ba shngain.',
    roadBlockReported: 'La iohi ba pdang ka surok bad twad ka khyndew.',
    submitFieldReport: 'Phah ka jingpyntip na madan',
    glacierFallPrecursor: 'Ka Jingpyntip shwa ban hap u thah',
    fallSusceptibility: 'Ka Jingthew ia ka jinghap u thah',
    seismicTriggerFactor: 'Ka bor jumai kaba ktah',
    lakeVolume: 'Ka jingheh ka pukri thah',
    freeboardHeight: 'Ka jingjrong ka kynroh um',
    downstreamImpact: 'Ka jingma ia ki shnong ba shapoh',
    safeRouteCalculated: 'Ka Lynti ba Shngain Tam',
    directDangerousRoute: 'Ka Surok ba Madan Lum (ba ma bha)',
    safetyAdvantage: 'Ka jingpynduna ia ka jingma',
  },
};
