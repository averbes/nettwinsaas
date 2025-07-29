import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';
import logger from '../utils/logger';
import config from '../config/config';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware to protect routes that require authentication
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      // Get token from header
      token = authHeader.split(' ')[1];

      if (!token) {
        logger.warn('No token provided after Bearer');
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized, no token' 
        });
      }

      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string };

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        logger.warn('User not found with the provided token');
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized, user not found' 
        });
      }

      // Add user to request object
      req.user = {
        id: user._id.toString(),
        role: user.role
      };

      logger.info('User authenticated', { userId: user._id, role: user.role });
      next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Token verification failed', { error: errorMessage });
      
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized, invalid token' 
        });
      }
      
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized, token expired' 
        });
      }
      
      res.status(500).json({ 
        success: false,
        message: 'Server error during authentication' 
      });
    }
  } else {
    logger.warn('No token provided or invalid format');
    res.status(401).json({ 
      success: false,
      message: 'Not authorized, no token provided' 
    });
  }
};

/**
 * Middleware to restrict access to admin users only
 */
export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    logger.debug('Admin access granted', { userId: req.user.id });
    next();
  } else {
    logger.warn('Unauthorized admin access attempt', { 
      userId: req.user?.id || 'none',
      attemptedEndpoint: req.originalUrl 
    });
    
    res.status(403).json({ 
      success: false,
      message: 'Not authorized as an admin' 
    });
  }
};

/**
 * Middleware to check if user has required roles
 * @param roles Array of roles that are allowed to access the route
 */
export const authorize = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (roles.length && !req.user) {
      logger.warn('Unauthorized access - no user in request');
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    if (roles.length && !roles.includes(req.user!.role)) {
      logger.warn('Unauthorized access - insufficient permissions', { 
        userId: req.user?.id,
        requiredRoles: roles,
        userRole: req.user?.role 
      });
      
      return res.status(403).json({ 
        success: false,
        message: `User role ${req.user?.role} is not authorized to access this route` 
      });
    }

    next();
  };
};
