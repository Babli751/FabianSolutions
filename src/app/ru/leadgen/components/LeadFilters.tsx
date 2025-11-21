"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type FilterOptions = {
  hasEmail: boolean;
  hasPhone: boolean;
  hasWebsite: boolean;
  statusFilter: 'all' | 'new' | 'email_sent';
  searchTerm: string;
};

type LeadFiltersProps = {
  onFiltersChange: (filters: FilterOptions) => void;
  totalCount: number;
  filteredCount: number;
};

export function LeadFilters({ onFiltersChange, totalCount, filteredCount }: LeadFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    hasEmail: false,
    hasPhone: false,
    hasWebsite: false,
    statusFilter: 'all',
    searchTerm: ''
  });

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterOptions = {
      hasEmail: false,
      hasPhone: false,
      hasWebsite: false,
      statusFilter: 'all',
      searchTerm: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-white">Filter Leads</h3>
      </div>
      <div className="card-body">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
            {/* Search within results */}
            <div className="w-full sm:min-w-[200px] sm:max-w-[250px]">
              <label className="form-label">Search in leads</label>
              <Input
                placeholder="Search leads..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
                className="form-input"
              />
            </div>

            {/* Contact info filters */}
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={filters.hasEmail}
                  onChange={(e) => handleFilterChange({ hasEmail: e.target.checked })}
                  className="h-4 w-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="whitespace-nowrap text-slate-300">Has Email</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={filters.hasPhone}
                  onChange={(e) => handleFilterChange({ hasPhone: e.target.checked })}
                  className="h-4 w-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="whitespace-nowrap text-slate-300">Has Phone</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={filters.hasWebsite}
                  onChange={(e) => handleFilterChange({ hasWebsite: e.target.checked })}
                  className="h-4 w-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="whitespace-nowrap text-slate-300">Has Website</span>
              </label>
            </div>

            {/* Status filter */}
            <div className="w-full sm:min-w-[140px] sm:max-w-[160px]">
              <label className="form-label">Status</label>
              <select
                value={filters.statusFilter}
                onChange={(e) => handleFilterChange({ statusFilter: e.target.value as FilterOptions['statusFilter'] })}
                className="form-input"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="email_sent">Email Sent</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full lg:w-auto">
            <span className="text-sm text-slate-400 whitespace-nowrap order-2 sm:order-1">
              {filteredCount} / {totalCount} leads
            </span>
            <Button
              variant="outline"
              onClick={clearAllFilters}
              disabled={!filters.hasEmail && !filters.hasPhone && !filters.hasWebsite && filters.statusFilter === 'all' && !filters.searchTerm}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { FilterOptions };
