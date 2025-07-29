import mongoose, { Document, Schema } from 'mongoose';

export interface ISimulationResult {
  nodes: any[];
  links: any[];
  metrics: Record<string, any>;
}

export interface ISimulation extends Document {
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  userId: mongoose.Types.ObjectId;
  parameters: Record<string, any>;
  results?: ISimulationResult;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

const simulationSchema = new Schema<ISimulation>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    parameters: {
      type: Schema.Types.Mixed,
      required: true,
    },
    results: {
      nodes: [Schema.Types.Mixed],
      links: [Schema.Types.Mixed],
      metrics: Schema.Types.Mixed,
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
simulationSchema.index({ userId: 1, status: 1 });
simulationSchema.index({ createdAt: -1 });

const Simulation = mongoose.model<ISimulation>('Simulation', simulationSchema);

export default Simulation;
