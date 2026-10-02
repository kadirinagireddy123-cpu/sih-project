"""
Project TRISHUL — FastAPI Early Warning Gateway
SIH 2026 | Problem Statement 26001 | Team Tech Trojans (ID 119478)
"""
import sys
import os
from pathlib import Path

# Add backend directory and project root to sys.path so the module can be run from anywhere
_current_dir = Path(__file__).resolve().parent
_parent_dir = _current_dir.parent
for _p in (str(_parent_dir), str(_current_dir)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List, Dict, Any, Optional
import requests
import datetime

try:
    from backend.database import create_db_and_tables, get_session
    from backend.models import (
        CitizenReport,
        AlertLog,
        LandslidePredictRequest,
        LandslidePredictResponse,
        FactorContributions,
        GlacierFallChannelSignals,
        GlacierFallResponse,
    )
    from backend.ml_engine import compute_hci_prediction, compute_glacier_fall_susceptibility
except ModuleNotFoundError:
    from database import create_db_and_tables, get_session
    from models import (
        CitizenReport,
        AlertLog,
        LandslidePredictRequest,
        LandslidePredictResponse,
        FactorContributions,
        GlacierFallChannelSignals,
        GlacierFallResponse,
    )
    from ml_engine import compute_hci_prediction, compute_glacier_fall_susceptibility

app = FastAPI(
    title="Project TRISHUL Gateway",
    description="AI Early Warning & Landslide/GLOF Risk Monitoring for North Eastern Region (NER)",
    version="1.0.0-SIH2026"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def read_root():
    return {
        "platform": "Project TRISHUL",
        "description": "AI-Based Early Warning & Multi-Hazard Monitoring System for NER",
        "team": "Tech Trojans (ID 119478)",
        "sih_year": 2026,
        "monitored_region": "North Eastern Region (Sikkim, Assam, Meghalaya, Arunachal, Nagaland, Mizoram, Manipur)",
        "status": "OPERATIONAL",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@app.post("/api/predict/hci", response_model=LandslidePredictResponse)
def predict_landslide_hci(req: LandslidePredictRequest):
    """
    Module 1: Calculates 0-100 Hazard Confidence Index (HCI) with explainable factor breakdown.
    """
    score, risk, factors, reason = compute_hci_prediction(
        rainfall_24h=req.rainfall_24h_mm,
        rainfall_72h=req.rainfall_72h_mm,
        slope=req.slope_degrees,
        soil_moisture=req.soil_moisture_pct,
        ndvi=req.ndvi_index,
        historical=req.historical_incidents,
        seismic_mag=req.seismic_magnitude or 0.0,
        distance_km=req.distance_to_epicenter_km or 999.0,
    )

    return LandslidePredictResponse(
        district_id=req.district_id,
        hci_score=score,
        risk_level=risk,
        factor_contributions=FactorContributions(**factors),
        trigger_reason=reason,
        data_provenance={
            "rainfall_source": "Open-Meteo Weather API (Real, Free, No-Key)",
            "slope_source": "Open-Elevation / SRTM DEM (Real, Free)",
            "seismic_source": "USGS Earthquake Hazards Feed (Real, Free)",
            "production_swap": "IMD Doppler Radar + ISRO Bhuvan CartoDEM 10m"
        }
    )

@app.post("/api/predict/glacier-fall", response_model=GlacierFallResponse)
def predict_glacier_fall(glacier_id: str, glacier_name: str, channels: GlacierFallChannelSignals):
    """
    Module 3: Glacier-Fall Precursors Layer combining 4 distinct channels.
    """
    score, risk, status, interp = compute_glacier_fall_susceptibility(
        terrain_steepness=channels.terrain_steepness_score,
        velocity_anomaly_pct=channels.glacier_velocity_anomaly_pct,
        basal_melt_score=channels.basal_melt_signal_score,
        seismic_ice_quakes=channels.seismic_ice_quake_count_24h,
    )

    return GlacierFallResponse(
        glacier_id=glacier_id,
        glacier_name=glacier_name,
        fall_susceptibility_score=score,
        risk_level=risk,
        channels=channels,
        channel_status=status,
        interpretation=interp,
        audit_tags={
            "channel_1_steepness": "REAL (Open-Elevation / GIS)",
            "channel_2_velocity": "SIMULATED (Production Swap: NASA ITS_LIVE / Sentinel-1 InSAR)",
            "channel_3_basal_melt": "SIMULATED (Production Swap: MODIS / Landsat LST Thermal)",
            "channel_4_seismic": "REAL (USGS Live Hazards Feed)"
        }
    )

@app.get("/api/reports", response_model=List[CitizenReport])
def list_reports(session: Session = Depends(get_session)):
    reports = session.exec(select(CitizenReport).order_by(CitizenReport.created_at.desc())).all()
    return reports

@app.post("/api/reports", response_model=CitizenReport)
def create_report(report: CitizenReport, session: Session = Depends(get_session)):
    session.add(report)
    session.commit()
    session.refresh(report)
    return report

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
