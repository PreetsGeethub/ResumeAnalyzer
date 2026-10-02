"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  analyzeResume,
  getResumeAnalyses,
  getResumes,
  getResumeDownloadUrl,
  type AnalysisType,
  type ResumeAnalysis,
} from "@/lib/resume-api";
import type { Resume } from "@/types/resume";

export default function ResumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [resume, setResume] = useState<Resume | null>(null);
  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [selected, setSelected] = useState<ResumeAnalysis | null>(null);
  const [type, setType] = useState<AnalysisType>("general");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const resumeId = Number(id);
      if (!Number.isInteger(resumeId) || resumeId < 1) {
        setError("Invalid resume.");
        setLoading(false);
        return;
      }

      try {
        const data = await getResumes(1, 100);
        const found = data.items.find((item) => item.id === resumeId);
        if (!found) throw new Error("Resume not found.");

        const history = await getResumeAnalyses(resumeId);
        setResume(found);
        setAnalyses(history);
        setSelected(history[0] ?? null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to load this resume.";
        if (message.toLowerCase().includes("not authenticated")) {
          window.location.href = "/login";
          return;
        }
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [id]);

  async function runAnalysis() {
    if (!resume) return;

    if (type === "job_match" && !jobDescription.trim()) {
      setError("Paste the job description first.");
      return;
    }

    setAnalyzing(true);
    setError("");

    try {
      const result = await analyzeResume(
        resume.id,
        type,
        jobDescription.trim(),
      );
      setAnalyses((current) => [result, ...current]);
      setSelected(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to analyze this resume.",
      );
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F1EA] text-sm text-[#817B72]">
        Loading resume…
      </main>
    );
  }

  if (!resume) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F1EA] px-6 text-center">
        <div>
          <p className="font-serif text-3xl">{error || "Resume not found."}</p>
          <Link
            href="/resumes"
            className="mt-5 inline-block text-sm font-semibold underline decoration-[#E4572E] decoration-2 underline-offset-4"
          >
            ← Back to resumes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F1EA] text-[#171717]">
      <nav className="border-b border-[#D8D3CA] bg-[#FBFAF6]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/dashboard" className="font-serif text-xl">
            ResumeAI
          </Link>
          <Link
            href="/resumes"
            className="text-sm font-medium text-[#625D55]"
          >
            ← All resumes
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <div className="flex flex-col justify-between gap-6 border-b border-[#D8D3CA] pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A8402F]">
              Resume detail
            </p>
            <h1 className="mt-3 font-serif text-5xl font-medium tracking-[-0.04em]">
              {resume.title}
            </h1>
            <p className="mt-3 text-sm text-[#817B72]">{resume.filename}</p>
          </div>
          <a
            href={getResumeDownloadUrl(resume.id)}
            className="rounded-full border border-[#CFC9BE] px-5 py-2.5 text-sm font-semibold hover:bg-[#FBFAF6]"
          >
            Download resume
          </a>
        </div>

        {error && (
          <div className="mt-6 rounded-md border border-[#A8402F]/20 bg-[#A8402F]/5 px-4 py-3 text-sm text-[#8C2F27]">
            {error}
          </div>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.68fr_1.32fr]">
          <aside className="h-fit space-y-6">
            <div className="border border-[#D8D3CA] bg-[#FBFAF6] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#817B72]">
                New analysis
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {(["general", "job_match"] as AnalysisType[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setType(item)}
                    className={`rounded-md border px-3 py-3 text-left text-sm ${type === item ? "border-[#171717] bg-[#171717] text-white" : "border-[#D8D3C8] bg-white text-[#4A4D52]"}`}
                  >
                    <span className="block font-semibold">
                      {item === "general" ? "General" : "Job match"}
                    </span>
                    <span className="mt-1 block text-xs opacity-70">
                      {item === "general" ? "Review the resume" : "Compare a role"}
                    </span>
                  </button>
                ))}
              </div>

              {type === "job_match" && (
                <textarea
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  maxLength={20000}
                  placeholder="Paste the job description here…"
                  className="mt-4 min-h-48 w-full resize-y rounded-md border border-[#D8D3C8] bg-white p-4 text-sm leading-6 outline-none focus:border-[#A8402F] focus:ring-2 focus:ring-[#A8402F]/20"
                />
              )}

              <button
                type="button"
                onClick={() => void runAnalysis()}
                disabled={analyzing}
                className="mt-4 w-full rounded-md bg-[#E4572E] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#C94725] disabled:opacity-60"
              >
                {analyzing ? "Analyzing…" : "Run analysis"}
              </button>
            </div>

            <div className="border border-[#D8D3CA] bg-[#FBFAF6] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#817B72]">
                Analysis history
              </p>
              {analyses.length === 0 ? (
                <p className="mt-5 text-sm leading-6 text-[#817B72]">
                  No analyses yet.
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  {analyses.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelected(item)}
                      className={`w-full rounded-md border px-4 py-3 text-left ${selected?.id === item.id ? "border-[#171717] bg-[#F0ECE3]" : "border-[#E0DBD2] bg-white hover:bg-[#F7F4ED]"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">
                          {item.analysis_type === "job_match"
                            ? "Job match"
                            : "General review"}
                        </span>
                        <span className="font-serif text-xl">
                          {item.overall_score}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#817B72]">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <div className="space-y-8">
            <section className="border border-[#D8D3CA] bg-[#FBFAF6] p-6 lg:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#817B72]">
                Resume snapshot
              </p>
              <p className="mt-5 max-h-48 overflow-hidden whitespace-pre-wrap text-sm leading-7 text-[#625D55]">
                {resume.extracted_text || "No extracted text is available."}
              </p>
            </section>

            {selected ? (
              <AnalysisResult analysis={selected} />
            ) : (
              <div className="border border-dashed border-[#CFC9BE] bg-[#FBFAF6] px-6 py-20 text-center">
                <p className="font-serif text-3xl">No analysis yet.</p>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#817B72]">
                  Run a general review or paste a job description to see what
                  the AI finds.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function AnalysisResult({ analysis }: { analysis: ResumeAnalysis }) {
  const extracted = analysis.extracted;

  return (
    <div className="space-y-8">
      <section className="border border-[#D8D3CA] bg-[#FBFAF6] p-6 lg:p-8">
        <div className="flex flex-col justify-between gap-5 border-b border-[#D8D3CA] pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#817B72]">
              {analysis.analysis_type === "job_match" ? "Job match score" : "Resume score"}
            </p>
            <p className="mt-1 font-serif text-6xl">
              {analysis.overall_score}
              <span className="text-2xl text-[#AAA49A]">/100</span>
            </p>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#625D55]">
            {extracted.summary || "The analysis did not return a summary."}
          </p>
        </div>

        <ResultList title="Strengths" items={analysis.analysis.strengths} />
        <ResultList title="Weaknesses" items={analysis.analysis.weaknesses} />
        <ResultList title="Matched skills" items={analysis.analysis.matched_skills} />
        <ResultList title="Missing skills" items={analysis.analysis.missing_skills} />
        <ResultList title="Recommended roles" items={analysis.analysis.recommended_roles} />
        <ResultList title="Recommendations" items={analysis.analysis.recommendations} />
      </section>

      <section className="border border-[#D8D3CA] bg-[#FBFAF6] p-6 lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#817B72]">
          Extracted profile
        </p>

        {extracted.skills.length > 0 && (
          <div className="mt-5">
            <h3 className="font-serif text-2xl">Skills</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {extracted.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-[#F0ECE3] px-3 py-1.5 text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <ExtractedSection
            title="Experience"
            items={extracted.experience.map((item) => ({
              title: item.role || "Role",
              subtitle: [item.company, item.duration].filter(Boolean).join(" · "),
              details: item.description,
            }))}
          />
          <ExtractedSection
            title="Education"
            items={extracted.education.map((item) => ({
              title: item.degree || "Education",
              subtitle: [item.institution, item.duration].filter(Boolean).join(" · "),
              details: item.details,
            }))}
          />
        </div>

        <div className="mt-8">
          <ExtractedSection
            title="Projects"
            items={extracted.projects.map((item) => ({
              title: item.name || "Project",
              subtitle: item.technologies.join(" · "),
              details: item.description,
            }))}
          />
        </div>
      </section>
    </div>
  );
}

function ResultList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-6 first:mt-0">
      <h3 className="font-serif text-xl">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="border-l-2 border-[#E4572E] pl-4 text-sm leading-6 text-[#625D55]">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ExtractedSection({
  title,
  items,
}: {
  title: string;
  items: Array<{ title: string; subtitle: string; details: string[] }>;
}) {
  return (
    <section>
      <h3 className="font-serif text-2xl">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-[#AAA49A]">Nothing extracted.</p>
      ) : (
        <div className="mt-4 space-y-5">
          {items.map((item, index) => (
            <article key={`${title}-${index}`}>
              <p className="text-sm font-semibold">{item.title}</p>
              {item.subtitle && <p className="mt-1 text-xs text-[#817B72]">{item.subtitle}</p>}
              {item.details.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {item.details.map((detail, detailIndex) => (
                    <li key={`${title}-${index}-${detailIndex}`} className="text-sm leading-6 text-[#625D55]">
                      • {detail}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
