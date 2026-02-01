import { MissionWithDetails, Handler, MissionOfficer } from '../types/database';

export interface PersonnelWithDog {
  id: string;
  name: string;
  dogName: string;
}

export interface MissionPersonnelInfo {
  officer: MissionOfficer | undefined;
  teamLeader: Handler | undefined;
  handlersWithDogs: PersonnelWithDog[];
  teamLeaderHadDog: boolean;
  officerHadDog: boolean;
}

export function getMissionPersonnel(mission: MissionWithDetails): MissionPersonnelInfo {
  const allDogs = [...(mission.explosive_dogs || []), ...(mission.narcotic_dogs || [])];

  const handlerIdToDogsMap = new Map<string, string[]>();

  allDogs.forEach(dog => {
    if (dog.assigned_handler) {
      const existingDogs = handlerIdToDogsMap.get(dog.assigned_handler.id) || [];
      handlerIdToDogsMap.set(dog.assigned_handler.id, [...existingDogs, dog.name]);
    }
  });

  const teamLeaderHadDog = mission.team_leader_id
    ? handlerIdToDogsMap.has(mission.team_leader_id)
    : false;

  const handlersWithDogs: PersonnelWithDog[] = [];

  handlerIdToDogsMap.forEach((dogNames, handlerId) => {
    if (handlerId === mission.team_leader_id) {
      return;
    }

    const handler = allDogs.find(d => d.assigned_handler?.id === handlerId)?.assigned_handler;
    if (handler) {
      dogNames.forEach(dogName => {
        handlersWithDogs.push({
          id: handler.id,
          name: handler.full_name,
          dogName: dogName
        });
      });
    }
  });

  if (teamLeaderHadDog && mission.team_leader) {
    const teamLeaderDogs = handlerIdToDogsMap.get(mission.team_leader_id!) || [];
    teamLeaderDogs.forEach(dogName => {
      handlersWithDogs.unshift({
        id: mission.team_leader!.id,
        name: mission.team_leader!.full_name,
        dogName: dogName
      });
    });
  }

  return {
    officer: mission.mission_officer,
    teamLeader: mission.team_leader,
    handlersWithDogs,
    teamLeaderHadDog,
    officerHadDog: false
  };
}

export function formatHandlersWithDogs(handlersWithDogs: PersonnelWithDog[]): string {
  if (handlersWithDogs.length === 0) return 'None';

  const grouped = new Map<string, string[]>();
  handlersWithDogs.forEach(hwg => {
    const existing = grouped.get(hwg.name) || [];
    grouped.set(hwg.name, [...existing, hwg.dogName]);
  });

  const formatted: string[] = [];
  grouped.forEach((dogs, name) => {
    formatted.push(`${name} (K9 ${dogs.join(', K9 ')})`);
  });

  return formatted.join(', ');
}

export function getHandlerNamesOnly(handlersWithDogs: PersonnelWithDog[]): string[] {
  const uniqueNames = new Set(handlersWithDogs.map(hwg => hwg.name));
  return Array.from(uniqueNames);
}
