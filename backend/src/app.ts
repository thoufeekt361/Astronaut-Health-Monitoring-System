import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow development dashboard resources
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Rate limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
  max: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10),
  message: { success: false, message: 'Too many telemetry requests. Throttled by mission control.' },
});
app.use('/api', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Probe
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'COSMIC SIX Telemetry Gateway',
    timestamp: new Date().toISOString(),
  });
});

// Mount V1 API
app.use('/api/v1', routes);

// 404 Route Not Found
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not recognized by mission control.`,
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;
