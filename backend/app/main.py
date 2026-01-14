from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import email_routes, follow_up_routes, google_oauth_routes, campaign_routes, auth_routes
from app.database import engine, Base
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FabianTech Lead Generation API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Specify frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  # Expose all headers in responses
)

# Include routers
app.include_router(auth_routes.router, prefix="/api/auth", tags=["authentication"])
app.include_router(email_routes.router, prefix="/api", tags=["emails"])
app.include_router(follow_up_routes.router, prefix="/api", tags=["follow-ups"])
app.include_router(google_oauth_routes.router, prefix="/api", tags=["google-oauth"])
app.include_router(campaign_routes.router, prefix="/api", tags=["campaigns"])

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
