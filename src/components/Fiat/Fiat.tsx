import React from 'react'
import { H1, H3, View } from 'tamagui'

interface FiatProps {
  baseAmount: string
}

export const Fiat = ({ baseAmount }: FiatProps) => {
  const amount = baseAmount.split('.')

  return (
    <View flexDirection="row" alignItems="center">
      <H3 fontWeight="600">$</H3>
      <H1 fontWeight="600">{amount[0]}</H1>

      {amount[1] && (
        <H1 fontWeight={600} color="$textSecondaryDark">
          .{amount[1].slice(0, 2)}
        </H1>
      )}
    </View>
  )
}
