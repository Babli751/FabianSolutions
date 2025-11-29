from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import email_routes, follow_up_routes
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="FabianTech Lead Generation API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(email_routes.router, prefix="/api", tags=["emails"])
app.include_router(follow_up_routes.router, prefix="/api", tags=["follow-ups"])

@app.get("/")
async def root():
    return {
        "message": "FabianTech Lead Generation API v2.0",
        "version": "2.0.0",
        "status": "online",
        "features": ["email_scraping", "progress_tracking", "smtp_sending"]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
