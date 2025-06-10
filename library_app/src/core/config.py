from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./library.db"  # Or your actual DB URL
    SQL_ECHO: bool = False  # Activer l'écho SQL pour le débogage
    # ...

settings = Settings()