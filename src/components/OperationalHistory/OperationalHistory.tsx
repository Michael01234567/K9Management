import { useState, useEffect, useMemo } from 'react';
import { ClipboardList, Dog, Users, Shield, CalendarDays } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Mission, Dog as DogType, Handler, MissionOfficer } from '../../types/database';
import { AppLoader } from '../UI/AppLoader';
import { EntitySelector } from './EntitySelector';
import { KpiCards } from './KpiCards';
import { IndicationBar } from './IndicationBar';
import { LocationsTable } from './LocationsTable';
import { MissionHistoryTable } from './MissionHistoryTable';
import {
  computeDogHistory,
  computeHandlerHistory,
  computeOfficerHistory,
} from '../../utils/operationalHistory';

type EntityTab = 'dogs' | 'handlers' | 'officers';

interface RawData {
  missions: Mission[];
  dogs: DogType[];
  handlers: Handler[];
  officers: MissionOfficer[];
  locationMap: Map<string, string>;
}

export function OperationalHistory() {
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<RawData | null>(null);

  const [activeTab, setActiveTab] = useState<EntityTab>('dogs');
  const [selectedId, setSelectedId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    setSelectedId('');
  }, [activeTab]);

  async function fetchAll() {
    try {
      setLoading(true);
      const [missionsRes, dogsRes, handlersRes, officersRes, locationsRes] = await Promise.all([
        supabase.from('missions').select('*').order('date', { ascending: false }),
        supabase.from('dogs').select('id, name, specialization').order('name'),
        supabase.from('handlers').select('id, full_name, employee_id').order('full_name'),
        supabase.from('mission_officers').select('id, full_name, employee_id').order('full_name'),
        supabase.from('mission_locations').select('id, name'),
      ]);

      const locationMap = new Map<string, string>(
        (locationsRes.data || []).map(l => [l.id, l.name])
      );

      setRawData({
        missions: (missionsRes.data || []) as Mission[],
        dogs: (dogsRes.data || []) as DogType[],
        handlers: (handlersRes.data || []) as Handler[],
        officers: (officersRes.data || []) as MissionOfficer[],
        locationMap,
      });
    } catch (err) {
      console.error('Error fetching operational history data:', err);
    } finally {
      setLoading(false);
    }
  }

  const entityOptions = useMemo(() => {
    if (!rawData) return [];
    if (activeTab === 'dogs') {
      return rawData.dogs.map(d => ({
        id: d.id,
        name: d.name,
        badge: d.specialization || undefined,
      }));
    }
    if (activeTab === 'handlers') {
      return rawData.handlers.map(h => ({
        id: h.id,
        name: h.full_name,
        badge: h.employee_id || undefined,
      }));
    }
    return rawData.officers.map(o => ({
      id: o.id,
      name: o.full_name,
      badge: o.employee_id || undefined,
    }));
  }, [rawData, activeTab]);

  const history = useMemo(() => {
    if (!rawData || !selectedId) return null;
    const { missions, locationMap } = rawData;
    if (activeTab === 'dogs') return computeDogHistory(selectedId, missions, locationMap, dateFrom, dateTo);
    if (activeTab === 'handlers') return computeHandlerHistory(selectedId, missions, locationMap, dateFrom, dateTo);
    return computeOfficerHistory(selectedId, missions, locationMap, dateFrom, dateTo);
  }, [rawData, selectedId, activeTab, dateFrom, dateTo]);

  const tabs: { id: EntityTab; label: string; icon: React.ElementType }[] = [
    { id: 'dogs', label: 'Dogs', icon: Dog },
    { id: 'handlers', label: 'Handlers', icon: Users },
    { id: 'officers', label: 'Officers', icon: Shield },
  ];

  const selectorPlaceholder = {
    dogs: 'Select a Dog...',
    handlers: 'Select a Handler...',
    officers: 'Select an Officer...',
  }[activeTab];

  if (loading) return <AppLoader />;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-1">
          <ClipboardList className="w-7 h-7 text-amber-900" />
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Operational History</h1>
        </div>
        <p className="text-stone-500 text-sm md:text-base">
          Track mission participation and indication performance over time
        </p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 md:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
              <CalendarDays size={12} />
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-800/40 transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
              <CalendarDays size={12} />
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-800/40 transition-colors"
            />
          </div>
          {(dateFrom || dateTo) && (
            <div className="flex items-end">
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="px-3 py-2 text-xs text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap"
              >
                Clear dates
              </button>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">View By</p>
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-900 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
            {activeTab === 'dogs' ? 'Select Dog' : activeTab === 'handlers' ? 'Select Handler' : 'Select Officer'}
          </p>
          <EntitySelector
            options={entityOptions}
            selectedId={selectedId}
            onSelect={setSelectedId}
            placeholder={selectorPlaceholder}
          />
        </div>
      </div>

      {!selectedId && (
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm px-6 py-14 text-center">
          <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ClipboardList size={22} className="text-stone-400" />
          </div>
          <p className="text-stone-500 font-medium text-sm">Select an entity above to view its operational history</p>
          <p className="text-stone-400 text-xs mt-1">Choose a dog, handler, or officer to see mission statistics and performance</p>
        </div>
      )}

      {selectedId && history && (
        <div className="space-y-4 animate-fade-in">
          <KpiCards history={history} />

          <IndicationBar indications={history.indications} />

          <div className="grid md:grid-cols-2 gap-4">
            <LocationsTable locationStats={history.locationStats} />
            <div className="md:col-span-1" />
          </div>

          <MissionHistoryTable rows={history.missionRows} />
        </div>
      )}
    </div>
  );
}
