import type { Resume } from "@/types/resume";

async function getResumes(): Promise<Resume[]> {
  const response = await fetch("http://127.0.0.1:8000/resumes");

  if (!response.ok) {
    throw new Error(
      `Failed to fetch resumes: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export default async function ResumesPage() {
  const resumes = await getResumes();

  return (
    <main>
      <h1>My Resumes</h1>

      {resumes.map((resume) => (
        <div key={resume.id}>
          <h2>{resume.title}</h2>
          <p>{resume.filename}</p>
        </div>
      ))}
    </main>
  );
}