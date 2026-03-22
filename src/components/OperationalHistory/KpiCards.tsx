import { Target, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { EntityHistory } from '../../utils/operationalHistory';

interface KpiCardsProps {
  history: EntityHistory;
}

export function KpiCards({ history }: KpiCardsProps) {
  const { totalMissions, locationsVisited, missionsWithIndications, indications } = history;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <div className="bg-white rounded-xl border border-stone-200 p-4 md:p-5 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Target size={18} className="text-blue-600" />
          </div>
        </div>
        <p className="text-2xl md:text-3xl font-bold text-stone-900 leading-none mb-1">{totalMissions}</p>
        <p className="text-xs md:text-sm text-stone-500 font-medium">Total Missions</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-4 md:p-5 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="p-2 bg-teal-50 rounded-lg">
            <MapPin size={18} className="text-teal-600" />
          </div>
        </div>
        <p className="text-2xl md:text-3xl font-bold text-stone-900 leading-none mb-1">{locationsVisited}</p>
        <p className="text-xs md:text-sm text-stone-500 font-medium">Locations Visited</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-4 md:p-5 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <AlertCircle size={18} className="text-amber-600" />
          </div>
        </div>
        <p className="text-2xl md:text-3xl font-bold text-stone-900 leading-none mb-1">{missionsWithIndications}</p>
        <p className="text-xs md:text-sm text-stone-500 font-medium">With Indications</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-4 md:p-5 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <CheckCircle size={18} className="text-green-600" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="text-base md:text-lg font-bold text-stone-900">{indications.confirmed}</span>
            <span className="text-xs text-stone-500">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span className="text-base md:text-lg font-bold text-stone-900">{indications.unconfirmed}</span>
            <span className="text-xs text-stone-500">Unconfirmed</span>
          </div>
        </div>
        <p className="text-xs md:text-sm text-stone-500 font-medium mt-2">Indications Breakdown</p>
      </div>
    </div>
  );
}
