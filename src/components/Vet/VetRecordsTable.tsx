import { useEffect, useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { supabase } from '../../lib/supabase';
import { VetRecord, Dog } from '../../types/database';

interface VetRecordWithDog extends VetRecord {
  dog?: Dog;
}

interface VetRecordsTableProps {
  onAddClick: () => void;
  onEditClick: (record: VetRecordWithDog) => void;
  refreshTrigger?: number;
}

export function VetRecordsTable({ onAddClick, onEditClick, refreshTrigger }: VetRecordsTableProps) {
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
        <h2 className="text-2xl font-bold text-stone-900">Veterinary Records</h2>
        <Button onClick={onAddClick}>
          <Plus size={20} className="mr-2" />
          Add Record
        </Button>
      </div>

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
                    {new Date(record.visit_date).toLocaleDateString()}
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
                          {new Date(record.next_visit_date).toLocaleDateString()}
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
  );
}
