from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import asyncio
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random

router = APIRouter()

# In-memory progress tracking (use Redis in production)
email_progress = {}

class EmailAccount(BaseModel):
    email: EmailStr
    password: str

class SendEmailsRequest(BaseModel):
    lead_ids: List[int]
    subject: str
    body: str
    email_accounts: List[EmailAccount]
    delay_min: float = 0.5
    delay_max: float = 5.0

class EmailProgress(BaseModel):
    total: int
    sent: int
    failed: int
    status: str  # "sending", "completed", "stopped"

# SMTP Configuration
SMTP_CONFIG = {
    "gmail.com": {"host": "smtp.gmail.com", "port": 587},
    "outlook.com": {"host": "smtp-mail.outlook.com", "port": 587},
    "hotmail.com": {"host": "smtp-mail.outlook.com", "port": 587},
    "yahoo.com": {"host": "smtp.mail.yahoo.com", "port": 587},
}

def get_smtp_config(email: str):
    """Get SMTP config based on email domain"""
    domain = email.split('@')[1].lower()
    return SMTP_CONFIG.get(domain, {"host": "smtp.gmail.com", "port": 587})

async def send_single_email(
    to_email: str,
    from_email: str,
    password: str,
    subject: str,
    body: str
) -> dict:
    """Send a single email via SMTP"""
    try:
        smtp_config = get_smtp_config(from_email)

        # Create message
        message = MIMEMultipart()
        message['From'] = from_email
        message['To'] = to_email
        message['Subject'] = subject
        message.attach(MIMEText(body, 'plain'))

        # Send email
        with smtplib.SMTP(smtp_config['host'], smtp_config['port']) as server:
            server.starttls()
            server.login(from_email, password)
            server.send_message(message)

        return {"success": True, "email": to_email}

    except Exception as e:
        return {"success": False, "email": to_email, "error": str(e)}

async def send_emails_background(
    request_id: str,
    leads: List[dict],
    request: SendEmailsRequest,
    db
):
    """Background task to send emails with progress tracking"""

    total = len(leads)
    sent = 0
    failed = 0

    # Initialize progress
    email_progress[request_id] = {
        "total": total,
        "sent": 0,
        "failed": 0,
        "status": "sending"
    }

    # Rotate through email accounts
    account_index = 0

    for lead in leads:
        # Check if stopped
        if email_progress[request_id]["status"] == "stopped":
            break

        # Get current email account
        account = request.email_accounts[account_index % len(request.email_accounts)]

        # Send email
        result = await send_single_email(
            to_email=lead['email'],
            from_email=account.email,
            password=account.password,
            subject=request.subject,
            body=request.body
        )

        # Update progress
        if result['success']:
            sent += 1

            # Log to database
            try:
                # Save to email_logs table
                from app.models.scraped_email import EmailLog
                log = EmailLog(
                    lead_id=lead['id'],
                    email_to=lead['email'],
                    email_from=account.email,
                    subject=request.subject,
                    body=request.body,
                    category=lead.get('businessCategory'),
                    status='sent',
                    sent_at=datetime.utcnow()
                )
                db.add(log)
                db.commit()
            except Exception as e:
                print(f"Error logging email: {str(e)}")
        else:
            failed += 1

            # Log failure to database
            try:
                from app.models.scraped_email import EmailLog
                log = EmailLog(
                    lead_id=lead['id'],
                    email_to=lead['email'],
                    email_from=account.email,
                    subject=request.subject,
                    body=request.body,
                    category=lead.get('businessCategory'),
                    status='failed',
                    error_message=result.get('error', 'Unknown error')
                )
                db.add(log)
                db.commit()
            except Exception as e:
                print(f"Error logging failure: {str(e)}")

        email_progress[request_id]["sent"] = sent
        email_progress[request_id]["failed"] = failed

        # Random delay between emails
        delay = random.uniform(request.delay_min, request.delay_max)
        await asyncio.sleep(delay)

        # Rotate to next account
        account_index += 1

    # Mark as completed
    email_progress[request_id]["status"] = "completed"

@router.post("/send-emails")
async def send_emails(
    request: SendEmailsRequest,
    background_tasks: BackgroundTasks
):
    """
    Send emails to leads with progress tracking
    """
    # Generate request ID
    request_id = f"email_{datetime.utcnow().timestamp()}"

    # Mock leads data (in real app, fetch from database)
    leads = [
        {"id": lead_id, "email": f"lead{lead_id}@example.com", "businessCategory": "restaurant"}
        for lead_id in request.lead_ids
    ]

    # Filter leads with emails
    leads_with_emails = [lead for lead in leads if lead.get('email')]

    if not leads_with_emails:
        raise HTTPException(status_code=400, detail="No leads with email addresses found")

    # Start background task
    background_tasks.add_task(
        send_emails_background,
        request_id,
        leads_with_emails,
        request,
        None  # Pass DB session here
    )

    return {
        "success": True,
        "message": f"Sending emails to {len(leads_with_emails)} leads",
        "request_id": request_id,
        "total": len(leads_with_emails)
    }

@router.get("/email-progress/{request_id}")
async def get_email_progress(request_id: str):
    """
    Get email sending progress
    """
    if request_id not in email_progress:
        raise HTTPException(status_code=404, detail="Request not found")

    return email_progress[request_id]

@router.post("/stop-emails/{request_id}")
async def stop_emails(request_id: str):
    """
    Stop email sending
    """
    if request_id not in email_progress:
        raise HTTPException(status_code=404, detail="Request not found")

    email_progress[request_id]["status"] = "stopped"

    return {
        "success": True,
        "message": "Email sending stopped",
        "progress": email_progress[request_id]
    }

@router.post("/scrape-website")
async def scrape_website_endpoint(
    lead_id: int,
    website_url: str,
    business_category: str
):
    """
    Scrape emails from a website and save to database
    """
    from app.services.email_scraper import EmailScraper

    scraper = EmailScraper()
    scraped_emails = await scraper.scrape_website(website_url, business_category)

    if scraped_emails:
        # Save to database (mock implementation)
        return {
            "success": True,
            "lead_id": lead_id,
            "total_emails": len(scraped_emails),
            "emails": scraped_emails
        }

    return {
        "success": False,
        "message": "No emails found"
    }
