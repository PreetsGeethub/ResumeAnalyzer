from typing import Literal

from pydantic import BaseModel, model_validator
from datetime import datetime
from typing import Any

from pydantic import  Field


class ResumeAnalysisRequest(BaseModel):
    analysis_type: Literal["general", "job_match"]
    job_description: str | None = None

    @model_validator(mode="after")
    def validate_job_description(self):
        if self.analysis_type == "job_match" and not self.job_description:
            raise ValueError(
                "job_description is required for job_match analysis"
            )

        if self.analysis_type == "general" and self.job_description:
            raise ValueError(
                "job_description should not be provided for general analysis"
            )

        return self


class ExperienceItem(BaseModel):
    company: str | None = None
    role: str | None = None
    duration: str | None = None
    description: list[str] = Field(default_factory=list)


class EducationItem(BaseModel):
    degree: str | None = None
    institution: str | None = None
    duration: str | None = None
    details: list[str] = Field(default_factory=list)


class ProjectItem(BaseModel):
    name: str | None = None
    technologies: list[str] = Field(default_factory=list)
    description: list[str] = Field(default_factory=list)
class ExtractedResumeResponse(BaseModel):
    summary: str | None = None
    skills: list[str] = Field(default_factory=list)
    experience: list[ExperienceItem] = Field(default_factory=list)
    education: list[EducationItem] = Field(default_factory=list)
    projects: list[ProjectItem] = Field(default_factory=list)


class ResumeAnalysisData(BaseModel):
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    recommended_roles: list[str] = Field(default_factory=list)
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
    
    
class ResumeAIOutput(BaseModel):
    overall_score: int

    extracted: ExtractedResumeResponse

    analysis: ResumeAnalysisData