"use client";

import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import { ChangeEvent, useEffect, useState } from "react";
import {
  analyzeResume,
  deleteResume,
  getResumeDownloadUrl,
  getResumes,
  type AnalysisType,
  type ResumeAnalysis,
  uploadResume,
} from "@/lib/resume-api";
import type { Resume } from "@/types/resume";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType>("general");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function loadResumes() {
    setLoading(true);
    setError("");

    try {
      const data = await getResumes();
      setResumes(data.items);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load your resumes.";

      if (message.toLowerCase().includes("not authenticated")) {
        window.location.href = "/login";
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResumes();
  }, []);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension || !["pdf", "docx"].includes(extension)) {
      setSelectedFile(null);
      event.target.value = "";
      setError("Please choose a PDF or DOCX file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      event.target.value = "";
      setError("That file is larger than the 5MB limit.");
      return;
    }

    setSelectedFile(file);

    if (!title.trim()) {
      setTitle(file.name.replace(/\.(pdf|docx)$/i, ""));
    }
  }

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Give this resume a title first.");
      return;
    }

    if (!selectedFile) {
      setError("Choose a PDF or DOCX file to upload.");
      return;
    }

    setUploading(true);

    try {
      await uploadResume(title.trim(), selectedFile);
      setTitle("");
      setSelectedFile(null);
      const input = document.getElementById("resume-file") as HTMLInputElement | null;
      if (input) input.value = "";
      setSuccess("Resume uploaded successfully.");
      await loadResumes();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to upload this resume.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(resume: Resume) {
    if (!window.confirm(`Delete "${resume.title}"? This also removes its saved analyses.`)) {
      return;
    }

    setDeletingId(resume.id);
    setError("");
    setSuccess("");

    try {
      await deleteResume(resume.id);
      setResumes((current) => current.filter((item) => item.id !== resume.id));
      setSuccess("Resume deleted.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete this resume.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function openAnalysis(resume: Resume) {
    setSelectedResume(resume);
    setAnalysisType("general");
    setJobDescription("");
    setAnalysis(null);
    setError("");
  }

  async function handleAnalyze() {
    if (!selectedResume) return;

    if (analysisType === "job_match" && !jobDescription.trim()) {
      setError("Paste the job description before running a job match.");
      return;
    }

    setAnalyzingId(selectedResume.id);
    setError("");

    try {
      const result = await analyzeResume(
        selectedResume.id,
        analysisType,
        jobDescription.trim(),
      );
      setAnalysis(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to analyze this resume.",
      );
    } finally {
      setAnalyzingId(null);
    }
  }

  return (
    <main
      className={`${fraunces.variable} ${inter.variable} min-h-screen bg-[#F4F1EA] text-[#171717] font-[family-name:var(--font-inter)]`}
    >
      <nav className="border-b border-[#D8D3CA] bg-[#FBFAF6]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/dashboard"
            className="font-[family-name:var(--font-fraunces)] text-xl tracking-[-0.02em]"
          >
            ResumeAI
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-[#625D55] hover:text-[#171717]"
          >
            ← Dashboard
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A8402F]">
            Resume workspace
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-5xl font-medium leading-[0.95] tracking-[-0.04em]">
            Your resumes, in one place.
          </h1>
          <p className="mt-5 text-base leading-7 text-[#625D55]">
            Upload a version of your resume, then use it for a general review
            or a job-specific match.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <form
            onSubmit={handleUpload}
            className="h-fit border border-[#D8D3CA] bg-[#FBFAF6] p-7 lg:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#817B72]">
              Add a resume
            </p>

            <label
              htmlFor="resume-title"
              className="mt-7 mb-2 block text-sm font-medium text-[#4A4D52]"
            >
              Resume title
            </label>
            <input
              id="resume-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Software Engineer — 2026"
              className="w-full rounded-md border border-[#D8D3C8] bg-white px-4 py-3 text-sm outline-none focus:border-[#A8402F] focus:ring-2 focus:ring-[#A8402F]/20"
            />

            <label
              htmlFor="resume-file"
              className="mt-6 mb-2 block text-sm font-medium text-[#4A4D52]"
            >
              File
            </label>
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="block w-full cursor-pointer rounded-md border border-dashed border-[#C9C3B8] bg-white px-4 py-5 text-sm text-[#625D55] file:mr-4 file:rounded-full file:border-0 file:bg-[#171717] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
            />

            <p className="mt-3 text-xs leading-5 text-[#817B72]">
              PDF or DOCX · maximum 5MB
            </p>

            {selectedFile && (
              <div className="mt-4 rounded-md bg-[#F0ECE3] px-4 py-3 text-sm text-[#4A4D52]">
                <span className="font-medium">{selectedFile.name}</span>
                <span className="ml-2 text-[#817B72]">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="mt-6 w-full rounded-md bg-[#171717] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2A2D33] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Uploading…" : "Upload resume"}
            </button>
          </form>

          <section>
            <div className="flex items-end justify-between border-b border-[#D8D3CA] pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#817B72]">
                  Library
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl font-medium">
                  {resumes.length} {resumes.length === 1 ? "resume" : "resumes"}
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm text-[#817B72]">
                Loading your resumes…
              </div>
            ) : resumes.length === 0 ? (
              <div className="border-x border-b border-[#D8D3CA] bg-[#FBFAF6] px-6 py-16 text-center">
                <p className="font-[family-name:var(--font-fraunces)] text-2xl">
                  Your library is empty.
                </p>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#817B72]">
                  Upload your first resume and we&apos;ll turn it into an
                  analysis you can act on.
                </p>
              </div>
            ) : (
              <div className="divide-y border-x border-b border-[#D8D3CA] bg-[#FBFAF6]">
                {resumes.map((resume) => (
                  <article
                    key={resume.id}
                    className="p-6 transition hover:bg-white lg:p-7"
                  >
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <h3 className="font-[family-name:var(--font-fraunces)] text-2xl font-medium">
                          {resume.title}
                        </h3>
                        <p className="mt-2 truncate text-sm text-[#817B72]">
                          {resume.filename}
                        </p>
                        <p className="mt-1 text-xs text-[#AAA49A]">
                          Uploaded{" "}
                          {new Date(resume.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openAnalysis(resume)}
                          className="rounded-full bg-[#E4572E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#C94725]"
                        >
                          Analyze
                        </button>
                        <a
                          href={getResumeDownloadUrl(resume.id)}
                          className="rounded-full border border-[#CFC9BE] px-4 py-2 text-xs font-semibold text-[#4A4D52] hover:bg-[#F0ECE3]"
                        >
                          Download
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(resume)}
                          disabled={deletingId === resume.id}
                          className="rounded-full border border-[#D8D3C8] px-4 py-2 text-xs font-semibold text-[#8C2F27] hover:bg-[#A8402F]/5 disabled:opacity-50"
                        >
                          {deletingId === resume.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {(error || success) && (
          <div
            className={`mt-6 rounded-md border px-4 py-3 text-sm ${
              error
                ? "border-[#A8402F]/20 bg-[#A8402F]/5 text-[#8C2F27]"
                : "border-[#3D7252]/20 bg-[#3D7252]/5 text-[#3D7252]"
            }`}
            role="status"
          >
            {error || success}
          </div>
        )}
      </section>

      {selectedResume && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#171717]/50 p-4 sm:p-8">
          <div className="mx-auto max-w-4xl rounded-lg border border-[#D8D3CA] bg-[#FBFAF6] shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#D8D3CA] px-6 py-5 lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#A8402F]">
                  Analysis
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl font-medium">
                  {selectedResume.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedResume(null)}
                className="rounded-full px-3 py-1 text-xl text-[#817B72] hover:bg-[#F0ECE3]"
                aria-label="Close analysis"
              >
                ×
              </button>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[0.7fr_1.3fr] lg:p-8">
              <div>
                <label className="text-sm font-medium text-[#4A4D52]">
                  Analysis type
                </label>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAnalysisType("general")}
                    className={`rounded-md border px-4 py-3 text-left text-sm ${
                      analysisType === "general"
                        ? "border-[#171717] bg-[#171717] text-white"
                        : "border-[#D8D3C8] bg-white text-[#4A4D52]"
                    }`}
                  >
                    <span className="block font-semibold">General</span>
                    <span className="mt-1 block text-xs opacity-70">
                      Review the resume itself
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnalysisType("job_match")}
                    className={`rounded-md border px-4 py-3 text-left text-sm ${
                      analysisType === "job_match"
                        ? "border-[#171717] bg-[#171717] text-white"
                        : "border-[#D8D3C8] bg-white text-[#4A4D52]"
                    }`}
                  >
                    <span className="block font-semibold">Job match</span>
                    <span className="mt-1 block text-xs opacity-70">
                      Compare against a role
                    </span>
                  </button>
                </div>

                {analysisType === "job_match" && (
                  <textarea
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    placeholder="Paste the job description here…"
                    maxLength={20000}
                    className="mt-4 min-h-52 w-full resize-y rounded-md border border-[#D8D3C8] bg-white p-4 text-sm leading-6 outline-none focus:border-[#A8402F] focus:ring-2 focus:ring-[#A8402F]/20"
                  />
                )}

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzingId === selectedResume.id}
                  className="mt-4 w-full rounded-md bg-[#E4572E] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#C94725] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {analyzingId === selectedResume.id
                    ? "Analyzing…"
                    : "Run analysis"}
                </button>
              </div>

              <div className="min-h-72">
                {!analysis ? (
                  <div className="flex h-full min-h-72 items-center justify-center border border-dashed border-[#CFC9BE] px-6 text-center">
                    <div>
                      <p className="font-[family-name:var(--font-fraunces)] text-2xl">
                        Ready when you are.
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#817B72]">
                        Choose an analysis type and run it to see the results
                        here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-[#D8D3CA] pb-5">
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-[#817B72]">
                          Overall score
                        </p>
                        <p className="mt-1 font-[family-name:var(--font-fraunces)] text-5xl">
                          {analysis.overall_score}
                          <span className="text-2xl text-[#AAA49A]">/100</span>
                        </p>
                      </div>
                      <span className="rounded-full bg-[#F0ECE3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#625D55]">
                        {analysis.analysis_type === "job_match"
                          ? "Job match"
                          : "General"}
                      </span>
                    </div>

                    <ResultList
                      title="Strengths"
                      items={analysis.analysis.strengths}
                    />
                    <ResultList
                      title="Weaknesses"
                      items={analysis.analysis.weaknesses}
                    />
                    {analysis.analysis.matched_skills.length > 0 && (
                      <ResultList
                        title="Matched skills"
                        items={analysis.analysis.matched_skills}
                      />
                    )}
                    {analysis.analysis.missing_skills.length > 0 && (
                      <ResultList
                        title="Missing skills"
                        items={analysis.analysis.missing_skills}
                      />
                    )}
                    <ResultList
                      title="Recommendations"
                      items={analysis.analysis.recommendations}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ResultList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;

  return (
    <section>
      <h3 className="font-[family-name:var(--font-fraunces)] text-xl font-medium">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li
            key={`${title}-${index}`}
            className="border-l-2 border-[#E4572E] pl-4 text-sm leading-6 text-[#625D55]"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
