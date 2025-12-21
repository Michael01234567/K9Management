import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Location } from '../../types/database';
import { Button } from '../UI/Button';
import { Edit2, Trash2, MapPin, Plus } from 'lucide-react';
import { Modal } from '../UI/Modal';
import LocationForm from './LocationForm';

const LocationsTable: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | undefined>();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchLocations();
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

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
    if (!confirm('Are you sure you want to delete this facility location?')) return;

    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('Error deleting facility location. It may be in use by dogs.');
    }
  };

  const handleSuccess = () => {
    setShowModal(false);
    setEditingLocation(undefined);
    fetchLocations();
  };

  const openInMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <div className="text-center py-8">Loading facility locations...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Facility Locations</h2>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Facility Location
        </Button>
      </div>

      {isMobile ? (
        <div className="grid gap-4">
          {locations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              No facility locations found. Add your first facility location to get started.
            </div>
          ) : (
            locations.map((location) => (
              <div key={location.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                  </div>

                  {location.address && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Address</p>
                      <p className="text-sm text-gray-700">{location.address}</p>
                    </div>
                  )}

                  {location.latitude && location.longitude && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Coordinates</p>
                      <button
                        onClick={() => openInMaps(location.latitude!, location.longitude!)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <MapPin className="w-4 h-4 mr-1" />
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </button>
                    </div>
                  )}

                  {location.description && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Description</p>
                      <p className="text-sm text-gray-700">{location.description}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(location)}
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(location.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coordinates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No facility locations found. Add your first facility location to get started.
                    </td>
                  </tr>
                ) : (
                  locations.map((location) => (
                    <tr key={location.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{location.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">
                          {location.address || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {location.latitude && location.longitude ? (
                          <button
                            onClick={() => openInMaps(location.latitude!, location.longitude!)}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <MapPin className="w-4 h-4 mr-1" />
                            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-xs truncate">
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
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingLocation(undefined);
        }}
        title={editingLocation ? 'Edit Facility Location' : 'Add New Facility Location'}
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
