import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { MissionLocation } from '../../types/database';
import { Input } from '../UI/Input';
import { Textarea } from '../UI/Textarea';
import { Button } from '../UI/Button';
import { MapPin, Navigation } from 'lucide-react';

interface MissionLocationFormProps {
  missionLocation?: MissionLocation;
  onSuccess: () => void;
  onCancel: () => void;
}

const MissionLocationForm: React.FC<MissionLocationFormProps> = ({ missionLocation, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    if (missionLocation) {
      setFormData({
        name: missionLocation.name,
        address: missionLocation.address || '',
        latitude: missionLocation.latitude?.toString() || '',
        longitude: missionLocation.longitude?.toString() || '',
        description: missionLocation.description || '',
      });
    }
  }, [missionLocation]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(8),
          longitude: position.coords.longitude.toFixed(8),
        }));
        setGettingLocation(false);
      },
      (err) => {
        setError('Unable to retrieve your location: ' + err.message);
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSave = {
        name: formData.name,
        address: formData.address || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        description: formData.description || null,
        updated_at: new Date().toISOString(),
      };

      if (missionLocation) {
        const { error: updateError } = await supabase
          .from('mission_locations')
          .update(dataToSave)
          .eq('id', missionLocation.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('mission_locations')
          .insert([dataToSave]);

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const openInMaps = () => {
    if (formData.latitude && formData.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${formData.latitude},${formData.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Input
        label="Mission Location Name"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="e.g., Border Crossing - Al Ghuwaifat"
      />

      <Input
        label="Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        placeholder="Physical address"
      />

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Coordinates
        </label>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            placeholder="e.g., 40.7128"
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            placeholder="e.g., -74.0060"
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleGetCurrentLocation}
            disabled={gettingLocation}
            className="flex-1"
          >
            <Navigation className="w-4 h-4 mr-2" />
            {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
          </Button>

          {formData.latitude && formData.longitude && (
            <Button
              type="button"
              variant="secondary"
              onClick={openInMaps}
            >
              <MapPin className="w-4 h-4 mr-2" />
              View on Map
            </Button>
          )}
        </div>
      </div>

      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Additional details about this mission location"
        rows={3}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : missionLocation ? 'Update Mission Location' : 'Add Mission Location'}
        </Button>
      </div>
    </form>
  );
};

export default MissionLocationForm;
