from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
import asyncio
import random

from app.database import get_db
from app.models import Campaign as CampaignModel, EmailSent as EmailSentModel, User
from app.api.auth_routes import get_current_user

router = APIRouter()

# In-memory progress tracking (can't be in DB because it's real-time)
campaign_progress = {}  # Track campaign sending progress

class Campaign(BaseModel):
    name: str
    subject: str
    body: str
    sender_email: EmailStr
    max_emails_per_hour: int
    lead_ids: Optional[List[int]] = []  # Optional list of lead IDs to send to

class CampaignResponse(BaseModel):
    id: int
    name: str
    subject: str
    body: str
    sender_email: str
    status: str
    max_emails_per_hour: int
    created_at: str

class LeadEmail(BaseModel):
    id: int
    email: str
    name: str

class StartCampaignRequest(BaseModel):
    campaign_id: int
    leads: List[LeadEmail]  # List of leads with their emails

class StopCampaignRequest(BaseModel):
    campaign_id: int

@router.get("/campaigns")
async def get_campaigns(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all campaigns for current user
    """
    campaigns = db.query(CampaignModel).filter(
        CampaignModel.user_id == current_user.id
    ).order_by(CampaignModel.created_at.desc()).all()

    return {
        "success": True,
        "campaigns": [
            {
                "id": c.id,
                "name": c.name,
                "subject": c.subject,
                "body": c.body,
                "sender_email": c.sender_email,
                "status": c.status,
                "max_emails_per_hour": c.max_emails_per_hour,
                "created_at": c.created_at.isoformat()
            }
            for c in campaigns
        ]
    }

@router.post("/campaigns")
async def create_campaign(
    campaign: Campaign,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new email campaign
    """
    new_campaign = CampaignModel(
        user_id=current_user.id,
        name=campaign.name,
        subject=campaign.subject,
        body=campaign.body,
        sender_email=campaign.sender_email,
        status="draft",
        max_emails_per_hour=campaign.max_emails_per_hour
    )

    db.add(new_campaign)
    db.commit()
    db.refresh(new_campaign)

    return {
        "id": new_campaign.id,
        "name": new_campaign.name,
        "subject": new_campaign.subject,
        "body": new_campaign.body,
        "sender_email": new_campaign.sender_email,
        "status": new_campaign.status,
        "max_emails_per_hour": new_campaign.max_emails_per_hour,
        "created_at": new_campaign.created_at.isoformat()
    }

async def send_campaign_emails_background(campaign_id: int, leads: List[dict], db: Session):
    """
    Background task to send campaign emails
    """
    from app.api.google_oauth_routes import user_credentials
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    from email.mime.text import MIMEText
    import base64

    # Get campaign from database
    campaign = db.query(CampaignModel).filter(CampaignModel.id == campaign_id).first()
    if not campaign:
        return

    sender_email = campaign.sender_email

    # Check if sender has OAuth credentials
    if sender_email not in user_credentials:
        campaign_progress[campaign_id] = {
            "status": "failed",
            "message": "Sender email not connected via OAuth. Please connect your Gmail account first.",
            "sent": 0,
            "failed": len(leads),
            "total": len(leads)
        }
        campaign.status = "failed"
        db.commit()
        return

    # Initialize progress
    campaign_progress[campaign_id] = {
        "status": "sending",
        "sent": 0,
        "failed": 0,
        "total": len(leads),
        "message": "Starting to send emails..."
    }

    creds_data = user_credentials[sender_email]
    credentials = Credentials(
        token=creds_data['token'],
        refresh_token=creds_data['refresh_token'],
        token_uri=creds_data['token_uri'],
        client_id=creds_data['client_id'],
        client_secret=creds_data['client_secret'],
        scopes=creds_data['scopes']
    )

    service = build('gmail', 'v1', credentials=credentials)

    sent_count = 0
    failed_count = 0

    for lead in leads:
        try:
            lead_id = lead["id"]
            to_email = lead["email"]
            lead_name = lead.get("name", "")

            # Personalize message by replacing [Business Name] placeholder
            personalized_body = campaign.body.replace("[Business Name]", lead_name)

            message = MIMEText(personalized_body)
            message['to'] = to_email
            message['subject'] = campaign.subject

            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

            send_result = service.users().messages().send(
                userId='me',
                body={'raw': raw_message}
            ).execute()

            sent_count += 1

            # Store sent email record in DB
            email_sent = EmailSentModel(
                campaign_id=campaign_id,
                lead_id=lead_id,
                recipient_email=to_email,
                recipient_name=lead_name,
                subject=campaign.subject,
                body=personalized_body,
                status="sent",
                sent_at=datetime.utcnow()
            )
            db.add(email_sent)
            db.commit()

            # Update progress
            campaign_progress[campaign_id]["sent"] = sent_count
            campaign_progress[campaign_id]["message"] = f"Sending emails... {sent_count}/{len(leads)} sent"

            # Random delay between 120-180 seconds (2-3 minutes)
            delay = random.uniform(120, 180)
            await asyncio.sleep(delay)

        except Exception as e:
            failed_count += 1
            campaign_progress[campaign_id]["failed"] = failed_count

            # Store failed email record in DB
            email_sent = EmailSentModel(
                campaign_id=campaign_id,
                lead_id=lead.get("id", 0),
                recipient_email=lead.get("email", "unknown"),
                recipient_name=lead.get("name", ""),
                subject=campaign.subject,
                body=campaign.body,
                status="failed",
                error_message=str(e)
            )
            db.add(email_sent)
            db.commit()

    # Mark campaign as completed
    campaign_progress[campaign_id]["status"] = "completed"
    campaign_progress[campaign_id]["message"] = f"Campaign completed: {sent_count} sent, {failed_count} failed"
    campaign.status = "completed"
    db.commit()

@router.post("/campaigns/start")
async def start_campaign(
    request: StartCampaignRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Start a campaign and send emails to selected leads
    """
    campaign = db.query(CampaignModel).filter(
        CampaignModel.id == request.campaign_id,
        CampaignModel.user_id == current_user.id
    ).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if not request.leads or len(request.leads) == 0:
        raise HTTPException(status_code=400, detail="No leads selected")

    campaign.status = "running"
    db.commit()

    # Convert leads to dict format for background task
    leads_dict = [{"id": lead.id, "email": lead.email, "name": lead.name} for lead in request.leads]

    # Create a new database session for background task
    from app.database import SessionLocal
    bg_db = SessionLocal()

    # Start sending emails in background
    background_tasks.add_task(send_campaign_emails_background, request.campaign_id, leads_dict, bg_db)

    return {
        "success": True,
        "message": f"Campaign started - sending to {len(request.leads)} leads",
        "campaign": {
            "id": campaign.id,
            "name": campaign.name,
            "status": campaign.status,
            "created_at": campaign.created_at.isoformat()
        },
        "total_leads": len(request.leads)
    }

@router.post("/campaigns/stop")
async def stop_campaign(
    request: StopCampaignRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Stop/pause a campaign
    """
    campaign = db.query(CampaignModel).filter(
        CampaignModel.id == request.campaign_id,
        CampaignModel.user_id == current_user.id
    ).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    campaign.status = "paused"
    db.commit()

    return {
        "success": True,
        "message": "Campaign stopped successfully",
        "campaign": {
            "id": campaign.id,
            "name": campaign.name,
            "status": campaign.status
        }
    }

@router.get("/emails-sent")
async def get_emails_sent(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all sent emails for current user's campaigns
    """
    emails = db.query(EmailSentModel).join(CampaignModel).filter(
        CampaignModel.user_id == current_user.id
    ).order_by(EmailSentModel.created_at.desc()).all()

    return {
        "success": True,
        "emails_sent": [
            {
                "id": e.id,
                "campaign_id": e.campaign_id,
                "lead_id": e.lead_id,
                "recipient_email": e.recipient_email,
                "subject": e.subject,
                "body": e.body,
                "status": e.status,
                "sent_at": e.sent_at.isoformat() if e.sent_at else None,
                "error_message": e.error_message,
                "created_at": e.created_at.isoformat()
            }
            for e in emails
        ]
    }

@router.get("/campaigns/{campaign_id}/progress")
async def get_campaign_progress(campaign_id: int):
    """
    Get real-time progress of a running campaign
    """
    if campaign_id not in campaign_progress:
        return {
            "status": "not_started",
            "sent": 0,
            "failed": 0,
            "total": 0,
            "message": "Campaign not started yet"
        }

    return campaign_progress[campaign_id]
