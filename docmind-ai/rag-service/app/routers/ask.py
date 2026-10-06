from fastapi import APIRouter, HTTPException
from app.core.config import settings
from app.utils.rag_chain import get_rag_chain
import os

router = APIRouter()

@router.post("")
@router.post("/")
async def ask_question(request: dict):
    """
    Ask a question about an uploaded document
    """
    question = request.get("question")
    file_id = request.get("fileId")

    if not question or not file_id:
        raise HTTPException(status_code=400, detail="Question and fileId are required")

    # Construct path to vector store
    vector_store_path = os.path.join(settings.CHROMA_PERSIST_DIRECTORY, file_id)
    if not os.path.exists(vector_store_path):
        raise HTTPException(status_code=404, detail="Document not found or not processed yet")

    try:
        # Get RAG chain for this document
        qa_chain = get_rag_chain(vector_store_path)

        # Get answer
        if hasattr(qa_chain, "invoke"):
            result = qa_chain.invoke({"query": question})
        else:
            result = qa_chain({"query": question})

        answer = result.get("result") if isinstance(result, dict) else str(result)
        source_docs = result.get("source_documents", []) if isinstance(result, dict) else []

        sources = []
        for doc in source_docs:
            meta = getattr(doc, "metadata", {}) or {}
            page = meta.get("page")
            page_label = f"Page {page + 1}" if page is not None else "Section"
            source_label = meta.get("original_filename") or os.path.basename(str(meta.get("source", "Document")))
            sources.append({
                "content": doc.page_content[:200] + "..." if hasattr(doc, "page_content") else "",
                "metadata": meta,
                "source": source_label,
                "page": page_label
            })

        return {
            "answer": answer,
            "sources": sources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")