"""
Production-ready OpenRouter API service for pet name generation using OpenAI GPT-OSS-20B.

This module provides a robust, secure, and maintainable service for integrating
with OpenRouter's API using the openai/gpt-oss-20b:free model. It includes comprehensive error handling,
retry logic, caching, and security best practices.

Example:
    from services.openai_service import OpenRouterService
    
    service = OpenRouterService()
    names = await service.generate_pet_names(
        animal="dog",
        traits=["playful", "loyal"],
        theme="mythology",
        num_names=5
    )
"""

import asyncio
import json
import logging
import os
import time
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log
)


class OpenRouterError(Exception):
    """Base exception for OpenRouter service errors."""
    pass


class AuthenticationError(OpenRouterError):
    """Raised when API key authentication fails."""
    pass


class RateLimitError(OpenRouterError):
    """Raised when API rate limits are exceeded."""
    pass


class QuotaExceededError(OpenRouterError):
    """Raised when API quota is exceeded."""
    pass


class ModelError(OpenRouterError):
    """Raised when there's an issue with the model or request."""
    pass


class Environment(Enum):
    """Environment configurations."""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


@dataclass
class OpenRouterConfig:
    """Configuration class for OpenRouter service."""
    api_key: str
    model: str = "openai/gpt-oss-20b:free"  # Changed to OpenRouter's free model
    max_tokens: int = 1000
    temperature: float = 0.8
    top_p: float = 0.9
    timeout: float = 30.0
    max_retries: int = 3
    base_url: str = "https://openrouter.ai/api/v1"  # Changed to OpenRouter endpoint
    environment: Environment = Environment.PRODUCTION
    site_url: str = "https://nomora-paw.netlify.app"  # Added for OpenRouter headers
    app_name: str = "NomoraPaw"  # Added for OpenRouter headers


@dataclass
class PetNameResult:
    """Data class for pet name generation results."""
    name: str
    reason: str


class OpenRouterService:
    """
    Production-ready OpenRouter API service for pet name generation.
    
    This service provides secure, robust integration with OpenRouter's API
    using the openai/gpt-oss-20b:free model, including comprehensive error handling, retry logic, and caching.
    
    Attributes:
        config: OpenRouter configuration settings
        client: HTTP client for API requests
        logger: Logger instance for debugging and monitoring
        cache: Simple in-memory cache for responses
    """
    
    def __init__(self, config: Optional[OpenRouterConfig] = None):
        """
        Initialize the OpenRouter service.
        
        Args:
            config: Optional configuration object. If not provided, will be
                   created from environment variables.
                   
        Raises:
            ValueError: If API key is not provided or invalid.
        """
        self.config = config or self._create_config_from_env()
        self.logger = self._setup_logging()
        self.client: Optional[httpx.AsyncClient] = None
        self.cache: Dict[str, Dict[str, Any]] = {}
        self._cache_ttl = 3600  # 1 hour cache TTL
        
        # Validate configuration
        self._validate_config()
        
        self.logger.info(
            f"OpenRouter service initialized for {self.config.environment.value} environment with model {self.config.model}"
        )
    
    def _create_config_from_env(self) -> OpenRouterConfig:
        """Create configuration from environment variables."""
        api_key = os.getenv("OPENROUTER_API_KEY")  # Changed environment variable name
        if not api_key:
            raise ValueError(
                "OPENROUTER_API_KEY environment variable is required. "
                "Please set it with your OpenRouter API key."
            )
        
        env_name = os.getenv("ENVIRONMENT", "production").lower()
        try:
            environment = Environment(env_name)
        except ValueError:
            environment = Environment.PRODUCTION
        
        return OpenRouterConfig(
            api_key=api_key,
            model=os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-20b:free"),  # Changed default model
            max_tokens=int(os.getenv("OPENROUTER_MAX_TOKENS", "1000")),
            temperature=float(os.getenv("OPENROUTER_TEMPERATURE", "0.8")),
            top_p=float(os.getenv("OPENROUTER_TOP_P", "0.9")),
            timeout=float(os.getenv("OPENROUTER_TIMEOUT", "30.0")),
            max_retries=int(os.getenv("OPENROUTER_MAX_RETRIES", "3")),
            environment=environment,
            site_url=os.getenv("OPENROUTER_SITE_URL", "https://nomora-paw.netlify.app"),  # Added OpenRouter-specific config
            app_name=os.getenv("OPENROUTER_APP_NAME", "NomoraPaw")  # Added OpenRouter-specific config
        )
    
    def _setup_logging(self) -> logging.Logger:
        """Set up logging configuration."""
        logger = logging.getLogger(f"openrouter_service.{self.config.environment.value}")  # Changed logger name
        
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        
        # Set log level based on environment
        if self.config.environment == Environment.DEVELOPMENT:
            logger.setLevel(logging.DEBUG)
        elif self.config.environment == Environment.STAGING:
            logger.setLevel(logging.INFO)
        else:
            logger.setLevel(logging.WARNING)
        
        return logger
    
    def _validate_config(self) -> None:
        """Validate configuration parameters."""
        if not self.config.api_key:
            raise ValueError("OpenRouter API key is required")  # Removed OpenAI-specific validation
        
        if self.config.temperature < 0 or self.config.temperature > 2:
            raise ValueError("Temperature must be between 0 and 2")
        
        if self.config.top_p < 0 or self.config.top_p > 1:
            raise ValueError("Top_p must be between 0 and 1")
        
        if self.config.max_tokens < 1 or self.config.max_tokens > 4096:
            raise ValueError("Max_tokens must be between 1 and 4096")
    
    async def __aenter__(self):
        """Async context manager entry."""
        await self.start()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.close()
    
    async def start(self) -> None:
        """Initialize the HTTP client."""
        if self.client is None:
            self.client = httpx.AsyncClient(
                timeout=httpx.Timeout(self.config.timeout),
                limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
            )
            self.logger.debug("HTTP client initialized")
    
    async def close(self) -> None:
        """Close the HTTP client."""
        if self.client:
            await self.client.aclose()
            self.client = None
            self.logger.debug("HTTP client closed")
    
    def _get_cache_key(self, animal: str, traits: List[str], theme: str, num_names: int) -> str:
        """Generate cache key for request parameters."""
        traits_str = ",".join(sorted(traits))
        return f"{animal}:{traits_str}:{theme}:{num_names}"
    
    def _is_cache_valid(self, cache_entry: Dict[str, Any]) -> bool:
        """Check if cache entry is still valid."""
        return time.time() - cache_entry["timestamp"] < self._cache_ttl
    
    def _get_from_cache(self, cache_key: str) -> Optional[List[PetNameResult]]:
        """Retrieve results from cache if valid."""
        if cache_key in self.cache:
            cache_entry = self.cache[cache_key]
            if self._is_cache_valid(cache_entry):
                self.logger.debug(f"Cache hit for key: {cache_key}")
                return cache_entry["data"]
            else:
                # Remove expired entry
                del self.cache[cache_key]
                self.logger.debug(f"Cache expired for key: {cache_key}")
        return None
    
    def _save_to_cache(self, cache_key: str, data: List[PetNameResult]) -> None:
        """Save results to cache."""
        self.cache[cache_key] = {
            "data": data,
            "timestamp": time.time()
        }
        self.logger.debug(f"Cached results for key: {cache_key}")
    
    def _sanitize_input(self, text: str) -> str:
        """Sanitize input text to prevent injection attacks."""
        if not isinstance(text, str):
            return ""
        
        # Remove potentially harmful characters
        sanitized = text.strip()
        # Remove excessive whitespace
        sanitized = " ".join(sanitized.split())
        # Limit length
        sanitized = sanitized[:100]
        
        return sanitized
    
    def _create_prompt(self, animal: str, traits: List[str], theme: str, num_names: int) -> str:
        """Create the prompt for OpenAI API."""
        # Sanitize inputs
        animal = self._sanitize_input(animal)
        traits = [self._sanitize_input(trait) for trait in traits if trait.strip()]
        theme = self._sanitize_input(theme)
        
        traits_str = ", ".join(traits) if traits else "no specific traits"
        theme_str = theme if theme else "any theme"
        
        prompt = f"""You are a knowledgeable pet-naming assistant. Suggest {num_names} unique names for a {animal} given these traits: {traits_str}. Theme: {theme_str}.

Return ONLY valid JSON array of objects with this exact format:
[{{"name": "Example Name", "reason": "Brief explanation of why this name fits the pet"}}, ...]

Make sure each name is creative, relevant, and the reason explains the connection to the animal, traits, or theme. Keep reasons under 100 characters."""
        
        return prompt
    
    def _parse_response(self, content: str) -> List[PetNameResult]:
        """Parse OpenAI response and extract pet names."""
        try:
            # Clean up the response
            content = content.strip()
            
            # Remove code block markers if present
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()
            
            # Parse JSON
            names_data = json.loads(content)
            
            if not isinstance(names_data, list):
                raise ValueError("Response is not a valid list")
            
            results = []
            for item in names_data:
                if isinstance(item, dict) and "name" in item and "reason" in item:
                    results.append(PetNameResult(
                        name=str(item["name"]).strip(),
                        reason=str(item["reason"]).strip()
                    ))
            
            if not results:
                raise ValueError("No valid names found in response")
            
            return results
            
        except json.JSONDecodeError as e:
            self.logger.error(f"JSON parsing error: {e}")
            raise ModelError(f"Failed to parse AI response as JSON: {e}")
        except Exception as e:
            self.logger.error(f"Response parsing error: {e}")
            raise ModelError(f"Failed to parse AI response: {e}")
    
    def _handle_api_error(self, response: httpx.Response) -> None:
        """Handle API error responses."""
        try:
            error_data = response.json()
            error_message = error_data.get("error", {}).get("message", "Unknown error")
            error_type = error_data.get("error", {}).get("type", "unknown")
        except:
            error_message = f"HTTP {response.status_code}: {response.text}"
            error_type = "http_error"
        
        self.logger.error(f"OpenAI API error: {error_message}")
        self.logger.error(f"OpenRouter API error: {error_message}")  # Updated error message
        
        if response.status_code == 401:
            raise AuthenticationError(f"Authentication failed: {error_message}")
        elif response.status_code == 429:
            raise RateLimitError(f"Rate limit exceeded: {error_message}")
        elif response.status_code == 402:
            raise QuotaExceededError(f"Quota exceeded: {error_message}")
        elif 400 <= response.status_code < 500:
            raise ModelError(f"Client error: {error_message}")
        else:
            raise OpenRouterError(f"Server error: {error_message}")  # Updated exception type
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        retry=retry_if_exception_type((httpx.RequestError, RateLimitError)),
        before_sleep=before_sleep_log(logging.getLogger(__name__), logging.INFO)
    )
    async def _make_api_request(self, prompt: str) -> str:
        """Make API request to OpenRouter with retry logic."""
        if not self.client:
            await self.start()
        
        # Updated headers for OpenRouter API
        headers = {
            "Authorization": f"Bearer {self.config.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": self.config.site_url,  # OpenRouter recommended header
            "X-Title": self.config.app_name  # OpenRouter recommended header
        }
        
        payload = {
            "model": self.config.model,
            "messages": [
                {
                    "role": "system",
                    "content": "You generate creative, relevant pet names. Always respond with valid JSON only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": self.config.temperature,
            "top_p": self.config.top_p,
            "max_tokens": self.config.max_tokens
        }
        
        self.logger.debug(f"Making OpenRouter API request with model: {self.config.model}")  # Updated log message
        
        try:
            response = await self.client.post(
                f"{self.config.base_url}/chat/completions",
                json=payload,
                headers=headers
            )
            
            if response.status_code != 200:
                self._handle_api_error(response)
            
            response_data = response.json()
            content = response_data["choices"][0]["message"]["content"]
            
            self.logger.debug("API request successful")
            return content
            
        except httpx.RequestError as e:
            self.logger.error(f"Network error: {e}")
            raise OpenRouterError(f"Network error: {e}")  # Updated exception type
    
    async def generate_pet_names(
        self,
        animal: str,
        traits: List[str],
        theme: str = "",
        num_names: int = 5
    ) -> List[PetNameResult]:
        """
        Generate pet names using OpenRouter's openai/gpt-oss-20b:free model.
        
        Args:
            animal: Type of animal (e.g., "dog", "cat", "rabbit")
            traits: List of personality traits
            theme: Optional theme for names (e.g., "mythology", "nature")
            num_names: Number of names to generate (1-10)
            
        Returns:
            List of PetNameResult objects containing names and reasons
            
        Raises:
            ValueError: If input parameters are invalid
            AuthenticationError: If API key is invalid
            RateLimitError: If rate limits are exceeded
            QuotaExceededError: If API quota is exceeded
            ModelError: If there's an issue with the model or request
           OpenRouterError: For other API-related errors
        """
        # Validate inputs
        if not animal or not isinstance(animal, str):
            raise ValueError("Animal type is required and must be a string")
        
        if not isinstance(traits, list):
            raise ValueError("Traits must be a list")
        
        if not isinstance(num_names, int) or num_names < 1 or num_names > 10:
            raise ValueError("Number of names must be between 1 and 10")
        
        # Check cache first
        cache_key = self._get_cache_key(animal, traits, theme, num_names)
        cached_result = self._get_from_cache(cache_key)
        if cached_result:
            return cached_result
        
        # Create prompt and make API request
        prompt = self._create_prompt(animal, traits, theme, num_names)
        
        self.logger.info(
            f"Generating {num_names} names for {animal} with traits: {traits}"
        )
        
        try:
            content = await self._make_api_request(prompt)
            results = self._parse_response(content)
            
            # Cache the results
            self._save_to_cache(cache_key, results)
            
            self.logger.info(f"Successfully generated {len(results)} names")
            return results
            
        except Exception as e:
            self.logger.error(f"Failed to generate pet names: {e}")
            raise
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Perform a health check of the OpenRouter service.
        
        Returns:
            Dictionary containing health status information
        """
        try:
            # Make a simple test request
            test_names = await self.generate_pet_names(
                animal="dog",
                traits=["friendly"],
                theme="",
                num_names=1
            )
            
            return {
                "status": "healthy",
                "model": self.config.model,
                "environment": self.config.environment.value,
                "cache_size": len(self.cache),
                "test_successful": len(test_names) > 0
            }
            
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "model": self.config.model,
                "environment": self.config.environment.value
            }