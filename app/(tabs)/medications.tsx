import { ScrollView, Text, View } from '@/tw'

export default function MedicationsScreen() {
  return (
    <ScrollView className="flex-1 bg-surface">
      <View className="px-6 pt-16 pb-8">
        <Text className="font-heading text-3xl text-text">
          Medications
        </Text>
      </View>
    </ScrollView>
  )
}
