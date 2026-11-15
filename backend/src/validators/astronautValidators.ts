import { body } from 'express-validator';

export const astronautValidator = [
  body('astronautId').trim().notEmpty().withMessage('Astronaut ID is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('age').isInt({ min: 18, max: 80 }).withMessage('Valid age between 18 and 80 is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('role').trim().notEmpty().withMessage('Operational role is required'),
  body('missionId').trim().notEmpty().withMessage('Mission assignment is required'),
];
