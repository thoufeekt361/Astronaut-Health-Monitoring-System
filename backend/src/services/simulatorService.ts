import { HealthReading, IHealthReading } from '../models/HealthReading';
import { evaluateSafetyRules } from './ruleAlertService';
import { analyzeWithML } from './mlClientService';
import { getIO } from '../sockets/socketHandler';

export interface SimulatorState {
  isRunning: boolean;
  scenario: string;
  speedMultiplier: number;
  intervalMs: number;
  activeAstronautId: string;
}

const state: SimulatorState = {
  isRunning: true,
  scenario: 'Normal resting condition',
  speedMultiplier: 1,
  intervalMs: 3000,
  activeAstronautId: 'AST-001',
};

let timer: NodeJS.Timeout | null = null;
let currentAstroIndex = 0;
const crewIds = ['AST-001', 'AST-002', 'AST-003', 'AST-004', 'AST-005', 'AST-006'];

export const getSimulatorStatus = (): SimulatorState => ({ ...state });

export const startSimulator = (params?: { speed?: number; scenario?: string }): SimulatorState => {
  if (params?.speed) state.speedMultiplier = params.speed;
  if (params?.scenario) state.scenario = params.scenario;
  state.isRunning = true;

  if (timer) clearInterval(timer);
  const cadence = Math.max(1000, Math.round(state.intervalMs / state.speedMultiplier));
  timer = setInterval(generateTick, cadence);

  console.log(`[Simulator] Started streaming telemetry at ${cadence}ms intervals. Scenario: ${state.scenario}`);
  return getSimulatorStatus();
};

export const stopSimulator = (): SimulatorState => {
  state.isRunning = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  console.log('[Simulator] Paused telemetry streaming.');
  return getSimulatorStatus();
};

export const setScenario = (scenario: string, astronautId?: string): SimulatorState => {
  state.scenario = scenario;
  if (astronautId) state.activeAstronautId = astronautId;
  console.log(`[Simulator] Active scenario switched to: ${scenario} for ${state.activeAstronautId}`);
  return getSimulatorStatus();
};

const generateTick = async (): Promise<void> => {
  try {
    // Cycle through astronauts or focus on targeted astronaut
    const astroId = crewIds[currentAstroIndex];
    currentAstroIndex = (currentAstroIndex + 1) % crewIds.length;

    const missionId = astroId === 'AST-005' || astroId === 'AST-006' ? 'MIS-GATEWAY-IV' : 'MIS-ARTEMIS-VI';
    const isTargetedForScenario = astroId === state.activeAstronautId;
    const scenarioToApply = isTargetedForScenario ? state.scenario : 'Normal resting condition';

    const readingData = generateSyntheticReading(astroId, missionId, scenarioToApply);

    // Save reading to database
    const savedReading = await HealthReading.create(readingData);

    // Broadcast live telemetry via Socket.IO
    const io = getIO();
    if (io) {
      io.emit('health:update', savedReading);
    }

    // 1. Evaluate deterministic safety rules first
    await evaluateSafetyRules(savedReading);

    // 2. Perform asynchronous unsupervised ML inference
    analyzeWithML(savedReading).catch(() => {});
  } catch (err) {
    console.error('[Simulator] Tick generation error:', err);
  }
};

const generateSyntheticReading = (
  astronautId: string,
  missionId: string,
  scenario: string
): Partial<IHealthReading> => {
  const jitter = (range: number) => (Math.random() - 0.5) * range;

  let hr = 72 + jitter(6);
  let spo2 = 98.4 + jitter(0.8);
  let temp = 36.8 + jitter(0.2);
  let sys = 120 + Math.round(jitter(6));
  let dia = 80 + Math.round(jitter(4));
  let resp = 16 + Math.round(jitter(2));
  let act = 1;
  let sensorStatus: 'Connected' | 'Degraded' | 'Disconnected' = 'Connected';

  switch (scenario) {
    case 'Physical activity':
      hr = 135 + jitter(15);
      spo2 = 97.2 + jitter(1.0);
      temp = 37.4 + jitter(0.3);
      sys = 142 + Math.round(jitter(8));
      dia = 88 + Math.round(jitter(6));
      resp = 24 + Math.round(jitter(4));
      act = 2; // Active
      break;

    case 'Sleep/rest condition':
      hr = 54 + jitter(4);
      spo2 = 98.8 + jitter(0.4);
      temp = 36.4 + jitter(0.2);
      sys = 110 + Math.round(jitter(4));
      dia = 72 + Math.round(jitter(3));
      resp = 12 + Math.round(jitter(1));
      act = 0; // Resting
      break;

    case 'Elevated heart rate': // Tachycardia
      hr = 168 + jitter(10);
      spo2 = 95.0 + jitter(1.2);
      temp = 37.2 + jitter(0.3);
      sys = 158 + Math.round(jitter(8));
      dia = 98 + Math.round(jitter(4));
      resp = 26 + Math.round(jitter(3));
      act = 1; // Under nominal exertion (abnormal disparity)
      break;

    case 'Reduced SpO2': // Hypoxia
      hr = 108 + jitter(8);
      spo2 = 88.5 + jitter(1.5);
      temp = 36.9 + jitter(0.2);
      sys = 130 + Math.round(jitter(6));
      dia = 84 + Math.round(jitter(4));
      resp = 28 + Math.round(jitter(4));
      act = 1;
      break;

    case 'Increased temperature': // Hyperthermia / Infection
      hr = 115 + jitter(6);
      spo2 = 96.5 + jitter(0.8);
      temp = 39.2 + jitter(0.4);
      sys = 136 + Math.round(jitter(6));
      dia = 86 + Math.round(jitter(4));
      resp = 22 + Math.round(jitter(2));
      act = 1;
      break;

    case 'Sensor disconnection':
      hr = 0;
      spo2 = 0;
      temp = 0;
      sys = 0;
      dia = 0;
      resp = 0;
      sensorStatus = 'Disconnected';
      break;

    default: // Normal resting
      break;
  }

  // Constrain bounds
  spo2 = Math.min(100, Math.max(0, parseFloat(spo2.toFixed(1))));
  temp = parseFloat(temp.toFixed(1));

  return {
    astronautId,
    missionId,
    heartRate: Math.round(hr),
    spo2,
    temperature: temp,
    systolicBP: Math.round(sys),
    diastolicBP: Math.round(dia),
    respiratoryRate: Math.round(resp),
    activityLevel: act,
    sensorStatus,
    source: 'Synthetic-BioTelemetry-Simulator',
    timestamp: new Date(),
  };
};

// Auto-start simulator on module load
setTimeout(() => {
  startSimulator();
}, 2000);
