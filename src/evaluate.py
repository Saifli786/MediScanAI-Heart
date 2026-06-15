import joblib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, roc_curve
import os
import io
import base64

def evaluate_models():
    # Load test data
    X_test, y_test = joblib.load('models/test_data.joblib')

    # Load models
    model_names = ['logistic_regression', 'decision_tree', 'random_forest']
    models = {name: joblib.load(f'models/{name}.joblib') for name in model_names}

    results = {}

    for name, model in models.items():
        y_pred = model.predict(X_test)
        y_proba = model.predict_proba(X_test)[:, 1]

        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_proba)

        # Confusion matrix plot
        cm = confusion_matrix(y_test, y_pred)
        plt.figure(figsize=(5,4))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
        plt.title(f'{name} Confusion Matrix')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        cm_img = plot_to_img()

        # ROC curve plot
        fpr, tpr, _ = roc_curve(y_test, y_proba)
        plt.figure(figsize=(5,4))
        plt.plot(fpr, tpr, label=f'ROC curve (area = {roc_auc:.2f})')
        plt.plot([0, 1], [0, 1], 'k--')
        plt.title(f'{name} ROC Curve')
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.legend(loc='lower right')
        roc_img = plot_to_img()

        # Feature importance plot (if available)
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            features = X_test.columns
            plt.figure(figsize=(6,4))
            sns.barplot(x=importances, y=features)
            plt.title(f'{name} Feature Importance')
            plt.xlabel('Importance')
            plt.ylabel('Feature')
            fi_img = plot_to_img()
        else:
            fi_img = None

        results[name] = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'roc_auc': roc_auc,
            'confusion_matrix_img': cm_img,
            'roc_curve_img': roc_img,
            'feature_importance_img': fi_img
        }

    return results

def plot_to_img():
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close()
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    return img_base64
