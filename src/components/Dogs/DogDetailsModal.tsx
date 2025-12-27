import { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { CreditCard as Edit, Trash2, Calendar, Activity } from 'lucide-react';
import { DogWithHandlers, VetRecord, FitnessLog, FitnessStatus, Handler, MissionOfficer } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { Card } from '../UI/Card';
import { FitnessStatusBadge } from '../UI/FitnessStatusBadge';
import { formatDate, formatDateTime } from '../../utils/dateFormat';

interface DogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dog: DogWithHandlers | null;
  onEdit: (dog: DogWithHandlers) => void;
  onDelete: (dogId: string) => void;
}

export function DogDetailsModal({ isOpen, onClose, dog, onEdit, onDelete }: DogDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'personnel' | 'vet' | 'fitness'>('info');
  const [vetRecords, setVetRecords] = useState<VetRecord[]>([]);
  const [fitnessLogs, setFitnessLogs] = useState<FitnessLog[]>([]);
  const [fitnessStatus, setFitnessStatus] = useState<FitnessStatus | null>(null);
  const [fitnessHandler, setFitnessHandler] = useState<Handler | null>(null);
  const [officers, setOfficers] = useState<MissionOfficer[]>([]);

  useEffect(() => {
    if (dog && isOpen) {
      loadVetRecords();
      loadFitnessLogs();
      loadFitnessStatus();
      loadOfficers();
    }
  }, [dog, isOpen]);

  const loadVetRecords = async () => {
    if (!dog) return;
    const { data } = await supabase
      .from('vet_records')
      .select('*')
      .eq('dog_id', dog.id)
      .order('visit_date', { ascending: false });
    setVetRecords(data || []);
  };

  const loadFitnessLogs = async () => {
    if (!dog) return;
    const { data } = await supabase
      .from('fitness_logs')
      .select('*')
      .eq('dog_id', dog.id)
      .order('log_date', { ascending: false })
      .limit(10);
    setFitnessLogs(data || []);
  };

  const loadFitnessStatus = async () => {
    if (!dog) return;
    const { data: statusData } = await supabase
      .from('fitness_status')
      .select('*')
      .eq('dog_id', dog.id)
      .maybeSingle();

    setFitnessStatus(statusData || null);

    if (statusData?.handler_id) {
      const { data: handlerData } = await supabase
        .from('handlers')
        .select('*')
        .eq('id', statusData.handler_id)
        .maybeSingle();
      setFitnessHandler(handlerData || null);
    } else {
      setFitnessHandler(null);
    }
  };

  const loadOfficers = async () => {
    if (!dog) return;
    const { data: dogOfficers } = await supabase
      .from('dog_officer')
      .select('officer_id')
      .eq('dog_id', dog.id);

    const officerIds = dogOfficers?.map((dh) => dh.officer_id) || [];

    if (officerIds.length > 0) {
      const { data: officersData } = await supabase
        .from('mission_officers')
        .select('*')
        .in('id', officerIds);
      setOfficers(officersData || []);
    } else {
      setOfficers([]);
    }
  };

  const handleDelete = async () => {
    if (!dog || !confirm('Are you sure you want to delete this dog? This action cannot be undone.')) return;
    await onDelete(dog.id);
    onClose();
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + today.getMonth() - birthDate.getMonth();
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    return years > 0 ? `${years} years, ${months} months` : `${months} months`;
  };

  if (!dog) return null;

  const tabs = [
    { id: 'info', label: 'General Info' },
    { id: 'personnel', label: 'Personnel' },
    { id: 'vet', label: 'Vet Records' },
    { id: 'fitness', label: 'Fitness' },
  ] as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={dog.name} size="xl">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Button onClick={() => onEdit(dog)} size="sm" fullWidth className="sm:w-auto">
          <Edit size={16} className="mr-2" />
          Edit
        </Button>
        <Button onClick={handleDelete} variant="danger" size="sm" fullWidth className="sm:w-auto">
          <Trash2 size={16} className="mr-2" />
          Delete
        </Button>
      </div>

      <div className="border-b border-stone-200 mb-4 sm:mb-6 overflow-x-auto">
        <div className="flex space-x-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-amber-900 text-amber-900'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-stone-700">Name</label>
              <p className="mt-1 text-stone-900">{dog.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700">Age</label>
              <p className="mt-1 text-stone-900">{calculateAge(dog.dob)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700">Date of Birth</label>
              <p className="mt-1 text-stone-900">{formatDate(dog.dob)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700">Breed</label>
              <p className="mt-1 text-stone-900">{dog.breed}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700">Sex</label>
              <p className="mt-1 text-stone-900">{dog.sex}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700">Microchip Number</label>
              <p className="mt-1 text-stone-900">{dog.microchip_number || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700">Training Level</label>
              <p className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900">
                  {dog.training_level}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700">Specialization</label>
              <p className="mt-1">
                {dog.specialization ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-900">
                    {dog.specialization}
                  </span>
                ) : (
                  <span className="text-stone-400">N/A</span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700">Fitness Status</label>
              <p className="mt-1">
                <FitnessStatusBadge status={dog.fitness_status} />
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700">Location</label>
              <p className="mt-1 text-stone-900">{dog.location || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700">Origin</label>
              <p className="mt-1 text-stone-900">{dog.origin || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-stone-700">Notes</label>
              <p className="mt-1 text-stone-900 whitespace-pre-wrap">{dog.note || 'No notes'}</p>
            </div>
          </div>
        )}

        {activeTab === 'personnel' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-stone-900 mb-4">Handlers</h3>
              {dog.handlers && dog.handlers.length > 0 ? (
                <div className="space-y-4">
                  {dog.handlers.map((handler) => (
                    <Card key={handler.id}>
                      <div className="p-4">
                        <h4 className="font-semibold text-stone-900 mb-2">{handler.full_name}</h4>
                        <p className="text-xs text-stone-500 mb-2">Employee ID: {handler.employee_id}</p>
                        <div className="space-y-1 text-sm text-stone-600">
                          {handler.email && <p>Email: {handler.email}</p>}
                          {handler.phone && <p>Phone: {handler.phone}</p>}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-stone-500 text-center py-4 text-sm">No handlers assigned</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-stone-900 mb-4">Mission Officers</h3>
              {officers.length > 0 ? (
                <div className="space-y-4">
                  {officers.map((officer) => (
                    <Card key={officer.id}>
                      <div className="p-4">
                        <h4 className="font-semibold text-stone-900 mb-2">{officer.full_name}</h4>
                        <p className="text-xs text-stone-500 mb-2">Employee ID: {officer.employee_id}</p>
                        <div className="space-y-1 text-sm text-stone-600">
                          {officer.email && <p>Email: {officer.email}</p>}
                          {officer.phone && <p>Phone: {officer.phone}</p>}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-stone-500 text-center py-4 text-sm">No officers assigned</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'vet' && (
          <div>
            {vetRecords.length > 0 ? (
              <div className="space-y-4">
                {vetRecords.map((record) => (
                  <Card key={record.id}>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-stone-900">{record.visit_type}</h4>
                          <p className="text-sm text-stone-600">
                            {formatDate(record.visit_date)}
                          </p>
                        </div>
                        <Calendar size={20} className="text-stone-400" />
                      </div>
                      {record.notes && <p className="text-sm text-stone-700 mb-2">{record.notes}</p>}
                      {record.next_visit_date && (
                        <p className="text-sm text-amber-900">
                          Next visit: {formatDate(record.next_visit_date)}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-stone-500 text-center py-8">No vet records</p>
            )}
          </div>
        )}

        {activeTab === 'fitness' && (
          <div className="space-y-6">
            {fitnessStatus ? (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-stone-900 mb-4">Current Fitness Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-stone-700">Status</label>
                      <div className="mt-1">
                        <FitnessStatusBadge status={fitnessStatus.status} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700">Handler</label>
                      <p className="mt-1 text-stone-900">{fitnessHandler?.full_name || 'Unassigned'}</p>
                    </div>
                    {fitnessStatus.weight_kg && (
                      <div>
                        <label className="text-sm font-medium text-stone-700">Weight</label>
                        <p className="mt-1 text-stone-900">{fitnessStatus.weight_kg} kg</p>
                      </div>
                    )}
                    {(fitnessStatus.duration_start || fitnessStatus.duration_end) && (
                      <div>
                        <label className="text-sm font-medium text-stone-700">Duration</label>
                        <p className="mt-1 text-stone-900">
                          {fitnessStatus.duration_start && formatDate(fitnessStatus.duration_start)}
                          {fitnessStatus.duration_start && fitnessStatus.duration_end && ' - '}
                          {fitnessStatus.duration_end && formatDate(fitnessStatus.duration_end)}
                        </p>
                      </div>
                    )}
                    {fitnessStatus.notes && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-stone-700">Notes</label>
                        <p className="mt-1 text-stone-900 whitespace-pre-wrap">{fitnessStatus.notes}</p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-stone-700">Last Updated</label>
                      <p className="mt-1 text-stone-600 text-sm">
                        {formatDateTime(fitnessStatus.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="p-6 text-center text-stone-500">
                  <p>No fitness status recorded</p>
                </div>
              </Card>
            )}

            <div>
              <h3 className="text-lg font-semibold text-stone-900 mb-4">Recent Fitness Logs</h3>
              {fitnessLogs.length > 0 ? (
                <div className="space-y-4">
                  {fitnessLogs.map((log) => (
                    <Card key={log.id}>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-stone-900">{log.activity_type}</h4>
                            <p className="text-sm text-stone-600">
                              {formatDate(log.log_date)}
                            </p>
                          </div>
                          <Activity size={20} className="text-stone-400" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {log.duration_minutes && <p>Duration: {log.duration_minutes} min</p>}
                          {log.distance_km && <p>Distance: {log.distance_km} km</p>}
                          {log.weight_kg && <p>Weight: {log.weight_kg} kg</p>}
                        </div>
                        {log.notes && <p className="text-sm text-stone-700 mt-2">{log.notes}</p>}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <div className="p-6 text-center text-stone-500">
                    <p>No fitness logs recorded</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
