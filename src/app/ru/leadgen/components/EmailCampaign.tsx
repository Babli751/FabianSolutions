"use client";
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const campaignSchema = z.object({
  name: z.string().min(2, "Campaign name must be at least 2 characters"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  body: z.string().min(20, "Email body must be at least 20 characters"),
  sender_email: z.string().email("Invalid email address"),
  delay_between_emails: z.number().min(1).max(60),
  max_emails_per_hour: z.number().min(1).max(100),
});

type Campaign = {
  id: number;
  name: string;
  subject: string;
  body: string;
  sender_email: string;
  status: string;
  delay_between_emails: number;
  max_emails_per_hour: number;
  created_at: string;
};

type EmailSent = {
  id: number;
  campaign_id: number;
  lead_id: number;
  recipient_email: string;
  subject: string;
  body: string;
  status: string;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
};

interface EmailCampaignProps {
  selectedLeads: number[];
  onCampaignCreated?: (campaignId: number) => void;
}

export function EmailCampaign({ selectedLeads, onCampaignCreated }: EmailCampaignProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [emailsSent, setEmailsSent] = useState<EmailSent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  // const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: '',
      subject: '',
      body: '',
      sender_email: '',
      delay_between_emails: 5,
      max_emails_per_hour: 20,
    },
  });

  useEffect(() => {
    fetchCampaigns();
    fetchEmailsSent();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/campaigns`);
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchEmailsSent = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/emails-sent`);
      if (response.ok) {
        const data = await response.json();
        setEmailsSent(data.emails_sent || []);
      }
    } catch (error) {
      console.error('Error fetching emails sent:', error);
    }
  };

  const onSubmit = async (data: z.infer<typeof campaignSchema>) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create campaign');
      }

      const campaign = await response.json();
      setCampaigns(prev => [...prev, campaign]);
      reset();
      
      if (onCampaignCreated) {
        onCampaignCreated(campaign.id);
      }
      
      alert('Campaign created successfully!');
    } catch (error) {
      alert('Error creating campaign');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startCampaign = async (campaignId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/campaigns/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaign_id: campaignId }),
      });

      if (!response.ok) {
        throw new Error('Failed to start campaign');
      }

      setCampaigns(prev => prev.map(campaign =>
        campaign.id === campaignId ? { ...campaign, status: 'running' } : campaign
      ));
      
      alert('Campaign started successfully!');
    } catch (error) {
      alert('Error starting campaign');
      console.error('Error:', error);
    }
  };

  const stopCampaign = async (campaignId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/campaigns/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaign_id: campaignId }),
      });

      if (!response.ok) {
        throw new Error('Failed to stop campaign');
      }

      setCampaigns(prev => prev.map(campaign =>
        campaign.id === campaignId ? { ...campaign, status: 'paused' } : campaign
      ));
      
      alert('Campaign stopped successfully!');
    } catch (error) {
      alert('Error stopping campaign');
      console.error('Error:', error);
    }
  };

  const sendCampaignToLeads = async (campaignId: number) => {
    if (selectedLeads.length === 0) {
      alert('Please select leads first');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/send-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead_ids: selectedLeads,
          campaign_id: campaignId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to queue emails');
      }

      const result = await response.json();
      alert(`Email campaign queued for ${result.total_leads} leads`);
      
      // Refresh emails sent
      fetchEmailsSent();
    } catch (error) {
      alert('Error queuing emails');
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'status-success';
      case 'paused': return 'status-warning';
      case 'completed': return 'status-info';
      case 'draft': return 'bg-slate-100 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getEmailStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'status-success';
      case 'failed': return 'status-error';
      case 'pending': return 'status-warning';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-xl font-semibold text-white">Email Campaign Management</h3>
      </div>
      <div className="card-body">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Create Campaign
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'manage'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Manage Campaigns
          </button>
        </div>

        {activeTab === 'create' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Create Email Campaign</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    Campaign Name
                  </label>
                  <Input
                    placeholder="My Email Campaign"
                    className="form-input"
                    {...register("name")}
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message?.toString()}</p>}
                </div>
                
                <div>
                  <label className="form-label">
                    Sender Email
                  </label>
                  <Input
                    type="email"
                    placeholder="your-email@example.com"
                    className="form-input"
                    {...register("sender_email")}
                  />
                  {errors.sender_email && <p className="text-red-400 text-sm mt-1">{errors.sender_email.message?.toString()}</p>}
                </div>
              </div>

              <div>
                <label className="form-label">
                  Email Subject
                </label>
                <Input
                  placeholder="Business Partnership Opportunity"
                  className="form-input"
                  {...register("subject")}
                />
                {errors.subject && <p className="text-red-400 text-sm mt-1">{errors.subject.message?.toString()}</p>}
              </div>

              <div>
                <label className="form-label">
                  Email Body
                </label>
                <textarea
                  className="form-input resize-none"
                  rows={6}
                  placeholder="Dear [Business Name],&#10;&#10;I hope this email finds you well. I'm reaching out to discuss a potential business partnership...&#10;&#10;Best regards,&#10;[Your Name]"
                  {...register("body")}
                />
                {errors.body && <p className="text-red-400 text-sm mt-1">{errors.body.message?.toString()}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    Delay Between Emails (seconds)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    className="form-input"
                    {...register("delay_between_emails", { valueAsNumber: true })}
                  />
                  {errors.delay_between_emails && <p className="text-red-400 text-sm mt-1">{errors.delay_between_emails.message?.toString()}</p>}
                </div>
                
                <div>
                  <label className="form-label">
                    Max Emails Per Hour
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    className="form-input"
                    {...register("max_emails_per_hour", { valueAsNumber: true })}
                  />
                  {errors.max_emails_per_hour && <p className="text-red-400 text-sm mt-1">{errors.max_emails_per_hour.message?.toString()}</p>}
                </div>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Creating..." : "Create Campaign"}
              </Button>
            </form>
          </div>
        )}

        {activeTab === 'manage' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Manage Campaigns</h3>
            
            {campaigns.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No campaigns created yet.</p>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border border-slate-700 rounded-lg p-4 bg-slate-800">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg text-white">{campaign.name}</h4>
                        <p className="text-slate-400 text-sm">Subject: {campaign.subject}</p>
                        <p className="text-slate-400 text-sm">From: {campaign.sender_email}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-slate-500">Delay:</span> <span className="text-slate-300">{campaign.delay_between_emails}s</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Max/Hour:</span> <span className="text-slate-300">{campaign.max_emails_per_hour}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Created:</span> <span className="text-slate-300">{new Date(campaign.created_at).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Selected Leads:</span> <span className="text-slate-300">{selectedLeads.length}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {campaign.status === 'draft' && (
                        <>
                          <Button
                            onClick={() => sendCampaignToLeads(campaign.id)}
                            disabled={selectedLeads.length === 0}
                          >
                            Queue for Selected Leads
                          </Button>
                          <Button
                            onClick={() => startCampaign(campaign.id)}
                            variant="outline"
                          >
                            Start Campaign
                          </Button>
                        </>
                      )}
                      
                      {campaign.status === 'running' && (
                        <Button
                          onClick={() => stopCampaign(campaign.id)}
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        >
                          Stop Campaign
                        </Button>
                      )}
                      
                      {campaign.status === 'paused' && (
                        <Button
                          onClick={() => startCampaign(campaign.id)}
                          variant="outline"
                        >
                          Resume Campaign
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Email Status */}
            {emailsSent.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4 text-white">Email Status</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Recipient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Sent At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                      {emailsSent.slice(0, 10).map((email) => (
                        <tr key={email.id} className="hover:bg-slate-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {email.recipient_email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmailStatusColor(email.status)}`}>
                              {email.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                            {email.sent_at ? new Date(email.sent_at).toLocaleString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                            {email.error_message || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
