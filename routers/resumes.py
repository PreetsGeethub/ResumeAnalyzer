from math import ceil
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from db.database import get_db
from models.resume import Resume
from models.resume_analysis import ResumeAnalysis
from schemas.resume_analysis import (
    ResumeAnalysisRequest,
    ResumeAnalysisResponse,
)
from services.analysis_services import analyze_resume_text
from services.resume_services import extract_resume_text
from services.token_services import get_current_user

router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
UPLOAD_DIR = Path("uploads/resumes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/resumes", status_code=status.HTTP_201_CREATED)
async def upload_resume(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A filename is required.",
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only PDF and DOCX files are allowed.",
        )

    unique_filename = f"{uuid4().hex}{extension}"
    file_path = UPLOAD_DIR / unique_filename
    total_size = 0

    try:
        with file_path.open("wb") as buffer:
            while chunk := await file.read(1024 * 1024):
                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="File size exceeds the maximum limit of 5MB.",
                    )

                buffer.write(chunk)

        extracted_text = extract_resume_text(file_path)

        if not extracted_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract text from the uploaded resume.",
            )

        resume = Resume(
            user_id=current_user.id,
            title=title.strip(),
            filename=file.filename,
            file_path=str(file_path),
            extracted_text=extracted_text,
        )

        db.add(resume)
        db.commit()
        db.refresh(resume)

        return resume

    except HTTPException:
        if file_path.exists():
            file_path.unlink()
        raise
    except Exception:
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to process the uploaded resume.",
        )
    finally:
        await file.close()


@router.post(
    "/resumes/{resume_id}/analyze",
    response_model=ResumeAnalysisResponse,
)
def analyze_resume(
    resume_id: int,
    request: ResumeAnalysisRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    if not resume.extracted_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text has not been extracted",
        )

    try:
        ai_result = analyze_resume_text(
            resume_text=resume.extracted_text,
            analysis_type=request.analysis_type,
            job_description=request.job_description,
        )
    except RuntimeError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Resume analysis service is temporarily unavailable. Please try again.",
        )

    resume_analysis = ResumeAnalysis(
        resume_id=resume.id,
        analysis_type=request.analysis_type,
        job_description=request.job_description,
        overall_score=ai_result.overall_score,
        analysis={
            "extracted": ai_result.extracted.model_dump(),
            "analysis": ai_result.analysis.model_dump(),
        },
    )

    db.add(resume_analysis)
    db.commit()
    db.refresh(resume_analysis)

    return {
        "id": resume_analysis.id,
        "resume_id": resume_analysis.resume_id,
        "analysis_type": resume_analysis.analysis_type,
        "job_description": resume_analysis.job_description,
        "overall_score": resume_analysis.overall_score,
        "extracted": ai_result.extracted,
        "analysis": ai_result.analysis,
        "created_at": resume_analysis.created_at,
    }


@router.get("/resumes/{resume_id}/analyses", response_model=list[ResumeAnalysisResponse])
def get_resume_analyses(
    resume_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == current_user.id,
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    return (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.resume_id == resume_id)
        .order_by(ResumeAnalysis.created_at.desc())
        .all()
    )


@router.get("/analyses/{analysis_id}", response_model=ResumeAnalysisResponse)
def get_analysis(
    analysis_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = db.query(ResumeAnalysis).filter(
        ResumeAnalysis.id == analysis_id
    ).first()

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found",
        )

    resume = db.query(Resume).filter(
        Resume.id == analysis.resume_id,
        Resume.user_id == current_user.id,
    ).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found",
        )

    stored = analysis.analysis or {}

    return {
        "id": analysis.id,
        "resume_id": analysis.resume_id,
        "analysis_type": analysis.analysis_type,
        "job_description": analysis.job_description,
        "overall_score": analysis.overall_score,
        "extracted": stored.get("extracted", {}),
        "analysis": stored.get("analysis", {}),
        "created_at": analysis.created_at,
    }


@router.delete("/resumes/{resume_id}")
def delete_resume(
    resume_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    db.query(ResumeAnalysis).filter(
        ResumeAnalysis.resume_id == resume.id
    ).delete(synchronize_session=False)

    file_path = Path(resume.file_path)

    if file_path.exists():
        file_path.unlink()

    db.delete(resume)
    db.commit()

    return {"message": "Resume deleted successfully"}


@router.get("/resumes")
def get_resumes(
    page: int = 1,
    limit: int = 10,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if page < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page must be greater than or equal to 1",
        )

    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Limit must be between 1 and 100",
        )

    query = db.query(Resume).filter(Resume.user_id == current_user.id)
    total = query.count()

    resumes = (
        query.order_by(Resume.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "items": resumes,
        "page": page,
        "limit": limit,
        "total": total,
        "pages": ceil(total / limit) if total else 0,
    }


@router.get("/resumes/{resume_id}/download")
def download_resume(
    resume_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id,
    ).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    file_path = Path(resume.file_path)

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume file not found",
        )

    return FileResponse(
        path=file_path,
        filename=resume.filename,
    )
