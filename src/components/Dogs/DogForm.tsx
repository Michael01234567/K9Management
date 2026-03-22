import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Textarea } from '../UI/Textarea';
import { supabase } from '../../lib/supabase';
import {
  Dog,
  Handler,
  MissionOfficer,
  Location,
  TRAINING_LEVELS,
  SEX_OPTIONS,
  SPECIALIZATION_TYPES,
} from '../../types/database';
import {
  validateAllAssignments,
  AssignmentValidationState,
  EMPTY_VALIDATION,
} from '../../utils/assignmentValidation';
import { logAssignmentChanges, AssignmentSnapshot } from '../../utils/auditLog';

interface DogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  dog?: Dog | null;
}

export function DogForm({ isOpen, onClose, onSave, dog }: DogFormProps) {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [handlers, setHandlers] = useState<Handler[]>([]);
  const [officers, setOfficers] = useState<MissionOfficer[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedHandler, setSelectedHandler] = useState<string>('');
  const [selectedOfficer, setSelectedOfficer] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<AssignmentValidationState>(EMPTY_VALIDATION);
  const [submitError, setSubmitError] = useState<string>('');
  const beforeSnapshotRef = useRef<AssignmentSnapshot>({ handlerId: '', handlerName: '', officerId: '', officerName: '' });
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
    weight_kg: '',
    note: '',
  });

  useEffect(() => {
    loadHandlers();
    loadOfficers();
    loadLocations();
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
        weight_kg: dog.weight_kg?.toString() || '',
        note: dog.note || '',
      });
      loadDogHandlers(dog.id);
      loadDogOfficers(dog.id);
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
        weight_kg: '',
        note: '',
      });
      setSelectedHandler('');
      setSelectedOfficer('');
      beforeSnapshotRef.current = { handlerId: '', handlerName: '', officerId: '', officerName: '' };
    }
    setFieldErrors(EMPTY_VALIDATION);
    setSubmitError('');
  }, [dog, isOpen]);

  const loadHandlers = async () => {
    const { data } = await supabase.from('handlers').select('*').order('full_name');
    setHandlers(data || []);
  };

  const loadOfficers = async () => {
    const { data } = await supabase.from('mission_officers').select('*').order('full_name');
    setOfficers(data || []);
  };

  const loadLocations = async () => {
    const { data } = await supabase.from('locations').select('*').order('name');
    setLocations(data || []);
  };

  const loadDogHandlers = async (dogId: string) => {
    const { data } = await supabase
      .from('dog_handler')
      .select('handler_id, handlers(full_name)')
      .eq('dog_id', dogId)
      .maybeSingle();
    const handlerId = (data as any)?.handler_id || '';
    const handlerName = (data as any)?.handlers?.full_name || '';
    setSelectedHandler(handlerId);
    beforeSnapshotRef.current = { ...beforeSnapshotRef.current, handlerId, handlerName };
  };

  const loadDogOfficers = async (dogId: string) => {
    const { data } = await supabase
      .from('dog_officer')
      .select('officer_id, mission_officers(full_name)')
      .eq('dog_id', dogId)
      .maybeSingle();
    const officerId = (data as any)?.officer_id || '';
    const officerName = (data as any)?.mission_officers?.full_name || '';
    setSelectedOfficer(officerId);
    beforeSnapshotRef.current = { ...beforeSnapshotRef.current, officerId, officerName };
  };

  const runRealtimeValidation = useCallback(
    async (handlerId: string, officerId: string) => {
      if (!handlerId && !officerId) {
        setFieldErrors(EMPTY_VALIDATION);
        return;
      }
      setValidating(true);
      const errors = await validateAllAssignments(handlerId, officerId, dog?.id);
      setFieldErrors(errors);
      setValidating(false);
    },
    [dog?.id]
  );

  const handleHandlerChange = (handlerId: string) => {
    setSelectedHandler(handlerId);
    setSubmitError('');
    runRealtimeValidation(handlerId, selectedOfficer);
  };

  const handleOfficerChange = (officerId: string) => {
    setSelectedOfficer(officerId);
    setSubmitError('');
    runRealtimeValidation(selectedHandler, officerId);
  };

  const getNextAvailableName = async (baseName: string, excludeId?: string): Promise<string> => {
    const { data: existingDogs } = await supabase
      .from('dogs')
      .select('name')
      .or(`name.eq.${baseName},name.like.${baseName} %`);

    if (!existingDogs || existingDogs.length === 0) return baseName;

    const filteredDogs = excludeId
      ? existingDogs.filter((d) => d.name !== baseName || d.name === baseName)
      : existingDogs;

    if (
      filteredDogs.length === 0 ||
      (filteredDogs.length === 1 && filteredDogs[0].name === baseName && excludeId)
    ) {
      return baseName;
    }

    const pattern = new RegExp(`^${baseName}( (\\d+))?$`);
    const numbers = filteredDogs
      .map((d) => {
        const match = d.name.match(pattern);
        if (match) return match[2] ? parseInt(match[2], 10) : 1;
        return 0;
      })
      .filter((n) => n > 0);

    if (numbers.length === 0) return baseName;

    return `${baseName} ${Math.max(...numbers) + 1}`;
  };

  const hasBlockingErrors = () =>
    !!(fieldErrors.handlerError || fieldErrors.officerError || submitError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const finalErrors = await validateAllAssignments(selectedHandler, selectedOfficer, dog?.id);
    setFieldErrors(finalErrors);

    if (finalErrors.handlerError || finalErrors.officerError) {
      return;
    }

    setLoading(true);

    try {
      let finalName = formData.name.trim();

      if (dog) {
        if (dog.name !== finalName) {
          finalName = await getNextAvailableName(finalName, dog.id);
        }
      } else {
        finalName = await getNextAvailableName(finalName);
      }

      const dataToSave = {
        ...formData,
        name: finalName,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
      };

      if (dog) {
        const { error } = await supabase.from('dogs').update(dataToSave).eq('id', dog.id);
        if (error) throw error;

        await supabase.from('dog_handler').delete().eq('dog_id', dog.id);
        await supabase.from('dog_officer').delete().eq('dog_id', dog.id);

        if (selectedHandler) {
          const { error: handlerError } = await supabase
            .from('dog_handler')
            .insert({ dog_id: dog.id, handler_id: selectedHandler });
          if (handlerError) {
            setFieldErrors((prev) => ({ ...prev, handlerError: 'Failed to assign handler. Please try again.' }));
            setLoading(false);
            return;
          }
        }

        if (selectedOfficer) {
          const { error: officerError } = await supabase
            .from('dog_officer')
            .insert({ dog_id: dog.id, officer_id: selectedOfficer });
          if (officerError) {
            setFieldErrors((prev) => ({ ...prev, officerError: 'Failed to assign officer. Please try again.' }));
            setLoading(false);
            return;
          }
        }

        const afterHandlerName = handlers.find((h) => h.id === selectedHandler)?.full_name || '';
        const afterOfficerName = officers.find((o) => o.id === selectedOfficer)?.full_name || '';
        await logAssignmentChanges({
          dogId: dog.id,
          dogName: finalName,
          before: beforeSnapshotRef.current,
          after: { handlerId: selectedHandler, handlerName: afterHandlerName, officerId: selectedOfficer, officerName: afterOfficerName },
        });
      } else {
        const { data: newDog, error } = await supabase
          .from('dogs')
          .insert(dataToSave)
          .select()
          .single();
        if (error) throw error;

        if (selectedHandler && newDog) {
          const { error: handlerError } = await supabase
            .from('dog_handler')
            .insert({ dog_id: newDog.id, handler_id: selectedHandler });
          if (handlerError) {
            setFieldErrors((prev) => ({ ...prev, handlerError: 'Failed to assign handler. Please try again.' }));
            setLoading(false);
            return;
          }
        }

        if (selectedOfficer && newDog) {
          const { error: officerError } = await supabase
            .from('dog_officer')
            .insert({ dog_id: newDog.id, officer_id: selectedOfficer });
          if (officerError) {
            setFieldErrors((prev) => ({ ...prev, officerError: 'Failed to assign officer. Please try again.' }));
            setLoading(false);
            return;
          }
        }

        if (newDog && (selectedHandler || selectedOfficer)) {
          const afterHandlerName = handlers.find((h) => h.id === selectedHandler)?.full_name || '';
          const afterOfficerName = officers.find((o) => o.id === selectedOfficer)?.full_name || '';
          await logAssignmentChanges({
            dogId: newDog.id,
            dogName: finalName,
            before: { handlerId: '', handlerName: '', officerId: '', officerName: '' },
            after: { handlerId: selectedHandler, handlerName: afterHandlerName, officerId: selectedOfficer, officerName: afterOfficerName },
          });
        }
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error saving dog:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fieldErrorClass = 'border-red-400 bg-red-50';
  const fieldNormalClass = 'border-stone-300';

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
          <Select
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            options={[
              { value: '', label: 'Select Location' },
              ...locations.map((loc) => ({ value: loc.name, label: loc.name })),
            ]}
          />
          <Input
            label="Origin"
            value={formData.origin}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            placeholder="Breeder or source"
          />
          <Input
            label="Weight (kg)"
            type="number"
            step="0.01"
            value={formData.weight_kg}
            onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
            placeholder="e.g., 25.5"
          />
        </div>

        {submitError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{submitError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Assign Handler{' '}
              <span className="text-stone-500 text-xs">(max 1)</span>
            </label>
            <div
              className={`border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2 transition-colors ${
                fieldErrors.handlerError ? fieldErrorClass : fieldNormalClass
              }`}
            >
              <label className="flex items-center space-x-3 cursor-pointer hover:bg-stone-50 p-2 rounded">
                <input
                  type="radio"
                  name="handler"
                  checked={selectedHandler === ''}
                  onChange={() => handleHandlerChange('')}
                  className="w-4 h-4 text-amber-900 border-stone-300 focus:ring-amber-500"
                />
                <span className="text-stone-500 italic">None</span>
              </label>
              {handlers.length > 0 ? (
                handlers.map((handler) => (
                  <label
                    key={handler.id}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-stone-50 p-2 rounded"
                  >
                    <input
                      type="radio"
                      name="handler"
                      checked={selectedHandler === handler.id}
                      onChange={() => handleHandlerChange(handler.id)}
                      className="w-4 h-4 text-amber-900 border-stone-300 focus:ring-amber-500"
                    />
                    <span className="text-stone-900">{handler.full_name}</span>
                  </label>
                ))
              ) : (
                <p className="text-stone-500 text-sm">No handlers available.</p>
              )}
            </div>
            {fieldErrors.handlerError && (
              <div className="flex items-start gap-1.5 mt-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{fieldErrors.handlerError}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Assign Mission Officer{' '}
              <span className="text-stone-500 text-xs">(max 1)</span>
            </label>
            <div
              className={`border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2 transition-colors ${
                fieldErrors.officerError ? fieldErrorClass : fieldNormalClass
              }`}
            >
              <label className="flex items-center space-x-3 cursor-pointer hover:bg-stone-50 p-2 rounded">
                <input
                  type="radio"
                  name="officer"
                  checked={selectedOfficer === ''}
                  onChange={() => handleOfficerChange('')}
                  className="w-4 h-4 text-amber-900 border-stone-300 focus:ring-amber-500"
                />
                <span className="text-stone-500 italic">None</span>
              </label>
              {officers.length > 0 ? (
                officers.map((officer) => (
                  <label
                    key={officer.id}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-stone-50 p-2 rounded"
                  >
                    <input
                      type="radio"
                      name="officer"
                      checked={selectedOfficer === officer.id}
                      onChange={() => handleOfficerChange(officer.id)}
                      className="w-4 h-4 text-amber-900 border-stone-300 focus:ring-amber-500"
                    />
                    <span className="text-stone-900">{officer.full_name}</span>
                  </label>
                ))
              ) : (
                <p className="text-stone-500 text-sm">No officers available.</p>
              )}
            </div>
            {fieldErrors.officerError && (
              <div className="flex items-start gap-1.5 mt-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{fieldErrors.officerError}</p>
              </div>
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
          <Button
            type="submit"
            disabled={loading || validating || hasBlockingErrors()}
            fullWidth
            className="sm:w-auto"
          >
            {loading ? 'Saving...' : validating ? 'Validating...' : dog ? 'Update Dog' : 'Add Dog'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
