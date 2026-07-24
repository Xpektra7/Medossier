import { ScrollView, Text, View } from '@/tw'

export default function TimelineScreen() {
  return (
    <ScrollView className="flex-1 bg-surface">
      <View className="px-6 pt-20 pb-8">
        <Text className="font-heading text-4xl text-text">
          Timeline
        </Text>
      </View>
    </ScrollView>
  )
}
