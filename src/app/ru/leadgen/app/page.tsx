"use client";
import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LeadFilters, FilterOptions } from '../components/LeadFilters';
import { LeadDetailModal } from '../components/LeadDetailModal';
import { EmailCampaign } from '../components/EmailCampaign';
import { GoogleOAuthButton } from '@/components/GoogleOAuthButton';
import { usePathname } from 'next/navigation';

// API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Translation object
const translations = {
  en: {
    title: "Lead Generation Tool",
    subtitle: "Discover and connect with potential business partners using our powerful lead generation platform",
    googleMaps: "Google Maps Integration",
    emailCampaigns: "Email Campaigns",
    contactManagement: "Contact Management",
    searchForBusinesses: "Search for Businesses",
    findLeads: "Find potential leads in your target market",
    businessType: "Business Type",
    businessTypePlaceholder: "e.g., barbers, restaurants, plumbers",
    location: "Location",
    locationPlaceholder: "e.g., London, Istanbul",
    maxResults: "Max Results",
    startSearch: "Start Search",
    searching: "Searching...",
    foundLeads: "Found Leads",
    selectLeads: "Select leads to send emails or create campaigns",
    emailCampaign: "Email Campaign",
    hideCampaign: "Hide Campaign",
    sendEmail: "Send Email",
    sending: "Sending...",
    select: "Select",
    name: "Name",
    email: "Email",
    phone: "Phone",
    website: "Website",
    address: "Address",
    googleMapsLink: "Maps",
    status: "Status",
    details: "Details",
    view: "View",
    sent: "Sent",
    new: "New",
    visitSite: "Visit Site",
    viewOnMaps: "View on Maps"
  },
  tr: {
    title: "Potansiyel Müşteri Bulma Aracı",
    subtitle: "Güçlü potansiyel müşteri bulma platformumuzu kullanarak potansiyel iş ortaklarını keşfedin ve bağlantı kurun",
    googleMaps: "Google Haritalar Entegrasyonu",
    emailCampaigns: "E-posta Kampanyaları",
    contactManagement: "İletişim Yönetimi",
    searchForBusinesses: "İşletmeleri Ara",
    findLeads: "Hedef pazarınızda potansiyel müşteriler bulun",
    businessType: "İşletme Türü",
    businessTypePlaceholder: "örn: berberler, restoranlar, tesisatçılar",
    location: "Konum",
    locationPlaceholder: "örn: Londra, İstanbul",
    maxResults: "Maksimum Sonuç",
    startSearch: "Aramayı Başlat",
    searching: "Aranıyor...",
    foundLeads: "Bulunan Müşteriler",
    selectLeads: "E-posta göndermek veya kampanya oluşturmak için müşterileri seçin",
    emailCampaign: "E-posta Kampanyası",
    hideCampaign: "Kampanyayı Gizle",
    sendEmail: "E-posta Gönder",
    sending: "Gönderiliyor...",
    select: "Seç",
    name: "İsim",
    email: "E-posta",
    phone: "Telefon",
    website: "Web Sitesi",
    address: "Adres",
    googleMapsLink: "Harita",
    status: "Durum",
    details: "Detaylar",
    view: "Görüntüle",
    sent: "Gönderildi",
    new: "Yeni",
    visitSite: "Siteyi Ziyaret Et",
    viewOnMaps: "Haritada Görüntüle"
  },
  ru: {
    title: "Инструмент Генерации Лидов",
    subtitle: "Откройте и свяжитесь с потенциальными деловыми партнерами, используя нашу мощную платформу генерации лидов",
    googleMaps: "Интеграция с Google Maps",
    emailCampaigns: "Email Кампании",
    contactManagement: "Управление Контактами",
    searchForBusinesses: "Поиск Бизнесов",
    findLeads: "Найдите потенциальных клиентов на вашем целевом рынке",
    businessType: "Тип Бизнеса",
    businessTypePlaceholder: "напр., парикмахерские, рестораны, сантехники",
    location: "Местоположение",
    locationPlaceholder: "напр., Лондон, Стамбул",
    maxResults: "Максимум Результатов",
    startSearch: "Начать Поиск",
    searching: "Поиск...",
    foundLeads: "Найденные Лиды",
    selectLeads: "Выберите лидов для отправки email или создания кампаний",
    emailCampaign: "Email Кампания",
    hideCampaign: "Скрыть Кампанию",
    sendEmail: "Отправить Email",
    sending: "Отправка...",
    select: "Выбрать",
    name: "Имя",
    email: "Email",
    phone: "Телефон",
    website: "Веб-сайт",
    address: "Адрес",
    googleMapsLink: "Карта",
    status: "Статус",
    details: "Детали",
    view: "Просмотр",
    sent: "Отправлено",
    new: "Новый",
    visitSite: "Посетить Сайт",
    viewOnMaps: "Посмотреть на Карте"
  }
};

const searchSchema = z.object({
  query: z.string().min(2, "Minimum 2 characters required"),
  location: z.string().min(2, "Minimum 2 characters required"),
  maxResults: z.number().min(5),
});

type ScrapedEmail = {
  email: string;
  source: string; // Where it was found (e.g., "contact page", "footer", "about page")
  category: string; // Business category (e.g., "restaurant", "barber", "plumber")
  scrapedAt: string; // When it was scraped
  verified: boolean; // Email format verified
};

type Lead = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string;
  status: string;
  googleMapsUrl: string | null;
  scrapedEmails: ScrapedEmail[] | null; // Now contains detailed email info
  businessCategory: string | null; // Main business category
};

export default function LeadGenerationAppPage() {
  const pathname = usePathname();
  const pathLocale = pathname.split("/")[1] || "en";
  const t = translations[pathLocale as keyof typeof translations] || translations.en;

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState({ sent: 0, total: 0 });
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    hasEmail: false,
    hasPhone: false,
    hasWebsite: false,
    statusFilter: 'all',
    searchTerm: ''
  });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showEmailCampaign, setShowEmailCampaign] = useState(false);

  // Search Progress State
  const [searchProgress, setSearchProgress] = useState({ current: 0, total: 0, message: '' });

  // Email Configuration State - Multiple Email Accounts
  type EmailAccount = {
    id: number;
    email: string;
    password: string;
    smtp: string;
    port: string;
  };

  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [currentEmail, setCurrentEmail] = useState({ email: '', password: '', smtp: 'smtp.gmail.com', port: '587' });
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailDescription, setEmailDescription] = useState('');
  const [isAIImproving, setIsAIImproving] = useState(false);
  const [emailLimits, setEmailLimits] = useState<any>(null);

  // Step Management
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: '',
      location: '',
      maxResults: 20,
    },
  });

  // Check for OAuth callback token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      // Save token to localStorage
      localStorage.setItem('session_token', token);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      // Check if token already exists in localStorage
      const existingToken = localStorage.getItem('session_token');
    }
  }, []);

  const onSubmit = async (data: z.infer<typeof searchSchema>) => {
    setIsLoading(true);
    setSearchProgress({ current: 0, total: data.maxResults, message: 'Starting search...' });

    let pollingInterval: NodeJS.Timeout | null = null;

    try {
      // Generate search ID on client side
      const searchId = `search_${Date.now()}`;

      // Start polling immediately before making the request
      pollingInterval = setInterval(async () => {
        try {
          const progressResponse = await fetch(`${API_URL}/api/search-progress/${searchId}`);
          if (progressResponse.ok) {
            const progress = await progressResponse.json();
            setSearchProgress({
              current: progress.current || 0,
              total: progress.total || data.maxResults,
              message: progress.message || 'Searching...'
            });

            // Update leads incrementally as they're found
            if (progress.leads && progress.leads.length > 0) {
              setLeads(progress.leads);
            }
          }
        } catch {
          // Ignore polling errors
        }
      }, 500);

      // Start the actual search request with our search ID
      const responsePromise = fetch(`${API_URL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, search_id: searchId }),
      });

      const response = await responsePromise;

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const result = await response.json();

      // Clear polling interval
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }

      // Update with final results (might include partial results if success=false)
      if (result.leads && result.leads.length > 0) {
        setLeads(result.leads);
      }
      setSelectedLeads([]);

      // Show appropriate message based on success status
      const message = result.success
        ? `Found ${result.total || 0} businesses`
        : `Partial results: ${result.total || 0} businesses found (${result.message || 'Search incomplete'})`;

      setSearchProgress({ current: result.total || 0, total: result.total || 0, message });

      // Alert if partial results
      if (!result.success && result.total > 0) {
        alert(`Search completed partially: Found ${result.total} businesses but encountered an error. Results are still usable.`);
      }
    } catch (error) {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }

      // Don't clear leads - keep any that were found during polling
      console.error('Error:', error);
      const currentLeadCount = leads.length;

      if (currentLeadCount > 0) {
        alert(`Error occurred during search, but ${currentLeadCount} businesses were found before the error. You can still use these results.`);
        setSearchProgress({ current: currentLeadCount, total: currentLeadCount, message: `Partial: ${currentLeadCount} businesses found before error` });
      } else {
        alert("Error occurred during search");
        setSearchProgress({ current: 0, total: 0, message: 'Search failed' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const pollSearchProgress = async (searchId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/api/search-progress/${searchId}`);
        if (response.ok) {
          const progress = await response.json();
          setSearchProgress({
            current: progress.current || 0,
            total: progress.total || 0,
            message: progress.message || ''
          });

          if (progress.status === 'completed' || progress.status === 'failed') {
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error('Error polling progress:', error);
      }
    }, 500); // Poll every 500ms

    // Clean up after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  const handleSelectLead = (leadId: number) => {
    setSelectedLeads(prev =>
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      // Deselect all
      setSelectedLeads([]);
    } else {
      // Select all filtered leads
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  const handleUpdateLead = (updatedLead: Lead) => {
    setLeads(prev => prev.map(lead =>
      lead.id === updatedLead.id ? updatedLead : lead
    ));
    setSelectedLead(updatedLead);
  };

  const handleSendSingleEmail = async (leadId: number) => {
    const leadToSend = leads.find(lead => lead.id === leadId);
    if (!leadToSend?.email) {
      alert("This lead doesn't have an email address");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/send-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead_ids: [leadId],
          subject: "Business Partnership Proposal",
          body: `Hello,\n\nWe would like to discuss a potential business partnership with you.\n\nBest regards,\n[Your Company Name]`,
          sender_email: "your-email@example.com",
        }),
      });

      if (!response.ok) {
        throw new Error('Email sending failed');
      }

      const result = await response.json();
      alert(result.message || "Email sent successfully");

      // Durumu güncelle
      setLeads(prev => prev.map(lead =>
        lead.id === leadId ? { ...lead, status: "email_sent" } : lead
      ));

      // Update lead in modal
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => prev ? { ...prev, status: "email_sent" } : null);
      }
    } catch (error) {
      alert("Error occurred while sending email");
      console.error('Error:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Filtered leads based on filter criteria
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          lead.name.toLowerCase().includes(searchLower) ||
          (lead.email && lead.email.toLowerCase().includes(searchLower)) ||
          (lead.phone && lead.phone.includes(filters.searchTerm)) ||
          lead.address.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Contact info filters
      if (filters.hasEmail && !lead.email) return false;
      if (filters.hasPhone && !lead.phone) return false;
      if (filters.hasWebsite && !lead.website) return false;

      // Status filter
      if (filters.statusFilter !== 'all') {
        if (filters.statusFilter === 'new' && lead.status !== 'new') return false;
        if (filters.statusFilter === 'email_sent' && lead.status !== 'email_sent') return false;
      }

      return true;
    });
  }, [leads, filters]);

  const handleRemoveEmail = (id: number) => {
    setEmailAccounts(prev => prev.filter(acc => acc.id !== id));
  };

  const handleAddEmail = () => {
    if (!currentEmail.email || !currentEmail.password || !currentEmail.smtp || !currentEmail.port) {
      alert("Please fill all SMTP fields");
      return;
    }

    const newAccount: EmailAccount = {
      id: Date.now(),
      email: currentEmail.email,
      password: currentEmail.password,
      smtp: currentEmail.smtp,
      port: currentEmail.port
    };

    setEmailAccounts(prev => [...prev, newAccount]);
    setCurrentEmail({ email: '', password: '', smtp: 'smtp.gmail.com', port: '587' });
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      alert("Please enter a test email address");
      return;
    }

    setIsSendingTest(true);
    try {
      // First, check if OAuth is connected
      const oauthStatusResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/oauth/status`);
      const oauthStatus = await oauthStatusResponse.json();

      if (oauthStatus.connected && oauthStatus.accounts.length > 0) {
        // Use OAuth to send test email
        const fromEmail = oauthStatus.accounts[0].email;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/oauth/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from_email: fromEmail,
            to_email: testEmail,
            subject: "Test Email from Lead Generation App",
            body: "This is a test email sent via Google OAuth. Your Gmail connection is working!"
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert(`✅ Test email sent successfully to ${testEmail} from ${fromEmail}!`);
          setTestEmail('');
        } else {
          alert(`Failed to send test email: ${data.detail || 'Unknown error'}`);
        }
      } else {
        // Fall back to SMTP method
        if (!currentEmail.email || !currentEmail.password || !currentEmail.smtp || !currentEmail.port) {
          alert("Please either connect your Gmail with OAuth or fill all SMTP configuration fields");
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/send-test-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            smtp_config: {
              email: currentEmail.email,
              password: currentEmail.password,
              smtp_server: currentEmail.smtp,
              port: parseInt(currentEmail.port)
            },
            test_email: testEmail
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert(`Test email sent successfully to ${testEmail}!`);
          setTestEmail('');
        } else {
          alert(`Failed to send test email: ${data.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      alert(`Error sending test email: ${error}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleNextStep = async () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fetch email limits for all accounts
    await fetchEmailLimits();
  };

  const fetchEmailLimits = async () => {
    try {
      const allEmails = emailAccounts.map(acc => acc.email);

      // Also check OAuth accounts
      const oauthStatusResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/oauth/status`);
      const oauthStatus = await oauthStatusResponse.json();

      if (oauthStatus.connected && oauthStatus.accounts.length > 0) {
        oauthStatus.accounts.forEach((acc: any) => {
          if (!allEmails.includes(acc.email)) {
            allEmails.push(acc.email);
          }
        });
      }

      if (allEmails.length === 0) {
        setEmailLimits(null);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/email-limits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_addresses: allEmails
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEmailLimits(data);
      }
    } catch (error) {
      console.error('Error fetching email limits:', error);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAIImprove = async () => {
    if (!emailDescription.trim() && !emailSubject.trim()) {
      alert("Please enter a subject and/or description first");
      return;
    }

    setIsAIImproving(true);
    try {
      // Check OAuth accounts first, then fall back to SMTP
      const oauthStatusResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/oauth/status`);
      const oauthStatus = await oauthStatusResponse.json();

      let senderEmail = null;
      if (oauthStatus.connected && oauthStatus.accounts.length > 0) {
        senderEmail = oauthStatus.accounts[0].email;
      } else if (emailAccounts.length > 0) {
        senderEmail = emailAccounts[0].email;
      } else if (currentEmail.email) {
        senderEmail = currentEmail.email;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ai-improve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: emailDescription,
          subject: emailSubject || null,  // Include subject if provided
          sender_email: senderEmail,
        }),
      });

      if (!response.ok) {
        throw new Error('AI improvement failed');
      }

      const result = await response.json();

      // Update both subject and body if both were improved
      if (result.improved_subject) {
        setEmailSubject(result.improved_subject);
      }
      setEmailDescription(result.improved_text);

      alert("Email improved successfully by AI! ✨");
    } catch (error) {
      alert("Error occurred while improving email");
      console.error('Error:', error);
    } finally {
      setIsAIImproving(false);
    }
  };

  const sendEmails = async () => {
    if (selectedLeads.length === 0) {
      alert("Please select at least one lead");
      return;
    }

    // Check for OAuth or SMTP accounts
    const oauthStatusResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/oauth/status`);
    const oauthStatus = await oauthStatusResponse.json();

    const hasOAuth = oauthStatus.connected && oauthStatus.accounts.length > 0;
    const hasSMTP = emailAccounts.length > 0;

    if (!hasOAuth && !hasSMTP) {
      alert("Please connect your Gmail with OAuth or add at least one SMTP email account");
      return;
    }

    if (!emailSubject || !emailDescription) {
      alert("Please enter email subject and description");
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsSending(true);
    setSendingProgress({ sent: 0, total: selectedLeads.length });

    try {
      // If OAuth is available, use it; otherwise use SMTP
      if (hasOAuth) {
        // Send via OAuth for each lead
        let sent = 0;
        let failed = 0;
        const fromEmail = oauthStatus.accounts[0].email;

        for (const leadId of selectedLeads) {
          const lead = leads.find(l => l.id === leadId);
          if (!lead || !lead.email) {
            failed++;
            continue;
          }

          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/oauth/send-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from_email: fromEmail,
                to_email: lead.email,
                subject: emailSubject,
                body: emailDescription
              }),
              signal: controller.signal,
            });

            if (response.ok) {
              sent++;
              setSendingProgress({ sent, total: selectedLeads.length });
              // Add delay between emails (2-3 minutes)
              if (sent < selectedLeads.length) {
                const delay = Math.random() * 60000 + 120000; // 2-3 minutes in ms
                await new Promise(resolve => setTimeout(resolve, delay));
              }
            } else {
              failed++;
            }
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              throw error;
            }
            failed++;
          }
        }

        alert(`Emails sent: ${sent}, Failed: ${failed}`);
        // Update statuses
        setLeads(prev => prev.map(lead =>
          selectedLeads.includes(lead.id) && lead.email ? { ...lead, status: "email_sent" } : lead
        ));
        setSendingProgress({ sent, total: selectedLeads.length });
      } else {
        // Use SMTP method
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/send-emails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lead_ids: selectedLeads,
            subject: emailSubject,
            body: emailDescription,
            email_accounts: emailAccounts.map(acc => ({
              email: acc.email,
              password: acc.password
            })),
            delay_min: 120.0,  // 2 minutes
            delay_max: 180.0,  // 3 minutes
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Email sending failed');
        }

        const result = await response.json();
        alert(result.message || "Emails sent successfully");

        // Update statuses
        setLeads(prev => prev.map(lead =>
          selectedLeads.includes(lead.id) ? { ...lead, status: "email_sent" } : lead
        ));
        setSendingProgress({ sent: selectedLeads.length, total: selectedLeads.length });
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        alert("Email sending stopped by user");
      } else {
        alert("Error occurred while sending email");
        console.error('Error:', error);
      }
    } finally {
      setIsSending(false);
      setAbortController(null);
    }
  };

  const stopSending = () => {
    if (abortController) {
      abortController.abort();
      setIsSending(false);
      setAbortController(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="hero-gradient hero-pattern relative overflow-hidden" style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-indigo-900/80"></div>
        <div className="relative container mx-auto py-16 px-4 mt-20">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t.subtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>{t.googleMaps}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>{t.emailCampaigns}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                <span>{t.contactManagement}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 -mt-8 relative z-10">

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep === 1 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                1
              </div>
              <span className="hidden sm:block font-semibold">Email Setup</span>
            </div>
            <div className="w-16 h-1 bg-slate-300"></div>
            <div className={`flex items-center gap-2 ${currentStep === 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                2
              </div>
              <span className="hidden sm:block font-semibold">Search & Send</span>
            </div>
          </div>
        </div>

        {/* STEP 1: Email Configuration */}
        {currentStep === 1 && (
          <div className="max-w-3xl mx-auto">
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Email Configuration</h2>
                    <p className="text-sm text-slate-600">Setup your email campaign</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {/* Info Alert */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex gap-2">
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-xs text-blue-800">
                        <p className="font-semibold mb-1">Anti-Ban Protection</p>
                        <p>Email providers limit daily sends and you may get banned. We use multiple strategies:</p>
                        <ul className="list-disc ml-4 mt-1 space-y-0.5">
                          <li>Multiple accounts to distribute emails</li>
                          <li>Random delays (0.5-5 seconds) between emails</li>
                          <li>SMTP protocol - we won&apos;t log into your accounts</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Email Accounts List */}
                  {emailAccounts.length > 0 && (
                    <div className="space-y-2">
                      <label className="form-label">Added Email Accounts ({emailAccounts.length})</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {emailAccounts.map((account) => (
                          <div key={account.id} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700 truncate">{account.email}</p>
                              <p className="text-xs text-slate-500">
                                {account.smtp}:{account.port}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveEmail(account.id)}
                              className="ml-2 text-red-600 hover:text-red-700 flex-shrink-0"
                              title="Remove"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gmail OAuth */}
                  <div className="border-t pt-4">
                    <label className="form-label mb-3 block">Gmail Account (OAuth2 - Recommended)</label>
                    <GoogleOAuthButton />
                  </div>

                  {/* Manual SMTP Configuration */}
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Or use SMTP Configuration:</p>
                    <div className="space-y-3">
                      <div>
                        <label className="form-label text-xs">Gmail Address</label>
                        <Input
                          type="email"
                          placeholder="your.email@gmail.com"
                          className="form-input"
                          value={currentEmail.email}
                          onChange={(e) => setCurrentEmail(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="form-label text-xs">App Password</label>
                        <Input
                          type="password"
                          placeholder="Enter Gmail App Password"
                          className="form-input"
                          value={currentEmail.password}
                          onChange={(e) => setCurrentEmail(prev => ({ ...prev, password: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="form-label text-xs">SMTP Server</label>
                          <Input
                            type="text"
                            placeholder="smtp.gmail.com"
                            className="form-input"
                            value={currentEmail.smtp}
                            onChange={(e) => setCurrentEmail(prev => ({ ...prev, smtp: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="form-label text-xs">Port</label>
                          <Input
                            type="text"
                            placeholder="587"
                            className="form-input"
                            value={currentEmail.port}
                            onChange={(e) => setCurrentEmail(prev => ({ ...prev, port: e.target.value }))}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={handleAddEmail}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5"
                      >
                        Add Email Account
                      </Button>

                      {/* Test Email Section */}
                      <div className="border-t pt-3 mt-3">
                        <label className="form-label text-xs">Test Email Configuration</label>
                        <div className="flex gap-2">
                          <Input
                            type="email"
                            placeholder="Enter test email address"
                            className="form-input flex-1"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                          />
                          <Button
                            type="button"
                            onClick={handleSendTestEmail}
                            disabled={isSendingTest}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 whitespace-nowrap"
                          >
                            {isSendingTest ? 'Sending...' : 'Send Test'}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Send a test email to verify SMTP configuration
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Next Button */}
                  <div className="border-t pt-4">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-lg shadow-lg transition-colors"
                    >
                      <div className="flex items-center gap-2 justify-center">
                        <span>Next: Search for Leads</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Search & Results */}
        {currentStep === 2 && (
          <div>
            {/* Previous Button */}
            <div className="mb-4">
              <Button
                onClick={handlePreviousStep}
                variant="outline"
                className="btn-secondary"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to Email Setup</span>
                </div>
              </Button>
            </div>

            {/* Daily Email Limits Display */}
            {emailLimits && (
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Daily Email Limits (2-3 min delay between emails)
                  </h3>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{emailLimits.total_remaining}</p>
                    <p className="text-xs text-slate-600">emails remaining today</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {emailLimits.limits.map((limit: any) => (
                    <div key={limit.email} className="bg-white rounded-lg p-3 border border-slate-200">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-xs font-medium text-slate-700 truncate flex-1">{limit.email}</p>
                        <span className={`text-xs font-bold ${limit.remaining > 20 ? 'text-green-600' : limit.remaining > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {limit.remaining}/{limit.daily_limit}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${limit.percentage_used < 50 ? 'bg-green-500' : limit.percentage_used < 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${limit.percentage_used}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{limit.sent_today} sent today</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-slate-600 bg-white rounded p-2">
                  <p><strong>💡 Tip:</strong> You can send up to {emailLimits.total_daily_capacity} emails per day total. Add more email accounts to increase capacity!</p>
                </div>
              </div>
            )}

            {/* Search Section */}
            <div className="card mb-8">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{t.searchForBusinesses}</h2>
                    <p className="text-slate-600">{t.findLeads}</p>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="form-label">{t.businessType}</label>
                      <Input
                        placeholder={t.businessTypePlaceholder}
                        className="form-input"
                        {...register("query")}
                      />
                      {errors.query && <p className="text-red-500 text-sm mt-2 font-medium">{errors.query.message?.toString()}</p>}
                    </div>
                    <div>
                      <label className="form-label">{t.location}</label>
                      <Input
                        placeholder={t.locationPlaceholder}
                        className="form-input"
                        {...register("location")}
                      />
                      {errors.location && <p className="text-red-500 text-sm mt-2 font-medium">{errors.location.message?.toString()}</p>}
                    </div>
                    <div>
                      <label className="form-label">{t.maxResults}</label>
                      <Input
                        type="number"
                        placeholder="20"
                        min={5}
                        className="form-input"
                        {...register("maxResults", { valueAsNumber: true })}
                      />
                      {errors.maxResults && <p className="text-red-500 text-sm mt-2 font-medium">{errors.maxResults.message?.toString()}</p>}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Button type="submit" disabled={isLoading} className="btn-primary text-lg px-8 py-4">
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{t.searching}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span>{t.startSearch}</span>
                        </div>
                      )}
                    </Button>
                  </div>

                  {/* Search Progress Bar */}
                  {isLoading && searchProgress.total > 0 && (
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-sm font-medium text-slate-700">
                        <span>{searchProgress.message}</span>
                        <span>{searchProgress.current} / {searchProgress.total}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out rounded-full"
                          style={{ width: `${searchProgress.total > 0 ? (searchProgress.current / searchProgress.total * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Results Section - Only show in Step 2 */}
        {currentStep === 2 && leads.length > 0 && (
          <div className="space-y-6">
            <LeadFilters
              onFiltersChange={setFilters}
              totalCount={leads.length}
              filteredCount={filteredLeads.length}
            />

            <div className="card">
              <div className="card-header">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">
                        {t.foundLeads} ({filteredLeads.length}{filteredLeads.length !== leads.length ? ` / ${leads.length}` : ''})
                      </h2>
                      <p className="text-slate-600 mt-1">{t.selectLeads}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <Button
                      onClick={() => setShowEmailCampaign(!showEmailCampaign)}
                      variant="outline"
                      className="btn-secondary"
                    >
                      {showEmailCampaign ? t.hideCampaign : t.emailCampaign}
                    </Button>
                    {isSending ? (
                      <>
                        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm font-semibold text-blue-800">
                            Sending: {sendingProgress.sent} / {sendingProgress.total}
                          </span>
                        </div>
                        <Button
                          onClick={stopSending}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Stop</span>
                          </div>
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={sendEmails}
                        disabled={selectedLeads.length === 0}
                        className="btn-success"
                      >
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{t.sendEmail} ({selectedLeads.length})</span>
                        </div>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="overflow-x-auto mobile-table-scroll">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200">
                        <TableHead className="w-12 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 font-semibold">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs">{t.select}</span>
                            {selectedLeads.length > 0 && (
                              <button
                                onClick={handleSelectAll}
                                className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors whitespace-nowrap"
                                title={selectedLeads.length === filteredLeads.length ? "Deselect All" : "Select All"}
                              >
                                {selectedLeads.length === filteredLeads.length ? "None" : "All"}
                              </button>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="min-w-[200px] bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 font-semibold">{t.name}</TableHead>
                        <TableHead className="min-w-[180px] bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 font-semibold">{t.email}</TableHead>
                        <TableHead className="min-w-[120px] bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 font-semibold">{t.phone}</TableHead>
                        <TableHead className="min-w-[100px] bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 font-semibold">{t.website}</TableHead>
                        <TableHead className="min-w-[200px] hidden lg:table-cell bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 font-semibold">{t.address}</TableHead>
                        <TableHead className="min-w-[100px] bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 font-semibold">{t.googleMapsLink}</TableHead>
                        <TableHead className="min-w-[100px] bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 font-semibold">{t.status}</TableHead>
                        <TableHead className="w-16 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 font-semibold">{t.details}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead) => (
                        <TableRow key={lead.id} className="border-slate-200 hover:bg-slate-50 transition-colors">
                          <TableCell className="border-slate-200">
                            <input
                              type="checkbox"
                              checked={selectedLeads.includes(lead.id)}
                              onChange={() => handleSelectLead(lead.id)}
                              className="h-4 w-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </TableCell>
                          <TableCell className="font-semibold text-slate-800 border-slate-200">{lead.name}</TableCell>
                          <TableCell className="border-slate-200">
                            {lead.email ? (
                              <a
                                href={`mailto:${lead.email}`}
                                className="text-blue-600 hover:text-blue-700 hover:underline truncate block max-w-[160px] font-medium"
                                title={lead.email}
                              >
                                {lead.email}
                              </a>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="border-slate-200">
                            {lead.phone ? (
                              <a
                                href={`tel:${lead.phone}`}
                                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                              >
                                {lead.phone}
                              </a>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="border-slate-200">
                            {lead.website ? (
                              <a
                                href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                              >
                                {t.visitSite}
                              </a>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell border-slate-200">
                            <span className="truncate block max-w-[180px] text-slate-600" title={lead.address}>
                              {lead.address}
                            </span>
                          </TableCell>
                          <TableCell className="border-slate-200">
                            {lead.googleMapsUrl ? (
                              <a
                                href={lead.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                              >
                                {t.viewOnMaps}
                              </a>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                          <TableCell className="border-slate-200">
                            <span className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap font-semibold ${
                              lead.status === "email_sent"
                                ? "status-success"
                                : "status-info"
                            }`}>
                              {lead.status === "email_sent" ? t.sent : t.new}
                            </span>
                          </TableCell>
                          <TableCell className="border-slate-200">
                            <Button
                              variant="outline"
                              onClick={() => handleLeadClick(lead)}
                              className="px-3 py-1.5 text-xs btn-secondary"
                            >
                              {t.view}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        )}

        {showEmailCampaign && (
          <div className="mt-8">
            <EmailCampaign
              selectedLeads={selectedLeads}
              leads={leads}
              onCampaignCreated={(campaignId) => {
                console.log('Campaign created:', campaignId);
              }}
            />
          </div>
        )}

        <LeadDetailModal
          lead={selectedLead}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedLead(null);
          }}
          onUpdateLead={handleUpdateLead}
          onSendEmail={handleSendSingleEmail}
        />
      </div>
    </div>
  );
}
