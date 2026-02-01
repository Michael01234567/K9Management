import { MapPin, Clock, User, Users, Edit, Trash2, MessageSquare, CheckCircle, AlertCircle, Package, Calendar } from 'lucide-react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { MissionWithDetails } from '../../types/database';
import { formatDate } from '../../utils/dateFormat';

interface MissionDetailsModalProps {
  mission: MissionWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (mission: MissionWithDetails) => void;
  onDelete: (missionId: string) => void;
}

export function MissionDetailsModal({ mission, isOpen, onClose, onEdit, onDelete }: MissionDetailsModalProps) {
  if (!mission) return null;

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
  const itemsWithQuantities = mission.items_with_quantities || [];

  const getItemById = (itemId: string) => {
    return mission.items_searched?.find((i) => i.id === itemId);
  };

  const handleEditClick = () => {
    onEdit(mission);
  };

  const handleDeleteClick = () => {
    onDelete(mission.id);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mission Details">
      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto px-1">
        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${getStatusColor(mission.status)} shadow-lg`} />
            <span className={`text-lg font-bold ${getStatusTextColor(mission.status)}`}>
              {mission.status}
            </span>
          </div>
          {mission.date && (
            <div className="flex items-center gap-2 text-stone-600">
              <Calendar size={16} />
              <span className="text-sm font-medium">{formatDate(mission.date)}</span>
            </div>
          )}
        </div>

        {mission.mission_location && (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={20} className="text-amber-700" />
              <h3 className="text-xl font-bold text-stone-900">{mission.mission_location.name}</h3>
            </div>
            {mission.mission_location.address && (
              <p className="text-sm text-stone-600 ml-7">{mission.mission_location.address}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mission.departure_time && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} className="text-blue-700" />
                <span className="text-xs font-medium text-blue-700 uppercase">Departure</span>
              </div>
              <span className="text-lg font-bold text-blue-900">{mission.departure_time}</span>
            </div>
          )}
          {mission.return_time && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} className="text-blue-700" />
                <span className="text-xs font-medium text-blue-700 uppercase">Return</span>
              </div>
              <span className="text-lg font-bold text-blue-900">{mission.return_time}</span>
            </div>
          )}
        </div>

        {mission.mission_officer && (
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
            <h4 className="text-xs font-bold text-stone-500 uppercase mb-3">Mission Officer</h4>
            <div className="flex items-center gap-3">
              {mission.mission_officer.picture_url ? (
                <img
                  src={mission.mission_officer.picture_url}
                  alt={mission.mission_officer.full_name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-300"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center">
                  <User size={24} className="text-amber-900" />
                </div>
              )}
              <div>
                <div className="text-base font-bold text-stone-900">{mission.mission_officer.full_name}</div>
                {mission.mission_officer.phone && (
                  <div className="text-sm text-stone-600">{mission.mission_officer.phone}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {(mission.team_leader || mission.driver) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mission.team_leader && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs font-bold text-blue-700 uppercase mb-2">Team Leader</div>
                <div className="text-base font-bold text-blue-900">{mission.team_leader.full_name}</div>
              </div>
            )}
            {mission.driver && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs font-bold text-blue-700 uppercase mb-2">Driver</div>
                <div className="text-base font-bold text-blue-900">{mission.driver.full_name}</div>
              </div>
            )}
          </div>
        )}

        {explosiveDogs.length > 0 && (
          <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <h4 className="text-sm font-bold text-red-900 uppercase tracking-wide">Explosive Teams</h4>
            </div>
            <div className="space-y-2">
              {explosiveDogs.map((dog) => {
                return (
                  <div key={dog.id} className="flex items-center justify-between bg-white/80 rounded-md px-3 py-2 border border-red-100">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-red-700" />
                      <span className="font-bold text-red-900">{dog.name}</span>
                    </div>
                    {dog.assigned_handler && (
                      <span className="text-sm text-red-700 font-medium">{dog.assigned_handler.full_name}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {narcoticDogs.length > 0 && (
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <h4 className="text-sm font-bold text-green-900 uppercase tracking-wide">Narcotics Teams</h4>
            </div>
            <div className="space-y-2">
              {narcoticDogs.map((dog) => {
                return (
                  <div key={dog.id} className="flex items-center justify-between bg-white/80 rounded-md px-3 py-2 border border-green-100">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-green-700" />
                      <span className="font-bold text-green-900">{dog.name}</span>
                    </div>
                    {dog.assigned_handler && (
                      <span className="text-sm text-green-700 font-medium">{dog.assigned_handler.full_name}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <div className="text-xs font-medium text-stone-500 mb-1">Training</div>
            <div className={`text-sm font-bold ${mission.training ? 'text-green-700' : 'text-stone-400'}`}>
              {mission.training ? 'Yes' : 'No'}
            </div>
          </div>
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <div className="text-xs font-medium text-stone-500 mb-1">Search</div>
            <div className={`text-sm font-bold ${mission.search ? 'text-green-700' : 'text-stone-400'}`}>
              {mission.search ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {mission.search && (
          <>
            {mission.num_items_searched > 0 && (
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div className="text-xs font-medium text-stone-500 mb-1">Total Items Searched</div>
                <div className="text-2xl font-bold text-stone-900">{mission.num_items_searched}</div>
              </div>
            )}

            {itemsWithQuantities.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Package size={18} className="text-slate-700" />
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Items Searched</h4>
                </div>
                <div className="space-y-2">
                  {itemsWithQuantities.map((itemWithQty) => {
                    const item = getItemById(itemWithQty.item_id);
                    return (
                      <div key={itemWithQty.item_id} className="flex items-center justify-between bg-white/80 rounded-md px-3 py-2 border border-slate-100">
                        <span className="font-medium text-slate-700">{item?.name}</span>
                        <span className="text-lg font-bold text-slate-900">{itemWithQty.quantity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {(mission.indication || mission.confirmed_indication) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mission.indication && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-300">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={20} className="text-orange-700" />
                      <span className="text-base font-bold text-orange-900">Indication</span>
                    </div>
                  </div>
                )}
                {mission.confirmed_indication && (
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={20} className="text-emerald-700" />
                      <span className="text-base font-bold text-emerald-900">Confirmed Indication</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {mission.comments && (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={18} className="text-amber-700" />
              <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wide">Comments</h4>
            </div>
            <p className="text-base text-stone-700 whitespace-pre-wrap leading-relaxed">{mission.comments}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-stone-200 sticky bottom-0 bg-white">
          <Button
            onClick={handleEditClick}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Edit size={16} className="mr-1" />
            Edit Mission
          </Button>
          <Button
            onClick={handleDeleteClick}
            variant="outline"
            size="sm"
            className="flex-1 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <Trash2 size={16} className="mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
