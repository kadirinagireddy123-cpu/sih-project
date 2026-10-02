"""
Project TRISHUL — Core ML Risk Inference Engine
Landslide Hazard Confidence Index (HCI) + Glacier-Fall Precursors Combiner
"""
import numpy as np
from typing import Dict, Any, Tuple

def compute_hci_prediction(
    rainfall_24h: float,
    rainfall_72h: float,
    slope: float,
    soil_moisture: float,
    ndvi: float,
    historical: int,
    seismic_mag: float = 0.0,
    distance_km: float = 999.0,
) -> Tuple[int, str, Dict[str, int], str]:
    """
    Computes Hazard Confidence Index (0-100) using domain geotechnical thresholds
    derived from GSI (Geological Survey of India) empirical failure boundaries.
    """
    # 1. Rainfall Pluvial component
    intensity = (rainfall_24h * 0.65) + (rainfall_72h * 0.35)
    if intensity < 20:
        rf_norm = intensity * 0.8
    elif intensity < 60:
        rf_norm = 16.0 + (intensity - 20) * 1.1
    else:
        rf_norm = 60.0 + min(40.0, (intensity - 60) * 0.85)

    # 2. Slope angle component
    if slope < 20:
        slope_norm = slope * 0.8
    elif slope < 35:
        slope_norm = 16.0 + (slope - 20) * 2.2
    else:
        slope_norm = 49.0 + min(51.0, (slope - 35) * 3.4)

    # 3. Soil moisture saturation
    if soil_moisture < 50:
        soil_norm = soil_moisture * 0.5
    elif soil_moisture < 75:
        soil_norm = 25.0 + (soil_moisture - 50) * 1.4
    else:
        soil_norm = 60.0 + min(40.0, (soil_moisture - 75) * 1.6)

    # 4. NDVI vegetation protection factor (Inverted)
    ndvi_risk = max(0.0, min(100.0, (1.0 - ndvi) * 100.0))

    # 5. Historical frequency
    hist_risk = min(100.0, historical * 3.2)

    # 6. Seismic attenuation
    seismic_risk = 0.0
    if seismic_mag >= 3.0 and distance_km < 300:
        energy = 10.0 ** (1.5 * seismic_mag)
        attenuation = max(1.0, distance_km)
        seismic_risk = min(100.0, (energy / (attenuation * 120.0)) * 10.0)

    # Ensemble weights
    w_rf = 0.35
    w_slope = 0.25
    w_soil = 0.20
    w_ndvi = 0.08
    w_hist = 0.08
    w_seismic = 0.04

    raw_score = (
        (rf_norm * w_rf) +
        (slope_norm * w_slope) +
        (soil_norm * w_soil) +
        (ndvi_risk * w_ndvi) +
        (hist_risk * w_hist) +
        (seismic_risk * w_seismic)
    )

    # Geotechnical synergy penalty
    synergy = 8.5 if (rainfall_24h > 50 and slope > 32 and soil_moisture > 75) else 0.0
    final_score = int(min(99, max(12, round(raw_score + synergy))))

    # Risk level
    if final_score >= 80:
        risk_level = "critical"
        reason = f"Critical pore water pressure saturation ({rainfall_24h:.1f}mm/24h) on {slope:.1f}° unstable slope."
    elif final_score >= 60:
        risk_level = "high"
        reason = "Elevated antecedent rainfall combined with steep shear stress."
    elif final_score >= 35:
        risk_level = "moderate"
        reason = "Moderate risk: localized drainage bottlenecks monitored."
    else:
        risk_level = "low"
        reason = "Stable baseline topography with moderate moisture levels."

    # Factor contributions (SHAP-style)
    tot_weight = raw_score + 0.001
    factor_contributions = {
        "rainfall": int(round(((rf_norm * w_rf) / tot_weight) * final_score)),
        "slope": int(round(((slope_norm * w_slope) / tot_weight) * final_score)),
        "soil_moisture": int(round(((soil_norm * w_soil) / tot_weight) * final_score)),
        "ndvi": int(round(((ndvi_risk * w_ndvi) / tot_weight) * final_score)),
        "historical": int(round(((hist_risk * w_hist) / tot_weight) * final_score)),
        "seismic": int(round(((seismic_risk * w_seismic) / tot_weight) * final_score)),
    }

    return final_score, risk_level, factor_contributions, reason

def compute_glacier_fall_susceptibility(
    terrain_steepness: int,
    velocity_anomaly_pct: float,
    basal_melt_score: int,
    seismic_ice_quakes: int,
) -> Tuple[int, str, Dict[str, bool], str]:
    """
    Module 3: Combines the 4 precursor channels into fall_susceptibility_score (0-100)
    """
    c1 = min(100, max(0, terrain_steepness)) * 0.30
    c2 = min(100, max(0, (velocity_anomaly_pct / 50.0) * 100.0)) * 0.30
    c3 = min(100, max(0, basal_melt_score)) * 0.25
    c4 = min(100, max(0, (seismic_ice_quakes / 10.0) * 100.0)) * 0.15

    score = int(min(99, max(10, round(c1 + c2 + c3 + c4))))
    risk_level = "critical" if score >= 80 else ("high" if score >= 65 else ("moderate" if score >= 40 else "low"))

    status = {
        "velocity_anomaly_flag": velocity_anomaly_pct >= 25.0,
        "basal_thermal_spike_flag": basal_melt_score >= 65,
        "ice_quake_swarm_flag": seismic_ice_quakes >= 4,
        "steep_bedrock_crevasse_flag": terrain_steepness >= 75,
    }

    if score >= 80:
        interp = "CRITICAL: Severe hanging glacier detachment hazard. Ice velocity surge and basal hydraulic lubrication indicate imminent slab release."
    elif score >= 65:
        interp = "HIGH: Elevated creep rate with multiple micro-seismic fracture events detected along bedrock interface."
    else:
        interp = "Hanging glacier body shows stable seasonal creep within historical thresholds."

    return score, risk_level, status, interp
