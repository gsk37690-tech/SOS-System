import { useState, useEffect, useRef } from 'react';
import { LiveLocationState } from '../types';
import { INITIAL_ZONES } from '../utils/constants';

// Campus center reference coordinates
const CAMPUS_REF = {
  lat: 34.0522,
  lng: -118.2437,
};

// Distance calculation (haversine)
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Map zones to approximate lat/lng offsets around campus center
const ZONE_OFFSETS: Record<string, { lat: number; lng: number }> = {
  'zone-1': { lat: 34.0545, lng: -118.2455 }, // North Quad & Library
  'zone-2': { lat: 34.0542, lng: -118.2415 }, // Science & Engineering
  'zone-3': { lat: 34.0522, lng: -118.2437 }, // Central Student Plaza
  'zone-4': { lat: 34.0501, lng: -118.2450 }, // South Residential Village
  'zone-5': { lat: 34.0518, lng: -118.2475 }, // West Athletics
  'zone-6': { lat: 34.0505, lng: -118.2405 }, // East Commuter Parking
};

function findNearestZone(lat: number, lng: number) {
  let minDistance = Infinity;
  let nearest = INITIAL_ZONES[0];

  for (const zone of INITIAL_ZONES) {
    const coords = ZONE_OFFSETS[zone.id] || CAMPUS_REF;
    const dist = getDistanceMeters(lat, lng, coords.lat, coords.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = zone;
    }
  }

  return nearest;
}

export const useLiveLocation = () => {
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [location, setLocation] = useState<LiveLocationState>(() => {
    const nearest = findNearestZone(CAMPUS_REF.lat, CAMPUS_REF.lng);
    return {
      lat: CAMPUS_REF.lat,
      lng: CAMPUS_REF.lng,
      accuracy: 4.2,
      altitude: 72,
      speed: 0.8,
      heading: 142,
      timestamp: new Date().toISOString(),
      status: 'ACQUIRING',
      nearestZoneId: nearest.id,
      nearestZoneName: nearest.name,
    };
  });

  const watchIdRef = useRef<number | null>(null);
  const simIntervalRef = useRef<any>(null);

  // Live device GPS capture
  useEffect(() => {
    if (isSimulated) {
      // Clear real watch
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      // Start realistic live simulation walk
      simIntervalRef.current = setInterval(() => {
        setLocation(prev => {
          // Subtle walking jitter (+- 0.00005 deg ~ 5 meters)
          const newLat = prev.lat + (Math.random() - 0.49) * 0.00006;
          const newLng = prev.lng + (Math.random() - 0.49) * 0.00006;
          const nearest = findNearestZone(newLat, newLng);

          return {
            lat: Number(newLat.toFixed(6)),
            lng: Number(newLng.toFixed(6)),
            accuracy: Math.round((3.2 + Math.random() * 1.8) * 10) / 10,
            altitude: 72 + Math.round((Math.random() - 0.5) * 3),
            speed: Math.round((1.1 + (Math.random() - 0.5) * 0.3) * 10) / 10,
            heading: Math.round(140 + Math.random() * 10),
            timestamp: new Date().toISOString(),
            status: 'ACTIVE',
            nearestZoneId: nearest.id,
            nearestZoneName: nearest.name,
          };
        });
      }, 3000);

      return () => {
        if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      };
    }

    // Try real browser navigator.geolocation
    if (!navigator.geolocation) {
      setIsSimulated(true);
      return;
    }

    const handleSuccess = (pos: GeolocationPosition) => {
      const lat = Number(pos.coords.latitude.toFixed(6));
      const lng = Number(pos.coords.longitude.toFixed(6));
      const nearest = findNearestZone(lat, lng);

      setLocation({
        lat,
        lng,
        accuracy: Math.round(pos.coords.accuracy * 10) / 10,
        altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : null,
        speed: pos.coords.speed ? Math.round(pos.coords.speed * 10) / 10 : null,
        heading: pos.coords.heading ? Math.round(pos.coords.heading) : null,
        timestamp: new Date(pos.timestamp).toISOString(),
        status: 'ACTIVE',
        nearestZoneId: nearest.id,
        nearestZoneName: nearest.name,
      });
    };

    const handleError = (err: GeolocationPositionError) => {
      console.warn('Live Geolocation warning:', err.message);
      // Automatically fallback to simulated live campus coordinates so user experience is uninterrupted
      setIsSimulated(true);
    };

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000,
      });
    } catch (e) {
      setIsSimulated(true);
    }

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, [isSimulated]);

  const toggleSimulation = () => {
    setIsSimulated(prev => !prev);
  };

  const refreshLocation = () => {
    if (navigator.geolocation && !isSimulated) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          const nearest = findNearestZone(lat, lng);
          setLocation({
            lat,
            lng,
            accuracy: Math.round(pos.coords.accuracy * 10) / 10,
            altitude: pos.coords.altitude ? Math.round(pos.coords.altitude) : null,
            speed: pos.coords.speed ? Math.round(pos.coords.speed * 10) / 10 : null,
            heading: pos.coords.heading ? Math.round(pos.coords.heading) : null,
            timestamp: new Date(pos.timestamp).toISOString(),
            status: 'ACTIVE',
            nearestZoneId: nearest.id,
            nearestZoneName: nearest.name,
          });
        },
        () => setIsSimulated(true),
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  return {
    location,
    isSimulated,
    toggleSimulation,
    refreshLocation,
  };
};
