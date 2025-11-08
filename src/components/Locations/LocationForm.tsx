import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Location } from '../../types/database';
import { Input } from '../UI/Input';
import { Textarea } from '../UI/Textarea';
import { Button } from '../UI/Button';
import { MapPin, Navigation } from 'lucide-react';

interface LocationFormProps {
  location?: Location;
  onSuccess: () => void;
  onCancel: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({ location, onSuccess, onCancel }) => {
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
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name,
        address: location.address || '',
        latitude: location.latitude?.toString() || '',
        longitude: location.longitude?.toString() || '',
        description: location.description || '',
      });
    }
  }, [location]);

  useEffect(() => {
    initializeMap();
  }, [formData.latitude, formData.longitude]);

  const initializeMap = () => {
    const mapContainer = document.getElementById('location-map');
    if (!mapContainer) return;

    const lat = formData.latitude ? parseFloat(formData.latitude) : 0;
    const lng = formData.longitude ? parseFloat(formData.longitude) : 0;

    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;

    mapContainer.innerHTML = `
      <iframe
        width="100%"
        height="300"
        frameborder="0"
        scrolling="no"
        marginheight="0"
        marginwidth="0"
        src="${mapUrl}"
        style="border: 1px solid #ccc; border-radius: 8px;">
      </iframe>
    `;
    setMapInitialized(true);
  };

  const getGeolocationErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location access denied. Please enable location permissions in your browser settings and try again.';
      case error.POSITION_UNAVAILABLE:
        return 'Location information is unavailable. Please check your device settings or enter coordinates manually.';
      case error.TIMEOUT:
        return 'Location request timed out. Please try again or enter coordinates manually.';
      default:
        return 'Unable to retrieve location. Please enter coordinates manually.';
    }
  };

  const checkSecureContext = (): boolean => {
    if (window.isSecureContext) {
      return true;
    }
    const isLocalhost = window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '[::1]';
    return isLocalhost;
  };

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please enter coordinates manually.');
      return;
    }

    if (!checkSecureContext()) {
      setError('Geolocation requires a secure connection (HTTPS). Please enter coordinates manually or use HTTPS.');
      return;
    }

    setGettingLocation(true);
    setError('');

    try {
      const permissionStatus = await navigator.permissions?.query({ name: 'geolocation' as PermissionName });
      if (permissionStatus && permissionStatus.state === 'denied') {
        setError('Location permission is blocked. Please enable it in your browser settings and reload the page.');
        setGettingLocation(false);
        return;
      }
    } catch (err) {
      console.log('Permission API not available, proceeding with geolocation request');
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(8),
          longitude: position.coords.longitude.toFixed(8),
        }));
        setGettingLocation(false);
        setError('');
      },
      (err) => {
        const errorMessage = getGeolocationErrorMessage(err);
        setError(errorMessage);
        setGettingLocation(false);
      },
      options
    );
  };

  const handleMapClick = () => {
    const lat = prompt('Enter latitude:');
    const lng = prompt('Enter longitude:');

    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);

      if (!isNaN(latNum) && !isNaN(lngNum)) {
        setFormData((prev) => ({
          ...prev,
          latitude: latNum.toFixed(8),
          longitude: lngNum.toFixed(8),
        }));
      } else {
        setError('Invalid coordinates entered');
      }
    }
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

      if (location) {
        const { error: updateError } = await supabase
          .from('locations')
          .update(dataToSave)
          .eq('id', location.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('locations')
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
        label="Location Name"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="e.g., Airport Terminal A"
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

        {formData.latitude && formData.longitude && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Interactive Map
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleMapClick}
              >
                Set Coordinates
              </Button>
            </div>
            <div
              id="location-map"
              className="w-full rounded-lg overflow-hidden cursor-pointer"
              onClick={handleMapClick}
              title="Click to set coordinates manually"
            ></div>
            <p className="text-xs text-gray-500">
              Click the map or "Set Coordinates" button to manually enter coordinates
            </p>
          </div>
        )}
      </div>

      <Textarea
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Additional details about this location"
        rows={3}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : location ? 'Update Location' : 'Add Location'}
        </Button>
      </div>
    </form>
  );
};

export default LocationForm;
