import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class NotificationService {
    private static instance: NotificationService;
    private isInitialized = false;

    private constructor() {}

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    public async initialize() {
        if (this.isInitialized) return;

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        this.isInitialized = true;
    }

    public async sendThreatNotification(threatDetails: {
        threatName: string;
        filePath: string;
        threatType: string;
    }) {
        const settings = await this.getNotificationSettings();
        if (!settings.notifications) return;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Threat Detected!',
                body: `Found ${threatDetails.threatName} in ${threatDetails.filePath}`,
                data: { threatDetails },
            },
            trigger: null, // Send immediately
        });
    }

    private async getNotificationSettings() {
        try {
            const settings = await AsyncStorage.getItem('securitySettings');
            return settings ? JSON.parse(settings) : { notifications: true };
        } catch (error) {
            console.error('Error getting notification settings:', error);
            return { notifications: true };
        }
    }
} 