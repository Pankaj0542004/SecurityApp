import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, useWindowDimensions, Animated, Vibration } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ScannerScreen() {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filesScanned, setFilesScanned] = useState(0);
  const [threatsFound, setThreatsFound] = useState(0);
  const [permission, requestPermission] = MediaLibrary.usePermissions();
  const [settings, setSettings] = useState({
    realTimeProtection: true,
    autoScan: true,
  });
  const { width, height } = useWindowDimensions();
  const pulseAnim = new Animated.Value(1);
  const buttonScale = new Animated.Value(1);
  const cardScale = new Animated.Value(1);

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
          realTimeProtection: parsedSettings.realTimeProtection ?? true,
          autoScan: parsedSettings.autoScan ?? true,
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  useEffect(() => {
    if (scanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setScanning(false);
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
        setFilesScanned((prev) => prev + Math.floor(Math.random() * 10));
      }, 100);

      return () => {
        clearInterval(interval);
        pulseAnim.stopAnimation();
      };
    }
  }, [scanning]);

  // Real-time protection monitoring
  useEffect(() => {
    let realTimeMonitor: NodeJS.Timeout | null = null;

    const startRealTimeMonitoring = async () => {
      if (!permission?.granted) {
        const { granted } = await requestPermission();
        if (!granted) {
          console.log('Permission denied for real-time monitoring');
          return;
        }
      }

      realTimeMonitor = setInterval(async () => {
        try {
          const assets = await MediaLibrary.getAssetsAsync({
            mediaType: ['photo', 'video', 'audio'],
            first: 1,
            sortBy: ['creationTime'],
          });

          if (assets.assets.length > 0) {
            const latestAsset = assets.assets[0];
            const isThreat = await checkForThreats(latestAsset);
            if (isThreat) {
              setThreatsFound(prev => prev + 1);
              // You can add notification here if needed
            }
          }
        } catch (error) {
          console.error('Error in real-time monitoring:', error);
        }
      }, 30000); // Check every 30 seconds
    };

    if (settings.realTimeProtection) {
      startRealTimeMonitoring();
    }

    return () => {
      if (realTimeMonitor) {
        clearInterval(realTimeMonitor);
      }
    };
  }, [settings.realTimeProtection, permission]);

  // Auto-scan functionality
  useEffect(() => {
    let autoScanInterval: NodeJS.Timeout | null = null;

    const startAutoScan = async () => {
      if (!permission?.granted) {
        const { granted } = await requestPermission();
        if (!granted) {
          console.log('Permission denied for auto-scan');
          return;
        }
      }

      // Schedule daily scan at midnight
      const scheduleNextScan = () => {
        const now = new Date();
        const midnight = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          0, 0, 0
        );
        const timeUntilMidnight = midnight.getTime() - now.getTime();

        autoScanInterval = setTimeout(() => {
          startScan();
          scheduleNextScan();
        }, timeUntilMidnight);
      };

      scheduleNextScan();
    };

    if (settings.autoScan) {
      startAutoScan();
    }

    return () => {
      if (autoScanInterval) {
        clearTimeout(autoScanInterval);
      }
    };
  }, [settings.autoScan, permission]);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
    Vibration.vibrate(50);
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleCardPressIn = () => {
    Animated.spring(cardScale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handleCardPressOut = () => {
    Animated.spring(cardScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const startScan = async () => {
    if (Platform.OS === 'web') {
      alert('Scanning is not available on web platform');
      return;
    }

    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        alert('Permission to access media library is required');
        return;
      }
    }

    setScanning(true);
    setProgress(0);
    setFilesScanned(0);
    setThreatsFound(0);

    try {
      // Get all media files
      const assets = await MediaLibrary.getAssetsAsync({
        mediaType: ['photo', 'video', 'audio'],
      });

      // Calculate total files to scan
      const totalFiles = assets.totalCount;
      let scannedCount = 0;
      let threatsCount = 0;

      // Scan files in batches
      const batchSize = 50;
      for (let i = 0; i < assets.assets.length; i += batchSize) {
        const batch = assets.assets.slice(i, i + batchSize);
        
        // Process each file in the batch
        for (const asset of batch) {
          scannedCount++;
          
          // Check for potential threats
          const isThreat = await checkForThreats(asset);
          if (isThreat) {
            threatsCount++;
          }

          // Update UI
          setFilesScanned(scannedCount);
          setThreatsFound(threatsCount);
          setProgress((scannedCount / totalFiles) * 100);
        }

        // Small delay to prevent UI freezing
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Scan complete
      setScanning(false);
    } catch (error) {
      console.error('Error scanning files:', error);
      alert('Error scanning files');
      setScanning(false);
    }
  };

  // Helper function to check for potential threats
  const checkForThreats = async (asset: MediaLibrary.Asset) => {
    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);
      
      // Basic threat checks
      // 1. Check file size (unusually large files might be suspicious)
      const suspiciousSize = fileInfo.exists && fileInfo.size ? fileInfo.size > 100 * 1024 * 1024 : false; // Files larger than 100MB
      
      // 2. Check file extension
      const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.msi', '.dll'];
      const hasSuspiciousExtension = suspiciousExtensions.some(ext => 
        asset.filename.toLowerCase().endsWith(ext)
      );
      
      // 3. Check file name for suspicious patterns
      const suspiciousPatterns = ['virus', 'malware', 'trojan', 'spyware'];
      const hasSuspiciousName = suspiciousPatterns.some(pattern => 
        asset.filename.toLowerCase().includes(pattern)
      );

      return suspiciousSize || hasSuspiciousExtension || hasSuspiciousName;
    } catch (error) {
      console.error('Error checking file:', error);
      return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A1929', '#1E3A5F']}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: width * 0.07 }]}>Security Scanner</Text>
        <Text style={[styles.subtitle, { fontSize: width * 0.04 }]}>Protect your device from threats</Text>
      </View>

      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <TouchableOpacity
          style={[styles.scanButton, { marginTop: height * 0.05 }]}
          onPress={startScan}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={scanning}>
          <LinearGradient
            colors={scanning ? ['#1E3A5F', '#2D5A8E'] : ['#3B82F6', '#60A5FA']}
            style={[styles.buttonGradient, scanning && { transform: [{ scale: pulseAnim }] }]}>
            <Shield size={width * 0.1} color="#FFFFFF" />
            <Text style={[styles.buttonText, { fontSize: width * 0.045 }]}>
              {scanning ? 'Scanning...' : 'Start Scan'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {scanning && (
        <View style={[styles.progressContainer, { marginTop: height * 0.03 }]}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      )}

      <View style={[styles.statsContainer, { marginTop: height * 0.05 }]}>
        <Animated.View 
          style={[
            styles.statCard, 
            { width: width * 0.4, transform: [{ scale: cardScale }] }
          ]}
          onTouchStart={handleCardPressIn}
          onTouchEnd={handleCardPressOut}>
          <LinearGradient
            colors={['rgba(96, 165, 250, 0.1)', 'rgba(96, 165, 250, 0.2)']}
            style={styles.statIconContainer}>
            <CheckCircle2 size={width * 0.06} color="#60A5FA" />
          </LinearGradient>
          <Text style={[styles.statNumber, { fontSize: width * 0.06 }]}>{filesScanned}</Text>
          <Text style={[styles.statLabel, { fontSize: width * 0.035 }]}>Files Scanned</Text>
        </Animated.View>

        <Animated.View 
          style={[
            styles.statCard, 
            { width: width * 0.4, transform: [{ scale: cardScale }] }
          ]}
          onTouchStart={handleCardPressIn}
          onTouchEnd={handleCardPressOut}>
          <LinearGradient
            colors={['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.2)']}
            style={styles.statIconContainer}>
            <AlertCircle size={width * 0.06} color="#EF4444" />
          </LinearGradient>
          <Text style={[styles.statNumber, { fontSize: width * 0.06 }]}>{threatsFound}</Text>
          <Text style={[styles.statLabel, { fontSize: width * 0.035 }]}>Threats Found</Text>
        </Animated.View>
      </View>
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
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: '2%',
  },
  subtitle: {
    color: '#94A3B8',
    textAlign: 'center',
  },
  scanButton: {
    marginHorizontal: '5%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonGradient: {
    padding: '5%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: '2%',
  },
  progressContainer: {
    marginHorizontal: '5%',
    backgroundColor: '#1E3A5F',
    borderRadius: 10,
    overflow: 'hidden',
    height: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: '5%',
  },
  statCard: {
    backgroundColor: 'rgba(30, 58, 95, 0.8)',
    borderRadius: 15,
    padding: '5%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statIconContainer: {
    width: '25%',
    aspectRatio: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '5%',
  },
  statNumber: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: '5%',
  },
  statLabel: {
    color: '#94A3B8',
    marginTop: '2%',
  },
});