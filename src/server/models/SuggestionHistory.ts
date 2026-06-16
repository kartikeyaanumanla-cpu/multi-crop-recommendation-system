import mongoose, { Schema, Document } from 'mongoose';

// Interface resembling the SuggestionRequest & SuggestionResponse
export interface ISuggestionHistory extends Document {
  userId?: mongoose.Types.ObjectId;
  requestPayload: {
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
  suggestions: Array<{
    cropName: string;
    matchScore: number;
    reason: string;
    expectedYieldPerAcre: number;
    marketPrice?: {
      pricePerKg: number;
      state: string;
      district: string;
      market: string;
    };
  }>;
  createdAt: Date;
}

const SuggestionHistorySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  requestPayload: {
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
  suggestions: [{
    cropName: { type: String, required: true },
    matchScore: { type: Number, required: true },
    reason: { type: String, required: true },
    expectedYieldPerAcre: { type: Number, required: true },
    marketPrice: {
      pricePerKg: { type: Number },
      state: { type: String },
      district: { type: String },
      market: { type: String }
    }
  }],
  createdAt: { type: Date, default: Date.now }
});

export const SuggestionHistory = mongoose.model<ISuggestionHistory>('SuggestionHistory', SuggestionHistorySchema);
