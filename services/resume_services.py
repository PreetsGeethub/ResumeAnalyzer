from pathlib import Path

import fitz  # PyMuPDF
from docx import Document

def extract_resume_text(file_path: Path) -> str:
    
    extension  = Path(file_path).suffix.lower()
    
    if extension == ".pdf":
        document = fitz.open(file_path)
        
        extracted_text = ""
        
        for page in document:
            extracted_text += page.get_text()
            
        document.close()
        
        return extracted_text
    
    elif extension == ".docx":
        document = Document(file_path)
        
        extracted_text = ""
        
        for paragraph in document.paragraphs:
            extracted_text += paragraph.text + "\n"
            
        return extracted_text