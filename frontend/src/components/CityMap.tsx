import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Place } from '../types';
import { Bookmark, ExternalLink, Star, Navigation, MapPin } from 'lucide-react';

interface CityMapProps {
  places: Place[];
  selectedPlace: Place | null;
  focusedPlace?: Place | null;
  onClearFocus?: () => void;
  onSelectPlace: (place: Place) => void;
  onSavePlace: (place: Place) => void;
  isPlaceSaved: (placeId: string) => boolean;
  userLocation: { lat: number; lng: number } | null;
  onLocateMe: () => void;
  onViewDetails: (place: Place) => void;
}

export const CATEGORY_COLORS: Record<string, string> = {
  Healthcare: '#EF4444',
  Transportation: '#3B82F6',
  Tourism: '#10B981',
  Shopping: '#F97316',
  Education: '#6366F1',
  Entertainment: '#8B5CF6',
  Restaurants: '#F59E0B',
  Startups: '#06B6D4',
};

// Helper to create modern SVGs for map markers classified by category
const createCustomMarkerIcon = (category: string) => {
  const color = CATEGORY_COLORS[category] || '#F02D25';
  const size = 30;
  const strokeWidth = 2;

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
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
        transition: transform 0.2s ease;
      ">
        <div style="
          width: 8px;
          height: 8px;
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

// Map controller component for user geolocation pan and focused place flyTo
const MapController: React.FC<{
  userLocation: { lat: number; lng: number } | null;
  focusedPlace?: Place | null;
}> = ({ userLocation, focusedPlace }) => {
  const map = useMap();

  useEffect(() => {
    if (focusedPlace) {
      map.flyTo([focusedPlace.latitude, focusedPlace.longitude], 16, {
        animate: true,
        duration: 0.8,
      });
    } else if (userLocation) {
      map.panTo([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation, focusedPlace, map]);

  return null;
};

export const CityMap: React.FC<CityMapProps> = ({
  places,
  selectedPlace,
  focusedPlace,
  onClearFocus,
  onSelectPlace,
  onSavePlace,
  isPlaceSaved,
  userLocation,
  onLocateMe,
  onViewDetails,
}) => {
  // If a single place is focused, show only that specific location!
  const displayPlaces = focusedPlace ? [focusedPlace] : places;

  // Bengaluru coordinates or focused place coordinates
  const defaultCenter: [number, number] = focusedPlace
    ? [focusedPlace.latitude, focusedPlace.longitude]
    : [12.9716, 77.5946];
  const defaultZoom = focusedPlace ? 16 : 12;

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-[#E3DFD7] shadow-lg bg-[#ECE9E2]">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        minZoom={10}
        maxZoom={18}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController userLocation={userLocation} focusedPlace={focusedPlace} />

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>
              <div className="p-2 text-xs font-bold text-[#191919]">Your Location in Bengaluru</div>
            </Popup>
          </Marker>
        )}

        {/* Bengaluru Place Markers (Single isolated marker if focusedPlace is set, or all places) */}
        {displayPlaces.map((place) => {
          const markerIcon = createCustomMarkerIcon(place.category);
          const categoryColor = CATEGORY_COLORS[place.category] || '#F02D25';
          const isFocused = Boolean(focusedPlace && place.place_id === focusedPlace.place_id);

          return (
            <Marker
              key={place.place_id}
              position={[place.latitude, place.longitude]}
              icon={markerIcon}
              ref={(marker) => {
                if (marker && isFocused) {
                  setTimeout(() => {
                    try {
                      marker.openPopup();
                    } catch {}
                  }, 400);
                }
              }}
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
                    <div
                      className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-xs"
                      style={{ backgroundColor: categoryColor }}
                    >
                      {place.category}
                    </div>
                    {place.rating && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#191919]/80 backdrop-blur-xs flex items-center gap-1 shadow-xs">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>{place.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5">
                    <h3 className="font-display font-bold text-[#191919] text-base leading-snug line-clamp-1">
                      {place.name}
                    </h3>
                    <p className="text-[#77736D] text-xs mt-1 line-clamp-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: categoryColor }} />
                      <span>{place.locality}</span>
                    </p>

                    {place.distance_km !== undefined && (
                      <div className="mt-1 text-[11px] font-bold" style={{ color: categoryColor }}>
                        {place.distance_km} km away from your location
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-3.5 pt-3 border-t border-[#E3DFD7] flex items-center justify-between gap-2">
                      <button
                        onClick={() => onViewDetails(place)}
                        className="flex-1 py-2 px-3 bg-[#191919] hover:bg-[#F02D25] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onSavePlace(place)}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
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

      {/* Floating Single Focused Location Pill Banner */}
      {focusedPlace && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-2.5 sm:gap-3 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#E3DFD7] shadow-lg max-w-[92%] sm:max-w-md animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="w-2.5 h-2.5 rounded-full bg-[#F02D25] animate-pulse shrink-0" />
          <div className="min-w-0 flex-1">
            <h4 className="font-display font-bold text-xs sm:text-sm text-[#191919] truncate leading-tight">
              {focusedPlace.name}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-[#77736D] truncate leading-tight mt-0.5">
              Showing single location in {focusedPlace.locality}
            </p>
          </div>
          {onClearFocus && (
            <button
              onClick={onClearFocus}
              className="shrink-0 px-2.5 py-1 rounded-xl bg-[#191919] hover:bg-[#F02D25] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs flex items-center gap-1"
              title="Show all Bengaluru locations"
            >
              <span>Show All</span>
              <span className="text-xs">&times;</span>
            </button>
          )}
        </div>
      )}

      {/* Floating Geolocation Control */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        <button
          onClick={onLocateMe}
          className="w-11 h-11 rounded-2xl bg-white shadow-md hover:bg-[#F5F3EE] flex items-center justify-center text-[#191919] border border-[#E3DFD7] transition-all cursor-pointer"
          title="Locate Me in Bengaluru"
        >
          <Navigation className="w-5 h-5 text-[#3B82F6]" />
        </button>
      </div>

      {/* Category Marker Classification Legend */}
      <div className="absolute top-3.5 left-[58px] z-[400] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-[#E3DFD7] shadow-sm text-xs font-semibold text-[#191919] hidden sm:flex items-center gap-2.5 flex-wrap max-w-[calc(100%-130px)] select-none">
        <div className="flex items-center gap-1.5 pr-2.5 border-r border-[#E3DFD7]">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#77736D] whitespace-nowrap">
            {focusedPlace ? '1 Isolated Place' : `${places.length} Places`}
          </span>
        </div>
        {focusedPlace ? (
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: CATEGORY_COLORS[focusedPlace.category] || '#F02D25' }}
            ></span>
            <span className="text-[11px] font-bold text-[#191919] truncate max-w-[200px]">
              {focusedPlace.category} &bull; {focusedPlace.name}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 flex-wrap">
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: color }}></span>
                <span className="text-[11px] font-medium text-[#191919] whitespace-nowrap">{cat}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
