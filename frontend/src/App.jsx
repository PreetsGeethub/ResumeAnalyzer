import { useEffect, useState } from "react";
import { api } from "./api";

function Logo() {
  return (
    <div className="brand">
      <div className="brand-mark">R</div>
      <span>ResumeLens</span>
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", age: 23, password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "register") {
        await api.register(form.name, form.email, form.age, form.password);
      }
      await api.login(form.email, form.password);
      const user = await api.me();
      onAuth(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-copy">
        <Logo />
        <div className="eyebrow">AI-POWERED RESUME REVIEW</div>
        <h1>Turn your resume into a <span>clearer career story.</span></h1>
        <p>Upload your resume, get an AI breakdown of your strengths and gaps, or compare it directly against a job description.</p>
        <div className="feature-row">
          <span>✓ Structured extraction</span>
          <span>✓ Job matching</span>
          <span>✓ Actionable feedback</span>
        </div>
      </section>

      <section className="auth-card card">
        <div className="tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Sign in</button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Create account</button>
        </div>
        <div className="card-heading">
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p>{mode === "login" ? "Continue where you left off." : "Your resume analyses will be saved to your account."}</p>
        </div>
        <form onSubmit={submit} className="form">
          {mode === "register" && (
            <>
              <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label>
              <label>Age<input required type="number" min="18" max="100" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></label>
            </>
          )}
          <label>Email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
          <label>Password<input required type="password" minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></label>
          {error && <div className="error">{error}</div>}
          <button className="primary full" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
        </form>
      </section>
    </main>
  );
}

function Score({ value }) {
  const score = Number(value || 0);
  return (
    <div className="score">
      <div className="score-ring" style={{ "--score": `${score * 3.6}deg` }}>
        <strong>{score}</strong><span>/100</span>
      </div>
      <div><small>OVERALL SCORE</small><h3>{score >= 80 ? "Strong profile" : score >= 60 ? "Good foundation" : "Needs work"}</h3></div>
    </div>
  );
}

function List({ title, items, tone = "" }) {
  return (
    <div className={`insight-card ${tone}`}>
      <div className="section-label">{title}</div>
      {items?.length ? <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul> : <p className="muted">No items returned.</p>}
    </div>
  );
}

function ResumeDetails({ resume, onBack, onAnalyze }) {
  const [analysisType, setAnalysisType] = useState("general");
  const [jobDescription, setJobDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      const result = await api.analyzeResume(resume.id, analysisType, jobDescription);
      onAnalyze(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page">
      <button className="back" onClick={onBack}>← Back to dashboard</button>
      <div className="page-head">
        <div><div className="eyebrow">RESUME ANALYSIS</div><h1>{resume.title}</h1><p>{resume.filename}</p></div>
        <a className="button secondary" href={api.downloadUrl(resume.id)} target="_blank" rel="noreferrer">Download resume</a>
      </div>

      <section className="analysis-choice card">
        <div>
          <div className="section-label">CHOOSE ANALYSIS</div>
          <h2>What do you want to learn?</h2>
          <p className="muted">Run a general review or see how well this resume matches a specific role.</p>
        </div>
        <div className="choice-grid">
          <button className={analysisType === "general" ? "choice active" : "choice"} onClick={() => setAnalysisType("general")}>
            <span className="choice-icon">✦</span><strong>General review</strong><small>Skills, experience, strengths, weaknesses and recommendations.</small>
          </button>
          <button className={analysisType === "job_match" ? "choice active" : "choice"} onClick={() => setAnalysisType("job_match")}>
            <span className="choice-icon">↗</span><strong>Match a job</strong><small>Compare your resume against a specific job description.</small>
          </button>
        </div>
        {analysisType === "job_match" && <textarea className="job-box" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description here…" maxLength={20000} />}
        {error && <div className="error">{error}</div>}
        <button className="primary" disabled={busy || (analysisType === "job_match" && !jobDescription.trim())} onClick={submit}>{busy ? "Analyzing with AI…" : "Analyze resume →"}</button>
      </section>
    </div>
  );
}

function AnalysisView({ result, onBack }) {
  const extracted = result.extracted || {};
  const analysis = result.analysis || {};
  return (
    <div className="page">
      <button className="back" onClick={onBack}>← Back to dashboard</button>
      <div className="page-head">
        <div><div className="eyebrow">{result.analysis_type === "job_match" ? "JOB MATCH" : "GENERAL REVIEW"}</div><h1>Analysis results</h1><p>Generated from your uploaded resume.</p></div>
      </div>

      <section className="result-hero card">
        <Score value={result.overall_score} />
        <div className="result-note"><strong>{result.analysis_type === "job_match" ? "Role-specific feedback" : "Resume health check"}</strong><p>{result.analysis_type === "job_match" ? "Your score reflects the overlap between the resume and the supplied job description." : "Use these insights to decide what to improve before your next application."}</p></div>
      </section>

      <div className="two-col">
        <List title="Strengths" items={analysis.strengths} tone="positive" />
        <List title="Weaknesses" items={analysis.weaknesses} tone="negative" />
      </div>

      <div className="two-col">
        <List title="Matched skills" items={analysis.matched_skills} tone="positive" />
        <List title="Missing skills" items={analysis.missing_skills} tone="negative" />
      </div>

      <section className="card extracted">
        <div className="section-label">EXTRACTED PROFILE</div>
        <h2>{extracted.summary || "Resume summary"}</h2>
        <div className="tag-list">{extracted.skills?.map((skill) => <span key={skill}>{skill}</span>)}</div>
        <div className="profile-grid">
          <ProfileBlock title="Experience" items={extracted.experience} fields={["role", "company", "duration", "description"]} />
          <ProfileBlock title="Education" items={extracted.education} fields={["degree", "institution", "duration", "details"]} />
          <ProfileBlock title="Projects" items={extracted.projects} fields={["name", "technologies", "description"]} />
        </div>
      </section>

      <section className="card">
        <div className="section-label">NEXT STEPS</div>
        <h2>Recommendations</h2>
        <List title="Recommended roles" items={analysis.recommended_roles} />
        <List title="Action items" items={analysis.recommendations} />
      </section>
    </div>
  );
}

function ProfileBlock({ title, items = [], fields }) {
  return (
    <div className="profile-block">
      <h3>{title}</h3>
      {items.length ? items.map((item, i) => (
        <article key={i}>
          <strong>{item[fields[0]] || "Untitled"}</strong>
          {fields.slice(1).map((field) => {
            const value = item[field];
            if (!value?.length) return null;
            return Array.isArray(value)
              ? <p key={field}>{value.join(" • ")}</p>
              : <p key={field}>{value}</p>;
          })}
        </article>
      )) : <p className="muted">Nothing extracted.</p>}
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [resumes, setResumes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await api.resumes();
      setResumes(data.items || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, []);

  const upload = async (event) => {
    event.preventDefault();
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const resume = await api.uploadResume(title || file.name.replace(/\.[^.]+$/, ""), file);
      setTitle("");
      setFile(null);
      setShowUpload(false);
      setSelected(resume);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteResume = async (id) => {
    if (!window.confirm("Delete this resume and its analyses?")) return;
    try {
      await api.deleteResume(id);
      if (selected?.id === id) setSelected(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (analysis) return <AnalysisView result={analysis} onBack={() => setAnalysis(null)} />;
  if (selected) return <ResumeDetails resume={selected} onBack={() => setSelected(null)} onAnalyze={setAnalysis} />;

  return (
    <>
      <header className="topbar">
        <Logo />
        <div className="user-menu"><span>{user.name}</span><button onClick={onLogout}>Log out</button></div>
      </header>
      <main className="dashboard">
        <div className="page-head dashboard-head">
          <div><div className="eyebrow">YOUR WORKSPACE</div><h1>Resume dashboard</h1><p>Analyze, compare and improve every version of your resume.</p></div>
          <button className="primary" onClick={() => setShowUpload(true)}>+ Upload resume</button>
        </div>

        {error && <div className="error">{error}</div>}

        {showUpload && (
          <section className="upload-card card">
            <div className="upload-icon">↑</div>
            <div><h2>Upload a resume</h2><p className="muted">PDF or DOCX · max 5 MB</p></div>
            <form onSubmit={upload} className="upload-form">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resume title (e.g. AI Engineer)" />
              <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
              <div className="actions"><button type="button" className="button secondary" onClick={() => setShowUpload(false)}>Cancel</button><button className="primary" disabled={busy}>{busy ? "Uploading…" : "Upload & continue"}</button></div>
            </form>
          </section>
        )}

        <section className="stats">
          <div className="stat card"><small>RESUMES</small><strong>{resumes.length}</strong><span>Uploaded versions</span></div>
          <div className="stat card"><small>ANALYSES</small><strong>AI</strong><span>Structured feedback</span></div>
          <div className="stat card"><small>SUPPORTED</small><strong>2</strong><span>PDF + DOCX</span></div>
        </section>

        <section className="resume-list">
          <div className="section-head"><h2>Your resumes</h2><span>{resumes.length} total</span></div>
          {!resumes.length ? (
            <div className="empty card"><div className="empty-icon">✦</div><h2>Your first analysis starts here.</h2><p>Upload a resume and let the AI extract your profile, identify gaps and suggest next steps.</p><button className="primary" onClick={() => setShowUpload(true)}>Upload your resume</button></div>
          ) : resumes.map((resume) => (
            <article className="resume-row card" key={resume.id}>
              <div className="file-icon">{resume.filename.toLowerCase().endsWith(".pdf") ? "PDF" : "DOC"}</div>
              <div className="resume-info"><h3>{resume.title}</h3><p>{resume.filename} · {new Date(resume.created_at).toLocaleDateString()}</p></div>
              <div className="row-actions"><button className="button secondary" onClick={() => setSelected(resume)}>Analyze</button><button className="icon-button" title="Delete" onClick={() => deleteResume(resume.id)}>×</button></div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api.me().then(setUser).catch(() => {}).finally(() => setChecking(false));
  }, []);

  const logout = async () => {
    await api.logout().catch(() => {});
    setUser(null);
  };

  if (checking) return <div className="loading"><Logo /><span>Loading workspace…</span></div>;
  return user ? <Dashboard user={user} onLogout={logout} /> : <AuthScreen onAuth={setUser} />;
}
