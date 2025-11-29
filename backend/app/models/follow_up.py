from datetime import datetime, timedelta
from typing import Optional
import sqlite3
import os

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), "../../follow_ups.db")

def init_db():
    """Initialize the follow-up database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS follow_ups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id INTEGER NOT NULL,
            lead_email TEXT NOT NULL,
            lead_name TEXT,
            first_email_sent_at TEXT NOT NULL,
            last_email_sent_at TEXT NOT NULL,
            follow_up_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'pending',
            next_follow_up_at TEXT,
            email_subject TEXT,
            email_body TEXT,
            from_email TEXT,
            smtp_password TEXT,
            access_token TEXT,
            use_oauth INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()

def create_follow_up(
    lead_id: int,
    lead_email: str,
    lead_name: str,
    email_subject: str,
    email_body: str,
    from_email: str,
    smtp_password: Optional[str] = None,
    access_token: Optional[str] = None,
    use_oauth: bool = False,
    follow_up_days: int = 3
):
    """Create a follow-up entry"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    now = datetime.utcnow().isoformat()
    next_follow_up = (datetime.utcnow() + timedelta(days=follow_up_days)).isoformat()

    cursor.execute("""
        INSERT INTO follow_ups (
            lead_id, lead_email, lead_name, first_email_sent_at, last_email_sent_at,
            next_follow_up_at, email_subject, email_body, from_email,
            smtp_password, access_token, use_oauth, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        lead_id, lead_email, lead_name, now, now,
        next_follow_up, email_subject, email_body, from_email,
        smtp_password, access_token, 1 if use_oauth else 0, now, now
    ))

    conn.commit()
    follow_up_id = cursor.lastrowid
    conn.close()

    return follow_up_id

def get_pending_follow_ups():
    """Get all pending follow-ups that are due"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    now = datetime.utcnow().isoformat()

    cursor.execute("""
        SELECT * FROM follow_ups
        WHERE status = 'pending'
        AND next_follow_up_at <= ?
        AND follow_up_count < 3
    """, (now,))

    rows = cursor.fetchall()
    conn.close()

    # Convert to dict
    columns = [
        'id', 'lead_id', 'lead_email', 'lead_name', 'first_email_sent_at',
        'last_email_sent_at', 'follow_up_count', 'status', 'next_follow_up_at',
        'email_subject', 'email_body', 'from_email', 'smtp_password',
        'access_token', 'use_oauth', 'created_at', 'updated_at'
    ]

    return [dict(zip(columns, row)) for row in rows]

def update_follow_up(follow_up_id: int, follow_up_days: int = 3):
    """Update follow-up after sending"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    now = datetime.utcnow().isoformat()
    next_follow_up = (datetime.utcnow() + timedelta(days=follow_up_days)).isoformat()

    cursor.execute("""
        UPDATE follow_ups
        SET last_email_sent_at = ?,
            follow_up_count = follow_up_count + 1,
            next_follow_up_at = ?,
            updated_at = ?
        WHERE id = ?
    """, (now, next_follow_up, now, follow_up_id))

    conn.commit()
    conn.close()

def mark_follow_up_completed(follow_up_id: int):
    """Mark a follow-up as completed"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    now = datetime.utcnow().isoformat()

    cursor.execute("""
        UPDATE follow_ups
        SET status = 'completed',
            updated_at = ?
        WHERE id = ?
    """, (now, follow_up_id))

    conn.commit()
    conn.close()

def get_follow_ups_by_lead(lead_id: int):
    """Get all follow-ups for a specific lead"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM follow_ups
        WHERE lead_id = ?
        ORDER BY created_at DESC
    """, (lead_id,))

    rows = cursor.fetchall()
    conn.close()

    columns = [
        'id', 'lead_id', 'lead_email', 'lead_name', 'first_email_sent_at',
        'last_email_sent_at', 'follow_up_count', 'status', 'next_follow_up_at',
        'email_subject', 'email_body', 'from_email', 'smtp_password',
        'access_token', 'use_oauth', 'created_at', 'updated_at'
    ]

    return [dict(zip(columns, row)) for row in rows]

# Initialize database on import
init_db()
