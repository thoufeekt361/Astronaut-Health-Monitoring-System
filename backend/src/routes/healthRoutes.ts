import { Router } from 'express';
import {
  ingestReading,
  getReadings,
  getLatestReading,
  getReadingHistory,
  getTelemetrySummary,
  getAstronautTrends,
} from '../controllers/healthController';
import { validate } from '../middleware/validate';
import { readingValidator } from '../validators/healthValidators';

const router = Router();

router.post('/readings', readingValidator, validate, ingestReading);
router.get('/readings', getReadings);
router.get('/latest/:astronautId', getLatestReading);
router.get('/history/:astronautId', getReadingHistory);
router.get('/summary', getTelemetrySummary);
router.get('/trends/:astronautId', getAstronautTrends);

export default router;
