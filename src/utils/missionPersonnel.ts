import { MissionWithDetails, Handler, MissionOfficer } from '../types/database';

export interface PersonnelWithDog {
  id: string;
  name: string;
  dogName: string;
}

export interface HandlerWithRole {
  id: string;
  name: string;
  role?: string;
}

export interface DogWithHandlers {
  dogId: string;
  dogName: string;
  handlers: HandlerWithRole[];
  specialization: string;
}

export interface MissionPersonnelInfo {
  officer: MissionOfficer | undefined;
  teamLeader: Handler | undefined;
  handlersWithDogs: PersonnelWithDog[];
  teamLeaderHadDog: boolean;
  officerHadDog: boolean;
}

export function getMissionPersonnel(mission: MissionWithDetails): MissionPersonnelInfo {
  const explosiveTeams = mission.explosive_teams || [];
  const narcoticTeams = mission.narcotic_teams || [];
  const allTeams = [...explosiveTeams, ...narcoticTeams];

  const allDogs = [...(mission.explosive_dogs || []), ...(mission.narcotic_dogs || [])];
  const allHandlers = mission.handlers || [];

  const handlerIdToDogsMap = new Map<string, string[]>();

  allTeams.forEach(team => {
    const dogName = allDogs.find(d => d.id === team.dog_id)?.name;
    if (dogName) {
      const existingDogs = handlerIdToDogsMap.get(team.handler_id) || [];
      handlerIdToDogsMap.set(team.handler_id, [...existingDogs, dogName]);
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

    const handler = allHandlers.find(h => h.id === handlerId);
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

export function getDogsWithAllHandlers(mission: MissionWithDetails): DogWithHandlers[] {
  const explosiveTeams = mission.explosive_teams || [];
  const narcoticTeams = mission.narcotic_teams || [];
  const allTeams = [...explosiveTeams, ...narcoticTeams];

  const allDogs = [...(mission.explosive_dogs || []), ...(mission.narcotic_dogs || [])];
  const allHandlers = mission.handlers || [];

  const dogToHandlersMap = new Map<string, Set<string>>();

  allTeams.forEach(team => {
    if (!dogToHandlersMap.has(team.dog_id)) {
      dogToHandlersMap.set(team.dog_id, new Set());
    }
    dogToHandlersMap.get(team.dog_id)!.add(team.handler_id);
  });

  const dogsWithHandlers: DogWithHandlers[] = [];

  dogToHandlersMap.forEach((handlerIds, dogId) => {
    const dog = allDogs.find(d => d.id === dogId);
    if (!dog) return;

    const handlers: HandlerWithRole[] = [];

    handlerIds.forEach(handlerId => {
      let personName = '';
      let role: string | undefined = undefined;

      if (mission.mission_officer?.id === handlerId) {
        personName = mission.mission_officer.full_name;
        role = 'Officer';
      } else if (mission.team_leader?.id === handlerId) {
        personName = mission.team_leader.full_name;
        role = 'TL';
      } else if (mission.driver?.id === handlerId) {
        personName = mission.driver.full_name;
        role = 'Driver';
      } else {
        const handler = allHandlers.find(h => h.id === handlerId);
        if (handler) {
          personName = handler.full_name;
        }
      }

      if (personName) {
        handlers.push({
          id: handlerId,
          name: personName,
          role: role
        });
      }
    });

    dogsWithHandlers.push({
      dogId: dog.id,
      dogName: dog.name,
      handlers: handlers,
      specialization: dog.specialization || 'Unknown'
    });
  });

  const explosiveDogs = dogsWithHandlers.filter(d => d.specialization === 'Explosive Detection');
  const narcoticDogs = dogsWithHandlers.filter(d => d.specialization === 'Narcotics Detection');

  return [...explosiveDogs, ...narcoticDogs];
}
