import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Place } from '../types';
import { Bookmark, ExternalLink, Star, Navigation, MapPin } from 'lucide-react';

interface CityMapProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onSavePlace: (place: Place) => void;
  isPlaceSaved: (placeId: string) => boolean;
  userLocation: { lat: number; lng: number } | null;
  onLocateMe: () => void;
  onViewDetails: (place: Place) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Healthcare: '#EF4444',
  Transportation: '#3B82F6',
  Tourism: '#10B981',
  Shopping: '#F97316',
  Education: '#6366F1',
  Entertainment: '#8B5CF6',
  Restaurants: '#F59E0B',
  'Real Estate': '#06B6D4',
};

// Helper to create modern SVGs for map markers
const createCustomMarkerIcon = (category: string, isSelected: boolean) => {
  const color = CATEGORY_COLORS[category] || '#5681EB';
  const size = isSelected ? 38 : 30;
  const strokeWidth = isSelected ? 3 : 2;

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; items-center; justify-content: center;">
      ${
        isSelected
          ? `<div style="position: absolute; inset: -6px; border-radius: 9999px; background-color: ${color}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
          : ''
      }
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: ${strokeWidth}px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        cursor: pointer;
      ">
        <div style="
          width: ${isSelected ? 10 : 8}px;
          height: ${isSelected ? 10 : 8}px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-city-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

const userLocationIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 22px; height: 22px;">
      <div style="position: absolute; inset: -4px; border-radius: 9999px; background-color: #3B82F6; opacity: 0.4; animation: ping 2s infinite;"></div>
      <div style="width: 22px; height: 22px; background-color: #3B82F6; border: 3px solid white; border-radius: 9999px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
    </div>
  `,
  className: 'user-loc-marker',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// Map controller component to pan when place selected
const MapController: React.FC<{ selectedPlace: Place | null; userLocation: { lat: number; lng: number } | null }> = ({
  selectedPlace,
  userLocation,
}) => {
  const map = useMap();

  useEffect(() => {
    if (selectedPlace) {
      map.flyTo([selectedPlace.latitude, selectedPlace.longitude], 14, {
        duration: 1.2,
      });
    }
  }, [selectedPlace, map]);

  return null;
};

export const CityMap: React.FC<CityMapProps> = ({
  places,
  selectedPlace,
  onSelectPlace,
  onSavePlace,
  isPlaceSaved,
  userLocation,
  onLocateMe,
  onViewDetails,
}) => {
  // Bengaluru coordinates
  const defaultCenter: [number, number] = [12.9716, 77.5946];

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-[#E8EBF0] shadow-xs">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        minZoom={10}
        maxZoom={18}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController selectedPlace={selectedPlace} userLocation={userLocation} />

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              <div className="p-2 text-xs font-semibold text-[#171B24]">Your Location</div>
            </Popup>
          </Marker>
        )}

        {/* Bengaluru Place Markers */}
        {places.map((place) => {
          const isSelected = selectedPlace?.place_id === place.place_id;
          const markerIcon = createCustomMarkerIcon(place.category, isSelected);

          return (
            <Marker
              key={place.place_id}
              position={[place.latitude, place.longitude]}
              icon={markerIcon}
              eventHandlers={{
                click: () => onSelectPlace(place),
              }}
            >
              <Popup>
                <div className="w-[260px] bg-white rounded-xl overflow-hidden shadow-sm">
                  {/* Thumbnail Image */}
                  <div className="relative h-28 w-full overflow-hidden bg-slate-100">
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs">
                      {place.category}
                    </div>
                    {place.rating && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white bg-amber-500/90 flex items-center gap-1 shadow-xs">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        <span>{place.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-3">
                    <h3 className="font-bold text-[#171B24] text-sm leading-snug line-clamp-1">
                      {place.name}
                    </h3>
                    <p className="text-[#777F8B] text-xs mt-0.5 line-clamp-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#5681EB] shrink-0" />
                      <span>{place.locality}</span>
                    </p>

                    {place.distance_km !== undefined && (
                      <div className="mt-1 text-[11px] font-medium text-[#5681EB]">
                        {place.distance_km} km away
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-3 pt-2.5 border-t border-[#E8EBF0] flex items-center justify-between gap-2">
                      <button
                        onClick={() => onViewDetails(place)}
                        className="flex-1 py-1.5 px-2 bg-[#5681EB] hover:bg-[#3F6FDB] text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onSavePlace(place)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isPlaceSaved(place.place_id)
                            ? 'bg-[#B9E2F1]/60 text-[#3F6FDB] border-[#3F6FDB]'
                            : 'border-[#E8EBF0] text-[#777F8B] hover:text-[#171B24]'
                        }`}
                        title={isPlaceSaved(place.place_id) ? 'Saved' : 'Save Place'}
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${isPlaceSaved(place.place_id) ? 'fill-current' : ''}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Controls: Geolocation button & Domain Legend */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        <button
          onClick={onLocateMe}
          className="w-10 h-10 rounded-xl bg-white shadow-md hover:bg-slate-50 flex items-center justify-center text-[#171B24] border border-[#E8EBF0] transition-all"
          title="Locate Me in Bengaluru"
        >
          <Navigation className="w-4 h-4 text-[#5681EB]" />
        </button>
      </div>

      {/* Compact Bottom Legend */}
      <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E8EBF0] shadow-xs text-[11px] font-semibold text-[#171B24] hidden sm:flex items-center gap-3">
        <span className="text-[#777F8B]">Markers:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
          <span>Tourism</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
          <span>Transit</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></span>
          <span>Shopping</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
          <span>Health</span>
        </div>
      </div>
    </div>
  );
};
