import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  calculateETA,
  fetchCopilotExplanation,
  type ETAPredictionResponse,
  type CopilotExplanationResponse
} from '../../services/api';

// Station fallback map matching seeded corridor topology
const TRAIN_DEFAULT_SECTIONS: Record<string, { from: string; to: string }> = {
  '12627': { from: 'SBC', to: 'KGI' },  // Karnataka Express
  '12613': { from: 'SBC', to: 'KGI' },  // Bengaluru - Mysuru Express
  '12639': { from: 'SBC', to: 'BNC' },  // Brindavan Express
  '12610': { from: 'MYA', to: 'SBC' },  // Mysuru - Chennai Express
  '12608': { from: 'BNC', to: 'BNCE' }, // Lalbagh Express
  '16591': { from: 'YPR', to: 'SBC' },  // Hampi Express
  '20661': { from: 'SBC', to: 'BNC' },  // Vande Bharat Express
};

export const LiveTrainStatus: React.FC = () => {
  const [searchParams] = useSearchParams();

  const initialTrain = searchParams.get('train') || '20661';
  const defaultPair = TRAIN_DEFAULT_SECTIONS[initialTrain] || { from: 'SBC', to: 'BNC' };
  const initialFrom = searchParams.get('from') || defaultPair.from;
  const initialTo = searchParams.get('to') || defaultPair.to;

  const [trainNumber, setTrainNumber] = useState(initialTrain);
  const [fromStation, setFromStation] = useState(initialFrom);
  const [toStation, setToStation] = useState(initialTo);
  const [runningDelay, setRunningDelay] = useState<number>(5.0);

  const [loading, setLoading] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<ETAPredictionResponse | null>(null);
  const [copilot, setCopilot] = useState<CopilotExplanationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runPrediction = async (tNum = trainNumber, fSt = fromStation, tSt = toStation, dly = runningDelay) => {
    setLoading(true);
    setError(null);
    try {
      const pred = await calculateETA(tNum, fSt, tSt, dly);
      setPrediction(pred);

      const exp = await fetchCopilotExplanation(pred.prediction_id);
      setCopilot(exp);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate ETA');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const pair = TRAIN_DEFAULT_SECTIONS[initialTrain] || { from: 'SBC', to: 'BNC' };
    const resolvedFrom = searchParams.get('from') || pair.from;
    const resolvedTo = searchParams.get('to') || pair.to;

    setTrainNumber(initialTrain);
    setFromStation(resolvedFrom);
    setToStation(resolvedTo);
    runPrediction(initialTrain, resolvedFrom, resolvedTo, runningDelay);
  }, [initialTrain, searchParams]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live ETA & Controller Copilot</h1>
          <p className="text-sm text-gray-500">Train {trainNumber} ({fromStation} ➔ {toStation})</p>
        </div>
        <button
          onClick={() => runPrediction()}
          disabled={loading}
          className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition text-sm font-semibold"
        >
          {loading ? 'Analyzing...' : 'Recalculate ETA'}
        </button>
      </div>

      {/* Query Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
        <div>
          <label className="text-xs font-semibold uppercase text-gray-500">Train Number</label>
          <input
            type="text"
            value={trainNumber}
            onChange={(e) => setTrainNumber(e.target.value)}
            className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-gray-500">From Station</label>
          <input
            type="text"
            value={fromStation}
            onChange={(e) => setFromStation(e.target.value)}
            className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-gray-500">To Station</label>
          <input
            type="text"
            value={toStation}
            onChange={(e) => setToStation(e.target.value)}
            className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase text-gray-500">Current Delay (Minutes)</label>
          <input
            type="number"
            value={runningDelay}
            onChange={(e) => setRunningDelay(parseFloat(e.target.value) || 0)}
            className="w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Predictions */}
      {prediction && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 shadow rounded-xl border-l-4 border-teal-500">
            <span className="text-xs text-gray-500 uppercase font-bold">Predicted Delay</span>
            <div className="text-3xl font-extrabold text-teal-600 mt-1">
              {prediction.predicted_delay_minutes} min
            </div>
            <span className="text-xs text-gray-400">Confidence Score: {(prediction.confidence_score * 100).toFixed(0)}%</span>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 shadow rounded-xl border-l-4 border-amber-500">
            <span className="text-xs text-gray-500 uppercase font-bold">Scheduled Arrival</span>
            <div className="text-lg font-semibold mt-1">
              {new Date(prediction.scheduled_eta).toLocaleTimeString()}
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 shadow rounded-xl border-l-4 border-emerald-500">
            <span className="text-xs text-gray-500 uppercase font-bold">Estimated Arrival</span>
            <div className="text-lg font-semibold mt-1">
              {new Date(prediction.predicted_eta).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Controller AI Copilot */}
      {copilot && (
        <div className="p-6 bg-gradient-to-r from-slate-900 to-teal-950 text-white rounded-2xl shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2">
              🤖 Section Controller AI Copilot
            </h3>
            <span className="text-xs px-2 py-1 bg-teal-800 rounded-full">{copilot.provider} ({copilot.latency_ms}ms)</span>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-teal-300 uppercase">Situation Assessment</h4>
            <p className="mt-1 text-sm leading-relaxed text-gray-200">{copilot.explanation}</p>
          </div>
          <div className="border-t border-teal-800 pt-3">
            <h4 className="text-xs font-semibold text-emerald-300 uppercase">Actionable Dispatch Directive</h4>
            <p className="mt-1 text-sm font-medium text-emerald-200">{copilot.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTrainStatus;