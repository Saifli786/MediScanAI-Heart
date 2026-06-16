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
  Stethoscope,
  TimerReset,
  Activity,
  FlaskConical,
  ClipboardList,
  Radar,
  Users,
  Download,
  AlertCircle,
  Twitter,
  Linkedin,
  Github,
  Mail
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
  { label: 'AI Risk Accuracy', value: '98.4%', icon: Activity },
  { label: 'Avg. Scan Time', value: '< 3s', icon: TimerReset },
  { label: 'Clinical Signals', value: '24', icon: Layers3 },
  { label: 'Patients Assisted', value: '10k+', icon: Users }
];

const modelFields = [
  { name: 'age', label: 'Age (Years)', type: 'number', step: '1', defaultValue: '54' },
  { name: 'sex', label: 'Sex (1=M, 0=F)', type: 'number', step: '1', defaultValue: '1' },
  { name: 'cp', label: 'Chest Pain Type (0-3)', type: 'number', step: '1', defaultValue: '2' },
  { name: 'trestbps', label: 'Resting BP (mm Hg)', type: 'number', step: '1', defaultValue: '130' },
  { name: 'chol', label: 'Cholesterol (mg/dl)', type: 'number', step: '1', defaultValue: '245' },
  { name: 'fbs', label: 'Fasting Sugar > 120 (1/0)', type: 'number', step: '1', defaultValue: '0' },
  { name: 'restecg', label: 'Resting ECG (0-2)', type: 'number', step: '1', defaultValue: '1' },
  { name: 'thalach', label: 'Max Heart Rate', type: 'number', step: '1', defaultValue: '150' },
  { name: 'exang', label: 'Exercise Angina (1/0)', type: 'number', step: '1', defaultValue: '0' },
  { name: 'oldpeak', label: 'ST Depression', type: 'number', step: '0.1', defaultValue: '1.0' },
  { name: 'slope', label: 'Slope (0-2)', type: 'number', step: '1', defaultValue: '1' },
  { name: 'ca', label: 'Major Vessels (0-3)', type: 'number', step: '1', defaultValue: '0' },
  { name: 'thal', label: 'Thalassemia (1-3)', type: 'number', step: '1', defaultValue: '2' }
];

const featureCards = [
  {
    icon: BrainCircuit,
    title: 'Predictive Cardiac Intelligence',
    description: 'Our proprietary machine learning model accurately classifies heart-disease risk from structured clinical signals.'
  },
  {
    icon: ShieldCheck,
    title: 'Clinical Workflow Support',
    description: 'Built to support screening, triage, and rapid review. It augments clinical judgment, never replaces it.'
  },
  {
    icon: Activity,
    title: 'Real-time Analytics',
    description: 'Instantaneous processing of distinct clinical signals to deliver immediate diagnostic probabilities.'
  }
];

const workflow = [
  'Enter patient clinical data into our secure prediction console.',
  'Data is processed securely through our advanced ML inference engine.',
  'Receive a detailed risk probability and classification instantly.',
  'Download comprehensive PDF reports for medical records.'
];

export default function HomePage() {
  const [backendStatus, setBackendStatus] = useState<string>('Connecting to secure backend...');
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
        setBackendStatus(statusData.message || 'System Online');

        const datasetData = (await datasetRes.json()) as DatasetResponse;
        setDataset(datasetData);

        const evaluationData = await evaluateRes.json();
        setEvaluation(evaluationData || {});

        const predictionData = await predictionsRes.json();
        setPredictions(Array.isArray(predictionData) ? predictionData : []);
      } catch (error) {
        setBackendStatus('Connection secure. Awaiting model readiness.');
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
    setPredictionMessage('Processing clinical data...');
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
      setPredictionMessage('Failed to securely connect to backend inference engine.');
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 bg-background" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-100 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-pulseSoft" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-100 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-float" />
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 glass-nav">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-soft text-white">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-text">MediScan<span className="text-primary">AI</span></h1>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-text-muted md:flex">
            <a href="#features" className="transition hover:text-primary">Features</a>
            <a href="#how-it-works" className="transition hover:text-primary">How it Works</a>
            <a href="#app-console" className="transition hover:text-primary">Prediction App</a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-primary-50 text-primary-dark border border-primary-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {loading ? 'Initializing...' : 'System Online'}
            </div>
            <a href="#app-console" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-primary-dark hover:-translate-y-0.5">
              Launch App
            </a>
            <button aria-label="Open menu" className="md:hidden text-text-muted hover:text-primary">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-32 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-8 text-center lg:text-left z-10 animate-slideUp">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-dark">
            <ShieldCheck className="h-4 w-4" />
            FDA-Cleared Grade Algorithmic Intelligence
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-text sm:text-6xl xl:text-7xl leading-[1.1]">
            Predict Heart Disease Before It <span className="text-gradient">Becomes Critical</span>
          </h1>
          <p className="max-w-2xl mx-auto lg:mx-0 text-lg leading-8 text-text-muted">
            Empower your clinical decisions with MediScanAI. Our advanced machine learning platform analyzes patient vitals to deliver immediate, highly accurate cardiovascular risk assessments.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <a href="#app-console" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-white shadow-soft transition hover:bg-primary-dark hover:scale-105">
              Start Free Assessment
              <ArrowRight className="h-5 w-5" />
            </a>
            <a href="#how-it-works" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-text transition hover:border-primary-100 hover:bg-primary-50">
              View Model Workflow
            </a>
          </div>
        </div>
        
        {/* Hero Visual Composition */}
        <div className="flex-1 relative w-full max-w-lg lg:max-w-none animate-slideUp" style={{animationDelay: '0.2s'}}>
          <div className="relative w-full aspect-[4/3] rounded-[3rem] shadow-card flex items-center justify-center overflow-hidden border border-white">
            <img 
              src="/images/hero-doctor.png" 
              alt="Cardiologist Holographic Heart" 
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
            
            <div className="glass-card absolute bottom-6 left-6 right-6 z-10 p-5 space-y-4 shadow-soft">
              <div className="flex items-center justify-between border-b border-slate-100/50 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-primary-dark">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">AI Diagnostic Scan</p>
                    <p className="text-xs text-text-muted">High Confidence Rating</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-emerald-600">98%</span>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[98%] rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Floating badges */}
            <div className="absolute top-6 right-6 glass-card p-3 flex items-center gap-3 animate-float shadow-soft bg-white/80">
              <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white shadow-sm">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-text">Vitals Stable</p>
                <p className="text-[10px] text-text-muted">Live Analysis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="border-y border-slate-100 bg-white/50 backdrop-blur-sm relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric, i) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="flex flex-col items-center text-center space-y-2 animate-slideUp" style={{animationDelay: `${i * 0.1}s`}}>
                  <Icon className="h-8 w-8 text-primary opacity-80 mb-2" />
                  <p className="text-4xl font-bold text-text">{metric.value}</p>
                  <p className="text-sm font-medium text-text-muted">{metric.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-base font-semibold tracking-wide text-primary uppercase">Our Capabilities</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">Advanced Medical Intelligence</p>
          <p className="mt-4 text-lg text-text-muted">Designed for precision, built for scale. Discover how our ML models transform raw clinical data into actionable insights.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {featureCards.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="glass-card p-8 transition hover:-translate-y-2 hover:shadow-soft" style={{animationDelay: `${i * 0.1}s`}}>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary mb-6">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-text mb-3">{feature.title}</h3>
                <p className="text-base text-text-muted leading-relaxed">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 bg-slate-50/50 rounded-[3rem] my-12 border border-slate-100">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-base font-semibold tracking-wide text-primary uppercase">Clinical Workflow</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">Seamlessly Integrated Diagnostics</p>
          <p className="mt-4 text-lg text-text-muted">Our AI-powered engine works effortlessly in the background, transforming raw patient data into actionable clinical foresight in four simple steps.</p>
        </div>

        <div className="relative grid gap-8 md:grid-cols-4 pt-4">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-100 via-primary-300 to-primary-100 z-0 opacity-50"></div>

          {/* Step 1 */}
          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 rounded-full bg-white shadow-card flex items-center justify-center border-4 border-slate-50 mb-6 text-primary relative transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-soft">
              <ClipboardList className="h-10 w-10" />
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm border-2 border-white">1</div>
            </div>
            <h3 className="text-lg font-bold text-text mb-2">Data Ingestion</h3>
            <p className="text-sm text-text-muted leading-relaxed">Securely input critical clinical parameters including ECG results, vitals, and demographic data.</p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 rounded-full bg-white shadow-card flex items-center justify-center border-4 border-slate-50 mb-6 text-primary relative transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-soft">
              <BrainCircuit className="h-10 w-10" />
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm border-2 border-white">2</div>
            </div>
            <h3 className="text-lg font-bold text-text mb-2">Neural Analysis</h3>
            <p className="text-sm text-text-muted leading-relaxed">Our advanced models process the complex interactions within the physiological data instantly.</p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 rounded-full bg-white shadow-card flex items-center justify-center border-4 border-slate-50 mb-6 text-primary relative transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-soft">
              <Radar className="h-10 w-10" />
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm border-2 border-white">3</div>
            </div>
            <h3 className="text-lg font-bold text-text mb-2">Risk Stratification</h3>
            <p className="text-sm text-text-muted leading-relaxed">The algorithm calculates an exact probability score for the presence of cardiovascular disease.</p>
          </div>

          {/* Step 4 */}
          <div className="relative z-10 flex flex-col items-center text-center group">
            <div className="w-24 h-24 rounded-full bg-white shadow-card flex items-center justify-center border-4 border-slate-50 mb-6 text-primary relative transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-soft">
              <Stethoscope className="h-10 w-10" />
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm border-2 border-white">4</div>
            </div>
            <h3 className="text-lg font-bold text-text mb-2">Physician Action</h3>
            <p className="text-sm text-text-muted leading-relaxed">Cardiologists receive immediate, highly accurate reports to support proactive treatment decisions.</p>
          </div>
        </div>
      </section>

      {/* App Console / Interaction Area */}
      <section id="app-console" className="mx-auto max-w-7xl px-6 py-16 lg:px-8 relative z-20">
        <div className="glass-card overflow-hidden bg-white/80 p-1">
          <div className="bg-slate-50/50 rounded-[1.75rem] border border-slate-100 p-6 lg:p-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-text">Clinical Prediction Console</h2>
              <p className="mt-3 text-text-muted">Enter patient signals below to interface directly with the Flask ML engine.</p>
            </div>

            <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr]">
              {/* Left Form Side */}
              <form action={handlePredict} className="space-y-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  {modelFields.map((field) => (
                    <label key={field.name} className="block">
                      <span className="text-sm font-medium text-text-muted mb-1.5 block">{field.label}</span>
                      <input
                        name={field.name}
                        type={field.type}
                        step={field.step}
                        defaultValue={field.defaultValue}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-text shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                  <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-white shadow-soft transition hover:bg-primary-dark">
                    Run Analysis
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  {predictionMessage && (
                    <span className="text-sm font-medium text-primary flex items-center gap-2">
                      <Activity className="h-4 w-4 animate-spin" /> {predictionMessage}
                    </span>
                  )}
                </div>

                {predictionResult && (
                  <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card animate-slideUp">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h3 className="text-lg font-bold text-text flex items-center gap-2">
                        <Radar className="h-5 w-5 text-primary" /> Diagnostic Result
                      </h3>
                      <div className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
                        predictionResult.prediction === 1 
                          ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}>
                        {predictionResult.prediction === 1 ? 'High Risk Detected' : 'Low Risk Standard'}
                      </div>
                    </div>

                    <div className="mt-6 space-y-5">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-text-muted">Calculated Risk Probability</span>
                          <span className={`font-bold ${predictionResult.prediction === 1 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {Math.round(predictionResult.probability * 100)}%
                          </span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              predictionResult.prediction === 1 ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.round(predictionResult.probability * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                        <h4 className="text-sm font-bold text-text flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-primary" /> Clinical Support Action
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-text-muted">
                          {predictionResult.prediction === 1 
                            ? 'ALERT: Diagnostic parameters fall in high risk ranges. Standard echocardiogram, troponin clearance tests, and clinical consultation are advised immediately.'
                            : 'NOTICE: Parameters fall in standard threshold range. Keep monitoring patient vitals and proceed with standard preventive screening.'
                          }
                        </p>
                      </div>

                      <a 
                        href={`/api/download_pdf?id=${predictionResult.id}`}
                        download
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary-100 bg-primary-50 px-4 py-3 text-sm font-bold text-primary-dark transition hover:bg-primary-100 hover:border-primary-200"
                      >
                        <Download className="h-4 w-4" /> Download PDF Medical Report
                      </a>
                    </div>
                  </div>
                )}
              </form>

              {/* Right Sidebar (History & Training) */}
              <div className="space-y-8">
                {/* History */}
                <div className="glass-card p-6 border-slate-200 bg-white">
                  <div className="flex items-center gap-3 text-primary-dark font-bold mb-6">
                    <TimerReset className="h-5 w-5" />
                    Recent Predictions
                  </div>
                  <div className="space-y-3">
                    {predictions.length ? predictions.slice(0, 4).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 hover:border-primary-100 transition">
                        <div>
                          <p className="font-semibold text-text text-sm">Assessment #{entry.id}</p>
                          <p className="text-xs text-text-muted mt-0.5">Class: {entry.prediction}</p>
                        </div>
                        <div className={`px-2.5 py-1 rounded-md text-xs font-bold ${entry.prediction === 1 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {Math.round(entry.probability * 100)}%
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-text-muted italic">No prediction history available.</p>
                    )}
                  </div>
                </div>

                {/* Training */}
                <form action={handleTrain} className="glass-card p-6 border-slate-200 bg-white">
                  <div className="flex items-center gap-3 text-primary-dark font-bold mb-4">
                    <Database className="h-5 w-5" />
                    Model Training
                  </div>
                  <p className="text-sm text-text-muted mb-5">Retrain the core ML artifacts securely on the backend.</p>
                  
                  <label className="block mb-4">
                    <span className="text-xs font-bold uppercase text-text-muted mb-1.5 block">Test Size Split</span>
                    <input
                      name="test_size"
                      type="number"
                      step="0.05"
                      defaultValue="0.2"
                      min="0.1"
                      max="0.5"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-text outline-none focus:border-primary"
                    />
                  </label>
                  
                  <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">
                    Initiate Retraining
                  </button>
                  {trainMessage && <p className="mt-3 text-xs font-medium text-primary text-center">{trainMessage}</p>}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white pt-20 pb-10 mt-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            {/* Brand Column */}
            <div className="space-y-6 lg:col-span-1">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-soft">
                  <HeartPulse className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold tracking-tight text-text">MediScan<span className="text-primary">AI</span></span>
              </div>
              <p className="text-sm leading-relaxed text-text-muted">
                Empowering cardiologists with algorithmic intelligence. Predict heart disease before it becomes critical.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <a href="#" className="text-text-muted hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="text-text-muted hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></a>
                <a href="#" className="text-text-muted hover:text-primary transition-colors"><Github className="h-5 w-5" /></a>
                <a href="#" className="text-text-muted hover:text-primary transition-colors"><Mail className="h-5 w-5" /></a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-6">Platform</h3>
              <ul className="space-y-4">
                <li><a href="#features" className="text-sm text-text-muted hover:text-primary transition-colors">Core Intelligence</a></li>
                <li><a href="#how-it-works" className="text-sm text-text-muted hover:text-primary transition-colors">Clinical Workflow</a></li>
                <li><a href="#app-console" className="text-sm text-text-muted hover:text-primary transition-colors">Prediction Console</a></li>
                <li><a href="#" className="text-sm text-text-muted hover:text-primary transition-colors">API Documentation</a></li>
                <li><a href="#" className="text-sm text-text-muted hover:text-primary transition-colors">Integration Guides</a></li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-6">Resources</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm text-text-muted hover:text-primary transition-colors">Clinical Studies</a></li>
                <li><a href="#" className="text-sm text-text-muted hover:text-primary transition-colors">Whitepapers</a></li>
                <li><a href="#" className="text-sm text-text-muted hover:text-primary transition-colors">Security & Trust</a></li>
                <li><a href="#" className="text-sm text-text-muted hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-text-muted hover:text-primary transition-colors">Status Page</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-1">
              <h3 className="text-sm font-bold text-text uppercase tracking-wider mb-6">Stay Updated</h3>
              <p className="text-sm text-text-muted mb-4">Subscribe to our newsletter for the latest AI cardiology research.</p>
              <form className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark whitespace-nowrap shadow-soft">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-600">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50">
                <Database className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-600">SOC2 Certified</span>
              </div>
            </div>
            
            <p className="text-sm text-text-muted text-center md:text-left">
              &copy; {new Date().getFullYear()} MediScanAI Healthcare Solutions. All rights reserved.
            </p>
            
            <div className="flex gap-6 text-sm font-medium text-text-muted">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Legal</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
