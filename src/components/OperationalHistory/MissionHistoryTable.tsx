import { ClipboardList, CheckCircle2, AlertTriangle, MinusCircle, MessageSquare } from 'lucide-react';
import { MissionHistoryRow } from '../../utils/operationalHistory';

interface MissionHistoryTableProps {
  rows: MissionHistoryRow[];
  onRowClick: (row: MissionHistoryRow) => void;
}

function IndicationBadge({ status }: { status: MissionHistoryRow['indicationStatus'] }) {
  if (status === 'Confirmed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
        <CheckCircle2 size={11} />
        Confirmed
      </span>
    );
  }
  if (status === 'Unconfirmed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <AlertTriangle size={11} />
        Unconfirmed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-stone-50 text-stone-500 border border-stone-200">
      <MinusCircle size={11} />
      None
    </span>
  );
}

export function MissionHistoryTable({ rows, onRowClick }: MissionHistoryTableProps) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 md:px-5 py-4 border-b border-stone-100">
        <ClipboardList size={16} className="text-stone-500" />
        <h3 className="text-sm font-semibold text-stone-700">Mission History</h3>
        <span className="ml-auto text-xs text-stone-400">{rows.length} mission{rows.length !== 1 ? 's' : ''}</span>
      </div>

      {rows.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-stone-400">
          No missions found for this selection
        </div>
      ) : (
        <>
          <div className="hidden md:grid grid-cols-[2fr_1fr_2fr_1fr_auto] gap-4 px-5 py-2 bg-stone-50 border-b border-stone-100 text-xs font-semibold text-stone-500 uppercase tracking-wide">
            <span>Mission</span>
            <span>Date</span>
            <span>Location</span>
            <span>Indication</span>
            <span className="w-6" />
          </div>

          <ul className="divide-y divide-stone-50">
            {rows.map(row => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => onRowClick(row)}
                  className="w-full text-left hover:bg-stone-50/80 active:bg-stone-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-900/30"
                >
                  <div className="hidden md:grid grid-cols-[2fr_1fr_2fr_1fr_auto] gap-4 px-5 py-3 items-center">
                    <span className="text-sm font-medium text-stone-800 truncate">{row.label}</span>
                    <span className="text-sm text-stone-500 tabular-nums">
                      {new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-sm text-stone-600 truncate">{row.location}</span>
                    <IndicationBadge status={row.indicationStatus} />
                    <MessageSquare size={14} className="text-stone-300 group-hover:text-stone-400 transition-colors" />
                  </div>

                  <div className="md:hidden px-4 py-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="text-sm font-medium text-stone-800 truncate">{row.label}</p>
                        <MessageSquare size={12} className="text-stone-300 shrink-0" />
                      </div>
                      <IndicationBadge status={row.indicationStatus} />
                    </div>
                    <p className="text-xs text-stone-500">{row.location}</p>
                    <p className="text-xs text-stone-400 tabular-nums">
                      {new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <div className="px-5 py-2.5 border-t border-stone-50 bg-stone-50/50">
            <p className="text-xs text-stone-400 flex items-center gap-1.5">
              <MessageSquare size={11} />
              Tap any mission to view its comments
            </p>
          </div>
        </>
      )}
    </div>
  );
}
