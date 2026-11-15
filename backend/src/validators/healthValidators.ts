import { body } from 'express-validator';

export const readingValidator = [
  body('astronautId').trim().notEmpty().withMessage('Astronaut ID is required'),
  body('heartRate').isFloat({ min: 20, max: 260 }).withMessage('Heart rate must be numeric'),
  body('spo2').isFloat({ min: 50, max: 100 }).withMessage('SpO2 must be between 50 and 100'),
  body('temperature').isFloat({ min: 30, max: 45 }).withMessage('Core temperature must be numeric'),
  body('systolicBP').isFloat({ min: 50, max: 250 }).withMessage('Systolic BP must be numeric'),
  body('diastolicBP').isFloat({ min: 30, max: 150 }).withMessage('Diastolic BP must be numeric'),
  body('respiratoryRate').isFloat({ min: 4, max: 60 }).withMessage('Respiratory rate must be numeric'),
];
