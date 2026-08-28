from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
import models
from routers import assistant, standard_finder, compliance, roadmap, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BIS-Sahayak API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(assistant.router)
app.include_router(standard_finder.router)
app.include_router(compliance.router)
app.include_router(roadmap.router)


@app.get("/")
def home():
    return {"message": "BIS-Sahayak API is running"}
