# OpenAI Service Integration Guide

This guide explains how to integrate and use the OpenAI service in your NomoraPaw backend application.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
OPENAI_API_KEY=sk-your-actual-api-key-here
ENVIRONMENT=development
```

### 3. Basic Usage

```python
from services.openai_service import OpenAIService

# Initialize the service
service = OpenAIService()

# Generate pet names
async def generate_names():
    async with service:
        names = await service.generate_pet_names(
            animal="dog",
            traits=["playful", "loyal"],
            theme="mythology",
            num_names=5
        )
        
        for name in names:
            print(f"{name.name}: {name.reason}")
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | Required | Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-3.5-turbo` | OpenAI model to use |
| `OPENAI_MAX_TOKENS` | `1000` | Maximum tokens per request |
| `OPENAI_TEMPERATURE` | `0.8` | Creativity level (0-2) |
| `OPENAI_TOP_P` | `0.9` | Nucleus sampling parameter |
| `OPENAI_TIMEOUT` | `30.0` | Request timeout in seconds |
| `OPENAI_MAX_RETRIES` | `3` | Maximum retry attempts |
| `ENVIRONMENT` | `production` | Application environment |

### Custom Configuration

```python
from services.openai_service import OpenAIService, OpenAIConfig, Environment

# Create custom configuration
config = OpenAIConfig(
    api_key="your-api-key",
    model="gpt-4",  # Use GPT-4 instead
    temperature=0.9,
    max_tokens=1500,
    environment=Environment.DEVELOPMENT
)

# Initialize service with custom config
service = OpenAIService(config=config)
```

## 📝 API Reference

### OpenAIService Class

#### Methods

##### `generate_pet_names(animal, traits, theme="", num_names=5)`

Generate pet names using OpenAI GPT-3.5-turbo.

**Parameters:**
- `animal` (str): Type of animal (e.g., "dog", "cat", "rabbit")
- `traits` (List[str]): List of personality traits
- `theme` (str, optional): Theme for names (e.g., "mythology", "nature")
- `num_names` (int): Number of names to generate (1-10)

**Returns:**
- `List[PetNameResult]`: List of generated names with explanations

**Raises:**
- `ValueError`: Invalid input parameters
- `AuthenticationError`: Invalid API key
- `RateLimitError`: Rate limits exceeded
- `QuotaExceededError`: API quota exceeded
- `ModelError`: Model or request issues
- `OpenAIError`: General API errors

**Example:**
```python
names = await service.generate_pet_names(
    animal="cat",
    traits=["curious", "independent"],
    theme="space",
    num_names=3
)
```

##### `health_check()`

Perform a health check of the OpenAI service.

**Returns:**
- `Dict[str, Any]`: Health status information

**Example:**
```python
health = await service.health_check()
print(f"Status: {health['status']}")
```

### Data Classes

#### `PetNameResult`

```python
@dataclass
class PetNameResult:
    name: str      # The generated pet name
    reason: str    # Explanation for the name choice
```

#### `OpenAIConfig`

```python
@dataclass
class OpenAIConfig:
    api_key: str
    model: str = "gpt-3.5-turbo"
    max_tokens: int = 1000
    temperature: float = 0.8
    top_p: float = 0.9
    timeout: float = 30.0
    max_retries: int = 3
    base_url: str = "https://api.openai.com/v1"
    environment: Environment = Environment.PRODUCTION
```

## 🔄 Integration with FastAPI

### main.py Integration

```python
from fastapi import FastAPI, HTTPException
from services.openai_service import OpenAIService, OpenAIError
from contextlib import asynccontextmanager

# Global service instance
openai_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global openai_service
    openai_service = OpenAIService()
    await openai_service.start()
    yield
    await openai_service.close()

app = FastAPI(lifespan=lifespan)

@app.post("/api/generate-names")
async def generate_names(request: NameRequest):
    try:
        names = await openai_service.generate_pet_names(
            animal=request.animal,
            traits=request.traits,
            theme=request.theme,
            num_names=request.num_names
        )
        return {"results": names}
    except OpenAIError as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## 🚨 Error Handling

### Exception Hierarchy

```
OpenAIError (base)
├── AuthenticationError (401)
├── RateLimitError (429)
├── QuotaExceededError (402)
└── ModelError (400)
```

### Handling Specific Errors

```python
from services.openai_service import (
    OpenAIService, 
    AuthenticationError, 
    RateLimitError,
    QuotaExceededError,
    ModelError
)

try:
    names = await service.generate_pet_names(...)
except AuthenticationError:
    # Handle invalid API key
    print("Please check your OpenAI API key")
except RateLimitError:
    # Handle rate limiting
    print("Too many requests, please wait")
except QuotaExceededError:
    # Handle quota exceeded
    print("API quota exceeded, please check billing")
except ModelError as e:
    # Handle model/request errors
    print(f"Request error: {e}")
except Exception as e:
    # Handle unexpected errors
    print(f"Unexpected error: {e}")
```

## 🎯 Best Practices

### 1. Use Context Managers

```python
# Recommended: Automatic resource management
async with OpenAIService() as service:
    names = await service.generate_pet_names(...)

# Or manually manage lifecycle
service = OpenAIService()
await service.start()
try:
    names = await service.generate_pet_names(...)
finally:
    await service.close()
```

### 2. Handle Errors Gracefully

```python
async def safe_generate_names(animal, traits):
    try:
        return await service.generate_pet_names(animal, traits)
    except RateLimitError:
        # Implement backoff strategy
        await asyncio.sleep(60)
        return await service.generate_pet_names(animal, traits)
    except OpenAIError as e:
        # Log error and return fallback
        logger.error(f"OpenAI error: {e}")
        return get_fallback_names(animal, traits)
```

### 3. Monitor Performance

```python
import time
import logging

logger = logging.getLogger(__name__)

async def generate_with_monitoring(animal, traits):
    start_time = time.time()
    try:
        names = await service.generate_pet_names(animal, traits)
        duration = time.time() - start_time
        logger.info(f"Generated {len(names)} names in {duration:.2f}s")
        return names
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"Failed after {duration:.2f}s: {e}")
        raise
```

### 4. Implement Caching

The service includes built-in caching, but you can add additional layers:

```python
from functools import lru_cache
import hashlib

@lru_cache(maxsize=100)
async def cached_generate_names(animal, traits_hash, theme, num_names):
    traits = traits_hash.split(',')  # Reconstruct from hash
    return await service.generate_pet_names(animal, traits, theme, num_names)

async def generate_with_cache(animal, traits, theme, num_names):
    # Create hashable representation of traits
    traits_hash = ','.join(sorted(traits))
    return await cached_generate_names(animal, traits_hash, theme, num_names)
```

## 🧪 Testing

### Unit Tests

```python
import pytest
from unittest.mock import AsyncMock, patch
from services.openai_service import OpenAIService, PetNameResult

@pytest.mark.asyncio
async def test_generate_pet_names():
    service = OpenAIService()
    
    with patch.object(service, '_make_api_request') as mock_request:
        mock_request.return_value = '''[
            {"name": "Buddy", "reason": "Perfect for a loyal companion"}
        ]'''
        
        names = await service.generate_pet_names("dog", ["loyal"], "classic", 1)
        
        assert len(names) == 1
        assert names[0].name == "Buddy"
        assert "loyal" in names[0].reason

@pytest.mark.asyncio
async def test_health_check():
    service = OpenAIService()
    health = await service.health_check()
    
    assert "status" in health
    assert health["status"] in ["healthy", "unhealthy"]
```

### Integration Tests

```python
@pytest.mark.asyncio
async def test_full_integration():
    """Test full integration with real API (requires valid API key)."""
    service = OpenAIService()
    
    async with service:
        names = await service.generate_pet_names(
            animal="dog",
            traits=["friendly"],
            theme="nature",
            num_names=2
        )
        
        assert len(names) == 2
        assert all(isinstance(name.name, str) for name in names)
        assert all(isinstance(name.reason, str) for name in names)
```

## 📊 Monitoring and Logging

### Health Check Endpoint

```python
@app.get("/api/health")
async def health_check():
    health = await openai_service.health_check()
    status_code = 200 if health["status"] == "healthy" else 503
    return JSONResponse(content=health, status_code=status_code)
```

### Metrics Collection

```python
import time
from prometheus_client import Counter, Histogram

# Metrics
request_count = Counter('openai_requests_total', 'Total OpenAI requests')
request_duration = Histogram('openai_request_duration_seconds', 'Request duration')
error_count = Counter('openai_errors_total', 'Total OpenAI errors', ['error_type'])

async def generate_with_metrics(animal, traits, theme, num_names):
    request_count.inc()
    start_time = time.time()
    
    try:
        names = await service.generate_pet_names(animal, traits, theme, num_names)
        request_duration.observe(time.time() - start_time)
        return names
    except Exception as e:
        error_count.labels(error_type=type(e).__name__).inc()
        raise
```

This integration guide provides everything you need to successfully implement and use the OpenAI service in your NomoraPaw application!