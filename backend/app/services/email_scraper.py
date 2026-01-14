import re
import httpx
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
        Scrape emails from a website by checking homepage and common contact/about pages
        """
        scraped_emails = []
        checked_urls = set()

        try:
            async with httpx.AsyncClient(timeout=self.timeout, headers=self.headers, follow_redirects=True) as client:
                # First, scrape the homepage and discover links
                homepage_emails, discovered_links = await self._scrape_page_with_discovery(client, url, 'homepage', business_category)
                scraped_emails.extend(homepage_emails)
                checked_urls.add(url)

                # Common page variations to check
                potential_pages = [
                    # Contact pages
                    '/contact', '/contact-us', '/contactus', '/contact_us',
                    '/get-in-touch', '/reach-us', '/contact.html', '/contact.php',
                    # About pages
                    '/about', '/about-us', '/aboutus', '/about_us',
                    '/about.html', '/about.php',
                    # Other common pages
                    '/support', '/help', '/info', '/team'
                ]

                # Add discovered links from homepage that contain contact/about keywords
                for link in discovered_links:
                    potential_pages.append(link)

                # Check which pages actually exist and scrape them
                for path in potential_pages:
                    try:
                        page_url = urljoin(url, path)

                        # Skip if already checked
                        if page_url in checked_urls:
                            continue

                        # Quick HEAD request to check if page exists (faster than GET)
                        head_response = await client.head(page_url, timeout=3.0)

                        # If page exists (200, 301, 302), scrape it
                        if head_response.status_code in [200, 301, 302]:
                            checked_urls.add(page_url)
                            source = 'contact page' if 'contact' in path.lower() else 'about page' if 'about' in path.lower() else 'info page'
                            emails = await self._scrape_page_with_client(client, page_url, source, business_category)
                            scraped_emails.extend(emails)
                    except:
                        # If HEAD fails, skip this page
                        continue

                # Remove duplicates
                unique_emails = self._remove_duplicates(scraped_emails)
                return unique_emails

        except Exception as e:
            print(f"[Non-fatal] Failed to scrape {url} - continuing with other pages. Error: {str(e)}")
            return []

    async def _scrape_page_with_discovery(self, client: httpx.AsyncClient, url: str, source: str, category: str):
        """
        Scrape a page for emails AND discover contact/about page links
        Returns: (emails, discovered_links)
        """
        try:
            response = await client.get(url, timeout=10.0)

            if response.status_code != 200:
                return [], []

            soup = BeautifulSoup(response.text, 'html.parser')

            # Find all emails in the page
            emails_found = self.email_pattern.findall(response.text)

            # Also check mailto links
            mailto_links = soup.find_all('a', href=re.compile(r'^mailto:'))
            for link in mailto_links:
                email = link['href'].replace('mailto:', '').split('?')[0]
                emails_found.append(email)

            # Discover links that might lead to contact/about pages
            discovered_links = []
            contact_keywords = ['contact', 'about', 'reach', 'touch', 'support', 'help', 'team', 'info']

            all_links = soup.find_all('a', href=True)
            for link in all_links:
                href = link.get('href', '').lower()
                link_text = link.get_text('', strip=True).lower()

                # Check if href or link text contains contact/about keywords
                if any(keyword in href or keyword in link_text for keyword in contact_keywords):
                    # Only add relative or same-domain links
                    if href.startswith('/') or href.startswith('#') or not href.startswith('http'):
                        if not href.startswith('#'):  # Skip anchor links
                            discovered_links.append(link.get('href'))

            # Create structured email objects
            scraped_emails = []
            for email in set(emails_found):  # Remove duplicates
                if self._is_valid_email(email):
                    scraped_emails.append({
                        'email': email.lower(),
                        'source': source,
                        'category': category,
                        'scraped_at': datetime.utcnow().isoformat(),
                        'verified': True
                    })

            return scraped_emails, discovered_links

        except Exception as e:
            print(f"[Non-fatal] Skipping page {url} - {str(e)}")
            return [], []

    async def _scrape_page_with_client(self, client: httpx.AsyncClient, url: str, source: str, category: str) -> List[Dict]:
        """
        Scrape a single page for emails using existing client
        """
        try:
            response = await client.get(url, timeout=10.0)

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
            print(f"[Non-fatal] Skipping page {url} - {str(e)}")
            return []

    async def _scrape_page(self, url: str, source: str, category: str) -> List[Dict]:
        """
        Scrape a single page for emails (wrapper for backward compatibility)
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout, headers=self.headers, follow_redirects=True) as client:
                return await self._scrape_page_with_client(client, url, source, category)
        except Exception as e:
            print(f"[Non-fatal] Skipping page {url} - {str(e)}")
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
