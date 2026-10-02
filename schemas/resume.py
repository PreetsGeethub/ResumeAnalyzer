
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    title: str
    filename: str

    model_config = {
        "from_attributes": True
    }



class ExtractedResumeResponse(BaseModel):
    summary: str | None = None
    skills: list[str] = Field(default_factory=list)
    experience: list[dict[str, Any]] = Field(default_factory=list)
    education: list[dict[str, Any]] = Field(default_factory=list)
    projects: list[dict[str, Any]] = Field(default_factory=list)


class ResumeAnalysisData(BaseModel):
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)


class ResumeAnalysisResponse(BaseModel):
    id: int
    resume_id: int
    analysis_type: str
    job_description: str | None = None
    overall_score: int
    extracted: ExtractedResumeResponse
    analysis: ResumeAnalysisData
    created_at: datetime

    model_config = {
        "from_attributes": True
    }