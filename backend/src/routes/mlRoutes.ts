import { Router } from 'express';
import {
  getPredictions,
  getModelStatus,
  retrainModel,
  analyzeReadingDirect,
} from '../controllers/mlController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/predictions', getPredictions);
router.get('/model-status', getModelStatus);
router.post('/retrain', authenticate, retrainModel);
router.post('/analyze', analyzeReadingDirect);

export default router;
