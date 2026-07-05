from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes import router as api_router
from app.api.v1.lms_module.department import router as department_router
from app.api.v1.cudo_module.bloom_level import bloom_level as bloom_level_routes
from app.api.v1.lms_module import config_type
from app.api.v1.lms_module import cross_department_mentor
from app.api.v1.lms_module import mentoring
from app.api.v1.lms_module import mentor_list
from app.api.v1.lms_module import mentoring_session

app = FastAPI()


origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ IMPORTANT: include routers ONCE only
app.include_router(api_router, prefix="/api/v1")
app.include_router(department_router, prefix="/api/v1/department", tags=["Department"])
app.include_router(bloom_level_routes.router, prefix="/api/v1/cudo_module", tags=["Bloom Level"])
app.include_router(config_type.router, prefix="/api/v1/config-type", tags=["Config"])
app.include_router(cross_department_mentor.router, prefix="/api/v1/cross-dept-mentor", tags=["LMS-Cross Department Mentor"])
app.include_router(mentoring.router, prefix="/api/v1/mentoring", tags=["LMS-Mentoring"])
app.include_router(mentor_list.router, prefix="/api/v1/mentoring", tags=["LMS-Mentoring"])
app.include_router(mentoring_session.router, prefix="/mentoring-session", tags=["LMS-Mentoring-Session"])
app.include_router(mentoring_session.router, prefix="/api/v1/mentoring-session", tags=["LMS-Mentoring-Session"])

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db

@app.get("/db-test")
def test_database_connection(db: Session = Depends(get_db)):
    try:
        # Run a simple query to see if MySQL responds
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "Connected successfully to XAMPP MySQL!"}
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Database connection failed! Error: {str(e)}"
        )
@app.get("/")
def read_root():
    return {"message": "Welcome to IonCudos API"}

