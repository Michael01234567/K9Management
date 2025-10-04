import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Textarea } from '../UI/Textarea';
import { supabase } from '../../lib/supabase';
import { VetRecord, Dog, VET_VISIT_TYPES } from '../../types/database';

interface VetRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  record?: VetRecord | null;
}

export function VetRecordForm({ isOpen, onClose, onSave, record }: VetRecordFormProps) {
  const [loading, setLoading] = useState(false);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [formData, setFormData] = useState({
    dog_id: '',
    visit_date: '',
    visit_type: 'Checkup',
    notes: '',
    next_visit_date: '',
  });

  useEffect(() => {
    loadDogs();
  }, []);

  useEffect(() => {
    if (record) {
      setFormData({
        dog_id: record.dog_id,
        visit_date: record.visit_date,
        visit_type: record.visit_type,
        notes: record.notes || '',
        next_visit_date: record.next_visit_date || '',
      });
    } else {
      setFormData({
        dog_id: '',
        visit_date: new Date().toISOString().split('T')[0],
        visit_type: 'Checkup',
        notes: '',
        next_visit_date: '',
      });
    }
  }, [record, isOpen]);

  const loadDogs = async () => {
    const { data } = await supabase.from('dogs').select('*').order('name');
    setDogs(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (record) {
        const { error } = await supabase.from('vet_records').update(formData).eq('id', record.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('vet_records').insert(formData);
        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving vet record:', error);
      alert('Error saving vet record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!record || !confirm('Are you sure you want to delete this vet record?')) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('vet_records').delete().eq('id', record.id);
      if (error) throw error;
      onSave();
      onClose();
    } catch (error) {
      console.error('Error deleting vet record:', error);
      alert('Error deleting vet record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={record ? 'Edit Vet Record' : 'Add Vet Record'}>
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
            label="Visit Date *"
            type="date"
            value={formData.visit_date}
            onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
            required
          />
          <Select
            label="Visit Type *"
            value={formData.visit_type}
            onChange={(e) => setFormData({ ...formData, visit_type: e.target.value })}
            options={VET_VISIT_TYPES.map((type) => ({ value: type, label: type }))}
            required
          />
        </div>
        <Input
          label="Next Visit Date"
          type="date"
          value={formData.next_visit_date}
          onChange={(e) => setFormData({ ...formData, next_visit_date: e.target.value })}
        />
        <Textarea
          label="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          placeholder="Diagnosis, treatments, medications, etc..."
        />

        <div className="flex gap-4 justify-between">
          <div>
            {record && (
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
              {loading ? 'Saving...' : record ? 'Update' : 'Add Record'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
