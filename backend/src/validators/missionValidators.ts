import { body } from 'express-validator';

export const missionValidator = [
  body('missionId').trim().notEmpty().withMessage('Mission ID is required'),
  body('missionName').trim().notEmpty().withMessage('Mission Name is required'),
  body('startDate').isISO8601().withMessage('Valid ISO start date required'),
  body('endDate').isISO8601().withMessage('Valid ISO end date required'),
];
