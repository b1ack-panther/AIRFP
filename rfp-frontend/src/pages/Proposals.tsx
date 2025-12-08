/**
 * Proposals List Screen (Proposals.tsx)
 * Purpose: Show received vendor responses for an RFP
 * 
 * Features:
 * - List of proposals by vendor
 * - Status: Processing, Parsed, Needs Review
 * - Click proposal → Proposal Detail screen
 */

import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Clock, CheckCircle, AlertTriangle, ChevronRight, DollarSign, Truck, BarChart3 } from 'lucide-react';
import { mockRFPs, mockProposals } from '@/data/mockData';
import StatusBadge from '@/components/ui/StatusBadge';

const Proposals = () => {
  const { id } = useParams<{ id: string }>();
  
  const rfp = mockRFPs.find(r => r.id === id) || mockRFPs[0];
  const proposals = mockProposals.filter(p => p.rfpId === id || p.rfpId === 'rfp-001');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-5 w-5 text-status-draft" />;
      case 'parsed':
        return <CheckCircle className="h-5 w-5 text-status-awarded" />;
      case 'needs-review':
        return <AlertTriangle className="h-5 w-5 text-status-responses" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
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
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-status-responses/20 flex items-center justify-center">
              <FileText className="h-6 w-6 text-status-responses" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Vendor Proposals</h1>
              <p className="text-muted-foreground">{rfp.name}</p>
            </div>
          </div>
          
          {proposals.filter(p => p.status === 'parsed').length >= 2 && (
            <Link
              to={`/rfp/${id}/compare`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground text-sm font-medium rounded-lg hover:bg-accent/90 transition-all"
            >
              <BarChart3 className="h-4 w-4" />
              Compare Proposals
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Responses', value: proposals.length, color: 'text-foreground' },
          { label: 'Parsed', value: proposals.filter(p => p.status === 'parsed').length, color: 'text-status-awarded' },
          { label: 'Needs Review', value: proposals.filter(p => p.status === 'needs-review').length, color: 'text-status-responses' },
        ].map((stat, i) => (
          <div key={i} className="card-elevated p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.map((proposal, index) => (
          <Link
            key={proposal.id}
            to={`/rfp/${id}/proposal/${proposal.id}`}
            className="block card-elevated hover:shadow-lg transition-all"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {getStatusIcon(proposal.status)}
                  <div>
                    <h3 className="font-semibold text-foreground">{proposal.vendorName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Submitted {proposal.submittedAt}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <StatusBadge status={proposal.status} />
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              {/* Parsed data preview */}
              {proposal.status === 'parsed' && proposal.totalCost && (
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total Cost</p>
                      <p className="font-medium text-foreground">
                        ${proposal.totalCost.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Delivery</p>
                      <p className="font-medium text-foreground">{proposal.deliveryDays} days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Warranty</p>
                      <p className="font-medium text-foreground">{proposal.warrantyMonths} months</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Compliance</p>
                      <p className="font-medium text-foreground">{proposal.complianceScore}%</p>
                    </div>
                  </div>
                </div>
              )}

              {proposal.status === 'processing' && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-status-draft animate-pulse-soft" />
                      <span className="w-2 h-2 rounded-full bg-status-draft animate-pulse-soft" style={{ animationDelay: '0.2s' }} />
                      <span className="w-2 h-2 rounded-full bg-status-draft animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
                    </div>
                    AI is parsing this proposal...
                  </div>
                </div>
              )}

              {proposal.status === 'needs-review' && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-status-responses">
                    <AlertTriangle className="h-4 w-4" />
                    Some fields require manual review due to low AI confidence
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {proposals.length === 0 && (
        <div className="card-elevated py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No proposals yet</h3>
          <p className="text-muted-foreground">Vendor responses will appear here once submitted</p>
        </div>
      )}
    </div>
  );
};

export default Proposals;
