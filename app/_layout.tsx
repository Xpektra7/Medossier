import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, Text, ActivityIndicator } from 'react-native'
import { useLoadFonts } from '@/hooks/useLoadFonts'
import { colors } from '@/theme/colors'
import '@/global.css'

export default function RootLayout() {
  const { fontsLoaded, fontsError } = useLoadFonts()

  if (!fontsLoaded && !fontsError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#40ed0c' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    )
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  )
}
