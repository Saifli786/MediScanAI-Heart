import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from .preprocessing import load_and_preprocess_data, preprocess_for_training
import os

def train_models(test_size=0.2):
    # Load and preprocess data
    df = load_and_preprocess_data()
    X_train, X_test, y_train, y_test, scaler = preprocess_for_training(df, test_size=test_size)

    # Initialize models
    models = {
        'logistic_regression': LogisticRegression(max_iter=1000),
        'decision_tree': DecisionTreeClassifier(),
        'random_forest': RandomForestClassifier()
    }

    # Train models and save them
    if not os.path.exists('models'):
        os.makedirs('models')

    for name, model in models.items():
        model.fit(X_train, y_train)
        joblib.dump(model, f'models/{name}.joblib')

    # Save the scaler for preprocessing single predictions
    joblib.dump(scaler, 'models/scaler.joblib')

    # Save test data for evaluation
    joblib.dump((X_test, y_test), 'models/test_data.joblib')
