import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import { Textarea } from '../UI/Textarea';
import { supabase } from '../../lib/supabase';
import {
  Mission,
  MissionWithDetails,
  MissionLocation,
  Dog,
  Handler,
  MissionOfficer,
  Item,
  MISSION_STATUS_OPTIONS,
} from '../../types/database';

interface MissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  mission?: MissionWithDetails | null;
}

export function MissionForm({ isOpen, onClose, onSave, mission }: MissionFormProps) {
  const [loading, setLoading] = useState(false);
  const [missionLocations, setMissionLocations] = useState<MissionLocation[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [handlers, setHandlers] = useState<Handler[]>([]);
  const [missionOfficers, setMissionOfficers] = useState<MissionOfficer[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const [formData, setFormData] = useState({
    date: mission?.date || new Date().toISOString().split('T')[0],
    mission_location_id: mission?.mission_location_id || '',
    departure_time: mission?.departure_time || '',
    return_time: mission?.return_time || '',
    explosive_dog_ids: mission?.explosive_dog_ids || [],
    narcotic_dog_ids: mission?.narcotic_dog_ids || [],
    handler_ids: mission?.handler_ids || [],
    mission_officer_id: mission?.mission_officer_id || '',
    team_leader_id: mission?.team_leader_id || '',
    driver_id: mission?.driver_id || '',
    training: mission?.training || false,
    search: mission?.search || false,
    num_items_searched: mission?.num_items_searched || 0,
    items_searched_ids: mission?.items_searched_ids || [],
    comments: mission?.comments || '',
    status: mission?.status || 'Active',
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (mission) {
        setFormData({
          date: mission.date,
          mission_location_id: mission.mission_location_id || '',
          departure_time: mission.departure_time || '',
          return_time: mission.return_time || '',
          explosive_dog_ids: mission.explosive_dog_ids || [],
          narcotic_dog_ids: mission.narcotic_dog_ids || [],
          handler_ids: mission.handler_ids || [],
          mission_officer_id: mission.mission_officer_id || '',
          team_leader_id: mission.team_leader_id || '',
          driver_id: mission.driver_id || '',
          training: mission.training,
          search: mission.search,
          num_items_searched: mission.num_items_searched,
          items_searched_ids: mission.items_searched_ids || [],
          comments: mission.comments || '',
          status: mission.status,
        });
      }
    }
  }, [isOpen, mission]);

  useEffect(() => {
    autoPopulateHandlers();
  }, [formData.explosive_dog_ids, formData.narcotic_dog_ids]);

  const loadData = async () => {
    const [locationsRes, dogsRes, handlersRes, officersRes, itemsRes] = await Promise.all([
      supabase.from('mission_locations').select('*').order('name'),
      supabase.from('dogs').select('*').order('name'),
      supabase.from('handlers').select('*').order('full_name'),
      supabase.from('mission_officers').select('*').order('full_name'),
      supabase.from('items').select('*').order('name'),
    ]);

    if (locationsRes.data) setMissionLocations(locationsRes.data);
    if (dogsRes.data) setDogs(dogsRes.data);
    if (handlersRes.data) setHandlers(handlersRes.data);
    if (officersRes.data) setMissionOfficers(officersRes.data);
    if (itemsRes.data) setItems(itemsRes.data);
  };

  const autoPopulateHandlers = async () => {
    const allDogIds = [...formData.explosive_dog_ids, ...formData.narcotic_dog_ids];
    if (allDogIds.length === 0) {
      setFormData((prev) => ({ ...prev, handler_ids: [] }));
      return;
    }

    const handlerIds: string[] = [];
    for (const dogId of allDogIds) {
      const { data } = await supabase
        .from('dog_handler')
        .select('handler_id')
        .eq('dog_id', dogId)
        .maybeSingle();

      if (data && !handlerIds.includes(data.handler_id)) {
        handlerIds.push(data.handler_id);
      }
    }

    setFormData((prev) => ({ ...prev, handler_ids: handlerIds }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.status === 'Cancelled' && !formData.comments) {
      alert('Comments are required when cancelling a mission.');
      return;
    }

    setLoading(true);
    try {
      const missionData = {
        ...formData,
        mission_location_id: formData.mission_location_id || null,
        mission_officer_id: formData.mission_officer_id || null,
        team_leader_id: formData.team_leader_id || null,
        driver_id: formData.driver_id || null,
        departure_time: formData.departure_time || null,
        return_time: formData.return_time || null,
        updated_at: new Date().toISOString(),
      };

      if (mission) {
        const { error } = await supabase
          .from('missions')
          .update(missionData)
          .eq('id', mission.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('missions').insert([missionData]);
        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving mission:', error);
      alert('Failed to save mission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMultiSelect = (field: string, value: string) => {
    setFormData((prev) => {
      const currentValues = prev[field as keyof typeof prev] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((id) => id !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const teamLeaders = handlers.filter((h) => h.team_leader);
  const drivers = handlers.filter((h) => h.driver);
  const explosiveDogs = dogs.filter((d) => d.specialization === 'Explosive');
  const narcoticDogs = dogs.filter((d) => d.specialization === 'Narcotic');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mission ? 'Edit Mission' : 'Create Mission'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Date</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Mission Location</label>
            <Select
              value={formData.mission_location_id}
              onChange={(e) => setFormData({ ...formData, mission_location_id: e.target.value })}
              options={[
                { value: '', label: 'Select Location' },
                ...missionLocations.map((loc) => ({ value: loc.id, label: loc.name })),
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Departure Time</label>
            <Input
              type="time"
              value={formData.departure_time}
              onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Return Time</label>
            <Input
              type="time"
              value={formData.return_time}
              onChange={(e) => setFormData({ ...formData, return_time: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Explosive Dogs</label>
          <div className="border border-stone-300 rounded-md p-3 max-h-40 overflow-y-auto bg-red-50/30">
            {explosiveDogs.length > 0 ? (
              explosiveDogs.map((dog) => (
                <label key={dog.id} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-red-50 px-2 rounded">
                  <input
                    type="checkbox"
                    checked={formData.explosive_dog_ids.includes(dog.id)}
                    onChange={() => handleMultiSelect('explosive_dog_ids', dog.id)}
                    className="rounded border-stone-300"
                  />
                  <span className="text-sm text-stone-700">{dog.name}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-stone-500">No explosive dogs available</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Narcotic Dogs</label>
          <div className="border border-stone-300 rounded-md p-3 max-h-40 overflow-y-auto bg-green-50/30">
            {narcoticDogs.length > 0 ? (
              narcoticDogs.map((dog) => (
                <label key={dog.id} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-green-50 px-2 rounded">
                  <input
                    type="checkbox"
                    checked={formData.narcotic_dog_ids.includes(dog.id)}
                    onChange={() => handleMultiSelect('narcotic_dog_ids', dog.id)}
                    className="rounded border-stone-300"
                  />
                  <span className="text-sm text-stone-700">{dog.name}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-stone-500">No narcotic dogs available</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Handlers (Auto-populated)</label>
          <div className="border border-stone-300 rounded-md p-3 max-h-40 overflow-y-auto">
            {handlers.map((handler) => (
              <label key={handler.id} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-stone-50 px-2 rounded">
                <input
                  type="checkbox"
                  checked={formData.handler_ids.includes(handler.id)}
                  onChange={() => handleMultiSelect('handler_ids', handler.id)}
                  className="rounded border-stone-300"
                />
                <span className="text-sm text-stone-700">{handler.full_name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Mission Officer</label>
            <Select
              value={formData.mission_officer_id}
              onChange={(e) => setFormData({ ...formData, mission_officer_id: e.target.value })}
              options={[
                { value: '', label: 'Select Officer' },
                ...missionOfficers.map((officer) => ({ value: officer.id, label: officer.full_name })),
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Team Leader</label>
            <Select
              value={formData.team_leader_id}
              onChange={(e) => setFormData({ ...formData, team_leader_id: e.target.value })}
              options={[
                { value: '', label: 'Select Team Leader' },
                ...teamLeaders.map((leader) => ({ value: leader.id, label: leader.full_name })),
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Driver</label>
            <Select
              value={formData.driver_id}
              onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
              options={[
                { value: '', label: 'Select Driver' },
                ...drivers.map((driver) => ({ value: driver.id, label: driver.full_name })),
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.training}
              onChange={(e) => setFormData({ ...formData, training: e.target.checked })}
              className="rounded border-stone-300"
            />
            <span className="text-sm font-medium text-stone-700">Training</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.search}
              onChange={(e) => setFormData({ ...formData, search: e.target.checked })}
              className="rounded border-stone-300"
            />
            <span className="text-sm font-medium text-stone-700">Search</span>
          </label>
        </div>

        {formData.search && (
          <>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Number of Items Searched</label>
              <Input
                type="number"
                min="0"
                value={formData.num_items_searched}
                onChange={(e) => setFormData({ ...formData, num_items_searched: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Items Searched</label>
              <div className="border border-stone-300 rounded-md p-3 max-h-40 overflow-y-auto">
                {items.map((item) => (
                  <label key={item.id} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-stone-50 px-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.items_searched_ids.includes(item.id)}
                      onChange={() => handleMultiSelect('items_searched_ids', item.id)}
                      className="rounded border-stone-300"
                    />
                    <span className="text-sm text-stone-700">{item.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {MISSION_STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFormData({ ...formData, status })}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  formData.status === status
                    ? status === 'Active'
                      ? 'bg-green-600 text-white'
                      : status === 'On Standby'
                      ? 'bg-yellow-600 text-white'
                      : status === 'Emergency'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-600 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Comments {formData.status === 'Cancelled' && <span className="text-red-600">*</span>}
          </label>
          <Textarea
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            rows={4}
            placeholder="Enter any additional notes or comments..."
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Saving...' : mission ? 'Update Mission' : 'Create Mission'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
