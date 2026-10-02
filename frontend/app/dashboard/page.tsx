"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import { getCurrentUser, logoutUser } from "@/lib/api";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((data) =>
        setUser({
          user_id: data.user_id,
          name: data.name,
          email: data.email,
        }),
      )
      .catch(() => {
        window.location.href = "/login";
      })
      .finally(() => setLoading(false));
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
          <Link href="/" className="font-[family-name:var(--font-fraunces)] text-xl tracking-[-0.02em]">
            ResumeAI
          </Link>

          <div className="flex items-center gap-5">
            <span className="hidden text-sm text-[#6F6A61] sm:block">
              {user.email}
            </span>
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
              Upload your resume and turn it into something you can actually
              use in your job search.
            </p>
          </div>

          <Link
            href="/resumes"
            className="rounded-full bg-[#E4572E] px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            View my resumes →
          </Link>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden border border-[#D8D3CA] bg-[#D8D3CA] md:grid-cols-3">
          <article className="bg-[#FBFAF6] p-7 lg:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#817B72]">01</p>
            <h2 className="mt-16 font-[family-name:var(--font-fraunces)] text-2xl font-medium">Upload a resume</h2>
            <p className="mt-3 text-sm leading-6 text-[#625D55]">
              Add a PDF or DOCX and we'll extract the content for analysis.
            </p>
            <Link href="/resumes" className="mt-6 inline-block text-sm font-semibold underline decoration-[#E4572E] decoration-2 underline-offset-4">
              Go to resumes →
            </Link>
          </article>

          <article className="bg-[#FBFAF6] p-7 lg:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#817B72]">02</p>
            <h2 className="mt-16 font-[family-name:var(--font-fraunces)] text-2xl font-medium">Understand your resume</h2>
            <p className="mt-3 text-sm leading-6 text-[#625D55]">
              See strengths, weaknesses, and an overall analysis once your first resume is uploaded.
            </p>
          </article>

          <article className="bg-[#FBFAF6] p-7 lg:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#817B72]">03</p>
            <h2 className="mt-16 font-[family-name:var(--font-fraunces)] text-2xl font-medium">Match a job</h2>
            <p className="mt-3 text-sm leading-6 text-[#625D55]">
              Paste a job description later to see where your resume aligns with a specific role.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
