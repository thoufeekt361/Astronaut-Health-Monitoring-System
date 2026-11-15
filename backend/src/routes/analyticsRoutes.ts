import { Router } from 'express';
import {
  getDashboardAnalytics,
  getAstronautAnalytics,
  getMissionAnalytics,
  getTrends,
} from '../controllers/analyticsController';

const router = Router();

router.get('/dashboard', getDashboardAnalytics);
router.get('/astronauts', getAstronautAnalytics);
router.get('/missions', getMissionAnalytics);
router.get('/trends', getTrends);

export default router;
