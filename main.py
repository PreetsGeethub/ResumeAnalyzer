from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.users import router
from routers.resumes import router as resume_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(resume_router)
