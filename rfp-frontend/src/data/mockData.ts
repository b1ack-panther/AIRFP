// Mock data for the RFP Management System

export interface RFP {
  id: string;
  name: string;
  status: 'draft' | 'sent' | 'responses' | 'awarded';
  vendorCount: number;
  lastUpdated: string;
  description?: string;
  items?: RFPItem[];
  budget?: string;
  deliveryTimeline?: string;
  paymentTerms?: string;
  warranty?: string;
}

export interface RFPItem {
  name: string;
  quantity: number;
  specifications?: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  category: string;
  phone?: string;
  address?: string;
}

export interface Proposal {
  id: string;
  rfpId: string;
  vendorId: string;
  vendorName: string;
  status: 'processing' | 'parsed' | 'needs-review';
  submittedAt: string;
  totalCost?: number;
  deliveryDays?: number;
  warrantyMonths?: number;
  complianceScore?: number;
  items?: ProposalItem[];
  rawContent?: string;
}

export interface ProposalItem {
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

// Mock RFPs
export const mockRFPs: RFP[] = [
  {
    id: 'rfp-001',
    name: 'Office IT Equipment Procurement',
    status: 'responses',
    vendorCount: 4,
    lastUpdated: '2024-01-15',
    description: 'Procurement of IT equipment for new office setup including laptops, monitors, and peripherals.',
    items: [
      { name: 'Laptop - Dell XPS 15', quantity: 50, specifications: '16GB RAM, 512GB SSD' },
      { name: 'Monitor - 27" 4K', quantity: 50, specifications: 'USB-C, Height adjustable' },
      { name: 'Wireless Keyboard & Mouse', quantity: 50, specifications: 'Bluetooth, ergonomic' },
    ],
    budget: '$150,000',
    deliveryTimeline: '30 days',
    paymentTerms: 'Net 30',
    warranty: '3 years manufacturer warranty',
  },
  {
    id: 'rfp-002',
    name: 'Cloud Infrastructure Services',
    status: 'sent',
    vendorCount: 3,
    lastUpdated: '2024-01-14',
    description: 'Annual cloud infrastructure and hosting services for enterprise applications.',
    items: [
      { name: 'Cloud Compute Instances', quantity: 20, specifications: '8 vCPU, 32GB RAM' },
      { name: 'Managed Database', quantity: 5, specifications: 'PostgreSQL, High Availability' },
      { name: 'CDN Service', quantity: 1, specifications: 'Global distribution' },
    ],
    budget: '$200,000/year',
    deliveryTimeline: '14 days setup',
    paymentTerms: 'Quarterly billing',
    warranty: '99.9% SLA',
  },
  {
    id: 'rfp-003',
    name: 'Office Furniture - New HQ',
    status: 'draft',
    vendorCount: 0,
    lastUpdated: '2024-01-13',
    description: 'Complete office furniture for new headquarters.',
    items: [
      { name: 'Standing Desk', quantity: 100, specifications: 'Electric, 60x30 inch' },
      { name: 'Ergonomic Chair', quantity: 100, specifications: 'Mesh back, adjustable arms' },
    ],
    budget: '$80,000',
    deliveryTimeline: '45 days',
    paymentTerms: 'Net 45',
    warranty: '5 years',
  },
  {
    id: 'rfp-004',
    name: 'Marketing Services Q1',
    status: 'awarded',
    vendorCount: 2,
    lastUpdated: '2024-01-10',
  },
];

// Mock Vendors
export const mockVendors: Vendor[] = [
  {
    id: 'vendor-001',
    name: 'TechSupply Pro',
    email: 'sales@techsupplypro.com',
    category: 'IT Equipment',
    phone: '+1 (555) 123-4567',
    address: '123 Tech Blvd, San Francisco, CA',
  },
  {
    id: 'vendor-002',
    name: 'CloudFirst Solutions',
    email: 'enterprise@cloudfirst.io',
    category: 'Cloud Services',
    phone: '+1 (555) 234-5678',
    address: '456 Innovation Way, Seattle, WA',
  },
  {
    id: 'vendor-003',
    name: 'OfficeSpace Furnishings',
    email: 'quotes@officespace.com',
    category: 'Furniture',
    phone: '+1 (555) 345-6789',
    address: '789 Design Ave, Austin, TX',
  },
  {
    id: 'vendor-004',
    name: 'Digital Dynamics',
    email: 'bids@digitaldynamics.com',
    category: 'IT Equipment',
    phone: '+1 (555) 456-7890',
    address: '321 Silicon St, San Jose, CA',
  },
  {
    id: 'vendor-005',
    name: 'Apex Marketing Group',
    email: 'partnerships@apexmkg.com',
    category: 'Marketing',
    phone: '+1 (555) 567-8901',
    address: '555 Madison Ave, New York, NY',
  },
];

// Mock Proposals
export const mockProposals: Proposal[] = [
  {
    id: 'prop-001',
    rfpId: 'rfp-001',
    vendorId: 'vendor-001',
    vendorName: 'TechSupply Pro',
    status: 'parsed',
    submittedAt: '2024-01-14',
    totalCost: 142500,
    deliveryDays: 25,
    warrantyMonths: 36,
    complianceScore: 95,
    items: [
      { name: 'Laptop - Dell XPS 15', unitPrice: 1800, quantity: 50, totalPrice: 90000 },
      { name: 'Monitor - 27" 4K', unitPrice: 650, quantity: 50, totalPrice: 32500 },
      { name: 'Wireless Keyboard & Mouse', unitPrice: 400, quantity: 50, totalPrice: 20000 },
    ],
    rawContent: `Dear Procurement Team,

Thank you for the opportunity to submit our proposal for the Office IT Equipment Procurement RFP.

We are pleased to offer the following:
- 50x Dell XPS 15 Laptops @ $1,800 each = $90,000
- 50x LG 27" 4K Monitors @ $650 each = $32,500
- 50x Logitech MX Keys Combo @ $400 each = $20,000

Total: $142,500

Delivery: 25 business days
Warranty: 3 years on all products

Best regards,
TechSupply Pro Team`,
  },
  {
    id: 'prop-002',
    rfpId: 'rfp-001',
    vendorId: 'vendor-004',
    vendorName: 'Digital Dynamics',
    status: 'parsed',
    submittedAt: '2024-01-14',
    totalCost: 138000,
    deliveryDays: 30,
    warrantyMonths: 24,
    complianceScore: 88,
    items: [
      { name: 'Laptop - Dell XPS 15', unitPrice: 1750, quantity: 50, totalPrice: 87500 },
      { name: 'Monitor - 27" 4K', unitPrice: 620, quantity: 50, totalPrice: 31000 },
      { name: 'Wireless Keyboard & Mouse', unitPrice: 390, quantity: 50, totalPrice: 19500 },
    ],
    rawContent: `Proposal for IT Equipment RFP

Digital Dynamics Quote:
- Laptops: $1,750 x 50 = $87,500
- Monitors: $620 x 50 = $31,000  
- Peripherals: $390 x 50 = $19,500

Grand Total: $138,000

Lead time: 30 days
Standard 2-year warranty included.

- Digital Dynamics Sales`,
  },
  {
    id: 'prop-003',
    rfpId: 'rfp-001',
    vendorId: 'vendor-002',
    vendorName: 'CloudFirst Solutions',
    status: 'needs-review',
    submittedAt: '2024-01-15',
    totalCost: 145000,
    deliveryDays: 20,
    warrantyMonths: 36,
    complianceScore: 72,
  },
  {
    id: 'prop-004',
    rfpId: 'rfp-001',
    vendorId: 'vendor-003',
    vendorName: 'OfficeSpace Furnishings',
    status: 'processing',
    submittedAt: '2024-01-15',
  },
];

// Helper functions
export const getStatusLabel = (status: RFP['status']): string => {
  const labels: Record<RFP['status'], string> = {
    draft: 'Draft',
    sent: 'Sent',
    responses: 'Responses Received',
    awarded: 'Awarded',
  };
  return labels[status];
};

export const getProposalStatusLabel = (status: Proposal['status']): string => {
  const labels: Record<Proposal['status'], string> = {
    processing: 'Processing',
    parsed: 'Parsed',
    'needs-review': 'Needs Review',
  };
  return labels[status];
};
