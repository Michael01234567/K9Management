import { MapPin, User, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../UI/Card';
import { MissionWithDetails } from '../../types/database';

interface MissionCardProps {
  mission: MissionWithDetails;
  onClick: (mission: MissionWithDetails) => void;
}

export function MissionCard({ mission, onClick }: MissionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500';
      case 'On Standby':
        return 'bg-yellow-500';
      case 'Emergency':
        return 'bg-red-500';
      case 'Cancelled':
        return 'bg-gray-400';
      case 'Completed':
        return 'bg-blue-500';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-700';
      case 'On Standby':
        return 'text-yellow-700';
      case 'Emergency':
        return 'text-red-700';
      case 'Cancelled':
        return 'text-gray-700';
      case 'Completed':
        return 'text-blue-700';
      default:
        return 'text-green-700';
    }
  };

  const explosiveTeams = mission.explosive_teams || [];
  const narcoticTeams = mission.narcotic_teams || [];

  const getHandlerForTeam = (handlerId: string) => {
    return mission.handlers?.find((h) => h.id === handlerId);
  };

  const getDogById = (dogId: string) => {
    return [...(mission.explosive_dogs || []), ...(mission.narcotic_dogs || [])].find((d) => d.id === dogId);
  };

  return (
    <Card
      className="!bg-amber-900 relative overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer border-amber-800"
      onClick={() => onClick(mission)}
    >
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor(mission.status)} shadow-lg`} />
        <span className="text-xs font-semibold text-white">
          {mission.status}
        </span>
      </div>

      <div className="p-5 space-y-4">
        <div className="pr-24">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              {mission.mission_location && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mission.mission_location.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-start gap-2 mb-1 group cursor-pointer"
                >
                  <MapPin size={16} className="text-white flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110" />
                  <h3 className="text-sm md:text-base font-bold text-white leading-tight group-hover:text-amber-200 transition-colors">
                    {mission.mission_location.name}
                  </h3>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {mission.mission_officer && (
            <div className="flex items-center gap-3 p-3 bg-amber-800/50 rounded-lg">
              {mission.mission_officer.picture_url ? (
                <img
                  src={mission.mission_officer.picture_url}
                  alt={mission.mission_officer.full_name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
              )}
              <div>
                <div className="text-xs text-amber-200 font-medium">Mission Officer</div>
                <div className="text-sm font-semibold text-white">{mission.mission_officer.full_name}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {mission.team_leader && (
              <div className="p-2 bg-amber-800/50 rounded-lg">
                <div className="text-xs text-amber-200 font-medium mb-1">Team Leader</div>
                <div className="text-sm font-semibold text-white">{mission.team_leader.full_name}</div>
              </div>
            )}
            {mission.driver && (
              <div className="p-2 bg-amber-800/50 rounded-lg">
                <div className="text-xs text-amber-200 font-medium mb-1">Driver</div>
                <div className="text-sm font-semibold text-white">{mission.driver.full_name}</div>
              </div>
            )}
          </div>

          {explosiveTeams.length > 0 && (
            <div className="p-3 bg-amber-800/50 rounded-lg border border-amber-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Explosive Teams</h4>
              </div>
              <div className="space-y-2">
                {explosiveTeams.map((team) => {
                  const dog = getDogById(team.dog_id);
                  const handler = getHandlerForTeam(team.handler_id);
                  return (
                    <div key={team.dog_id} className="flex items-center justify-between bg-white/10 rounded-md px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-white" />
                        <span className="text-sm font-semibold text-white">{dog?.name}</span>
                      </div>
                      {handler && (
                        <span className="text-xs text-amber-200">{handler.full_name}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {narcoticTeams.length > 0 && (
            <div className="p-3 bg-amber-800/50 rounded-lg border border-amber-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Narcotics Teams</h4>
              </div>
              <div className="space-y-2">
                {narcoticTeams.map((team) => {
                  const dog = getDogById(team.dog_id);
                  const handler = getHandlerForTeam(team.handler_id);
                  return (
                    <div key={team.dog_id} className="flex items-center justify-between bg-white/10 rounded-md px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-white" />
                        <span className="text-sm font-semibold text-white">{dog?.name}</span>
                      </div>
                      {handler && (
                        <span className="text-xs text-amber-200">{handler.full_name}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(mission.indication || mission.confirmed_indication) && (
            <div className="flex gap-2">
              {mission.indication && (
                <div className="flex-1 p-2 bg-orange-400/30 rounded-lg border border-orange-400">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-white" />
                    <span className="text-xs font-semibold text-white">Indication</span>
                  </div>
                </div>
              )}
              {mission.confirmed_indication && (
                <div className="flex-1 p-2 bg-emerald-400/30 rounded-lg border border-emerald-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-white" />
                    <span className="text-xs font-semibold text-white">Confirmed</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
