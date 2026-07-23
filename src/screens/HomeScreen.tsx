import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useApp } from '@/hooks/useApp'
import { colors } from '@/theme/colors'

export default function HomeScreen() {
  const { connectionState, error } = useApp()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medication Safety Companion</Text>
      <Text style={styles.subtitle}>Know what's safe when taking multiple drugs</Text>

      <View style={styles.statusCard}>
        {connectionState === 'connecting' && (
          <>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.statusText}>Connecting to sandbox twin...</Text>
          </>
        )}
        {connectionState === 'connected' && (
          <Text style={[styles.statusText, { color: colors.secondary }]}>
            Connected ✓
          </Text>
        )}
        {connectionState === 'error' && (
          <>
            <Text style={[styles.statusText, { color: colors.danger }]}>
              Connection error
            </Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </>
        )}
      </View>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
    textAlign: 'center',
  },
})