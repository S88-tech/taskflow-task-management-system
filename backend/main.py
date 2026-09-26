from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes.auth import router as auth_router
from routes.tasks import router as tasks_router
from routes.users import router as users_router
from routes.profile import router as profile_router
from routes.social_auth import router as social_auth_router


app = FastAPI(
    title="TaskFlow API",
    description="Backend API for TaskFlow",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://taskflow-task-management-system.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)


app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(users_router)
app.include_router(profile_router)
app.include_router(social_auth_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to TaskFlow API"
    }