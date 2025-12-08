/**
 * Send RFP Confirmation Screen (SendRFP.tsx)
 * Purpose: Review before sending RFP email to vendors
 * 
 * Sections:
 * - RFP summary
 * - Selected vendor list
 * - Email preview (subject + body)
 * - "Send RFP" button
 */

import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Send, Users, FileText, CheckCircle } from 'lucide-react';
import { mockRFPs, mockVendors } from '@/data/mockData';

const SendRFP = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const rfp = mockRFPs.find(r => r.id === id) || mockRFPs[0];
  const selectedVendors = mockVendors.slice(0, Math.max(rfp.vendorCount, 3));

  // AI-generated email template (mock)
  const emailSubject = `Request for Proposal: ${rfp.name}`;
  const emailBody = `Dear Vendor,

We are pleased to invite you to submit a proposal for the following procurement request:

**${rfp.name}**

${rfp.description || 'Please find the detailed requirements attached.'}

**Key Requirements:**
${rfp.items?.map(item => `• ${item.name} (Qty: ${item.quantity})`).join('\n') || '• See attached specifications'}

**Budget:** ${rfp.budget || 'To be discussed'}
**Delivery Timeline:** ${rfp.deliveryTimeline || 'To be discussed'}
**Payment Terms:** ${rfp.paymentTerms || 'Standard terms'}

Please submit your proposal by responding to this email within 14 business days.

We look forward to your response.

Best regards,
Procurement Team`;

  const handleSendRFP = () => {
    // TODO: API call to send RFP emails to all selected vendors
    console.log('Sending RFP to vendors:', selectedVendors.map(v => v.email));
    alert('RFP sent successfully to all vendors!');
    navigate(`/rfp/${id}`);
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Back button and header */}
      <div className="mb-6">
        <Link
          to={`/rfp/${id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to RFP
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Send className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Send RFP to Vendors</h1>
            <p className="text-muted-foreground">Review and confirm before sending</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Email Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* RFP Summary */}
          <div className="card-elevated p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">RFP Summary</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{rfp.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-medium text-foreground">{rfp.budget || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Items</p>
                <p className="font-medium text-foreground">{rfp.items?.length || 0} items</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timeline</p>
                <p className="font-medium text-foreground">{rfp.deliveryTimeline || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Email Preview */}
          <div className="card-elevated overflow-hidden">
            <div className="flex items-center gap-2 px-6 py-4 bg-muted/50 border-b border-border">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Email Preview</h2>
              <span className="ml-auto text-xs text-muted-foreground">AI-Generated</span>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Subject */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Subject</p>
                <div className="px-4 py-3 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground">{emailSubject}</p>
                </div>
              </div>
              
              {/* Body */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Body</p>
                <div className="px-4 py-4 bg-muted/50 rounded-lg">
                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                    {emailBody}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Vendors */}
        <div className="space-y-6">
          {/* Recipients */}
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Recipients</h2>
              </div>
              <span className="text-sm text-muted-foreground">{selectedVendors.length} vendors</span>
            </div>
            
            <div className="space-y-3">
              {selectedVendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="h-8 w-8 rounded-full bg-status-awarded/20 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-status-awarded" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{vendor.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{vendor.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendRFP}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Send className="h-5 w-5" />
            Send RFP to {selectedVendors.length} Vendors
          </button>

          <p className="text-xs text-center text-muted-foreground">
            Vendors will receive an email with the RFP details and can submit their proposals via email reply.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SendRFP;
