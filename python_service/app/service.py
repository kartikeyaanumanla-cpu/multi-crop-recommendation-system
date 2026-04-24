import os
import joblib
import uuid
import random
import numpy as np
from typing import List
from .schemas import SuggestionRequest, SuggestionResponse, MainCropSuggestion, CropRequest, CropResponse, Strategy, TimelineEvent, FarmLayout

# Load ML artifacts globally
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ML_DIR = os.path.join(BASE_DIR, 'ml_pipeline')

try:
    rf_model = joblib.load(os.path.join(ML_DIR, 'crop_rf_model.joblib'))
    scaler = joblib.load(os.path.join(ML_DIR, 'feature_scaler.joblib'))
    label_encoder = joblib.load(os.path.join(ML_DIR, 'label_encoder.joblib'))
    
    yield_model = joblib.load(os.path.join(ML_DIR, 'yield_rf_model.joblib'))
    yield_scaler = joblib.load(os.path.join(ML_DIR, 'yield_scaler.joblib'))
    yield_label_encoder = joblib.load(os.path.join(ML_DIR, 'yield_label_encoder.joblib'))
    ML_LOADED = True
except Exception as e:
    print(f"Warning: ML models not loaded. {e}")
    ML_LOADED = False
from .crop_data import CROP_DATABASE

class RecommendationService:
    def __init__(self):
        pass

    def suggest_main_crops(self, request: SuggestionRequest) -> SuggestionResponse:
        if ML_LOADED:
            features = np.array([[
                request.N, request.P, request.K, 
                request.temperature, request.humidity, 
                request.soilPh, request.rainfall
            ]])
            
            scaled_features = scaler.transform(features)
            probabilities = rf_model.predict_proba(scaled_features)[0]
            
            # Sort ALL indices descending to find biologically viable combinations
            all_indices_sorted = np.argsort(probabilities)[::-1]
            suggestions = []
            
            req_soil_lower = request.soilType.lower()

            for idx in all_indices_sorted:
                if len(suggestions) >= 5:
                    break
                    
                prob = probabilities[idx]
                if prob > 0.01: # At least 1% ML confidence
                    crop_name_encoded = rf_model.classes_[idx]
                    crop_name = label_encoder.inverse_transform([crop_name_encoded])[0].title()
                    
                    db_crop = next((c for c in CROP_DATABASE if c["name"].lower() == crop_name.lower()), None)
                    
                    if db_crop:
                        # STRICT BIOLOGICAL FILTER: Does it grow in this season?
                        if request.season not in db_crop["seasons"]:
                            continue
                            
                        # STRICT BIOLOGICAL FILTER: Does the soil match even loosely?
                        crop_soils_lower = [t.lower() for t in db_crop["soil_types"]]
                        soil_match = any(t in req_soil_lower or req_soil_lower in t for t in crop_soils_lower)
                        
                        # If soil is completely incompatible, skip unless confidence is overwhelmingly > 80% (implying heavy chemical amendment)
                        if not soil_match and prob < 0.80:
                            continue
                            
                        # STRICT CLIMATE FILTER: Prevent catastrophic water hallucinations
                        water_available = request.rainfall + (400 if request.irrigationAvailability else 0)
                        min_water, max_water = db_crop["water_req_mm"]
                        
                        if water_available < min_water * 0.5:
                            # Catastrophic drought violation. Absolutely exclude.
                            continue
                        elif water_available < min_water:
                            # Exponential drought penalty (up to 30% reduction) dragging it down the ranks
                            penalty = ((min_water - water_available) / min_water) * 0.30
                            prob = max(0, prob - penalty)
                        elif water_available > max_water * 1.5:
                            # Waterlogging decay
                            prob = max(0, prob - 0.20)
                            
                        if prob <= 0.05:
                            continue
                            
                        yield_per_acre = db_crop["yield_per_acre_kg"]
                    else:
                        # Unrecognized Kaggle crop not in our deep DB - skip it to ensure strategy builder works flawlessly
                        continue
                    
                    reason = f"ML Confidence: {prob*100:.1f}%. Optimal for your NPK and specifically viable for {request.season} season."
                    
                    suggestions.append(MainCropSuggestion(
                        cropName=crop_name,
                        matchScore=round(prob * 100),
                        reason=reason,
                        expectedYieldPerAcre=yield_per_acre
                    ))
            
            # If the ML model outputted 0 viable crops for that specific season/soil combo, dynamically fallback to the heuristic engine
            if len(suggestions) >= 2:
                return SuggestionResponse(suggestions=suggestions)
                
        return self._fallback_suggest_main_crops(request)

    def _fallback_suggest_main_crops(self, request: SuggestionRequest) -> SuggestionResponse:
        suggestions = []
        water_available = request.rainfall + (400 if request.irrigationAvailability else 0)
        
        for crop in CROP_DATABASE:
            if request.season not in crop["seasons"]:
                continue
            
            req_soil_lower = request.soilType.lower()
            crop_soils_lower = [t.lower() for t in crop["soil_types"]]
            soil_match = 1.0 if any(t in req_soil_lower or req_soil_lower in t for t in crop_soils_lower) else 0.5
            
            ph_min, ph_max = crop["ph_range"]
            ph_diff = 0
            if request.soilPh < ph_min: ph_diff = ph_min - request.soilPh
            elif request.soilPh > ph_max: ph_diff = request.soilPh - ph_max
            ph_score = max(0, 100 - (ph_diff * 20))
            
            req_min, req_max = crop["water_req_mm"]
            water_score = 100
            if water_available < req_min:
                water_score = max(0, 100 - ((req_min - water_available) / req_min) * 100)
            elif water_available > req_max * 1.5:
                water_score = 80
                
            match_score = round((soil_match * 100 * 0.35) + (ph_score * 0.35) + (water_score * 0.30))
            
            if match_score > 40:
                reason = f"Excellent match for your {request.soilType} soil." if match_score > 80 else f"Suitable choice based on water availability."
                suggestions.append(MainCropSuggestion(
                    cropName=crop["name"],
                    matchScore=match_score,
                    reason=reason,
                    expectedYieldPerAcre=crop["yield_per_acre_kg"]
                ))
                
        suggestions.sort(key=lambda x: x.matchScore, reverse=True)
        return SuggestionResponse(suggestions=suggestions[:5])

    def get_recommendation(self, request: CropRequest) -> CropResponse:
        """
        Generates 3 distinct 3-crop combination strategies using a 1 Main + 2 Companions architecture.
        """
        main_crop_name = request.selectedMainCrop
        main_crop_data = next((c for c in CROP_DATABASE if c["name"].lower() == main_crop_name.lower()), None)
        
        if not main_crop_data:
            main_crop_data = CROP_DATABASE[0]
            main_crop_name = main_crop_data["name"]

        water_available = request.rainfall + (400 if request.irrigationAvailability else 0)
        acres = request.acres
        
        # We need 2 companion crops (Filter by season, exclude main crop)
        companions = [c for c in CROP_DATABASE if c["name"] != main_crop_name and request.season in c["seasons"]]
        legumes = [c for c in companions if c["is_legume_nitrogen_fixer"]]
        others = [c for c in companions if not c["is_legume_nitrogen_fixer"]]
        
        strategies = []
        
        strategy_profiles = [
            {"name": "High Yield Focus", "layout": "block cropping", "pattern": "Separate large blocks for high mechanization efficiency"},
            {"name": "Water Conservation", "layout": "strip cropping", "pattern": "Alternating strips to minimize water runoff and soil erosion"},
            {"name": "Balanced & Soil Health", "layout": "intercropping rows", "pattern": "2:1 alternating rows for mutual pest deterrence"}
        ]
        
        # Seed pseudo-randomness so same inputs give same companions generally
        random.seed(len(request.selectedMainCrop) + request.acres)
        
        for i, profile in enumerate(strategy_profiles):
            side_crops = []
            
            # Rule: Always try to include a nitrogen-fixing legume as Companion 1
            if legumes:
                side_crops.append(random.choice(legumes))
            
            # Companion 2
            pool = others if others else companions
            if pool:
                side_crop_2 = random.choice(pool)
                # prevent dupes
                attempts = 0
                while side_crop_2 in side_crops and attempts < 10:
                    side_crop_2 = random.choice(pool)
                    attempts += 1
                if side_crop_2 not in side_crops:
                    side_crops.append(side_crop_2)
            
            # Fallbacks
            while len(side_crops) < 2 and companions:
                candidate = random.choice(companions)
                if candidate not in side_crops:
                    side_crops.append(candidate)
                    
            if not side_crops:
                side_crops = [CROP_DATABASE[1], CROP_DATABASE[2]]
                
            c1, c2 = side_crops[0], (side_crops[1] if len(side_crops) > 1 else side_crops[0])

            # Distributions based on profile
            if i == 0:
                dist = {main_crop_name: 0.7, c1["name"]: 0.15, c2["name"]: 0.15}
            elif i == 1:
                dist = {main_crop_name: 0.6, c1["name"]: 0.2, c2["name"]: 0.2}
            else:
                dist = {main_crop_name: 0.5, c1["name"]: 0.3, c2["name"]: 0.2}
                
            land_dist = {k: round(v * acres, 2) for k, v in dist.items()}
            
            def get_predicted_yield(crop_n, acres_val):
                base_yield = 0
                if ML_LOADED and 'yield_model' in globals():
                    try:
                        encoded_c = yield_label_encoder.transform([crop_n.title()])[0]
                        feats = np.array([[encoded_c, request.N, request.P, request.K, request.temperature, request.rainfall, request.soilPh]])
                        scaled = yield_scaler.transform(feats)
                        pred = yield_model.predict(scaled)[0]
                        # Convert Tonnes/Hectare to Kg/Acre 
                        if pred < 200: 
                            pred = (pred * 1000) / 2.471
                            
                        # CLAMP: Prevent unbounded ML hallucinations from inflating profit
                        db_ref = next((c for c in CROP_DATABASE if c["name"].lower() == crop_n.lower()), None)
                        if db_ref:
                            max_realistic = db_ref["yield_per_acre_kg"] * 1.25 # 25% max over-performance
                            pred = min(pred, max_realistic)
                            
                        base_yield = pred * acres_val
                    except Exception:
                        pass
                
                if base_yield == 0:
                    crop_d = next((c for c in CROP_DATABASE if c["name"].lower() == crop_n.lower()), CROP_DATABASE[0])
                    base_yield = crop_d["yield_per_acre_kg"] * acres_val
                
                # Apply Dynamic Layout Synergies
                if i == 0: return round(base_yield * 1.05) # Block
                elif i == 1: return round(base_yield * 1.02) # Strip
                else: return round(base_yield * 1.08) # Intercropping

            yields = {
                main_crop_name: get_predicted_yield(main_crop_name, land_dist[main_crop_name]),
                c1["name"]: get_predicted_yield(c1["name"], land_dist[c1["name"]]),
                c2["name"]: get_predicted_yield(c2["name"], land_dist[c2["name"]])
            }
            
            water_reqs = {
                main_crop_name: main_crop_data["water_req_mm"][0],
                c1["name"]: c1["water_req_mm"][0],
                c2["name"]: c2["water_req_mm"][0]
            }
            
            # REALISTIC WATER CALCULATION (Weighted by Acres)
            weighted_water_score = 0
            for crop_n, req_mm in water_reqs.items():
                if water_available < req_mm:
                    # Drought penalty
                    score = max(20, (water_available / req_mm) * 100)
                else:
                    # Overwatering penalty
                    excess = water_available - req_mm
                    penalty = (excess / req_mm) * 50
                    score = max(40, 100 - penalty)
                
                # Weight crop score by its specific land footprint
                acres_for_crop = land_dist[crop_n]
                weighted_water_score += score * (acres_for_crop / acres)
            
            water_eff = weighted_water_score
            if i == 1: water_eff = min(100, water_eff * 1.15) # Strip cropping conserves runoff
            
            # DYNAMIC RISK ASSESSMENT
            high_risk_crops = ["Cotton", "Sugarcane", "Tomato", "Papaya"]
            risk = "Medium"
            crop_names = [main_crop_name, c1["name"], c2["name"]]
            if any(c in high_risk_crops for c in crop_names) or water_eff < 55:
                risk = "High"
            elif water_eff > 85 and i > 0:
                risk = "Low"

            # BASAL SUITABILITY (Sent to Node.js as overallScore)
            req_soil_lower = request.soilType.lower()
            mc_soils = [t.lower() for t in main_crop_data["soil_types"]]
            soil_compat = 95 if any(t in req_soil_lower or req_soil_lower in t for t in mc_soils) else 65
            
            layout_bonus = 15 if i == 2 else (5 if i == 1 else 0)
            base_suitability = min(100, (soil_compat * 0.6) + layout_bonus)

            # BIOLOGICALLY-ACCURATE TIMELINE
            dur_main_days = main_crop_data.get("duration_days", 120)
            dur_c1_days = c1.get("duration_days", 90)
            dur_c2_days = c2.get("duration_days", 90)
            
            import math
            max_months = math.ceil(max(dur_main_days, dur_c1_days, dur_c2_days) / 30.0)
            
            timeline_events = []
            timeline_events.append(TimelineEvent(
                month="Month 1", 
                activity=f"Land preparation, soil treatment, and sowing of {main_crop_name}, {c1['name']}, and {c2['name']}."
            ))
            
            for m in range(2, max_months + 1):
                activities = []
                current_day = m * 30
                
                # Check for each crop's status based on current day vs its total duration
                for crop_n, duration in [
                    (main_crop_name, dur_main_days), 
                    (c1['name'], dur_c1_days), 
                    (c2['name'], dur_c2_days)
                ]:
                    # Has it been harvested already?
                    if current_day > duration + 30:
                        continue
                        
                    # Is it harvest time? (Within 20 days of its max duration)
                    if current_day >= duration:
                        prefix = "Primary harvest" if crop_n == main_crop_name else "Harvesting"
                        activities.append(f"{prefix} of {crop_n}")
                    
                    # Is it flowering/fruiting time? (~60-80% of duration)
                    elif current_day >= duration * 0.6 and current_day < duration * 0.8:
                        activities.append(f"Flowering and fruiting stage for {crop_n}")
                        
                    # Is it vegetative? (~30-50% of duration)
                    elif current_day >= duration * 0.3 and current_day < duration * 0.6:
                        activities.append(f"Active vegetative growth for {crop_n}")

                # Deduplicate similar activities intelligently
                if not activities:
                    activities.append("Routine weeding, pest control, and precision irrigation.")
                    
                # Clean up the output string, join by ' | ' for readability
                final_activity = " | ".join(sorted(list(set(activities))))
                
                timeline_events.append(TimelineEvent(
                    month=f"Month {m}", 
                    activity=final_activity
                ))

            strat = Strategy(
                id=f"strat-{uuid.uuid4().hex[:8]}",
                name=profile["name"],
                overallScore=round(base_suitability), # To be aggregated by Node.js Financials
                waterUsageScore=round(water_eff),
                estimatedProfit=0, # Will be strictly calculated by Node.js using real live prices
                riskLevel=risk,
                mainCrop=main_crop_name,
                sideCrops=[c1["name"], c2["name"]],
                landDistribution=land_dist,
                farmLayout=FarmLayout(
                    cropDistribution=land_dist,
                    layoutType=profile["layout"],
                    sowingPattern=profile["pattern"]
                ),
                predictedYield=yields,
                waterRequirementPerCrop=water_reqs,
                timeline=timeline_events
            )
            strategies.append(strat)
            
        strategies.sort(key=lambda x: x.overallScore, reverse=True)
        return CropResponse(strategies=strategies)

# Singleton instance
recommendation_service = RecommendationService()
