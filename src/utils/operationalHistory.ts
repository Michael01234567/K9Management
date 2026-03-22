import { Mission, Dog, Handler, MissionOfficer } from '../types/database';

export interface RawMissionData {
  missions: Mission[];
  dogs: Dog[];
  handlers: Handler[];
  officers: MissionOfficer[];
  locationMap: Map<string, string>;
}

export interface IndicationStats {
  confirmed: number;
  unconfirmed: number;
  total: number;
  confirmedPct: number;
  unconfirmedPct: number;
}

export interface LocationStat {
  name: string;
  count: number;
}

export interface MissionHistoryRow {
  id: string;
  label: string;
  date: string;
  location: string;
  indicationStatus: 'Confirmed' | 'Unconfirmed' | 'None';
}

export interface EntityHistory {
  totalMissions: number;
  locationsVisited: number;
  missionsWithIndications: number;
  indications: IndicationStats;
  locationStats: LocationStat[];
  missionRows: MissionHistoryRow[];
}

function filterByDate(missions: Mission[], dateFrom: string, dateTo: string): Mission[] {
  return missions.filter(m => {
    if (dateFrom && new Date(m.date) < new Date(dateFrom)) return false;
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(m.date) > to) return false;
    }
    return true;
  });
}

function deriveIndicationStats(missions: Mission[]): IndicationStats {
  let confirmed = 0;
  let unconfirmed = 0;

  missions.forEach(m => {
    if (m.indication) {
      if (m.confirmed_indication) confirmed++;
      else unconfirmed++;
    }
  });

  const total = confirmed + unconfirmed;
  return {
    confirmed,
    unconfirmed,
    total,
    confirmedPct: total > 0 ? Math.round((confirmed / total) * 100) : 0,
    unconfirmedPct: total > 0 ? Math.round((unconfirmed / total) * 100) : 0,
  };
}

function deriveLocationStats(missions: Mission[], locationMap: Map<string, string>): LocationStat[] {
  const counts = new Map<string, number>();
  missions.forEach(m => {
    const name = locationMap.get(m.mission_location_id || '') || 'Unknown';
    counts.set(name, (counts.get(name) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function buildMissionRows(missions: Mission[], locationMap: Map<string, string>): MissionHistoryRow[] {
  return missions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(m => ({
      id: m.id,
      label: `Mission ${m.date}`,
      date: m.date,
      location: locationMap.get(m.mission_location_id || '') || 'Unknown',
      indicationStatus: m.indication
        ? (m.confirmed_indication ? 'Confirmed' : 'Unconfirmed')
        : 'None',
    }));
}

function buildHistory(filteredMissions: Mission[], locationMap: Map<string, string>): EntityHistory {
  const indications = deriveIndicationStats(filteredMissions);
  const locationStats = deriveLocationStats(filteredMissions, locationMap);
  const uniqueLocations = new Set(locationStats.map(l => l.name)).size;

  return {
    totalMissions: filteredMissions.length,
    locationsVisited: uniqueLocations,
    missionsWithIndications: indications.confirmed + indications.unconfirmed,
    indications,
    locationStats,
    missionRows: buildMissionRows(filteredMissions, locationMap),
  };
}

export function computeDogHistory(
  dogId: string,
  missions: Mission[],
  locationMap: Map<string, string>,
  dateFrom: string,
  dateTo: string
): EntityHistory {
  const relevant = missions.filter(m =>
    (m.explosive_dog_ids || []).includes(dogId) ||
    (m.narcotic_dog_ids || []).includes(dogId)
  );
  const filtered = filterByDate(relevant, dateFrom, dateTo);
  return buildHistory(filtered, locationMap);
}

export function computeHandlerHistory(
  handlerId: string,
  missions: Mission[],
  locationMap: Map<string, string>,
  dateFrom: string,
  dateTo: string
): EntityHistory {
  const relevant = missions.filter(m => {
    const inExplosiveTeams = (m.explosive_teams || []).some(t => t.handler_id === handlerId);
    const inNarcoticTeams = (m.narcotic_teams || []).some(t => t.handler_id === handlerId);
    return inExplosiveTeams || inNarcoticTeams;
  });
  const filtered = filterByDate(relevant, dateFrom, dateTo);
  return buildHistory(filtered, locationMap);
}

export function computeOfficerHistory(
  officerId: string,
  missions: Mission[],
  locationMap: Map<string, string>,
  dateFrom: string,
  dateTo: string
): EntityHistory {
  const relevant = missions.filter(m => m.mission_officer_id === officerId);
  const filtered = filterByDate(relevant, dateFrom, dateTo);
  return buildHistory(filtered, locationMap);
}
