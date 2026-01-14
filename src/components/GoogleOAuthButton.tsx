"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ConnectedAccount {
  email: string;
  has_refresh_token: boolean;
}

export function GoogleOAuthButton() {
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkOAuthStatus();
  }, []);

  const checkOAuthStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/api/oauth/status`);
      if (response.ok) {
        const data = await response.json();
        setConnected(data.connected);
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Failed to check OAuth status:', error);
    }
  };

  const handleConnectGmail = async () => {
    try {
      setLoading(true);
      // Store current path so we can return to it after OAuth
      const currentPath = window.location.pathname;
      localStorage.setItem('oauth_return_path', currentPath);
      console.log('[OAuth] Storing return path:', currentPath);

      const response = await fetch(`${API_URL}/api/oauth/authorize`);
      if (response.ok) {
        const data = await response.json();
        // Redirect user to Google OAuth consent screen
        window.location.href = data.authorization_url;
      } else {
        alert('Failed to initiate OAuth flow. Please check backend configuration.');
      }
    } catch (error) {
      console.error('OAuth error:', error);
      alert('Failed to connect to Gmail');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (email: string) => {
    if (!confirm(`Disconnect ${email}?`)) return;

    try {
      const response = await fetch(`${API_URL}/api/oauth/disconnect/${email}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert(`Disconnected ${email}`);
        checkOAuthStatus();
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      alert('Failed to disconnect account');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={handleConnectGmail}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {loading ? 'Connecting...' : 'Connect Gmail with OAuth'}
        </button>

        {connected && (
          <span className="text-sm text-green-600 font-medium">
            ✓ {accounts.length} account(s) connected
          </span>
        )}
      </div>

      {accounts.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Connected Gmail Accounts:</p>
          {accounts.map((account) => (
            <div
              key={account.email}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{account.email}</span>
                {account.has_refresh_token && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Active
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => handleDisconnect(account.email)}
                className="text-red-600 hover:bg-red-50 text-sm px-3 py-1"
              >
                Disconnect
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>• OAuth2 allows secure email sending without storing passwords</p>
        <p>• You can revoke access anytime from your Google Account settings</p>
        <p>• Only "Send Email" permission is requested</p>
      </div>
    </div>
  );
}
