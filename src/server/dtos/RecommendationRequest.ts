import { z } from 'zod';

export const SuggestionRequestSchema = z.object({
  acres: z.number().positive('Acres must be a positive number').max(10000, 'Acres cannot exceed 10,000'),
  soilType: z.string().min(1, 'Soil type is required'),
  soilPh: z.number().min(3.0, 'pH too low').max(11.0, 'pH too high'),
  rainfall: z.number().min(0).max(4000, 'Rainfall abnormally high'),
  irrigationAvailability: z.boolean(),
  waterLevel: z.enum(['Low', 'Medium', 'High']),
  season: z.enum(['Kharif', 'Rabi', 'Zaid']),
  N: z.number().min(0).max(500),
  P: z.number().min(0).max(500),
  K: z.number().min(0).max(500),
  temperature: z.number().min(-10, 'Temp too low').max(60, 'Temp too high'),
  humidity: z.number().min(0).max(100),
  state: z.string().optional(),
  district: z.string().optional()
});

export type SuggestionRequest = z.infer<typeof SuggestionRequestSchema>;

export const RecommendationRequestSchema = z.object({
  acres: z.number().positive('Acres must be a positive number').max(10000, 'Acres cannot exceed 10,000'),
  soilType: z.string().min(1, 'Soil type is required'),
  soilPh: z.number().min(3.0, 'pH too low').max(11.0, 'pH too high'),
  rainfall: z.number().min(0).max(4000, 'Rainfall abnormally high'),
  irrigationAvailability: z.boolean(),
  waterLevel: z.enum(['Low', 'Medium', 'High']),
  season: z.enum(['Kharif', 'Rabi', 'Zaid']),
  N: z.number().min(0).max(500),
  P: z.number().min(0).max(500),
  K: z.number().min(0).max(500),
  temperature: z.number().min(-10, 'Temp too low').max(60, 'Temp too high'),
  humidity: z.number().min(0).max(100),
  state: z.string().optional(),
  district: z.string().optional(),
  selectedMainCrop: z.string().min(1, 'Selected main crop is required'),
});

export type RecommendationRequest = z.infer<typeof RecommendationRequestSchema>;
