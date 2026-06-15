# MediScanAI - Heart Disease Prediction System

MediScanAI is a heart-disease prediction project with a Flask ML backend and a restored premium Next.js frontend.

## Structure

- `run.py` - Flask backend, model training, evaluation, prediction history, and export logic
- `src/` - preprocessing, training, evaluation, and prediction helpers
- `models/` - serialized models and preprocessing artifacts
- `dataset/` - source dataset files
- `frontend/` - restored Next.js healthcare UI

## Backend

Install Python dependencies and run the backend:

```bash
pip install -r requirements.txt
python run.py
```

The Flask app now exposes JSON responses for the core routes instead of rendering HTML templates.

## Frontend

Install and start the Next.js app inside `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

## Notes

- The old Flask HTML/CSS presentation layer has been removed.
- Prediction history is still stored in `predictions.db`.
- Model artifacts remain under `models/` and can still be retrained or evaluated from the backend.
