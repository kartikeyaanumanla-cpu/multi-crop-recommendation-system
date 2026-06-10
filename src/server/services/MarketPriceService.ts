import axios from 'axios';
import NodeCache from 'node-cache';

export interface DataGovInRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

export interface DataGovInResponse {
  created: number;
  updated: number;
  created_date: string;
  updated_date: string;
  active: string;
  index_name: string;
  org: string[];
  org_type: string;
  source: string;
  title: string;
  external_ws_url: string;
  visualizable: string;
  field: any[];
  target_bucket: {
    index: string;
    type: string;
    field: string;
  };
  desc: string;
  message: string;
  version: string;
  status: string;
  total: number;
  count: number;
  limit: string;
  offset: string;
  records: DataGovInRecord[];
}

export interface RealTimePrice {
  pricePerKg: number;
  state: string;
  district: string;
  market: string;
  isLive: boolean;
}

export class MarketPriceService {
  private readonly API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
  
  // Cache prices for 4 hours to respect rate limits and improve UX drastically
  private cache = new NodeCache({ stdTTL: 14400, checkperiod: 3600 });

  // A robust fallback database mimicking standard average minimum support prices (MSP) / market averages (in ₹/kg)
  private readonly STATIC_PRICE_FALLBACK: Record<string, number> = {
    'Rice': 43.50,
    'Wheat': 28.00,
    'Mango': 85.00,
    'Coffee': 350.00,
    'Banana': 35.00,
    'Cotton': 80.00,
    'Jute': 45.00,
    'Coconut': 40.00,
    'Papaya': 25.00,
    'Orange': 60.00,
    'Apple': 120.00,
    'Muskmelon': 30.00,
    'Watermelon': 15.00,
    'Grapes': 70.00,
    'Sugarcane': 8.00,   // Cash crop usually sold by tonne, converted approx
    'Gram': 55.00,
    'Tur': 110.00,
    'Pigeonpeas': 110.00,
    'Lentil': 75.00,
    'Maize': 22.00,
    'Mothbeans': 65.00,
    'Mungbean': 85.00,
    'Blackgram': 90.00,
    'Pomegranate': 130.00, 
    'Kidneybeans': 120.00,
    'Chickpea': 60.00,
    // Multi-crop system crops
    'Soybean': 48.00,
    'Sorghum': 30.00,
    'Pearl Millet': 25.00,
    'Green Gram': 85.00,
    'Black Gram': 90.00,
    'Cowpea': 65.00,
    'Peanut': 55.00,
    'Sunflower': 45.00,
    'Mustard': 58.00
  };

  /**
   * Fetches the market price for a given crop and returns the converted price per Kg.
   * Leverages Geolocation (State/District) if provided, falling back to national averages, and finally static DB.
   */
  public async getPriceForCrop(cropName: string, state?: string, district?: string): Promise<RealTimePrice | null> {
    const formattedCropName = cropName.charAt(0).toUpperCase() + cropName.slice(1).toLowerCase();
    const cacheKey = `${formattedCropName}_${state || 'ALL'}`;
    
    // Check Cache First
    const cachedResponse = this.cache.get<RealTimePrice>(cacheKey);
    if (cachedResponse) {
      console.log(`[MarketPriceService] Cache Hit for: ${cacheKey}`);
      return cachedResponse;
    }

    const apiKey = process.env.DATA_GOV_IN_API_KEY;
    
    // Abstracted fetch logic
    const fetchFromGovAPI = async (stateFilter?: string) => {
      try {
        const params: any = {
          'api-key': apiKey,
          'format': 'json',
          'limit': 15,
          'filters[commodity]': formattedCropName
        };
        if (stateFilter) {
          params['filters[state]'] = stateFilter;
        }

        const response = await axios.get<DataGovInResponse>(this.API_URL, {
          params,
          timeout: 4000
        });

        if (response.data && response.data.records && response.data.records.length > 0) {
          return response.data.records.find(r => r.modal_price && !isNaN(Number(r.modal_price)));
        }
        return null;
      } catch (e) {
        return null;
      }
    };

    if (apiKey) {
      console.log(`[MarketPriceService] Cache Miss. Fetching live for: ${cacheKey}`);
      
      let validRecord = null;
      if (state) validRecord = await fetchFromGovAPI(state);

      if (!validRecord) {
        if (state) console.log(`[MarketPriceService] No state-specific records found, falling back to national search...`);
        validRecord = await fetchFromGovAPI();
      }

      if (validRecord) {
        const pricePerKg = Number(validRecord.modal_price) / 100;
        console.log(`[MarketPriceService] Success: Found price ${pricePerKg} ₹/kg for ${formattedCropName}`);
        const result: RealTimePrice = {
          pricePerKg,
          state: validRecord.state,
          district: validRecord.district,
          market: validRecord.market,
          isLive: true
        };
        this.cache.set(cacheKey, result);
        return result;
      }
    } else {
      console.warn('[MarketPriceService] API Key missing, skipping live fetch.');
    }

    // Ultimate Fallback: Static Database
    console.warn(`[MarketPriceService] Resorting to internal Static Database for: ${formattedCropName}`);
    // Case-insensitive lookup to handle multi-word crop names like "Green Gram" vs "Green gram"
    const fallbackKey = Object.keys(this.STATIC_PRICE_FALLBACK).find(
      k => k.toLowerCase() === cropName.toLowerCase()
    );
    const fallbackPrice = fallbackKey ? this.STATIC_PRICE_FALLBACK[fallbackKey] : undefined;
    
    if (fallbackPrice) {
      const result: RealTimePrice = {
        pricePerKg: fallbackPrice,
        state: 'National Avg',
        district: '-',
        market: 'Historic Database',
        isLive: false
      };
      this.cache.set(cacheKey, result); // Cache fallback to prevent recalculation
      return result;
    }

    return null;
  }
}
