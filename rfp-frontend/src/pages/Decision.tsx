/**
 * Final Decision Screen (Decision.tsx)
 * Purpose: Lock final vendor decision
 * 
 * Sections:
 * - Selected vendor
 * - AI justification summary
 * - "Mark RFP as Awarded" button
 * - Status update
 */

import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trophy, 
  CheckCircle, 
  Sparkles, 
  Award,
  Building2,
  DollarSign,
  Truck,
  Shield,
  AlertCircle
} from 'lucide-react';
import { mockRFPs, mockProposals, mockVendors } from '@/data/mockData';

const Decision = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isAwarding, setIsAwarding] = useState(false);
  const [isAwarded, setIsAwarded] = useState(false);
  
  const rfp = mockRFPs.find(r => r.id === id) || mockRFPs[0];
  const proposals = mockProposals.filter(p => 
    (p.rfpId === id || p.rfpId === 'rfp-001') && p.status === 'parsed'
  );
  
  // Select the recommended vendor (lowest cost)
  const selectedProposal = [...proposals].sort((a, b) => (a.totalCost || 0) - (b.totalCost || 0))[0];
  const selectedVendor = mockVendors.find(v => v.id === selectedProposal?.vendorId);

  const handleAward = async () => {
    setIsAwarding(true);
    
    // TODO: API call to update RFP status and notify vendor
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsAwarding(false);
    setIsAwarded(true);
  };

  if (!selectedProposal || !selectedVendor) {
    return (
      <div className="page-container">
        <div className="card-elevated p-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">No proposals to evaluate</h2>
          <p className="text-muted-foreground mb-4">Compare proposals first before making a decision.</p>
          <Link
            to={`/rfp/${id}/proposals`}
            className="text-primary hover:underline"
          >
            View Proposals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      {/* Back button and header */}
      <div className="mb-6">
        <Link
          to={`/rfp/${id}/compare`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Comparison
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-status-awarded/20 flex items-center justify-center">
            <Award className="h-6 w-6 text-status-awarded" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Final Decision</h1>
            <p className="text-muted-foreground">{rfp.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Success State */}
        {isAwarded ? (
          <div className="card-elevated p-8 text-center animate-fade-in">
            <div className="h-16 w-16 rounded-full bg-status-awarded/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-status-awarded" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">RFP Awarded!</h2>
            <p className="text-muted-foreground mb-6">
              {selectedVendor.name} has been selected and notified.
            </p>
            <Link
              to={`/rfp/${id}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              View RFP Details
            </Link>
          </div>
        ) : (
          <>
            {/* Selected Vendor Card */}
            <div className="card-elevated p-6 mb-6 border-2 border-status-awarded/30">
              <div className="flex items-center gap-2 text-status-awarded mb-4">
                <Trophy className="h-5 w-5" />
                <span className="text-sm font-medium">Selected Vendor</span>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{selectedVendor.name}</h2>
                  <p className="text-muted-foreground">{selectedVendor.category}</p>
                </div>
              </div>

              {/* Proposal Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/50">
                <div className="text-center">
                  <DollarSign className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Total Cost</p>
                  <p className="font-semibold text-foreground">
                    ${selectedProposal.totalCost?.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <Truck className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Delivery</p>
                  <p className="font-semibold text-foreground">{selectedProposal.deliveryDays} days</p>
                </div>
                <div className="text-center">
                  <Shield className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Warranty</p>
                  <p className="font-semibold text-foreground">{selectedProposal.warrantyMonths} mo</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Compliance</p>
                  <p className="font-semibold text-status-awarded">{selectedProposal.complianceScore}%</p>
                </div>
              </div>
            </div>

            {/* AI Justification */}
            <div className="card-elevated p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-accent" />
                <h3 className="font-semibold text-foreground">AI Justification</h3>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">
                  Based on comprehensive analysis of all received proposals, <strong className="text-foreground">{selectedVendor.name}</strong> is 
                  the recommended choice for the following reasons:
                </p>
                
                <ul className="mt-4 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-status-awarded flex-shrink-0 mt-1" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Best Value:</strong> Offers the most competitive pricing 
                      at ${selectedProposal.totalCost?.toLocaleString()}, representing potential savings compared to other bids.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-status-awarded flex-shrink-0 mt-1" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">High Compliance:</strong> Achieved a {selectedProposal.complianceScore}% 
                      compliance score, meeting all mandatory requirements specified in the RFP.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-status-awarded flex-shrink-0 mt-1" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Reliable Delivery:</strong> Committed to {selectedProposal.deliveryDays}-day 
                      delivery timeline, meeting the project deadline requirements.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-status-awarded flex-shrink-0 mt-1" />
                    <span className="text-muted-foreground">
                      <strong className="text-foreground">Extended Warranty:</strong> Includes {selectedProposal.warrantyMonths}-month 
                      warranty coverage, providing long-term value and risk mitigation.
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Award Button */}
            <button
              onClick={handleAward}
              disabled={isAwarding}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-status-awarded text-status-awarded-foreground font-semibold rounded-xl hover:bg-status-awarded/90 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isAwarding ? (
                <>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-status-awarded-foreground animate-pulse-soft" />
                    <span className="w-2 h-2 rounded-full bg-status-awarded-foreground animate-pulse-soft" style={{ animationDelay: '0.2s' }} />
                    <span className="w-2 h-2 rounded-full bg-status-awarded-foreground animate-pulse-soft" style={{ animationDelay: '0.4s' }} />
                  </div>
                  Awarding RFP...
                </>
              ) : (
                <>
                  <Award className="h-5 w-5" />
                  Mark RFP as Awarded
                </>
              )}
            </button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              This will notify {selectedVendor.name} and update the RFP status to "Awarded"
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Decision;
