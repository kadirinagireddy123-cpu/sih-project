"""
Project TRISHUL — Database Seeding Script
Populates initial citizen reports and baseline alert logs in SQLite.
"""
import sys
from pathlib import Path
from datetime import datetime, timedelta
from sqlmodel import Session, select

# Add backend directory and project root to sys.path
_current_dir = Path(__file__).resolve().parent
_parent_dir = _current_dir.parent
for _p in (str(_parent_dir), str(_current_dir)):
    if _p not in sys.path:
        sys.path.insert(0, _p)

try:
    from backend.database import engine, create_db_and_tables
    from backend.models import CitizenReport, AlertLog
except ModuleNotFoundError:
    from database import engine, create_db_and_tables
    from models import CitizenReport, AlertLog

def seed():
    create_db_and_tables()
    with Session(engine) as session:
        # Check if already seeded
        existing = session.exec(select(CitizenReport)).first()
        if existing:
            print("Database already contains records. Skipping seed.")
            return

        reports = [
            CitizenReport(
                district_id="dist-north-sikkim",
                district_name="North Sikkim (Mangan / Chungthang)",
                hazard_type="slope_crack",
                severity="critical",
                description="Fresh 15-meter longitudinal fissure detected across the road embankment near Singhik bend. Seeping muddy water observed.",
                reporter_name="Subedar T. Lepcha",
                reporter_role="bro_engineer",
                lat=27.5210,
                lng=88.5480,
                status="verified",
                created_at=datetime.utcnow() - timedelta(minutes=45)
            ),
            CitizenReport(
                district_id="dist-dima-hasao",
                district_name="Dima Hasao (Haflong / Jatinga)",
                hazard_type="soil_subsidence",
                severity="high",
                description="Gradual track settlement of ~18cm along the Lumding-Badarpur railway cutting following continuous overnight downpour.",
                reporter_name="Amitava Choudhury",
                reporter_role="disaster_mgmt_officer",
                lat=25.1742,
                lng=93.0238,
                status="verified",
                created_at=datetime.utcnow() - timedelta(hours=2)
            ),
        ]

        alerts = [
            AlertLog(
                target_zone="South Lhonak Glacial Lake",
                state="North Sikkim",
                level="critical",
                hazard_type="GLOF Threat",
                hci_score=92,
                headline="CRITICAL GLOF / ICE AVALANCHE PRECURSOR: South Lhonak Glacial Lake",
                details="Chungthang and downstream Teesta basin alert active. Moraine freeboard is only 6.8m. Ice-slab creep acceleration detected.",
                recommended_action="Sound downstream sirens in Teesta valley. Evacuate low-lying riverbed habitations to designated high-ridge shelters immediately.",
                time_to_impact_hours=2.5,
                cap_status="DISPATCHED",
                issued_at=datetime.utcnow() - timedelta(minutes=20)
            )
        ]

        session.add_all(reports)
        session.add_all(alerts)
        session.commit()
        print("Successfully seeded initial citizen reports and alert logs.")

if __name__ == '__main__':
    seed()
