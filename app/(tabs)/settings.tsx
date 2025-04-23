import { View, Text, StyleSheet, Switch, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Shield, Clock, Zap, Lock } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PasswordSetupModal from '@/components/PasswordSetupModal';
import { AppLockService } from '@/services/AppLockService';

interface Settings {
  realTimeProtection: boolean;
  autoScan: boolean;
  notifications: boolean;
  deepScan: boolean;
  appLock: boolean;
}

export default function SettingsScreen() {
  const { width, height } = useWindowDimensions();
  const [settings, setSettings] = useState<Settings>({
    realTimeProtection: true,
    autoScan: true,
    notifications: true,
    deepScan: false,
    appLock: false,
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const appLockService = new AppLockService();

  // Load settings when component mounts
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('securitySettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          ...parsedSettings,
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem('securitySettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleSetting = async (key: keyof Settings) => {
    if (key === 'appLock') {
      if (!settings.appLock) {
        setShowPasswordModal(true);
        return;
      } else {
        await appLockService.disableAppLock();
      }
    }

    setSettings(prev => {
      const newSettings = {
        ...prev,
        [key]: !prev[key]
      };
      saveSettings(newSettings);
      return newSettings;
    });
  };

  const handlePasswordSetup = async (password: string) => {
    await appLockService.enableAppLock(password);
    setSettings(prev => {
      const newSettings = {
        ...prev,
        appLock: true
      };
      saveSettings(newSettings);
      return newSettings;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A1929', '#1E3A5F']}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: width * 0.07 }]}>Settings</Text>
        <Text style={[styles.subtitle, { fontSize: width * 0.04 }]}>Configure security preferences</Text>
      </View>

      <ScrollView style={[styles.settingsContainer, { padding: width * 0.05 }]}>
        <View style={[styles.section, { marginBottom: height * 0.03 }]}>
          <Text style={[styles.sectionTitle, { fontSize: width * 0.045 }]}>Protection</Text>
          
          <View style={[styles.settingItem, { marginBottom: height * 0.01 }]}>
            <View style={[styles.settingIcon, { width: width * 0.1, height: width * 0.1 }]}>
              <Shield size={width * 0.06} color="#60A5FA" />
            </View>
            <View style={[styles.settingInfo, { marginLeft: width * 0.04 }]}>
              <Text style={[styles.settingName, { fontSize: width * 0.04 }]}>Real-time Protection</Text>
              <Text style={[styles.settingDescription, { fontSize: width * 0.035 }]}>Monitor files in real-time</Text>
            </View>
            <Switch
              value={settings.realTimeProtection}
              onValueChange={() => toggleSetting('realTimeProtection')}
              trackColor={{ false: '#1E3A5F', true: '#3B82F6' }}
              thumbColor={settings.realTimeProtection ? '#60A5FA' : '#94A3B8'}
            />
          </View>

          <View style={[styles.settingItem, { marginBottom: height * 0.01 }]}>
            <View style={[styles.settingIcon, { width: width * 0.1, height: width * 0.1 }]}>
              <Clock size={width * 0.06} color="#60A5FA" />
            </View>
            <View style={[styles.settingInfo, { marginLeft: width * 0.04 }]}>
              <Text style={[styles.settingName, { fontSize: width * 0.04 }]}>Auto Scan</Text>
              <Text style={[styles.settingDescription, { fontSize: width * 0.035 }]}>Schedule daily scans</Text>
            </View>
            <Switch
              value={settings.autoScan}
              onValueChange={() => toggleSetting('autoScan')}
              trackColor={{ false: '#1E3A5F', true: '#3B82F6' }}
              thumbColor={settings.autoScan ? '#60A5FA' : '#94A3B8'}
            />
          </View>
        </View>

        <View style={[styles.section, { marginBottom: height * 0.03 }]}>
          <Text style={[styles.sectionTitle, { fontSize: width * 0.045 }]}>Notifications</Text>
          
          <View style={[styles.settingItem, { marginBottom: height * 0.01 }]}>
            <View style={[styles.settingIcon, { width: width * 0.1, height: width * 0.1 }]}>
              <Bell size={width * 0.06} color="#60A5FA" />
            </View>
            <View style={[styles.settingInfo, { marginLeft: width * 0.04 }]}>
              <Text style={[styles.settingName, { fontSize: width * 0.04 }]}>Push Notifications</Text>
              <Text style={[styles.settingDescription, { fontSize: width * 0.035 }]}>Get alerts about threats</Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={() => toggleSetting('notifications')}
              trackColor={{ false: '#1E3A5F', true: '#3B82F6' }}
              thumbColor={settings.notifications ? '#60A5FA' : '#94A3B8'}
            />
          </View>
        </View>

        <View style={[styles.section, { marginBottom: height * 0.03 }]}>
          <Text style={[styles.sectionTitle, { fontSize: width * 0.045 }]}>Advanced</Text>
          
          <View style={[styles.settingItem, { marginBottom: height * 0.01 }]}>
            <View style={[styles.settingIcon, { width: width * 0.1, height: width * 0.1 }]}>
              <Zap size={width * 0.06} color="#60A5FA" />
            </View>
            <View style={[styles.settingInfo, { marginLeft: width * 0.04 }]}>
              <Text style={[styles.settingName, { fontSize: width * 0.04 }]}>Deep Scan</Text>
              <Text style={[styles.settingDescription, { fontSize: width * 0.035 }]}>Thorough system scan</Text>
            </View>
            <Switch
              value={settings.deepScan}
              onValueChange={() => toggleSetting('deepScan')}
              trackColor={{ false: '#1E3A5F', true: '#3B82F6' }}
              thumbColor={settings.deepScan ? '#60A5FA' : '#94A3B8'}
            />
          </View>

          <View style={[styles.settingItem, { marginBottom: height * 0.01 }]}>
            <View style={[styles.settingIcon, { width: width * 0.1, height: width * 0.1 }]}>
              <Lock size={width * 0.06} color="#60A5FA" />
            </View>
            <View style={[styles.settingInfo, { marginLeft: width * 0.04 }]}>
              <Text style={[styles.settingName, { fontSize: width * 0.04 }]}>App Lock</Text>
              <Text style={[styles.settingDescription, { fontSize: width * 0.035 }]}>Secure with password</Text>
            </View>
            <Switch
              value={settings.appLock}
              onValueChange={() => toggleSetting('appLock')}
              trackColor={{ false: '#1E3A5F', true: '#3B82F6' }}
              thumbColor={settings.appLock ? '#60A5FA' : '#94A3B8'}
            />
          </View>
        </View>
      </ScrollView>

      <PasswordSetupModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSetupComplete={handlePasswordSetup}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingTop: '5%',
    paddingHorizontal: '5%',
    marginBottom: '5%',
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: '2%',
  },
  subtitle: {
    color: '#94A3B8',
  },
  settingsContainer: {
    flex: 1,
  },
  section: {
    marginBottom: '5%',
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: '3%',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 95, 0.8)',
    borderRadius: 12,
    padding: '4%',
  },
  settingIcon: {
    borderRadius: 20,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingName: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  settingDescription: {
    color: '#94A3B8',
    marginTop: '1%',
  },
});