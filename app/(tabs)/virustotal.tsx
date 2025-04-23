import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, ScrollView, Alert, Linking, useWindowDimensions, SafeAreaView, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Search, AlertCircle, CheckCircle, XCircle, ExternalLink, Shield, Globe, History, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import VirusTotalService, { ScanResult } from '../../services/VirusTotalService';
import { BlurView } from 'expo-blur';

export default function VirusTotalScreen() {
  const { width } = useWindowDimensions();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<Array<{input: string, result: ScanResult}>>([]);

  const validateInput = () => {
    if (!input.trim()) {
      setError('Please enter a valid URL');
      return false;
    }

    try {
      new URL(input);
      return true;
    } catch {
      setError('Please enter a valid URL');
      return false;
    }
  };

  const handleScan = async () => {
    setError(null);
    if (!validateInput()) return;

    setIsLoading(true);
    try {
      const scanResult = await VirusTotalService.mockScan(input, 'url');
      
      setRecentScans(prev => [
        { input, result: scanResult },
        ...prev.slice(0, 4)
      ]);
      
      setResult(scanResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clean':
        return '#10B981';
      case 'suspicious':
        return '#F59E0B';
      case 'malicious':
        return '#EF4444';
      default:
        return '#94A3B8';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'clean':
        return <CheckCircle size={24} color="#10B981" />;
      case 'suspicious':
        return <AlertCircle size={24} color="#F59E0B" />;
      case 'malicious':
        return <XCircle size={24} color="#EF4444" />;
      default:
        return <AlertCircle size={24} color="#94A3B8" />;
    }
  };

  const openVirusTotalReport = () => {
    if (result?.permalink) {
      Linking.openURL(result.permalink);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0A1929', '#1E3A5F']}
        style={styles.background}
      />
      
      <ScrollView style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Shield size={width * 0.08} color="#60A5FA" />
            <Text style={[styles.title, { fontSize: width * 0.06 }]}>VirusTotal Scanner</Text>
          </View>
          <Text style={[styles.subtitle, { fontSize: width * 0.035 }]}>
            Check URLs against multiple antivirus engines
          </Text>
        </View>

        {/* Scan Input Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Search size={width * 0.06} color="#60A5FA" />
            <Text style={[styles.sectionTitle, { fontSize: width * 0.045 }]}>
              Scan URL
            </Text>
          </View>

          <TextInput
            style={[styles.input, { fontSize: width * 0.04 }]}
            placeholder="Enter URL to scan"
            placeholderTextColor="#94A3B8"
            value={input}
            onChangeText={(text) => {
              setInput(text);
              setError(null);
            }}
          />

          {error && (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { fontSize: width * 0.035 }]}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleScan}
            disabled={isLoading || !input}
            style={[styles.scanButton, (isLoading || !input) && styles.scanButtonDisabled]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[styles.scanButtonText, { fontSize: width * 0.04 }]}>
                Scan URL
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {result && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontSize: width * 0.045 }]}>Scan Results</Text>
              {getStatusIcon(result.status)}
            </View>

            <View style={styles.resultCard}>
              <Text style={[styles.resultLabel, { fontSize: width * 0.035 }]}>Detection Rate</Text>
              <Text style={[styles.resultValue, { fontSize: width * 0.06 }]}>
                {result.positives}/{result.total}
              </Text>
              <Text 
                style={[
                  styles.resultStatus,
                  { fontSize: width * 0.04, color: getStatusColor(result.status) }
                ]}
              >
                {result.status.toUpperCase()}
              </Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={[styles.resultLabel, { fontSize: width * 0.035 }]}>Scan Date</Text>
              <Text style={[styles.resultValue, { fontSize: width * 0.04 }]}>
                {new Date(result.scan_date).toLocaleString()}
              </Text>
            </View>

            {result.details && (
              <View style={styles.resultCard}>
                <Text style={[styles.resultLabel, { fontSize: width * 0.035 }]}>Engine Results</Text>
                {result.details.engines.map((engine, index) => (
                  <View key={index} style={styles.engineResult}>
                    <Text style={[styles.engineName, { fontSize: width * 0.035 }]}>{engine.name}</Text>
                    <Text style={[
                      styles.engineStatus,
                      { fontSize: width * 0.035, color: engine.detected ? '#EF4444' : '#10B981' }
                    ]}>
                      {engine.result}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              onPress={openVirusTotalReport}
              style={styles.reportButton}
            >
              <ExternalLink size={width * 0.05} color="#60A5FA" />
              <Text style={[styles.reportButtonText, { fontSize: width * 0.035 }]}>View Full Report</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Scans Section */}
        {recentScans.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <History size={width * 0.06} color="#60A5FA" />
              <Text style={[styles.sectionTitle, { fontSize: width * 0.045 }]}>Recent Scans</Text>
            </View>
            
            {recentScans.map((scan, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.recentScanItem}
                onPress={() => {
                  setInput(scan.input);
                  setResult(scan.result);
                }}
              >
                <View style={styles.recentScanContent}>
                  <Globe size={width * 0.05} color="#94A3B8" />
                  <Text 
                    style={[styles.recentScanInput, { fontSize: width * 0.035 }]} 
                    numberOfLines={1}
                  >
                    {scan.input}
                  </Text>
                </View>
                <View style={styles.recentScanStatus}>
                  {getStatusIcon(scan.result.status)}
                  <Text 
                    style={[
                      styles.recentScanCount,
                      { fontSize: width * 0.035, color: getStatusColor(scan.result.status) }
                    ]}
                  >
                    {scan.result.positives}/{scan.result.total}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Info size={width * 0.06} color="#60A5FA" />
            <Text style={[styles.sectionTitle, { fontSize: width * 0.045 }]}>About VirusTotal</Text>
          </View>
          <Text style={[styles.infoText, { fontSize: width * 0.035 }]}>
            VirusTotal aggregates many antivirus products and online scan engines to check for viruses that the URL contains. 
            It provides a free service that analyzes suspicious URLs to detect types of malware and maliciously break down their behavior.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1929',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    paddingTop: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: '#94A3B8',
    lineHeight: 22,
  },
  section: {
    backgroundColor: 'rgba(30, 58, 95, 0.6)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 10,
  },
  input: {
    backgroundColor: 'rgba(30, 58, 95, 0.4)',
    borderRadius: 15,
    padding: 16,
    color: '#FFFFFF',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
  },
  scanButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  scanButtonDisabled: {
    backgroundColor: '#1E3A5F',
    opacity: 0.7,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: 'rgba(30, 58, 95, 0.4)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  resultLabel: {
    color: '#94A3B8',
    marginBottom: 8,
    fontWeight: '500',
  },
  resultValue: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  resultStatus: {
    fontWeight: '600',
    marginTop: 8,
  },
  engineResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
  },
  engineName: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  engineStatus: {
    fontWeight: '500',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  reportButtonText: {
    color: '#60A5FA',
    fontWeight: '500',
    marginLeft: 10,
  },
  recentScanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 58, 95, 0.4)',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  recentScanContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentScanInput: {
    color: '#FFFFFF',
    marginLeft: 12,
    fontWeight: '500',
  },
  recentScanStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentScanCount: {
    marginLeft: 10,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: 'rgba(30, 58, 95, 0.6)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  infoText: {
    color: '#94A3B8',
    lineHeight: 24,
  },
}); 