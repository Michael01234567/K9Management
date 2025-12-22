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
  DogHandlerPair,
  ItemWithQuantity,
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
  const [manualStatusChange, setManualStatusChange] = useState(false);

  const [formData, setFormData] = useState({
    date: mission?.date || new Date().toISOString().split('T')[0],
    mission_location_id: mission?.mission_location_id || '',
    departure_time: mission?.departure_time || '',
    return_time: mission?.return_time || '',
    explosive_teams: mission?.explosive_teams || [] as DogHandlerPair[],
    narcotic_teams: mission?.narcotic_teams || [] as DogHandlerPair[],
    handler_ids: mission?.handler_ids || [],
    mission_officer_id: mission?.mission_officer_id || '',
    team_leader_id: mission?.team_leader_id || '',
    driver_id: mission?.driver_id || '',
    training: mission?.training || false,
    search: mission?.search || false,
    num_items_searched: mission?.num_items_searched || 0,
    items_with_quantities: mission?.items_with_quantities || [] as ItemWithQuantity[],
    indication: mission?.indication || false,
    confirmed_indication: mission?.confirmed_indication || false,
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
          explosive_teams: mission.explosive_teams || [],
          narcotic_teams: mission.narcotic_teams || [],
          handler_ids: mission.handler_ids || [],
          mission_officer_id: mission.mission_officer_id || '',
          team_leader_id: mission.team_leader_id || '',
          driver_id: mission.driver_id || '',
          training: mission.training,
          search: mission.search,
          num_items_searched: mission.num_items_searched,
          items_with_quantities: mission.items_with_quantities || [],
          indication: mission.indication,
          confirmed_indication: mission.confirmed_indication,
          comments: mission.comments || '',
          status: mission.status,
        });
        setManualStatusChange(false);
      } else {
        setManualStatusChange(false);
      }
    }
  }, [isOpen, mission]);

  useEffect(() => {
    if (!manualStatusChange) {
      if (formData.return_time && formData.return_time.trim() !== '') {
        setFormData((prev) => ({ ...prev, status: 'Completed' }));
      } else if (!mission || mission.return_time !== formData.return_time) {
        if (formData.status === 'Completed') {
          setFormData((prev) => ({ ...prev, status: 'Active' }));
        }
      }
    }
  }, [formData.return_time, manualStatusChange]);

  useEffect(() => {
    updateHandlerIdsFromTeams();
  }, [formData.explosive_teams, formData.narcotic_teams]);

  useEffect(() => {
    const totalItems = formData.items_with_quantities.reduce((sum, item) => sum + item.quantity, 0);
    setFormData((prev) => ({ ...prev, num_items_searched: totalItems }));
  }, [formData.items_with_quantities]);

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

  const updateHandlerIdsFromTeams = () => {
    const handlerIds = new Set<string>();
    formData.explosive_teams.forEach((team) => {
      if (team.handler_id) handlerIds.add(team.handler_id);
    });
    formData.narcotic_teams.forEach((team) => {
      if (team.handler_id) handlerIds.add(team.handler_id);
    });
    setFormData((prev) => ({ ...prev, handler_ids: Array.from(handlerIds) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.status === 'Cancelled' && !formData.comments) {
      alert('Comments are required when cancelling a mission.');
      return;
    }

    setLoading(true);
    try {
      const explosive_dog_ids = formData.explosive_teams.map((t) => t.dog_id);
      const narcotic_dog_ids = formData.narcotic_teams.map((t) => t.dog_id);

      const missionData = {
        date: formData.date,
        mission_location_id: formData.mission_location_id || null,
        departure_time: formData.departure_time || null,
        return_time: formData.return_time || null,
        explosive_dog_ids,
        narcotic_dog_ids,
        explosive_teams: formData.explosive_teams,
        narcotic_teams: formData.narcotic_teams,
        handler_ids: formData.handler_ids,
        mission_officer_id: formData.mission_officer_id || null,
        team_leader_id: formData.team_leader_id || null,
        driver_id: formData.driver_id || null,
        training: formData.training,
        search: formData.search,
        num_items_searched: formData.num_items_searched,
        items_searched_ids: formData.items_with_quantities.map((i) => i.item_id),
        items_with_quantities: formData.items_with_quantities,
        indication: formData.indication,
        confirmed_indication: formData.confirmed_indication,
        comments: formData.comments || null,
        status: formData.status,
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

  const handleExplosiveDogToggle = (dogId: string) => {
    const exists = formData.explosive_teams.find((t) => t.dog_id === dogId);
    if (exists) {
      setFormData((prev) => ({
        ...prev,
        explosive_teams: prev.explosive_teams.filter((t) => t.dog_id !== dogId),
      }));
    } else {
      const dog = dogs.find((d) => d.id === dogId);
      const defaultHandlerId = dog?.default_handler_id || '';
      setFormData((prev) => ({
        ...prev,
        explosive_teams: [...prev.explosive_teams, { dog_id: dogId, handler_id: defaultHandlerId }],
      }));
    }
  };

  const handleNarcoticDogToggle = (dogId: string) => {
    const exists = formData.narcotic_teams.find((t) => t.dog_id === dogId);
    if (exists) {
      setFormData((prev) => ({
        ...prev,
        narcotic_teams: prev.narcotic_teams.filter((t) => t.dog_id !== dogId),
      }));
    } else {
      const dog = dogs.find((d) => d.id === dogId);
      const defaultHandlerId = dog?.default_handler_id || '';
      setFormData((prev) => ({
        ...prev,
        narcotic_teams: [...prev.narcotic_teams, { dog_id: dogId, handler_id: defaultHandlerId }],
      }));
    }
  };

  const handleExplosiveHandlerChange = (dogId: string, handlerId: string) => {
    setFormData((prev) => ({
      ...prev,
      explosive_teams: prev.explosive_teams.map((t) =>
        t.dog_id === dogId ? { ...t, handler_id: handlerId } : t
      ),
    }));
  };

  const handleNarcoticHandlerChange = (dogId: string, handlerId: string) => {
    setFormData((prev) => ({
      ...prev,
      narcotic_teams: prev.narcotic_teams.map((t) =>
        t.dog_id === dogId ? { ...t, handler_id: handlerId } : t
      ),
    }));
  };

  const handleItemToggle = (itemId: string) => {
    const exists = formData.items_with_quantities.find((i) => i.item_id === itemId);
    if (exists) {
      setFormData((prev) => ({
        ...prev,
        items_with_quantities: prev.items_with_quantities.filter((i) => i.item_id !== itemId),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        items_with_quantities: [...prev.items_with_quantities, { item_id: itemId, quantity: 1 }],
      }));
    }
  };

  const handleItemQuantityChange = (itemId: string, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      items_with_quantities: prev.items_with_quantities.map((i) =>
        i.item_id === itemId ? { ...i, quantity } : i
      ),
    }));
  };

  const handleStatusChange = (newStatus: typeof formData.status) => {
    setManualStatusChange(true);
    setFormData({ ...formData, status: newStatus });
  };

  const teamLeaders = handlers.filter((h) => h.team_leader);
  const drivers = handlers.filter((h) => h.driver);
  const explosiveDogs = dogs.filter((d) => d.specialization === 'Explosive');
  const narcoticDogs = dogs.filter((d) => d.specialization === 'Narcotic');

  const allHandlerOptions = [
    ...handlers,
    ...missionOfficers.map((officer) => ({
      id: officer.id,
      employee_id: officer.employee_id,
      full_name: `${officer.full_name} (Officer)`,
      email: officer.email,
      phone: officer.phone,
      picture_url: officer.picture_url,
      team_leader: false,
      driver: false,
      created_at: officer.created_at,
      updated_at: officer.updated_at,
    })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mission ? 'Edit Mission' : 'Create Mission'}>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto px-1">
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
          <label className="block text-sm font-medium text-stone-700 mb-2">Explosive Dogs & Handlers</label>
          <div className="border border-stone-300 rounded-md p-3 max-h-60 overflow-y-auto bg-red-50/30 space-y-2">
            {explosiveDogs.length > 0 ? (
              explosiveDogs.map((dog) => {
                const team = formData.explosive_teams.find((t) => t.dog_id === dog.id);
                const isSelected = !!team;
                return (
                  <div key={dog.id} className="bg-white rounded-md p-2 border border-red-100">
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleExplosiveDogToggle(dog.id)}
                        className="rounded border-stone-300"
                      />
                      <span className="text-sm font-semibold text-stone-900">{dog.name}</span>
                    </label>
                    {isSelected && (
                      <div className="ml-6">
                        <Select
                          value={team?.handler_id || ''}
                          onChange={(e) => handleExplosiveHandlerChange(dog.id, e.target.value)}
                          options={[
                            { value: '', label: 'Select Handler' },
                            ...allHandlerOptions.map((h) => ({ value: h.id, label: h.full_name })),
                          ]}
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-stone-500">No explosive dogs available</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Narcotic Dogs & Handlers</label>
          <div className="border border-stone-300 rounded-md p-3 max-h-60 overflow-y-auto bg-green-50/30 space-y-2">
            {narcoticDogs.length > 0 ? (
              narcoticDogs.map((dog) => {
                const team = formData.narcotic_teams.find((t) => t.dog_id === dog.id);
                const isSelected = !!team;
                return (
                  <div key={dog.id} className="bg-white rounded-md p-2 border border-green-100">
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleNarcoticDogToggle(dog.id)}
                        className="rounded border-stone-300"
                      />
                      <span className="text-sm font-semibold text-stone-900">{dog.name}</span>
                    </label>
                    {isSelected && (
                      <div className="ml-6">
                        <Select
                          value={team?.handler_id || ''}
                          onChange={(e) => handleNarcoticHandlerChange(dog.id, e.target.value)}
                          options={[
                            { value: '', label: 'Select Handler' },
                            ...allHandlerOptions.map((h) => ({ value: h.id, label: h.full_name })),
                          ]}
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-stone-500">No narcotic dogs available</p>
            )}
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-stone-700">Items Searched with Quantities</label>
                <div className="px-3 py-1 bg-blue-100 rounded-md">
                  <span className="text-xs font-medium text-blue-900">Total: {formData.num_items_searched}</span>
                </div>
              </div>
              <div className="border border-stone-300 rounded-md p-3 max-h-60 overflow-y-auto space-y-2">
                {items.map((item) => {
                  const itemWithQty = formData.items_with_quantities.find((i) => i.item_id === item.id);
                  const isSelected = !!itemWithQty;
                  return (
                    <div key={item.id} className="bg-stone-50 rounded-md p-2">
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleItemToggle(item.id)}
                          className="rounded border-stone-300"
                        />
                        <span className="text-sm text-stone-700">{item.name}</span>
                      </label>
                      {isSelected && (
                        <div className="ml-6">
                          <Input
                            type="number"
                            min="1"
                            value={itemWithQty?.quantity || 1}
                            onChange={(e) => handleItemQuantityChange(item.id, parseInt(e.target.value) || 1)}
                            placeholder="Quantity"
                            className="text-sm"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.indication}
                  onChange={(e) => setFormData({ ...formData, indication: e.target.checked })}
                  className="rounded border-stone-300"
                />
                <span className="text-sm font-medium text-stone-700">Indication</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.confirmed_indication}
                  onChange={(e) => setFormData({ ...formData, confirmed_indication: e.target.checked })}
                  className="rounded border-stone-300"
                />
                <span className="text-sm font-medium text-stone-700">Confirmed Indication</span>
              </label>
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {MISSION_STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusChange(status)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  formData.status === status
                    ? status === 'Active'
                      ? 'bg-green-600 text-white'
                      : status === 'On Standby'
                      ? 'bg-yellow-600 text-white'
                      : status === 'Emergency'
                      ? 'bg-red-600 text-white'
                      : status === 'Cancelled'
                      ? 'bg-gray-600 text-white'
                      : 'bg-blue-600 text-white'
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

        <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
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
