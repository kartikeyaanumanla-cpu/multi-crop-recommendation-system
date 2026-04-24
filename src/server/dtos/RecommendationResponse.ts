export interface TimelineEvent {
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
  timeline: TimelineEvent[];
  marketPrice?: RealTimePrice;
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
