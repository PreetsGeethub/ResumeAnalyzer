const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
  });

  if (response.ok) {
    if (response.status === 204) return null;
    return response.json();
  }

  let detail = "Something went wrong.";
  try {
    const body = await response.json();
    if (Array.isArray(body.detail)) {
      detail = body.detail.map((item) => item.msg).join(", ");
    } else if (body.detail) {
      detail = body.detail;
    }
  } catch {
    // Keep the generic message when the response is not JSON.
  }

  const error = new Error(detail);
  error.status = response.status;
  throw error;
}

export const api = {
  async me() {
    return request("/test-auth");
  },

  async login(email, password) {
    return request("/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  },

  async register(name, email, age, password) {
    return request("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, age: Number(age), password }),
    });
  },

  async logout() {
    return request("/users/logout", { method: "POST" });
  },

  async resumes(page = 1) {
    return request(`/resumes?page=${page}&limit=20`);
  },

  async uploadResume(title, file) {
    const form = new FormData();
    form.append("title", title);
    form.append("file", file);
    return request("/resumes", { method: "POST", body: form });
  },

  async analyzeResume(resumeId, analysisType, jobDescription) {
    return request(`/resumes/${resumeId}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analysis_type: analysisType,
        ...(analysisType === "job_match" ? { job_description: jobDescription } : {}),
      }),
    });
  },

  async analyses(resumeId) {
    return request(`/resumes/${resumeId}/analyses`);
  },

  async analysis(analysisId) {
    return request(`/analyses/${analysisId}`);
  },

  async deleteResume(resumeId) {
    return request(`/resumes/${resumeId}`, { method: "DELETE" });
  },

  downloadUrl(resumeId) {
    return `${API_URL}/resumes/${resumeId}/download`;
  },
};
