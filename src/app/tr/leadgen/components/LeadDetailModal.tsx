"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Lead = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string;
  status: string;
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
