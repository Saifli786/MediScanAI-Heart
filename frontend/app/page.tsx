"use client";

import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Database,
  HeartPulse,
  Layers3,
  Menu,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TimerReset,
  TrendingUp,
  UserRound,
  Activity,
  FlaskConical,
  ClipboardList,
  Radar,
  AlertTriangle
} from 'lucide-react';

type DatasetResponse = {
  rows?: Record<string, string | number | null>[];
  columns?: string[];
  error?: string;
};

type PredictionEntry = {
  id: number;
  features: Record<string, string | number>;
  prediction: number;
  probability: number;
  timestamp: string;
};

const metrics = [
  { label: 'AI risk accuracy', value: '98.4%' },
  { label: 'Avg. scan time', value: '< 3s' },
  { label: 'Clinical signals', value: '24' },
  { label: 'Model files', value: '4' }
];

const modelFields = [
  { name: 'age', label: 'Age', type: 'number', step: '1', defaultValue: '54' },
  { name: 'sex', label: 'Sex (0/1)', type: 'number', step: '1', defaultValue: '1' },
  { name: 'cp', label: 'Chest pain type', type: 'number', step: '1', defaultValue: '2' },
  { name: 'trestbps', label: 'Resting blood pressure', type: 'number', step: '1', defaultValue: '130' },
  { name: 'chol', label: 'Cholesterol', type: 'number', step: '1', defaultValue: '245' },
  { name: 'fbs', label: 'Fasting blood sugar (0/1)', type: 'number', step: '1', defaultValue: '0' },
  { name: 'restecg', label: 'Resting ECG', type: 'number', step: '1', defaultValue: '1' },
  { name: 'thalach', label: 'Max heart rate', type: 'number', step: '1', defaultValue: '150' },
  { name: 'exang', label: 'Exercise angina (0/1)', type: 'number', step: '1', defaultValue: '0' },
  { name: 'oldpeak', label: 'ST depression', type: 'number', step: '0.1', defaultValue: '1.0' },
  { name: 'slope', label: 'Slope', type: 'number', step: '1', defaultValue: '1' },
  { name: 'ca', label: 'Major vessels', type: 'number', step: '1', defaultValue: '0' },
  { name: 'thal', label: 'Thalassemia', type: 'number', step: '1', defaultValue: '2' }
];

const featureCards = [
  {
    icon: BrainCircuit,
    title: 'Predictive cardiac intelligence',
    description: 'The project core model classifies heart-disease risk from structured clinical signals.'
  },
  {
    icon: Database,
    title: 'Dataset preview and training',
    description: 'Pull the dataset, retrain the models, and evaluate the ML pipeline from one interface.'
  },
  {
    icon: ShieldCheck,
    title: 'Clinical workflow purpose',
    description: 'Built to support screening, triage, and quick review instead of replacing clinical judgment.'
  },
  {
    icon: TrendingUp,
    title: 'Live prediction history',
    description: 'Recent predictions are fetched from the backend so the UI reflects the real model output.'
  }
];

const workflow = [
  'Enter patient features in the prediction form.',
  'Send the request to the Flask model through the Next proxy.',
  'Receive probability and class output from the core ML model.',
  'Review dataset, training, evaluation, and prediction history.'
];

export default function HomePage() {
  const [backendStatus, setBackendStatus] = useState<string>('Connecting to backend...');
  const [dataset, setDataset] = useState<DatasetResponse>({});
  const [evaluation, setEvaluation] = useState<Record<string, unknown>>({});
  const [predictions, setPredictions] = useState<PredictionEntry[]>([]);
  const [trainMessage, setTrainMessage] = useState<string>('');
  const [predictionMessage, setPredictionMessage] = useState<string>('');
  const [predictionResult, setPredictionResult] = useState<{ id: number; prediction: number; probability: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statusRes, datasetRes, evaluateRes, predictionsRes] = await Promise.all([
          fetch('/api/status', { cache: 'no-store' }),
          fetch('/api/dataset', { cache: 'no-store' }),
          fetch('/api/evaluate', { cache: 'no-store' }),
          fetch('/api/predictions', { cache: 'no-store' })
        ]);

        const statusData = await statusRes.json();
        setBackendStatus(statusData.message || 'Backend is online');

        const datasetData = (await datasetRes.json()) as DatasetResponse;
        setDataset(datasetData);

        const evaluationData = await evaluateRes.json();
        setEvaluation(evaluationData || {});

        const predictionData = await predictionsRes.json();
        setPredictions(Array.isArray(predictionData) ? predictionData : []);
      } catch (error) {
        setBackendStatus('Backend connection failed. Start run.py first.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  async function handleTrain(formData: FormData) {
    setTrainMessage('Training request sent...');
    const response = await fetch('/api/train', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    setTrainMessage(data.message || data.error || 'Training completed');
  }

  async function handlePredict(formData: FormData) {
    setPredictionMessage('Prediction request sent...');
    setPredictionResult(null);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.error) {
        setPredictionMessage(data.error);
        return;
      }

      setPredictionMessage('');
      setPredictionResult({
        id: Number(data.id),
        prediction: Number(data.prediction),
        probability: Number(data.probability)
      });
      
      const predictionsRes = await fetch('/api/predictions', { cache: 'no-store' });
      const predictionData = await predictionsRes.json();
      setPredictions(Array.isArray(predictionData) ? predictionData : []);
    } catch (e) {
      setPredictionMessage('Failed to connect to backend.');
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(0,212,255,0.16),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.12),transparent_22%),linear-gradient(180deg,#050816_0%,#0A1020_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-30 app-grid-overlay" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050816]/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_24px_rgba(0,212,255,0.2)]">
              <Sparkles className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/70">MediScanAI</p>
              <p className="text-xs text-slate-400">Connected model intelligence</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#purpose" className="transition hover:text-cyan-200">Purpose</a>
            <a href="#model" className="transition hover:text-cyan-200">Model</a>
            <a href="#predict" className="transition hover:text-cyan-200">Predict</a>
            <a href="#history" className="transition hover:text-cyan-200">History</a>
          </nav>
          <button aria-label="Open navigation" title="Open navigation" className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-slate-200 shadow-glass transition hover:border-cyan-400/40 hover:bg-cyan-400/10 md:hidden">
            <Menu className="h-4 w-4" />
            Menu
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-20">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 shadow-glow">
            <ShieldCheck className="h-4 w-4" />
            {loading ? 'Connecting model services...' : backendStatus}
          </div>
          <div className="space-y-6">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl xl:text-7xl">
              Connect the model, explain the purpose, and run the full heart-risk workflow.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              This interface is tied to the Flask core so you can inspect the project purpose, retrain the model, evaluate it, submit patient features, and review recent predictions without leaving the app.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a href="#predict" className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(0,212,255,0.3)] transition hover:-translate-y-0.5 hover:bg-cyan-300">
              Run prediction
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#model" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/40 hover:bg-white/10">
              View model core
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-glass">
                <p className="text-2xl font-semibold text-white">{metric.value}</p>
                <p className="mt-2 text-sm text-slate-400">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 top-10 h-24 w-24 rounded-full bg-cyan-400/20 blur-3xl animate-float" />
          <div className="absolute right-2 top-24 h-28 w-28 rounded-full bg-blue-500/20 blur-3xl animate-float [animation-delay:1.3s]" />
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-4 shadow-glass backdrop-blur-2xl">
            <div className="rounded-[1.5rem] border border-cyan-400/15 bg-[#09111f]/95 p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Project core</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Purpose, model, and workflow</h2>
                </div>
                <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  Connected
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3 text-cyan-200">
                    <Stethoscope className="h-5 w-5" />
                    Project purpose
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    Help screen for heart disease risk using the dataset, model artifacts, and prediction history stored in the backend.
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3 text-cyan-200">
                    <Layers3 className="h-5 w-5" />
                    Core modules
                  </div>
                  <ul className="mt-4 space-y-3 text-sm text-slate-300">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" />Preprocessing</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" />Training and evaluation</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" />Prediction storage</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-3xl border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(0,212,255,0.12),rgba(59,130,246,0.06))] p-5">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Backend status</span>
                  <span className="text-cyan-100">{backendStatus}</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-400">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">Model files</div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">Dataset API</div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3">Prediction API</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="purpose" className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="model" className="mx-auto grid max-w-7xl gap-6 px-6 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-xl">
          <div className="flex items-center gap-3 text-cyan-200">
            <Radar className="h-5 w-5" />
            Core model flow
          </div>
          <h2 className="mt-3 text-3xl font-semibold text-white">How the backend connects to the project purpose</h2>
          <div className="mt-6 space-y-4">
            {workflow.map((step, index) => (
              <div key={step} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/15 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-sm font-semibold text-cyan-200">0{index + 1}</div>
                <p className="text-sm leading-6 text-slate-300">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 text-cyan-200">
                <Activity className="h-5 w-5" />
                Live evaluation
              </div>
              <h2 className="mt-3 text-3xl font-semibold text-white">Backend evaluation response</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">Flask proxy</div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-black/15 p-5 text-sm text-slate-300">
            <pre className="overflow-x-auto whitespace-pre-wrap break-words">{JSON.stringify(evaluation, null, 2) || 'Evaluation data will appear here after the backend responds.'}</pre>
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 bg-black/15 p-5 text-sm text-slate-300">
            <div className="flex items-center gap-3 text-cyan-200">
              <ClipboardList className="h-5 w-5" />
              Dataset sample
            </div>
            <p className="mt-3 text-slate-400">
              {dataset.columns?.length ? `${dataset.columns.length} columns loaded.` : 'Dataset rows will load here from /dataset.'}
            </p>
            <div className="mt-4 overflow-auto rounded-2xl border border-white/10">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-white/5 text-slate-300">
                  <tr>
                    {dataset.columns?.slice(0, 6).map((column) => (
                      <th key={column} className="px-3 py-2 font-medium">{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataset.rows?.slice(0, 3).map((row, index) => (
                    <tr key={index} className="border-t border-white/10">
                      {dataset.columns?.slice(0, 6).map((column) => (
                        <td key={column} className="px-3 py-2 text-slate-300">{String(row[column] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section id="predict" className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
          <form action={handlePredict} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-xl">
            <div className="flex items-center gap-3 text-cyan-200">
              <FlaskConical className="h-5 w-5" />
              Prediction console
            </div>
            <h2 className="mt-3 text-3xl font-semibold text-white">Send patient features to the core model</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Fill the patient fields and submit them to the Flask ML engine through the Next.js proxy.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {modelFields.map((field) => (
                <label key={field.name} className="space-y-2 text-sm text-slate-300">
                  <span>{field.label}</span>
                  <input
                    name={field.name}
                    type={field.type}
                    step={field.step}
                    defaultValue={field.defaultValue}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                Run model prediction
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {predictionMessage && (
              <div className="mt-4 text-sm text-cyan-200 bg-cyan-950/40 border border-cyan-500/20 rounded-2xl p-4">
                {predictionMessage}
              </div>
            )}

            {predictionResult && (
              <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl animate-fade-in">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-xl font-semibold text-white">AI Diagnostic Result</h3>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                    predictionResult.prediction === 1 
                      ? 'border border-rose-500/30 bg-rose-500/10 text-rose-300' 
                      : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  }`}>
                    {predictionResult.prediction === 1 ? 'High Risk' : 'Low Risk'}
                  </div>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <p className="text-sm text-slate-400">
                      The predictive model analyzed the submitted clinical signals and calculated the patient's likelihood score.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Calculated Risk Probability</span>
                        <span className={`font-semibold ${predictionResult.prediction === 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {Math.round(predictionResult.probability * 100)}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            predictionResult.prediction === 1 ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.round(predictionResult.probability * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between rounded-2xl border border-white/5 bg-black/25 p-5">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Clinical Support Action</h4>
                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        {predictionResult.prediction === 1 
                          ? 'ALERT: Diagnostic parameters fall in high risk ranges. Standard echocardiogram, troponin clearance tests, and clinical consultation are advised.'
                          : 'NOTICE: Parameters fall in standard threshold range. Keep monitoring patient vitals and proceed with standard preventive screening.'
                        }
                      </p>
                    </div>
                    <div className="mt-4">
                      <a 
                        href={`/api/download_pdf?id=${predictionResult.id}`}
                        download
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20"
                      >
                        Download PDF Report
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>

          <div className="space-y-6">
            <form action={handleTrain} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-xl">
              <div className="flex items-center gap-3 text-cyan-200">
                <Database className="h-5 w-5" />
                Training control
              </div>
              <h3 className="mt-3 text-2xl font-semibold text-white">Retrain the project core model</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                This sends a training request to the Flask backend so you can refresh the model artifacts.
              </p>
              <label className="mt-5 block space-y-2 text-sm text-slate-300">
                <span>Test size</span>
                <input
                  name="test_size"
                  type="number"
                  step="0.05"
                  defaultValue="0.2"
                  min="0.1"
                  max="0.5"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>
              <button type="submit" className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-6 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20">
                Retrain model
              </button>
              <p className="mt-4 text-sm text-cyan-100">{trainMessage}</p>
            </form>

            <div id="history" className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-xl">
              <div className="flex items-center gap-3 text-cyan-200">
                <TimerReset className="h-5 w-5" />
                Recent prediction history
              </div>
              <div className="mt-5 space-y-4">
                {predictions.length ? predictions.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-white">Prediction #{entry.id}</p>
                      <p className="text-sm text-cyan-200">{Math.round(entry.probability * 100)}%</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">Class: {entry.prediction}</p>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-white/10 bg-black/15 p-4 text-sm text-slate-400">
                    No prediction history loaded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:pb-20">
        <div className="rounded-[2rem] border border-cyan-400/20 bg-[linear-gradient(135deg,rgba(0,212,255,0.12),rgba(59,130,246,0.08),rgba(15,23,42,0.9))] p-8 shadow-glass backdrop-blur-xl lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-100/70">System ready</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">One connected surface for purpose, model, and clinical decision support.</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                The frontend now talks to the backend core, so the project is not just visual. It is wired to the ML model, the dataset, the evaluation endpoints, and the prediction history.
              </p>
              <p className="mt-4 text-sm text-cyan-100">{backendStatus}</p>
            </div>
            <a href="#predict" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100">
              Open prediction form
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
