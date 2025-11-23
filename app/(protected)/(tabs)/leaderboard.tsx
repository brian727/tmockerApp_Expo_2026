import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

interface Hike {
  id: string;
  duration_seconds: number;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export default function Leaderboard() {
  const insets = useSafeAreaInsets();
  const [hikes, setHikes] = useState<Hike[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    setRefreshing(true);
    const { data, error } = await supabase
      .from('hikes')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .order('duration_seconds', { ascending: true })
      .limit(10);

    console.log('Leaderboard fetch result:', { dataLength: data?.length, error });

    if (!error && data) {
      setHikes(data as any);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderItem = ({ item, index }: { item: Hike; index: number }) => {
    const displayName = item.profiles?.full_name || `Hiker ${item.user_id.slice(0, 4)}`;
    const avatarUrl = item.profiles?.avatar_url;
    
    return (
      <View style={styles.row}>
        <Text style={styles.rank}>{index + 1}</Text>
        
        <Link href={`/profile/${item.user_id}`} asChild>
          <TouchableOpacity style={styles.userInfoContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.placeholderAvatar]}>
                <FontAwesome name="user" size={20} color="#ccc" />
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.user}>{displayName}</Text>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
          </TouchableOpacity>
        </Link>

        <View style={styles.stats}>
          <Text style={styles.time}>{formatTime(item.duration_seconds)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Top Tmockers</Text>
      <FlatList
        data={hikes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchLeaderboard} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hikes recorded yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF4500',
    width: 30,
    textAlign: 'center',
    marginRight: 10,
  },
  userInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  user: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  stats: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  time: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
    fontSize: 16,
  },
});
