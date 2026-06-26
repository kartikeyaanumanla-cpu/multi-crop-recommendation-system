export interface SuggestionRequest {
  acres: number;
  soilType: string;
  soilPh: number;
  rainfall: number;
  irrigationAvailability: boolean;
  waterLevel: 'Low' | 'Medium' | 'High';
  season: 'Kharif' | 'Rabi' | 'Zaid';
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  state?: string;      // Auto-detected via GPS
  district?: string;   // Auto-detected via GPS
}

export interface RecommendationRequest extends SuggestionRequest {
  selectedMainCrop: string;
}

export interface CropTimelineEvent {
  month: string;
  activity: string;
}

export interface FarmLayout {
  cropDistribution: Record<string, number>;
  layoutType: string;
  sowingPattern: string;
}

export interface RealTimePrice {
  pricePerKg: number;
  state: string;
  district: string;
  market: string;
  isLive: boolean;
}

export interface Strategy {
  id: string;
  name: string;
  overallScore: number;
  waterUsageScore: number;
  estimatedProfit: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  mainCrop: string;
  sideCrops: string[];
  landDistribution: Record<string, number>;
  farmLayout: FarmLayout;
  predictedYield: Record<string, number>;
  waterRequirementPerCrop: Record<string, number>;
  timeline: CropTimelineEvent[];
  marketPrice?: RealTimePrice;
  cropPrices?: Record<string, RealTimePrice>;
}

export interface RecommendationResponse {
  strategies: Strategy[];
}

export interface MainCropSuggestion {
  cropName: string;
  matchScore: number;
  reason: string;
  expectedYieldPerAcre: number;
  marketPrice?: RealTimePrice;
}

export interface SuggestionResponse {
  suggestions: MainCropSuggestion[];
}

export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  data?: T;
  message?: string;
}
