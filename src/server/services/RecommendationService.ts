import axios from 'axios';
import { RecommendationRequest, SuggestionRequest } from '../dtos/RecommendationRequest';
import { RecommendationResponse, SuggestionResponse } from '../dtos/RecommendationResponse';
import { InternalServerError } from '../exceptions/AppError';
import { SuggestionHistory } from '../models/SuggestionHistory';
import { RecommendationHistory } from '../models/RecommendationHistory';
import { MarketPriceService } from './MarketPriceService';

export class RecommendationService {
  // Configurable base URL for Python microservice via environment variables
  private readonly PYTHON_BASE_URL = process.env.PYTHON_SERVICE_BASE_URL || 'http://127.0.0.1:5000';
  private readonly PYTHON_SERVICE_URL = `${this.PYTHON_BASE_URL}/predict`;
  private readonly PYTHON_SUGGEST_URL = `${this.PYTHON_BASE_URL}/suggest-main-crops`;
  private marketPriceService: MarketPriceService;

  constructor() {
    this.marketPriceService = new MarketPriceService();
  }

  public async suggestCrops(request: SuggestionRequest, userId?: string): Promise<SuggestionResponse> {
    try {
      const response = await axios.post<SuggestionResponse>(
        this.PYTHON_SUGGEST_URL, 
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000
        }
      );

      // Fetch market prices for suggested crops concurrently
      const enhancedSuggestions = await Promise.all(
        response.data.suggestions.map(async (suggestion) => {
          const marketPrice = await this.marketPriceService.getPriceForCrop(
            suggestion.cropName, 
            request.state, 
            request.district
          );
          return marketPrice ? { ...suggestion, marketPrice } : suggestion;
        })
      );
      
      response.data.suggestions = enhancedSuggestions;

      // Fire and forget history persistence
      const history = new SuggestionHistory({
        userId,
        requestPayload: request,
        suggestions: enhancedSuggestions
      });
      history.save().catch(err => console.error('Failed to save SuggestionHistory:', err));

      return response.data;
    } catch (error: any) {
      console.error('Error calling Python Microservice for Suggestion:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        throw new InternalServerError('Python microservice is not reachable on port 5000');
      }
      
      throw new InternalServerError(
        error.response?.data?.detail || 'Failed to get crop suggestions from AI service'
      );
    }
  }

  /**
   * Calls the external Python FastAPI microservice.
   * Equivalent to RestTemplate.postForObject()
   */
  public async recommendCrops(request: RecommendationRequest, userId?: string): Promise<RecommendationResponse> {
    try {
      const response = await axios.post<RecommendationResponse>(
        this.PYTHON_SERVICE_URL, 
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000 // 5 second timeout
        }
      );

      // Compute dynamic Profit & Scores for strategies using real API data
      const enhancedStrategies = await Promise.all(
        response.data.strategies.map(async (strategy) => {
          // Fetch prices for all 3 crops simultaneously
          const [mainPrice, side1Price, side2Price] = await Promise.all([
            this.marketPriceService.getPriceForCrop(strategy.mainCrop, request.state, request.district),
            strategy.sideCrops[0] ? this.marketPriceService.getPriceForCrop(strategy.sideCrops[0], request.state, request.district) : null,
            strategy.sideCrops[1] ? this.marketPriceService.getPriceForCrop(strategy.sideCrops[1], request.state, request.district) : null
          ]);
          
          let totalProfit = 0;
          if (mainPrice) {
            totalProfit += strategy.predictedYield[strategy.mainCrop] * mainPrice.pricePerKg;
          }
          if (side1Price && strategy.sideCrops[0]) {
            totalProfit += strategy.predictedYield[strategy.sideCrops[0]] * side1Price.pricePerKg;
          }
          if (side2Price && strategy.sideCrops[1]) {
            totalProfit += strategy.predictedYield[strategy.sideCrops[1]] * side2Price.pricePerKg;
          }

          strategy.estimatedProfit = Math.round(totalProfit);

          // Calculate Dynamic Overall Score
          const waterEff = strategy.waterUsageScore; // out of 100
          
          // Tightened Profit Envelope: An highly lucrative crop nets > ₹60,000 per acre
          // This keeps typical strategies (₹35k/acre) around 60-70 points instead of maxing out at 100.
          const profitScore = Math.min(100, (totalProfit / (request.acres * 60000)) * 100);
          
          // Weighted algorithm: 40% Profit, 35% Water Efficiency, 25% Base Suitability (Python)
          const baseSuitability = strategy.overallScore; // Transmitted from Python ML baseline
          strategy.overallScore = Math.round((baseSuitability * 0.25) + (waterEff * 0.35) + (profitScore * 0.40));

          return mainPrice ? { ...strategy, marketPrice: mainPrice } : strategy;
        })
      );
      
      response.data.strategies = enhancedStrategies.sort((a, b) => b.overallScore - a.overallScore);

      // Fire and forget history persistence
      const history = new RecommendationHistory({
        userId,
        requestPayload: request,
        strategies: enhancedStrategies
      });
      history.save().catch(err => console.error('Failed to save RecommendationHistory:', err));

      return response.data;
    } catch (error: any) {
      console.error('Error calling Python Microservice:', error.message);
      
      // Handle specific axios errors
      if (error.code === 'ECONNREFUSED') {
        throw new InternalServerError('Python microservice is not reachable on port 5000');
      }
      
      throw new InternalServerError(
        error.response?.data?.detail || 'Failed to get recommendation from AI service'
      );
    }
  }
}
