from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import time
from app.models.follow_up import (
    create_follow_up, get_pending_follow_ups, update_follow_up,
    mark_follow_up_completed, get_follow_ups_by_lead
)

router = APIRouter()

class FollowUpConfigRequest(BaseModel):
    lead_ids: List[int]
    lead_emails: List[str]
    lead_names: List[str]
    email_subject: str
    email_body: str
    from_email: EmailStr
    smtp_password: Optional[str] = None
    access_token: Optional[str] = None
    use_oauth: bool = False
    follow_up_days: int = 3  # Days to wait before follow-up
    max_follow_ups: int = 3  # Maximum number of follow-ups

@router.post("/configure-follow-ups")
async def configure_follow_ups(request: FollowUpConfigRequest):
    """Configure follow-ups for multiple leads"""
    try:
        follow_up_ids = []

        for i, lead_id in enumerate(request.lead_ids):
            follow_up_id = create_follow_up(
                lead_id=lead_id,
                lead_email=request.lead_emails[i],
                lead_name=request.lead_names[i],
                email_subject=request.email_subject,
                email_body=request.email_body,
                from_email=request.from_email,
                smtp_password=request.smtp_password,
                access_token=request.access_token,
                use_oauth=request.use_oauth,
                follow_up_days=request.follow_up_days
            )
            follow_up_ids.append(follow_up_id)

        return {
            "success": True,
            "message": f"Configured {len(follow_up_ids)} follow-ups",
            "follow_up_ids": follow_up_ids
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to configure follow-ups: {str(e)}")

@router.get("/pending-follow-ups")
async def get_pending():
    """Get all pending follow-ups that need to be sent"""
    try:
        pending = get_pending_follow_ups()
        return {
            "success": True,
            "count": len(pending),
            "follow_ups": pending
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get pending follow-ups: {str(e)}")

@router.post("/send-pending-follow-ups")
async def send_pending_follow_ups(background_tasks: BackgroundTasks):
    """Send all pending follow-ups"""
    try:
        pending = get_pending_follow_ups()

        if not pending:
            return {
                "success": True,
                "message": "No pending follow-ups to send",
                "sent_count": 0
            }

        # Process in background
        background_tasks.add_task(process_follow_ups, pending)

        return {
            "success": True,
            "message": f"Processing {len(pending)} follow-ups in background",
            "count": len(pending)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send follow-ups: {str(e)}")

def process_follow_ups(pending_list):
    """Process and send follow-up emails"""
    for follow_up in pending_list:
        try:
            # Send email based on method
            if follow_up['use_oauth']:
                send_follow_up_oauth(follow_up)
            else:
                send_follow_up_smtp(follow_up)

            # Update follow-up record
            if follow_up['follow_up_count'] >= 2:  # Max 3 total (initial + 2 follow-ups)
                mark_follow_up_completed(follow_up['id'])
            else:
                update_follow_up(follow_up['id'], follow_up_days=3)

            # Add delay between emails
            time.sleep(2)
        except Exception as e:
            print(f"Error sending follow-up {follow_up['id']}: {str(e)}")
            continue

def send_follow_up_smtp(follow_up):
    """Send follow-up email via SMTP"""
    follow_up_number = follow_up['follow_up_count'] + 1
    subject = f"Follow-up #{follow_up_number}: {follow_up['email_subject']}"

    # Add follow-up message to body
    body = f"""Hi {follow_up['lead_name']},

Just following up on my previous email. I wanted to make sure you saw this.

{follow_up['email_body']}

Looking forward to hearing from you.

Best regards"""

    msg = MIMEMultipart()
    msg['From'] = follow_up['from_email']
    msg['To'] = follow_up['lead_email']
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(follow_up['from_email'], follow_up['smtp_password'])
        server.send_message(msg)

def send_follow_up_oauth(follow_up):
    """Send follow-up email via OAuth/Gmail API"""
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    from email.mime.text import MIMEText
    import base64

    follow_up_number = follow_up['follow_up_count'] + 1
    subject = f"Follow-up #{follow_up_number}: {follow_up['email_subject']}"

    body = f"""Hi {follow_up['lead_name']},

Just following up on my previous email. I wanted to make sure you saw this.

{follow_up['email_body']}

Looking forward to hearing from you.

Best regards"""

    creds = Credentials(token=follow_up['access_token'])
    service = build('gmail', 'v1', credentials=creds)

    message = MIMEText(body)
    message['to'] = follow_up['lead_email']
    message['from'] = follow_up['from_email']
    message['subject'] = subject

    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')

    service.users().messages().send(
        userId='me',
        body={'raw': raw_message}
    ).execute()

@router.get("/follow-ups/{lead_id}")
async def get_lead_follow_ups(lead_id: int):
    """Get all follow-ups for a specific lead"""
    try:
        follow_ups = get_follow_ups_by_lead(lead_id)
        return {
            "success": True,
            "lead_id": lead_id,
            "follow_ups": follow_ups
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get follow-ups: {str(e)}")

@router.delete("/follow-up/{follow_up_id}")
async def cancel_follow_up(follow_up_id: int):
    """Cancel a follow-up"""
    try:
        mark_follow_up_completed(follow_up_id)
        return {
            "success": True,
            "message": f"Follow-up {follow_up_id} cancelled"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cancel follow-up: {str(e)}")
