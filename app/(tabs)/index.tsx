import { ScrollView, Text, View } from '@/tw'

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-surface">
      <View className="px-6 pt-20 pb-8 gap-2">
        <Text className="font-heading text-4xl text-text">
          Medossier
        </Text>
        <Text className="text-base text-muted">
          Your health, documented + understood.
        </Text>
      </View>
    </ScrollView>
  )
}
