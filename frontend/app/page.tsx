import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f4f1ea] text-[#171717]">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link
          href="/"
          className="text-xl font-semibold tracking-[-0.04em]"
        >
          resume<span className="text-[#e4572e]">.</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm md:flex">
          <a href="#how-it-works" className="transition-opacity hover:opacity-60">
            How it works
          </a>

          <a href="#features" className="transition-opacity hover:opacity-60">
            Features
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden px-4 py-2 text-sm font-medium sm:block"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="rounded-full bg-[#171717] px-5 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:pb-32 lg:pt-24">
        <div className="flex flex-col justify-center">
          <div className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#6f6a61]">
            <span className="h-2 w-2 rounded-full bg-[#e4572e]" />
            Resume intelligence
          </div>

          <h1 className="max-w-4xl text-[clamp(3.5rem,7vw,7rem)] font-semibold leading-[0.88] tracking-[-0.07em]">
            Your resume
            <br />
            should work
            <br />
            <span className="text-[#e4572e]">harder.</span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-[#625d55]">
            Upload your resume, understand how strong it really is,
            and see which roles you're positioned for — before you send
            another application.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="rounded-full bg-[#e4572e] px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Analyze my resume
            </Link>

            <Link
              href="#how-it-works"
              className="rounded-full border border-[#c9c3b9] px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-white"
            >
              See how it works
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-8 border-t border-[#d8d3ca] pt-6 text-xs uppercase tracking-[0.12em] text-[#817b72]">
            <span>ATS score</span>
            <span>Role matching</span>
            <span>Resume insights</span>
          </div>
        </div>

        {/* Resume visual */}
        <div className="relative flex min-h-[500px] items-center justify-center">
          <div className="absolute right-[5%] top-[7%] h-24 w-24 rounded-full border border-[#d2ccc1]" />

          <div className="absolute bottom-[8%] left-[3%] text-[10px] uppercase tracking-[0.2em] text-[#817b72] [writing-mode:vertical-rl]">
            Make the next application count
          </div>

          <div className="relative w-full max-w-md rotate-[2deg] bg-white p-8 shadow-[20px_25px_60px_rgba(40,35,25,0.12)]">
            <div className="flex items-start justify-between border-b border-[#dedbd4] pb-6">
              <div>
                <div className="h-3 w-32 bg-[#171717]" />
                <div className="mt-3 h-2 w-20 bg-[#d4d0c8]" />
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#e4572e] text-lg font-bold">
                88
              </div>
            </div>

            <div className="mt-7 space-y-6">
              <ResumeLine width="w-4/5" />
              <ResumeLine width="w-full" />
              <ResumeLine width="w-3/4" />

              <div className="pt-3">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e4572e]">
                  Strong signals
                </div>

                <div className="flex flex-wrap gap-2">
                  {["React", "TypeScript", "Node.js", "PostgreSQL"].map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-[#f1eee8] px-3 py-1.5 text-xs"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>

              <ResumeLine width="w-11/12" />
              <ResumeLine width="w-2/3" />
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-[#dedbd4] pt-5">
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#817b72]">
                Recommended
              </span>

              <span className="text-sm font-semibold">
                Full Stack Developer →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-y border-[#d8d3ca] bg-[#ebe7de]"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e4572e]">
                The process
              </p>

              <h2 className="mt-5 max-w-sm text-4xl font-semibold leading-tight tracking-[-0.05em]">
                From document to direction.
              </h2>
            </div>

            <div className="divide-y divide-[#d0cbc1] border-y border-[#d0cbc1]">
              <Step
                number="01"
                title="Upload"
                description="Drop in your existing resume. PDF and DOCX are supported."
              />

              <Step
                number="02"
                title="Understand"
                description="Get an ATS score, strengths, weaknesses, and a structured view of your resume."
              />

              <Step
                number="03"
                title="Position"
                description="Discover the roles your current experience actually supports."
              />

              <Step
                number="04"
                title="Match"
                description="Compare your resume against a specific job description when you're ready to apply."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32"
      >
        <div className="mb-16 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e4572e]">
            Built around the job search
          </p>

          <h2 className="mt-5 text-5xl font-semibold tracking-[-0.06em]">
            Less guessing.
            <br />
            Better applications.
          </h2>
        </div>

        <div className="grid gap-px overflow-hidden border border-[#d8d3ca] bg-[#d8d3ca] md:grid-cols-3">
          <Feature
            number="01"
            title="ATS analysis"
            description="A score that evaluates how well your resume communicates its value to automated screening systems."
          />

          <Feature
            number="02"
            title="Role discovery"
            description="See the positions your current skills, projects, education, and experience naturally support."
          />

          <Feature
            number="03"
            title="Job matching"
            description="Paste a job description and understand where your resume aligns — and where it doesn't."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-6 mb-6 overflow-hidden rounded-[2rem] bg-[#171717] text-white lg:mx-10">
        <div className="mx-auto max-w-7xl px-8 py-20 lg:px-16 lg:py-28">
          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
            <h2 className="max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] md:text-7xl">
              Know what your resume says before a recruiter does.
            </h2>

            <Link
              href="/register"
              className="shrink-0 rounded-full bg-[#e4572e] px-7 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
            >
              Start analyzing →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ResumeLine({ width }: { width: string }) {
  return <div className={`h-2 ${width} bg-[#dedbd4]`} />;
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="grid gap-4 py-7 sm:grid-cols-[70px_180px_1fr] sm:items-start">
      <span className="text-xs font-semibold text-[#e4572e]">{number}</span>

      <h3 className="text-xl font-semibold tracking-[-0.03em]">{title}</h3>

      <p className="max-w-lg text-sm leading-6 text-[#625d55]">
        {description}
      </p>
    </div>
  );
}

function Feature({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article className="bg-[#f4f1ea] p-8 lg:p-10">
      <span className="text-xs font-semibold text-[#e4572e]">{number}</span>

      <h3 className="mt-20 text-2xl font-semibold tracking-[-0.04em]">
        {title}
      </h3>

      <p className="mt-4 text-sm leading-6 text-[#625d55]">
        {description}
      </p>
    </article>
  );
}