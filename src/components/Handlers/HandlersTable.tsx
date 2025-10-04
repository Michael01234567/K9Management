import { useEffect, useState } from 'react';
import { Plus, Mail, Phone, Download, User } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { supabase } from '../../lib/supabase';
import { Handler } from '../../types/database';
import { exportToExcel } from '../../utils/excelExport';

interface HandlersTableProps {
  onAddClick: () => void;
  onEditClick: (handler: Handler) => void;
  refreshTrigger?: number;
}

export function HandlersTable({ onAddClick, onEditClick, refreshTrigger }: HandlersTableProps) {
  const [handlers, setHandlers] = useState<Handler[]>([]);
  const [handlerDogs, setHandlerDogs] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHandlers();
  }, [refreshTrigger]);

  const loadHandlers = async () => {
    try {
      setLoading(true);
      const { data: handlersData } = await supabase
        .from('handlers')
        .select('*')
        .order('full_name');

      setHandlers(handlersData || []);

      const dogCounts: Record<string, number> = {};
      for (const handler of handlersData || []) {
        const { data: dogHandlers } = await supabase
          .from('dog_handler')
          .select('dog_id')
          .eq('handler_id', handler.id);
        dogCounts[handler.id] = dogHandlers?.length || 0;
      }
      setHandlerDogs(dogCounts);
    } catch (error) {
      console.error('Error loading handlers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = handlers.map((handler) => ({
      'Full Name': handler.full_name,
      Email: handler.email || 'N/A',
      Phone: handler.phone || 'N/A',
      'Assigned Dogs': handlerDogs[handler.id] || 0,
      'Created At': new Date(handler.created_at).toLocaleString(),
    }));
    exportToExcel(exportData, 'Handlers_Export', 'Handlers');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
        <h2 className="text-xl md:text-2xl font-bold text-stone-900">Handlers</h2>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="flex-1 sm:flex-none" size="sm">
            <Download size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={onAddClick} className="flex-1 sm:flex-none" size="sm">
            <Plus size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">Add Handler</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {handlers.map((handler) => (
          <Card key={handler.id} hover onClick={() => onEditClick(handler)}>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                {handler.picture_url ? (
                  <img
                    src={handler.picture_url}
                    alt={handler.full_name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center border-2 border-stone-200 flex-shrink-0">
                    <User size={28} className="text-stone-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-stone-900 truncate">{handler.full_name}</h3>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {handler.email && (
                  <div className="flex items-center text-sm text-stone-600">
                    <Mail size={16} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{handler.email}</span>
                  </div>
                )}
                {handler.phone && (
                  <div className="flex items-center text-sm text-stone-600">
                    <Phone size={16} className="mr-2 flex-shrink-0" />
                    {handler.phone}
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-stone-200">
                <span className="text-sm text-stone-600">
                  Assigned Dogs: <span className="font-semibold text-amber-900">{handlerDogs[handler.id] || 0}</span>
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {handlers.length === 0 && (
        <Card>
          <div className="text-center py-12 text-stone-500">
            No handlers found. Click "Add Handler" to create your first handler.
          </div>
        </Card>
      )}
    </div>
  );
}
