import { Router } from 'express';
import {
  getMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission,
} from '../controllers/missionController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { missionValidator } from '../validators/missionValidators';

const router = Router();

router.get('/', getMissions);
router.get('/:id', getMissionById);
router.post('/', authenticate, authorize('Admin'), missionValidator, validate, createMission);
router.put('/:id', authenticate, authorize('Admin'), updateMission);
router.delete('/:id', authenticate, authorize('Admin'), deleteMission);

export default router;
