import { useEffect, useState } from 'react';
import { Plus, AlertCircle, Download, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { supabase } from '../../lib/supabase';
import { VetRecord, Dog } from '../../types/database';
import { exportToExcel } from '../../utils/excelExport';
import { formatDate, formatDateTime } from '../../utils/dateFormat';

interface VetRecordWithDog extends VetRecord {
  dog?: Dog;
}

interface VetRecordsTableProps {
  onAddClick: () => void;
  onEditClick: (record: VetRecordWithDog) => void;
  refreshTrigger?: number;
  onReturn?: () => void;
}

export function VetRecordsTable({ onAddClick, onEditClick, refreshTrigger, onReturn }: VetRecordsTableProps) {
  const [records, setRecords] = useState<VetRecordWithDog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, [refreshTrigger]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const { data: recordsData } = await supabase
        .from('vet_records')
        .select('*')
        .order('next_visit_date', { ascending: true, nullsFirst: false })
        .order('visit_date', { ascending: false });

      const recordsWithDogs = await Promise.all(
        (recordsData || []).map(async (record) => {
          const { data: dog } = await supabase
            .from('dogs')
            .select('*')
            .eq('id', record.dog_id)
            .single();
          return { ...record, dog };
        })
      );

      setRecords(recordsWithDogs);
    } catch (error) {
      console.error('Error loading vet records:', error);
    } finally {
      setLoading(false);
    }
  };

  const isUpcoming = (date: string | null) => {
    if (!date) return false;
    const visitDate = new Date(date);
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return visitDate >= today && visitDate <= thirtyDaysFromNow;
  };

  const handleExport = () => {
    const exportData = records.map((record) => ({
      Dog: record.dog?.name || 'Unknown',
      Breed: record.dog?.breed || 'N/A',
      'Visit Date': formatDate(record.visit_date),
      'Visit Type': record.visit_type,
      'Next Visit Date': record.next_visit_date ? formatDate(record.next_visit_date) : 'N/A',
      Notes: record.notes || 'No notes',
      'Created At': formatDateTime(record.created_at),
    }));
    exportToExcel(exportData, 'Vet_Records_Export', 'Vet Records');
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
      {onReturn && (
        <Button onClick={onReturn} variant="outline" size="sm" className="w-fit lg:hidden">
          <ArrowLeft size={18} className="mr-2" />
          Back to Dashboard
        </Button>
      )}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
        <h2 className="text-xl md:text-2xl font-bold text-stone-900">Veterinary Records</h2>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="flex-1 sm:flex-none" size="sm">
            <Download size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={onAddClick} className="flex-1 sm:flex-none" size="sm">
            <Plus size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">Add Record</span>
          </Button>
        </div>
      </div>

      <div className="hidden md:block">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Dog</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Visit Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Visit Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Next Visit</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {records.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() => onEditClick(record)}
                    className="hover:bg-amber-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-stone-900">{record.dog?.name || 'Unknown'}</div>
                      <div className="text-xs text-stone-500">{record.dog?.breed}</div>
                    </td>
                    <td className="px-6 py-4 text-stone-700">
                      {formatDate(record.visit_date)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-900">
                        {record.visit_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {record.next_visit_date ? (
                        <div className="flex items-center">
                          {isUpcoming(record.next_visit_date) && (
                            <AlertCircle size={16} className="text-red-600 mr-2" />
                          )}
                          <span className={isUpcoming(record.next_visit_date) ? 'text-red-600 font-medium' : 'text-stone-700'}>
                            {formatDate(record.next_visit_date)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-stone-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-stone-700 max-w-xs truncate">
                      {record.notes || 'No notes'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {records.length === 0 && (
              <div className="text-center py-12 text-stone-500">
                No vet records found. Click "Add Record" to create your first entry.
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="md:hidden space-y-3">
        {records.map((record) => (
          <Card key={record.id} hover onClick={() => onEditClick(record)}>
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-stone-900 text-lg truncate">{record.dog?.name || 'Unknown'}</h3>
                  <p className="text-sm text-stone-600">{record.dog?.breed}</p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-900 ml-2">
                  {record.visit_type}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-stone-700">
                  <Calendar size={14} className="mr-2 flex-shrink-0" />
                  <span>Visit: {formatDate(record.visit_date)}</span>
                </div>
                {record.next_visit_date && (
                  <div className="flex items-center">
                    <AlertCircle size={14} className={`mr-2 flex-shrink-0 ${isUpcoming(record.next_visit_date) ? 'text-red-600' : 'text-stone-400'}`} />
                    <span className={isUpcoming(record.next_visit_date) ? 'text-red-600 font-medium' : 'text-stone-700'}>
                      Next: {formatDate(record.next_visit_date)}
                    </span>
                  </div>
                )}
                {record.notes && (
                  <div className="pt-2 border-t border-stone-200">
                    <p className="text-stone-600 text-xs line-clamp-2">{record.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {records.length === 0 && (
          <Card>
            <div className="text-center py-12 text-stone-500">
              No vet records found. Click "Add Record" to create your first entry.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
