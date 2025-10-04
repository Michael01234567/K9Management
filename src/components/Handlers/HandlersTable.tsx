import { useEffect, useState } from 'react';
import { Plus, Mail, Phone, Download } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-stone-900">Handlers</h2>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download size={20} className="mr-2" />
            Export to Excel
          </Button>
          <Button onClick={onAddClick}>
            <Plus size={20} className="mr-2" />
            Add Handler
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {handlers.map((handler) => (
          <Card key={handler.id} hover onClick={() => onEditClick(handler)}>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-stone-900 mb-4">{handler.full_name}</h3>
              <div className="space-y-2 mb-4">
                {handler.email && (
                  <div className="flex items-center text-sm text-stone-600">
                    <Mail size={16} className="mr-2" />
                    {handler.email}
                  </div>
                )}
                {handler.phone && (
                  <div className="flex items-center text-sm text-stone-600">
                    <Phone size={16} className="mr-2" />
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
