import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from datetime import datetime
from typing import List, Dict

class EmailScraper:
    def __init__(self):
        self.email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
        self.timeout = 10
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

    async def scrape_website(self, url: str, business_category: str) -> List[Dict]:
        """
        Scrape emails from a website
        """
        scraped_emails = []

        try:
            # Pages to check
            pages_to_check = [
                ('', 'homepage'),
                ('/contact', 'contact page'),
                ('/about', 'about page'),
                ('/contact-us', 'contact page'),
                ('/about-us', 'about page'),
            ]

            for path, source in pages_to_check:
                page_url = urljoin(url, path)
                emails = await self._scrape_page(page_url, source, business_category)
                scraped_emails.extend(emails)

            # Remove duplicates
            unique_emails = self._remove_duplicates(scraped_emails)

            return unique_emails

        except Exception as e:
            print(f"Error scraping {url}: {str(e)}")
            return []

    async def _scrape_page(self, url: str, source: str, category: str) -> List[Dict]:
        """
        Scrape a single page for emails
        """
        try:
            response = requests.get(url, timeout=self.timeout, headers=self.headers)

            if response.status_code != 200:
                return []

            soup = BeautifulSoup(response.text, 'html.parser')

            # Find all emails in the page
            emails = self.email_pattern.findall(response.text)

            # Also check mailto links
            mailto_links = soup.find_all('a', href=re.compile(r'^mailto:'))
            for link in mailto_links:
                email = link['href'].replace('mailto:', '').split('?')[0]
                emails.append(email)

            # Create structured email objects
            scraped_emails = []
            for email in set(emails):  # Remove duplicates
                if self._is_valid_email(email):
                    scraped_emails.append({
                        'email': email.lower(),
                        'source': source,
                        'category': category,
                        'scraped_at': datetime.utcnow().isoformat(),
                        'verified': True
                    })

            return scraped_emails

        except Exception as e:
            print(f"Error scraping page {url}: {str(e)}")
            return []

    def _is_valid_email(self, email: str) -> bool:
        """
        Verify email format and filter out common false positives
        """
        # Exclude common image/script files
        invalid_extensions = ['.png', '.jpg', '.jpeg', '.gif', '.css', '.js', '.svg', '.ico']
        if any(email.lower().endswith(ext) for ext in invalid_extensions):
            return False

        # Exclude placeholder emails
        placeholders = ['example.com', 'yourdomain.com', 'email.com', 'test.com', 'domain.com']
        if any(placeholder in email.lower() for placeholder in placeholders):
            return False

        # Must have @ and .
        if '@' not in email or '.' not in email.split('@')[1]:
            return False

        return True

    def _remove_duplicates(self, emails: List[Dict]) -> List[Dict]:
        """
        Remove duplicate emails
        """
        seen = set()
        unique = []
        for email_obj in emails:
            email = email_obj['email']
            if email not in seen:
                seen.add(email)
                unique.append(email_obj)
        return unique
