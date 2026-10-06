try:
    from langchain.chains import RetrievalQA
except (ImportError, ModuleNotFoundError):
    from langchain_classic.chains import RetrievalQA

try:
    from langchain_core.prompts import PromptTemplate
except (ImportError, ModuleNotFoundError):
    from langchain.prompts import PromptTemplate

from langchain_groq import ChatGroq
from app.core.config import settings

def get_rag_chain(vector_store_path: str):
    """
    Create a RetrievalQA chain for the given vector store
    """
    # Load vector store
    from langchain_community.vectorstores import Chroma
    from langchain_community.embeddings import HuggingFaceEmbeddings

    embeddings = HuggingFaceEmbeddings(
        model_name=settings.EMBEDDING_MODEL,
        model_kwargs={'device': 'cpu'}
    )

    vector_store = Chroma(
        persist_directory=vector_store_path,
        embedding_function=embeddings
    )

    # Create retriever
    retriever = vector_store.as_retriever(
        search_kwargs={"k": settings.RETRIEVAL_K}
    )

    # Define prompt template
    template = """Answer the question based only on the following context:
    {context}

    Question: {question}

    If you don't know the answer based on the context, say "I couldn't find the answer in the provided document."

    Helpful Answer:"""
    QA_CHAIN_PROMPT = PromptTemplate(
        input_variables=["context", "question"],
        template=template,
    )

    # Initialize LLM based on provider and available keys
    nvidia_key = getattr(settings, "NVIDIA_API_KEY", "").strip()
    groq_key = getattr(settings, "GROQ_API_KEY", "").strip()
    provider = getattr(settings, "LLM_PROVIDER", "nvidia").strip().lower()

    if (provider == "nvidia" and nvidia_key) or (nvidia_key and not groq_key):
        from langchain_nvidia_ai_endpoints import ChatNVIDIA
        model_name = getattr(settings, "NVIDIA_MODEL", "meta/llama-3.1-70b-instruct")
        llm = ChatNVIDIA(
            model=model_name,
            api_key=nvidia_key,
            temperature=0.2
        )
    elif groq_key:
        from langchain_groq import ChatGroq
        model_name = getattr(settings, "GROQ_MODEL", "openai/gpt-oss-20b")
        llm = ChatGroq(
            groq_api_key=groq_key,
            model_name=model_name,
            temperature=0.1
        )
    elif nvidia_key:
        from langchain_nvidia_ai_endpoints import ChatNVIDIA
        model_name = getattr(settings, "NVIDIA_MODEL", "meta/llama-3.1-70b-instruct")
        llm = ChatNVIDIA(
            model=model_name,
            api_key=nvidia_key,
            temperature=0.2
        )
    else:
        raise ValueError("No API key configured! Please set NVIDIA_API_KEY or GROQ_API_KEY in your .env file.")

    # Create QA chain
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        chain_type_kwargs={"prompt": QA_CHAIN_PROMPT},
        return_source_documents=True
    )

    return qa_chain

def query_rag_chain(qa_chain, question: str):
    """
    Query the RAG chain and return result
    """
    if hasattr(qa_chain, "invoke"):
        return qa_chain.invoke({"query": question})
    return qa_chain({"query": question})