/**
 * Parsed Proposal Detail Screen (ProposalDetail.tsx)
 * Purpose: Show AI-extracted data from vendor response
 * 
 * Sections:
 * - Vendor information
 * - Extracted structured proposal (prices, delivery, warranty)
 * - Collapsible raw email content
 * - "Approve Parsed Data" button
 */

import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  DollarSign, 
  Truck, 
  Shield, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  ThumbsUp
} from 'lucide-react';
import { mockProposals, mockVendors } from '@/data/mockData';
import StatusBadge from '@/components/ui/StatusBadge';

const ProposalDetail = () => {
  const { id: rfpId, proposalId } = useParams<{ id: string; proposalId: string }>();
  const navigate = useNavigate();
  const [showRawContent, setShowRawContent] = useState(false);
  
  const proposal = mockProposals.find(p => p.id === proposalId) || mockProposals[0];
  const vendor = mockVendors.find(v => v.id === proposal.vendorId) || mockVendors[0];

  const handleApprove = () => {
    // TODO: API call to approve parsed data
    alert('Proposal data approved!');
    navigate(`/rfp/${rfpId}/proposals`);
  };

  const confidenceColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 90) return 'text-status-awarded';
    if (score >= 70) return 'text-status-draft-foreground';
    return 'text-status-responses';
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Back button and header */}
      <div className="mb-6">
        <Link
          to={`/rfp/${rfpId}/proposals`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Proposals
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{proposal.vendorName}</h1>
              <div className="flex items-center gap-3 mt-1">
                <StatusBadge status={proposal.status} />
                <span className="text-sm text-muted-foreground">Submitted {proposal.submittedAt}</span>
              </div>
            </div>
          </div>
          
          {proposal.status === 'parsed' && (
            <button
              onClick={handleApprove}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-status-awarded text-status-awarded-foreground text-sm font-medium rounded-lg hover:bg-status-awarded/90 transition-all"
            >
              <ThumbsUp className="h-4 w-4" />
              Approve Parsed Data
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Extracted Data */}
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-foreground">AI-Extracted Proposal Data</h2>
              {proposal.complianceScore && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Compliance:</span>
                  <span className={`font-semibold ${confidenceColor(proposal.complianceScore)}`}>
                    {proposal.complianceScore}%
                  </span>
                </div>
              )}
            </div>

            {/* Key Metrics */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Cost</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${proposal.totalCost?.toLocaleString() || 'N/A'}
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Delivery</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {proposal.deliveryDays || 'N/A'} days
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Warranty</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {proposal.warrantyMonths || 'N/A'} months
                </p>
              </div>
            </div>

            {/* Line Items */}
            {proposal.items && proposal.items.length > 0 && (
              <div>
                <h3 className="font-medium text-foreground mb-3">Line Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="table-header pb-3 text-left">Item</th>
                        <th className="table-header pb-3 text-right">Unit Price</th>
                        <th className="table-header pb-3 text-right">Qty</th>
                        <th className="table-header pb-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {proposal.items.map((item, i) => (
                        <tr key={i}>
                          <td className="py-3 text-sm font-medium text-foreground">{item.name}</td>
                          <td className="py-3 text-sm text-muted-foreground text-right">
                            ${item.unitPrice.toLocaleString()}
                          </td>
                          <td className="py-3 text-sm text-muted-foreground text-right">{item.quantity}</td>
                          <td className="py-3 text-sm font-medium text-foreground text-right">
                            ${item.totalPrice.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border">
                        <td colSpan={3} className="py-3 text-sm font-semibold text-foreground text-right">
                          Total:
                        </td>
                        <td className="py-3 text-lg font-bold text-accent text-right">
                          ${proposal.totalCost?.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Confidence warnings */}
            {proposal.status === 'needs-review' && (
              <div className="mt-6 p-4 rounded-lg bg-status-responses/10 border border-status-responses/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-status-responses flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Manual Review Required</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Some fields have low AI confidence scores. Please verify the extracted data before approving.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Raw Email Content (Collapsible) */}
          {proposal.rawContent && (
            <div className="card-elevated overflow-hidden">
              <button
                onClick={() => setShowRawContent(!showRawContent)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <span className="font-medium text-foreground">Raw Email Content</span>
                {showRawContent ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              
              {showRawContent && (
                <div className="px-4 pb-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
                      {proposal.rawContent}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Vendor Info */}
        <div className="space-y-6">
          <div className="card-elevated p-6">
            <h2 className="font-semibold text-foreground mb-4">Vendor Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {vendor.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{vendor.name}</p>
                  <p className="text-sm text-muted-foreground">{vendor.category}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{vendor.email}</span>
                </div>
                {vendor.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{vendor.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card-elevated p-6">
            <h2 className="font-semibold text-foreground mb-4">Actions</h2>
            <div className="space-y-3">
              <Link
                to={`/rfp/${rfpId}/compare`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Compare with Others
              </Link>
              
              {proposal.status === 'needs-review' && (
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors">
                  <CheckCircle className="h-4 w-4" />
                  Mark as Reviewed
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetail;
