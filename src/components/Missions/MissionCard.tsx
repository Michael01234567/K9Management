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

  const explosiveDogs = mission.explosive_dogs || [];
  const narcoticDogs = mission.narcotic_dogs || [];

  return (
    <Card
      className="relative overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
      onClick={() => onClick(mission)}
    >
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor(mission.status)} shadow-lg`} />
        <span className={`text-xs font-semibold ${getStatusTextColor(mission.status)}`}>
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
                  <MapPin size={16} className="text-amber-700 flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110" />
                  <h3 className="text-sm md:text-base font-bold text-stone-900 leading-tight group-hover:text-amber-700 transition-colors">
                    {mission.mission_location.name}
                  </h3>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {mission.mission_officer && (
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
              {mission.mission_officer.picture_url ? (
                <img
                  src={mission.mission_officer.picture_url}
                  alt={mission.mission_officer.full_name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-amber-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
                  <User size={20} className="text-amber-900" />
                </div>
              )}
              <div>
                <div className="text-xs text-stone-500 font-medium">Mission Officer</div>
                <div className="text-sm font-semibold text-stone-900">{mission.mission_officer.full_name}</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {mission.team_leader && (
              <div className="p-2 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-700 font-medium mb-1">Team Leader</div>
                <div className="text-sm font-semibold text-blue-900">{mission.team_leader.full_name}</div>
              </div>
            )}
            {mission.driver && (
              <div className="p-2 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-700 font-medium mb-1">Driver</div>
                <div className="text-sm font-semibold text-blue-900">{mission.driver.full_name}</div>
              </div>
            )}
          </div>

          {explosiveDogs.length > 0 && (
            <div className="p-3 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <h4 className="text-xs font-bold text-red-900 uppercase tracking-wide">Explosive Teams</h4>
              </div>
              <div className="space-y-2">
                {explosiveDogs.map((dog) => {
                  const handlerName = dog.assigned_handler?.full_name || dog.assigned_officer?.full_name;
                  return (
                    <div key={dog.id} className="flex items-center justify-between bg-white/60 rounded-md px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-red-700" />
                        <span className="text-sm font-semibold text-red-900">{dog.name}</span>
                      </div>
                      {handlerName && (
                        <span className="text-xs text-red-700">{handlerName}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {narcoticDogs.length > 0 && (
            <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <h4 className="text-xs font-bold text-green-900 uppercase tracking-wide">Narcotics Teams</h4>
              </div>
              <div className="space-y-2">
                {narcoticDogs.map((dog) => {
                  const handlerName = dog.assigned_handler?.full_name || dog.assigned_officer?.full_name;
                  return (
                    <div key={dog.id} className="flex items-center justify-between bg-white/60 rounded-md px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-green-700" />
                        <span className="text-sm font-semibold text-green-900">{dog.name}</span>
                      </div>
                      {handlerName && (
                        <span className="text-xs text-green-700">{handlerName}</span>
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
                <div className="flex-1 p-2 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-orange-700" />
                    <span className="text-xs font-semibold text-orange-900">Indication</span>
                  </div>
                </div>
              )}
              {mission.confirmed_indication && (
                <div className="flex-1 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-700" />
                    <span className="text-xs font-semibold text-emerald-900">Confirmed</span>
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
