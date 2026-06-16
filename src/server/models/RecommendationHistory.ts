import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendationHistory extends Document {
  userId?: mongoose.Types.ObjectId;
  requestPayload: {
    selectedMainCrop: string;
    acres: number;
    soilType: string;
    soilPh: number;
    rainfall: number;
    irrigationAvailability: boolean;
    waterLevel: string;
    season: string;
    N: number;
    P: number;
    K: number;
    temperature: number;
    humidity: number;
  };
  strategies: Array<{
    id: string;
    name: string;
    overallScore: number;
    waterUsageScore: number;
    estimatedProfit: number;
    riskLevel: string;
    mainCrop: string;
    sideCrops: string[];
    landDistribution: Map<string, number>;
    farmLayout: {
      cropDistribution: Map<string, number>;
      layoutType: string;
      sowingPattern: string;
    };
    predictedYield: Map<string, number>;
    waterRequirementPerCrop: Map<string, number>;
    timeline: Array<{
      month: string;
      activity: string;
    }>;
    marketPrice?: {
      pricePerKg: number;
      state: string;
      district: string;
      market: string;
    };
  }>;
  createdAt: Date;
}

const RecommendationHistorySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  requestPayload: {
    selectedMainCrop: { type: String, required: true },
    acres: { type: Number, required: true },
    soilType: { type: String, required: true },
    soilPh: { type: Number, required: true },
    rainfall: { type: Number, required: true },
    irrigationAvailability: { type: Boolean, required: true },
    waterLevel: { type: String, required: true },
    season: { type: String, required: true },
    N: { type: Number, required: true },
    P: { type: Number, required: true },
    K: { type: Number, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true }
  },
  strategies: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    overallScore: { type: Number, required: true },
    waterUsageScore: { type: Number, required: true },
    estimatedProfit: { type: Number, required: true },
    riskLevel: { type: String, required: true },
    mainCrop: { type: String, required: true },
    sideCrops: [{ type: String }],
    landDistribution: { type: Map, of: Number },
    farmLayout: {
      cropDistribution: { type: Map, of: Number },
      layoutType: { type: String },
      sowingPattern: { type: String }
    },
    predictedYield: { type: Map, of: Number },
    waterRequirementPerCrop: { type: Map, of: Number },
    timeline: [{
      month: { type: String, required: true },
      activity: { type: String, required: true }
    }],
    marketPrice: {
      pricePerKg: { type: Number },
      state: { type: String },
      district: { type: String },
      market: { type: String }
    }
  }],
  createdAt: { type: Date, default: Date.now }
});

export const RecommendationHistory = mongoose.model<IRecommendationHistory>('RecommendationHistory', RecommendationHistorySchema);
