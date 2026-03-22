import { IndicationStats } from '../../utils/operationalHistory';

interface IndicationBarProps {
  indications: IndicationStats;
}

export function IndicationBar({ indications }: IndicationBarProps) {
  const { confirmed, unconfirmed, total, confirmedPct, unconfirmedPct } = indications;

  if (total === 0) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-4 md:p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-stone-700 mb-3">Indication Ratio</h3>
        <div className="h-3 bg-stone-100 rounded-full" />
        <p className="text-xs text-stone-400 mt-2 text-center">No indications recorded for this selection</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 md:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-stone-700">Indication Ratio</h3>
        <span className="text-xs text-stone-500">{total} total indication{total !== 1 ? 's' : ''}</span>
      </div>

      <div className="relative h-3 bg-stone-100 rounded-full overflow-hidden">
        {confirmedPct > 0 && (
          <div
            className="absolute left-0 top-0 h-full bg-green-500 rounded-l-full transition-all duration-500"
            style={{ width: `${confirmedPct}%` }}
          />
        )}
        {unconfirmedPct > 0 && (
          <div
            className="absolute top-0 h-full bg-amber-400 transition-all duration-500"
            style={{ left: `${confirmedPct}%`, width: `${unconfirmedPct}%` }}
          />
        )}
      </div>

      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
          <span className="text-xs text-stone-600">
            Confirmed — <span className="font-semibold">{confirmed}</span>
            <span className="text-stone-400 ml-1">({confirmedPct}%)</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
          <span className="text-xs text-stone-600">
            Unconfirmed — <span className="font-semibold">{unconfirmed}</span>
            <span className="text-stone-400 ml-1">({unconfirmedPct}%)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
