import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import os

def load_and_preprocess_data():
    """
    Load the UCI Heart Disease dataset and preprocess it.
    """
    import os
    # Path to the dataset
    dataset_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'dataset', 'heart_disease_prediction_dataset', 'processed.cleveland.data')

    # Column names based on the dataset description
    columns = [
        'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg',
        'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'num'
    ]

    # Load the data
    df = pd.read_csv(dataset_path, header=None, names=columns, na_values='?')

    # Handle missing values
    df = df.dropna()

    # Convert target to binary (0: no disease, 1: disease present)
    df['target'] = (df['num'] > 0).astype(int)

    # Drop the original num column
    df = df.drop('num', axis=1)

    # Convert categorical columns to appropriate types
    categorical_cols = ['sex', 'cp', 'fbs', 'restecg', 'exang', 'slope', 'ca', 'thal']
    for col in categorical_cols:
        df[col] = df[col].astype(int)

    return df

def preprocess_for_training(df, test_size=0.2, random_state=42):
    """
    Preprocess data for model training.
    """
    # Separate features and target
    X = df.drop('target', axis=1)
    y = df['target']

    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    # Scale numerical features
    numerical_cols = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak']
    scaler = StandardScaler()
    X_train[numerical_cols] = scaler.fit_transform(X_train[numerical_cols])
    X_test[numerical_cols] = scaler.transform(X_test[numerical_cols])

    return X_train, X_test, y_train, y_test, scaler

def preprocess_single_prediction(features, scaler):
    """
    Preprocess a single prediction input.
    """
    # Convert to DataFrame
    df = pd.DataFrame([features])

    # Scale numerical features
    numerical_cols = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak']
    df[numerical_cols] = scaler.transform(df[numerical_cols])

    return df
