"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import { getCurrentUser, logoutUser } from "@/lib/api";
import { getResumeAnalyses, getResumes, type ResumeAnalysis } from "@/lib/resume-api";
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

type CurrentUser = {
  user_id: number;
  name: string;
  email: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [latestAnalysis, setLatestAnalysis] = useState<ResumeAnalysis | null>(null);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const currentUser = await getCurrentUser();
        setUser({
          user_id: currentUser.user_id,
          name: currentUser.name,
          email: currentUser.email,
        });

        const resumeData = await getResumes(1, 10);
        setResumes(resumeData.items);

        const history = await Promise.all(
          resumeData.items.map((resume) => getResumeAnalyses(resume.id)),
        );
        const allAnalyses = history.flat();

        setAnalysisCount(allAnalyses.length);
        setLatestAnalysis(
          allAnalyses.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )[0] ?? null,
        );
      } catch {
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    }

    void loadWorkspace();
  }, []);

  async function handleLogout() {
    await logoutUser().catch(() => undefined);
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F1EA] text-[#6F6A61]">
        Loading your workspace…
      </main>
    );
  }

  if (!user) return null;

  return (
    <main
      className={`${fraunces.variable} ${inter.variable} min-h-screen bg-[#F4F1EA] text-[#171717] font-[family-name:var(--font-inter)]`}
    >
      <nav className="border-b border-[#D8D3CA] bg-[#FBFAF6]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="font-[family-name:var(--font-fraunces)] text-xl">
            ResumeAI
          </Link>
          <div className="flex items-center gap-5">
            <span className="hidden text-sm text-[#6F6A61] sm:block">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium underline decoration-[#A8402F] decoration-2 underline-offset-4"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A8402F]">
              Your workspace
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-fraunces)] text-5xl font-medium leading-[0.95] tracking-[-0.04em]">
              Welcome back, {user.name.split(" ")[0]}.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#625D55]">
              Keep your resumes organized and turn each version into useful feedback.
            </p>
          </div>
          <Link
            href="/resumes"
            className="rounded-full bg-[#E4572E] px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            Manage resumes →
          </Link>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden border border-[#D8D3CA] bg-[#D8D3CA] sm:grid-cols-3">
          <StatCard label="Resumes" value={String(resumes.length)} />
          <StatCard label="Analyses" value={String(analysisCount)} />
          <StatCard
            label="Latest score"
            value={latestAnalysis ? String(latestAnalysis.overall_score) : "—"}
            suffix={latestAnalysis ? "/100" : ""}
          />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="border border-[#D8D3CA] bg-[#FBFAF6] p-7 lg:p-9">
            <div className="flex items-end justify-between gap-4 border-b border-[#D8D3CA] pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#817B72]">
                  Recent resumes
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl font-medium">
                  Your library
                </h2>
              </div>
              <Link href="/resumes" className="text-sm font-semibold underline decoration-[#E4572E] decoration-2 underline-offset-4">
                View all
              </Link>
            </div>

            {resumes.length === 0 ? (
              <div className="py-14 text-center">
                <p className="font-[family-name:var(--font-fraunces)] text-2xl">No resumes yet.</p>
                <Link
                  href="/resumes"
                  className="mt-4 inline-block rounded-full bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Upload your first resume
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#E1DCD3]">
                {resumes.slice(0, 5).map((resume) => (
                  <Link
                    key={resume.id}
                    href={`/resumes/${resume.id}`}
                    className="flex items-center justify-between gap-5 py-5 hover:bg-white"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-[family-name:var(--font-fraunces)] text-xl">
                        {resume.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#817B72]">{resume.filename}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold">Open →</span>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="border border-[#D8D3CA] bg-[#171717] p-7 text-white lg:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#B9B1A5]">
              Next step
            </p>
            <h2 className="mt-5 font-[family-name:var(--font-fraunces)] text-3xl leading-tight">
              {latestAnalysis
                ? "Keep improving the version you use for your next application."
                : "Upload a resume and run your first analysis."}
            </h2>
            <p className="mt-5 text-sm leading-6 text-[#C7C0B6]">
              {latestAnalysis
                ? "Open a resume to review the analysis history, extracted profile, and job-match feedback."
                : "Start with a general review. You can then paste a job description to see how that resume matches a specific role."}
            </p>
            <Link
              href="/resumes"
              className="mt-8 inline-block rounded-full bg-[#E4572E] px-5 py-3 text-sm font-semibold text-white"
            >
              {latestAnalysis ? "Review resumes →" : "Get started →"}
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}

function StatCard({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <article className="bg-[#FBFAF6] p-6 lg:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#817B72]">{label}</p>
      <p className="mt-3 font-[family-name:var(--font-fraunces)] text-4xl">
        {value}
        {suffix && <span className="ml-1 text-xl text-[#AAA49A]">{suffix}</span>}
      </p>
    </article>
  );
}
