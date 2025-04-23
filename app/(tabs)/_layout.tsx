import { Tabs } from 'expo-router';
import { Shield, FileSearch, Settings, CircleAlert as AlertCircle, Search } from 'lucide-react-native';
import { useColorScheme, View, Text } from 'react-native';
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A1929' }}>
      <Text style={{ color: '#FFFFFF', fontSize: 16 }}>Something went wrong:</Text>
      <Text style={{ color: '#EF4444', marginTop: 10 }}>{error.message}</Text>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDark ? '#0A1929' : '#FFFFFF',
            borderTopColor: isDark ? '#1E3A5F' : '#E5E7EB',
          },
          tabBarActiveTintColor: '#60A5FA',
          tabBarInactiveTintColor: isDark ? '#94A3B8' : '#6B7280',
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Scanner',
            tabBarIcon: ({ size, color }) => (
              <Shield size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="file-scan"
          options={{
            title: 'Files',
            tabBarIcon: ({ size, color }) => (
              <FileSearch size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="threats"
          options={{
            title: 'Threats',
            tabBarIcon: ({ size, color }) => (
              <AlertCircle size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="virustotal"
          options={{
            title: 'VirusTotal',
            tabBarIcon: ({ size, color }) => (
              <Search size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ size, color }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </ErrorBoundary>
  );
}