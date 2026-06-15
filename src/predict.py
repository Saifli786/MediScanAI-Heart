import joblib
from .preprocessing import preprocess_single_prediction

def predict_heart_disease(features):
    """
    Make a single prediction for heart disease.
    """
    # Load the best model (random forest as default)
    model = joblib.load('models/random_forest.joblib')
    scaler = joblib.load('models/scaler.joblib')

    # Preprocess the input
    processed_features = preprocess_single_prediction(features, scaler)

    # Make prediction
    prediction = model.predict(processed_features)[0]
    probability = model.predict_proba(processed_features)[0][1]

    return prediction, probability
