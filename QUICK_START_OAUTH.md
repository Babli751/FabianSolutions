# Quick Start: Google OAuth for Gmail Sending

## 🎯 Goal
Allow users to send emails through their own Gmail account using OAuth2 instead of SMTP.

## ⚡ Quick Setup (5 minutes)

### Step 1: Get Google Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "CREATE CREDENTIALS" > "OAuth client ID"
3. If prompted, configure consent screen first:
   - Choose "External"
   - App name: "FabianSolutions"
   - Add your email
   - Save

4. Create OAuth Client:
   - Application type: **Web application**
   - Name: "FabianSolutions Backend"
   - Authorized redirect URIs: `http://localhost:8000/api/oauth/callback`
   - Click CREATE

5. **Copy the Client ID and Client Secret**

### Step 2: Update Backend Config

Edit `backend/.env`:
```env
GOOGLE_CLIENT_ID=paste-your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
```

### Step 3: Restart Backend
```bash
# Backend should auto-reload, or restart manually
```

### Step 4: Add to Frontend

In your `src/app/leadgen/app/page.tsx` or email campaign component:

```tsx
import { GoogleOAuthButton } from '@/components/GoogleOAuthButton';

// Add somewhere in your JSX:
<div className="mb-4">
  <h3 className="text-lg font-semibold mb-2">Gmail Integration (OAuth2)</h3>
  <GoogleOAuthButton />
</div>
```

## ✅ Test It

1. Open frontend: http://localhost:3000/leadgen/app
2. Click "Connect Gmail Account"
3. Authorize with your Gmail
4. You'll be redirected back - account is now connected!

## 📧 Send Email Using OAuth

Replace your SMTP sending code with:

```javascript
const sendEmailViaOAuth = async (toEmail, subject, body, fromEmail) => {
  const response = await fetch(`${API_URL}/api/oauth/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to_email: toEmail,
      subject: subject,
      body: body,
      from_email: fromEmail  // The connected Gmail account
    })
  });

  return await response.json();
};
```

## 🔍 Check Connection Status

```javascript
const checkGmailConnection = async () => {
  const response = await fetch(`${API_URL}/api/oauth/status`);
  const data = await response.json();

  if (data.connected && data.accounts.length > 0) {
    // User has connected Gmail - use OAuth
    const connectedEmail = data.accounts[0].email;
    return { connected: true, email: connectedEmail };
  } else {
    // No Gmail connected - prompt user or use SMTP
    return { connected: false };
  }
};
```

## 🎨 Where to Add the Button

Best places to add the GoogleOAuthButton:

1. **Email Campaign Tab** - Let users connect before starting campaign
2. **Settings Section** - Dedicated area for account connections
3. **Email Configuration** - Right above email account inputs

Example integration in email campaign:

```tsx
<div className="space-y-4">
  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <h4 className="font-semibold mb-2">📧 Email Sending Method</h4>

    {/* OAuth Option */}
    <div className="mb-4">
      <GoogleOAuthButton />
    </div>

    {/* OR divider */}
    <div className="flex items-center gap-2 my-4">
      <div className="flex-1 border-t border-gray-300"></div>
      <span className="text-sm text-gray-500">OR</span>
      <div className="flex-1 border-t border-gray-300"></div>
    </div>

    {/* SMTP Option */}
    <div>
      <h5 className="font-medium mb-2">Use SMTP Credentials</h5>
      {/* Your existing SMTP inputs */}
    </div>
  </div>
</div>
```

## 🚀 Ready to Use!

Your OAuth integration is complete! Users can now:
- ✅ Connect their Gmail account securely
- ✅ Send emails without exposing passwords
- ✅ Revoke access anytime from Google settings
- ✅ Use multiple Gmail accounts

## 📝 Documentation

- Full setup: `GOOGLE_OAUTH_SETUP.md`
- Implementation details: `OAUTH_IMPLEMENTATION_SUMMARY.md`
- API docs: http://localhost:8000/docs (when backend is running)
