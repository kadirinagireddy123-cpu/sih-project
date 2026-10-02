import React, { useState } from 'react';
import { CitizenReport, DistrictData, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { X, MapPin, Camera, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface CitizenReportModalProps {
  districts: DistrictData[];
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (report: Omit<CitizenReport, 'id' | 'timestamp' | 'status'>) => void;
  language: SupportedLanguage;
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  districts,
  isOpen,
  onClose,
  onSubmitReport,
  language,
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[language];

  const [districtId, setDistrictId] = useState<string>(districts[0]?.id || 'dist-east-sikkim');
  const [hazardType, setHazardType] = useState<CitizenReport['hazardType']>('slope_crack');
  const [severity, setSeverity] = useState<CitizenReport['severity']>('high');
  const [description, setDescription] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterRole, setReporterRole] = useState<CitizenReport['reporterRole']>('citizen');
  const [lat, setLat] = useState<number>(districts[0]?.lat || 27.3389);
  const [lng, setLng] = useState<number>(districts[0]?.lng || 88.6065);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [photoUploaded, setPhotoUploaded] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const selectedDistrict = districts.find((d) => d.id === districtId);

  const handleDistrictChange = (id: string) => {
    setDistrictId(id);
    const d = districts.find((dist) => dist.id === id);
    if (d) {
      setLat(d.lat + (Math.random() - 0.5) * 0.02);
      setLng(d.lng + (Math.random() - 0.5) * 0.02);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(4)));
        setLng(Number(pos.coords.longitude.toFixed(4)));
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error', err);
        setIsLocating(false);
      },
      { timeout: 6000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !reporterName.trim()) return;

    onSubmitReport({
      districtId,
      districtName: selectedDistrict?.name || 'NER District',
      hazardType,
      severity,
      description,
      reporterName,
      reporterRole,
      lat,
      lng,
      photoUrl: photoUploaded ? 'https://images.satellite-mock/ner-crack-photo.jpg' : undefined,
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-slate-700 bg-[#0c121e] p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-400" />
            <h2 className="font-display text-lg font-bold text-white">
              {t.submitFieldReport}
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Crowdsource early precursor signs (slope fissures, spring discoloration, road subsidence) to enhance model predictions.
          </p>
        </div>

        {isSubmitted ? (
          <div className="my-8 flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mb-2" />
            <h3 className="font-display text-base font-bold text-white">
              Field Report Successfully Recorded!
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Dispatched to District Emergency Operations Centre and factored into local HCI weighting.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            {/* District Selector */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Monitored District / Sector:
              </label>
              <select
                value={districtId}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Hazard Type & Severity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Precursor Hazard Type:
                </label>
                <select
                  value={hazardType}
                  onChange={(e) => setHazardType(e.target.value as any)}
                  className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="slope_crack">Longitudinal Slope Crack</option>
                  <option value="soil_subsidence">Road / Rail Subsidence</option>
                  <option value="debris_flow">Debris / Mud Flow</option>
                  <option value="blocked_culvert">Culvert Blockage / Drainage Overflow</option>
                  <option value="glacial_mudflow">Glacial Mud / Slush Surge</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Severity Rating:
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="low">Low (Minor seep)</option>
                  <option value="medium">Medium (Road shoulder crack)</option>
                  <option value="high">High (Active ground sinking)</option>
                  <option value="critical">Critical (Imminent slope collapse)</option>
                </select>
              </div>
            </div>

            {/* GPS Coordinates */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">
                  Field GPS Coordinates:
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono text-[11px]"
                >
                  <MapPin className="h-3 w-3" />
                  <span>{isLocating ? 'Locating...' : 'Use My GPS'}</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value))}
                  placeholder="Latitude"
                  className="rounded border border-slate-800 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value))}
                  placeholder="Longitude"
                  className="rounded border border-slate-800 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                  required
                />
              </div>
            </div>

            {/* Reporter details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Reporter Name:
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Captain N. Sharma"
                  className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Reporter Role:
                </label>
                <select
                  value={reporterRole}
                  onChange={(e) => setReporterRole(e.target.value as any)}
                  className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="citizen">Local Citizen / Resident</option>
                  <option value="community_volunteer">Community Aapda Mitra Volunteer</option>
                  <option value="bro_engineer">BRO / PWD Field Engineer</option>
                  <option value="disaster_mgmt_officer">DDMA Disaster Officer</option>
                </select>
              </div>
            </div>

            {/* Field Observation Description */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Visual Observations / Precursor Details:
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe crack length, depth, water discharge, rockfall sounds, tilting trees..."
                className="w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            {/* Photo Attachment Simulation */}
            <div className="rounded border border-dashed border-slate-800 bg-slate-950 p-3 text-center">
              <button
                type="button"
                onClick={() => setPhotoUploaded(!photoUploaded)}
                className="flex items-center justify-center gap-1.5 mx-auto text-slate-400 hover:text-white"
              >
                <Camera className="h-4 w-4 text-cyan-400" />
                <span>
                  {photoUploaded ? '✓ Photo Attached (evidence_fissure_01.jpg)' : 'Attach Field Photo / Geo-Tagged Image'}
                </span>
              </button>
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-slate-700 bg-slate-800 px-4 py-2 text-slate-200 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded bg-cyan-600 px-4 py-2 font-semibold text-white hover:bg-cyan-500"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Field Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
