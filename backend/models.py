from typing import Optional, List, Dict, Any
from sqlmodel import Field, SQLModel
from datetime import datetime
from pydantic import BaseModel

class CitizenReport(SQLModel, table=True):
    __tablename__ = "citizen_reports"

    id: Optional[int] = Field(default=None, primary_key=True)
    district_id: str = Field(index=True)
    district_name: str
    hazard_type: str  # slope_crack, soil_subsidence, debris_flow, blocked_culvert, glacial_mudflow
    severity: str    # low, medium, high, critical
    description: str
    reporter_name: str
    reporter_role: str  # citizen, community_volunteer, bro_engineer, disaster_mgmt_officer
    lat: float
    lng: float
    status: str = Field(default="under_review") # verified, under_review, resolved
    photo_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AlertLog(SQLModel, table=True):
    __tablename__ = "alert_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    target_zone: str
    state: str
    level: str  # low, moderate, high, critical
    hazard_type: str
    headline: str
    details: str
    recommended_action: str
    time_to_impact_hours: float
    cap_protocol_status: str = Field(default="DISPATCHED")
    issued_at: datetime = Field(default_factory=datetime.utcnow)

# Pydantic Schemas for API Requests & Responses
class LandslidePredictRequest(BaseModel):
    district_id: str
    rainfall_24h_mm: float
    rainfall_72h_mm: float
    slope_degrees: float
    soil_moisture_pct: float
    ndvi_index: float
    historical_incidents: int
    seismic_magnitude: Optional[float] = 0.0
    distance_to_epicenter_km: Optional[float] = 999.0

class FactorContributions(BaseModel):
    rainfall: int
    slope: int
    soil_moisture: int
    ndvi: int
    historical: int
    seismic: int

class LandslidePredictResponse(BaseModel):
    district_id: str
    hci_score: int
    risk_level: str
    factor_contributions: FactorContributions
    trigger_reason: str
    model_version: str = "RandomForest-v1.2-NER"
    data_provenance: Dict[str, str]

class GlacierFallChannelSignals(BaseModel):
    terrain_steepness_score: int  # Real GIS/Elevation
    glacier_velocity_anomaly_pct: float  # SIMULATED (Prod swap: NASA ITS_LIVE / Sentinel-1 InSAR)
    basal_melt_signal_score: int  # SIMULATED (Prod swap: MODIS / Landsat LST)
    seismic_ice_quake_count_24h: int  # Real USGS feed

class GlacierFallResponse(BaseModel):
    glacier_id: str
    glacier_name: str
    fall_susceptibility_score: int
    risk_level: str
    channels: GlacierFallChannelSignals
    channel_status: Dict[str, bool]
    interpretation: str
    audit_tags: Dict[str, str]
