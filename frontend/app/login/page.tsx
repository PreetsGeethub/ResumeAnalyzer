"use client";

import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import { FormEvent, useState } from "react";
import { loginUser } from "@/lib/api";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const emailError = !EMAIL_PATTERN.test(email) ? "Enter a valid email address." : "";
  const passwordError = password.length === 0 ? "Enter your password." : "";
  const isValid = !emailError && !passwordError;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ email: true, password: true });
    setSubmitError("");
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await loginUser({ email: email.trim(), password });
      window.location.href = "/dashboard";
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={`${fraunces.variable} ${inter.variable} min-h-screen bg-[#FBFAF6] text-[#17181B] font-[family-name:var(--font-inter)]`}>
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden bg-[#14161A] px-12 py-10 text-[#FBFAF6] lg:flex lg:flex-col" style={{ backgroundImage: "radial-gradient(rgba(251,250,246,0.05) 1px, transparent 1px)", backgroundSize: "18px 18px" }}>
          <Link href="/" className="relative z-10 w-fit font-[family-name:var(--font-fraunces)] text-xl tracking-[-0.02em]">ResumeAI</Link>
          <div className="relative z-10 my-auto max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B7B3A8]">Welcome back</p>
            <h1 className="mt-5 font-[family-name:var(--font-fraunces)] text-[clamp(2.8rem,4vw,4rem)] font-medium leading-[1.05] tracking-[-0.02em]">Pick up where your resume left off.</h1>
            <p className="mt-6 max-w-md text-[15px] leading-7 text-[#B7B3A8]">Review previous analyses, upload a new version, or match your resume against the next role you are considering.</p>
          </div>
          <div className="relative z-10 mt-auto border-t border-white/10 pt-5 text-[12px] text-[#8B8880]">Your career deserves better than guesswork.</div>
        </section>

        <section className="flex min-h-screen flex-col px-6 py-7 sm:px-10 lg:px-16">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-[family-name:var(--font-fraunces)] text-xl tracking-[-0.02em] lg:hidden">ResumeAI</Link>
            <div className="ml-auto text-sm text-[#6F6A61]">New here?{" "}<Link href="/register" className="font-medium text-[#17181B] underline decoration-[#A8402F] decoration-2 underline-offset-4">Create an account</Link></div>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A8402F]">Sign in</p>
              <h2 className="mt-4 font-[family-name:var(--font-fraunces)] text-4xl font-medium leading-[1.1] tracking-[-0.02em]">Good to see you again.</h2>
              <p className="mt-4 max-w-sm text-[15px] leading-6 text-[#6F6A61]">Sign in to continue reviewing and improving your resume.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#4A4D52]">Email address</label>
                <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} onBlur={() => setTouched((prev) => ({ ...prev, email: true }))} placeholder="you@example.com" autoComplete="email" aria-invalid={touched.email && !!emailError} className="w-full rounded-md border border-[#D8D3C8] bg-white px-4 py-3 text-base outline-none placeholder:text-[#AAA49A] focus:border-[#A8402F] focus-visible:ring-2 focus-visible:ring-[#A8402F]/30" />
                {touched.email && emailError && <p className="mt-1.5 text-sm text-[#A8402F]">{emailError}</p>}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-[#4A4D52]">Password</label>
                  <span className="text-xs text-[#AAA49A]">Keep it secure</span>
                </div>
                <div className="relative">
                  <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} onBlur={() => setTouched((prev) => ({ ...prev, password: true }))} placeholder="••••••••" autoComplete="current-password" aria-invalid={touched.password && !!passwordError} className="w-full rounded-md border border-[#D8D3C8] bg-white px-4 py-3 pr-16 text-base tracking-[0.1em] outline-none placeholder:text-[#AAA49A] focus:border-[#A8402F] focus-visible:ring-2 focus-visible:ring-[#A8402F]/30" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-1 text-xs font-medium text-[#8A847A] hover:text-[#17181B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8402F]/30">{showPassword ? "Hide" : "Show"}</button>
                </div>
                {touched.password && passwordError && <p className="mt-1.5 text-sm text-[#A8402F]">{passwordError}</p>}
              </div>

              {submitError && <div role="alert" className="rounded-md border border-[#A8402F]/20 bg-[#A8402F]/5 px-4 py-3 text-sm leading-6 text-[#8C2F27]">{submitError}</div>}

              <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center rounded-md bg-[#17181B] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#2A2D33] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8402F] focus-visible:ring-offset-2">{isSubmitting ? "Signing in…" : "Sign in"}</button>
            </form>

            <p className="mt-8 text-center text-sm text-[#6F6A61]">Don't have an account?{" "}<Link href="/register" className="font-medium text-[#17181B] underline decoration-[#A8402F] decoration-2 underline-offset-4">Create one</Link></p>
          </div>

          <div className="border-t border-[#D8D3C8] pt-5 text-xs text-[#8A847A]">Your resume stays yours.</div>
        </section>
      </div>
    </main>
  );
}
