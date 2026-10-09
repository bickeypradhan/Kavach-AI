from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import health, detect, gate
from app.config import settings

app = FastAPI(
    title="Factory Safety AI Service",
    description="Real-time Computer Vision service for Industrial Safety: PPE compliance, smoke and fire detection",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(detect.router, tags=["Detection"])
app.include_router(gate.router, tags=["Gate"])

@app.get("/")
async def root():
    return {
        "service": "AI Factory Safety Vision Service",
        "status": "online",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
