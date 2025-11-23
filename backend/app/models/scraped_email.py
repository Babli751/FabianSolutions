from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()

class ScrapedEmail(Base):
    __tablename__ = "scraped_emails"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    source = Column(String(255), nullable=False)  # "contact page", "footer", "about page"
    category = Column(String(100), nullable=False, index=True)  # Business category
    scraped_at = Column(DateTime, default=func.now(), nullable=False)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index('idx_lead_email', 'lead_id', 'email', unique=True),
        Index('idx_category', 'category'),
    )

class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False, index=True)
    email_to = Column(String(255), nullable=False)
    email_from = Column(String(255), nullable=False)
    subject = Column(String(500), nullable=False)
    body = Column(String(5000), nullable=False)
    category = Column(String(100), nullable=True, index=True)
    status = Column(String(50), default="pending")  # pending, sent, failed
    error_message = Column(String(1000), nullable=True)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    __table_args__ = (
        Index('idx_status', 'status'),
        Index('idx_category', 'category'),
        Index('idx_sent_at', 'sent_at'),
    )
