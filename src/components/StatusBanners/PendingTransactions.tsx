import { View, Theme, Text, Circle } from 'tamagui'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'

import { ListItemTitle, ListItem } from 'tamagui'
import React from 'react'

interface Props {
  number: number
}

export const PendingTransactions = ({ number }: Props) => {
  const ArrowRight = <SafeFontIcon name="arrow-right" size={20} />

  return (
    <Theme name={'pendingTx'}>
      <View justifyContent={'center'} alignItems={'center'} flexDirection={'row'}>
        <View>
          <ListItem
            backgroundColor="$background"
            color="$color"
            borderRadius="$2"
            flexDirection="row" // Add this to ensure the items are in a row
            alignItems="center" // Ensures vertical centering
            icon={
              <Circle size={'$5'} backgroundColor={'$color'}>
                <Text color={'$badgeTextColor'}>{number}</Text>
              </Circle>
            }
            iconAfter={ArrowRight}
            size="$2"
            padding={'$2'}
            unstyled={false}
          >
            <ListItemTitle textAlign={'center'} fontWeight={'600'}>
              Pending Transactions
            </ListItemTitle>
          </ListItem>
        </View>
      </View>
    </Theme>
  )
}
