import { Request, Response, NextFunction } from 'express';
import { AppError } from '../exceptions/AppError';

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error] ${err.name}: ${err.message}`);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle Zod validation errors specifically
  if (err.name === 'ZodError') {
    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: (err as any).errors,
      timestamp: new Date().toISOString(),
    });
  }

  // Fallback for unhandled errors
  return res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  });
};
