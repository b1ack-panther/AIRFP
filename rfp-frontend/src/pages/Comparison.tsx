/**
 * Proposal Comparison Screen (Comparison.tsx)
 * Purpose: Compare vendors and recommend one
 * 
 * Features:
 * - Comparison table (Vendor, Total Cost, Delivery Time, Compliance Score)
 * - AI Recommendation panel with best value vendor and reasons
 */

import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Trophy, TrendingDown, Clock, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { mockRFPs, mockProposals } from '@/data/mockData';

const Comparison = () => {
  const { id } = useParams<{ id: string }>();
  
  const rfp = mockRFPs.find(r => r.id === id) || mockRFPs[0];
  const proposals = mockProposals.filter(p => 
    (p.rfpId === id || p.rfpId === 'rfp-001') && p.status === 'parsed'
  );

  // Mock AI recommendation logic
  const sortedByCost = [...proposals].sort((a, b) => (a.totalCost || 0) - (b.totalCost || 0));
  const recommendedVendor = sortedByCost[0];
  
  const getScoreColor = (score: number | undefined) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 90) return 'text-status-awarded';
    if (score >= 80) return 'text-accent';
    if (score >= 70) return 'text-status-draft-foreground';
    return 'text-status-responses';
  };

  const isLowest = (value: number | undefined, type: 'cost' | 'delivery') => {
    if (!value) return false;
    const values = proposals.map(p => type === 'cost' ? p.totalCost : p.deliveryDays).filter(Boolean);
    return value === Math.min(...(values as number[]));
  };

  const isHighest = (value: number | undefined) => {
    if (!value) return false;
    const values = proposals.map(p => p.complianceScore).filter(Boolean);
    return value === Math.max(...(values as number[]));
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Back button and header */}
      <div className="mb-6">
        <Link
          to={`/rfp/${id}/proposals`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Proposals
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Proposal Comparison</h1>
            <p className="text-muted-foreground">{rfp.name}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Comparison Table */}
        <div className="lg:col-span-2">
          <div className="card-elevated overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="table-header px-6 py-4 text-left">Vendor</th>
                    <th className="table-header px-6 py-4 text-right">Total Cost</th>
                    <th className="table-header px-6 py-4 text-right">Delivery</th>
                    <th className="table-header px-6 py-4 text-right">Warranty</th>
                    <th className="table-header px-6 py-4 text-right">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {proposals.map((proposal) => {
                    const isRecommended = proposal.id === recommendedVendor?.id;
                    return (
                      <tr 
                        key={proposal.id} 
                        className={`hover:bg-muted/30 transition-colors ${
                          isRecommended ? 'bg-accent/5' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {isRecommended && (
                              <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center">
                                <Trophy className="h-3.5 w-3.5 text-accent-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-foreground">{proposal.vendorName}</p>
                              {isRecommended && (
                                <p className="text-xs text-accent">Recommended</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isLowest(proposal.totalCost, 'cost') && (
                              <TrendingDown className="h-4 w-4 text-status-awarded" />
                            )}
                            <span className={`font-semibold ${
                              isLowest(proposal.totalCost, 'cost') ? 'text-status-awarded' : 'text-foreground'
                            }`}>
                              ${proposal.totalCost?.toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isLowest(proposal.deliveryDays, 'delivery') && (
                              <Clock className="h-4 w-4 text-status-awarded" />
                            )}
                            <span className={`font-medium ${
                              isLowest(proposal.deliveryDays, 'delivery') ? 'text-status-awarded' : 'text-foreground'
                            }`}>
                              {proposal.deliveryDays} days
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-medium text-foreground">
                            {proposal.warrantyMonths} months
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isHighest(proposal.complianceScore) && (
                              <CheckCircle className="h-4 w-4 text-status-awarded" />
                            )}
                            <span className={`font-semibold ${getScoreColor(proposal.complianceScore)}`}>
                              {proposal.complianceScore}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="px-6 py-4 bg-muted/30 border-t border-border">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-status-awarded" />
                  <span className="text-muted-foreground">Lowest cost</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-status-awarded" />
                  <span className="text-muted-foreground">Fastest delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-status-awarded" />
                  <span className="text-muted-foreground">Highest compliance</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - AI Recommendation */}
        <div className="space-y-6">
          <div className="card-elevated p-6 border-2 border-accent/30 bg-accent/5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="font-semibold text-foreground">AI Recommendation</h2>
            </div>
            
            {recommendedVendor && (
              <>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border mb-4">
                  <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{recommendedVendor.vendorName}</p>
                    <p className="text-sm text-accent">Best Value</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <h3 className="text-sm font-medium text-foreground">Why this vendor?</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-status-awarded flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        Lowest total cost at ${recommendedVendor.totalCost?.toLocaleString()}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-status-awarded flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        High compliance score of {recommendedVendor.complianceScore}%
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-status-awarded flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        {recommendedVendor.warrantyMonths}-month warranty included
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-status-awarded flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        Delivery within {recommendedVendor.deliveryDays} business days
                      </span>
                    </li>
                  </ul>
                </div>

                <Link
                  to={`/rfp/${id}/decision`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-accent-foreground font-medium rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Proceed to Decision
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>

          {/* Savings Summary */}
          {proposals.length >= 2 && (
            <div className="card-elevated p-6">
              <h2 className="font-semibold text-foreground mb-4">Cost Comparison</h2>
              <div className="space-y-3">
                {sortedByCost.map((proposal, i) => (
                  <div key={proposal.id} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{proposal.vendorName}</span>
                    <span className={`text-sm font-medium ${i === 0 ? 'text-status-awarded' : 'text-foreground'}`}>
                      ${proposal.totalCost?.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Potential Savings</span>
                    <span className="text-sm font-semibold text-status-awarded">
                      ${((sortedByCost[sortedByCost.length - 1]?.totalCost || 0) - (sortedByCost[0]?.totalCost || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comparison;
