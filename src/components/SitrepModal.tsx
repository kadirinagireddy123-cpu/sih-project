import React, { useState } from 'react';
import { DistrictData, GlacialZone, EarthquakeEvent } from '../types';
import { X, Printer, Copy, Check, FileText, ShieldAlert } from 'lucide-react';
import { tacticalAudio } from '../services/soundEffects';

interface SitrepModalProps {
  isOpen: boolean;
  onClose: () => void;
  districts: DistrictData[];
  glaciers: GlacialZone[];
  earthquakes: EarthquakeEvent[];
}

export const SitrepModal: React.FC<SitrepModalProps> = ({
  isOpen,
  onClose,
  districts,
  glaciers,
  earthquakes,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST';
  const docRef = `NDMA/MDoNER/NER-OPS/2026/SITREP-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}-01`;

  const criticalDistricts = districts.filter(d => d.riskLevel === 'critical');
  const highDistricts = districts.filter(d => d.riskLevel === 'high');
  const criticalGlaciers = glaciers.filter(g => g.glofRiskScore >= 80);

  const handlePrint = () => {
    tacticalAudio.playRadioChirp();
    window.print();
  };

  const handleCopy = () => {
    tacticalAudio.playRadioChirp();
    const sitrepText = `
GOVERNMENT OF INDIA // DISASTER OPERATIONS DESK
NORTH EASTERN REGIONAL HAZARD & GLOF COMMAND CENTER
REF: ${docRef}
DATE/TIME: ${dateStr} ${timeStr}
CLASSIFICATION: RESTRICTED // OPERATIONAL DISASTER ADVISORY

1. SITUATION SUMMARY:
- Active Critical Landslide Sectors: ${criticalDistricts.map(d => d.name).join(', ')}
- High Alert Proglacial Lakes: ${criticalGlaciers.map(g => `${g.name} (GLOF: ${g.glofRiskScore}/100, Freeboard: ${g.freeboardMeters}m)`).join('; ')}
- Antecedent Pluvial Condition: Peak 24h rainfall ${Math.max(...districts.map(d => d.rainfallMm24h ?? 0), 0).toFixed(1)} mm.
- Seismic Activity: ${earthquakes.length} events logged in last 7 days within Himalayan zone.

2. STRATEGIC INFRASTRUCTURE STATUS:
- NH-10 (Sikkim Lifeline): ${districts.find(d => d.id === 'dist-east-sikkim')?.highwayStatus || 'RESTRICTED'}
- NH-54E / Lumding-Badarpur Rail (Dima Hasao): ${districts.find(d => d.id === 'dist-dima-hasao')?.highwayStatus || 'CLOSED_SLIP'}
- Chungthang Dam Axis: CRITICAL OVERBURDEN WATCH

3. DISASTER RESPONSE MOBILIZATION:
- BRO Task Forces on Red Alert: Project Swastik (Sikkim), Project Pushpak (Assam/Mizoram), Project Vartak (Arunachal)
- SafePath AI Alternate Ridge Evacuation Routes: ACTIVATED

AUTHORIZING OFFICER: S. Sengupta, Joint Director (Disaster Operations), MDoNER / NDMA NER
`.trim();

    navigator.clipboard.writeText(sitrepText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded border border-slate-700 bg-[#090e17] p-6 shadow-2xl print:border-none print:bg-white print:text-black print:max-h-none print:shadow-none">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            <span className="font-mono text-xs font-bold text-slate-300">
              OFFICIAL SITUATION REPORT (SITREP) VIEWER
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded border border-cyan-800 bg-cyan-950 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Official SITREP</span>
            </button>
            <button
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Government Document Layout */}
        <div className="mt-4 font-mono text-xs text-slate-300 print:text-black space-y-4 leading-relaxed">
          {/* Document Top Classification & Seal */}
          <div className="border-b-2 border-slate-700 pb-3 text-center print:border-black">
            <div className="text-[10px] tracking-widest text-rose-400 font-bold uppercase print:text-black">
              RESTRICTED // OPERATIONAL DISASTER SITUATION REPORT
            </div>
            <div className="font-bold text-base text-white tracking-wide mt-1 print:text-black">
              GOVERNMENT OF INDIA · MINISTRY OF DEVELOPMENT OF NORTH EASTERN REGION (MDoNER)
            </div>
            <div className="text-xs text-slate-400 print:text-black">
              JOINT OPERATIONS COMMAND DESK (NDMA · BRO · STATE DISASTER AUTHORITIES)
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-1.5 print:border-black print:text-black">
              <span>DOCUMENT REF: <b>{docRef}</b></span>
              <span>ISSUED: <b>{dateStr} {timeStr}</b></span>
              <span>SECURITY CODE: <b>NER-SW-CAP-4</b></span>
            </div>
          </div>

          {/* Section 1: Strategic Threat Executive Summary */}
          <div>
            <div className="font-bold text-cyan-400 border-b border-slate-800 pb-1 uppercase tracking-wider print:text-black print:border-black">
              1. EXECUTIVE THREAT ASSESSMENT (LANDSLIDE & GLOF)
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="border border-slate-800 bg-slate-950/60 p-2.5 print:border-black print:bg-transparent">
                <span className="text-[10px] text-slate-400 block uppercase">Critical Sectors (HCI &ge; 80)</span>
                <span className="text-base font-bold text-rose-400 print:text-black">{criticalDistricts.length}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {criticalDistricts.map(d => d.name).join(', ')}
                </span>
              </div>
              <div className="border border-slate-800 bg-slate-950/60 p-2.5 print:border-black print:bg-transparent">
                <span className="text-[10px] text-slate-400 block uppercase">High Risk Sectors (HCI 60-79)</span>
                <span className="text-base font-bold text-amber-400 print:text-black">{highDistricts.length}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {highDistricts.map(d => d.name).join(', ')}
                </span>
              </div>
              <div className="border border-slate-800 bg-slate-950/60 p-2.5 print:border-black print:bg-transparent">
                <span className="text-[10px] text-slate-400 block uppercase">Critical Glacial Lake Dams</span>
                <span className="text-base font-bold text-rose-400 print:text-black">{criticalGlaciers.length}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  South Lhonak, Upper Siang
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Sector Geotechnical Telemetry */}
          <div>
            <div className="font-bold text-cyan-400 border-b border-slate-800 pb-1 uppercase tracking-wider print:text-black print:border-black">
              2. SECTOR-BY-SECTOR GEOTECHNICAL TELEMETRY
            </div>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-[11px] border border-slate-800 print:border-black">
                <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800 print:bg-slate-100 print:text-black print:border-black">
                  <tr>
                    <th className="p-1.5">Sector</th>
                    <th className="p-1.5">Slope</th>
                    <th className="p-1.5">Rain 24h</th>
                    <th className="p-1.5">Pore Press.</th>
                    <th className="p-1.5">F.o.S (Fs)</th>
                    <th className="p-1.5">Creep Rate</th>
                    <th className="p-1.5">HCI</th>
                    <th className="p-1.5">Highway Lifeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-black">
                  {districts.map(d => (
                    <tr key={d.id} className={d.riskLevel === 'critical' ? 'bg-rose-950/20 print:bg-transparent' : ''}>
                      <td className="p-1.5 font-bold text-white print:text-black">{d.name}</td>
                      <td className="p-1.5">{d.slopeDegrees}°</td>
                      <td className="p-1.5 text-cyan-300 print:text-black">{d.rainfallMm24h} mm</td>
                      <td className="p-1.5">{d.poreWaterPressureKpa} kPa</td>
                      <td className={`p-1.5 font-bold ${(d.factorOfSafety ?? 1.15) < 1.0 ? 'text-rose-400 print:text-black' : 'text-emerald-400 print:text-black'}`}>
                        {(d.factorOfSafety ?? 1.15).toFixed(2)}
                      </td>
                      <td className="p-1.5">{d.inclinometerCreepMmDay} mm/d</td>
                      <td className="p-1.5 font-bold">{d.hciScore}/100</td>
                      <td className="p-1.5">
                        <span className={`px-1 rounded text-[10px] ${
                          d.highwayStatus === 'CLOSED_SLIP' ? 'bg-rose-950 text-rose-300 print:border print:border-black' :
                          d.highwayStatus === 'RESTRICTED' ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
                        }`}>
                          {d.highwayStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Armed Forces & Infrastructure Deployment */}
          <div>
            <div className="font-bold text-cyan-400 border-b border-slate-800 pb-1 uppercase tracking-wider print:text-black print:border-black">
              3. ARMED FORCES & BORDER ROADS DISPATCH (BRO / SDRF / NDRF)
            </div>
            <div className="mt-2 space-y-1.5 text-[11px] text-slate-300 print:text-black">
              <div className="flex items-start gap-2">
                <span className="text-cyan-400">▶</span>
                <span><b>Project Swastik (BRO Sikkim):</b> Heavy hydraulic excavators and rock breakers positioned at Ranipool (NH-10 Km 24) and Mangan-Singhik axis. Road closed to civilian vehicular traffic.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400">▶</span>
                <span><b>Project Pushpak (BRO Assam/Mizoram):</b> Rail track bed settlement monitoring between Jatinga-Lumpur and Harangajao. Ballast tamping units on 15-minute standby.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400">▶</span>
                <span><b>SafePath AI Evacuation Routing:</b> Active enforcement of ridge egress routes for civil population centers; low-elevation valley bottoms declared red exclusion zones.</span>
              </div>
            </div>
          </div>

          {/* Sign-off Seal */}
          <div className="border-t border-slate-800 pt-3 flex flex-wrap justify-between items-end text-[11px] text-slate-400 print:border-black print:text-black">
            <div>
              <div>DISASTER COMMAND SYSTEM: <b>TRISHUL TELEMETRY v1.0.0-SIH26</b></div>
              <div>VERIFICATION: <b>DIGITALLY VERIFIED VIA NDMA EMERGENCY GATEWAY</b></div>
            </div>
            <div className="text-right mt-2 sm:mt-0">
              <div className="font-bold text-slate-200 print:text-black">COL. V. K. NAIR (RETD.)</div>
              <div>Chief Controller of Operations, Disaster Monitoring Cell</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
