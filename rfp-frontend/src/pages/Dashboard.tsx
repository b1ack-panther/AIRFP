/**
 * Dashboard Screen (Dashboard.tsx)
 * Purpose: Entry point of the app showing all RFPs
 * 
 * Features:
 * - Page title: "My RFPs"
 * - Primary CTA: "Create New RFP"
 * - Table/card list of RFPs with status, vendor count, last updated
 * - Click on RFP navigates to RFP Detail screen
 */

import { Link } from 'react-router-dom';
import { Plus, FileText, Users, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { mockRFPs, getStatusLabel } from '@/data/mockData';
import StatusBadge from '@/components/ui/StatusBadge';

const Dashboard = () => {
  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title mb-1">My RFPs</h1>
          <p className="text-muted-foreground">Manage your procurement requests and track vendor responses</p>
        </div>
        <Link
          to="/create-rfp"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-all hover:shadow-lg"
        >
          <Sparkles className="h-4 w-4" />
          Create New RFP
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total RFPs', value: mockRFPs.length, color: 'text-foreground' },
          { label: 'Draft', value: mockRFPs.filter(r => r.status === 'draft').length, color: 'text-status-draft-foreground' },
          { label: 'In Progress', value: mockRFPs.filter(r => r.status === 'sent' || r.status === 'responses').length, color: 'text-status-sent' },
          { label: 'Awarded', value: mockRFPs.filter(r => r.status === 'awarded').length, color: 'text-status-awarded' },
        ].map((stat, i) => (
          <div key={i} className="card-elevated p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* RFP List */}
      <div className="card-elevated overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b border-border">
          <div className="col-span-5 table-header">RFP Name</div>
          <div className="col-span-2 table-header">Status</div>
          <div className="col-span-2 table-header">Vendors</div>
          <div className="col-span-2 table-header">Last Updated</div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border">
          {mockRFPs.map((rfp, index) => (
            <Link
              key={rfp.id}
              to={`/rfp/${rfp.id}`}
              className="block hover:bg-muted/30 transition-colors"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 p-4 md:px-6 md:py-4 items-center">
                {/* RFP Name */}
                <div className="md:col-span-5 flex items-center gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{rfp.name}</p>
                    <p className="text-sm text-muted-foreground md:hidden">
                      {rfp.vendorCount} vendors • {rfp.lastUpdated}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <StatusBadge status={rfp.status} />
                </div>

                {/* Vendors */}
                <div className="hidden md:flex md:col-span-2 items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{rfp.vendorCount} vendors</span>
                </div>

                {/* Last Updated */}
                <div className="hidden md:flex md:col-span-2 items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{rfp.lastUpdated}</span>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex md:col-span-1 justify-end">
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state (would show if no RFPs) */}
        {mockRFPs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No RFPs yet</h3>
            <p className="text-muted-foreground mb-4">Create your first RFP to get started</p>
            <Link
              to="/create-rfp"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create New RFP
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
