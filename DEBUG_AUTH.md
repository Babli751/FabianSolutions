# Debug Authentication Issue

## Quick Test in Browser Console

Open your browser console (F12) and run these commands:

```javascript
// 1. Check if token exists
console.log('Token in localStorage:', localStorage.getItem('session_token'));

// 2. Manually test the API call with the token
const token = localStorage.getItem('session_token');
fetch('http://localhost:8000/api/campaigns', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

## Expected Results:

1. First command should show your session token (long string)
2. Second command should return `{success: true, campaigns: [...]}`

## If token is null:
- OAuth didn't save the token properly
- Check for `[OAuth]` logs in console during login

## If token exists but API returns 401:
- Token might be invalid or expired
- Check backend logs for `[Auth Debug]` messages
