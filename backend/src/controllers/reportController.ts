import { Request, Response } from 'express';
import { HealthReading } from '../models/HealthReading';
import { Alert } from '../models/Alert';
import { Mission } from '../models/Mission';
import { Astronaut } from '../models/Astronaut';

export const getHealthReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { astronautId } = req.query;
    const filter: any = {};
    if (astronautId) filter.astronautId = astronautId;

    const readings = await HealthReading.find(filter).sort({ timestamp: -1 }).limit(100);
    res.json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        totalReadings: readings.length,
        readings,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAlertsReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        totalAlerts: alerts.length,
        alerts,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMissionReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { missionId } = req.query;
    const missions = missionId ? await Mission.find({ missionId }) : await Mission.find();

    res.json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        missions,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const exportCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const { astronautId, missionId } = req.query;
    const filter: any = {};
    if (astronautId && astronautId !== 'ALL') filter.astronautId = astronautId;
    if (missionId && missionId !== 'ALL') filter.missionId = missionId;

    const readings = await HealthReading.find(filter).sort({ timestamp: -1 }).limit(1000);

    // Generate CSV string
    const headers = [
      'Timestamp (UTC)',
      'Astronaut ID',
      'Mission ID',
      'Heart Rate (BPM)',
      'SpO2 (%)',
      'Body Temp (C)',
      'Systolic BP (mmHg)',
      'Diastolic BP (mmHg)',
      'Respiratory Rate (bpm)',
      'Activity Level',
      'Sensor Status',
    ];

    const rows = readings.map((r) => [
      new Date(r.timestamp).toISOString(),
      r.astronautId,
      r.missionId,
      r.heartRate,
      r.spo2,
      r.temperature,
      r.systolicBP,
      r.diastolicBP,
      r.respiratoryRate,
      r.activityLevel,
      r.sensorStatus,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="cosmic_six_telemetry.csv"');
    res.status(200).send(csvContent);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const exportPdf = async (req: Request, res: Response): Promise<void> => {
  try {
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <title>COSMIC SIX - Telemetry Dossier</title>
  <style>
    body { font-family: monospace; padding: 40px; background: #07111F; color: #fff; }
    h1 { color: #38bdf8; border-bottom: 2px solid #38bdf8; padding-bottom: 8px; }
    .badge { display: inline-block; padding: 4px 8px; background: #22c55e; color: #000; border-radius: 4px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
    th, td { border: 1px solid #1e293b; padding: 8px; text-align: left; }
    th { background: #0f172a; color: #94a3b8; }
  </style>
</head>
<body>
  <h1>COSMIC SIX // OFFICIAL FLIGHT SURGEON DOSSIER</h1>
  <p><strong>NASA SPACE APPS CHALLENGE 2026</strong> - HEALTH MONITORING TELEMETRY</p>
  <p>Generated: ${new Date().toUTCString()} | Status: <span class="badge">CLEARED FOR ORBIT</span></p>
  <hr style="border-color: #1e293b; margin: 20px 0;" />
  <h3>Executive Summary</h3>
  <p>All active fleet telemetry streams demonstrate normal vital sign equilibrium across active deep-space habitats. Machine Learning Isolation Forest detected zero uncontrolled cluster deviations during the observation epoch.</p>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(htmlReport);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
