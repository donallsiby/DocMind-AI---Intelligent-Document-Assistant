from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks
from app.core.config import settings
from app.utils.document_processor import process_document
import os
import uuid
import shutil
from pathlib import Path

router = APIRouter()

# Directory for storing uploaded files and vector stores
UPLOAD_DIR = Path("./uploads")
VECTOR_STORE_DIR = Path("./vector_stores")

# Ensure directories exist
UPLOAD_DIR.mkdir(exist_ok=True)
VECTOR_STORE_DIR.mkdir(exist_ok=True)

@router.post("")
@router.post("/")
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Upload and process a document (PDF, DOCX, TXT)
    """
    # Validate file type by extension or mime type
    allowed_extensions = {".pdf", ".docx", ".txt"}
    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "text/plain"
    ]
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in allowed_extensions and file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, DOCX, and TXT are allowed.")

    # Generate unique file ID
    file_id = str(uuid.uuid4())
    stored_filename = f"{file_id}{file_extension}"
    file_path = UPLOAD_DIR / stored_filename

    # Save uploaded file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
    finally:
        file.file.close()

    # Process document
    try:
        process_document(file_path, file_id, file.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

    return {
        "fileId": file_id,
        "filename": file.filename,
        "message": "File uploaded and processed successfully."
    }