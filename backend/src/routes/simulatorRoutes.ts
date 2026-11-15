import { Router } from 'express';
import { getStatus, start, stop, switchScenario } from '../controllers/simulatorController';

const router = Router();

router.get('/status', getStatus);
router.post('/start', start);
router.post('/stop', stop);
router.post('/scenario', switchScenario);

export default router;
