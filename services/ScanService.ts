import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { NotificationService } from './NotificationService';

export class ScanService {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

    async scanFile(filePath: string): Promise<{ isInfected: boolean; threats: string[] }> {
        try {
            // Basic file scanning logic
            const fileInfo = await FileSystem.getInfoAsync(filePath);
            const fileContent = await FileSystem.readAsStringAsync(filePath, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            // Check for common threat patterns
            const threats = this.detectThreats(fileContent);
            
            return {
                isInfected: threats.length > 0,
                threats,
            };
        } catch (error) {
            console.error('Error scanning file:', error);
            throw error;
        }
    }

    async scanMediaAsset(asset: MediaLibrary.Asset): Promise<{ isInfected: boolean; threats: string[] }> {
        try {
            const fileInfo = await FileSystem.getInfoAsync(asset.uri);
            if (!fileInfo.exists) {
                return { isInfected: false, threats: [] };
            }

            return this.scanFile(asset.uri);
        } catch (error) {
            console.error('Error scanning media asset:', error);
            throw error;
        }
    }

    private detectThreats(content: string): string[] {
        const threats: string[] = [];
        
        // Basic threat detection patterns
        const threatPatterns = [
            { pattern: /eval\(/, name: 'Suspicious eval usage' },
            { pattern: /base64_decode\(/, name: 'Base64 decoding' },
            { pattern: /shell_exec\(/, name: 'Shell execution' },
            { pattern: /system\(/, name: 'System command execution' },
            { pattern: /<script>.*?<\/script>/i, name: 'Embedded script' },
        ];

        for (const { pattern, name } of threatPatterns) {
            if (pattern.test(content)) {
                threats.push(name);
            }
        }

        return threats;
    }

    async scanDirectory(directoryPath: string): Promise<{
        scannedFiles: number;
        threatsFound: number;
        scanTime: Date;
    }> {
        let scannedFiles = 0;
        let threatsFound = 0;
        const startTime = new Date();

        try {
            const files = await FileSystem.readDirectoryAsync(directoryPath);
            
            for (const file of files) {
                const filePath = `${directoryPath}/${file}`;
                const fileInfo = await FileSystem.getInfoAsync(filePath);
                
                if (fileInfo.isDirectory) {
                    const result = await this.scanDirectory(filePath);
                    scannedFiles += result.scannedFiles;
                    threatsFound += result.threatsFound;
                } else {
                    const scanResult = await this.scanFile(filePath);
                    scannedFiles++;
                    if (scanResult.isInfected) {
                        threatsFound++;
                        this.notificationService.showNotification(
                            `Threat detected in ${file}`,
                            'error'
                        );
                    }
                }
            }
        } catch (error) {
            console.error('Error scanning directory:', error);
            throw error;
        }

        return {
            scannedFiles,
            threatsFound,
            scanTime: new Date(),
        };
    }
} 