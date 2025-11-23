# Scraped Emails API Documentation

## Overview
Bu API, website'lerden scrape edilen emailleri kategorilendirip veritabanına kaydetmek için kullanılır.

## Database Schema

### `scraped_emails` Table

```sql
CREATE TABLE scraped_emails (
    id SERIAL PRIMARY KEY,
    lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,  -- e.g., "contact page", "footer", "about page", "homepage"
    category VARCHAR(100) NOT NULL, -- Business category (e.g., "restaurant", "barber", "plumber")
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE, -- Email format verified
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Indexes for performance
    INDEX idx_lead_id (lead_id),
    INDEX idx_category (category),
    INDEX idx_email (email),
    UNIQUE KEY unique_email_per_lead (lead_id, email)
);
```

### `leads` Table Update

```sql
ALTER TABLE leads
ADD COLUMN business_category VARCHAR(100),
ADD COLUMN google_maps_url TEXT,
ADD INDEX idx_business_category (business_category);
```

## API Endpoints

### 1. Save Scraped Emails

**POST** `/api/scraped-emails`

Scraped emails'leri veritabanına kaydeder.

**Request Body:**
```json
{
  "lead_id": 123,
  "business_category": "restaurant",
  "scraped_emails": [
    {
      "email": "contact@restaurant.com",
      "source": "contact page",
      "verified": true
    },
    {
      "email": "info@restaurant.com",
      "source": "footer",
      "verified": true
    },
    {
      "email": "reservations@restaurant.com",
      "source": "about page",
      "verified": true
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "3 emails saved successfully",
  "data": {
    "lead_id": 123,
    "total_emails": 3,
    "verified_emails": 3,
    "category": "restaurant"
  }
}
```

### 2. Get Scraped Emails by Lead

**GET** `/api/scraped-emails/lead/:lead_id`

Belirli bir lead için tüm scraped emails'leri getirir.

**Response:**
```json
{
  "success": true,
  "data": {
    "lead_id": 123,
    "business_category": "restaurant",
    "total_emails": 3,
    "emails": [
      {
        "id": 1,
        "email": "contact@restaurant.com",
        "source": "contact page",
        "category": "restaurant",
        "scraped_at": "2025-01-22T10:30:00Z",
        "verified": true
      },
      {
        "id": 2,
        "email": "info@restaurant.com",
        "source": "footer",
        "category": "restaurant",
        "scraped_at": "2025-01-22T10:30:00Z",
        "verified": true
      }
    ]
  }
}
```

### 3. Get Emails by Category

**GET** `/api/scraped-emails/category/:category`

Belirli bir kategorideki tüm scraped emails'leri getirir.

**Query Parameters:**
- `page` (optional): Sayfa numarası (default: 1)
- `limit` (optional): Sayfa başına kayıt sayısı (default: 50)
- `verified_only` (optional): Sadece verified emailler (default: false)

**Example:**
```
GET /api/scraped-emails/category/restaurant?page=1&limit=50&verified_only=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "category": "restaurant",
    "total_count": 150,
    "page": 1,
    "limit": 50,
    "emails": [
      {
        "id": 1,
        "lead_id": 123,
        "lead_name": "Best Restaurant",
        "email": "contact@restaurant.com",
        "source": "contact page",
        "category": "restaurant",
        "scraped_at": "2025-01-22T10:30:00Z",
        "verified": true
      }
    ]
  }
}
```

### 4. Search Emails by Category

**POST** `/api/scraped-emails/search`

Kategori bazlı email araması yapar.

**Request Body:**
```json
{
  "categories": ["restaurant", "cafe", "bar"],
  "verified_only": true,
  "sources": ["contact page", "footer"],
  "date_from": "2025-01-01",
  "date_to": "2025-01-31",
  "limit": 100
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_count": 245,
    "emails": [
      {
        "id": 1,
        "lead_id": 123,
        "lead_name": "Best Restaurant",
        "email": "contact@restaurant.com",
        "source": "contact page",
        "category": "restaurant",
        "scraped_at": "2025-01-22T10:30:00Z",
        "verified": true
      }
    ],
    "grouped_by_category": {
      "restaurant": 120,
      "cafe": 80,
      "bar": 45
    }
  }
}
```

### 5. Update Lead's Business Category

**PATCH** `/api/leads/:lead_id/category`

Lead'in business kategorisini günceller.

**Request Body:**
```json
{
  "business_category": "restaurant"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Business category updated successfully",
  "data": {
    "lead_id": 123,
    "business_category": "restaurant"
  }
}
```

## Email Scraping Implementation

### Python Example (Backend)

```python
import re
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from datetime import datetime

class EmailScraper:
    def __init__(self):
        self.email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')

    def scrape_website(self, url, business_category):
        """
        Scrape emails from a website
        """
        scraped_emails = []

        try:
            # Scrape different pages
            pages_to_check = [
                ('', 'homepage'),
                ('/contact', 'contact page'),
                ('/about', 'about page'),
                ('/contact-us', 'contact page'),
            ]

            for path, source in pages_to_check:
                page_url = urljoin(url, path)
                emails = self._scrape_page(page_url, source, business_category)
                scraped_emails.extend(emails)

            # Remove duplicates
            unique_emails = self._remove_duplicates(scraped_emails)

            return unique_emails

        except Exception as e:
            print(f"Error scraping {url}: {str(e)}")
            return []

    def _scrape_page(self, url, source, category):
        """
        Scrape a single page for emails
        """
        try:
            response = requests.get(url, timeout=10)
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

    def _is_valid_email(self, email):
        """
        Verify email format and filter out common false positives
        """
        # Exclude common image/script files
        invalid_extensions = ['.png', '.jpg', '.jpeg', '.gif', '.css', '.js']
        if any(email.lower().endswith(ext) for ext in invalid_extensions):
            return False

        # Exclude placeholder emails
        placeholders = ['example.com', 'yourdomain.com', 'email.com', 'test.com']
        if any(placeholder in email.lower() for placeholder in placeholders):
            return False

        return True

    def _remove_duplicates(self, emails):
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

# Usage example
async def save_scraped_emails(lead_id: int, website_url: str, business_category: str):
    """
    Scrape emails from a website and save to database
    """
    scraper = EmailScraper()
    scraped_emails = scraper.scrape_website(website_url, business_category)

    if scraped_emails:
        # Save to database
        response = await db.execute("""
            INSERT INTO scraped_emails (lead_id, email, source, category, verified, scraped_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                source = VALUES(source),
                updated_at = CURRENT_TIMESTAMP
        """, [
            (lead_id, email['email'], email['source'], email['category'],
             email['verified'], email['scraped_at'])
            for email in scraped_emails
        ])

        # Update lead's business category
        await db.execute("""
            UPDATE leads
            SET business_category = %s
            WHERE id = %s
        """, (business_category, lead_id))

        return {
            'success': True,
            'total_emails': len(scraped_emails),
            'emails': scraped_emails
        }

    return {'success': False, 'message': 'No emails found'}
```

## Frontend Integration

Frontend'de API'yi kullanmak için mevcut `onSubmit` fonksiyonunu güncelleyin:

```typescript
const onSubmit = async (data: z.infer<typeof searchSchema>) => {
  setIsLoading(true);
  try {
    // 1. Search for leads
    const response = await fetch(`http://localhost:8000/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    // 2. For each lead with website, scrape emails in background
    if (result.leads && result.leads.length > 0) {
      result.leads.forEach(async (lead: Lead) => {
        if (lead.website) {
          try {
            await fetch(`http://localhost:8000/api/scrape-website`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lead_id: lead.id,
                website_url: lead.website,
                business_category: data.query // Use search query as category
              }),
            });
          } catch (error) {
            console.error(`Failed to scrape ${lead.website}:`, error);
          }
        }
      });
    }

    setLeads(result.leads || []);
    alert(`${result.leads?.length || 0} leads found`);
  } catch (error) {
    alert("Error occurred during search");
  } finally {
    setIsLoading(false);
  }
};
```

## Best Practices

1. **Rate Limiting**: Website scraping için rate limiting uygulayın
2. **Caching**: Aynı website'i tekrar scrape etmemek için cache kullanın
3. **Background Jobs**: Email scraping'i background job olarak çalıştırın
4. **Error Handling**: Network hatalarını ve timeout'ları handle edin
5. **Privacy**: GDPR/veri koruma yasalarına uygun hareket edin
6. **Robots.txt**: Website'lerin robots.txt dosyalarına saygı gösterin
