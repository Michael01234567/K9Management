import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Button } from '../UI/Button';

interface ReportFiltersProps {
  dateFrom: string;
  dateTo: string;
  location: string;
  status: string;
  locations: string[];
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'Planning', label: 'Planning' },
  { value: 'Active', label: 'Active' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export function ReportFilters({
  dateFrom,
  dateTo,
  location,
  status,
  locations,
  onDateFromChange,
  onDateToChange,
  onLocationChange,
  onStatusChange,
  onReset
}: ReportFiltersProps) {
  const locationOptions = [
    { value: '', label: 'All Locations' },
    ...locations.map(loc => ({ value: loc, label: loc }))
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold text-stone-800 mb-4">Filter Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            From Date
          </label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            To Date
          </label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Location
          </label>
          <Select
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            options={locationOptions}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Status
          </label>
          <Select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            options={STATUS_OPTIONS}
          />
        </div>
        <div className="flex items-end">
          <Button
            variant="secondary"
            onClick={onReset}
            className="w-full"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
