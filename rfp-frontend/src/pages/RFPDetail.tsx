/**
 * RFP Detail Screen (RFPDetail.tsx)
 * Purpose: Single source of truth for an RFP
 * 
 * Sections:
 * - RFP Summary (structured data)
 * - Selected Vendors list
 * - RFP Status indicator
 * - Action buttons: Select Vendors, Send RFP, View Responses
 */

import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  Truck, 
  CreditCard, 
  Shield, 
  Users, 
  Send, 
  FileText,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { mockRFPs, mockVendors } from '@/data/mockData';
import StatusBadge from '@/components/ui/StatusBadge';

const RFPDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Find RFP by ID
  const rfp = mockRFPs.find(r => r.id === id) || mockRFPs[0];
  
  // Mock selected vendors for this RFP
  const selectedVendors = mockVendors.slice(0, rfp.vendorCount);
  
  const hasResponses = rfp.status === 'responses' || rfp.status === 'awarded';
  const canSend = rfp.status === 'draft' && selectedVendors.length > 0;

  return (
    <div className="page-container animate-fade-in">
      {/* Back button and header */}
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{rfp.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <StatusBadge status={rfp.status} />
                <span className="text-sm text-muted-foreground">Last updated: {rfp.lastUpdated}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/rfp/${id}/select-vendors`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <Users className="h-4 w-4" />
              Select Vendors
            </Link>
            
            <Link
              to={canSend ? `/rfp/${id}/send` : '#'}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                canSend
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              <Send className="h-4 w-4" />
              Send RFP
            </Link>
            
            <Link
              to={hasResponses ? `/rfp/${id}/proposals` : '#'}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                hasResponses
                  ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              <Eye className="h-4 w-4" />
              View Responses
            </Link>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - RFP Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {rfp.description && (
            <div className="card-elevated p-6">
              <h2 className="font-semibold text-foreground mb-3">Description</h2>
              <p className="text-muted-foreground">{rfp.description}</p>
            </div>
          )}

          {/* Items */}
          {rfp.items && rfp.items.length > 0 && (
            <div className="card-elevated p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Items Required</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="table-header pb-3 text-left">Item</th>
                      <th className="table-header pb-3 text-left">Quantity</th>
                      <th className="table-header pb-3 text-left">Specifications</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rfp.items.map((item, i) => (
                      <tr key={i}>
                        <td className="py-3 text-sm font-medium text-foreground">{item.name}</td>
                        <td className="py-3 text-sm text-muted-foreground">{item.quantity}</td>
                        <td className="py-3 text-sm text-muted-foreground">{item.specifications}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Terms Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {rfp.budget && (
              <div className="card-elevated p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Budget</span>
                </div>
                <p className="text-lg font-semibold text-foreground">{rfp.budget}</p>
              </div>
            )}
            
            {rfp.deliveryTimeline && (
              <div className="card-elevated p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Delivery Timeline</span>
                </div>
                <p className="text-lg font-semibold text-foreground">{rfp.deliveryTimeline}</p>
              </div>
            )}
            
            {rfp.paymentTerms && (
              <div className="card-elevated p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Payment Terms</span>
                </div>
                <p className="text-lg font-semibold text-foreground">{rfp.paymentTerms}</p>
              </div>
            )}
            
            {rfp.warranty && (
              <div className="card-elevated p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Warranty</span>
                </div>
                <p className="text-lg font-semibold text-foreground">{rfp.warranty}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Vendors */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="card-elevated p-6">
            <h2 className="font-semibold text-foreground mb-4">RFP Status</h2>
            <div className="space-y-3">
              {['draft', 'sent', 'responses', 'awarded'].map((status, i) => {
                const isCompleted = ['draft', 'sent', 'responses', 'awarded'].indexOf(rfp.status) >= i;
                const isCurrent = rfp.status === status;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-status-awarded' : 'bg-muted'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-status-awarded-foreground" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                    <span className={`text-sm capitalize ${
                      isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'
                    }`}>
                      {status === 'responses' ? 'Responses Received' : status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Vendors */}
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Selected Vendors</h2>
              <span className="text-sm text-muted-foreground">{selectedVendors.length} vendors</span>
            </div>
            
            {selectedVendors.length > 0 ? (
              <div className="space-y-3">
                {selectedVendors.map((vendor) => (
                  <div key={vendor.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {vendor.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{vendor.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{vendor.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No vendors selected</p>
                <Link
                  to={`/rfp/${id}/select-vendors`}
                  className="text-sm text-primary hover:underline mt-2 inline-block"
                >
                  Select vendors
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFPDetail;
