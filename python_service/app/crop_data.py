# app/crop_data.py

CROP_DATABASE = [
    # Cereals
    {
        "name": "Rice",
        "soil_types": ["Clay", "Clay Loam", "Alluvial", "Black"],
        "ph_range": [5.5, 7.5],
        "seasons": ["Kharif"],
        "water_req_mm": [900, 2500],
        "duration_days": 130,
        "is_legume_nitrogen_fixer": False,
        "yield_per_acre_kg": 2000
    },
    {
        "name": "Wheat",
        "soil_types": ["Loamy", "Clay Loam", "Sandy Loam", "Alluvial", "Black"],
        "ph_range": [6.0, 7.5],
        "seasons": ["Rabi"],
        "water_req_mm": [450, 650],
        "duration_days": 120,
        "is_legume_nitrogen_fixer": False,
        "yield_per_acre_kg": 1500
    },
    {
        "name": "Maize",
        "soil_types": ["Loamy", "Sandy Loam", "Red", "Alluvial", "Black"],
        "ph_range": [5.8, 7.0],
        "seasons": ["Kharif", "Rabi"],
        "water_req_mm": [500, 800],
        "duration_days": 100,
        "is_legume_nitrogen_fixer": False,
        "yield_per_acre_kg": 1200
    },
    {
        "name": "Sorghum",
        "soil_types": ["Clay Loam", "Black", "Red", "Alluvial"],
        "ph_range": [6.0, 8.5],
        "seasons": ["Kharif", "Rabi"],
        "water_req_mm": [400, 600],
        "duration_days": 110,
        "is_legume_nitrogen_fixer": False,
        "yield_per_acre_kg": 800
    },
    {
        "name": "Pearl Millet",
        "soil_types": ["Sandy", "Sandy Loam", "Red"],
        "ph_range": [5.5, 8.2],
        "seasons": ["Kharif"],
        "water_req_mm": [250, 400],
        "duration_days": 80,
        "is_legume_nitrogen_fixer": False,
        "yield_per_acre_kg": 600
    },

    # Legumes / Pulses (Nitrogen Fixers)
    {
        "name": "Soybean",
        "soil_types": ["Clay Loam", "Black", "Red", "Alluvial"],
        "ph_range": [6.0, 7.5],
        "seasons": ["Kharif"],
        "water_req_mm": [450, 700],
        "duration_days": 100,
        "is_legume_nitrogen_fixer": True,
        "yield_per_acre_kg": 800
    },
    {
        "name": "Chickpea",
        "soil_types": ["Clay Loam", "Black", "Alluvial"],
        "ph_range": [6.0, 8.0],
        "seasons": ["Rabi"],
        "water_req_mm": [150, 250],
        "duration_days": 110,
        "is_legume_nitrogen_fixer": True,
        "yield_per_acre_kg": 600
    },
    {
        "name": "Green Gram",
        "soil_types": ["Loamy", "Red", "Sandy Loam", "Alluvial"],
        "ph_range": [6.5, 7.5],
        "seasons": ["Kharif"],
        "water_req_mm": [300, 400],
        "duration_days": 70,
        "is_legume_nitrogen_fixer": True,
        "yield_per_acre_kg": 350
    },
    {
        "name": "Black Gram",
        "soil_types": ["Black", "Red", "Clay Loam", "Alluvial"],
        "ph_range": [5.5, 7.5],
        "seasons": ["Kharif", "Rabi"],
        "water_req_mm": [350, 450],
        "duration_days": 75,
        "is_legume_nitrogen_fixer": True,
        "yield_per_acre_kg": 300
    },
    {
        "name": "Cowpea",
        "soil_types": ["Sandy Loam", "Red", "Loamy", "Alluvial"],
        "ph_range": [5.5, 6.5],
        "seasons": ["Kharif"],
        "water_req_mm": [200, 400],
        "duration_days": 85,
        "is_legume_nitrogen_fixer": True,
        "yield_per_acre_kg": 400
    },

    # Oilseeds
    {
        "name": "Peanut",
        "soil_types": ["Sandy", "Sandy Loam", "Red", "Alluvial"],
        "ph_range": [6.0, 6.5],
        "seasons": ["Kharif"],
        "water_req_mm": [500, 700],
        "duration_days": 110,
        "is_legume_nitrogen_fixer": True,
        "yield_per_acre_kg": 800
    },
    {
        "name": "Mustard",
        "soil_types": ["Loamy", "Sandy Loam"],
        "ph_range": [6.0, 8.0],
        "seasons": ["Rabi"],
        "water_req_mm": [250, 400],
        "duration_days": 110,
        "is_legume_nitrogen_fixer": False,
        "yield_per_acre_kg": 500
    },
    {
        "name": "Sunflower",
        "soil_types": ["Black", "Loamy", "Sandy Loam", "Alluvial"],
        "ph_range": [6.0, 8.0],
        "seasons": ["Kharif", "Rabi"],
        "water_req_mm": [400, 500],
        "duration_days": 90,
        "is_legume_nitrogen_fixer": False,
        "yield_per_acre_kg": 600
    },

    # Commercial Crops
    {
        "name": "Cotton",
        "soil_types": ["Black", "Clay", "Alluvial"],
        "ph_range": [6.0, 8.0],
        "seasons": ["Kharif"],
        "water_req_mm": [700, 1200],
        "duration_days": 160,
        "is_legume_nitrogen_fixer": False,
        "yield_per_acre_kg": 500
    },
    {
        "name": "Sugarcane",
        "soil_types": ["Loamy", "Clay Loam", "Alluvial", "Black"],
        "ph_range": [6.5, 7.5],
        "seasons": ["Kharif"],
        "water_req_mm": [1500, 2500],
        "duration_days": 300,
        "is_legume_nitrogen_fixer": False,
        "yield_per_acre_kg": 30000 
    }
]

# Safe companion planting matrix to prevent allelopathy
COMPANION_MATRIX = {
    "Rice": ["Green Gram", "Black Gram", "Cowpea", "Mustard", "Lentil"],
    "Wheat": ["Mustard", "Chickpea", "Lentil", "Sunflower"],
    "Maize": ["Soybean", "Cowpea", "Green Gram", "Black Gram", "Peanut"],
    "Sorghum": ["Cowpea", "Green Gram", "Soybean"],
    "Pearl Millet": ["Green Gram", "Cowpea"],
    "Soybean": ["Maize", "Sorghum", "Cotton", "Sugarcane"],
    "Chickpea": ["Wheat", "Mustard", "Sorghum", "Sugarcane"],
    "Green Gram": ["Rice", "Maize", "Cotton", "Sorghum", "Pearl Millet", "Sugarcane"],
    "Black Gram": ["Rice", "Maize", "Sorghum", "Pearl Millet", "Sugarcane", "Cotton"],
    "Cowpea": ["Maize", "Sorghum", "Pearl Millet", "Sugarcane", "Cotton"],
    "Peanut": ["Maize", "Sorghum", "Pearl Millet", "Sunflower"],
    "Mustard": ["Wheat", "Chickpea", "Sugarcane", "Lentil"],
    "Sunflower": ["Green Gram", "Black Gram", "Peanut", "Wheat"],
    "Cotton": ["Green Gram", "Black Gram", "Soybean", "Cowpea"],
    "Sugarcane": ["Chickpea", "Mustard", "Green Gram", "Black Gram", "Soybean", "Cowpea", "Wheat", "Lentil"]
}
