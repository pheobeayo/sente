import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface TransactionFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
}

interface FilterOptions {
  type: string[];
  status: string[];
  dateRange: string;
}

export default function TransactionFilter({ onFilterChange }: TransactionFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState('all');

  const types = ['Swap', 'Add Liquidity', 'Remove Liquidity'];
  const statuses = ['Success', 'Pending', 'Failed'];
  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
  ];

  const toggleType = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(newTypes);
    applyFilters(newTypes, selectedStatuses, dateRange);
  };

  const toggleStatus = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(newStatuses);
    applyFilters(selectedTypes, newStatuses, dateRange);
  };

  const changeDateRange = (range: string) => {
    setDateRange(range);
    applyFilters(selectedTypes, selectedStatuses, range);
  };

  const applyFilters = (types: string[], statuses: string[], range: string) => {
    onFilterChange({
      type: types,
      status: statuses,
      dateRange: range
    });
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setDateRange('all');
    onFilterChange({ type: [], status: [], dateRange: 'all' });
  };

  const hasActiveFilters = selectedTypes.length > 0 || selectedStatuses.length > 0 || dateRange !== 'all';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          hasActiveFilters
            ? 'bg-purple-600 text-white'
            : 'bg-white/5 text-gray-400 hover:bg-white/10'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filter</span>
        {hasActiveFilters && (
          <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
            {selectedTypes.length + selectedStatuses.length + (dateRange !== 'all' ? 1 : 0)}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Filter Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-white">Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
              {/* Transaction Type */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Transaction Type</h4>
                <div className="space-y-2">
                  {types.map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleType(type)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-white">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Status</h4>
                <div className="space-y-2">
                  {statuses.map(status => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status)}
                        onChange={() => toggleStatus(status)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-white">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-3">Date Range</h4>
                <div className="space-y-2">
                  {dateRanges.map(range => (
                    <label key={range.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="dateRange"
                        checked={dateRange === range.value}
                        onChange={() => changeDateRange(range.value)}
                        className="w-4 h-4 border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-white">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            {hasActiveFilters && (
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={clearFilters}
                  className="w-full py-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}