from fastapi import FastAPI

from routers.users import router
from routers.resumes import router as resume_router



from db.database import engine

app = FastAPI()

app.include_router(router)
app.include_router(resume_router)