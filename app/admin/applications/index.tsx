import React from 'react'
import { View, FlatList, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/Text'
import { ApplicationRow } from '@/components/admin/ApplicationRow'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'
import { useApplications } from '@/hooks/useApplications'
import { ErrorState } from '@/components/ui/ErrorState'
import { BG_BASE } from '@/lib/theme'
import type { Application } from '@/types'

export default function ApplicationQueue() {
  const insets = useSafeAreaInsets()
  const { data: applications, isLoading, isError, error, refetch } = useApplications('pending')

  const renderItem = ({ item }: { item: Application }) => (
    <ApplicationRow
      application={item}
      onPress={() => router.push(`/admin/applications/${item.id}`)}
    />
  )

  return (
    <View style={[s.root, { paddingTop: insets.top + 12 }]}>
      <View style={s.header}>
        <Text variant="label" uppercase color="accent">Review</Text>
        <Text variant="h1" color="primary">Applications</Text>
        <Text variant="bodySm" color="secondary" style={{ marginTop: 4 }}>
          {applications?.length ?? 0} pending review
        </Text>
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </View>
      ) : isError ? (
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text variant="body" color="secondary" align="center">No pending applications</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG_BASE },
  header: { paddingHorizontal: 24, marginBottom: 16, gap: 2 },
  empty: { padding: 40, alignItems: 'center' },
})
