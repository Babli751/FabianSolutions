# Database Setup Complete

## What Was Added.

### 1. SQLite Database
- **File**: `leadgen.db` (created automatically on first run)
- **Location**: `backend/leadgen.db`
- **Type**: SQLite (no installation needed, file-based)

### 2. Database Models (`backend/app/models.py`)
- **User**: User accounts with authentication
- **Campaign**: Email campaigns per user
- **EmailSent**: Email sending history
- **SearchHistory**: Search queries per user
- **Lead**: Leads found in searches
- **Session**: User session tokens (30-day expiry)

### 3. User Authentication (`backend/app/api/auth_routes.py`)

**Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns session token)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh session (extend 30 days)

**Session Management:**
- Sessions last 30 days
- Auto-login: Frontend stores token, sends in `Authorization: Bearer <token>` header
- No logout for long time: Sessions expire after 30 days, user needs to login again

### 4. Updated Campaign Routes
All campaign endpoints now:
- Require authentication (session token)
- Save to database (persistent)
- Are per-user (users only see their own campaigns)

## Installation

```bash
cd backend
./setup.sh
# OR manually:
pip install -r requirements.txt
```

## Usage

### 1. Start Backend
```bash
cd backend
uvicorn app.main:app --reload
```

### 2. Register User (First Time)
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword",
    "full_name": "Your Name"
  }'
```

Response:
```json
{
  "success": true,
  "user": {...},
  "session_token": "abc123...",
  "expires_at": "2026-02-11T..."
}
```

### 3. Login (Existing User)
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword"
  }'
```

### 4. Use Session Token in Requests
```bash
curl -X GET http://localhost:8000/api/campaigns \
  -H "Authorization: Bearer <your_session_token>"
```

## Frontend Integration Needed

The frontend needs to be updated to:

1. **Add Login/Register Pages**
   - Create `/login` and `/register` routes
   - Store session token in localStorage
   - Redirect to login if no token

2. **Add Authentication Context**
   ```typescript
   const [sessionToken, setSessionToken] = useState(
     localStorage.getItem('session_token')
   );
   ```

3. **Send Token in All API Requests**
   ```typescript
   fetch(url, {
     headers: {
       'Authorization': `Bearer ${sessionToken}`,
       'Content-Type': 'application/json'
     }
   })
   ```

4. **Handle 401 Errors**
   ```typescript
   if (response.status === 401) {
     // Token expired, redirect to login
     localStorage.removeItem('session_token');
     router.push('/login');
   }
   ```

5. **Auto-Refresh Sessions**
   ```typescript
   // Every 7 days, refresh the session
   setInterval(async () => {
     await fetch('/api/auth/refresh', {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${sessionToken}` }
     });
   }, 7 * 24 * 60 * 60 * 1000);
   ```

## Database Features

### Persistent Data
- **Campaigns**: Saved forever, survive server restarts
- **Emails Sent**: Full history of all emails sent
- **Search History**: All searches saved per user
- **Leads**: All found leads saved per search

### Per-User Data
- Each user has their own:
  - Campaigns
  - Email history
  - Search history
  - Leads

### Session Management
- Sessions last 30 days
- Can be refreshed to extend
- Automatic logout after expiry
- Secure token-based authentication

## Testing

```bash
# 1. Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","full_name":"Test User"}'

# 2. Get token from response, then:
export TOKEN="<your_token_here>"

# 3. Create campaign
curl -X POST http://localhost:8000/api/campaigns \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"My Campaign",
    "subject":"Hello",
    "body":"Test email",
    "sender_email":"test@test.com",
    "max_emails_per_hour":20
  }'

# 4. List campaigns
curl -X GET http://localhost:8000/api/campaigns \
  -H "Authorization: Bearer $TOKEN"
```

## Next Steps

1. **Install Dependencies**: Run `./setup.sh` in backend folder
2. **Start Backend**: `uvicorn app.main:app --reload`
3. **Update Frontend**: Add authentication (login/register pages, token storage)
4. **Test**: Register, login, create campaign - should persist!

## Database Location

- SQLite file: `backend/leadgen.db`
- Backup: Just copy this file
- Reset: Delete this file, it will be recreated
