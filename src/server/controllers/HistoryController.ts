import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { RecommendationHistory } from '../models/RecommendationHistory';
import { HarvestLog } from '../models/HarvestLog';

export class HistoryController {
  
  static async getHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Fetch all recommendations for the user
      const recommendations = await RecommendationHistory.find({ userId })
        .sort({ createdAt: -1 })
        .lean();

      // Fetch harvest logs for the user
      const harvestLogs = await HarvestLog.find({ userId }).lean();

      // Combine them
      const history = recommendations.map(rec => {
        const log = harvestLogs.find(l => l.recommendationId.toString() === rec._id.toString());
        return {
          ...rec,
          harvestLog: log || null
        };
      });

      res.status(200).json(history);
    } catch (error: any) {
      console.error('Error fetching history:', error);
      res.status(500).json({ error: 'Failed to fetch history.' });
    }
  }

  static async logHarvest(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { recommendationId, cropYields, actualProfit, harvestDate, feedbackNotes, rating } = req.body;

      if (!recommendationId || !cropYields || actualProfit === undefined || !harvestDate) {
        return res.status(400).json({ error: 'Missing required harvest data.' });
      }

      // Check if a log already exists for this recommendation
      let harvestLog = await HarvestLog.findOne({ recommendationId, userId });

      if (harvestLog) {
        // Update existing
        harvestLog.cropYields = cropYields;
        harvestLog.actualProfit = actualProfit;
        harvestLog.harvestDate = new Date(harvestDate);
        harvestLog.feedbackNotes = feedbackNotes;
        harvestLog.rating = rating;
        await harvestLog.save();
      } else {
        // Create new
        harvestLog = new HarvestLog({
          userId,
          recommendationId,
          cropYields,
          actualProfit,
          harvestDate: new Date(harvestDate),
          feedbackNotes,
          rating
        });
        await harvestLog.save();
      }

      res.status(200).json({ message: 'Harvest logged successfully', harvestLog });
    } catch (error: any) {
      console.error('Error logging harvest:', error);
      res.status(500).json({ error: 'Failed to log harvest.' });
    }
  }

  static async deleteHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;

      const deletedRec = await RecommendationHistory.findOneAndDelete({ _id: id, userId });
      if (!deletedRec) {
        return res.status(404).json({ error: 'History record not found or not authorized to delete.' });
      }

      // Also delete any associated harvest logs
      await HarvestLog.deleteMany({ recommendationId: id, userId });

      res.status(200).json({ message: 'History record deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting history:', error);
      res.status(500).json({ error: 'Failed to delete history record.' });
    }
  }
}
