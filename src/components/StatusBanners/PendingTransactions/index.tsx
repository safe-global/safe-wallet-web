import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'

import React from 'react'
import { Alert } from '../../Alert'
import CircularBadge from '../../CircularBadge'
import { Spinner } from 'tamagui'

interface Props {
  number: string
  fullWidth?: boolean
  onPress: () => void
  isLoading?: boolean
}

const PendingTransactions = ({ number, isLoading, fullWidth, onPress }: Props) => {
  const startIcon = isLoading ? (
    <Spinner size="small" color="$warning1ContrastTextDark" />
  ) : (
    <CircularBadge content={number} />
  )
  const endIcon = <SafeFontIcon name="arrow-right" size={20} />

  return (
    <Alert
      type="warning"
      fullWidth={fullWidth}
      endIcon={endIcon}
      startIcon={startIcon}
      message="Pending Transactions"
      onPress={onPress}
    />
  )
}

export default PendingTransactions
