import { Router } from 'express';
import { body } from 'express-validator';
import { getTopology, discoverDevices } from '../controllers/topology.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Apply protect middleware to all routes
router.use(protect);

// @route   GET /api/topology
router.get('/', getTopology);

// @route   POST /api/topology/discover
router.post(
  '/discover',
  [
    body('ipRange', 'IP range is required').not().isEmpty(),
    body('ipRange', 'Invalid IP range').matches(/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/),
  ],
  discoverDevices
);

export default router;
