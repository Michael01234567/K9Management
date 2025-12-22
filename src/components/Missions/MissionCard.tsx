import { MapPin, Clock, User, Users, Edit, Trash2, MessageSquare, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { MissionWithDetails } from '../../types/database';

interface MissionCardProps {
  mission: MissionWithDetails;
  onEdit: (mission: MissionWithDetails) => void;
  onDelete: (missionId: string) => void;
}

export function MissionCard({ mission, onEdit, onDelete }: MissionCardProps) {
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
  const itemsWithQuantities = mission.items_with_quantities || [];

  const getHandlerForTeam = (handlerId: string) => {
    return mission.handlers?.find((h) => h.id === handlerId);
  };

  const getDogById = (dogId: string) => {
    return [...(mission.explosive_dogs || []), ...(mission.narcotic_dogs || [])].find((d) => d.id === dogId);
  };

  const getItemById = (itemId: string) => {
    return mission.items_searched?.find((i) => i.id === itemId);
  };

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor(mission.status)} shadow-lg`} />
        <span className={`text-xs font-semibold ${getStatusTextColor(mission.status)}`}>
          {mission.status}
        </span>
      </div>

      <div className="p-5 space-y-4">
        <div className="pr-24">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              {mission.mission_location && (
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={18} className="text-amber-700 flex-shrink-0" />
                  <h3 className="text-lg font-bold text-stone-900 break-words">
                    {mission.mission_location.name}
                  </h3>
                </div>
              )}
              <div className="flex items-center gap-4 text-sm text-stone-600 flex-wrap">
                {mission.departure_time && (
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{mission.departure_time}</span>
                    {mission.return_time && <span>- {mission.return_time}</span>}
                  </div>
                )}
              </div>
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

          {explosiveTeams.length > 0 && (
            <div className="p-3 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <h4 className="text-xs font-bold text-red-900 uppercase tracking-wide">Explosive Teams</h4>
              </div>
              <div className="space-y-2">
                {explosiveTeams.map((team) => {
                  const dog = getDogById(team.dog_id);
                  const handler = getHandlerForTeam(team.handler_id);
                  return (
                    <div key={team.dog_id} className="flex items-center justify-between bg-white/60 rounded-md px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-red-700" />
                        <span className="text-sm font-semibold text-red-900">{dog?.name}</span>
                      </div>
                      {handler && (
                        <span className="text-xs text-red-700">{handler.full_name}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {narcoticTeams.length > 0 && (
            <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <h4 className="text-xs font-bold text-green-900 uppercase tracking-wide">Narcotics Teams</h4>
              </div>
              <div className="space-y-2">
                {narcoticTeams.map((team) => {
                  const dog = getDogById(team.dog_id);
                  const handler = getHandlerForTeam(team.handler_id);
                  return (
                    <div key={team.dog_id} className="flex items-center justify-between bg-white/60 rounded-md px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-green-700" />
                        <span className="text-sm font-semibold text-green-900">{dog?.name}</span>
                      </div>
                      {handler && (
                        <span className="text-xs text-green-700">{handler.full_name}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {itemsWithQuantities.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Package size={14} className="text-slate-700" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Items Searched</h4>
              </div>
              <div className="space-y-1.5">
                {itemsWithQuantities.map((itemWithQty) => {
                  const item = getItemById(itemWithQty.item_id);
                  return (
                    <div key={itemWithQty.item_id} className="flex items-center justify-between bg-white/60 rounded-md px-2 py-1">
                      <span className="text-sm text-slate-700">{item?.name}</span>
                      <span className="text-sm font-semibold text-slate-900">{itemWithQty.quantity}</span>
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

          {mission.comments && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-start gap-2">
                <MessageSquare size={14} className="text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-amber-700 font-medium mb-1">Comments</div>
                  <p className="text-sm text-stone-700 whitespace-pre-wrap break-words leading-relaxed">{mission.comments}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-stone-200">
            <Button
              onClick={() => onEdit(mission)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Edit size={16} className="mr-1" />
              Edit
            </Button>
            <Button
              onClick={() => onDelete(mission.id)}
              variant="outline"
              size="sm"
              className="flex-1 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
