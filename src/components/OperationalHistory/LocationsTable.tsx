import { MapPin } from 'lucide-react';
import { LocationStat } from '../../utils/operationalHistory';

interface LocationsTableProps {
  locationStats: LocationStat[];
}

export function LocationsTable({ locationStats }: LocationsTableProps) {
  const maxCount = locationStats.length > 0 ? locationStats[0].count : 1;

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 md:px-5 py-4 border-b border-stone-100">
        <MapPin size={16} className="text-stone-500" />
        <h3 className="text-sm font-semibold text-stone-700">Locations Visited</h3>
        <span className="ml-auto text-xs text-stone-400">{locationStats.length} location{locationStats.length !== 1 ? 's' : ''}</span>
      </div>

      {locationStats.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-stone-400">No location data available</div>
      ) : (
        <ul className="divide-y divide-stone-50">
          {locationStats.map((loc, idx) => (
            <li key={idx} className="px-4 md:px-5 py-3 hover:bg-stone-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-stone-400 w-5 text-center">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{loc.name}</p>
                  <div className="mt-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-700/70 rounded-full transition-all duration-500"
                      style={{ width: `${(loc.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-stone-700 shrink-0 tabular-nums">
                  {loc.count} <span className="text-xs font-normal text-stone-400">{loc.count === 1 ? 'mission' : 'missions'}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
