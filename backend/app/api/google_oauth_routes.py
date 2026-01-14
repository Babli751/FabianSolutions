from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import RedirectResponse
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from pydantic import BaseModel
from sqlalchemy.orm import Session
import os
import json
import base64
from email.mime.text import MIMEText
from dotenv import load_dotenv

from app.database import get_db
from app.models import User, Session as UserSession
from app.auth import hash_password, generate_session_token, get_session_expiry

# Load environment variables
load_dotenv()

router = APIRouter()

# In-memory storage for OAuth tokens (use database in production)
user_credentials = {}

# Google OAuth2 configuration
SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly'  # Needed to get user profile
]

# Client configuration
CLIENT_CONFIG = {
    "web": {
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": [os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/oauth/callback")]
    }
}

# Debug: Print loaded credentials (remove in production)
print("=" * 50)
print("GOOGLE OAUTH CONFIG LOADED:")
print(f"Client ID: {os.getenv('GOOGLE_CLIENT_ID')}")
print(f"Client Secret: {os.getenv('GOOGLE_CLIENT_SECRET')[:10]}..." if os.getenv('GOOGLE_CLIENT_SECRET') else "Client Secret: None")
print(f"Redirect URI: {os.getenv('GOOGLE_REDIRECT_URI')}")
print("=" * 50)

@router.get("/oauth/authorize")
async def authorize():
    """
    Start OAuth2 flow - redirect user to Google consent screen
    """
    try:
        flow = Flow.from_client_config(
            CLIENT_CONFIG,
            scopes=SCOPES,
            redirect_uri=CLIENT_CONFIG["web"]["redirect_uris"][0]
        )

        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'  # Force consent screen to get refresh token
        )

        return {
            "authorization_url": authorization_url,
            "state": state
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth initialization failed: {str(e)}")

@router.get("/oauth/callback")
async def oauth_callback(code: str, state: str, db: Session = Depends(get_db)):
    """
    Handle OAuth2 callback from Google - Also creates/updates user account
    """
    try:
        flow = Flow.from_client_config(
            CLIENT_CONFIG,
            scopes=SCOPES,
            redirect_uri=CLIENT_CONFIG["web"]["redirect_uris"][0],
            state=state
        )

        flow.fetch_token(code=code)

        credentials = flow.credentials

        # Get user email and name
        service = build('gmail', 'v1', credentials=credentials)
        profile = service.users().getProfile(userId='me').execute()
        user_email = profile['emailAddress']

        # Store OAuth credentials in memory (for sending emails)
        user_credentials[user_email] = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes,
            'email': user_email
        }

        # Create or get user in database
        user = db.query(User).filter(User.email == user_email).first()
        if not user:
            # Create new user (OAuth users don't have passwords)
            user = User(
                email=user_email,
                hashed_password=hash_password("oauth_user_no_password"),  # Placeholder
                full_name=user_email.split('@')[0].title(),
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Create session token for user
        session_token = generate_session_token()
        session = UserSession(
            user_id=user.id,
            session_token=session_token,
            expires_at=get_session_expiry(30)  # 30 days
        )
        db.add(session)
        db.commit()

        # Redirect to frontend with session token
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(
            url=f"{frontend_url}/leadgen/app?oauth_success=true&email={user_email}&token={session_token}"
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth callback failed: {str(e)}")

@router.get("/oauth/status")
async def oauth_status():
    """
    Check which Gmail accounts are connected
    """
    connected_accounts = [
        {
            "email": email,
            "has_refresh_token": creds.get('refresh_token') is not None
        }
        for email, creds in user_credentials.items()
    ]

    return {
        "connected": len(connected_accounts) > 0,
        "accounts": connected_accounts
    }

@router.delete("/oauth/disconnect/{email}")
async def disconnect_oauth(email: str):
    """
    Disconnect a Gmail account
    """
    if email in user_credentials:
        del user_credentials[email]
        return {"message": f"Disconnected {email}"}
    else:
        raise HTTPException(status_code=404, detail="Account not found")

class GmailSendRequest(BaseModel):
    to_email: str
    subject: str
    body: str
    from_email: str  # Which connected Gmail account to send from

@router.post("/oauth/send-email")
async def send_email_via_oauth(request: GmailSendRequest):
    """
    Send email using Gmail API with OAuth credentials
    """
    if request.from_email not in user_credentials:
        raise HTTPException(
            status_code=401,
            detail=f"Gmail account {request.from_email} is not connected. Please authorize first."
        )

    try:
        creds_data = user_credentials[request.from_email]

        credentials = Credentials(
            token=creds_data['token'],
            refresh_token=creds_data['refresh_token'],
            token_uri=creds_data['token_uri'],
            client_id=creds_data['client_id'],
            client_secret=creds_data['client_secret'],
            scopes=creds_data['scopes']
        )

        service = build('gmail', 'v1', credentials=credentials)

        # Create email message
        message = MIMEText(request.body)
        message['to'] = request.to_email
        message['subject'] = request.subject

        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

        send_message = service.users().messages().send(
            userId='me',
            body={'raw': raw_message}
        ).execute()

        # Update stored credentials if they were refreshed
        if credentials.token != creds_data['token']:
            user_credentials[request.from_email]['token'] = credentials.token

        return {
            "success": True,
            "message_id": send_message['id'],
            "message": f"Email sent successfully from {request.from_email}"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")
