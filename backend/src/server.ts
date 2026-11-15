import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app';
import { connectDatabase } from './config/db';
import { initializeSocket } from './sockets/socketHandler';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const server = http.createServer(app);

    // Initialize Socket.IO
    initializeSocket(server);

    // Connect to MongoDB
    await connectDatabase();

    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  COSMIC SIX MISSION BACKEND INITIALIZED`);
      console.log(`  Target Port: ${PORT}`);
      console.log(`  API Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`  Socket.IO Gateway: http://localhost:${PORT}`);
      console.log(`====================================================`);
    });

    const shutdown = async () => {
      console.log('[System] Gracefully terminating mission server...');
      server.close(() => {
        console.log('[System] Server closed. Safe flight.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('[System] Fatal error starting backend server:', err);
    process.exit(1);
  }
};

startServer();
