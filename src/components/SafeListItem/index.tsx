import React from 'react'
import { Container } from '../Container'
import { Text, Theme, View } from 'tamagui'
import { IconProps, SafeFontIcon } from '../SafeFontIcon/SafeFontIcon'
import { ellipsis } from '@/src/utils/formatters'

interface SafeListItemProps {
  type?: string
  label: string
  icon?: IconProps['name']
  children?: React.ReactNode
  rightNode?: React.ReactNode
  leftNode?: React.ReactNode
  bordered?: boolean
}

function SafeListItem({ type, leftNode, icon, bordered, label, rightNode, children }: SafeListItemProps) {
  return (
    <Container
      bordered={bordered}
      gap={12}
      alignItems={'center'}
      flexWrap="wrap"
      flexDirection="row"
      justifyContent="space-between"
    >
      <View flexDirection="row" alignItems="center" gap={12}>
        {leftNode}

        <View>
          {type && (
            <Text fontSize="$3" color="$primaryLight" marginBottom={2}>
              {icon && (
                <View marginRight={4}>
                  <SafeFontIcon name={icon} size={10} color="$primaryLight" />
                </View>
              )}
              {type}
            </Text>
          )}

          <Text fontSize="$4" fontWeight={600}>
            {ellipsis(label, rightNode ? 23 : 30)}
          </Text>
        </View>
      </View>

      {rightNode}

      {children}
    </Container>
  )
}

SafeListItem.Header = function Header({ title }: { title: string }) {
  return (
    <Theme name="safe_list">
      <View paddingVertical="$4" paddingHorizontal="$3" backgroundColor="$background">
        <Text fontWeight={500} color="$primaryLight">
          {title}
        </Text>
      </View>
    </Theme>
  )
}

export default SafeListItem
