import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import os

def train_model(csv_path='Crop_recommendation.csv', output_dir='.'):
    # Check if data exists
    if not os.path.exists(csv_path):
        print(f"Error: Dataset not found at {csv_path}")
        print("Please download 'Crop_recommendation.csv' from Kaggle and place it in the same directory.")
        return

    print("Loading data...")
    df = pd.read_csv(csv_path)

    # Features and Target
    X = df[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
    y = df['label']

    print("Preprocessing data...")
    # 1. Label Encoding for the target variable (crops)
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    # 2. Feature Scaling
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Split the dataset
    print("Splitting data into train and test sets...")
    # stratify=y_encoded ensures both training and test sets have the same proportion of each crop
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )

    # Initialize and Train the Model
    print("Training Random Forest Classifier...")
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)

    # Evaluate the Model
    print("Evaluating model...")
    y_pred = rf_model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nModel Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report (Test Data):")
    
    # We use label_encoder.classes_ to get the original crop names back for the report
    print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

    # Save the artifacts
    print(f"\nSaving model artifacts to {output_dir}...")
    os.makedirs(output_dir, exist_ok=True)
    
    model_path = os.path.join(output_dir, 'crop_rf_model.joblib')
    scaler_path = os.path.join(output_dir, 'feature_scaler.joblib')
    encoder_path = os.path.join(output_dir, 'label_encoder.joblib')

    joblib.dump(rf_model, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump(label_encoder, encoder_path)

    print("Done! ML Artifacts saved successfully:")
    print(f" - {model_path}")
    print(f" - {scaler_path}")
    print(f" - {encoder_path}")

if __name__ == "__main__":
    # By default, looks for the CSV in the same folder and saves models there too.
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_file = os.path.join(current_dir, 'Crop_recommendation.csv')
    
    train_model(csv_path=csv_file, output_dir=current_dir)
