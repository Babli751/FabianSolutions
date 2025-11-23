"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

type LeadDetailModalProps = {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onSendEmail: (leadId: number) => void;
};

export function LeadDetailModal({ lead, isOpen, onClose, onUpdateLead, onSendEmail }: LeadDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState('');

  if (!isOpen || !lead) return null;

  const handleEditStart = () => {
    setEditedLead({ ...lead });
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setEditedLead(null);
    setIsEditing(false);
  };

  const handleEditSave = () => {
    if (editedLead) {
      onUpdateLead(editedLead);
      setIsEditing(false);
      setEditedLead(null);
    }
  };

  const handleInputChange = (field: keyof Lead, value: string) => {
    if (editedLead) {
      setEditedLead({ ...editedLead, [field]: value });
    }
  };

  const currentLead = isEditing ? editedLead : lead;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto modal-content">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b border-slate-700 gap-3 sm:gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Lead Details</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            {!isEditing ? (
              <Button variant="outline" onClick={handleEditStart} className="flex-1 sm:flex-none">
                Edit
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleEditCancel} className="flex-1 sm:flex-none">
                  Cancel
                </Button>
                <Button onClick={handleEditSave} className="flex-1 sm:flex-none">
                  Save
                </Button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-300 text-xl font-bold p-1 ml-2"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Business Name</label>
              {isEditing ? (
                <Input
                  value={currentLead?.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="form-input"
                />
              ) : (
                <p className="text-white py-2">{currentLead?.name}</p>
              )}
            </div>

            <div>
              <label className="form-label">Status</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                currentLead?.status === "email_sent" 
                  ? "status-success" 
                  : "status-info"
              }`}>
                {currentLead?.status === "email_sent" ? "Email Sent" : "New"}
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Email</label>
              {isEditing ? (
                <Input
                  type="email"
                  value={currentLead?.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Email address"
                  className="form-input"
                />
              ) : (
                <div className="py-2">
                  {currentLead?.email ? (
                    <a 
                      href={`mailto:${currentLead.email}`}
                      className="text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      {currentLead.email}
                    </a>
                  ) : (
                    <span className="text-slate-500">No email</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Phone</label>
              {isEditing ? (
                <Input
                  type="tel"
                  value={currentLead?.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Phone number"
                  className="form-input"
                />
              ) : (
                <div className="py-2">
                  {currentLead?.phone ? (
                    <a 
                      href={`tel:${currentLead.phone}`}
                      className="text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      {currentLead.phone}
                    </a>
                  ) : (
                    <span className="text-slate-500">No phone</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="form-label">Website</label>
            {isEditing ? (
              <Input
                type="url"
                value={currentLead?.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="Website address"
                className="form-input"
              />
            ) : (
              <div className="py-2">
                {currentLead?.website ? (
                  <a 
                    href={currentLead.website.startsWith('http') ? currentLead.website : `https://${currentLead.website}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    {currentLead.website}
                  </a>
                ) : (
                  <span className="text-slate-500">No website</span>
                )}
              </div>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="form-label">Address</label>
            {isEditing ? (
              <textarea
                value={currentLead?.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="form-input resize-none"
                rows={3}
                placeholder="Address information"
              />
            ) : (
              <p className="text-slate-300 py-2 bg-slate-700 px-3 rounded border border-slate-600">
                {currentLead?.address || 'No address information'}
              </p>
            )}
          </div>

          {/* Business Category */}
          {currentLead?.businessCategory && (
            <div>
              <label className="form-label">Business Category</label>
              <div className="py-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {currentLead.businessCategory}
                </span>
              </div>
            </div>
          )}

          {/* Scraped Emails from Website */}
          {currentLead?.scrapedEmails && currentLead.scrapedEmails.length > 0 && (
            <div>
              <label className="form-label">
                Emails Found on Website
                <span className="ml-2 text-sm font-normal text-slate-400">
                  ({currentLead.scrapedEmails.length} emails)
                </span>
              </label>
              <div className="py-2 space-y-3">
                {currentLead.scrapedEmails.map((scrapedEmail, index) => (
                  <div key={index} className="bg-slate-700 px-4 py-3 rounded-lg border border-slate-600">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        {/* Email Address */}
                        <div className="flex items-center gap-2">
                          <svg className={`w-4 h-4 flex-shrink-0 ${scrapedEmail.verified ? 'text-green-400' : 'text-yellow-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <a
                            href={`mailto:${scrapedEmail.email}`}
                            className="text-blue-400 hover:text-blue-300 hover:underline font-medium break-all"
                          >
                            {scrapedEmail.email}
                          </a>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {/* Source */}
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-600/50 text-slate-300 rounded">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Source: {scrapedEmail.source}
                          </span>

                          {/* Category */}
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {scrapedEmail.category}
                          </span>

                          {/* Verified Status */}
                          {scrapedEmail.verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded border border-green-500/30">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Verified
                            </span>
                          )}

                          {/* Date */}
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-600/50 text-slate-400 rounded">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(scrapedEmail.scrapedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Google Maps Link */}
          {currentLead?.googleMapsUrl && (
            <div>
              <label className="form-label">Google Maps</label>
              <div className="py-2">
                <a
                  href={currentLead.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  View on Google Maps
                </a>
              </div>
            </div>
          )}

          {/* Notes Section */}
          <div>
            <label className="form-label">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input resize-none"
              rows={4}
              placeholder="Write your notes about this lead here..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-700">
            <Button
              onClick={() => onSendEmail(lead.id)}
              disabled={!currentLead?.email || currentLead?.status === 'email_sent'}
              className="w-full"
            >
              {currentLead?.status === 'email_sent' ? 'Email Sent' : 'Send Email'}
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentLead?.website && (
                <Button
                  variant="outline"
                  onClick={() => window.open(
                    currentLead.website?.startsWith('http') ? currentLead.website : `https://${currentLead.website}`,
                    '_blank'
                  )}
                >
                  Visit Website
                </Button>
              )}

              {currentLead?.phone && (
                <Button
                  variant="outline"
                  onClick={() => window.open(`tel:${currentLead.phone}`, '_self')}
                >
                  Call
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
