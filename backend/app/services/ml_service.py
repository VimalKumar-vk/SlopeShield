from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor


MODEL_PATH = Path("models/risk_model.joblib")


def generate_synthetic_training_data(samples=2000):
    rng = np.random.default_rng(42)

    rainfall_24h = rng.uniform(0, 300, samples)
    rainfall_72h = rng.uniform(0, 600, samples)
    slope = rng.uniform(0, 60, samples)
    elevation = rng.uniform(0, 3000, samples)
    soil_moisture = rng.uniform(5, 100, samples)
    vegetation_index = rng.uniform(0.05, 0.95, samples)
    distance_to_road = rng.uniform(10, 5000, samples)
    distance_to_river = rng.uniform(10, 5000, samples)

    X = np.column_stack(
        [
            rainfall_24h,
            rainfall_72h,
            slope,
            elevation,
            soil_moisture,
            vegetation_index,
            distance_to_road,
            distance_to_river,
        ]
    )

    risk = (
        (rainfall_24h / 300) * 20
        + (rainfall_72h / 600) * 25
        + (slope / 60) * 20
        + (soil_moisture / 100) * 15
        + ((1 - vegetation_index) * 10)
        + ((1 - np.minimum(distance_to_road, 2000) / 2000) * 5)
        + ((1 - np.minimum(distance_to_river, 2000) / 2000) * 5)
    )

    noise = rng.normal(0, 4, samples)

    y = np.clip(risk + noise, 0, 100)

    return X, y


def train_model():
    X, y = generate_synthetic_training_data()

    model = RandomForestRegressor(
        n_estimators=150,
        random_state=42,
    )

    model.fit(X, y)

    MODEL_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(model, MODEL_PATH)

    return model


def load_model():
    if MODEL_PATH.exists():
        return joblib.load(MODEL_PATH)

    return train_model()


def predict_ml_risk(factors):
    model = load_model()

    features = np.array(
        [[
            factors["rainfall_24h"],
            factors["rainfall_72h"],
            factors["slope"],
            factors["elevation"],
            factors["soil_moisture"],
            factors["vegetation_index"],
            factors["distance_to_road"],
            factors["distance_to_river"],
        ]]
    )

    prediction = float(model.predict(features)[0])

    return round(
        float(np.clip(prediction, 0, 100)),
        2,
    )