import { Router } from 'express';
import {
  getAstronauts,
  getAstronautById,
  createAstronaut,
  updateAstronaut,
  deleteAstronaut,
} from '../controllers/astronautController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { astronautValidator } from '../validators/astronautValidators';

const router = Router();

router.get('/', getAstronauts);
router.get('/:id', getAstronautById);
router.post('/', authenticate, authorize('Admin', 'Medical Officer'), astronautValidator, validate, createAstronaut);
router.put('/:id', authenticate, authorize('Admin', 'Medical Officer'), updateAstronaut);
router.delete('/:id', authenticate, authorize('Admin'), deleteAstronaut);

export default router;
