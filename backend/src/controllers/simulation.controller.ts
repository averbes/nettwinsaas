import { Request, Response } from 'express';
import Simulation, { ISimulation } from '../models/simulation.model';
import { validationResult } from 'express-validator';

// @desc    Create a new simulation
// @route   POST /api/simulations
// @access  Private
export const createSimulation = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, parameters } = req.body;
    const userId = (req as any).user.id;

    const simulation = new Simulation({
      name,
      description,
      parameters,
      userId,
      status: 'pending',
    });

    const createdSimulation = await simulation.save();
    res.status(201).json(createdSimulation);
  } catch (error) {
    console.error('Create simulation error:', error);
    res.status(500).json({ message: 'Error creating simulation' });
  }
};

// @desc    Get all simulations for the authenticated user
// @route   GET /api/simulations
// @access  Private
export const getSimulations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status, limit = 10, page = 1 } = req.query;
    
    const query: any = { userId };
    if (status) query.status = status;

    const simulations = await Simulation.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const count = await Simulation.countDocuments(query);

    res.json({
      data: simulations,
      pagination: {
        total: count,
        page: Number(page),
        pages: Math.ceil(count / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error('Get simulations error:', error);
    res.status(500).json({ message: 'Error fetching simulations' });
  }
};

// @desc    Get simulation by ID
// @route   GET /api/simulations/:id
// @access  Private
export const getSimulationById = async (req: Request, res: Response) => {
  try {
    const simulation = await Simulation.findOne({
      _id: req.params.id,
      userId: (req as any).user.id,
    });

    if (!simulation) {
      return res.status(404).json({ message: 'Simulation not found' });
    }

    res.json(simulation);
  } catch (error) {
    console.error('Get simulation by ID error:', error);
    res.status(500).json({ message: 'Error fetching simulation' });
  }
};

// @desc    Update simulation
// @route   PUT /api/simulations/:id
// @access  Private
export const updateSimulation = async (req: Request, res: Response) => {
  try {
    const { name, description, parameters, status, results } = req.body;
    
    const simulation = await Simulation.findOne({
      _id: req.params.id,
      userId: (req as any).user.id,
    });

    if (!simulation) {
      return res.status(404).json({ message: 'Simulation not found' });
    }

    // Update fields if they exist in the request
    if (name) simulation.name = name;
    if (description) simulation.description = description;
    if (parameters) simulation.parameters = parameters;
    if (status) simulation.status = status;
    if (results) simulation.results = results;

    // Update timestamps based on status
    if (status === 'running' && simulation.status !== 'running') {
      simulation.startedAt = new Date();
    } else if ((status === 'completed' || status === 'failed') && 
               simulation.status === 'running') {
      simulation.completedAt = new Date();
    }

    const updatedSimulation = await simulation.save();
    res.json(updatedSimulation);
  } catch (error) {
    console.error('Update simulation error:', error);
    res.status(500).json({ message: 'Error updating simulation' });
  }
};

// @desc    Delete simulation
// @route   DELETE /api/simulations/:id
// @access  Private
export const deleteSimulation = async (req: Request, res: Response) => {
  try {
    const simulation = await Simulation.findOne({
      _id: req.params.id,
      userId: (req as any).user.id,
    });

    if (!simulation) {
      return res.status(404).json({ message: 'Simulation not found' });
    }

    await simulation.deleteOne();
    res.json({ message: 'Simulation removed' });
  } catch (error) {
    console.error('Delete simulation error:', error);
    res.status(500).json({ message: 'Error deleting simulation' });
  }
};
