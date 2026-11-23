import React, { useEffect } from 'react';
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

// Editorial Red Circular Marker with clean white outline
const createCustomMarkerIcon = (isSelected: boolean) => {
  const size = isSelected ? 36 : 26;
  const stroke = isSelected ? 3 : 2;

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      ${
        isSelected
          ? `<div style="position: absolute; inset: -8px; border-radius: 9999px; background-color: #F02D25; opacity: 0.3; animation: pulseGlow 1.8s infinite;"></div>`
          : ''
      }
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${isSelected ? '#F02D25' : '#191919'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: ${stroke}px solid #FFFFFF;
        box-shadow: 0 4px 12px rgba(23, 23, 23, 0.3);
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <div style="
          width: ${isSelected ? 10 : 8}px;
          height: ${isSelected ? 10 : 8}px;
          background-color: ${isSelected ? '#FFFFFF' : '#F02D25'};
          border-radius: 50%;
        "></div>
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'editorial-custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const userLocationIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 24px; height: 24px;">
      <div style="position: absolute; inset: -4px; border-radius: 9999px; background-color: #F02D25; opacity: 0.35; animation: ping 2s infinite;"></div>
      <div style="width: 24px; height: 24px; background-color: #F02D25; border: 3px solid white; border-radius: 9999px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
    </div>
  `,
  className: 'user-loc-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Map controller component to pan when place selected
const MapController: React.FC<{ selectedPlace: Place | null; userLocation: { lat: number; lng: number } | null }> = ({
  selectedPlace,
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
    <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-[#E3DFD7] shadow-lg bg-[#ECE9E2]">
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
              <div className="p-2 text-xs font-bold text-[#191919]">Your Location in Bengaluru</div>
            </Popup>
          </Marker>
        )}

        {/* Bengaluru Place Markers */}
        {places.map((place) => {
          const isSelected = selectedPlace?.place_id === place.place_id;
          const markerIcon = createCustomMarkerIcon(isSelected);

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
                <div className="w-[280px] bg-white rounded-2xl overflow-hidden shadow-sm font-sans">
                  {/* Thumbnail Image */}
                  <div className="relative h-32 w-full overflow-hidden bg-[#ECE9E2]">
                    <img
                      src={place.image_url}
                      alt={place.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white bg-[#191919]/80 backdrop-blur-xs">
                      {place.category}
                    </div>
                    {place.rating && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#F02D25] flex items-center gap-1 shadow-xs">
                        <Star className="w-2.5 h-2.5 fill-white" />
                        <span>{place.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5">
                    <h3 className="font-display font-bold text-[#191919] text-base leading-snug line-clamp-1 uppercase">
                      {place.name}
                    </h3>
                    <p className="text-[#77736D] text-xs mt-1 line-clamp-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#F02D25] shrink-0" />
                      <span>{place.locality}</span>
                    </p>

                    {place.distance_km !== undefined && (
                      <div className="mt-1 text-[11px] font-bold text-[#F02D25]">
                        {place.distance_km} km away from your location
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-3.5 pt-3 border-t border-[#E3DFD7] flex items-center justify-between gap-2">
                      <button
                        onClick={() => onViewDetails(place)}
                        className="flex-1 py-2 px-3 bg-[#191919] hover:bg-[#F02D25] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onSavePlace(place)}
                        className={`p-2 rounded-xl border transition-all ${
                          isPlaceSaved(place.place_id)
                            ? 'bg-[#F02D25] text-white border-[#F02D25]'
                            : 'border-[#E3DFD7] text-[#77736D] hover:text-[#191919] hover:bg-[#F5F3EE]'
                        }`}
                        title={isPlaceSaved(place.place_id) ? 'Saved' : 'Save Place'}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${isPlaceSaved(place.place_id) ? 'fill-current' : ''}`}
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

      {/* Floating Geolocation Control */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        <button
          onClick={onLocateMe}
          className="w-11 h-11 rounded-2xl bg-white shadow-md hover:bg-[#F5F3EE] flex items-center justify-center text-[#191919] border border-[#E3DFD7] transition-all cursor-pointer"
          title="Locate Me in Bengaluru"
        >
          <Navigation className="w-5 h-5 text-[#F02D25]" />
        </button>
      </div>

      {/* Editorial Marker Legend */}
      <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#E3DFD7] shadow-sm text-xs font-semibold text-[#191919] flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#F02D25] border-2 border-white shadow-xs"></span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#191919]">City Node</span>
        </div>
        <span className="text-[#E3DFD7]">|</span>
        <span className="text-[11px] text-[#77736D]">
          {places.length} Locations Active
        </span>
      </div>
    </div>
  );
};
