import { Router } from 'express';
import authRoutes from './authRoutes';
import astronautRoutes from './astronautRoutes';
import missionRoutes from './missionRoutes';
import healthRoutes from './healthRoutes';
import alertRoutes from './alertRoutes';
import analyticsRoutes from './analyticsRoutes';
import mlRoutes from './mlRoutes';
import simulatorRoutes from './simulatorRoutes';
import reportRoutes from './reportRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/astronauts', astronautRoutes);
router.use('/missions', missionRoutes);
router.use('/health', healthRoutes);
router.use('/alerts', alertRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/ml', mlRoutes);
router.use('/simulator', simulatorRoutes);
router.use('/reports', reportRoutes);

export default router;
