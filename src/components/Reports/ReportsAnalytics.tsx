import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { MissionReportsTable } from './MissionReportsTable';
import { ReportFilters } from './ReportFilters';
import { AppLoader } from '../UI/AppLoader';
import { BarChart3 } from 'lucide-react';

interface MissionData {
  id: string;
  name: string;
  status: string;
  date: string;
  notes: string;
  location: string;
  officer_name: string;
  handler_names: string[];
  dog_names: string[];
  handler_count: number;
  dog_count: number;
}

export function ReportsAnalytics() {
  const [missions, setMissions] = useState<MissionData[]>([]);
  const [filteredMissions, setFilteredMissions] = useState<MissionData[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytics' | 'reports'>('analytics');

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    location: '',
    status: '',
  });

  useEffect(() => {
    fetchMissionsData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [missions, filters]);

  async function fetchMissionsData() {
    try {
      setLoading(true);

      const { data: missionsData, error: missionsError } = await supabase
        .from('missions')
        .select(`
          id,
          date,
          status,
          comments,
          mission_officer_id,
          mission_location_id,
          handler_ids,
          explosive_dog_ids,
          narcotic_dog_ids
        `)
        .order('date', { ascending: false });

      if (missionsError) throw missionsError;

      const { data: locationData } = await supabase
        .from('mission_locations')
        .select('id, name');

      const locationMap = new Map(locationData?.map(loc => [loc.id, loc.name]) || []);

      const { data: officersData } = await supabase
        .from('mission_officers')
        .select('id, full_name');

      const officerMap = new Map(officersData?.map(off => [off.id, off.full_name]) || []);

      const { data: handlersData } = await supabase
        .from('handlers')
        .select('id, full_name');

      const handlerMap = new Map(handlersData?.map(h => [h.id, h.full_name]) || []);

      const { data: dogsData } = await supabase
        .from('dogs')
        .select('id, name');

      const dogMap = new Map(dogsData?.map(d => [d.id, d.name]) || []);

      const enrichedMissions: MissionData[] = (missionsData || []).map(mission => {
        const handlerIds = mission.handler_ids || [];
        const explosiveDogIds = mission.explosive_dog_ids || [];
        const narcoticDogIds = mission.narcotic_dog_ids || [];

        const allDogIds = [...explosiveDogIds, ...narcoticDogIds];

        const handlerNames = handlerIds
          .map((id: string) => handlerMap.get(id))
          .filter((name: string | undefined): name is string => !!name);

        const dogNames = allDogIds
          .map((id: string) => dogMap.get(id))
          .filter((name: string | undefined): name is string => !!name);

        return {
          id: mission.id,
          name: `Mission ${mission.date}`,
          status: mission.status,
          date: mission.date,
          notes: mission.comments || '',
          location: locationMap.get(mission.mission_location_id) || 'Unknown',
          officer_name: officerMap.get(mission.mission_officer_id) || 'Unknown',
          handler_names: handlerNames,
          dog_names: dogNames,
          handler_count: handlerNames.length,
          dog_count: dogNames.length,
        };
      });

      setMissions(enrichedMissions);

      const uniqueLocations = Array.from(new Set(enrichedMissions.map(m => m.location))).sort();
      setLocations(uniqueLocations);

    } catch (error) {
      console.error('Error fetching missions data:', error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...missions];

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(m => new Date(m.date) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(m => new Date(m.date) <= toDate);
    }

    if (filters.location) {
      filtered = filtered.filter(m => m.location === filters.location);
    }

    if (filters.status) {
      filtered = filtered.filter(m => m.status === filters.status);
    }

    setFilteredMissions(filtered);
  }

  function handleResetFilters() {
    setFilters({
      dateFrom: '',
      dateTo: '',
      location: '',
      status: '',
    });
  }

  if (loading) {
    return <AppLoader />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-stone-900">Reports & Analytics</h1>
        </div>
        <p className="text-stone-600">
          Mission insights, performance metrics, and detailed reports
        </p>
      </div>

      <div className="mb-6 flex gap-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Analytics Dashboard
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'reports'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Mission Reports
        </button>
      </div>

      {activeTab === 'analytics' ? (
        <>
          <ReportFilters
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            location={filters.location}
            status={filters.status}
            locations={locations}
            onDateFromChange={(value) => setFilters({ ...filters, dateFrom: value })}
            onDateToChange={(value) => setFilters({ ...filters, dateTo: value })}
            onLocationChange={(value) => setFilters({ ...filters, location: value })}
            onStatusChange={(value) => setFilters({ ...filters, status: value })}
            onReset={handleResetFilters}
          />
          <AnalyticsDashboard missions={filteredMissions} />
        </>
      ) : (
        <>
          <ReportFilters
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            location={filters.location}
            status={filters.status}
            locations={locations}
            onDateFromChange={(value) => setFilters({ ...filters, dateFrom: value })}
            onDateToChange={(value) => setFilters({ ...filters, dateTo: value })}
            onLocationChange={(value) => setFilters({ ...filters, location: value })}
            onStatusChange={(value) => setFilters({ ...filters, status: value })}
            onReset={handleResetFilters}
          />
          <MissionReportsTable missions={filteredMissions} filters={filters} />
        </>
      )}
    </div>
  );
}
