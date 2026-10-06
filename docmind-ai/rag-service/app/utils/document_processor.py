import os
import logging
from pathlib import Path
from typing import List
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from app.core.config import settings

logger = logging.getLogger(__name__)

def process_document(file_path: Path, file_id: str, filename: str):
    """
    Process a document: load, split, embed, and store in vector database
    """
    try:
        logger.info(f"Processing document: {filename}")

        # Load document based on file type
        if file_path.suffix.lower() == '.pdf':
            loader = PyPDFLoader(str(file_path))
            documents = loader.load()
        elif file_path.suffix.lower() == '.docx':
            loader = Docx2txtLoader(str(file_path))
            documents = loader.load()
        elif file_path.suffix.lower() == '.txt':
            try:
                loader = TextLoader(str(file_path), encoding='utf-8')
                documents = loader.load()
            except UnicodeDecodeError:
                loader = TextLoader(str(file_path), encoding='latin-1', autodetect_encoding=True)
                documents = loader.load()
        else:
            raise ValueError(f"Unsupported file type: {file_path.suffix}")

        for doc in documents:
            if not hasattr(doc, "metadata") or doc.metadata is None:
                doc.metadata = {}
            doc.metadata["original_filename"] = filename

        logger.info(f"Loaded {len(documents)} document sections")

        # Split text into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )
        texts = text_splitter.split_documents(documents)
        logger.info(f"Split into {len(texts)} chunks")

        # Create embeddings
        embeddings = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL,
            model_kwargs={'device': 'cpu'}
        )

        # Create vector store
        vector_store = Chroma.from_documents(
            documents=texts,
            embedding=embeddings,
            persist_directory=str(Path(settings.CHROMA_PERSIST_DIRECTORY) / file_id)
        )

        # Persist the vector store if required by version
        if hasattr(vector_store, "persist"):
            vector_store.persist()
        logger.info(f"Vector store created and persisted for document {file_id}")

    except Exception as e:
        logger.error(f"Error processing document {filename}: {str(e)}")
        raise e