import { Router } from 'express';
import {
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  acknowledgeAlert,
  resolveAlert,
  getAlertSummary,
} from '../controllers/alertController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getAlerts);
router.get('/summary', getAlertSummary);
router.get('/:id', getAlertById);
router.post('/', authenticate, createAlert);
router.put('/:id', authenticate, updateAlert);
router.patch('/:id/acknowledge', authenticate, acknowledgeAlert);
router.patch('/:id/resolve', authenticate, resolveAlert);

export default router;
