import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Textarea } from '../UI/Textarea';
import { supabase } from '../../lib/supabase';
import { FitnessLog, Dog, ACTIVITY_TYPES } from '../../types/database';

interface FitnessLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  log?: FitnessLog | null;
}

export function FitnessLogForm({ isOpen, onClose, onSave, log }: FitnessLogFormProps) {
  const [loading, setLoading] = useState(false);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [formData, setFormData] = useState({
    dog_id: '',
    log_date: '',
    activity_type: 'Walk',
    duration_minutes: '',
    distance_km: '',
    weight_kg: '',
    notes: '',
  });

  useEffect(() => {
    loadDogs();
  }, []);

  useEffect(() => {
    if (log) {
      setFormData({
        dog_id: log.dog_id,
        log_date: log.log_date,
        activity_type: log.activity_type,
        duration_minutes: log.duration_minutes?.toString() || '',
        distance_km: log.distance_km?.toString() || '',
        weight_kg: log.weight_kg?.toString() || '',
        notes: log.notes || '',
      });
    } else {
      setFormData({
        dog_id: '',
        log_date: new Date().toISOString().split('T')[0],
        activity_type: 'Walk',
        duration_minutes: '',
        distance_km: '',
        weight_kg: '',
        notes: '',
      });
    }
  }, [log, isOpen]);

  const loadDogs = async () => {
    const { data } = await supabase.from('dogs').select('*').order('name');
    setDogs(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSubmit = {
        dog_id: formData.dog_id,
        log_date: formData.log_date,
        activity_type: formData.activity_type,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        distance_km: formData.distance_km ? parseFloat(formData.distance_km) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        notes: formData.notes || null,
      };

      if (log) {
        const { error } = await supabase.from('fitness_logs').update(dataToSubmit).eq('id', log.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('fitness_logs').insert(dataToSubmit);
        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving fitness log:', error);
      alert('Error saving fitness log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!log || !confirm('Are you sure you want to delete this fitness log?')) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('fitness_logs').delete().eq('id', log.id);
      if (error) throw error;
      onSave();
      onClose();
    } catch (error) {
      console.error('Error deleting fitness log:', error);
      alert('Error deleting fitness log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={log ? 'Edit Fitness Log' : 'Add Fitness Log'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Select
          label="Dog *"
          value={formData.dog_id}
          onChange={(e) => setFormData({ ...formData, dog_id: e.target.value })}
          options={[
            { value: '', label: 'Select a dog' },
            ...dogs.map((dog) => ({ value: dog.id, label: dog.name })),
          ]}
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Date *"
            type="date"
            value={formData.log_date}
            onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
            required
          />
          <Select
            label="Activity Type *"
            value={formData.activity_type}
            onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
            options={ACTIVITY_TYPES.map((type) => ({ value: type, label: type }))}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Duration (minutes)"
            type="number"
            min="0"
            value={formData.duration_minutes}
            onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
            placeholder="60"
          />
          <Input
            label="Distance (km)"
            type="number"
            step="0.1"
            min="0"
            value={formData.distance_km}
            onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
            placeholder="5.0"
          />
          <Input
            label="Weight (kg)"
            type="number"
            step="0.1"
            min="0"
            value={formData.weight_kg}
            onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
            placeholder="30.5"
          />
        </div>
        <Textarea
          label="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          placeholder="Performance notes, observations, weather conditions, etc..."
        />

        <div className="flex gap-4 justify-between">
          <div>
            {log && (
              <Button type="button" variant="danger" onClick={handleDelete} disabled={loading}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : log ? 'Update' : 'Add Log'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
