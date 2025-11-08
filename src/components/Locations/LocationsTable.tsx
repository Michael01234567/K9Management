import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Location } from '../../types/database';
import { Button } from '../UI/Button';
import { Edit2, Trash2, MapPin, Plus } from 'lucide-react';
import { Modal } from '../UI/Modal';
import LocationForm from './LocationForm';
import { Card } from '../UI/Card';

const LocationsTable: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | undefined>();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingLocation(undefined);
    setShowModal(true);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Error deleting location. It may be in use by dogs.');
    }
  };

  const handleSuccess = () => {
    setShowModal(false);
    setEditingLocation(undefined);
    fetchLocations();
  };

  const openInMaps = (latitude: number, longitude: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <div className="text-center py-8">Loading locations...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
        <h2 className="text-2xl font-bold text-stone-900">Locations</h2>
        <Button onClick={handleAdd} size="sm" className="w-full sm:w-auto">
          <Plus className="w-5 h-5 mr-2" />
          Add Location
        </Button>
      </div>

      <div className="hidden md:block">
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stone-200">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Coordinates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-200">
                {locations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-stone-500">
                      No locations found. Add your first location to get started.
                    </td>
                  </tr>
                ) : (
                  locations.map((location) => (
                    <tr key={location.id} className="hover:bg-stone-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-stone-900">{location.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-stone-700">
                          {location.address || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {location.latitude && location.longitude ? (
                          <button
                            onClick={(e) => openInMaps(location.latitude!, location.longitude!, e)}
                            className="flex items-center text-sm text-amber-900 hover:text-amber-700"
                          >
                            <MapPin className="w-4 h-4 mr-1" />
                            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                          </button>
                        ) : (
                          <span className="text-sm text-stone-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-stone-700 max-w-xs truncate">
                          {location.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(location)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(location.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="md:hidden space-y-3">
        {locations.length === 0 ? (
          <Card>
            <div className="text-center py-12 text-stone-500">
              <p className="text-lg">No locations found.</p>
              <p className="mt-2">Add your first location to get started.</p>
            </div>
          </Card>
        ) : (
          locations.map((location) => (
            <Card key={location.id} hover onClick={() => handleEdit(location)}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-stone-900 text-lg truncate">{location.name}</h3>
                    {location.address && (
                      <p className="text-sm text-stone-600 mt-1">{location.address}</p>
                    )}
                  </div>
                </div>

                {location.latitude && location.longitude && (
                  <button
                    onClick={(e) => openInMaps(location.latitude!, location.longitude!, e)}
                    className="flex items-center text-sm text-amber-900 hover:text-amber-700 mb-3 min-h-[44px] active:scale-95 transition-transform"
                  >
                    <MapPin className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
                  </button>
                )}

                {location.description && (
                  <p className="text-sm text-stone-600 border-t border-stone-200 pt-3 line-clamp-2">
                    {location.description}
                  </p>
                )}

                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-stone-200">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(location);
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(location.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingLocation(undefined);
        }}
        title={editingLocation ? 'Edit Location' : 'Add New Location'}
      >
        <LocationForm
          location={editingLocation}
          onSuccess={handleSuccess}
          onCancel={() => {
            setShowModal(false);
            setEditingLocation(undefined);
          }}
        />
      </Modal>
    </div>
  );
};

export default LocationsTable;
