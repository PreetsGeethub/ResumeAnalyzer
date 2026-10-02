from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from schemas.resume_analysis import (
    EducationItem,
    ExperienceItem,
    ProjectItem,
    ResumeAnalysisData,
)


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    title: str
    filename: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExtractedResumeResponse(BaseModel):
    summary: str | None = None
    skills: list[str] = Field(default_factory=list)
    experience: list[ExperienceItem] = Field(default_factory=list)
    education: list[EducationItem] = Field(default_factory=list)
    projects: list[ProjectItem] = Field(default_factory=list)


class ResumeAnalysisResponse(BaseModel):
    id: int
    resume_id: int
    analysis_type: str
    job_description: str | None = None
    overall_score: int
    extracted: ExtractedResumeResponse
    analysis: ResumeAnalysisData
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
