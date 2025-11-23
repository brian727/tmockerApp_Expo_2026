import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSupabase } from '@/hooks/useSupabase';
import { supabase } from '@/lib/supabase';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Profile = {
  id: string;
  avatar_url: string | null;
  full_name: string | null;
  hometown: string | null;
  favorite_quote: string | null;
  updated_at: string;
};

type Hike = {
  id: string;
  duration_seconds: number;
  created_at: string;
};

export default function ProfilePage() {
  const { session, signOut } = useSupabase();
  const user = session?.user;
  const insets = useSafeAreaInsets();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hikes, setHikes] = useState<Hike[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [hometown, setHometown] = useState('');
  const [favoriteQuote, setFavoriteQuote] = useState('');
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchHikes();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
        setHometown(data.hometown || '');
        setFavoriteQuote(data.favorite_quote || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchHikes = async () => {
    try {
      const { data, error } = await supabase
        .from('hikes')
        .select('id, duration_seconds, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHikes(data || []);
    } catch (error) {
      console.error('Error fetching hikes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updates = {
        id: user.id,
        full_name: fullName,
        hometown: hometown,
        favorite_quote: favoriteQuote,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      uploadAvatar(result.assets[0].base64);
    }
  };

  const uploadAvatar = async (base64: string) => {
    try {
      setUploading(true);
      const fileName = `${user?.id}/${Date.now()}.jpg`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64), {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      const updates = {
        id: user?.id,
        avatar_url: data.publicUrl,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(updates);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, ...updates } as Profile));
      Alert.alert('Success', 'Profile picture updated!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  // Helper to decode base64 for Supabase upload (simplified)
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={signOut} style={styles.signOutBtn}>
          <FontAwesome name="sign-out" size={24} color="#FF4500" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <TouchableOpacity onPress={pickImage} disabled={uploading}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <FontAwesome name="user" size={40} color="#ccc" />
            </View>
          )}
          {uploading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="white" />
            </View>
          )}
          <View style={styles.editIcon}>
            <FontAwesome name="camera" size={14} color="white" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.email}>{user?.email}</Text>

        {!isEditing ? (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <TouchableOpacity 
              style={styles.nameDisplayContainer} 
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.nameText}>{profile?.full_name || 'Anonymous Hiker'}</Text>
              <FontAwesome name="pencil" size={16} color="#FF4500" style={styles.pencilIcon} />
            </TouchableOpacity>
            
            {profile?.hometown && (
              <View style={styles.infoRow}>
                <FontAwesome name="map-marker" size={14} color="#666" />
                <Text style={styles.infoText}>{profile.hometown}</Text>
              </View>
            )}
            
            {profile?.favorite_quote && (
              <View style={styles.quoteContainer}>
                <FontAwesome name="quote-left" size={10} color="#ccc" style={{ marginBottom: 4 }} />
                <Text style={styles.quoteText}>{profile.favorite_quote}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.editForm}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
              placeholderTextColor="#999"
            />
            
            <Text style={styles.label}>Hometown</Text>
            <TextInput
              style={styles.input}
              value={hometown}
              onChangeText={setHometown}
              placeholder="City, State"
              placeholderTextColor="#999"
            />
            
            <Text style={styles.label}>Favorite Quote</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={favoriteQuote}
              onChangeText={setFavoriteQuote}
              placeholder="Your favorite hiking quote..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.saveButton]} 
                onPress={updateProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Profile</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Hike History</Text>
        <FlatList
          data={hikes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.hikeCard}>
              <View>
                <Text style={styles.hikeDate}>{formatDate(item.created_at)}</Text>
              </View>
              <Text style={styles.hikeTime}>{formatTime(item.duration_seconds)}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No hikes recorded yet.</Text>}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  signOutBtn: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e1e1e1',
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF4500',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  email: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  quoteContainer: {
    marginTop: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#555',
    textAlign: 'center',
  },
  editForm: {
    width: '100%',
    maxWidth: 320,
    marginTop: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
    marginTop: 10,
    marginLeft: 4,
  },
  input: {
    width: '100%',
    height: 44,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#FF4500',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsSection: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  hikeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  hikeDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  hikeDistance: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  hikeTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});
