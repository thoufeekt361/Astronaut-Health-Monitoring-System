import http from 'http';
import app from '../app';
import { connectDatabase } from '../config/db';
import { initializeSocket } from '../sockets/socketHandler';
import axios from 'axios';
import mongoose from 'mongoose';

const runTests = async () => {
  console.log('====================================================');
  console.log('     COSMIC SIX - BACKEND & API TEST HARNESS');
  console.log('====================================================');

  const server = http.createServer(app);
  initializeSocket(server);
  await connectDatabase();

  const testPort = 5999;
  await new Promise<void>((resolve) => server.listen(testPort, resolve));
  console.log(`[Test Server] Listening on http://localhost:${testPort}`);

  const client = axios.create({
    baseURL: `http://localhost:${testPort}/api/v1`,
    validateStatus: () => true, // Don't throw on error status
  });

  try {
    // 1. Health Probe
    console.log('\n[1/6] Testing System Health Check...');
    const healthRes = await axios.get(`http://localhost:${testPort}/health`);
    console.log(`  Health Status: ${healthRes.data.status} (Code: ${healthRes.status})`);
    if (healthRes.status !== 200) throw new Error('Health check failed');

    // 2. Authentication Login
    console.log('\n[2/6] Testing Authentication (Operator Login)...');
    const loginRes = await client.post('/auth/login', {
      email: 'operator@cosmic.nasa.gov',
      password: 'CosmicSix2026!',
    });
    console.log(`  Login Status: Code ${loginRes.status}, User: ${loginRes.data.user?.name}`);
    if (loginRes.status !== 200 || !loginRes.data.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
    }
    const token = loginRes.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 3. Astronauts API
    console.log('\n[3/6] Testing Astronaut Fleet Query...');
    const astrosRes = await client.get('/astronauts');
    console.log(`  Astronauts Found: ${astrosRes.data.data?.length} (Code: ${astrosRes.status})`);
    if (astrosRes.data.data?.length < 6) throw new Error('Expected at least 6 seeded astronauts');

    // 4. Ingest Telemetry Reading & Evaluate Rules
    console.log('\n[4/6] Testing Telemetry Ingestion (Nominal Reading)...');
    const readingRes = await client.post('/health/readings', {
      astronautId: 'AST-001',
      missionId: 'MIS-ARTEMIS-VI',
      heartRate: 74,
      spo2: 98.6,
      temperature: 36.8,
      systolicBP: 120,
      diastolicBP: 80,
      respiratoryRate: 16,
      activityLevel: 1,
      sensorStatus: 'Connected',
    });
    console.log(`  Ingestion Status: Code ${readingRes.status}, ID: ${readingRes.data.data?._id}`);
    if (readingRes.status !== 201) throw new Error('Failed to ingest telemetry');

    // 5. Trigger Rule-Based Critical Safety Alert
    console.log('\n[5/6] Testing Rule-Based Safety Trigger (Critical Hypoxia)...');
    const hypoxiaRes = await client.post('/health/readings', {
      astronautId: 'AST-001',
      missionId: 'MIS-ARTEMIS-VI',
      heartRate: 112,
      spo2: 87.5, // Below critical limit (90%)
      temperature: 36.8,
      systolicBP: 130,
      diastolicBP: 85,
      respiratoryRate: 26,
      activityLevel: 1,
      sensorStatus: 'Connected',
    });
    console.log(`  Hypoxia Reading Ingested: Code ${hypoxiaRes.status}`);

    const alertsRes = await client.get('/alerts?severity=Critical', { headers: authHeaders });
    console.log(`  Critical Alerts Registered: ${alertsRes.data.data?.length}`);
    if (alertsRes.data.data?.length === 0) {
      throw new Error('Expected critical alert to be generated for SpO2 = 87.5%');
    }

    // 6. Test Alert Acknowledgment
    console.log('\n[6/6] Testing Alert Remediation Workflow (Acknowledge)...');
    const alertId = alertsRes.data.data[0]._id;
    const ackRes = await client.patch(`/alerts/${alertId}/acknowledge`, {}, { headers: authHeaders });
    console.log(`  Alert Acknowledge Status: Code ${ackRes.status}, Status: ${ackRes.data.data?.status}`);
    if (ackRes.data.data?.status !== 'Acknowledged') {
      throw new Error('Alert acknowledge state failed');
    }

    console.log('\n====================================================');
    console.log('  ALL INTEGRATION TESTS PASSED (6/6 SUITES OK)');
    console.log('====================================================');
  } catch (err: any) {
    console.error('\n[!] Test failure:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(process.exitCode || 0);
  }
};

runTests();
