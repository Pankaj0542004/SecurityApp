import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useWindowDimensions, Animated, PermissionsAndroid, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TriangleAlert as AlertTriangle, Trash2, Shield } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';

interface ThreatItem {
  id: string;
  name: string;
  type: string;
  location: string;
  timestamp: string;
}

export default function ThreatsScreen() {
  const { width, height } = useWindowDimensions();
  const [threats, setThreats] = useState<ThreatItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to scan for threats',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          startScanning();
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
      if (status === 'granted') {
        startScanning();
      }
    }
  };

  const startScanning = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate scanning process
    const scanInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(scanInterval);
          setIsScanning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    // In a real app, you would implement actual file scanning logic here
    // This is a placeholder for demonstration
    const newThreats: ThreatItem[] = [
      { 
        id: Date.now().toString(), 
        name: 'Suspicious_file.apk', 
        type: 'malware', 
        location: '/Downloads',
        timestamp: new Date().toISOString()
      },
      { 
        id: (Date.now() + 1).toString(), 
        name: 'tracking.js', 
        type: 'spyware', 
        location: '/Documents',
        timestamp: new Date().toISOString()
      }
    ];

    setThreats(prev => [...prev, ...newThreats]);
  };

  const removeThreat = (id: string) => {
    setThreats(prev => prev.filter(threat => threat.id !== id));
  };

  const removeAllThreats = () => {
    setThreats([]);
  };

  const renderItem = ({ item, index }: { item: ThreatItem; index: number }) => {
    const scaleAnim = new Animated.Value(1);
    const deleteScaleAnim = new Animated.Value(1);
    
    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    const handleDeletePressIn = () => {
      Animated.spring(deleteScaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
      }).start();
    };

    const handleDeletePressOut = () => {
      Animated.spring(deleteScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View 
        style={[
          styles.threatItem, 
          { 
            marginBottom: height * 0.01,
            transform: [{ scale: scaleAnim }]
          }
        ]}>
        <TouchableOpacity 
          style={styles.threatContent}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.7}>
          <View style={[styles.threatIcon, { width: width * 0.1, height: width * 0.1 }]}>
            <LinearGradient
              colors={['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.2)']}
              style={styles.iconGradient}>
              <AlertTriangle size={width * 0.06} color="#EF4444" />
            </LinearGradient>
          </View>
          <View style={[styles.threatInfo, { marginLeft: width * 0.04 }]}>
            <Text style={[styles.threatName, { fontSize: width * 0.04 }]}>{item.name}</Text>
            <Text style={[styles.threatType, { fontSize: width * 0.035 }]}>{item.type}</Text>
            <Text style={[styles.threatLocation, { fontSize: width * 0.03 }]}>{item.location}</Text>
          </View>
        </TouchableOpacity>
        <Animated.View style={{ transform: [{ scale: deleteScaleAnim }] }}>
          <TouchableOpacity 
            style={[styles.deleteButton, { padding: width * 0.025 }]}
            onPressIn={handleDeletePressIn}
            onPressOut={handleDeletePressOut}
            activeOpacity={0.7}>
            <Trash2 size={width * 0.05} color="#EF4444" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A1929', '#1E3A5F']}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: width * 0.07 }]}>Detected Threats</Text>
        <Text style={[styles.subtitle, { fontSize: width * 0.04 }]}>{threats.length} threats found</Text>
      </View>

      {isScanning && (
        <View style={styles.scanningContainer}>
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={[styles.scanProgress, { width: `${scanProgress}%` }]}
          />
          <Text style={styles.scanningText}>Scanning... {scanProgress}%</Text>
        </View>
      )}

      <FlatList
        data={threats}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContainer, { padding: width * 0.05 }]}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.scanButton, { marginBottom: width * 0.02 }]}
          onPress={startScanning}
          activeOpacity={0.7}>
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={styles.scanGradient}>
            <Shield size={width * 0.05} color="#FFFFFF" />
            <Text style={[styles.scanText, { fontSize: width * 0.04 }]}>Start Scan</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.removeAllButton, { margin: width * 0.05 }]}
          onPress={removeAllThreats}
          activeOpacity={0.7}>
          <LinearGradient
            colors={['#DC2626', '#EF4444']}
            style={styles.removeAllGradient}>
            <Text style={[styles.removeAllText, { fontSize: width * 0.04 }]}>Remove All Threats</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  listContainer: {
    flexGrow: 1,
  },
  threatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 95, 0.8)',
    borderRadius: 12,
    padding: '4%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  threatContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  threatIcon: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  threatInfo: {
    flex: 1,
  },
  threatName: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  threatType: {
    color: '#EF4444',
    marginTop: '1%',
    textTransform: 'capitalize',
  },
  threatLocation: {
    color: '#94A3B8',
    marginTop: '1%',
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeAllButton: {
    borderRadius: 12,
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
  removeAllGradient: {
    padding: '4%',
    alignItems: 'center',
  },
  removeAllText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scanningContainer: {
    marginHorizontal: '5%',
    marginBottom: '5%',
    backgroundColor: 'rgba(30, 58, 95, 0.8)',
    borderRadius: 12,
    padding: '4%',
  },
  scanProgress: {
    height: 8,
    borderRadius: 4,
    marginBottom: '2%',
  },
  scanningText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  footer: {
    width: '100%',
  },
  scanButton: {
    borderRadius: 12,
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
  scanGradient: {
    padding: '4%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  scanText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});