import { body } from 'express-validator';

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid mission email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['Admin', 'Medical Officer', 'Mission Operator'])
    .withMessage('Role must be Admin, Medical Officer, or Mission Operator'),
];

export const loginValidator = [
  body('email').isEmail().withMessage('Valid mission email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];
