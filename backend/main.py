from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
from contextlib import asynccontextmanager
from services.openai_service import OpenRouterService, OpenRouterError, AuthenticationError, RateLimitError, QuotaExceededError, ModelError

# Pydantic models
class NameRequest(BaseModel):
    animal: str
    traits: List[str]
    theme: str
    num_names: int = 5

class NameResponse(BaseModel):
    name: str
    reason: str

class GenerateResponse(BaseModel):
    results: List[NameResponse]

# Global OpenRouter service
openrouter_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global openrouter_service
    openrouter_service = OpenRouterService()  # Changed to OpenRouterService
    await openrouter_service.start()
    yield
    await openrouter_service.close()

# FastAPI app with lifespan management
app = FastAPI(
    title="NomoraPaw API",
    description="Pet name generator API using OpenRouter",  # Updated description
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "NomoraPaw API is running!"}

@app.post("/api/generate-names", response_model=GenerateResponse)
async def generate_names(request: NameRequest):
    try:
        # Use OpenRouter service to generate names
        pet_names = await openrouter_service.generate_pet_names(  # Changed service reference
            animal=request.animal,
            traits=request.traits,
            theme=request.theme,
            num_names=request.num_names
        )
        
        # Convert to response format
        results = [
            NameResponse(name=pet_name.name, reason=pet_name.reason)
            for pet_name in pet_names
        ]
        
        return GenerateResponse(results=results)
        
    except AuthenticationError as e:
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")
    except RateLimitError as e:
        raise HTTPException(status_code=429, detail=f"Rate limit exceeded: {str(e)}")
    except QuotaExceededError as e:
        raise HTTPException(status_code=402, detail=f"Quota exceeded: {str(e)}")
    except ModelError as e:
        raise HTTPException(status_code=400, detail=f"Model error: {str(e)}")
    except OpenRouterError as e:  # Updated exception type
        raise HTTPException(status_code=500, detail=f"OpenRouter service error: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring."""
    try:
        health_status = await openrouter_service.health_check()  # Changed service reference
        return health_status
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)