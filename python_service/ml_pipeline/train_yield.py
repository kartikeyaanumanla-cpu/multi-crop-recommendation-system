import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import os

def train_yield_model(csv_path='crop_yield_dataset.csv', output_dir='.'):
    if not os.path.exists(csv_path):
        print(f"Error: Dataset not found at {csv_path}")
        return

    print("Loading yield dataset...")
    df = pd.read_csv(csv_path)

    # Features and Target according to cols.json:
    # ["Crop", "Rainfall", "Temperature", "Nitrogen", "Phosphorus", "Potassium", "pH", "Yield"]
    print("Preprocessing data...")
    
    # Encode categorical 'Crop'
    label_encoder = LabelEncoder()
    # Normalize crop text to title case so it acts stably
    df['Crop'] = df['Crop'].str.title()
    df['CropEncoded'] = label_encoder.fit_transform(df['Crop'])

    # Prepare features matrix X
    # Order of features is important! We'll use: CropEncoded, N, P, K, Temperature, Rainfall, pH
    X = df[['CropEncoded', 'Nitrogen', 'Phosphorus', 'Potassium', 'Temperature', 'Rainfall', 'pH']]
    y = df['Yield']

    # Scale the continuous variables (so we don't scale the categorical encoded crop, but for simplicity we can scale all or split them)
    # Standard scaler over all features.
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Split dataset
    print("Splitting data into train and test sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    # Train Regressor
    print("Training Random Forest Regressor...")
    rf_regressor = RandomForestRegressor(n_estimators=100, random_state=42)
    rf_regressor.fit(X_train, y_train)

    # Evaluate Model
    print("Evaluating model...")
    y_pred = rf_regressor.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print(f"\nModel Mean Squared Error: {mse:.2f}")
    print(f"Model R-squared Score: {r2:.2f}")

    # Save artifacts
    print(f"\nSaving model artifacts to {output_dir}...")
    os.makedirs(output_dir, exist_ok=True)
    
    model_path = os.path.join(output_dir, 'yield_rf_model.joblib')
    scaler_path = os.path.join(output_dir, 'yield_scaler.joblib')
    encoder_path = os.path.join(output_dir, 'yield_label_encoder.joblib')

    joblib.dump(rf_regressor, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(label_encoder, encoder_path)

    print("Done! Yield ML Artifacts saved successfully:")
    print(f" - {model_path}")
    print(f" - {scaler_path}")
    print(f" - {encoder_path}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_file = os.path.join(current_dir, 'crop_yield_dataset.csv')
    
    train_yield_model(csv_path=csv_file, output_dir=current_dir)
