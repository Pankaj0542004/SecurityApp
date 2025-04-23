import { EventEmitter } from 'events';
import * as chokidar from 'chokidar';
import * as path from 'path';
import { NotificationService } from './NotificationService';
import { ScanService } from './ScanService';

export class ProtectionService extends EventEmitter {
    private realTimeProtectionEnabled: boolean = false;
    private autoScanEnabled: boolean = false;
    private watcher: chokidar.FSWatcher | null = null;
    private scanInterval: NodeJS.Timeout | null = null;
    private scanPaths: string[] = [];
    private notificationService: NotificationService;
    private scanService: ScanService;

    constructor() {
        super();
        this.notificationService = new NotificationService();
        this.scanService = new ScanService();
    }

    public startRealTimeProtection(paths: string[] = []): void {
        if (this.realTimeProtectionEnabled) {
            this.notificationService.showNotification('Real-time protection is already running', 'info');
            return;
        }

        this.realTimeProtectionEnabled = true;
        this.scanPaths = paths;

        // Initialize file watcher
        this.watcher = chokidar.watch(paths, {
            ignored: /(^|[\/\\])\../,
            persistent: true,
            ignoreInitial: true
        });

        // Watch for file changes
        this.watcher.on('add', (filePath) => this.handleFileChange(filePath, 'add'));
        this.watcher.on('change', (filePath) => this.handleFileChange(filePath, 'change'));

        this.notificationService.showNotification('Real-time protection started', 'success');
        this.emit('realTimeProtectionStarted');
    }

    public stopRealTimeProtection(): void {
        if (!this.realTimeProtectionEnabled) {
            this.notificationService.showNotification('Real-time protection is not running', 'info');
            return;
        }

        this.realTimeProtectionEnabled = false;
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
        }

        this.notificationService.showNotification('Real-time protection stopped', 'warning');
        this.emit('realTimeProtectionStopped');
    }

    public startAutoScan(interval: number = 3600000): void {
        if (this.autoScanEnabled) {
            this.notificationService.showNotification('Auto-scan is already running', 'info');
            return;
        }

        this.autoScanEnabled = true;
        this.scanInterval = setInterval(() => {
            this.performFullScan();
        }, interval);

        this.notificationService.showNotification('Auto-scan started', 'success');
        this.emit('autoScanStarted');
    }

    public stopAutoScan(): void {
        if (!this.autoScanEnabled) {
            this.notificationService.showNotification('Auto-scan is not running', 'info');
            return;
        }

        this.autoScanEnabled = false;
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }

        this.notificationService.showNotification('Auto-scan stopped', 'warning');
        this.emit('autoScanStopped');
    }

    private async handleFileChange(filePath: string, eventType: 'add' | 'change'): Promise<void> {
        if (!this.realTimeProtectionEnabled) {
            return;
        }

        try {
            const scanResult = await this.scanService.scanFile(filePath);
            
            if (scanResult.isInfected) {
                this.notificationService.showNotification(
                    `Threat detected in ${path.basename(filePath)}`,
                    'error'
                );
                this.emit('threatDetected', {
                    filePath,
                    threats: scanResult.threats
                });
            } else {
                this.notificationService.showNotification(
                    `File ${path.basename(filePath)} scanned successfully`,
                    'success'
                );
            }
            
            this.emit('fileScanned', {
                filePath,
                eventType,
                scanResult
            });
        } catch (error) {
            this.notificationService.showNotification(
                `Error scanning ${path.basename(filePath)}`,
                'error'
            );
            this.emit('scanError', {
                filePath,
                error
            });
        }
    }

    private async performFullScan(): Promise<void> {
        if (!this.autoScanEnabled) {
            return;
        }

        try {
            this.notificationService.showNotification('Starting full system scan', 'info');
            
            for (const scanPath of this.scanPaths) {
                const scanResult = await this.scanService.scanDirectory(scanPath);
                
                if (scanResult.threatsFound > 0) {
                    this.notificationService.showNotification(
                        `Found ${scanResult.threatsFound} threats in ${path.basename(scanPath)}`,
                        'error'
                    );
                } else {
                    this.notificationService.showNotification(
                        `Completed scanning ${path.basename(scanPath)}`,
                        'success'
                    );
                }
                
                this.emit('directoryScanned', {
                    path: scanPath,
                    scanResult
                });
            }
        } catch (error) {
            this.notificationService.showNotification('Error during full system scan', 'error');
            this.emit('scanError', {
                error
            });
        }
    }

    public isRealTimeProtectionEnabled(): boolean {
        return this.realTimeProtectionEnabled;
    }

    public isAutoScanEnabled(): boolean {
        return this.autoScanEnabled;
    }
} 