import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { theme } from '../../src/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bg, height: 50 },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: { fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
        tabBarStyle: {
          backgroundColor: '#030508',
          borderTopColor: theme.colors.surfaceBorder,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: theme.colors.signal,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'Mission Control',
          headerShown: false,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🛰️</Text>,
        }}
      />

      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          headerTitle: 'GitHub & Repositories',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚡</Text>,
        }}
      />

      <Tabs.Screen
        name="deploy-ai"
        options={{
          title: 'Deploy AI',
          headerTitle: 'Deploy AI SRE Co-Pilot',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🤖</Text>,
        }}
      />

      <Tabs.Screen
        name="pipelines"
        options={{
          title: 'Pipelines',
          headerTitle: 'Flight-Path Pipelines',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🚀</Text>,
        }}
      />

      <Tabs.Screen
        name="environments"
        options={{
          title: 'Envs',
          headerTitle: 'Environment Telemetry',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🌐</Text>,
        }}
      />

      <Tabs.Screen
        name="dashboard"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="logs"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
