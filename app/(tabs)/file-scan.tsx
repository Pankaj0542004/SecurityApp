import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, useWindowDimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Folder, File, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationService } from '@/services/NotificationService';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  items: number;
}

export default function FileScanScreen() {
  const { width, height } = useWindowDimensions();
  const [files] = useState<FileItem[]>([
  { id: '1', name: 'Downloads', type: 'folder', items: 45 },
  { id: '2', name: 'Documents', type: 'folder', items: 23 },
  { id: '3', name: 'Pictures', type: 'folder', items: 128 },
  { id: '4', name: 'Videos', type: 'folder', items: 12 },
  { id: '5', name: 'Music', type: 'folder', items: 67 },
  { id: '6', name: 'Resume.pdf', type: 'file', items: 0 },
  { id: '7', name: 'Project.zip', type: 'file', items: 0 },
  { id: '8', name: 'Invoice.xlsx', type: 'file', items: 0 },
  { id: '9', name: 'Presentation.pptx', type: 'file', items: 0 },
  { id: '10', name: 'Notes.txt', type: 'file', items: 0 },
  { id: '11', name: 'Profile.png', type: 'file', items: 0 },
  { id: '12', name: 'Budget.csv', type: 'file', items: 0 },
  { id: '13', name: 'Archive.rar', type: 'file', items: 0 },
  { id: '14', name: 'Readme.md', type: 'file', items: 0 },
  { id: '15', name: 'Screenshot.jpg', type: 'file', items: 0 },
  ]);
  const notificationService = NotificationService.getInstance();

  useEffect(() => {
    notificationService.initialize();
  }, []);

  const handleFileScan = async (file: FileItem) => {
    // Simulate scanning process
    const scanResult = await simulateScan(file);
    
    if (scanResult.threats.length > 0) {
      // Send notification for each threat found
      scanResult.threats.forEach(threat => {
        notificationService.sendThreatNotification({
          threatName: threat.name,
          filePath: file.name,
          threatType: threat.type,
        });
      });
    }
  };

  const simulateScan = async (file: FileItem) => {
    // Simulate scanning process with random threats
    return new Promise<{ threats: Array<{ name: string; type: string }> }>((resolve) => {
      setTimeout(() => {
        const hasThreat = Math.random() > 0.7; // 30% chance of finding a threat
        resolve({
          threats: hasThreat ? [
            { name: 'Malware.Trojan', type: 'Trojan' },
            { name: 'Adware.Generic', type: 'Adware' }
          ] : []
        });
      }, 2000);
    });
  };

  const renderItem = ({ item, index }: { item: FileItem; index: number }) => {
    const scaleAnim = new Animated.Value(1);
    
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

    return (
      <TouchableOpacity 
        style={[styles.fileItem, { marginBottom: height * 0.01 }]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => handleFileScan(item)}
        activeOpacity={0.7}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View style={[styles.fileIcon, { width: width * 0.1, height: width * 0.1 }]}>
            <LinearGradient
              colors={['rgba(96, 165, 250, 0.1)', 'rgba(96, 165, 250, 0.2)']}
              style={styles.iconGradient}>
              {item.type === 'folder' ? (
                <Folder size={width * 0.06} color="#60A5FA" />
              ) : (
                <File size={width * 0.06} color="#60A5FA" />
              )}
            </LinearGradient>
          </View>
          <View style={[styles.fileInfo, { marginLeft: width * 0.04 }]}>
            <Text style={[styles.fileName, { fontSize: width * 0.04 }]}>{item.name}</Text>
            <Text style={[styles.fileDetails, { fontSize: width * 0.035 }]}>{item.items} items</Text>
          </View>
          <ChevronRight size={width * 0.05} color="#60A5FA" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A1929', '#1E3A5F']}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: width * 0.07 }]}>File Scanner</Text>
        <Text style={[styles.subtitle, { fontSize: width * 0.04 }]}>Select location to scan</Text>
      </View>

      <FlatList
        data={files}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContainer, { padding: width * 0.05 }]}
        showsVerticalScrollIndicator={false}
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
  listContainer: {
    flexGrow: 1,
  },
  fileItem: {
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
  fileIcon: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fileDetails: {
    color: '#94A3B8',
    marginTop: '1%',
  },
});