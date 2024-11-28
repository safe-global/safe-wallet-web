import React from 'react'
import { Spinner } from 'tamagui'

import { Alert } from '@/src/components/Alert'
import { SafeTab } from '@/src/components/SafeTab'
import { NoFunds } from '../NoFunds'

export const Fallback = ({ loading, hasError }: { loading: boolean; hasError: boolean }) => (
  <SafeTab.ScrollView>
    {loading ? (
      <Spinner size="small" />
    ) : hasError ? (
      <Alert type="error" message={`Error to get this assets list`} />
    ) : (
      <NoFunds />
    )}
  </SafeTab.ScrollView>
)
