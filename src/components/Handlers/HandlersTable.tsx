import { useEffect, useState } from 'react';
import { Plus, Mail, Phone, Download, User, ArrowLeft, Shield, Car, Search } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { supabase } from '../../lib/supabase';
import { Handler } from '../../types/database';
import { exportToExcel } from '../../utils/excelExport';
import { formatDateTime } from '../../utils/dateFormat';

interface HandlersTableProps {
  onAddClick: () => void;
  onEditClick: (handler: Handler) => void;
  refreshTrigger?: number;
  onReturn?: () => void;
}

export function HandlersTable({ onAddClick, onEditClick, refreshTrigger, onReturn }: HandlersTableProps) {
  const [handlers, setHandlers] = useState<Handler[]>([]);
  const [handlerDogs, setHandlerDogs] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      'Employee ID': handler.employee_id,
      'Full Name': handler.full_name,
      Email: handler.email || 'N/A',
      Phone: handler.phone || 'N/A',
      'Team Leader': handler.team_leader ? 'Yes' : 'No',
      'Driver': handler.driver ? 'Yes' : 'No',
      'Assigned Dogs': handlerDogs[handler.id] || 0,
      'Created At': formatDateTime(handler.created_at),
    }));
    exportToExcel(exportData, 'Handlers_Export', 'Handlers');
  };

  const filteredHandlers = handlers.filter((handler) => {
    const search = searchTerm.toLowerCase();
    return (
      handler.full_name.toLowerCase().includes(search) ||
      handler.employee_id.toLowerCase().includes(search) ||
      handler.email?.toLowerCase().includes(search) ||
      handler.phone?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {onReturn && (
        <Button onClick={onReturn} variant="outline" size="sm" className="w-fit lg:hidden">
          <ArrowLeft size={18} className="mr-2" />
          Back to Dashboard
        </Button>
      )}
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
        <input
          type="text"
          placeholder="Search by name, ID, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredHandlers.map((handler) => (
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
                  <p className="text-sm text-stone-500">ID: {handler.employee_id}</p>
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
              <div className="pt-4 border-t border-stone-200 space-y-3">
                <span className="text-sm text-stone-600">
                  Assigned Dogs: <span className="font-semibold text-amber-900">{handlerDogs[handler.id] || 0}</span>
                </span>
                {(handler.team_leader || handler.driver) && (
                  <div className="flex flex-wrap gap-2">
                    {handler.team_leader && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <Shield size={12} />
                        Team Leader
                      </span>
                    )}
                    {handler.driver && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Car size={12} />
                        Driver
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredHandlers.length === 0 && (
        <Card>
          <div className="text-center py-12 text-stone-500">
            {searchTerm
              ? 'No handlers match your search criteria.'
              : 'No handlers found. Click "Add Handler" to create your first handler.'}
          </div>
        </Card>
      )}
    </div>
  );
}
