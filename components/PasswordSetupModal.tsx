import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, useWindowDimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock } from 'lucide-react-native';

interface PasswordSetupModalProps {
    visible: boolean;
    onClose: () => void;
    onSetupComplete: (password: string) => void;
}

export default function PasswordSetupModal({ visible, onClose, onSetupComplete }: PasswordSetupModalProps) {
    const { width, height } = useWindowDimensions();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [shakeAnim] = useState(new Animated.Value(0));

    const handleSetup = () => {
        if (password.length < 4) {
            setError('Password must be at least 4 characters long');
            shakeAnimation();
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            shakeAnimation();
            return;
        }

        onSetupComplete(password);
        setPassword('');
        setConfirmPassword('');
        setError('');
        onClose();
    };

    const shakeAnimation = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true })
        ]).start();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}>
            <View style={styles.container}>
                <LinearGradient
                    colors={['rgba(10, 25, 41, 0.9)', 'rgba(30, 58, 95, 0.9)']}
                    style={styles.background}
                />
                
                <Animated.View style={[
                    styles.modalContent,
                    { transform: [{ translateX: shakeAnim }] }
                ]}>
                    <View style={[styles.iconContainer, { width: width * 0.15, height: width * 0.15 }]}>
                        <Lock size={width * 0.08} color="#60A5FA" />
                    </View>
                    
                    <Text style={[styles.title, { fontSize: width * 0.05 }]}>Set App Lock Password</Text>
                    <Text style={[styles.subtitle, { fontSize: width * 0.035 }]}>
                        Create a password to secure your app
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
                    />

                    <TextInput
                        style={[styles.input, { width: width * 0.8 }]}
                        placeholder="Confirm password"
                        placeholderTextColor="#94A3B8"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={(text) => {
                            setConfirmPassword(text);
                            setError('');
                        }}
                        onSubmitEditing={handleSetup}
                    />

                    {error ? (
                        <Text style={[styles.error, { fontSize: width * 0.035 }]}>
                            {error}
                        </Text>
                    ) : null}

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, { width: width * 0.35 }]}
                            onPress={onClose}>
                            <Text style={[styles.buttonText, { fontSize: width * 0.035 }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, { width: width * 0.35 }]}
                            onPress={handleSetup}>
                            <LinearGradient
                                colors={['#3B82F6', '#60A5FA']}
                                style={styles.buttonGradient}>
                                <Text style={[styles.buttonText, { fontSize: width * 0.035 }]}>
                                    Set Password
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
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
    modalContent: {
        backgroundColor: 'rgba(30, 58, 95, 0.95)',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        width: '90%',
        maxWidth: 400,
    },
    iconContainer: {
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
        borderRadius: 20,
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
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        backgroundColor: 'rgba(30, 58, 95, 0.8)',
        borderRadius: 10,
        padding: 15,
        color: '#FFFFFF',
        marginBottom: 15,
    },
    error: {
        color: '#EF4444',
        marginBottom: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    button: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    cancelButton: {
        backgroundColor: 'rgba(30, 58, 95, 0.8)',
        padding: 15,
        alignItems: 'center',
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