"use client";

import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import { FormEvent, useMemo, useState } from "react";
import { registerUser } from "@/lib/api";

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

type Touched = { name: boolean; email: boolean; password: boolean; terms: boolean };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordStrength(password: string) {
  if (!password) return { score: 0, label: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Too short", color: "#B3271E" },
    { label: "Weak", color: "#B3271E" },
    { label: "Okay", color: "#B98A2A" },
    { label: "Good", color: "#3F7A4E" },
    { label: "Strong", color: "#2E6B41" },
  ];
  return { score, ...levels[Math.min(score, levels.length - 1)] };
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [touched, setTouched] = useState<Touched>({
    name: false,
    email: false,
    password: false,
    terms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const errors = {
    name: name.trim().length === 0 ? "Enter your name." : "",
    email: !EMAIL_PATTERN.test(email) ? "Enter a valid email address." : "",
    password:
      password.length < 8 ? "Use at least 8 characters." : "",
    terms: !agreedToTerms ? "You need to accept the terms to continue." : "",
  };

  const isFormValid =
    !errors.name && !errors.email && !errors.password && !errors.terms;

  const strength = useMemo(() => passwordStrength(password), [password]);

  function markTouched(field: keyof Touched) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ name: true, email: true, password: true, terms: true });
    setSubmitError("");

    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        age: 18,
      });

      window.location.href = "/login?registered=1";
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong on our end. Try again in a moment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      className={`${fraunces.variable} ${inter.variable} min-h-screen bg-[#FBFAF6] text-[#17181B] font-[family-name:var(--font-inter)]`}
    >
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* ───────────────── LEFT: editorial panel ───────────────── */}

        <section
          className="relative hidden overflow-hidden bg-[#14161A] px-12 py-10 text-[#FBFAF6] lg:flex lg:flex-col"
          style={{
            backgroundImage:
              "radial-gradient(rgba(251,250,246,0.05) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        >
          <Link
            href="/"
            className="relative z-10 w-fit font-[family-name:var(--font-fraunces)] text-xl tracking-[-0.02em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C15A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#14161A] rounded-sm"
          >
            ResumeAI
          </Link>

          <div className="relative z-10 my-auto max-w-lg">
            <h1 className="font-[family-name:var(--font-fraunces)] text-[clamp(2.6rem,4vw,3.6rem)] font-medium leading-[1.08] tracking-[-0.02em]">
              Your resume, marked up like an editor would.
            </h1>

            <p className="mt-6 max-w-md text-[15px] leading-7 text-[#B7B3A8]">
              ResumeAI reads it the way an ATS and a hiring manager both do,
              then shows you exactly what to tighten, cut, or explain
              better — before you hit send.
            </p>
          </div>

          {/* Annotated resume mockup */}
          <div className="relative z-10 ml-auto mt-8 w-[300px]">
            <div className="relative -rotate-[2deg] overflow-hidden rounded-sm bg-[#FBFAF6] px-7 py-6 text-[#17181B] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.55)]">
              {/* corner fold */}
              <div className="absolute right-0 top-0 h-6 w-6 bg-[#E4E0D4]" />
              <div
                className="absolute right-0 top-0 h-6 w-6 bg-[#14161A]/10"
                style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
              />

              {/* header */}
              <p className="font-[family-name:var(--font-fraunces)] text-[17px] font-medium leading-none">
                Jordan Blake
              </p>
              <p className="mt-1.5 text-[11px] leading-none text-[#6F6A61]">
                Senior Product Designer
              </p>
              <p className="mt-1 text-[9.5px] leading-none text-[#A8A398]">
                jordan@blake.com · San Francisco, CA
              </p>

              <div className="mt-4 h-px w-full bg-[#DAD5C8]" />

              {/* experience */}
              <p className="mt-4 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#8A847A]">
                Experience
              </p>
              <p className="mt-2.5 text-[10.5px] font-semibold leading-tight">
                Product Lead, Northwind
                <span className="font-normal text-[#8A847A]"> · 2022–Now</span>
              </p>

              <p className="relative z-10 mt-1.5 text-[10px] leading-[1.5] text-[#4A4D52]">
                Led a redesign of the onboarding flow, cutting first-week
                drop-off by 18%.
              </p>

              <div className="mt-1.5 h-1.5 w-[65%] rounded-full bg-[#E4E0D4]" />

              {/* hand-drawn circle annotation over the metric line */}
              <svg
                viewBox="0 0 300 44"
                className="pointer-events-none absolute left-0 top-[121px] h-[44px] w-full"
                aria-hidden="true"
              >
                <path
                  d="M 20 22 C 18 8, 90 2, 170 4 C 240 6, 272 8, 278 20 C 284 32, 240 38, 160 38 C 90 38, 24 36, 20 22 Z"
                  fill="none"
                  stroke="#A8402F"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              {/* margin note */}
              <div className="absolute -right-6 top-[108px] rotate-[4deg] rounded-sm border border-[#A8402F]/40 bg-[#FBFAF6] px-2.5 py-1 text-[10px] italic leading-tight text-[#A8402F] shadow-md font-[family-name:var(--font-fraunces)]">
                Quantify every line
                <br />
                like this one
              </div>

              {/* skills */}
              <p className="mt-5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#8A847A]">
                Skills
              </p>
              <div className="relative mt-2.5 flex flex-wrap gap-1.5">
                <span className="rounded-full border border-[#DAD5C8] px-2 py-[3px] text-[9.5px] text-[#4A4D52]">
                  Figma
                </span>
                <span className="rounded-full border border-[#DAD5C8] px-2 py-[3px] text-[9.5px] text-[#4A4D52]">
                  User research
                </span>
                <span className="relative rounded-full border border-[#DAD5C8] px-2 py-[3px] text-[9.5px] text-[#4A4D52]">
                  Prototyping
                </span>
                <span className="rounded-full border border-[#DAD5C8] px-2 py-[3px] text-[9.5px] text-[#4A4D52]">
                  SQL
                </span>
              </div>

              {/* wavy underline beneath "User research" */}
              <svg
                viewBox="0 0 60 10"
                className="pointer-events-none absolute left-[65px] top-[219px] h-[10px] w-[60px]"
                aria-hidden="true"
              >
                <path
                  d="M 0 5 Q 5 0, 10 5 T 20 5 T 30 5 T 40 5 T 50 5"
                  fill="none"
                  stroke="#A8402F"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* stamp */}
            <div className="absolute -right-5 -top-6 flex h-16 w-16 -rotate-[10deg] flex-col items-center justify-center rounded-full border-2 border-[#A8402F] bg-[#14161A] text-[#A8402F]">
              <span className="font-[family-name:var(--font-fraunces)] text-xl font-medium leading-none">
                92
              </span>
              <span className="mt-0.5 text-[7px] uppercase tracking-[0.14em] text-[#A8402F]/80">
                ATS score
              </span>
            </div>
          </div>

          <div className="relative z-10 mt-10 border-t border-white/10 pt-5 text-[12px] text-[#8B8880]">
            Built for people who are tired of guessing why the callback
            never came.
          </div>
        </section>

        {/* ───────────────── RIGHT: form ───────────────── */}

        <section className="flex min-h-screen flex-col px-6 py-7 sm:px-10 lg:px-16">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="font-[family-name:var(--font-fraunces)] text-xl tracking-[-0.02em] lg:hidden"
            >
              ResumeAI
            </Link>

            <div className="ml-auto text-sm text-[#6F6A61]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-[#17181B] underline decoration-[#A8402F] decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8402F] focus-visible:ring-offset-2 rounded-sm"
              >
                Log in
              </Link>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
            <div>
              <h2 className="font-[family-name:var(--font-fraunces)] text-4xl font-medium leading-[1.1] tracking-[-0.02em]">
                Set up your account
              </h2>
              <p className="mt-4 max-w-sm text-[15px] leading-6 text-[#6F6A61]">
                Takes under a minute. You can upload your resume right after.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-[#4A4D52]"
                >
                  Your name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => markTouched("name")}
                  placeholder="Alex Morgan"
                  autoComplete="name"
                  aria-invalid={touched.name && !!errors.name}
                  aria-describedby={
                    touched.name && errors.name ? "name-error" : undefined
                  }
                  className="w-full rounded-md border border-[#D8D3C8] bg-white px-4 py-3 text-base outline-none transition-colors motion-reduce:transition-none placeholder:text-[#AAA49A] focus:border-[#A8402F] focus-visible:ring-2 focus-visible:ring-[#A8402F]/30"
                />
                {touched.name && errors.name && (
                  <p id="name-error" className="mt-1.5 text-sm text-[#A8402F]">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#4A4D52]"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => markTouched("email")}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={touched.email && !!errors.email}
                  aria-describedby={
                    touched.email && errors.email ? "email-error" : undefined
                  }
                  className="w-full rounded-md border border-[#D8D3C8] bg-white px-4 py-3 text-base outline-none transition-colors motion-reduce:transition-none placeholder:text-[#AAA49A] focus:border-[#A8402F] focus-visible:ring-2 focus-visible:ring-[#A8402F]/30"
                />
                {touched.email && errors.email && (
                  <p id="email-error" className="mt-1.5 text-sm text-[#A8402F]">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[#4A4D52]"
                  >
                    Password
                  </label>
                  <span className="text-xs text-[#AAA49A]">8+ characters</span>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => markTouched("password")}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    aria-invalid={touched.password && !!errors.password}
                    aria-describedby="password-strength"
                    className="w-full rounded-md border border-[#D8D3C8] bg-white px-4 py-3 pr-11 text-base tracking-[0.1em] outline-none transition-colors motion-reduce:transition-none placeholder:text-[#AAA49A] focus:border-[#A8402F] focus-visible:ring-2 focus-visible:ring-[#A8402F]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-1 text-[#8A847A] hover:text-[#17181B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8402F]/30"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.8 21.8 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a21.8 21.8 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                <div id="password-strength" className="mt-2">
                  {password.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-1 flex-1 gap-1 overflow-hidden rounded-full bg-[#E4E0D4]">
                        {[0, 1, 2, 3].map((i) => (
                          <span
                            key={i}
                            className="h-full flex-1 rounded-full transition-colors motion-reduce:transition-none"
                            style={{
                              backgroundColor:
                                i < strength.score ? strength.color : "transparent",
                            }}
                          />
                        ))}
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{ color: strength.color }}
                      >
                        {strength.label}
                      </span>
                    </div>
                  ) : null}
                  {touched.password && errors.password && (
                    <p className="mt-1.5 text-sm text-[#A8402F]">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div>
                <label className="flex cursor-pointer items-start gap-3 text-sm text-[#4A4D52]">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    onBlur={() => markTouched("terms")}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#D8D3C8] text-[#A8402F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8402F]/30"
                  />
                  <span>
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="font-medium text-[#17181B] underline decoration-[#A8402F] decoration-2 underline-offset-2"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="font-medium text-[#17181B] underline decoration-[#A8402F] decoration-2 underline-offset-2"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {touched.terms && errors.terms && (
                  <p className="mt-1.5 text-sm text-[#A8402F]">{errors.terms}</p>
                )}
              </div>

              {submitError && (
                <p role="alert" className="text-sm text-[#A8402F]">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-md bg-[#17181B] px-6 py-3.5 text-sm font-semibold text-white transition-colors motion-reduce:transition-none hover:bg-[#2A2D33] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A8402F] focus-visible:ring-offset-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin motion-reduce:animate-none"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 0 1 8-8V0C5.37 0 0 5.37 0 12h4z"
                      />
                    </svg>
                    Creating account…
                  </span>
                ) : (
                  "Create account"
                )}
              </button>
            </form>
          </div>

          <div className="border-t border-[#D8D3C8] pt-5 text-xs text-[#8A847A]">
            Your career deserves better than guesswork.
          </div>
        </section>
      </div>
    </main>
  );
}