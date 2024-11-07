import { Text, Circle } from 'tamagui'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'

import React from 'react'
import { Alert } from '../../Alert'

interface Props {
  number: number
  fullWidth?: boolean
  onPress: () => void
}

const PendingTransactions = ({ number, fullWidth, onPress }: Props) => {
  const startIcon = (
    <Circle size={'$5'} backgroundColor={'$color'}>
      <Text color={'$badgeTextColor'}>{number}</Text>
    </Circle>
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
