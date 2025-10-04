import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Textarea } from '../UI/Textarea';
import { supabase } from '../../lib/supabase';
import { Dog, Handler, TRAINING_LEVELS, SEX_OPTIONS, SPECIALIZATION_TYPES } from '../../types/database';

interface DogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  dog?: Dog | null;
}

export function DogForm({ isOpen, onClose, onSave, dog }: DogFormProps) {
  const [loading, setLoading] = useState(false);
  const [handlers, setHandlers] = useState<Handler[]>([]);
  const [selectedHandlers, setSelectedHandlers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    sex: 'Male',
    microchip_number: '',
    dob: '',
    training_level: 'Phase 1',
    specialization: '',
    location: '',
    origin: '',
    note: '',
  });

  useEffect(() => {
    loadHandlers();
  }, []);

  useEffect(() => {
    if (dog) {
      setFormData({
        name: dog.name,
        breed: dog.breed,
        sex: dog.sex,
        microchip_number: dog.microchip_number || '',
        dob: dog.dob,
        training_level: dog.training_level,
        specialization: dog.specialization || '',
        location: dog.location || '',
        origin: dog.origin || '',
        note: dog.note || '',
      });
      loadDogHandlers(dog.id);
    } else {
      setFormData({
        name: '',
        breed: '',
        sex: 'Male',
        microchip_number: '',
        dob: '',
        training_level: 'Phase 1',
        specialization: '',
        location: '',
        origin: '',
        note: '',
      });
      setSelectedHandlers([]);
    }
  }, [dog, isOpen]);

  const loadHandlers = async () => {
    const { data } = await supabase.from('handlers').select('*').order('full_name');
    setHandlers(data || []);
  };

  const loadDogHandlers = async (dogId: string) => {
    const { data } = await supabase.from('dog_handler').select('handler_id').eq('dog_id', dogId);
    setSelectedHandlers(data?.map((dh) => dh.handler_id) || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (dog) {
        const { error } = await supabase.from('dogs').update(formData).eq('id', dog.id);
        if (error) throw error;

        await supabase.from('dog_handler').delete().eq('dog_id', dog.id);

        if (selectedHandlers.length > 0) {
          const { error: handlerError } = await supabase.from('dog_handler').insert(
            selectedHandlers.map((handlerId) => ({
              dog_id: dog.id,
              handler_id: handlerId,
            }))
          );
          if (handlerError) throw handlerError;
        }
      } else {
        const { data: newDog, error } = await supabase
          .from('dogs')
          .insert(formData)
          .select()
          .single();
        if (error) throw error;

        if (selectedHandlers.length > 0 && newDog) {
          const { error: handlerError } = await supabase.from('dog_handler').insert(
            selectedHandlers.map((handlerId) => ({
              dog_id: newDog.id,
              handler_id: handlerId,
            }))
          );
          if (handlerError) throw handlerError;
        }
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving dog:', error);
      alert('Error saving dog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleHandler = (handlerId: string) => {
    setSelectedHandlers((prev) =>
      prev.includes(handlerId) ? prev.filter((id) => id !== handlerId) : [...prev, handlerId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={dog ? 'Edit Dog' : 'Add New Dog'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Breed *"
            value={formData.breed}
            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
            required
          />
          <Select
            label="Sex *"
            value={formData.sex}
            onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
            options={SEX_OPTIONS.map((sex) => ({ value: sex, label: sex }))}
            required
          />
          <Input
            label="Date of Birth *"
            type="date"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            required
          />
          <Input
            label="Microchip Number"
            value={formData.microchip_number}
            onChange={(e) => setFormData({ ...formData, microchip_number: e.target.value })}
          />
          <Select
            label="Training Level *"
            value={formData.training_level}
            onChange={(e) => setFormData({ ...formData, training_level: e.target.value })}
            options={TRAINING_LEVELS.map((level) => ({ value: level, label: level }))}
            required
          />
          <Select
            label="Specialization"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            options={[
              { value: '', label: 'Select Specialization' },
              ...SPECIALIZATION_TYPES.map((spec) => ({ value: spec, label: spec })),
            ]}
          />
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Base location or kennel"
          />
          <Input
            label="Origin"
            value={formData.origin}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            placeholder="Breeder or source"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Assign Handlers</label>
          <div className="border border-stone-300 rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
            {handlers.length > 0 ? (
              handlers.map((handler) => (
                <label key={handler.id} className="flex items-center space-x-3 cursor-pointer hover:bg-stone-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={selectedHandlers.includes(handler.id)}
                    onChange={() => toggleHandler(handler.id)}
                    className="w-4 h-4 text-amber-900 border-stone-300 rounded focus:ring-amber-500"
                  />
                  <span className="text-stone-900">{handler.full_name}</span>
                </label>
              ))
            ) : (
              <p className="text-stone-500 text-sm">No handlers available. Create handlers first.</p>
            )}
          </div>
        </div>

        <Textarea
          label="Notes"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          rows={4}
          placeholder="Additional information about the dog..."
        />

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-4 sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth className="sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} fullWidth className="sm:w-auto">
            {loading ? 'Saving...' : dog ? 'Update Dog' : 'Add Dog'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
