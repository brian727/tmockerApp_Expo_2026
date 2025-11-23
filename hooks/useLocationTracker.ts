import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';

export interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export const useLocationTracker = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [path, setPath] = useState<LocationPoint[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [duration, setDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  useEffect(() => {
    if (isTracking && startTime) {
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTracking, startTime]);

  const startTracking = async () => {
    setIsTracking(true);
    setStartTime(Date.now());
    setPath([]);
    setDistance(0);
    setDuration(0);

    subscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5, // Update every 5 meters
      },
      (newLocation) => {
        setLocation(newLocation);
        
        const newPoint: LocationPoint = {
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
          timestamp: newLocation.timestamp,
        };

        setPath((prevPath) => {
          if (prevPath.length > 0) {
            const lastPoint = prevPath[prevPath.length - 1];
            const dist = getDistance(
              { latitude: lastPoint.latitude, longitude: lastPoint.longitude },
              { latitude: newPoint.latitude, longitude: newPoint.longitude }
            );
            setDistance((d) => d + dist);
          }
          return [...prevPath, newPoint];
        });
      }
    );
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return {
        path,
        distance,
        duration,
        startTime: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
        endTime: new Date().toISOString(),
    };
  };

  return {
    location,
    path,
    isTracking,
    distance,
    duration,
    errorMsg,
    startTracking,
    stopTracking,
  };
};
