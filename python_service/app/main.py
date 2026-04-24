from fastapi import FastAPI, HTTPException
from .schemas import CropRequest, CropResponse, SuggestionRequest, SuggestionResponse
from .service import recommendation_service

app = FastAPI(
    title="Crop Recommendation Microservice",
    description="Python FastAPI service for agricultural intelligence",
    version="2.0.0"
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/suggest-main-crops", response_model=SuggestionResponse)
async def suggest_main_crops(request: SuggestionRequest):
    try:
        suggestion = recommendation_service.suggest_main_crops(request)
        return suggestion
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict", response_model=CropResponse)
async def predict_crops(request: CropRequest):
    try:
        recommendation = recommendation_service.get_recommendation(request)
        return recommendation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Configured for Port 5000 as requested
    uvicorn.run(app, host="0.0.0.0", port=5000)
