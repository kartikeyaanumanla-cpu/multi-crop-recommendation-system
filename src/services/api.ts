import axios from 'axios';
import { RecommendationRequest, RecommendationResponse, SuggestionRequest, SuggestionResponse, ApiResponse } from '../types';

// In this environment, we use relative paths to hit the Express/Vite proxy
const API_BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const suggestCrops = async (data: SuggestionRequest): Promise<SuggestionResponse> => {
  const response = await axios.post<ApiResponse<SuggestionResponse>>(`${API_BASE_URL}/suggest-crops`, data, {
    headers: getAuthHeaders()
  });
  
  if (response.data.status === 'success' && response.data.data) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Failed to fetch crop suggestions');
};

export const getRecommendation = async (data: RecommendationRequest): Promise<RecommendationResponse> => {
  const response = await axios.post<ApiResponse<RecommendationResponse>>(`${API_BASE_URL}/recommend`, data, {
    headers: getAuthHeaders()
  });
  
  if (response.data.status === 'success' && response.data.data) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Failed to fetch recommendation');
};
