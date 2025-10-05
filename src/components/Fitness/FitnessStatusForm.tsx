import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Textarea } from '../UI/Textarea';
import { supabase } from '../../lib/supabase';
import { Dog, Handler, FITNESS_STATUS_OPTIONS } from '../../types/database';

interface FitnessStatusFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  fitnessStatus?: any | null;
}

export function FitnessStatusForm({ isOpen, onClose, onSave, fitnessStatus }: FitnessStatusFormProps) {
  const [loading, setLoading] = useState(false);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);
  const [assignedHandler, setAssignedHandler] = useState<Handler | null>(null);
  const [formData, setFormData] = useState({
    dog_id: '',
    weight_kg: '',
    status: 'Fit',
    duration_start: '',
    duration_end: '',
    notes: '',
  });

  useEffect(() => {
    loadDogs();
  }, []);

  useEffect(() => {
    if (fitnessStatus) {
      setFormData({
        dog_id: fitnessStatus.dog_id,
        weight_kg: fitnessStatus.weight_kg || '',
        status: fitnessStatus.status,
        duration_start: fitnessStatus.duration_start || '',
        duration_end: fitnessStatus.duration_end || '',
        notes: fitnessStatus.notes || '',
      });
      loadDogDetails(fitnessStatus.dog_id);
    } else {
      setFormData({
        dog_id: '',
        weight_kg: '',
        status: 'Fit',
        duration_start: '',
        duration_end: '',
        notes: '',
      });
      setSelectedDog(null);
      setAssignedHandler(null);
    }
  }, [fitnessStatus, isOpen]);

  const loadDogs = async () => {
    const { data } = await supabase.from('dogs').select('*').order('name');
    setDogs(data || []);
  };

  const loadDogDetails = async (dogId: string) => {
    const { data: dogData } = await supabase.from('dogs').select('*').eq('id', dogId).maybeSingle();
    if (dogData) {
      setSelectedDog(dogData);
      await loadDogHandler(dogId);
    }
  };

  const loadDogHandler = async (dogId: string) => {
    const { data: dhData } = await supabase
      .from('dog_handler')
      .select('handler_id')
      .eq('dog_id', dogId)
      .maybeSingle();

    if (dhData) {
      const { data: handlerData } = await supabase
        .from('handlers')
        .select('*')
        .eq('id', dhData.handler_id)
        .maybeSingle();
      setAssignedHandler(handlerData);
    } else {
      setAssignedHandler(null);
    }
  };

  const handleDogChange = async (dogId: string) => {
    setFormData({ ...formData, dog_id: dogId });
    if (dogId) {
      await loadDogDetails(dogId);
    } else {
      setSelectedDog(null);
      setAssignedHandler(null);
    }
  };

  const handleStatusChange = (status: string) => {
    if (status === 'Fit') {
      setFormData({
        ...formData,
        status,
        duration_start: '',
        duration_end: '',
      });
    } else {
      setFormData({ ...formData, status });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData: any = {
        dog_id: formData.dog_id,
        handler_id: assignedHandler?.id || null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        status: formData.status,
        duration_start: formData.status !== 'Fit' && formData.duration_start ? formData.duration_start : null,
        duration_end: formData.status !== 'Fit' && formData.duration_end ? formData.duration_end : null,
        notes: formData.notes || null,
      };

      if (selectedDog?.sex !== 'Female' && formData.status === 'Estrus') {
        alert('Estrus status can only be set for female dogs.');
        setLoading(false);
        return;
      }

      if (fitnessStatus) {
        const { error } = await supabase
          .from('fitness_status')
          .update(submitData)
          .eq('id', fitnessStatus.id);
        if (error) throw error;
      } else {
        const { data: existingStatus } = await supabase
          .from('fitness_status')
          .select('id')
          .eq('dog_id', formData.dog_id)
          .maybeSingle();

        if (existingStatus) {
          const { error } = await supabase
            .from('fitness_status')
            .update(submitData)
            .eq('id', existingStatus.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('fitness_status').insert(submitData);
          if (error) throw error;
        }
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving fitness status:', error);
      alert('Error saving fitness status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showDurationFields = formData.status !== 'Fit';
  const filteredStatusOptions = selectedDog?.sex === 'Female'
    ? FITNESS_STATUS_OPTIONS
    : FITNESS_STATUS_OPTIONS.filter(status => status !== 'Estrus');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fitnessStatus ? 'Edit Fitness Status' : 'Add Fitness Status'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Dog Name *"
            value={formData.dog_id}
            onChange={(e) => handleDogChange(e.target.value)}
            options={[
              { value: '', label: 'Select Dog' },
              ...dogs.map((dog) => ({ value: dog.id, label: dog.name })),
            ]}
            required
            disabled={!!fitnessStatus}
          />

          <Input
            label="Handler Name"
            value={assignedHandler?.full_name || 'No handler assigned'}
            disabled
          />

          <Input
            label="Dog Date of Birth"
            type="date"
            value={selectedDog?.dob || ''}
            disabled
          />

          <Input
            label="Dog Weight (kg)"
            type="number"
            step="0.01"
            value={formData.weight_kg}
            onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
            placeholder="Enter weight"
          />

          <Select
            label="Dog Fitness Status *"
            value={formData.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            options={filteredStatusOptions.map((status) => ({ value: status, label: status }))}
            required
          />

          {showDurationFields && (
            <>
              <Input
                label="Duration Start *"
                type="date"
                value={formData.duration_start}
                onChange={(e) => setFormData({ ...formData, duration_start: e.target.value })}
                required
              />
              <Input
                label="Duration End *"
                type="date"
                value={formData.duration_end}
                onChange={(e) => setFormData({ ...formData, duration_end: e.target.value })}
                required
              />
            </>
          )}
        </div>

        <Textarea
          label="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          placeholder="Additional notes about fitness status..."
        />

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth className="sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} fullWidth className="sm:w-auto">
            {loading ? 'Saving...' : fitnessStatus ? 'Update Status' : 'Add Status'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
