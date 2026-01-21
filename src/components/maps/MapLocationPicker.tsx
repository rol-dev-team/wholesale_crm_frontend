import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';

interface MapLocationPickerProps {
  value?: { lat: number; lng: number; address?: string };
  onChange: (location: { lat: number; lng: number; address?: string }) => void;
  className?: string;
}

const GOOGLE_MAPS_KEY_STORAGE = 'google_maps_api_key';

const mapContainerStyle = {
  width: '100%',
  height: '200px',
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

export function MapLocationPicker({ value, onChange, className }: MapLocationPickerProps) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(GOOGLE_MAPS_KEY_STORAGE) || '');
  const [isKeySet, setIsKeySet] = useState(() => !!localStorage.getItem(GOOGLE_MAPS_KEY_STORAGE));
  const [searchQuery, setSearchQuery] = useState('');
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(
    value ? { lat: value.lat, lng: value.lng } : null
  );
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['places'],
  });

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem(GOOGLE_MAPS_KEY_STORAGE, apiKey.trim());
      setIsKeySet(true);
    }
  };

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({ lat, lng });
      
      // Reverse geocode
      const geocoder = new google.maps.Geocoder();
      try {
        const response = await geocoder.geocode({ location: { lat, lng } });
        const address = response.results[0]?.formatted_address || '';
        onChange({ lat, lng, address });
      } catch {
        onChange({ lat, lng });
      }
    }
  }, [onChange]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !map) return;

    const geocoder = new google.maps.Geocoder();
    try {
      const response = await geocoder.geocode({ address: searchQuery });
      if (response.results.length > 0) {
        const location = response.results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        const address = response.results[0].formatted_address;

        setMarkerPosition({ lat, lng });
        map.panTo({ lat, lng });
        map.setZoom(15);
        onChange({ lat, lng, address });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  useEffect(() => {
    if (value) {
      setMarkerPosition({ lat: value.lat, lng: value.lng });
    }
  }, [value?.lat, value?.lng]);

  if (!isKeySet) {
    return (
      <div className={`p-4 border rounded-lg bg-muted/50 space-y-3 ${className}`}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Google Maps API Key Required</span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="google-maps-key" className="text-xs">
            Enter your Google Maps API Key
          </Label>
          <Input
            id="google-maps-key"
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIza..."
            className="text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Get your API key from{' '}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google Cloud Console
            </a>
            {' '}→ Enable Maps JavaScript API
          </p>
          <Button type="button" size="sm" onClick={saveApiKey} disabled={!apiKey.trim()}>
            Save API Key
          </Button>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`p-4 border rounded-lg bg-destructive/10 text-sm text-destructive ${className}`}>
        Error loading Google Maps. Please check your API key.
        <Button
          type="button"
          variant="link"
          size="sm"
          className="p-0 h-auto ml-2"
          onClick={() => {
            localStorage.removeItem(GOOGLE_MAPS_KEY_STORAGE);
            setIsKeySet(false);
          }}
        >
          Reset API Key
        </Button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`p-4 border rounded-lg bg-muted/50 text-sm text-muted-foreground ${className}`}>
        Loading map...
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
            placeholder="Search location..."
            className="pl-9"
          />
        </div>
        <Button type="button" variant="secondary" onClick={handleSearch}>
          Search
        </Button>
      </div>

      {/* Map */}
      <div className="rounded-lg border overflow-hidden">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={markerPosition || defaultCenter}
          zoom={markerPosition ? 15 : 5}
          onClick={onMapClick}
          onLoad={onMapLoad}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {markerPosition && (
            <Marker
              position={markerPosition}
              draggable
              onDragEnd={async (e) => {
                if (e.latLng) {
                  const lat = e.latLng.lat();
                  const lng = e.latLng.lng();
                  setMarkerPosition({ lat, lng });

                  const geocoder = new google.maps.Geocoder();
                  try {
                    const response = await geocoder.geocode({ location: { lat, lng } });
                    const address = response.results[0]?.formatted_address || '';
                    onChange({ lat, lng, address });
                  } catch {
                    onChange({ lat, lng });
                  }
                }
              }}
            />
          )}
        </GoogleMap>
      </div>

      {/* Selected Location */}
      {value && (
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>
              {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
            </span>
          </div>
          {value.address && (
            <p className="pl-4 line-clamp-2">{value.address}</p>
          )}
        </div>
      )}
    </div>
  );
}