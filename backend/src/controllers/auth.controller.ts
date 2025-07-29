import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';
import config from '../config/config';
import logger from '../utils/logger';

// Extender la interfaz Request de Express para incluir la propiedad user
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

// Interfaz para la respuesta de autenticación exitosa
interface AuthResponse {
  success: boolean;
  data?: {
    _id: string;
    username: string;
    email: string;
    role: string;
    token: string;
  };
  message?: string;
  errors?: Array<{ msg: string; param?: string }>;
}

// Helper function to generate JWT token
const generateToken = (id: string): string => {
  try {
    const token = jwt.sign(
      { id },
      config.jwt.secret as jwt.Secret,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );
    return token;
  } catch (error) {
    logger.error('Error generating token', { error });
    throw new Error('Error generating authentication token');
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation errors during registration', { errors: errors.array() });
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { username, email, password } = req.body as {
      username: string;
      email: string;
      password: string;
    };

    logger.debug('Registration attempt', { email, username });

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      logger.warn('User already exists', { email, username, field });
      return res.status(400).json({ 
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    // Crear el usuario
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password, // Se hasheará automáticamente por el pre-save hook
      role: 'user' // Rol por defecto
    });

    // Generar token JWT
    const token = generateToken(user._id.toString());

    logger.info('User registered successfully', { userId: user._id, email });

    // Enviar respuesta exitosa
    res.status(201).json({
      success: true,
      data: {
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
        token,
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Registration error', { 
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined 
    });
    
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation errors during login', { errors: errors.array() });
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      logger.warn('Failed login attempt', { email });
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    logger.info('User logged in', { userId: user._id, email });

    // Send response with token (without password)
    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token,
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Login error', { error: errorMessage });
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
};

// Extender la interfaz Request de Express para incluir la propiedad user
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

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req: Request, res: Response) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user || !req.user.id) {
      logger.warn('Unauthorized access to profile');
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      });
    }

    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      logger.warn('User not found', { userId: req.user.id });
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    logger.info('User profile retrieved', { userId: user._id });
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Get profile error', { error: errorMessage });
    res.status(500).json({ 
      success: false,
      message: 'Server error while retrieving profile' 
    });
  }
};
