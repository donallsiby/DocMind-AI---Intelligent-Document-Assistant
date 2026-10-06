from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # LLM Settings
    LLM_PROVIDER: str = "nvidia"
    NVIDIA_API_KEY: str = ""
    NVIDIA_MODEL: str = "meta/llama-3.1-70b-instruct"
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-20b"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CHROMA_PERSIST_DIRECTORY: str = "./vector_stores"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 150
    RETRIEVAL_K: int = 4

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = "ignore"

settings = Settings()