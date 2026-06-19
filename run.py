from flask import Flask, request, send_from_directory, jsonify, session, g
import os
import sqlite3
import json
from datetime import datetime
from flask_babel import Babel, gettext as localeselector
from src.preprocessing import load_and_preprocess_data
from src.train import train_models
from src.evaluate import evaluate_models
from src.predict import predict_heart_disease
import pandas as pd
import subprocess
import time
import webbrowser
import threading
import socket
import atexit
import sys

from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.secret_key = 'your_secret_key_here'  # Change this in production
app.config['BABEL_DEFAULT_LOCALE'] = 'en'
app.config['BABEL_TRANSLATION_DIRECTORIES'] = 'translations'

def get_locale():
    return session.get('lang', 'en')

babel = Babel(app, locale_selector=get_locale)

# Ensure models directory exists
if not os.path.exists('models'):
    os.makedirs('models')

# Database setup
DATABASE = 'predictions.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        db.execute('''CREATE TABLE IF NOT EXISTS predictions
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      features TEXT NOT NULL,
                      prediction INTEGER NOT NULL,
                      probability REAL NOT NULL,
                      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)''')
        db.commit()

# Initialize database
init_db()

@app.route('/')
def index():
    return jsonify({
        'message': 'MediScanAI backend is running.',
        'frontend': 'Use the Next.js app in /frontend for the UI.',
        'endpoints': ['/dataset', '/train', '/evaluate', '/predict', '/get_predictions', '/download_history/csv']
    })

@app.route('/dataset')
def dataset():
    try:
        data = load_and_preprocess_data()
        return jsonify({
            'rows': data.head(10).to_dict(orient='records'),
            'columns': list(data.columns)
        })
    except Exception as e:
        return jsonify({'error': f'Error loading dataset: {str(e)}'}), 500

@app.route('/train', methods=['GET', 'POST'])
def train():
    if request.method == 'POST':
        try:
            test_size = float(request.form.get('test_size', 0.2))
            train_models(test_size=test_size)
            return jsonify({'message': 'Models trained successfully', 'next': '/evaluate'})
        except Exception as e:
            return jsonify({'error': f'Error training models: {str(e)}'}), 500
    return jsonify({'message': 'POST to this endpoint with test_size to train models.'})

@app.route('/evaluate')
def evaluate():
    try:
        results = evaluate_models()
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': f'Error evaluating models: {str(e)}'}), 500

@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        try:
            # Get form data
            features = {
                'age': float(request.form['age']),
                'sex': int(request.form['sex']),
                'cp': int(request.form['cp']),
                'trestbps': float(request.form['trestbps']),
                'chol': float(request.form['chol']),
                'fbs': int(request.form['fbs']),
                'restecg': int(request.form['restecg']),
                'thalach': float(request.form['thalach']),
                'exang': int(request.form['exang']),
                'oldpeak': float(request.form['oldpeak']),
                'slope': int(request.form['slope']),
                'ca': int(request.form['ca']),
                'thal': int(request.form['thal'])
            }
            prediction, probability = predict_heart_disease(features)

            # Store prediction in database
            db = get_db()
            cursor = db.execute('INSERT INTO predictions (features, prediction, probability) VALUES (?, ?, ?)',
                       (json.dumps(features), int(prediction), float(probability)))
            db.commit()
            prediction_id = cursor.lastrowid

            return jsonify({
                'id': prediction_id,
                'prediction': int(prediction),
                'probability': float(probability)
            })
        except Exception as e:
            return jsonify({'error': f'Error making prediction: {str(e)}'}), 500
    return jsonify({'message': 'POST patient features to receive a prediction.'})

@app.route('/get_predictions')
def get_predictions():
    db = get_db()
    cur = db.execute('SELECT id, features, prediction, probability, timestamp FROM predictions ORDER BY timestamp DESC LIMIT 10')
    predictions = cur.fetchall()
    return jsonify([{
        'id': row[0],
        'features': json.loads(row[1]),
        'prediction': row[2],
        'probability': row[3],
        'timestamp': row[4]
    } for row in predictions])

@app.route('/download_history/<format>')
def download_history(format):
    db = get_db()
    cur = db.execute('SELECT * FROM predictions ORDER BY timestamp DESC')
    rows = cur.fetchall()

    df = pd.DataFrame(rows, columns=['id', 'features', 'prediction', 'probability', 'timestamp'])
    df['features'] = df['features'].apply(json.loads)

    # Create an "exports" folder if not exists
    export_dir = os.path.join(os.getcwd(), 'exports')
    os.makedirs(export_dir, exist_ok=True)

    if format == 'csv':
        file_path = os.path.join(export_dir, 'prediction_history.csv')
        df.to_csv(file_path, index=False)
        return send_from_directory(
            export_dir,
            'prediction_history.csv',
            as_attachment=True,
            mimetype='text/csv'
        )

    elif format in ['xlsx', 'excel']:
        file_path = os.path.join(export_dir, 'prediction_history.xlsx')
        df.to_excel(file_path, index=False)
        return send_from_directory(
            export_dir,
            'prediction_history.xlsx',
            as_attachment=True,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

    else:
        return "Unsupported format", 400


@app.route('/download_pdf/<int:pred_id>')
def download_pdf(pred_id):
    try:
        db = get_db()
        cur = db.execute('SELECT features, prediction, probability, timestamp FROM predictions WHERE id = ?', (pred_id,))
        row = cur.fetchone()
        if not row:
            return "Prediction report not found", 404
        
        features = json.loads(row[0])
        prediction = row[1]
        probability = row[2]
        timestamp = row[3]
        
        from io import BytesIO
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                                rightMargin=40, leftMargin=40,
                                topMargin=40, bottomMargin=40)
        
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=24,
            leading=28,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=6
        )
        
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=12,
            textColor=colors.HexColor('#00d4ff'),
            spaceAfter=20
        )
        
        h2_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#1e293b'),
            spaceBefore=14,
            spaceAfter=8,
            keepWithNext=True
        )
        
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#334155')
        )
        
        label_style = ParagraphStyle(
            'TableLabel',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=11,
            textColor=colors.HexColor('#475569')
        )
        
        value_style = ParagraphStyle(
            'TableValue',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=11,
            textColor=colors.HexColor('#0f172a')
        )
        
        story = []
        
        story.append(Paragraph("MEDISCAN AI", title_style))
        story.append(Paragraph("HEART DISEASE RISK ASSESSMENT REPORT", subtitle_style))
        story.append(Spacer(1, 10))
        
        meta_data = [
            [Paragraph("Report ID:", label_style), Paragraph(f"MS-HR-{pred_id:06d}", value_style),
             Paragraph("Date & Time:", label_style), Paragraph(str(timestamp), value_style)]
        ]
        meta_table = Table(meta_data, colWidths=[80, 150, 100, 200])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('PADDING', (0,0), (-1,-1), 8),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LINEBELOW', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
            ('LINEABOVE', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 15))
        
        story.append(Paragraph("Risk Assessment Result", h2_style))
        
        risk_class = "HIGH RISK OF HEART DISEASE" if prediction == 1 else "LOW RISK OF HEART DISEASE"
        risk_color = '#ef4444' if prediction == 1 else '#10b981'
        
        result_desc_style = ParagraphStyle(
            'ResultDesc',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=20,
            textColor=colors.HexColor(risk_color)
        )
        
        prob_desc_style = ParagraphStyle(
            'ProbDesc',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#1e293b')
        )
        
        result_data = [
            [Paragraph("Result Classification:", label_style), Paragraph(risk_class, result_desc_style)],
            [Paragraph("Confidence / Probability:", label_style), Paragraph(f"{probability * 100:.2f}% risk of heart disease computed by the AI model.", prob_desc_style)]
        ]
        
        result_table = Table(result_data, colWidths=[130, 400])
        result_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
            ('PADDING', (0,0), (-1,-1), 12),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LINEBELOW', (0,0), (-1,-1), 1.5, colors.HexColor(risk_color)),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ]))
        story.append(result_table)
        story.append(Spacer(1, 15))
        
        story.append(Paragraph("Patient Clinical Signals", h2_style))
        
        feature_mapping = {
            'age': ('Age', 'years'),
            'sex': ('Sex', '1 = Male, 0 = Female'),
            'cp': ('Chest Pain Type', '0 = Typical, 1 = Atypical, 2 = Non-Anginal, 3 = Asymptomatic'),
            'trestbps': ('Resting Blood Pressure', 'mm Hg'),
            'chol': ('Serum Cholesterol', 'mg/dl'),
            'fbs': ('Fasting Blood Sugar', '1 = >120 mg/dl, 0 = <=120 mg/dl'),
            'restecg': ('Resting ECG Result', '0 = Normal, 1 = ST-T Wave abnormality, 2 = Left ventricular hypertrophy'),
            'thalach': ('Max Heart Rate Achieved', 'bpm'),
            'exang': ('Exercise Induced Angina', '1 = Yes, 0 = No'),
            'oldpeak': ('ST Depression', 'ST depression induced by exercise relative to rest'),
            'slope': ('ST Slope Type', '0 = Upsloping, 1 = Flat, 2 = Downsloping'),
            'ca': ('Number of Major Vessels', '0-3 colored by fluoroscopy'),
            'thal': ('Thalassemia Type', '1 = Normal, 2 = Fixed defect, 3 = Reversible defect')
        }
        
        signals_data = []
        signals_data.append([
            Paragraph("Clinical Signal", label_style),
            Paragraph("Value Provided", label_style),
            Paragraph("Context / Description", label_style)
        ])
        
        for key, (label, desc) in feature_mapping.items():
            val = features.get(key, 'N/A')
            if key == 'sex':
                val_str = "Male" if val == 1 else "Female"
            elif key == 'fbs':
                val_str = "> 120 mg/dl" if val == 1 else "<= 120 mg/dl"
            elif key == 'exang':
                val_str = "Yes" if val == 1 else "No"
            else:
                val_str = str(val)
                
            signals_data.append([
                Paragraph(label, body_style),
                Paragraph(val_str, value_style),
                Paragraph(desc, value_style)
            ])
            
        signals_table = Table(signals_data, colWidths=[160, 100, 270])
        signals_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
            ('PADDING', (0,0), (-1,-1), 5),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(signals_table)
        story.append(Spacer(1, 20))
        
        disclaimer_style = ParagraphStyle(
            'Disclaimer',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#64748b')
        )
        story.append(Paragraph(
            "Disclaimer: This report was generated using the MediScanAI heart-disease risk prediction machine learning model. "
            "It is intended for clinical screening, triage, and educational support purposes. This does not constitute an "
            "official medical diagnosis and should not replace professional clinical evaluation or advice by a qualified cardiologist.",
            disclaimer_style
        ))
        
        doc.build(story)
        buffer.seek(0)
        
        from flask import Response
        return Response(buffer.getvalue(), mimetype='application/pdf',
                        headers={'Content-Disposition': f'attachment;filename=mediscan_report_{pred_id}.pdf'})
    except Exception as e:
        return f"Error generating report: {str(e)}", 500



# @app.route('/download_history/<format>')
# def download_history(format):
#     import pandas as pd
#     from io import BytesIO

#     db = get_db()
#     cur = db.execute('SELECT * FROM predictions ORDER BY timestamp DESC')
#     rows = cur.fetchall()

#     df = pd.DataFrame(rows, columns=['id', 'features', 'prediction', 'probability', 'timestamp'])
#     df['features'] = df['features'].apply(json.loads)

#     if format == 'csv':
#         output = BytesIO()
#         df.to_csv(output, index=False)
#         output.seek(0)
#         return send_from_directory('.', 'predictions.csv', as_attachment=True, mimetype='text/csv')
#     elif format == 'excel':
#         output = BytesIO()
#         with pd.ExcelWriter(output, engine='openpyxl') as writer:
#             df.to_excel(writer, index=False)
#         output.seek(0)
#         return send_from_directory('.', 'predictions.xlsx', as_attachment=True, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')






@app.route('/set_language/<lang>')
def set_language(lang):
    session['lang'] = lang
    return jsonify({'language': lang})

@app.route('/toggle_theme')
def toggle_theme():
    current_theme = session.get('theme', 'light')
    session['theme'] = 'dark' if current_theme == 'light' else 'light'
    return jsonify({'theme': session['theme']})

@app.route('/static/images/<path:filename>')
def serve_image(filename):
    return send_from_directory('static/images', filename)

frontend_process = None

def is_port_open(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def kill_frontend():
    global frontend_process
    if frontend_process:
        print("[+] Stopping Next.js frontend server...")
        try:
            if sys.platform == 'win32':
                subprocess.run(['taskkill', '/F', '/T', '/PID', str(frontend_process.pid)],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            else:
                frontend_process.terminate()
        except Exception:
            try:
                frontend_process.terminate()
            except Exception:
                pass
        frontend_process = None
        print("[+] Next.js frontend server stopped.")

atexit.register(kill_frontend)

def check_and_retrain_models():
    """
    Check if the trained models are compatible with the current scikit-learn version.
    If there is a mismatch or if the models are missing, retrain them.
    """
    import warnings
    from sklearn.exceptions import InconsistentVersionWarning
    
    models_to_check = ['logistic_regression', 'decision_tree', 'random_forest', 'scaler']
    retrain_needed = False
    
    # Check if files exist. If not, we definitely need to train.
    for name in models_to_check:
        path = os.path.join('models', f'{name}.joblib')
        if not os.path.exists(path):
            retrain_needed = True
            break
            
    if not retrain_needed:
        # Check for InconsistentVersionWarning by attempting to load them inside a warnings catch filter
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always", InconsistentVersionWarning)
            try:
                import joblib
                for name in models_to_check:
                    joblib.load(os.path.join('models', f'{name}.joblib'))
                # If any warning was caught, we need to retrain
                for warning in w:
                    if issubclass(warning.category, InconsistentVersionWarning):
                        retrain_needed = True
                        break
            except Exception:
                # If loading fails entirely for any reason, retrain
                retrain_needed = True

    if retrain_needed:
        print("[*] Scikit-learn version mismatch or missing models detected. Retraining models to match current environment...")
        try:
            from src.train import train_models
            train_models()
            print("[+] Models successfully retrained and saved.")
        except Exception as e:
            print(f"[!] Failed to automatically retrain models: {e}")

def start_frontend_and_browser():
    global frontend_process
    
    # Do not spawn frontend process in production/Render or if explicit bypass is set
    if (os.environ.get('RENDER') == 'true' or 
        os.environ.get('FLASK_ENV') == 'production' or 
        os.environ.get('SKIP_FRONTEND') == 'true'):
        print("[*] Skipping automatic frontend start (production/Render/SKIP_FRONTEND env detected).")
        return

    # Only run this in the main reloader parent process, not the child reloader process.
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        return

    frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend')
    node_modules_dir = os.path.join(frontend_dir, 'node_modules')

    # 1. Install dependencies if they are missing
    if not os.path.exists(node_modules_dir):
        print("[-] Next.js node_modules not found. Installing dependencies (this may take a minute)...")
        try:
            subprocess.run('npm install', cwd=frontend_dir, shell=True, check=True)
            print("[+] Dependencies installed successfully.")
        except Exception as e:
            print(f"[!] Failed to run npm install: {e}")
            print("[!] Please run 'npm install' inside the 'frontend' directory manually.")
            return

    # 2. Start Next.js development server
    print("[+] Starting Next.js frontend server...")
    try:
        frontend_process = subprocess.Popen('npm run dev', cwd=frontend_dir, shell=True)
    except Exception as e:
        print(f"[!] Failed to start Next.js frontend server: {e}")
        return

    # 3. Wait for the port 3000 to be open, then open the browser
    print("[-] Waiting for Next.js to start on http://localhost:3000 ...")
    retries = 30
    while retries > 0:
        if is_port_open(3000):
            print("[+] Next.js is online! Opening web interface in your browser...")
            webbrowser.open('http://localhost:3000')
            break
        time.sleep(1)
        retries -= 1
    else:
        print("[!] Next.js server start timeout. Please open http://localhost:3000 manually.")

if __name__ == '__main__':
    # Retrain models if needed in the parent process to avoid double execution
    if os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
        check_and_retrain_models()

    t = threading.Thread(target=start_frontend_and_browser)
    t.daemon = True
    t.start()

    try:
        app.run(debug=True, port=5001)
    except KeyboardInterrupt:
        kill_frontend()
