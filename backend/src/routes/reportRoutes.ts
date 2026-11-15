import { Router } from 'express';
import {
  getHealthReport,
  getAlertsReport,
  getMissionReport,
  exportCsv,
  exportPdf,
} from '../controllers/reportController';

const router = Router();

router.get('/health', getHealthReport);
router.get('/alerts', getAlertsReport);
router.get('/mission', getMissionReport);
router.get('/export/csv', exportCsv);
router.get('/export/pdf', exportPdf);

export default router;
