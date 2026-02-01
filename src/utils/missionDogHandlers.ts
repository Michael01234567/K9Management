import { Mission, Dog, Handler, MissionOfficer, DogHandlerPair } from '../types/database';

export interface DogWithMissionHandlers extends Dog {
  mission_handlers: (Handler | MissionOfficer)[];
}

export function getMissionScopedDogs(
  mission: Mission,
  allDogs: Dog[],
  allHandlers: Handler[],
  missionOfficer?: MissionOfficer,
  teamLeader?: Handler,
  driver?: Handler
): {
  explosiveDogs: DogWithMissionHandlers[];
  narcoticDogs: DogWithMissionHandlers[];
} {
  const dogMap = new Map(allDogs.map(d => [d.id, d]));
  const handlerMap = new Map(allHandlers.map(h => [h.id, h]));

  const allMissionPeople = new Map<string, Handler | MissionOfficer>();

  allHandlers.forEach(h => allMissionPeople.set(h.id, h));
  if (missionOfficer) allMissionPeople.set(missionOfficer.id, missionOfficer);
  if (teamLeader) allMissionPeople.set(teamLeader.id, teamLeader);
  if (driver) allMissionPeople.set(driver.id, driver);

  const enrichDogWithHandlers = (dogId: string, teams: DogHandlerPair[]): DogWithMissionHandlers | null => {
    const dog = dogMap.get(dogId);
    if (!dog) return null;

    const dogHandlerPairs = teams.filter(team => team.dog_id === dogId);
    const handlers: (Handler | MissionOfficer)[] = [];

    dogHandlerPairs.forEach(pair => {
      const person = allMissionPeople.get(pair.handler_id);
      if (person) {
        handlers.push(person);
      }
    });

    return {
      ...dog,
      mission_handlers: handlers
    };
  };

  const explosiveDogs = mission.explosive_dog_ids
    .map(dogId => enrichDogWithHandlers(dogId, mission.explosive_teams))
    .filter((dog): dog is DogWithMissionHandlers => dog !== null);

  const narcoticDogs = mission.narcotic_dog_ids
    .map(dogId => enrichDogWithHandlers(dogId, mission.narcotic_teams))
    .filter((dog): dog is DogWithMissionHandlers => dog !== null);

  return {
    explosiveDogs,
    narcoticDogs
  };
}
