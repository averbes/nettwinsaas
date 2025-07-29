import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, ValidationError } from 'express-validator';
import logger from '../utils/logger';

// Tipo para errores de validación
type ValidationErrorItem = {
  msg: string;
  param?: string;
  value?: any;
  location?: string;
  path?: string;
};

/**
 * Middleware to validate the request using express-validator
 * @param validations Array of validation chains
 * @returns Middleware function
 */
export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Log validation errors
    const errorMessages: Array<{ field: string; message: string }> = [];
    
    errors.array().forEach((err) => {
      const error = err as ValidationErrorItem;
      errorMessages.push({
        field: error.param || error.path || 'unknown',
        message: error.msg || 'Validation failed',
      });
    });

    logger.warn('Request validation failed', { 
      path: req.path,
      method: req.method,
      errors: errorMessages 
    });

    // Return validation errors
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
    });
  };
};

/**
 * Middleware to validate request body against a schema
 * @param schema Joi validation schema
 * @returns Middleware function
 */
export const validateSchema = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map((detail: any) => ({
        field: detail.context.key,
        message: detail.message,
      }));

      logger.warn('Schema validation failed', { 
        path: req.path,
        method: req.method,
        errors: errorMessages 
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    next();
  };
};

/**
 * Middleware to handle async/await errors in route handlers
 * @param fn Async route handler function
 * @returns Middleware function with error handling
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware to handle 404 Not Found errors
 */
export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn('Route not found', { 
    path: req.path, 
    method: req.method 
  });
  
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.path}`,
  });
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error('Unhandled error', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
