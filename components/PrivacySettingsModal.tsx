import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, Switch, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { NeoBrutalism } from '@/constants/Colors';
import AnimatedButton from '@/components/ui/AnimatedButton';

interface PrivacySettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

interface PermissionState {
  camera: boolean;
  mediaLibrary: boolean;
  location: boolean;
  contacts: boolean;
  notifications: boolean;
}

export default function PrivacySettingsModal({ visible, onClose }: PrivacySettingsModalProps) {
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: false,
    mediaLibrary: false,
    location: false,
    contacts: false,
    notifications: false
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      checkPermissions();
    }
  }, [visible]);

  const checkPermissions = async () => {
    try {
        try {
          const cameraStatus = await Camera.getCameraPermissionsAsync();
          const mediaStatus = await MediaLibrary.getPermissionsAsync();
          const locationStatus = await Location.getForegroundPermissionsAsync();
          const notificationSettings = await AsyncStorage.getItem('notifications_enabled');
          
          setPermissions({
            camera: cameraStatus.granted,
            mediaLibrary: mediaStatus.granted,
            location: locationStatus.granted,
            contacts: false, // Not available in Expo
            notifications: notificationSettings === 'true'
          });
        } catch (error) {
        console.error('Error checking permissions:', error);
        setPermissions({
          camera: false,
          mediaLibrary: false,
          location: false,
          contacts: false,
          notifications: false
        });
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const togglePermission = async (type: keyof PermissionState) => {
    setLoading(true);
    
    try {
      let success = false;

      switch (type) {
        case 'camera':
          if (!permissions.camera) {
            try {
              const result = await Camera.requestCameraPermissionsAsync();
              success = result.granted;
            } catch (error) {
              showPermissionAlert('Camera', 'Unable to request camera permission');
            }
          } else {
            showPermissionAlert('Camera', 'Go to Settings > Privacy > Camera to disable');
          }
          break;

        case 'mediaLibrary':
          if (!permissions.mediaLibrary) {
            const result = await MediaLibrary.requestPermissionsAsync();
            success = result.granted;
          } else {
            showPermissionAlert('Media Library', 'Go to Settings > Privacy > Photos to disable');
          }
          break;

        case 'location':
          if (!permissions.location) {
            const result = await Location.requestForegroundPermissionsAsync();
            success = result.granted;
          } else {
            showPermissionAlert('Location', 'Go to Settings > Privacy > Location Services to disable');
          }
          break;

        case 'contacts':
          showPermissionAlert('Contacts', 'Contact access is not available in this version');
          break;

        case 'notifications':
          const newValue = !permissions.notifications;
          await AsyncStorage.setItem('notifications_enabled', newValue.toString());
          success = true;
          break;
      }

      if (success || type === 'notifications') {
        setPermissions(prev => ({
          ...prev,
          [type]: type === 'notifications' ? !prev[type] : success
        }));
      }
    } catch (error) {
      console.error(`Error toggling ${type} permission:`, error);
    } finally {
      setLoading(false);
    }
  };

  const showPermissionAlert = (permission: string, instruction: string) => {
    if (Platform.OS === 'web') {
      alert(`To disable ${permission} access: ${instruction}`);
    } else {
      Alert.alert(
        `${permission} Permission`,
        instruction,
        [{ text: 'OK' }]
      );
    }
  };

  const permissionItems = [
    {
      key: 'camera' as keyof PermissionState,
      title: 'CAMERA ACCESS',
      description: 'For facial expression analysis and photo sharing',
      icon: 'camera-alt'
    },
    {
      key: 'mediaLibrary' as keyof PermissionState,
      title: 'MEDIA LIBRARY',
      description: 'To save and access wellness photos and videos',
      icon: 'photo-library'
    },
    {
      key: 'location' as keyof PermissionState,
      title: 'LOCATION',
      description: 'To find nearby mental health resources',
      icon: 'location-on'
    },
    {
      key: 'contacts' as keyof PermissionState,
      title: 'CONTACTS',
      description: 'For emergency contact integration',
      icon: 'contacts'
    },
    {
      key: 'notifications' as keyof PermissionState,
      title: 'NOTIFICATIONS',
      description: 'Daily wellness reminders and check-ins',
      icon: 'notifications'
    }
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>PRIVACY SETTINGS</Text>
            <Text style={styles.subtitle}>MANAGE APP PERMISSIONS</Text>
          </View>

          {/* Permission List */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {permissionItems.map((item) => (
              <View key={item.key} style={styles.permissionItem}>
                <View style={styles.permissionLeft}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons 
                      name={item.icon as any} 
                      size={28} 
                      color={permissions[item.key] ? NeoBrutalism.success : NeoBrutalism.textSecondary} 
                    />
                  </View>
                  <View style={styles.permissionInfo}>
                    <Text style={styles.permissionTitle}>{item.title}</Text>
                    <Text style={styles.permissionDescription}>{item.description}</Text>
                  </View>
                </View>
                
                <Switch
                  value={permissions[item.key]}
                  onValueChange={() => togglePermission(item.key)}
                  disabled={loading}
                  trackColor={{
                    false: NeoBrutalism.border,
                    true: NeoBrutalism.success
                  }}
                  thumbColor={permissions[item.key] ? NeoBrutalism.surface : NeoBrutalism.textSecondary}
                  style={styles.switch}
                />
              </View>
            ))}

            {/* Data Security Info */}
            <View style={styles.securityInfo}>
              <MaterialIcons name="security" size={32} color={NeoBrutalism.primary} />
              <Text style={styles.securityTitle}>DATA SECURITY</Text>
              <Text style={styles.securityDescription}>
                All your data is encrypted and stored securely. We never share your personal information 
                with third parties without your explicit consent. You maintain full control over your privacy.
              </Text>
            </View>
          </ScrollView>

          {/* Close Button */}
          <View style={styles.footer}>
            <AnimatedButton
              title="CLOSE"
              onPress={onClose}
              variant="primary"
              size="large"
              style={styles.closeButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  container: {
    backgroundColor: NeoBrutalism.surface,
    borderRadius: 0,
    borderWidth: 4,
    borderColor: NeoBrutalism.void,
    shadowColor: NeoBrutalism.void,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
    maxWidth: 400,
    maxHeight: '90%',
    width: '100%'
  },
  header: {
    padding: 24,
    borderBottomWidth: 3,
    borderBottomColor: NeoBrutalism.border,
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: NeoBrutalism.text,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: NeoBrutalism.textSecondary,
    fontWeight: '700',
    letterSpacing: 1
  },
  content: {
    flex: 1,
    padding: 20
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: NeoBrutalism.background,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: NeoBrutalism.border
  },
  permissionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: NeoBrutalism.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: NeoBrutalism.border
  },
  permissionInfo: {
    flex: 1
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: NeoBrutalism.text,
    marginBottom: 4,
    letterSpacing: 1
  },
  permissionDescription: {
    fontSize: 12,
    color: NeoBrutalism.textSecondary,
    lineHeight: 16,
    fontWeight: '600'
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }]
  },
  securityInfo: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
    backgroundColor: NeoBrutalism.background,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: NeoBrutalism.primary
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: NeoBrutalism.primary,
    marginTop: 12,
    marginBottom: 12,
    letterSpacing: 1.5
  },
  securityDescription: {
    fontSize: 14,
    color: NeoBrutalism.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600'
  },
  footer: {
    padding: 20,
    borderTopWidth: 3,
    borderTopColor: NeoBrutalism.border
  },
  closeButton: {
    width: '100%'
  }
});