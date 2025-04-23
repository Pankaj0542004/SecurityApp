import AsyncStorage from '@react-native-async-storage/async-storage';

export class AppLockService {
  private readonly PASSWORD_KEY = '@app_lock_password';
  private readonly LOCK_ENABLED_KEY = '@app_lock_enabled';
  private autoLockTimer: NodeJS.Timeout | null = null;

  async setPassword(password: string): Promise<void> {
    await AsyncStorage.setItem(this.PASSWORD_KEY, password);
  }

  async getPassword(): Promise<string | null> {
    return await AsyncStorage.getItem(this.PASSWORD_KEY);
  }

  async isAppLockEnabled(): Promise<boolean> {
    const enabled = await AsyncStorage.getItem(this.LOCK_ENABLED_KEY);
    return enabled === 'true';
  }

  async setLockEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(this.LOCK_ENABLED_KEY, enabled.toString());
  }

  async unlockApp(password: string): Promise<boolean> {
    const storedPassword = await this.getPassword();
    return storedPassword === password;
  }

  startAutoLock(): void {
    this.autoLockTimer = setInterval(async () => {
      const isEnabled = await this.isAppLockEnabled();
      if (isEnabled) {
        // Implement auto-lock logic here
      }
    }, 30000); // Check every 30 seconds
  }

  stopAutoLock(): void {
    if (this.autoLockTimer) {
      clearInterval(this.autoLockTimer);
      this.autoLockTimer = null;
    }
  }
} 