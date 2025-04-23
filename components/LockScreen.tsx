import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, useWindowDimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock } from 'lucide-react-native';

interface LockScreenProps {
    onUnlock: (password: string) => Promise<boolean>;
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
    const { width, height } = useWindowDimensions();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [shakeAnim] = useState(new Animated.Value(0));

    const handleUnlock = async () => {
        const success = await onUnlock(password);
        if (!success) {
            setError('Incorrect password');
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true })
            ]).start();
        }
        setPassword('');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0A1929', '#1E3A5F']}
                style={styles.background}
            />
            
            <Animated.View style={[
                styles.content,
                { transform: [{ translateX: shakeAnim }] }
            ]}>
                <View style={[styles.iconContainer, { width: width * 0.2, height: width * 0.2 }]}>
                    <Lock size={width * 0.1} color="#60A5FA" />
                </View>
                
                <Text style={[styles.title, { fontSize: width * 0.06 }]}>App Locked</Text>
                <Text style={[styles.subtitle, { fontSize: width * 0.04 }]}>
                    Enter your password to unlock
                </Text>

                <TextInput
                    style={[styles.input, { width: width * 0.8 }]}
                    placeholder="Enter password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        setError('');
                    }}
                    onSubmitEditing={handleUnlock}
                />

                {error ? (
                    <Text style={[styles.error, { fontSize: width * 0.035 }]}>
                        {error}
                    </Text>
                ) : null}

                <TouchableOpacity
                    style={[styles.button, { width: width * 0.8 }]}
                    onPress={handleUnlock}>
                    <LinearGradient
                        colors={['#3B82F6', '#60A5FA']}
                        style={styles.buttonGradient}>
                        <Text style={[styles.buttonText, { fontSize: width * 0.04 }]}>
                            Unlock
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    content: {
        alignItems: 'center',
        padding: 20,
    },
    iconContainer: {
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        color: '#94A3B8',
        marginBottom: 30,
    },
    input: {
        backgroundColor: 'rgba(30, 58, 95, 0.8)',
        borderRadius: 10,
        padding: 15,
        color: '#FFFFFF',
        marginBottom: 20,
    },
    error: {
        color: '#EF4444',
        marginBottom: 20,
    },
    button: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    buttonGradient: {
        padding: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
}); 