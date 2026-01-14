# Quick Start - Database Backend

## ✅ Setup Complete!

Database with authentication is now working! All campaigns and data will persist between server restarts.

## Start Backend

```bash
cd backend
uvicorn app.main:app --reload
```

## Start Frontend

```bash
npm run dev
```

## Important: Authentication Required

**All campaign endpoints now require authentication.** The frontend needs to be updated to:

### Temporary Solution (Test Without Frontend):

Register a user via API:

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "test123",
    "full_name": "Test User"
  }'
```

Response includes `session_token`. Use it in campaign requests:

```bash
# Save token
export TOKEN="your_token_here"

# Create campaign
curl -X POST http://localhost:8000/api/campaigns \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Campaign",
    "subject": "Hello",
    "body": "Test",
    "sender_email": "test@test.com",
    "max_emails_per_hour": 20
  }'
```

### Permanent Solution (Update Frontend):

The frontend needs these updates:

**1. Create Auth Context** (`src/contexts/AuthContext.tsx`):
```typescript
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('session_token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('session_token', token);
      // Fetch user info
      fetch('http://localhost:8000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUser(data.user))
        .catch(() => {
          setToken(null);
          localStorage.removeItem('session_token');
        });
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, setToken, user }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**2. Add Authorization Header to All API Calls**:

In `EmailCampaign.tsx` and other components:
```typescript
const token = localStorage.getItem('session_token');

fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

**3. Handle 401 Errors** (redirect to login):
```typescript
if (response.status === 401) {
  localStorage.removeItem('session_token');
  window.location.href = '/login';
}
```

**4. Create Login Page** (`src/app/login/page.tsx`):
```typescript
const handleLogin = async (email, password) => {
  const response = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  localStorage.setItem('session_token', data.session_token);
  router.push('/leadgen/app');
};
```

## What's Saved in Database:

- ✅ Users (with 30-day sessions)
- ✅ Campaigns (persist forever)
- ✅ Emails sent history
- ✅ Search history (optional - not yet implemented)
- ✅ Leads (optional - not yet implemented)

## Database Location:

`backend/leadgen.db` - SQLite file

**Backup**: Copy this file
**Reset**: Delete this file (will recreate on startup)

## Test Authentication Working:

```bash
# 1. Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123","full_name":"User"}'

# 2. Copy token from response, then test:
curl -X GET http://localhost:8000/api/campaigns \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Should return: {"success": true, "campaigns": []}
```

## Next Steps:

1. **Backend is ready** - Just start it
2. **Frontend needs auth** - Add login/register pages and auth headers
3. **Or skip auth temporarily** - Use curl with token for testing

See [DATABASE_SETUP.md](DATABASE_SETUP.md) for detailed authentication guide.
