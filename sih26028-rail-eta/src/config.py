from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "bengaluru_railway_eta"
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/bengaluru_railway_eta"
    TEST_DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/bengaluru_railway_eta_test"
    
    APP_TIMEZONE: str = "Asia/Kolkata"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()