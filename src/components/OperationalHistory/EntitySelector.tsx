import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

interface EntityOption {
  id: string;
  name: string;
  badge?: string;
}

interface EntitySelectorProps {
  options: EntityOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  placeholder: string;
}

export function EntitySelector({ options, selectedId, onSelect, placeholder }: EntitySelectorProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.id === selectedId);

  const filtered = query.trim()
    ? options.filter(o =>
        o.name.toLowerCase().includes(query.toLowerCase()) ||
        (o.badge && o.badge.toLowerCase().includes(query.toLowerCase()))
      )
    : options;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(id: string) {
    onSelect(id);
    setOpen(false);
    setQuery('');
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onSelect('');
    setQuery('');
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border border-stone-200 rounded-xl text-left shadow-sm hover:border-stone-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-900/20"
      >
        <span className={`flex-1 truncate text-sm ${selected ? 'text-stone-900 font-medium' : 'text-stone-400'}`}>
          {selected ? (
            <span className="flex items-center gap-2">
              {selected.name}
              {selected.badge && (
                <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full font-normal">
                  {selected.badge}
                </span>
              )}
            </span>
          ) : placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {selected && (
            <span
              role="button"
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown size={16} className={`text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-stone-100">
            <div className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-lg">
              <Search size={14} className="text-stone-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type to search..."
                className="flex-1 bg-transparent text-sm text-stone-900 placeholder-stone-400 outline-none"
              />
            </div>
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-stone-400 text-center">No results found</li>
            ) : (
              filtered.map(opt => (
                <li key={opt.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-stone-50 ${
                      opt.id === selectedId ? 'bg-amber-50 text-amber-900 font-medium' : 'text-stone-800'
                    }`}
                  >
                    <span className="flex-1">{opt.name}</span>
                    {opt.badge && (
                      <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full shrink-0">
                        {opt.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
