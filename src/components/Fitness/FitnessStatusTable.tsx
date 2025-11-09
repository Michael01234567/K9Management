import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, ArrowLeft, User, Calendar } from 'lucide-react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { supabase } from '../../lib/supabase';
import { FitnessStatusWithDetails } from '../../types/database';
import { FitnessStatusForm } from './FitnessStatusForm';

interface FitnessStatusTableProps {
  onReturn?: () => void;
}

export function FitnessStatusTable({ onReturn }: FitnessStatusTableProps = {}) {
  const [fitnessStatuses, setFitnessStatuses] = useState<FitnessStatusWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<FitnessStatusWithDetails | null>(null);

  useEffect(() => {
    loadFitnessStatuses();
  }, []);

  const loadFitnessStatuses = async () => {
    setLoading(true);
    try {
      const { data: statusData } = await supabase
        .from('fitness_status')
        .select('*')
        .order('updated_at', { ascending: false });

      if (statusData) {
        const statusesWithDetails = await Promise.all(
          statusData.map(async (status) => {
            const { data: dogData } = await supabase
              .from('dogs')
              .select('*')
              .eq('id', status.dog_id)
              .maybeSingle();

            let handlerData = null;
            if (status.handler_id) {
              const { data } = await supabase
                .from('handlers')
                .select('*')
                .eq('id', status.handler_id)
                .maybeSingle();
              handlerData = data;
            }

            return {
              ...status,
              dog: dogData || undefined,
              handler: handlerData || undefined,
            };
          })
        );

        setFitnessStatuses(statusesWithDetails);
      }
    } catch (error) {
      console.error('Error loading fitness statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (status: FitnessStatusWithDetails) => {
    setSelectedStatus(status);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this fitness status record?')) {
      return;
    }

    try {
      const { error } = await supabase.from('fitness_status').delete().eq('id', id);
      if (error) throw error;
      await loadFitnessStatuses();
    } catch (error) {
      console.error('Error deleting fitness status:', error);
      alert('Error deleting fitness status. Please try again.');
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedStatus(null);
  };

  const handleFormSave = async () => {
    await loadFitnessStatuses();
    handleFormClose();
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Fit':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Training Only':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Sick':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Estrus':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'After Care':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8 text-stone-500">Loading fitness statuses...</div>
      </Card>
    );
  }

  return (
    <>
      {onReturn && (
        <Button onClick={onReturn} variant="outline" size="sm" className="w-fit mb-4 lg:hidden">
          <ArrowLeft size={18} className="mr-2" />
          Back to Dashboard
        </Button>
      )}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center mb-4 md:mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-stone-900">Dog Fitness Status</h2>
          <p className="text-stone-600 mt-1 text-sm">Track and manage dog fitness conditions</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex-1 sm:flex-none" size="sm">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Add Fitness Status</span>
        </Button>
      </div>

      <div className="hidden md:block">
        <Card>
          {fitnessStatuses.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <p className="text-lg">No fitness status records found.</p>
              <p className="mt-2">Click the button above to add the first fitness status record.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Dog Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Handler
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Date of Birth
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Weight (kg)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                  {fitnessStatuses.map((status) => (
                    <tr key={status.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-stone-900">{status.dog?.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-stone-900">{status.handler?.full_name || 'Unassigned'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-stone-900">{formatDate(status.dog?.dob || null)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-stone-900">{status.weight_kg || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(status.status)}`}>
                          {status.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-stone-900">
                          {status.duration_start && status.duration_end
                            ? `${formatDate(status.duration_start)} - ${formatDate(status.duration_end)}`
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-stone-600 max-w-xs truncate">
                          {status.notes || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(status)}
                            className="text-amber-900 hover:text-amber-700 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(status.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <div className="md:hidden space-y-3">
        {fitnessStatuses.map((status) => (
          <Card key={status.id} hover>
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-stone-900 text-lg truncate">{status.dog?.name || 'N/A'}</h3>
                  <p className="text-sm text-stone-600">{status.dog?.breed || 'Unknown breed'}</p>
                </div>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ml-2 ${getStatusColor(status.status)}`}>
                  {status.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-stone-700">
                  <User size={14} className="mr-2 flex-shrink-0" />
                  <span>Handler: {status.handler?.full_name || 'Unassigned'}</span>
                </div>
                {status.weight_kg && (
                  <div className="flex items-center text-stone-700">
                    <Calendar size={14} className="mr-2 flex-shrink-0" />
                    <span>Weight: {status.weight_kg} kg</span>
                  </div>
                )}
                {status.duration_start && status.duration_end && (
                  <div className="flex items-center text-stone-700">
                    <Calendar size={14} className="mr-2 flex-shrink-0" />
                    <span>
                      {formatDate(status.duration_start)} - {formatDate(status.duration_end)}
                    </span>
                  </div>
                )}
                {status.notes && (
                  <div className="pt-2 border-t border-stone-200">
                    <p className="text-stone-600 text-xs line-clamp-2">{status.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-stone-200">
                <button
                  onClick={() => handleEdit(status)}
                  className="text-amber-900 hover:text-amber-700 transition-colors p-2"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(status.id)}
                  className="text-red-600 hover:text-red-800 transition-colors p-2"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {fitnessStatuses.length === 0 && (
          <Card>
            <div className="text-center py-12 text-stone-500">
              <p className="text-lg">No fitness status records found.</p>
              <p className="mt-2">Click the button above to add the first fitness status record.</p>
            </div>
          </Card>
        )}
      </div>

      <FitnessStatusForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        fitnessStatus={selectedStatus}
      />
    </>
  );
}
