import os
import asyncio

from dotenv import load_dotenv
from google import genai

from schemas.resume_analysis import ResumeAIOutput


load_dotenv()


client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


async def ask_gemini(prompt):
    max_retries = 3
    timeout = 60

    for attempt in range(max_retries):
        try:
            response = await asyncio.wait_for(
                client.aio.interactions.create(
                    model="gemini-3.6-flash",
                    input=prompt,
                    config={
                        "response_mime_type": "application/json",
                        "response_schema": ResumeAIOutput,
                    }
                ),
                timeout=timeout
            )

            return response.output_text

        except asyncio.TimeoutError:
            print("Gemini request timed out")
            return None

        except Exception as e:

            if getattr(e, "code", None) == 429:
                print("Rate limited!")

                if attempt == max_retries - 1:
                    return None

                await asyncio.sleep(2 ** attempt)

            else:
                print("Something else went wrong:", e)
                return None


def analyze_resume_text(
    resume_text: str,
    analysis_type: str,
    job_description: str | None = None
) -> ResumeAIOutput:

    if analysis_type == "general":

        prompt = f"""
You are a professional resume analyzer and ATS evaluator.

Analyze the following resume.

This is a GENERAL resume analysis.

The overall_score must be an ATS score from 0 to 100.

Evaluate the resume based on:

- ATS-friendly content
- Relevant keywords
- Skills
- Work experience
- Projects
- Education
- Clarity
- Completeness
- Strength of resume content

Extract the following information from the resume:

- Summary
- Skills
- Experience
- Education
- Projects

Then provide:

- Strengths
- Weaknesses
- Recommended roles
- Recommendations

For general analysis, recommend suitable job roles based on
the candidate's skills, experience, projects, and education.

Only recommend roles that are reasonably supported by the resume.

Resume:

{resume_text}
"""

    elif analysis_type == "job_match":

        prompt = f"""
You are a professional resume analyzer and job-match evaluator.

Analyze the following resume against the provided job description.

This is a JOB MATCH analysis.

The overall_score must be a job-match score from 0 to 100.

Compare the resume with the job description and evaluate:

- Skills
- Technical requirements
- Experience
- Projects
- Education
- Relevant keywords
- Overall suitability for the role

Extract the following information from the resume:

- Summary
- Skills
- Experience
- Education
- Projects

Then provide:

- Strengths
- Weaknesses
- Matched skills
- Missing skills
- Recommendations

Resume:

{resume_text}

Job Description:

{job_description}
"""

    else:

        raise ValueError(
            "Invalid analysis type. "
            "Expected 'general' or 'job_match'."
        )

    response = asyncio.run(ask_gemini(prompt))

    if response is None:
        raise RuntimeError(
            "Gemini analysis failed. Please try again."
        )

    return ResumeAIOutput.model_validate_json(response)