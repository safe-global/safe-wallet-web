import { View } from 'tamagui'
import { Identicon } from '@/src/components/Identicon'
import { Skeleton } from 'moti/skeleton'
import { Badge } from '@/src/components/Badge'
import React from 'react'
import { StyleSheet } from 'react-native'
import { Address } from '@/src/types/address'

type Props = {
  address: Address
  badgeContent?: string
}

export const IdenticonWithBadge = ({ address, badgeContent }: Props) => {
  return (
    <View style={styles.container}>
      <Identicon address={address} rounded size={56} />
      <View style={styles.badge}>
        <Skeleton colorMode={'dark'} radius="round" height={28} width={28}>
          {badgeContent && (
            <Badge
              content={badgeContent}
              textContentProps={{
                fontSize: 12,
                fontWeight: 700,
              }}
              themeName={'badge_success'}
              circleProps={{ bordered: true }}
            />
          )}
        </Skeleton>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
  },
})
