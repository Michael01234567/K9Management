import { useEffect, useState } from 'react';
import { Plus, TrendingUp, Download } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';
import { supabase } from '../../lib/supabase';
import { FitnessLog, Dog } from '../../types/database';
import { exportToExcel } from '../../utils/excelExport';

interface FitnessLogWithDog extends FitnessLog {
  dog?: Dog;
}

interface FitnessLogsTableProps {
  onAddClick: () => void;
  onEditClick: (log: FitnessLogWithDog) => void;
  refreshTrigger?: number;
}

export function FitnessLogsTable({ onAddClick, onEditClick, refreshTrigger }: FitnessLogsTableProps) {
  const [logs, setLogs] = useState<FitnessLogWithDog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [refreshTrigger]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const { data: logsData } = await supabase
        .from('fitness_logs')
        .select('*')
        .order('log_date', { ascending: false })
        .limit(50);

      const logsWithDogs = await Promise.all(
        (logsData || []).map(async (log) => {
          const { data: dog } = await supabase
            .from('dogs')
            .select('*')
            .eq('id', log.dog_id)
            .single();
          return { ...log, dog };
        })
      );

      setLogs(logsWithDogs);
    } catch (error) {
      console.error('Error loading fitness logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = logs.map((log) => ({
      Dog: log.dog?.name || 'Unknown',
      Breed: log.dog?.breed || 'N/A',
      Date: new Date(log.log_date).toLocaleDateString(),
      'Activity Type': log.activity_type,
      'Duration (min)': log.duration_minutes || 'N/A',
      'Distance (km)': log.distance_km || 'N/A',
      'Weight (kg)': log.weight_kg || 'N/A',
      Notes: log.notes || 'No notes',
      'Created At': new Date(log.created_at).toLocaleString(),
    }));
    exportToExcel(exportData, 'Fitness_Logs_Export', 'Fitness Logs');
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
        <h2 className="text-2xl font-bold text-stone-900">Fitness & Training Logs</h2>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download size={20} className="mr-2" />
            Export to Excel
          </Button>
          <Button onClick={onAddClick}>
            <Plus size={20} className="mr-2" />
            Add Log
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Dog</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Activity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Duration</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Distance</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Weight</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-stone-900">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => onEditClick(log)}
                  className="hover:bg-amber-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-stone-900">{log.dog?.name || 'Unknown'}</div>
                    <div className="text-xs text-stone-500">{log.dog?.breed}</div>
                  </td>
                  <td className="px-6 py-4 text-stone-700">
                    {new Date(log.log_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-900">
                      {log.activity_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-stone-700">
                    {log.duration_minutes ? `${log.duration_minutes} min` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-stone-700">
                    {log.distance_km ? `${log.distance_km} km` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-stone-700">
                    {log.weight_kg ? (
                      <div className="flex items-center">
                        <TrendingUp size={16} className="text-green-600 mr-1" />
                        {log.weight_kg} kg
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-6 py-4 text-stone-700 max-w-xs truncate">
                    {log.notes || 'No notes'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="text-center py-12 text-stone-500">
              No fitness logs found. Click "Add Log" to create your first entry.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
