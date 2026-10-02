"""
Project TRISHUL — Model Training Script
Trains domain-informed RandomForestRegressor on physical geotechnical failure parameters.
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import pickle
import os

def generate_domain_informed_data(samples=6000):
    np.random.seed(42)
    # Rainfall mm (24h: 0 to 160 mm; 72h: 0 to 350 mm)
    rf24 = np.random.exponential(scale=35, size=samples)
    rf72 = rf24 * np.random.uniform(1.8, 3.2, size=samples)
    # Slope (15 to 55 degrees)
    slope = np.random.uniform(18, 52, size=samples)
    # Soil moisture (30% to 95%)
    soil = np.clip(np.random.normal(loc=70, scale=15, size=samples), 30, 98)
    # NDVI (0.2 to 0.85)
    ndvi = np.clip(np.random.normal(loc=0.55, scale=0.15, size=samples), 0.2, 0.85)
    # Historical frequency (0 to 40 per decade)
    hist = np.random.poisson(lam=18, size=samples)
    # Seismic PGA proxy (0 to 5)
    seismic = np.random.exponential(scale=0.8, size=samples)

    # Physical Geotechnical Failure Score Formula
    pluvial_factor = (rf24 * 0.45) + (rf72 * 0.15)
    slope_factor = np.where(slope > 35, (slope - 35) * 2.8 + 45, slope * 1.2)
    soil_factor = np.where(soil > 75, (soil - 75) * 1.8 + 40, soil * 0.5)
    ndvi_protection = (1.0 - ndvi) * 35.0
    hist_factor = np.clip(hist * 2.2, 0, 40)
    seismic_factor = np.clip(seismic * 12.0, 0, 30)

    raw_hci = (
        pluvial_factor * 0.32 +
        slope_factor * 0.28 +
        soil_factor * 0.20 +
        ndvi_protection * 0.08 +
        hist_factor * 0.08 +
        seismic_factor * 0.04
    )
    # Cross-interaction: heavy rain on steep saturated slope
    synergy = np.where((rf24 > 50) & (slope > 32) & (soil > 75), 12.0, 0.0)
    y = np.clip(raw_hci + synergy + np.random.normal(0, 3, size=samples), 5, 99)

    X = pd.DataFrame({
        'rainfall24h': rf24,
        'rainfall72h': rf72,
        'slope': slope,
        'soil_moisture': soil,
        'ndvi': ndvi,
        'historical': hist,
        'seismic': seismic
    })
    return X, y

def train_and_export():
    print("[Project TRISHUL] Generating domain-informed synthetic dataset (6,000 samples)...")
    X, y = generate_domain_informed_data(6000)

    print("[Project TRISHUL] Training RandomForestRegressor (100 estimators, max_depth=12)...")
    model = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    model.fit(X, y)

    print("[Project TRISHUL] Feature Importances:")
    for col, imp in zip(X.columns, model.feature_importances_):
        print(f"  - {col}: {imp * 100:.2f}%")

    model_path = os.path.join(os.path.dirname(__file__), 'hci_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"[Project TRISHUL] Model successfully saved to {model_path}")

if __name__ == '__main__':
    train_and_export()
