import { Router } from 'express';
import { body } from 'express-validator';
import { 
  createSimulation, 
  getSimulations, 
  getSimulationById, 
  updateSimulation, 
  deleteSimulation 
} from '../controllers/simulation.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Apply protect middleware to all routes
router.use(protect);

// @route   POST /api/simulations
router.post(
  '/',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('parameters', 'Parameters are required').isObject(),
  ],
  createSimulation
);

// @route   GET /api/simulations
router.get('/', getSimulations);

// @route   GET /api/simulations/:id
router.get('/:id', getSimulationById);

// @route   PUT /api/simulations/:id
router.put(
  '/:id',
  [
    body('name', 'Name is required').optional().not().isEmpty(),
    body('parameters', 'Parameters must be an object').optional().isObject(),
    body('status', 'Invalid status').optional().isIn(['pending', 'running', 'completed', 'failed']),
    body('results', 'Results must be an object').optional().isObject(),
  ],
  updateSimulation
);

// @route   DELETE /api/simulations/:id
router.delete('/:id', deleteSimulation);

export default router;
