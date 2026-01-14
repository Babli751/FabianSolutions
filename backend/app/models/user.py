from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow)

    # Relationships
    campaigns = relationship("Campaign", back_populates="user")
    searches = relationship("SearchHistory", back_populates="user")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    search_id = Column(String, unique=True, index=True)
    query = Column(String, nullable=False)
    location = Column(String, nullable=False)
    max_results = Column(Integer, nullable=False)
    results_count = Column(Integer, default=0)
    status = Column(String, default="searching")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="searches")
    leads = relationship("Lead", back_populates="search")

class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    search_id = Column(Integer, ForeignKey("search_history.id"))
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    website = Column(String, nullable=True)
    address = Column(String, nullable=True)
    google_maps_url = Column(String, nullable=True)
    business_category = Column(String, nullable=True)
    status = Column(String, default="new")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    search = relationship("SearchHistory", back_populates="leads")
