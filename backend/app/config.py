from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SlopeShield"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = "AI-Based Landslide Early Warning and Risk Monitoring System"
    API_PREFIX: str = "/api"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()