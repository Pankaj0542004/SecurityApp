# Security Scanner App

A comprehensive security scanning application built with React Native and Expo that provides real-time file protection, scanning, and threat detection capabilities.

## Features

- **Real-time File Protection**
  - Monitors files for changes and potential threats
  - Immediate threat detection and notification
  - Configurable protection settings

- **Auto-scan System**
  - Scheduled scans at configurable intervals
  - Full system scan capabilities
  - Detailed scan reports

- **App Lock**
  - Password protection
  - Auto-lock functionality
  - Secure password management

- **Threat Detection**
  - Pattern-based threat detection
  - Real-time scanning of media files
  - Detailed threat reports

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Building for Production

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

## Configuration

The app can be configured through the settings screen:
- Real-time protection toggle
- Auto-scan interval
- App lock settings
- Notification preferences

## Security Features

- File system monitoring
- Pattern-based threat detection
- Secure password storage
- Real-time notifications
- Auto-lock functionality

## Dependencies

- Expo
- React Native
- Chokidar (for file system monitoring)
- Expo File System
- Expo Media Library
- Async Storage

## License

MIT License 