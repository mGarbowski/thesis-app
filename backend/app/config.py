from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="")
    database_url: str
    cors_allowed_origin: str
    enable_sqlalchemy_logging: bool = False
    facenet_weights_path: str | None = None
    facenet_weights_key: str = "model_state_dict"


settings = Settings()
