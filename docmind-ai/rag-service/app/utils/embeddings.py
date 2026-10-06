import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

_embeddings_instance = None

def get_embeddings():
    """
    Singleton provider for sentence embeddings.
    Caches the HuggingFace model in memory so it doesn't get reloaded on every request,
    preventing memory leaks and eliminating 502/timeout issues on Render.
    """
    global _embeddings_instance
    if _embeddings_instance is None:
        logger.info(f"Initializing embedding model: {settings.EMBEDDING_MODEL}")
        from langchain_community.embeddings import HuggingFaceEmbeddings
        _embeddings_instance = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL,
            model_kwargs={'device': 'cpu'}
        )
        logger.info("Embedding model initialized and cached successfully")
    return _embeddings_instance
