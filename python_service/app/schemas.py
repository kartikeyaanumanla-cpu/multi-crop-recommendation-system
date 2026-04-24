from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class SuggestionRequest(BaseModel):
    acres: float = Field(..., gt=0, description="Total land area in acres")
    soilType: str = Field(..., description="Type of soil (e.g., Black, Red)")
    soilPh: float = Field(..., description="Soil pH level")
    rainfall: float = Field(..., description="Annual rainfall in mm")
    irrigationAvailability: bool = Field(..., description="Availability of irrigation")
    waterLevel: str = Field(..., pattern="^(Low|Medium|High)$")
    season: str = Field(..., pattern="^(Kharif|Rabi|Zaid)$")
    N: float = Field(50, description="Nitrogen content")
    P: float = Field(50, description="Phosphorous content")
    K: float = Field(50, description="Potassium content")
    temperature: float = Field(25.0, description="Temperature in C")
    humidity: float = Field(60.0, description="Humidity in %")

class MainCropSuggestion(BaseModel):
    cropName: str
    matchScore: float
    reason: str
    expectedYieldPerAcre: float

class SuggestionResponse(BaseModel):
    suggestions: List[MainCropSuggestion]
    status: str = "success"

class CropRequest(BaseModel):
    acres: float = Field(..., gt=0, description="Total land area in acres")
    soilType: str = Field(..., description="Type of soil (e.g., Black, Red)")
    soilPh: float = Field(..., description="Soil pH level")
    rainfall: float = Field(..., description="Annual rainfall in mm")
    irrigationAvailability: bool = Field(..., description="Availability of irrigation")
    waterLevel: str = Field(..., pattern="^(Low|Medium|High)$")
    season: str = Field(..., pattern="^(Kharif|Rabi|Zaid)$")
    N: float = Field(50, description="Nitrogen content")
    P: float = Field(50, description="Phosphorous content")
    K: float = Field(50, description="Potassium content")
    temperature: float = Field(25.0, description="Temperature in C")
    humidity: float = Field(60.0, description="Humidity in %")
    selectedMainCrop: str = Field(..., description="The main crop selected from the suggestion step")

class TimelineEvent(BaseModel):
    month: str
    activity: str

class FarmLayout(BaseModel):
    cropDistribution: Dict[str, float]
    layoutType: str
    sowingPattern: str

class Strategy(BaseModel):
    id: str
    name: str
    overallScore: float
    waterUsageScore: float
    estimatedProfit: float
    riskLevel: str
    mainCrop: str
    sideCrops: List[str]
    landDistribution: Dict[str, float]
    farmLayout: FarmLayout
    predictedYield: Dict[str, float]
    waterRequirementPerCrop: Dict[str, float]
    timeline: List[TimelineEvent]

class CropResponse(BaseModel):
    strategies: List[Strategy]
    status: str = "success"
