import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import { useApp } from '@/hooks/useApp'
import { colors } from '@/theme/colors'

interface TimelineEvent {
  id: string
  title: string
  description?: string
  occurredAt: string
  system?: string
}

export default function TimelineScreen() {
  const { twin, connectionState } = useApp()
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!twin || connectionState !== 'connected') {
      setLoading(false)
      return
    }

    twin.events.list({ system: 'medication' })
      .then((data: any) => {
        const items: TimelineEvent[] = (data ?? []).map((e: any) => ({
          id: e.id,
          title: e.title ?? '',
          description: e.description,
          occurredAt: e.occurredAt ?? e.recordedAt,
          system: e.data?.system,
        }))
        items.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
        setEvents(items)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [twin, connectionState])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timeline</Text>

      {connectionState !== 'connected' && (
        <Text style={styles.placeholder}>Connect to a sandbox twin to see your activity timeline.</Text>
      )}

      {loading && <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 24 }} />}

      {!loading && connectionState === 'connected' && events.length === 0 && (
        <Text style={styles.placeholder}>No events yet. Add medications to start your timeline.</Text>
      )}

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            {item.description && <Text style={styles.eventDesc}>{item.description}</Text>}
            <Text style={styles.eventDate}>
              {new Date(item.occurredAt).toLocaleDateString('en-NG', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  placeholder: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 32,
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  eventDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
})