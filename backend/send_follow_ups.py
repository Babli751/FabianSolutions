#!/usr/bin/env python3
"""
Cron job script to send pending follow-up emails
Run this script periodically (e.g., every hour) to check and send follow-ups
"""

import requests
import sys
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

API_URL = "http://localhost:8000/api"

def send_follow_ups():
    """Check and send pending follow-up emails"""
    try:
        logging.info("Checking for pending follow-ups...")

        # Get pending follow-ups
        response = requests.get(f"{API_URL}/pending-follow-ups")
        response.raise_for_status()

        data = response.json()
        pending_count = data.get('count', 0)

        if pending_count == 0:
            logging.info("No pending follow-ups to send")
            return True

        logging.info(f"Found {pending_count} pending follow-ups")

        # Send pending follow-ups
        send_response = requests.post(f"{API_URL}/send-pending-follow-ups")
        send_response.raise_for_status()

        send_data = send_response.json()
        logging.info(f"Follow-ups processing started: {send_data.get('message')}")

        return True

    except requests.exceptions.RequestException as e:
        logging.error(f"Error sending follow-ups: {str(e)}")
        return False
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    logging.info("=== Follow-up Email Cron Job Started ===")
    success = send_follow_ups()
    logging.info("=== Follow-up Email Cron Job Completed ===")

    sys.exit(0 if success else 1)
