import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocationTracker } from '@/hooks/useLocationTracker';
import { useSupabase } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';
import { getDistance } from 'geolib';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Tumamoc Hill Coordinates
const START_LOCATION = { latitude: 32.2259035, longitude: -111.001116 };
const STOP_LOCATION = { latitude: 32.214089, longitude: -111.0054714 };
// 3 feet is ~0.91 meters. Using 5 meters for better usability.
const GEOFENCE_RADIUS_METERS = 5; 

export default function Page() {
  const insets = useSafeAreaInsets();
  const { session } = useSupabase();
  const user = session?.user;
  
  const {
    location,
    isTracking,
    duration,
    startTracking,
    stopTracking,
  } = useLocationTracker();

  const [distToStart, setDistToStart] = useState<number | null>(null);
  const [distToStop, setDistToStop] = useState<number | null>(null);
  const [totalHikes, setTotalHikes] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTotalHikes();
    }
  }, [user]);

  useEffect(() => {
    if (location) {
      const current = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      setDistToStart(getDistance(current, START_LOCATION));
      setDistToStop(getDistance(current, STOP_LOCATION));
    }
  }, [location]);

  const fetchTotalHikes = async () => {
    try {
      const { count, error } = await supabase
        .from('hikes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      if (error) throw error;
      setTotalHikes(count);
    } catch (error) {
      console.error('Error fetching total hikes:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleStartHike = async () => {
    if (!distToStart || distToStart > GEOFENCE_RADIUS_METERS) {
        Alert.alert("Not at Start", `You are ${distToStart}m away from the start.`);
        return;
    }
    await startTracking();
  };

  const handleStopHike = async () => {
    if (!distToStop || distToStop > GEOFENCE_RADIUS_METERS) {
        Alert.alert("Not at Summit", `You are ${distToStop}m away from the summit.`);
        return;
    }

    const hikeData = stopTracking();
    
    if (hikeData.path.length === 0) {
        Alert.alert("No hike data", "You didn't move!");
        return;
    }

    try {
      const { error } = await supabase.from('hikes').insert({
        user_id: user?.id,
        start_time: hikeData.startTime,
        end_time: hikeData.endTime,
        duration_seconds: hikeData.duration,
        path_points: hikeData.path,
      });

      if (error) throw error;
      Alert.alert("Hike Saved!", `You hiked ${Math.round(hikeData.distance)}m in ${formatTime(hikeData.duration)}`);
      fetchTotalHikes(); // Refresh stats
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save hike");
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isNearStart = distToStart !== null && distToStart <= GEOFENCE_RADIUS_METERS;
  const isNearStop = distToStop !== null && distToStop <= GEOFENCE_RADIUS_METERS;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hello, welcome to your Tmocker App!</Text>
        <Text style={styles.headerSubtitle}>Ready for your climb?</Text>
      </View>

      <View style={styles.content}>
        {/* Stats Card */}
        <View style={styles.statsCard}>
          <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            style={styles.statsGradient}
          >
            <View style={styles.statsContent}>
              <Text style={styles.statsLabel}>Total Hikes</Text>
              {loadingStats ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.statsValue}>{totalHikes || 0}</Text>
              )}
              <MaterialCommunityIcons name="hiking" size={24} color="rgba(255,255,255,0.8)" style={styles.statsIcon} />
            </View>
          </LinearGradient>
        </View>

        {/* Action Area */}
        <View style={styles.actionContainer}>
          {isTracking ? (
            <View style={styles.trackingContainer}>
              <Text style={styles.timerLabel}>Duration</Text>
              <Text style={styles.timerValue}>{formatTime(duration)}</Text>
              
              <View style={styles.distanceInfo}>
                 <Text style={styles.distanceText}>
                  {distToStop !== null ? `${Math.round(distToStop)}m to summit` : 'Calculating distance...'}
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.actionButton, styles.stopButton, !isNearStop && styles.disabledButton]}
                onPress={handleStopHike}
                disabled={!isNearStop}
              >
                <Text style={styles.actionButtonText}>Finish Hike</Text>
                <Text style={styles.buttonSubtext}>
                  {isNearStop ? 'You are at the summit!' : 'Get closer to summit'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.startContainer}>
               <View style={styles.distanceInfo}>
                 <Text style={styles.distanceText}>
                  {distToStart !== null ? `${Math.round(distToStart)}m to start` : 'Calculating distance...'}
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.actionButton, styles.startButton, !isNearStart && styles.disabledButton]}
                onPress={handleStartHike}
                disabled={!isNearStart}
              >
                <Text style={styles.actionButtonText}>Start Hike</Text>
                <Text style={styles.buttonSubtext}>
                  {isNearStart ? 'You are at the start!' : 'Get closer to start'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 24,
  },
  statsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  statsGradient: {
    padding: 24,
  },
  statsContent: {
    alignItems: 'center',
    position: 'relative',
  },
  statsLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsValue: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
  },
  statsIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  actionContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  trackingContainer: {
    alignItems: 'center',
    width: '100%',
    gap: 20,
  },
  startContainer: {
    alignItems: 'center',
    width: '100%',
    gap: 20,
  },
  timerLabel: {
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerValue: {
    fontSize: 64,
    fontWeight: '200',
    color: '#1a1a1a',
    fontVariant: ['tabular-nums'],
  },
  distanceInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  distanceText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  startButton: {
    backgroundColor: '#007AFF',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
    opacity: 0.7,
    shadowOpacity: 0,
    elevation: 0,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
});
