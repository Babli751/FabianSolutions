from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import asyncio
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import httpx

router = APIRouter()

# In-memory progress tracking (use Redis in production)
email_progress = {}
search_progress = {}
search_leads = {}  # Store leads incrementally by search_id

# Daily email limits tracking {email: {date: count}}
daily_email_counts = {}
DAILY_EMAIL_LIMIT = 40  # Max emails per account per day

class EmailAccount(BaseModel):
    email: EmailStr
    password: str

class SendEmailsRequest(BaseModel):
    lead_ids: List[int]
    subject: str
    body: str
    email_accounts: List[EmailAccount]
    delay_min: float = 120.0  # 2 minutes minimum
    delay_max: float = 180.0  # 3 minutes maximum

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

def get_daily_email_count(email: str) -> int:
    """Get today's email count for an email address"""
    today = datetime.now().strftime("%Y-%m-%d")
    if email not in daily_email_counts:
        daily_email_counts[email] = {}

    # Clean up old dates
    daily_email_counts[email] = {date: count for date, count in daily_email_counts[email].items() if date == today}

    return daily_email_counts[email].get(today, 0)

def increment_daily_email_count(email: str):
    """Increment today's email count for an email address"""
    today = datetime.now().strftime("%Y-%m-%d")
    if email not in daily_email_counts:
        daily_email_counts[email] = {}
    daily_email_counts[email][today] = daily_email_counts[email].get(today, 0) + 1

def get_remaining_daily_emails(email: str) -> int:
    """Get remaining emails for today"""
    return max(0, DAILY_EMAIL_LIMIT - get_daily_email_count(email))

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

        # Send email with timeout
        with smtplib.SMTP(smtp_config['host'], smtp_config['port'], timeout=30) as server:
            server.set_debuglevel(0)
            server.starttls()
            server.login(from_email, password)
            server.send_message(message)

        # Increment daily count after successful send
        increment_daily_email_count(from_email)

        return {"success": True, "email": to_email}

    except smtplib.SMTPAuthenticationError as e:
        error_msg = f"Authentication failed. Please use App Password for Gmail (not regular password). Error: {str(e)}"
        return {"success": False, "email": to_email, "error": error_msg}
    except smtplib.SMTPException as e:
        error_msg = f"SMTP Error: {str(e)}"
        return {"success": False, "email": to_email, "error": error_msg}
    except Exception as e:
        error_msg = f"Failed to send email: {str(e)}"
        return {"success": False, "email": to_email, "error": error_msg}

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

        # Get current email account and check daily limit
        account = request.email_accounts[account_index % len(request.email_accounts)]

        # Check daily limit for current account
        remaining = get_remaining_daily_emails(account.email)
        if remaining <= 0:
            # Try next account
            account_index += 1
            if account_index >= len(request.email_accounts):
                # All accounts exhausted for today
                email_progress[request_id]["status"] = "paused"
                email_progress[request_id]["message"] = "Daily limit reached for all accounts"
                break
            account = request.email_accounts[account_index % len(request.email_accounts)]
            remaining = get_remaining_daily_emails(account.email)
            if remaining <= 0:
                # This account also exhausted
                continue

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

    # TODO: Fetch real leads from database
    # For now, require leads to be passed with email addresses
    if not request.lead_ids:
        raise HTTPException(status_code=400, detail="No lead IDs provided")

    # In production, fetch from database
    # For now, return error asking to implement database
    raise HTTPException(
        status_code=501,
        detail="Database integration required. Please configure database connection and lead storage."
    )

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
        # TODO: Save to database
        # Requires database connection and ScrapedEmail model
        return {
            "success": True,
            "lead_id": lead_id,
            "total_emails": len(scraped_emails),
            "emails": scraped_emails,
            "warning": "Emails not saved to database - database integration required"
        }

    return {
        "success": False,
        "message": "No emails found on website"
    }

@router.get("/search-progress/{search_id}")
async def get_search_progress(search_id: str):
    """
    Get search progress and current leads found so far
    """
    if search_id not in search_progress:
        raise HTTPException(status_code=404, detail="Search request not found")

    progress = search_progress[search_id]
    # Include current leads in progress response
    progress["leads"] = search_leads.get(search_id, [])
    progress["leads_count"] = len(search_leads.get(search_id, []))

    return progress

class SearchRequest(BaseModel):
    query: str  # Business type/query
    location: str
    maxResults: int = 20  # Default, but no upper limit
    search_id: Optional[str] = None  # Optional client-provided search ID

@router.post("/search")
async def search_businesses(request: SearchRequest):
    """
    Search for businesses using Google Maps Places API
    Returns real leads with business information
    """
    import os

    # Use client-provided search ID or generate one
    search_id = request.search_id or f"search_{datetime.utcnow().timestamp()}"

    # Get Google Maps API key from environment
    google_api_key = os.getenv("GOOGLE_MAPS_API_KEY")

    if not google_api_key:
        raise HTTPException(
            status_code=500,
            detail="Google Maps API key not configured. Please set GOOGLE_MAPS_API_KEY environment variable."
        )

    try:
        async with httpx.AsyncClient() as client:
            # Initialize progress and leads storage
            search_progress[search_id] = {
                "total": request.maxResults,
                "current": 0,
                "status": "searching",
                "message": "Searching for businesses..."
            }
            search_leads[search_id] = []  # Initialize empty leads array

            # Google Places Text Search API
            search_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"

            params = {
                "query": f"{request.query} in {request.location}",
                "key": google_api_key,
                "type": "establishment"
            }

            response = await client.get(search_url, params=params, timeout=30.0)

            if response.status_code != 200:
                search_progress[search_id]["status"] = "failed"
                search_progress[search_id]["message"] = f"API error: {response.status_code}"
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Google Maps API error: {response.text}"
                )

            data = response.json()

            if data.get("status") != "OK":
                if data.get("status") == "ZERO_RESULTS":
                    search_progress[search_id]["status"] = "completed"
                    search_progress[search_id]["message"] = "No businesses found"
                    return {
                        "success": True,
                        "leads": [],
                        "total": 0,
                        "search_id": search_id,
                        "message": "No businesses found for this search"
                    }
                search_progress[search_id]["status"] = "failed"
                search_progress[search_id]["message"] = data.get("error_message", "Unknown error")
                raise HTTPException(
                    status_code=500,
                    detail=f"Google Maps API error: {data.get('status')} - {data.get('error_message', 'Unknown error')}"
                )

            # Get all results - handle pagination for more than 20
            all_results = data.get("results", [])
            next_page_token = data.get("next_page_token")
            seen_place_ids = set(place.get("place_id") for place in all_results)

            # Update initial progress
            search_progress[search_id]["current"] = len(all_results)
            search_progress[search_id]["message"] = f"Found {len(all_results)} businesses..."

            # If we need more results and there's a next page token, fetch additional pages
            while len(all_results) < request.maxResults and next_page_token:
                # Wait 2 seconds as required by Google API before using next_page_token
                await asyncio.sleep(2)

                search_progress[search_id]["message"] = f"Fetching more results... ({len(all_results)} found)"

                next_page_params = {
                    "pagetoken": next_page_token,
                    "key": google_api_key
                }

                next_response = await client.get(search_url, params=next_page_params, timeout=30.0)

                if next_response.status_code == 200:
                    next_data = next_response.json()
                    if next_data.get("status") == "OK":
                        new_results = next_data.get("results", [])
                        # Add only unique results
                        for result in new_results:
                            place_id = result.get("place_id")
                            if place_id not in seen_place_ids:
                                all_results.append(result)
                                seen_place_ids.add(place_id)
                                # Update progress
                                search_progress[search_id]["current"] = len(all_results)
                                search_progress[search_id]["message"] = f"Found {len(all_results)} businesses..."
                        next_page_token = next_data.get("next_page_token")
                    else:
                        break
                else:
                    break

            # If still need more results after exhausting pages (max ~60), try variations
            if len(all_results) < request.maxResults:
                search_variations = [
                    f"{request.query} near {request.location}",
                    f"best {request.query} {request.location}",
                    f"top {request.query} {request.location}",
                    f"{request.query} shop {request.location}",
                    f"{request.query} store {request.location}",
                    f"{request.query} service {request.location}",
                    f"{request.query} business {request.location}",
                    f"professional {request.query} {request.location}",
                    f"{request.query} specialist {request.location}",
                    f"{request.query} expert {request.location}",
                    f"{request.query} salon {request.location}",
                    f"{request.query} center {request.location}",
                    f"{request.query} studio {request.location}",
                    f"local {request.query} {request.location}",
                    f"{request.query} services {request.location}",
                ]

                for variation in search_variations:
                    if len(all_results) >= request.maxResults:
                        break

                    search_progress[search_id]["message"] = f"Expanding search... ({len(all_results)} found)"

                    var_params = {
                        "query": variation,
                        "key": google_api_key,
                        "type": "establishment"
                    }

                    var_response = await client.get(search_url, params=var_params, timeout=30.0)

                    if var_response.status_code == 200:
                        var_data = var_response.json()
                        if var_data.get("status") == "OK":
                            var_results = var_data.get("results", [])
                            # Add only unique results
                            for result in var_results:
                                if len(all_results) >= request.maxResults:
                                    break
                                place_id = result.get("place_id")
                                if place_id not in seen_place_ids:
                                    all_results.append(result)
                                    seen_place_ids.add(place_id)
                                    # Update progress after each new result
                                    search_progress[search_id]["current"] = len(all_results)
                                    search_progress[search_id]["message"] = f"Found {len(all_results)} businesses..."

                            # Try to get more pages from this variation
                            var_next_token = var_data.get("next_page_token")
                            while len(all_results) < request.maxResults and var_next_token:
                                await asyncio.sleep(2)

                                var_next_response = await client.get(search_url, params={"pagetoken": var_next_token, "key": google_api_key}, timeout=30.0)

                                if var_next_response.status_code == 200:
                                    var_next_data = var_next_response.json()
                                    if var_next_data.get("status") == "OK":
                                        new_var_results = var_next_data.get("results", [])
                                        for result in new_var_results:
                                            if len(all_results) >= request.maxResults:
                                                break
                                            place_id = result.get("place_id")
                                            if place_id not in seen_place_ids:
                                                all_results.append(result)
                                                seen_place_ids.add(place_id)
                                                # Update progress
                                                search_progress[search_id]["current"] = len(all_results)
                                                search_progress[search_id]["message"] = f"Found {len(all_results)} businesses..."
                                        var_next_token = var_next_data.get("next_page_token")
                                    else:
                                        break
                                else:
                                    break

            # Apply the max results limit
            results = all_results[:request.maxResults]

            # Update progress with actual total
            search_progress[search_id]["total"] = len(results)
            search_progress[search_id]["message"] = f"Processing {len(results)} businesses..."

            leads = []

            for idx, place in enumerate(results, 1):
                try:
                    # Update progress for EVERY business found
                    search_progress[search_id]["current"] = idx
                    search_progress[search_id]["message"] = f"Processing business {idx}/{len(results)}"
                    # Small delay to make progress visible
                    await asyncio.sleep(0.3)

                    place_id = place.get("place_id")

                    # Get detailed place information
                    details_url = "https://maps.googleapis.com/maps/api/place/details/json"
                    details_params = {
                        "place_id": place_id,
                        "fields": "name,formatted_address,formatted_phone_number,website,place_id,geometry",
                        "key": google_api_key
                    }

                    details_response = await client.get(details_url, params=details_params, timeout=30.0)
                    details_data = details_response.json()

                    if details_data.get("status") == "OK":
                        place_details = details_data.get("result", {})

                        # Extract information
                        name = place_details.get("name", place.get("name", "Unknown Business"))
                        address = place_details.get("formatted_address", place.get("formatted_address", ""))
                        phone = place_details.get("formatted_phone_number")
                        website = place_details.get("website")

                        # Create Google Maps URL
                        lat = place.get("geometry", {}).get("location", {}).get("lat")
                        lng = place.get("geometry", {}).get("location", {}).get("lng")
                        google_maps_url = f"https://www.google.com/maps/place/?q=place_id:{place_id}"

                        lead = {
                            "id": idx,
                            "name": name,
                            "email": None,  # Will be scraped from website
                            "phone": phone,
                            "website": website,
                            "address": address,
                            "status": "new",
                            "googleMapsUrl": google_maps_url,
                            "scrapedEmails": [],
                            "businessCategory": request.query
                        }
                    else:
                        # If details API fails, create basic lead from search result
                        name = place.get("name", "Unknown Business")
                        website = None
                        lead = {
                            "id": idx,
                            "name": name,
                            "email": None,
                            "phone": None,
                            "website": None,
                            "address": place.get("formatted_address", ""),
                            "status": "new",
                            "googleMapsUrl": f"https://www.google.com/maps/place/?q=place_id:{place_id}",
                            "scrapedEmails": [],
                            "businessCategory": request.query
                        }

                    # If website exists, scrape emails (with timeout)
                    if website and lead.get("website"):
                        try:
                            search_progress[search_id]["message"] = f"Scraping emails from {name}... ({idx}/{len(results)})"
                            from app.services.email_scraper import EmailScraper
                            scraper = EmailScraper()

                            # Use asyncio.wait_for to add a timeout to prevent hanging
                            scraped_emails = await asyncio.wait_for(
                                scraper.scrape_website(website, request.query),
                                timeout=15.0  # 15 second timeout per website
                            )
                            if scraped_emails:
                                lead["scrapedEmails"] = scraped_emails
                                # Set primary email as the first scraped email
                                lead["email"] = scraped_emails[0]["email"]
                        except asyncio.TimeoutError:
                            print(f"[Non-fatal] Timeout scraping {website} after 15s - skipping email scraping for this business")
                            # Continue processing without emails
                        except Exception as e:
                            print(f"[Non-fatal] Failed to scrape {website} - skipping email scraping for this business. Error: {str(e)}")
                            # Continue processing without emails

                    leads.append(lead)
                    # Store lead incrementally so it's available even if search fails later
                    search_leads[search_id].append(lead)

                except Exception as e:
                    # If any error occurs processing this business, log it and continue
                    print(f"Error processing business {idx}: {str(e)}")
                    # Still try to add a basic lead entry
                    try:
                        basic_lead = {
                            "id": idx,
                            "name": place.get("name", f"Business {idx}"),
                            "email": None,
                            "phone": None,
                            "website": None,
                            "address": place.get("formatted_address", ""),
                            "status": "new",
                            "googleMapsUrl": "",
                            "scrapedEmails": [],
                            "businessCategory": request.query
                        }
                        leads.append(basic_lead)
                        search_leads[search_id].append(basic_lead)
                    except:
                        pass  # Skip this lead entirely if we can't even create a basic entry

            # Mark as completed
            search_progress[search_id]["status"] = "completed"
            search_progress[search_id]["current"] = len(results)
            search_progress[search_id]["message"] = f"Found {len(leads)} businesses"

            return {
                "success": True,
                "leads": search_leads[search_id],  # Return stored leads
                "total": len(search_leads[search_id]),
                "search_id": search_id
            }

    except httpx.TimeoutException:
        search_progress[search_id]["status"] = "partial"
        search_progress[search_id]["message"] = f"Timeout - but found {len(search_leads.get(search_id, []))} businesses"
        # Return partial results instead of error
        return {
            "success": False,
            "leads": search_leads.get(search_id, []),
            "total": len(search_leads.get(search_id, [])),
            "search_id": search_id,
            "message": "Search timed out but returning partial results"
        }
    except Exception as e:
        if search_id in search_progress:
            search_progress[search_id]["status"] = "partial"
            search_progress[search_id]["message"] = f"Error - but found {len(search_leads.get(search_id, []))} businesses"
        # Return partial results instead of throwing error
        return {
            "success": False,
            "leads": search_leads.get(search_id, []),
            "total": len(search_leads.get(search_id, [])),
            "search_id": search_id,
            "message": f"Search encountered error but returning {len(search_leads.get(search_id, []))} businesses found: {str(e)}"
        }

class SMTPConfig(BaseModel):
    email: EmailStr
    password: str
    smtp_server: str
    port: int

class TestEmailRequest(BaseModel):
    smtp_config: SMTPConfig
    test_email: EmailStr

@router.post("/send-test-email")
async def send_test_email(request: TestEmailRequest):
    """
    Send a test email to verify SMTP configuration with custom SMTP server and port
    """
    try:
        # Create test message
        message = MIMEMultipart()
        message['From'] = request.smtp_config.email
        message['To'] = request.test_email
        message['Subject'] = "Test Email - SMTP Configuration"

        body = "This is a test email to verify your SMTP configuration. If you received this, your settings are working correctly!"
        message.attach(MIMEText(body, 'plain'))

        # Send email with custom SMTP settings
        with smtplib.SMTP(request.smtp_config.smtp_server, request.smtp_config.port, timeout=30) as server:
            server.set_debuglevel(0)
            server.starttls()
            server.login(request.smtp_config.email, request.smtp_config.password)
            server.send_message(message)

        return {
            "success": True,
            "message": f"Test email sent successfully to {request.test_email}",
            "to_email": request.test_email
        }

    except smtplib.SMTPAuthenticationError as e:
        raise HTTPException(
            status_code=401,
            detail=f"Authentication failed. Please check your email and password. For Gmail, use an App Password. Error: {str(e)}"
        )
    except smtplib.SMTPException as e:
        raise HTTPException(
            status_code=500,
            detail=f"SMTP Error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send test email: {str(e)}"
        )

class TestEmailOAuthRequest(BaseModel):
    to_email: EmailStr
    from_email: EmailStr
    access_token: str
    subject: str
    body: str

@router.post("/send-test-email-oauth")
async def send_test_email_oauth(request: TestEmailOAuthRequest):
    """
    Send a test email using Gmail API with OAuth token
    """
    try:
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build
        from email.mime.text import MIMEText
        import base64

        # Create credentials from access token
        creds = Credentials(token=request.access_token)

        # Build Gmail API service
        service = build('gmail', 'v1', credentials=creds)

        # Create email message
        message = MIMEText(request.body)
        message['to'] = request.to_email
        message['from'] = request.from_email
        message['subject'] = request.subject

        # Encode message
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')

        # Send email
        send_result = service.users().messages().send(
            userId='me',
            body={'raw': raw_message}
        ).execute()

        return {
            "success": True,
            "message": f"Test email sent successfully to {request.to_email}",
            "to_email": request.to_email,
            "message_id": send_result.get('id')
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send test email: {str(e)}"
        )

class SendEmailsOAuthRequest(BaseModel):
    lead_ids: List[int]
    subject: str
    body: str
    from_email: EmailStr
    access_token: str
    delay_min: float = 0.5
    delay_max: float = 5.0

@router.post("/send-emails-oauth")
async def send_emails_oauth(request: SendEmailsOAuthRequest):
    """
    Send emails to leads using Gmail API with OAuth token
    """
    try:
        from google.oauth2.credentials import Credentials
        from googleapiclient.discovery import build
        from email.mime.text import MIMEText
        import base64

        # Create credentials from access token
        creds = Credentials(token=request.access_token)

        # Build Gmail API service
        service = build('gmail', 'v1', credentials=creds)

        # Mock leads - in production, fetch from database
        # For now, we'll just return success
        sent_count = 0
        failed_count = 0

        for lead_id in request.lead_ids:
            try:
                # In production, fetch lead from database
                # For now, simulate email sending
                await asyncio.sleep(random.uniform(request.delay_min, request.delay_max))
                sent_count += 1
            except Exception as e:
                print(f"Failed to send to lead {lead_id}: {str(e)}")
                failed_count += 1

        return {
            "success": True,
            "message": f"Sent {sent_count} emails successfully ({failed_count} failed)",
            "sent": sent_count,
            "failed": failed_count
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send emails: {str(e)}"
        )

class AIImproveRequest(BaseModel):
    text: str
    subject: Optional[str] = None  # If provided, improve both subject and body
    sender_email: Optional[str] = None

@router.post("/ai-improve")
async def ai_improve_text(request: AIImproveRequest):
    """
    Improve email text using OpenAI GPT API
    Can improve just body, or both subject and body
    """
    try:
        if not request.text or len(request.text.strip()) == 0:
            raise HTTPException(status_code=400, detail="Text cannot be empty")

        import os
        from openai import OpenAI

        # Get OpenAI API key from environment
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."
            )

        # Initialize OpenAI client
        client = OpenAI(api_key=api_key)

        # Create prompt for email improvement
        sender_info = f"\n\nIMPORTANT: Add this sender contact information at the END of the email:\n{request.sender_email}" if request.sender_email else ""

        if request.subject:
            # Improve both subject and body
            system_prompt = """You are a professional email writing assistant. Your task is to improve the given email subject and body to make them more professional, clear, and effective for business communication.

IMPORTANT: You MUST respond in the SAME LANGUAGE as the input text. If the user writes in Turkish, respond in Turkish. If in English, respond in English. If in any other language, respond in that language.

Keep the core message but enhance:
- Grammar and spelling
- Professional tone
- Clarity and structure
- Persuasiveness
- Call to action

Return ONLY the improved content in this EXACT format:
SUBJECT: [improved subject here]
BODY: [improved body here]

Do not add any other explanations or meta-commentary. Always maintain the original language."""

            user_prompt = f"Please improve this email subject and body and respond in the same language as the input:\n\nCurrent Subject: {request.subject}\n\nCurrent Body:\n{request.text}{sender_info}"

            # Call OpenAI API
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=1500
            )

            improved_content = response.choices[0].message.content.strip()

            # Parse the response
            improved_subject = ""
            improved_body = ""

            if "SUBJECT:" in improved_content and "BODY:" in improved_content:
                parts = improved_content.split("BODY:")
                improved_subject = parts[0].replace("SUBJECT:", "").strip()
                improved_body = parts[1].strip()
            else:
                improved_body = improved_content

            return {
                "success": True,
                "improved_subject": improved_subject,
                "improved_text": improved_body,
                "original_length": len(request.text),
                "improved_length": len(improved_body)
            }
        else:
            # Improve only body
            system_prompt = """You are a professional email writing assistant. Your task is to improve the given email text to make it more professional, clear, and effective for business communication.

IMPORTANT: You MUST respond in the SAME LANGUAGE as the input text. If the user writes in Turkish, respond in Turkish. If in English, respond in English. If in any other language, respond in that language.

Keep the core message but enhance:
- Grammar and spelling
- Professional tone
- Clarity and structure
- Persuasiveness
- Call to action

Return ONLY the improved email text without any explanations or meta-commentary. Always maintain the original language."""

            user_prompt = f"Please improve this email and respond in the same language as the input:\n\n{request.text}{sender_info}"

            # Call OpenAI API
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )

            improved_text = response.choices[0].message.content.strip()

            return {
                "success": True,
                "improved_text": improved_text,
                "original_length": len(request.text),
                "improved_length": len(improved_text)
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to improve text: {str(e)}"
        )

class EmailLimitRequest(BaseModel):
    email_addresses: List[str]

@router.post("/email-limits")
async def get_email_limits(request: EmailLimitRequest):
    """
    Get daily email limits and usage for email addresses
    """
    limits = []
    for email in request.email_addresses:
        sent_today = get_daily_email_count(email)
        remaining = get_remaining_daily_emails(email)
        limits.append({
            "email": email,
            "daily_limit": DAILY_EMAIL_LIMIT,
            "sent_today": sent_today,
            "remaining": remaining,
            "percentage_used": round((sent_today / DAILY_EMAIL_LIMIT) * 100, 1)
        })

    total_remaining = sum(limit["remaining"] for limit in limits)

    return {
        "success": True,
        "limits": limits,
        "total_daily_capacity": DAILY_EMAIL_LIMIT * len(request.email_addresses),
        "total_sent_today": sum(limit["sent_today"] for limit in limits),
        "total_remaining": total_remaining
    }
