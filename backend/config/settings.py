"""
Application settings and configuration management.

This module provides centralized configuration management for the NomoraPaw
backend application, supporting multiple environments and secure credential handling.
"""

import os
from typing import Optional
from enum import Enum
from pydantic import BaseSettings, validator


class Environment(str, Enum):
    """Application environment types."""
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings(BaseSettings):
    """
    Application settings with environment variable support.
    
    All settings can be overridden using environment variables.
    For example, OPENAI_API_KEY environment variable will override
    the openai_api_key setting.
    """
    
    # Application settings
    app_name: str = "NomoraPaw API"
    app_version: str = "1.0.0"
    environment: Environment = Environment.PRODUCTION
    debug: bool = False
    
    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000
    
    # OpenAI API settings
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-3.5-turbo"
    openai_max_tokens: int = 1000
    openai_temperature: float = 0.8
    openai_top_p: float = 0.9
    openai_timeout: float = 30.0
    openai_max_retries: int = 3
    openai_base_url: str = "https://api.openai.com/v1"
    
    # CORS settings
    cors_origins: list = [
        "http://localhost:3000",
        "https://*.netlify.app",
        "https://*.vercel.app"
    ]
    
    @validator("openai_api_key")
    def validate_openai_api_key(cls, v):
        """Validate OpenAI API key format."""
        if v and not v.startswith('sk-'):
            raise ValueError("OpenAI API key must start with 'sk-'")
        return v
    
    @validator("openai_temperature")
    def validate_temperature(cls, v):
        """Validate temperature range."""
        if not 0 <= v <= 2:
            raise ValueError("Temperature must be between 0 and 2")
        return v
    
    @validator("openai_top_p")
    def validate_top_p(cls, v):
        """Validate top_p range."""
        if not 0 <= v <= 1:
            raise ValueError("Top_p must be between 0 and 1")
        return v
    
    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()