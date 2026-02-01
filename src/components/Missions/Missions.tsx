import { useEffect, useState } from 'react';
import { Plus, Calendar, Download } from 'lucide-react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { MissionCard } from './MissionCard';
import { MissionForm } from './MissionForm';
import { MissionDetailsModal } from './MissionDetailsModal';
import { supabase } from '../../lib/supabase';
import { MissionWithDetails } from '../../types/database';
import { exportToExcel } from '../../utils/excelExport';
import { formatDate } from '../../utils/dateFormat';
import { getMissionScopedDogs } from '../../utils/missionDogHandlers';

export function Missions() {
  const [missions, setMissions] = useState<MissionWithDetails[]>([]);
  const [filteredMissions, setFilteredMissions] = useState<MissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<MissionWithDetails | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadMissions();
  }, []);

  useEffect(() => {
    filterMissionsByDate();
  }, [missions, selectedDate]);

  const loadMissions = async () => {
    try {
      setLoading(true);
      const { data: missionsData, error } = await supabase
        .from('missions')
        .select('*')
        .order('departure_time', { ascending: true });

      if (error) throw error;

      const missionsWithDetails = await Promise.all(
        (missionsData || []).map(async (mission) => {
          const itemIds = (mission.items_with_quantities || []).map((item: any) => item.item_id);

          const [locationRes, explosiveDogsRes, narcoticDogsRes, handlersRes, officerRes, teamLeaderRes, driverRes, itemsRes] =
            await Promise.all([
              mission.mission_location_id
                ? supabase.from('mission_locations').select('*').eq('id', mission.mission_location_id).maybeSingle()
                : Promise.resolve({ data: null }),
              mission.explosive_dog_ids.length > 0
                ? supabase.from('dogs').select('*').in('id', mission.explosive_dog_ids)
                : Promise.resolve({ data: [] }),
              mission.narcotic_dog_ids.length > 0
                ? supabase.from('dogs').select('*').in('id', mission.narcotic_dog_ids)
                : Promise.resolve({ data: [] }),
              mission.handler_ids.length > 0
                ? supabase.from('handlers').select('*').in('id', mission.handler_ids)
                : Promise.resolve({ data: [] }),
              mission.mission_officer_id
                ? supabase.from('mission_officers').select('*').eq('id', mission.mission_officer_id).maybeSingle()
                : Promise.resolve({ data: null }),
              mission.team_leader_id
                ? supabase.from('handlers').select('*').eq('id', mission.team_leader_id).maybeSingle()
                : Promise.resolve({ data: null }),
              mission.driver_id
                ? supabase.from('handlers').select('*').eq('id', mission.driver_id).maybeSingle()
                : Promise.resolve({ data: null }),
              itemIds.length > 0
                ? supabase.from('items').select('*').in('id', itemIds)
                : Promise.resolve({ data: [] }),
            ]);

          const allDogs = [...(explosiveDogsRes.data || []), ...(narcoticDogsRes.data || [])];
          const allHandlers = handlersRes.data || [];

          const { explosiveDogs: explosiveDogsWithHandlers, narcoticDogs: narcoticDogsWithHandlers } =
            getMissionScopedDogs(
              mission,
              allDogs,
              allHandlers,
              officerRes.data || undefined,
              teamLeaderRes.data || undefined,
              driverRes.data || undefined
            );

          return {
            ...mission,
            mission_location: locationRes.data || undefined,
            explosive_dogs: explosiveDogsWithHandlers,
            narcotic_dogs: narcoticDogsWithHandlers,
            handlers: handlersRes.data || [],
            mission_officer: officerRes.data || undefined,
            team_leader: teamLeaderRes.data || undefined,
            driver: driverRes.data || undefined,
            items_searched: itemsRes.data || [],
          };
        })
      );

      setMissions(missionsWithDetails);
    } catch (error) {
      console.error('Error loading missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMissionsByDate = () => {
    const filtered = missions.filter((mission) => mission.date === selectedDate);
    setFilteredMissions(filtered);
  };

  const handleCardClick = (mission: MissionWithDetails) => {
    setSelectedMission(mission);
    setIsDetailsOpen(true);
  };

  const handleEdit = (mission: MissionWithDetails) => {
    setSelectedMission(mission);
    setIsDetailsOpen(false);
    setIsFormOpen(true);
  };

  const handleDelete = async (missionId: string) => {
    if (!confirm('Are you sure you want to delete this mission?')) return;

    try {
      const { error } = await supabase.from('missions').delete().eq('id', missionId);
      if (error) throw error;
      setIsDetailsOpen(false);
      loadMissions();
    } catch (error) {
      console.error('Error deleting mission:', error);
      alert('Failed to delete mission. Please try again.');
    }
  };

  const handleCreateNew = () => {
    setSelectedMission(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedMission(null);
  };

  const handleDetailsClose = () => {
    setIsDetailsOpen(false);
    setSelectedMission(null);
  };

  const handleFormSave = () => {
    loadMissions();
  };

  const handleExport = () => {
    const exportData = missions.map((mission) => ({
      Date: mission.date,
      Status: mission.status,
      'Departure Time': mission.departure_time || 'N/A',
      'Return Time': mission.return_time || 'N/A',
      Location: mission.mission_location?.name || 'N/A',
      Address: mission.mission_location?.address || 'N/A',
      'Mission Officer': mission.mission_officer?.full_name || 'N/A',
      'Team Leader': mission.team_leader?.full_name || 'N/A',
      Driver: mission.driver?.full_name || 'N/A',
      'Explosive Dogs': mission.explosive_dogs?.map((d) => d.name).join(', ') || 'None',
      'Narcotic Dogs': mission.narcotic_dogs?.map((d) => d.name).join(', ') || 'None',
      Handlers: mission.handlers?.map((h) => h.full_name).join(', ') || 'None',
      Training: mission.training ? 'Yes' : 'No',
      Search: mission.search ? 'Yes' : 'No',
      'Items Searched': mission.num_items_searched,
      'Items Details': mission.items_searched?.map((i) => i.name).join(', ') || 'None',
      Indication: mission.indication ? 'Yes' : 'No',
      'Confirmed Indication': mission.confirmed_indication ? 'Yes' : 'No',
      Comments: mission.comments || 'N/A',
    }));
    exportToExcel(exportData, 'Missions_Export', 'Missions');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Daily Missions</h1>
          <p className="text-stone-600 mt-1">Manage and view all missions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download size={18} className="sm:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button onClick={handleCreateNew} size="sm">
            <Plus size={18} className="mr-2" />
            Create Mission
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={18} />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredMissions.length === 0 ? (
        <div className="text-center py-16 bg-stone-50 rounded-lg border-2 border-dashed border-stone-300">
          <Calendar size={48} className="mx-auto text-stone-400 mb-4" />
          <h3 className="text-lg font-semibold text-stone-900 mb-2">No missions scheduled</h3>
          <p className="text-stone-600 mb-4">There are no missions for {formatDate(selectedDate)}.</p>
          <Button onClick={handleCreateNew} size="sm">
            <Plus size={18} className="mr-2" />
            Create First Mission
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} onClick={handleCardClick} />
          ))}
        </div>
      )}

      <MissionForm isOpen={isFormOpen} onClose={handleFormClose} onSave={handleFormSave} mission={selectedMission} />
      <MissionDetailsModal
        mission={selectedMission}
        isOpen={isDetailsOpen}
        onClose={handleDetailsClose}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
