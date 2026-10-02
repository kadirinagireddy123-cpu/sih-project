import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon broken images in Vite/webpack builds
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
import { DistrictData, EarthquakeEvent, GlacialZone, SupportedLanguage } from '../types';
import { EVACUATION_NETWORKS, calculateSafePath } from '../data/evacuationNetworks';
import { TRANSLATIONS } from '../i18n/translations';
import { tacticalAudio } from '../services/soundEffects';
import {
  Layers,
  ShieldAlert,
  Mountain,
  Compass,
  Eye,
  MapPin,
  Maximize2,
  Ruler,
  Satellite,
  Crosshair,
  Volume2
} from 'lucide-react';

interface RiskMapProps {
  districts: DistrictData[];
  glaciers: GlacialZone[];
  earthquakes: EarthquakeEvent[];
  selectedDistrict: DistrictData | null;
  onSelectDistrict: (district: DistrictData) => void;
  onSelectGlacier?: (glacier: GlacialZone) => void;
  language: SupportedLanguage;
  height?: string;
}

export const RiskMap: React.FC<RiskMapProps> = ({
  districts,
  glaciers,
  earthquakes,
  selectedDistrict,
  onSelectDistrict,
  onSelectGlacier,
  language,
  height = '700px',
}) => {
  const t = TRANSLATIONS[language];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const rulerLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeLayers, setActiveLayers] = useState({
    districts: true,
    glaciers: true,
    seismic: true,
    safePathOverlay: true,
  });

  const [basemap, setBasemap] = useState<'carto_dark' | 'osm' | 'esri_sat' | 'opentopo'>('carto_dark');
  const [selectedCorridor, setSelectedCorridor] = useState<string>('dist-east-sikkim');
  const [cursorPosition, setCursorPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isRulerActive, setIsRulerActive] = useState<boolean>(false);
  const [measuredDistanceKm, setMeasuredDistanceKm] = useState<number | null>(null);
  const rulerPointsRef = useRef<[number, number][]>([]);

  const onSelectDistrictRef = useRef(onSelectDistrict);
  onSelectDistrictRef.current = onSelectDistrict;
  const onSelectGlacierRef = useRef(onSelectGlacier);
  onSelectGlacierRef.current = onSelectGlacier;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [26.8, 92.2],
      zoom: 7,
      minZoom: 5,
      maxZoom: 16,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial Dark Tiles — CartoDB Dark Matter (free, no API key required)
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    });

    tileLayer.addTo(map);
    tileLayerRef.current = tileLayer;

    // Failover if tile request fails — swap to OSM
    tileLayer.on('tileerror', () => {
      console.warn('CartoDB tile error — falling back to OSM');
    });

    const layerGroup = L.layerGroup().addTo(map);
    layersGroupRef.current = layerGroup;

    const rulerGroup = L.layerGroup().addTo(map);
    rulerLayerRef.current = rulerGroup;

    // Track mouse coordinates
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      if (e.latlng) {
        setCursorPosition({
          lat: Number(e.latlng.lat.toFixed(4)),
          lng: Number(e.latlng.lng.toFixed(4)),
        });
      }
    });

    mapInstanceRef.current = map;

    // Staged resize invalidations to handle tab transitions and modal renders
    const invalidate = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    map.whenReady(invalidate);
    const t1 = setTimeout(invalidate, 60);
    const t2 = setTimeout(invalidate, 250);
    const t3 = setTimeout(invalidate, 700);

    let rafId: number | null = null;
    const resizeObserver = new ResizeObserver(() => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        invalidate();
      });
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch basemap layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayerRef.current) return;

    map.removeLayer(tileLayerRef.current);

    let newTileLayer: L.TileLayer;
    if (basemap === 'esri_sat') {
      newTileLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS' }
      );
    } else if (basemap === 'opentopo') {
      newTileLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; OpenStreetMap, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
        maxZoom: 17,
      });
    } else if (basemap === 'osm') {
      newTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      });
    } else {
      // carto_dark — CartoDB Dark Matter (free, no API key)
      newTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      });
    }

    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [basemap]);

  // Handle map ruler clicking
  useEffect(() => {
    const map = mapInstanceRef.current;
    const rulerGroup = rulerLayerRef.current;
    if (!map || !rulerGroup) return;

    if (!isRulerActive) {
      rulerGroup.clearLayers();
      rulerPointsRef.current = [];
      return;
    }

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      tacticalAudio.playRadioChirp();

      const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
      rulerPointsRef.current.push(newPoint);
      const points = rulerPointsRef.current;

      if (points.length >= 2) {
        // Compute distance
        const p1 = L.latLng(points[0][0], points[0][1]);
        const p2 = L.latLng(points[1][0], points[1][1]);
        const distKm = Number((p1.distanceTo(p2) / 1000).toFixed(2));
        setMeasuredDistanceKm(distKm);

        rulerGroup.clearLayers();
        const line = L.polyline([points[0], points[1]], {
          color: '#38bdf8',
          dashArray: '4, 6',
          weight: 2.5,
        });
        line.bindPopup(`<b>Tactical Air Distance:</b> ${distKm} km`).openPopup();
        rulerGroup.addLayer(line);
      }
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [isRulerActive]);

  // Update Map Markers & SafePath overlays whenever data or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Render District Landslide Risk Markers
    if (activeLayers.districts) {
      districts.forEach((d) => {
        let color = '#06b6d4'; // Low cyan
        if (d.riskLevel === 'critical') color = '#f43f5e'; // Rose red
        else if (d.riskLevel === 'high') color = '#f59e0b'; // Amber
        else if (d.riskLevel === 'moderate') color = '#eab308'; // Yellow

        const marker = L.circleMarker([d.lat, d.lng], {
          radius: 9 + (d.hciScore / 11),
          fillColor: color,
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.95,
          fillOpacity: 0.75,
        });

        const popupContent = `
          <div style="font-family: monospace; color: #0f172a; padding: 4px; min-width: 220px; font-size: 11px;">
            <div style="font-weight: bold; font-size: 13px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 4px;">
              ${d.name} [${d.awsStationId}]
            </div>
            <div style="color: #475569; margin-bottom: 6px;">${d.state} · ${d.elevationMeters}m Elev · ${d.geologyRockType}</div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span><b>HCI Risk Score:</b></span>
              <span style="font-weight: bold; color: ${color};">${d.hciScore}/100 (${d.riskLevel.toUpperCase()})</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span><b>Factor of Safety (Fs):</b></span>
              <span style="font-weight: bold; color: ${(d.factorOfSafety ?? 1.15) < 1.0 ? '#e11d48' : '#059669'};">${(d.factorOfSafety ?? 1.15).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span><b>Pore Pressure (uw):</b></span>
              <span><b>${d.poreWaterPressureKpa} kPa</b></span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span><b>Inclinometer Creep:</b></span>
              <span>${d.inclinometerCreepMmDay} mm/day</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span><b>Rain (24h):</b></span>
              <span style="color: #0284c7; font-weight: bold;">${d.rainfallMm24h} mm</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span><b>Slope Angle:</b></span>
              <span>${d.slopeDegrees}°</span>
            </div>

            <div style="background: #f1f5f9; padding: 4px; border-radius: 3px; margin-top: 4px;">
              <span style="display: block; font-size: 10px; color: #64748b;">HIGHWAY LIFELINE:</span>
              <span style="font-weight: bold; color: ${d.highwayStatus === 'CLOSED_SLIP' ? '#be123c' : '#0f172a'};">${d.highwayStatus}: ${d.criticalInfrastructure[0]}</span>
            </div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">BRO Sector: ${d.broProjectName}</div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => {
          tacticalAudio.playRadioChirp();
          onSelectDistrictRef.current(d);
        });

        group.addLayer(marker);
      });
    }

    // 2. Render Glacial Lake & Precursor Zones
    if (activeLayers.glaciers) {
      glaciers.forEach((g) => {
        const isCritical = g.glofRiskScore >= 80;
        const gColor = isCritical ? '#e11d48' : '#38bdf8';

        const iconHtml = `
          <div style="
            width: 22px;
            height: 22px;
            background: ${isCritical ? 'rgba(225, 29, 72, 0.95)' : 'rgba(56, 189, 248, 0.95)'};
            transform: rotate(45deg);
            border: 2px solid #ffffff;
            box-shadow: 0 0 10px ${isCritical ? 'rgba(225, 29, 72, 0.9)' : 'rgba(56, 189, 248, 0.9)'};
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(-45deg); font-size: 9px; font-weight: bold; color: white;">GL</span>
          </div>
        `;

        const glacierIcon = L.divIcon({
          html: iconHtml,
          className: 'glacier-marker',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const gMarker = L.marker([g.lat, g.lng], { icon: glacierIcon });

        const gPopup = `
          <div style="font-family: monospace; color: #0f172a; padding: 4px; min-width: 220px; font-size: 11px;">
            <div style="font-weight: bold; font-size: 13px; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 4px;">
              ${g.name}
            </div>
            <div style="color: #475569; margin-bottom: 6px;">${g.location} (${g.elevationMeters}m Elev)</div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span><b>GLOF Risk Score:</b></span>
              <span style="font-weight: bold; color: ${gColor};">${g.glofRiskScore}/100</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span><b>Moraine Freeboard:</b></span>
              <span style="font-weight: bold;">${g.freeboardMeters} m</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span><b>Lake Surface:</b></span>
              <span>${g.lakeAreaSqKm} km² (+${g.areaExpansionPct5yr}%)</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span><b>Ice-Fall Precursor:</b></span>
              <span style="color: #be123c; font-weight: bold;">${g.glacierFallPrecursor.fallSusceptibilityScore}/100</span>
            </div>

            <div style="background: #f1f5f9; padding: 4px; border-radius: 3px;">
              <span style="display: block; font-size: 10px; color: #64748b;">DOWNSTREAM SETTLEMENTS:</span>
              <span style="font-weight: bold;">${g.downstreamSettlements.join(', ')}</span>
            </div>
          </div>
        `;

        gMarker.bindPopup(gPopup);
        gMarker.on('click', () => {
          tacticalAudio.playRadioChirp();
          onSelectGlacierRef.current?.(g);
        });
        group.addLayer(gMarker);
      });
    }

    // 3. Render USGS Live Seismic Events
    if (activeLayers.seismic) {
      earthquakes.forEach((eq) => {
        const eqCircle = L.circleMarker([eq.lat, eq.lng], {
          radius: Math.max(6, eq.mag * 3.2),
          fillColor: '#f97316',
          color: '#fb923c',
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.35,
        });

        eqCircle.bindPopup(`
          <div style="font-family: monospace; color: #0f172a; padding: 4px; font-size: 11px;">
            <div style="font-weight: bold; color: #ea580c; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px;">
              USGS SEISMIC EVENT: M${(eq.mag ?? 3.5).toFixed(1)}
            </div>
            <div style="margin-top: 4px;"><b>Location:</b> ${eq.place}</div>
            <div><b>Depth:</b> ${eq.depthKm} km</div>
            <div><b>Time:</b> ${new Date(eq.time).toLocaleDateString()} ${new Date(eq.time).toLocaleTimeString()}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 3px;">Source: USGS Real-time GeoJSON API</div>
          </div>
        `);
        group.addLayer(eqCircle);
      });
    }

    // 4. Render SafePath AI Evacuation Overlay
    if (activeLayers.safePathOverlay && EVACUATION_NETWORKS[selectedCorridor]) {
      const net = EVACUATION_NETWORKS[selectedCorridor];
      const routeResult = calculateSafePath(net, net.defaultOriginId, net.defaultDestinationId);

      if (routeResult) {
        // Safe Route: Emerald
        const safeCoords: [number, number][] = routeResult.safeRoute.nodes.map((n) => [n.lat, n.lng]);
        const safePolyline = L.polyline(safeCoords, {
          color: '#10b981',
          weight: 4.5,
          opacity: 0.9,
          lineJoin: 'round',
        });
        safePolyline.bindPopup(`
          <div style="color: #064e3b; font-family: monospace; font-size: 11px;">
            <b>SafePath AI Recommended Route</b><br/>
            Bypasses active slip chokepoints.<br/>
            Avg Risk: ${routeResult.safeRoute.avgHci}/100 | Dist: ${routeResult.safeRoute.totalDistanceKm} km
          </div>
        `);
        group.addLayer(safePolyline);

        // Direct Dangerous Route: Dashed Crimson
        const directCoords: [number, number][] = routeResult.directDangerousRoute.nodes.map((n) => [n.lat, n.lng]);
        const directPolyline = L.polyline(directCoords, {
          color: '#ef4444',
          weight: 3,
          opacity: 0.75,
          dashArray: '6, 8',
        });
        directPolyline.bindPopup(`
          <div style="color: #991b1b; font-family: monospace; font-size: 11px;">
            <b>Direct Valley Road (High Hazard)</b><br/>
            Passes active slip zone (Max HCI: ${routeResult.directDangerousRoute.maxHciEncountered}/100)
          </div>
        `);
        group.addLayer(directPolyline);

        // Destination Shelter Marker
        const dest = routeResult.destination;
        const shelterMarker = L.circleMarker([dest.lat, dest.lng], {
          radius: 8,
          fillColor: '#10b981',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1,
        });
        shelterMarker.bindPopup(`<b>Emergency Assembly Shelter</b><br/>${dest.name} (${dest.elevation}m)`);
        group.addLayer(shelterMarker);
      }
    }
  }, [districts, glaciers, earthquakes, activeLayers, selectedCorridor]);

  // Center on selected district if changed
  useEffect(() => {
    if (selectedDistrict && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedDistrict.lat, selectedDistrict.lng], 10, {
        duration: 1.2,
      });
    }
  }, [selectedDistrict]);

  const handleResetView = () => {
    tacticalAudio.playRadioChirp();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([26.8, 92.2], 7, { duration: 1.0 });
    }
  };

  const toggleRuler = () => {
    tacticalAudio.playRadioChirp();
    setIsRulerActive(!isRulerActive);
    rulerPointsRef.current = [];
    setMeasuredDistanceKm(null);
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded border border-slate-800 bg-[#070b12] shadow-xl"
      style={{ height, minHeight: '480px' }}
    >
      {/* Leaflet Canvas Container */}
      <div
        ref={mapContainerRef}
        className="h-full w-full"
        style={{ width: '100%', height: '100%', minHeight: '480px' }}
      />

      {/* Top Left: Tactical GIS HUD */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
        <div className="rounded border border-slate-800 bg-[#060a10]/95 p-3.5 shadow-xl backdrop-blur-md pointer-events-auto max-w-sm">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-100">
              <Compass className="h-4 w-4 text-cyan-400" />
              <span>NER TOPOGRAPHIC GIS CONSOLE</span>
            </div>
            <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
              WGS84
            </span>
          </div>

          {/* Layer toggles */}
          <div className="mt-3 grid grid-cols-2 gap-1.5 font-mono text-[10px]">
            <button
              onClick={() => {
                tacticalAudio.playRadioChirp();
                setActiveLayers((p) => ({ ...p, districts: !p.districts }));
              }}
              className={`rounded px-2 py-1 transition-colors border text-left ${
                activeLayers.districts
                  ? 'border-cyan-700 bg-cyan-950/60 text-cyan-300 font-bold'
                  : 'border-slate-800 bg-slate-900/60 text-slate-500'
              }`}
            >
              [X] Districts ({districts.length})
            </button>
            <button
              onClick={() => {
                tacticalAudio.playRadioChirp();
                setActiveLayers((p) => ({ ...p, glaciers: !p.glaciers }));
              }}
              className={`rounded px-2 py-1 transition-colors border text-left ${
                activeLayers.glaciers
                  ? 'border-sky-700 bg-sky-950/60 text-sky-300 font-bold'
                  : 'border-slate-800 bg-slate-900/60 text-slate-500'
              }`}
            >
              [X] Glaciers ({glaciers.length})
            </button>
            <button
              onClick={() => {
                tacticalAudio.playRadioChirp();
                setActiveLayers((p) => ({ ...p, seismic: !p.seismic }));
              }}
              className={`rounded px-2 py-1 transition-colors border text-left ${
                activeLayers.seismic
                  ? 'border-amber-700 bg-amber-950/60 text-amber-300 font-bold'
                  : 'border-slate-800 bg-slate-900/60 text-slate-500'
              }`}
            >
              [X] USGS Seismic
            </button>
            <button
              onClick={() => {
                tacticalAudio.playRadioChirp();
                setActiveLayers((p) => ({ ...p, safePathOverlay: !p.safePathOverlay }));
              }}
              className={`rounded px-2 py-1 transition-colors border text-left ${
                activeLayers.safePathOverlay
                  ? 'border-emerald-700 bg-emerald-950/60 text-emerald-300 font-bold'
                  : 'border-slate-800 bg-slate-900/60 text-slate-500'
              }`}
            >
              [X] SafePath AI
            </button>
          </div>

          {/* Basemap Switcher */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400">BASEMAP:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  tacticalAudio.playRadioChirp();
                  setBasemap('carto_dark');
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  basemap === 'carto_dark' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => {
                  tacticalAudio.playRadioChirp();
                  setBasemap('osm');
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  basemap === 'osm' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400 hover:text-white'
                }`}
              >
                OSM
              </button>
              <button
                onClick={() => {
                  tacticalAudio.playRadioChirp();
                  setBasemap('esri_sat');
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  basemap === 'esri_sat' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400 hover:text-white'
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => {
                  tacticalAudio.playRadioChirp();
                  setBasemap('opentopo');
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  basemap === 'opentopo' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'text-slate-400 hover:text-white'
                }`}
              >
                Topo
              </button>
            </div>
          </div>
        </div>

        {/* SafePath Corridor Selector (if enabled) */}
        {activeLayers.safePathOverlay && (
          <div className="rounded border border-slate-800 bg-[#060a10]/95 p-2.5 shadow-xl backdrop-blur-md pointer-events-auto text-xs font-mono text-slate-300 max-w-sm">
            <span className="text-[10px] text-slate-400 block mb-1">TACTICAL EGRESS CORRIDOR:</span>
            <select
              value={selectedCorridor}
              onChange={(e) => setSelectedCorridor(e.target.value)}
              className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-white focus:outline-none"
            >
              <option value="dist-east-sikkim">Gangtok Ridge Evacuation (East Sikkim)</option>
              <option value="dist-north-sikkim">Mangan - Chungthang High Axis (North Sikkim)</option>
              <option value="dist-dima-hasao">Haflong - Jatinga Hill Corridor (Assam)</option>
            </select>
          </div>
        )}
      </div>

      {/* Top Right Toolbelt: Reset Extent & Distance Ruler */}
      <div className="absolute top-4 right-14 z-[400] flex items-center gap-2 font-mono text-xs">
        {/* Geodetic Ruler Tool */}
        <button
          onClick={toggleRuler}
          title={isRulerActive ? 'Disable distance measuring ruler' : 'Measure tactical air distance between points'}
          className={`flex items-center gap-1.5 rounded border px-2.5 py-1.5 shadow-md backdrop-blur-md transition-colors ${
            isRulerActive
              ? 'border-cyan-500 bg-cyan-950 text-cyan-200'
              : 'border-slate-800 bg-[#060a10]/95 text-slate-300 hover:text-white'
          }`}
        >
          <Ruler className="h-3.5 w-3.5 text-cyan-400" />
          <span>{isRulerActive ? 'Ruler [ON]' : 'Measure Distance'}</span>
        </button>

        {/* Reset Camera Button */}
        <button
          onClick={handleResetView}
          title="Reset map view to entire Northeast India region"
          className="flex items-center gap-1.5 rounded border border-slate-800 bg-[#060a10]/95 px-2.5 py-1.5 text-slate-300 hover:text-white shadow-md backdrop-blur-md"
        >
          <Maximize2 className="h-3.5 w-3.5 text-slate-400" />
          <span>NER Full Extent</span>
        </button>
      </div>

      {/* Bottom Bar: Live Crosshair Geodetic Coordinate Ticker */}
      <div className="absolute bottom-4 left-4 z-[400] rounded border border-slate-800 bg-[#060a10]/95 px-3 py-1.5 shadow-xl backdrop-blur-md text-[11px] font-mono text-slate-400 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Crosshair className="h-3.5 w-3.5" />
          <span>GEODETIC CURSOR:</span>
        </div>
        {cursorPosition && typeof cursorPosition.lat === 'number' && typeof cursorPosition.lng === 'number' ? (
          <span className="text-slate-200 font-semibold tabular-nums">
            {cursorPosition.lat.toFixed(4)}°N, {cursorPosition.lng.toFixed(4)}°E
          </span>
        ) : (
          <span className="text-slate-600">HOVER TO PROBE GRID</span>
        )}
        {measuredDistanceKm !== null && (
          <>
            <span aria-hidden="true" className="text-slate-700">|</span>
            <span className="text-emerald-400 font-bold">
              MEASURED AIR DISTANCE: {measuredDistanceKm} KM
            </span>
          </>
        )}
      </div>

      {/* Bottom Right: Cartographic GIS Legend */}
      <div className="absolute bottom-4 right-4 z-[400] rounded border border-slate-800 bg-[#060a10]/95 p-3 shadow-xl backdrop-blur-md text-xs font-mono text-slate-300 min-w-[210px]">
        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 mb-2 flex items-center justify-between text-[11px]">
          <span>CARTOGRAPHIC LEGEND</span>
          <span className="text-[10px] text-cyan-400">GIS LEVEL 3</span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500 border border-white" />
            <span>HCI &ge; 80 (Limit Eq. Critical)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500 border border-white" />
            <span>HCI 60 - 79 (High Shear Risk)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-yellow-500 border border-white" />
            <span>HCI 35 - 59 (Moderate Advisory)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-cyan-500 border border-white" />
            <span>HCI &lt; 35 (Stable Baseline)</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
            <div className="h-3 w-3 rotate-45 bg-rose-600 border border-white" />
            <span>Proglacial Lake / GLOF Site</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-orange-500/40 border border-orange-400" />
            <span>USGS Live Earthquake</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-4 bg-emerald-500" />
            <span>SafePath AI Egress Line</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-4 border-b border-dashed border-rose-500" />
            <span>Blocked Valley Highway Choke</span>
          </div>
        </div>
      </div>
    </div>
  );
};
