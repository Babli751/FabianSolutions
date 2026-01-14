# Google OAuth2 Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Gmail API:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Configure consent screen if prompted:
   - User Type: External (for testing)
   - App name: FabianSolutions Lead Gen
   - User support email: your email
   - Developer contact: your email
   - Scopes: Add `https://www.googleapis.com/auth/gmail.send`
   - Test users: Add your Gmail addresses

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: FabianSolutions Backend
   - Authorized redirect URIs:
     - `http://localhost:8000/api/oauth/callback`
     - `http://localhost:3000/leadgen/app` (optional)

5. Copy the **Client ID** and **Client Secret**

## Step 3: Update Backend Configuration

Edit `backend/.env` file:

```env
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:8000/api/oauth/callback
FRONTEND_URL=http://localhost:3000
```

## Step 4: Restart Backend

```bash
# The backend should auto-reload if using --reload flag
# Otherwise, restart manually
```

## Step 5: Test OAuth Flow

1. Go to frontend: `http://localhost:3000/leadgen/app`
2. Click "Connect Gmail Account" button
3. Authorize the application
4. You'll be redirected back with success message

## API Endpoints

### Start OAuth Flow
```
GET /api/oauth/authorize
Returns: { "authorization_url": "...", "state": "..." }
```

### Check Connection Status
```
GET /api/oauth/status
Returns: { "connected": true, "accounts": [...] }
```

### Send Email via OAuth
```
POST /api/oauth/send-email
Body: {
  "to_email": "recipient@example.com",
  "subject": "Test Email",
  "body": "Email content",
  "from_email": "your-gmail@gmail.com"
}
```

### Disconnect Account
```
DELETE /api/oauth/disconnect/{email}
```

## Security Notes

- **Production**: Store credentials in encrypted database
- **Refresh Tokens**: Currently stored in memory, will be lost on restart
- **Scopes**: Only requests `gmail.send` permission (minimal)
- **SSL**: Use HTTPS in production
