/**
 * Select Vendors Screen (SelectVendors.tsx)
 * Purpose: Select vendors to receive the RFP
 */

import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Building2, Mail, Search, Save } from 'lucide-react';
import { mockRFPs, mockVendors, Vendor } from '@/data/mockData';

const SelectVendors = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const rfp = mockRFPs.find(r => r.id === id) || mockRFPs[0];
  
  // Mock initial selected vendors based on vendorCount
  const initialSelected = mockVendors.slice(0, rfp.vendorCount).map(v => v.id);
  const [selectedVendors, setSelectedVendors] = useState<string[]>(initialSelected);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVendors = mockVendors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleVendor = (vendorId: string) => {
    setSelectedVendors(prev => 
      prev.includes(vendorId)
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleSave = () => {
    // TODO: API call to save selected vendors
    console.log('Selected vendors:', selectedVendors);
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
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Select Vendors</h1>
            <p className="text-muted-foreground">{rfp.name}</p>
          </div>
          
          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-all"
          >
            <Save className="h-4 w-4" />
            Save Selection ({selectedVendors.length})
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search vendors by name or category..."
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Vendors Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map((vendor) => {
          const isSelected = selectedVendors.includes(vendor.id);
          return (
            <button
              key={vendor.id}
              onClick={() => toggleVendor(vendor.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <Building2 className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{vendor.name}</p>
                    <p className="text-sm text-muted-foreground">{vendor.category}</p>
                  </div>
                </div>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'bg-primary' : 'border-2 border-muted'
                }`}>
                  {isSelected && <Check className="h-4 w-4 text-primary-foreground" />}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{vendor.email}</span>
              </div>
            </button>
          );
        })}
      </div>

      {filteredVendors.length === 0 && (
        <div className="card-elevated py-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No vendors found</h3>
          <p className="text-muted-foreground">Try adjusting your search query</p>
        </div>
      )}
    </div>
  );
};

export default SelectVendors;
