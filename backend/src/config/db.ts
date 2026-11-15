import mongoose from 'mongoose';
import { User } from '../models/User';
import { Astronaut } from '../models/Astronaut';
import { Mission } from '../models/Mission';
import { HealthReading } from '../models/HealthReading';
import { Alert } from '../models/Alert';

export const connectDatabase = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cosmic-six';

  try {
    // Attempt standard connection first
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] MongoDB connected successfully to ${uri}`);
  } catch (primaryErr) {
    console.warn(`[Database] Primary MongoDB connection failed (${primaryErr}). Initializing in-memory fallback database...`);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const inMemoryUri = mongod.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`[Database] Connected to Embedded In-Memory MongoDB at ${inMemoryUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to initialize in-memory database:', memErr);
      throw memErr;
    }
  }

  // Seed default demonstration data if database is empty
  await seedInitialData();
};

const seedInitialData = async (): Promise<void> => {
  try {
    // 1. Seed Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database] Seeding default mission operators and officers...');
      await User.create([
        {
          name: 'Flight Director Alex Vance',
          email: 'operator@cosmic.nasa.gov',
          password: 'CosmicSix2026!',
          role: 'Mission Operator',
        },
        {
          name: 'Flight Surgeon Sarah Connor',
          email: 'medic@cosmic.nasa.gov',
          password: 'CosmicSix2026!',
          role: 'Medical Officer',
        },
        {
          name: 'Mission Commander John Glenn',
          email: 'admin@cosmic.nasa.gov',
          password: 'CosmicSix2026!',
          role: 'Admin',
        },
      ]);
    }

    // 2. Seed Missions
    const missionCount = await Mission.countDocuments();
    if (missionCount === 0) {
      console.log('[Database] Seeding Artemis & Deep Space missions...');
      await Mission.create([
        {
          missionId: 'MIS-ARTEMIS-VI',
          missionName: 'Artemis VI Mars Transit',
          description: 'Long-duration interplanetary transit testing closed-loop life support habitats and radiation shielding.',
          startDate: new Date('2026-06-01T00:00:00Z'),
          endDate: new Date('2027-12-15T00:00:00Z'),
          status: 'Active',
          astronautIds: ['AST-001', 'AST-002', 'AST-003', 'AST-004'],
        },
        {
          missionId: 'MIS-GATEWAY-IV',
          missionName: 'Lunar Gateway Habitat IV',
          description: 'Cislunar permanent scientific habitat conducting microgravity neurobiology evaluations.',
          startDate: new Date('2026-01-15T00:00:00Z'),
          endDate: new Date('2027-01-15T00:00:00Z'),
          status: 'Active',
          astronautIds: ['AST-005', 'AST-006'],
        },
      ]);
    }

    // 3. Seed Astronaut Roster
    const astroCount = await Astronaut.countDocuments();
    if (astroCount === 0) {
      console.log('[Database] Seeding active astronaut fleet (COSMIC SIX)...');
      await Astronaut.create([
        {
          astronautId: 'AST-001',
          name: 'Dr. Alex Vance',
          age: 38,
          gender: 'Male',
          country: 'United States',
          role: 'Mission Commander',
          missionId: 'MIS-ARTEMIS-VI',
          status: 'Healthy',
        },
        {
          astronautId: 'AST-002',
          name: 'Sarah Connor',
          age: 35,
          gender: 'Female',
          country: 'United States',
          role: 'Flight Surgeon / Specialist',
          missionId: 'MIS-ARTEMIS-VI',
          status: 'Healthy',
        },
        {
          astronautId: 'AST-003',
          name: 'Elena Rostova',
          age: 41,
          gender: 'Female',
          country: 'Canada',
          role: 'Lead Flight Engineer',
          missionId: 'MIS-ARTEMIS-VI',
          status: 'Healthy',
        },
        {
          astronautId: 'AST-004',
          name: 'Kenji Sato',
          age: 34,
          gender: 'Male',
          country: 'Japan (JAXA)',
          role: 'Payload Specialist',
          missionId: 'MIS-ARTEMIS-VI',
          status: 'Healthy',
        },
        {
          astronautId: 'AST-005',
          name: 'Marcus Brody',
          age: 45,
          gender: 'Male',
          country: 'Germany (ESA)',
          role: 'Habitation Systems Officer',
          missionId: 'MIS-GATEWAY-IV',
          status: 'Warning',
        },
        {
          astronautId: 'AST-006',
          name: 'Nadia Chen',
          age: 32,
          gender: 'Female',
          country: 'Australia',
          role: 'Life Sciences Officer',
          missionId: 'MIS-GATEWAY-IV',
          status: 'Healthy',
        },
      ]);
    }

    // 4. Seed initial historical telemetry readings so charts render immediately
    const readingCount = await HealthReading.countDocuments();
    if (readingCount === 0) {
      console.log('[Database] Seeding historical baseline telemetry records...');
      const now = Date.now();
      const readings = [];

      for (let i = 25; i >= 0; i--) {
        const time = new Date(now - i * 10000); // 10s intervals
        readings.push({
          astronautId: 'AST-001',
          missionId: 'MIS-ARTEMIS-VI',
          heartRate: 72 + Math.sin(i) * 5,
          spo2: 98.4 + Math.cos(i) * 0.4,
          temperature: 36.8 + Math.sin(i) * 0.1,
          systolicBP: 120 + Math.round(Math.sin(i) * 3),
          diastolicBP: 80 + Math.round(Math.cos(i) * 2),
          respiratoryRate: 16,
          activityLevel: 1,
          sensorStatus: 'Connected',
          source: 'BioHarness-Pro-MkIV',
          timestamp: time,
        });
      }

      await HealthReading.insertMany(readings);
    }

    // 5. Seed sample alerts
    const alertCount = await Alert.countDocuments();
    if (alertCount === 0) {
      console.log('[Database] Seeding initial demonstration alert...');
      await Alert.create({
        alertId: 'ALT-2026-0001',
        astronautId: 'AST-005',
        missionId: 'MIS-GATEWAY-IV',
        title: 'Mild Tachycardia Trend Under Low Workload',
        description: 'Sustained resting heart rate of 94 BPM during rest period.',
        severity: 'Warning',
        source: 'Rule-Based',
        status: 'Active',
      });
    }

    console.log('[Database] System initialization & seeding complete.');
  } catch (err) {
    console.error('[Database] Seeding error:', err);
  }
};
