import { useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { MissionHistoryRow } from '../../utils/operationalHistory';

interface MissionCommentsModalProps {
  row: MissionHistoryRow;
  onClose: () => void;
}

export function MissionCommentsModal({ row, onClose }: MissionCommentsModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const formattedDate = new Date(row.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-scale-in">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-50 rounded-lg">
              <MessageSquare size={16} className="text-amber-800" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900">Mission Comments</h2>
              <p className="text-xs text-stone-400 mt-0.5">{row.location} &middot; {formattedDate}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5">
          {row.comments && row.comments.trim() ? (
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{row.comments.trim()}</p>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center">
                <MessageSquare size={16} className="text-stone-400" />
              </div>
              <p className="text-sm text-stone-400 font-medium">No comments recorded</p>
            </div>
          )}
        </div>

        <div className="px-5 pb-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
