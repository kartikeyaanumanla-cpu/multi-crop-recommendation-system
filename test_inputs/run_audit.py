import json
import os
import sys
import traceback

# Add python_service dir so we can import app modules
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
PYTHON_SERVICE_DIR = os.path.join(PROJECT_ROOT, 'python_service')
sys.path.insert(0, PYTHON_SERVICE_DIR)
from app.service import RecommendationService
from app.schemas import SuggestionRequest, CropRequest
from app.crop_data import CROP_DATABASE

service = RecommendationService()

TEST_DIR = SCRIPT_DIR  # The test JSON files are in the same directory as this script

test_files = sorted([f for f in os.listdir(TEST_DIR) if f.endswith('.json')])
results = []

print("=" * 100)
print("COMPREHENSIVE END-TO-END AUDIT")
print("=" * 100)

for tf in test_files:
    filepath = os.path.join(TEST_DIR, tf)
    with open(filepath) as f:
        data = json.load(f)
    
    print(f"\n{'='*100}")
    print(f"TEST: {tf}")
    print(f"  Season={data['season']}, Soil={data['soilType']}, pH={data['soilPh']}")
    print(f"  Rainfall={data['rainfall']}mm, Irrigation={data['irrigationAvailability']}")
    print(f"  Water Available = {data['rainfall'] + (400 if data['irrigationAvailability'] else 0)}mm")
    print(f"  N={data['N']}, P={data['P']}, K={data['K']}, Temp={data['temperature']}, Humidity={data['humidity']}")
    print(f"  Acres={data['acres']}")
    print("-" * 100)
    
    # === STEP 1: Suggest Main Crops ===
    try:
        req = SuggestionRequest(**data)
        resp = service.suggest_main_crops(req)
        suggestions = resp.suggestions
        
        print(f"\n  [STEP 1] Primary Crop Suggestions ({len(suggestions)} returned):")
        bugs_step1 = []
        
        if len(suggestions) == 0:
            bugs_step1.append("BUG: Zero crops suggested!")
        
        prev_score = 999
        for idx, s in enumerate(suggestions):
            flag = ""
            # Check sorting
            if s.matchScore > prev_score:
                flag += " [BUG: NOT SORTED DESCENDING]"
                bugs_step1.append(f"Crop #{idx+1} ({s.cropName}) score {s.matchScore} > previous {prev_score}")
            prev_score = s.matchScore
            
            # Check crop exists in DB
            db_match = next((c for c in CROP_DATABASE if c["name"].lower() == s.cropName.lower()), None)
            if not db_match:
                flag += " [BUG: NOT IN DB]"
                bugs_step1.append(f"{s.cropName} not found in CROP_DATABASE")
            else:
                # Check season compatibility
                if data["season"] not in db_match["seasons"]:
                    flag += f" [BUG: WRONG SEASON - {s.cropName} not in {data['season']}]"
                    bugs_step1.append(f"{s.cropName} doesn't grow in {data['season']} season")
                
                # Check water range sanity
                water_avail = data['rainfall'] + (400 if data['irrigationAvailability'] else 0)
                min_w, max_w = db_match["water_req_mm"]
                water_status = "OK (in range)"
                if water_avail < min_w * 0.5:
                    water_status = "CRITICAL DROUGHT"
                    flag += f" [BUG: Should have been excluded - water {water_avail} < {min_w*0.5}]"
                    bugs_step1.append(f"{s.cropName}: catastrophic drought not filtered")
                elif water_avail < min_w:
                    water_status = f"DROUGHT (needs {min_w}, has {water_avail})"
                elif water_avail > max_w:
                    water_status = f"EXCESS (max {max_w}, has {water_avail})"
            
            print(f"    #{idx+1}: {s.cropName:15s} Score={s.matchScore:3.0f}%  Yield={s.expectedYieldPerAcre} kg/ac  Water={water_status}{flag}")
        
        if bugs_step1:
            print(f"\n  *** STEP 1 BUGS: {len(bugs_step1)} ***")
            for b in bugs_step1:
                print(f"    - {b}")
        else:
            print(f"  [OK] Step 1 PASSED")
        
        # === STEP 2: Test recommendation for EACH suggested crop ===
        for s in suggestions[:3]:  # Test top 3
            print(f"\n  {'~'*90}")
            print(f"  [STEP 2] Generating strategies for: {s.cropName}")
            
            crop_req = CropRequest(
                selectedMainCrop=s.cropName,
                acres=data["acres"],
                soilType=data["soilType"],
                soilPh=data["soilPh"],
                rainfall=data["rainfall"],
                irrigationAvailability=data["irrigationAvailability"],
                waterLevel=data.get("waterLevel", "Medium"),
                season=data["season"],
                N=data["N"],
                P=data["P"],
                K=data["K"],
                temperature=data["temperature"],
                humidity=data["humidity"]
            )
            
            try:
                crop_resp = service.get_recommendation(crop_req)
                strategies = crop_resp.strategies
                bugs_step2 = []
                
                print(f"    Strategies generated: {len(strategies)}")
                
                if len(strategies) != 3:
                    bugs_step2.append(f"Expected 3 strategies, got {len(strategies)}")
                
                for si, strat in enumerate(strategies):
                    print(f"\n    --- Strategy {si+1}: {strat.name} ---")
                    print(f"      Layout: {strat.farmLayout.layoutType}")
                    print(f"      Main: {strat.mainCrop}, Companions: {strat.sideCrops}")
                    print(f"      Land Distribution: {strat.landDistribution}")
                    print(f"      Water Score: {strat.waterUsageScore}")
                    print(f"      Base Suitability: {strat.overallScore}")
                    print(f"      Risk: {strat.riskLevel}")
                    print(f"      Yields: {strat.predictedYield}")
                    print(f"      Water Reqs: {strat.waterRequirementPerCrop}")
                    
                    # Check companion season compatibility
                    for sc in strat.sideCrops:
                        sc_db = next((c for c in CROP_DATABASE if c["name"].lower() == sc.lower()), None)
                        if sc_db:
                            if data["season"] not in sc_db["seasons"]:
                                bugs_step2.append(f"Companion {sc} doesn't grow in {data['season']}")
                                print(f"      [BUG] Companion {sc} NOT compatible with {data['season']} season!")
                            if not sc_db["is_legume_nitrogen_fixer"] and sc == strat.sideCrops[0]:
                                # First companion should ideally be a legume
                                pass  # Not necessarily a bug, just a preference
                        else:
                            bugs_step2.append(f"Companion {sc} not in CROP_DATABASE")
                            print(f"      [BUG] Companion {sc} NOT FOUND in database!")
                    
                    # Check land distribution sums to total acres
                    total_land = sum(strat.landDistribution.values())
                    if abs(total_land - data["acres"]) > 0.1:
                        bugs_step2.append(f"Land distribution sums to {total_land}, expected {data['acres']}")
                        print(f"      [BUG] Land distribution sums to {total_land}, expected {data['acres']}!")
                    
                    # Check duplicate companions
                    if len(strat.sideCrops) == 2 and strat.sideCrops[0] == strat.sideCrops[1]:
                        bugs_step2.append(f"Duplicate companion crops: {strat.sideCrops[0]}")
                        print(f"      [BUG] Duplicate companion: {strat.sideCrops[0]}!")
                    
                    # Check companion same as main crop
                    if strat.mainCrop in strat.sideCrops:
                        bugs_step2.append(f"Main crop {strat.mainCrop} appears as companion")
                        print(f"      [BUG] Main crop appears as its own companion!")
                    
                    # Check yields are positive
                    for cn, yld in strat.predictedYield.items():
                        if yld <= 0:
                            bugs_step2.append(f"Zero/negative yield for {cn}: {yld}")
                            print(f"      [BUG] Zero/negative yield for {cn}!")
                    
                    # Check water score range
                    if strat.waterUsageScore < 0 or strat.waterUsageScore > 115:
                        bugs_step2.append(f"Water score out of range: {strat.waterUsageScore}")
                        print(f"      [BUG] Water score out of range!")
                    
                    # Check timeline
                    if len(strat.timeline) == 0:
                        bugs_step2.append("Empty timeline")
                        print(f"      [BUG] Empty timeline!")
                    
                    # Check all 3 crops exist in landDistribution
                    expected_crops = {strat.mainCrop, strat.sideCrops[0], strat.sideCrops[1]} if len(strat.sideCrops) == 2 else {strat.mainCrop}
                    for ec in expected_crops:
                        if ec not in strat.landDistribution:
                            bugs_step2.append(f"Crop {ec} missing from landDistribution")
                            print(f"      [BUG] {ec} missing from landDistribution!")
                        if ec not in strat.predictedYield:
                            bugs_step2.append(f"Crop {ec} missing from predictedYield")
                            print(f"      [BUG] {ec} missing from predictedYield!")
                        if ec not in strat.waterRequirementPerCrop:
                            bugs_step2.append(f"Crop {ec} missing from waterRequirementPerCrop")
                            print(f"      [BUG] {ec} missing from waterRequirementPerCrop!")
                
                if bugs_step2:
                    print(f"\n    *** STEP 2 BUGS for {s.cropName}: {len(bugs_step2)} ***")
                    for b in bugs_step2:
                        print(f"      - {b}")
                else:
                    print(f"\n    [OK] Step 2 PASSED for {s.cropName}")
                    
            except Exception as e:
                print(f"    [CRITICAL BUG] Strategy generation CRASHED for {s.cropName}: {e}")
                traceback.print_exc()
                
    except Exception as e:
        print(f"  [CRITICAL BUG] Suggestion CRASHED: {e}")
        traceback.print_exc()

# === STATIC PRICE CHECK ===
print(f"\n{'='*100}")
print("MARKET PRICE COVERAGE CHECK")
print("="*100)
from_price_db = {
    'Rice': 43.50, 'Wheat': 28.00, 'Maize': 22.00, 'Cotton': 80.00,
    'Sugarcane': 8.00, 'Chickpea': 60.00, 'Mungbean': 85.00,
    'Blackgram': 90.00, 'Soybean': None, 'Sorghum': None,
    'Pearl Millet': None, 'Green Gram': None, 'Black Gram': None,
    'Cowpea': None, 'Peanut': None, 'Mustard': None, 'Sunflower': None
}

for crop in CROP_DATABASE:
    name = crop["name"]
    # Check if price service has a fallback
    has_price = name in from_price_db or name.lower() in [k.lower() for k in from_price_db.keys()]
    print(f"  {name:15s}: {'[OK] Has price' if has_price else '[BUG] NO PRICE FALLBACK - profit will be 0'}")

print(f"\n{'='*100}")
print("AUDIT COMPLETE")
print("="*100)
