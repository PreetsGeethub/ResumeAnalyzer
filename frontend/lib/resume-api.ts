import type { Resume } from "@/types/resume";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ResumeListResponse = {
  items: Resume[];
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type AnalysisType = "general" | "job_match";

export type ResumeAnalysis = {
  id: number;
  resume_id: number;
  analysis_type: AnalysisType;
  job_description: string | null;
  overall_score: number;
  extracted: {
    summary: string | null;
    skills: string[];
    experience: Array<{
      company: string | null;
      role: string | null;
      duration: string | null;
      description: string[];
    }>;
    education: Array<{
      degree: string | null;
      institution: string | null;
      duration: string | null;
      details: string[];
    }>;
    projects: Array<{
      name: string | null;
      technologies: string[];
      description: string[];
    }>;
  };
  analysis: {
    strengths: string[];
    weaknesses: string[];
    matched_skills: string[];
    missing_skills: string[];
    recommended_roles: string[];
    recommendations: string[];
  };
  created_at: string;
};

type ApiError = { detail?: string };

async function parseError(response: Response) {
  try {
    const data = (await response.json()) as ApiError;
    return data.detail ?? "Something went wrong. Please try again.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

export async function getResumes(page = 1, limit = 10) {
  const response = await fetch(
    `${API_BASE_URL}/resumes?page=${page}&limit=${limit}`,
    { credentials: "include" },
  );

  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<ResumeListResponse>;
}

export async function uploadResume(title: string, file: File) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/resumes`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<Resume>;
}

export async function deleteResume(resumeId: number) {
  const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) throw new Error(await parseError(response));
}

export async function analyzeResume(
  resumeId: number,
  analysisType: AnalysisType,
  jobDescription?: string,
) {
  const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}/analyze`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      analysis_type: analysisType,
      ...(analysisType === "job_match"
        ? { job_description: jobDescription }
        : {}),
    }),
  });

  if (!response.ok) throw new Error(await parseError(response));
  return response.json() as Promise<ResumeAnalysis>;
}

export function getResumeDownloadUrl(resumeId: number) {
  return `${API_BASE_URL}/resumes/${resumeId}/download`;
}
