import os
import shutil
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

from langchain_groq import ChatGroq
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

load_dotenv()

app = FastAPI(title="DocMind RAG Service")

CHROMA_DIR = "chroma_db"
os.makedirs(CHROMA_DIR, exist_ok=True)

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

PROMPT = PromptTemplate(
    template=(
        "You are DocMind AI. Answer ONLY using the context.\n"
        "If the answer isn't in the context, say: \"I couldn't find that in the document.\" \n\n"
        "Context:\n{context}\n\nQuestion: {question}\nAnswer:"
    ),
    input_variables=["context", "question"],
)

def get_vectorstore():
    return Chroma(
        persist_directory=CHROMA_DIR,
        embedding_function=embeddings
    )

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    # Save temp file
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Load + split
    docs = PyPDFLoader(temp_path).load()
    chunks = RecursiveCharacterTextSplitter(
        chunk_size=1000, chunk_overlap=150
    ).split_documents(docs)

    # Store
    vectorstore = get_vectorstore()
    vectorstore.add_documents(chunks)
    vectorstore.persist()

    os.remove(temp_path)

    return {"message": f"Uploaded {file.filename}", "chunks": len(chunks)}

class Query(BaseModel):
    question: str

@app.post("/ask")
async def ask(q: Query):
    vectorstore = get_vectorstore()
    retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

    llm = ChatGroq(
        model_name="openai/gpt-oss-20b",
        temperature=0
    )

    qa = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True,
        chain_type_kwargs={"prompt": PROMPT},
    )

    result = qa.invoke({"query": q.question})
    sources = list({
        f"Page {d.metadata.get('page', '?')}"
        for d in result["source_documents"]
    })

    return {"answer": result["result"], "sources": sources}