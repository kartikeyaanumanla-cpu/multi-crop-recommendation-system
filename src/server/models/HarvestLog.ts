import mongoose, { Schema, Document } from 'mongoose';

export interface IHarvestLog extends Document {
  userId: mongoose.Types.ObjectId;
  recommendationId: mongoose.Types.ObjectId;
  cropYields: Map<string, number>;
  actualProfit: number;
  harvestDate: Date;
  feedbackNotes?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const HarvestLogSchema = new Schema<IHarvestLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recommendationId: { type: Schema.Types.ObjectId, ref: 'RecommendationHistory', required: true },
    cropYields: { type: Map, of: Number, required: true },
    actualProfit: { type: Number, required: true },
    harvestDate: { type: Date, required: true },
    feedbackNotes: { type: String },
    rating: { type: Number, min: 1, max: 5 }
  },
  { timestamps: true }
);

export const HarvestLog = mongoose.model<IHarvestLog>('HarvestLog', HarvestLogSchema);
