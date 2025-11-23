import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { FontAwesome } from '@expo/vector-icons';

type PublicProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  hometown: string | null;
  favorite_quote: string | null;
};

export default function PublicProfilePage() {
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [hikeCount, setHikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProfileAndStats();
    }
  }, [id]);

  const fetchProfileAndStats = async () => {
    try {
      setLoading(true);
      
      // Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, hometown, favorite_quote')
        .eq('id', id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch Hike Count
      const { count, error: countError } = await supabase
        .from('hikes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', id);

      if (countError) throw countError;
      setHikeCount(count || 0);

    } catch (error) {
      console.error('Error fetching public profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4500" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: profile.full_name || 'Hiker Profile' }} />
      
      <View style={styles.header}>
        {profile.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholderAvatar]}>
            <FontAwesome name="user" size={60} color="#ccc" />
          </View>
        )}
        
        <Text style={styles.name}>{profile.full_name || 'Anonymous Hiker'}</Text>
        
        {profile.hometown && (
          <View style={styles.locationRow}>
            <FontAwesome name="map-marker" size={16} color="#666" />
            <Text style={styles.locationText}>{profile.hometown}</Text>
          </View>
        )}
      </View>

      {profile.favorite_quote && (
        <View style={styles.quoteCard}>
          <FontAwesome name="quote-left" size={20} color="#FF4500" style={styles.quoteIcon} />
          <Text style={styles.quoteText}>{profile.favorite_quote}</Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{hikeCount}</Text>
          <Text style={styles.statLabel}>Total Hikes</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: '#e1e1e1',
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 6,
  },
  quoteCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  quoteIcon: {
    marginBottom: 12,
    opacity: 0.5,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#444',
    textAlign: 'center',
    lineHeight: 26,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  statBox: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF4500',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
