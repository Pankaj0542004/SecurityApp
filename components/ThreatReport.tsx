import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, Shield, CheckCircle2 } from 'lucide-react-native';

interface ThreatReportProps {
    scannedFiles: number;
    threatsFound: number;
    threats: Array<{
        file: string;
        threats: string[];
    }>;
    scanTime: Date;
}

export default function ThreatReport({ scannedFiles, threatsFound, threats, scanTime }: ThreatReportProps) {
    const { width, height } = useWindowDimensions();

    return (
        <View style={[styles.container, { width }]}>
            <LinearGradient
                colors={['#0A1929', '#1E3A5F']}
                style={styles.background}
            />
            
            <View style={styles.header}>
                <Text style={[styles.title, { fontSize: width * 0.06 }]}>Scan Report</Text>
                <Text style={[styles.subtitle, { fontSize: width * 0.035 }]}>
                    {scanTime.toLocaleString()}
                </Text>
            </View>

            <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                    <Shield size={width * 0.08} color="#60A5FA" />
                    <Text style={[styles.summaryText, { fontSize: width * 0.04 }]}>
                        {scannedFiles} Files Scanned
                    </Text>
                </View>
                
                <View style={styles.summaryItem}>
                    {threatsFound > 0 ? (
                        <>
                            <AlertTriangle size={width * 0.08} color="#EF4444" />
                            <Text style={[styles.summaryText, { fontSize: width * 0.04, color: '#EF4444' }]}>
                                {threatsFound} Threats Found
                            </Text>
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={width * 0.08} color="#10B981" />
                            <Text style={[styles.summaryText, { fontSize: width * 0.04, color: '#10B981' }]}>
                                No Threats Found
                            </Text>
                        </>
                    )}
                </View>
            </View>

            {threats.length > 0 && (
                <ScrollView style={styles.threatsList}>
                    {threats.map((threat, index) => (
                        <View key={index} style={styles.threatItem}>
                            <Text style={[styles.fileName, { fontSize: width * 0.04 }]}>
                                {threat.file}
                            </Text>
                            {threat.threats.map((t, i) => (
                                <Text key={i} style={[styles.threatText, { fontSize: width * 0.035 }]}>
                                    • {t}
                                </Text>
                            ))}
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
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
    header: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        color: '#94A3B8',
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryText: {
        color: '#FFFFFF',
        marginTop: 10,
        fontWeight: '500',
    },
    threatsList: {
        flex: 1,
        padding: 20,
    },
    threatItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    fileName: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    threatText: {
        color: '#EF4444',
        marginLeft: 10,
    },
}); 