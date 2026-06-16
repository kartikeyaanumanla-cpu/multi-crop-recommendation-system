import { Request, Response, NextFunction } from 'express';
import { RecommendationService } from '../services/RecommendationService';
import { RecommendationRequestSchema, SuggestionRequestSchema } from '../dtos/RecommendationRequest';
import { AuthRequest } from '../middleware/auth';

export class RecommendationController {
  private recommendationService: RecommendationService;

  constructor() {
    this.recommendationService = new RecommendationService();
  }

  public handleSuggestion = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const validatedData = SuggestionRequestSchema.parse(req.body);
      const userId = req.user?.userId;
      const suggestions = await this.recommendationService.suggestCrops(validatedData, userId);
      
      return res.status(200).json({
        status: 'success',
        data: suggestions
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/recommend
   * Handles crop recommendation requests with validation
   */
  public handleRecommendation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validation (Equivalent to @Valid)
      const validatedData = RecommendationRequestSchema.parse(req.body);
      const userId = req.user?.userId;

      // Async call to service (which now calls Python)
      const recommendation = await this.recommendationService.recommendCrops(validatedData, userId);
      
      return res.status(200).json({
        status: 'success',
        data: recommendation
      });
    } catch (error) {
      // Pass to Global Exception Handler
      next(error);
    }
  };
}
