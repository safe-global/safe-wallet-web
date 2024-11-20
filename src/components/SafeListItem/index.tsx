import React from 'react'
import { Container } from '../Container'
import { Text, Theme, ThemeName, View } from 'tamagui'
import { IconProps, SafeFontIcon } from '../SafeFontIcon/SafeFontIcon'
import { ellipsis } from '@/src/utils/formatters'
import { isMultisigExecutionInfo } from '@/src/utils/transaction-guards'
import { Transaction } from '@/src/store/gateway/AUTO_GENERATED/transactions'

interface SafeListItemProps {
  type?: string
  label: string
  icon?: IconProps['name']
  children?: React.ReactNode
  rightNode?: React.ReactNode
  leftNode?: React.ReactNode
  bordered?: boolean
  inQueue?: boolean
  executionInfo?: Transaction['executionInfo']
  themeName?: ThemeName
}

function SafeListItem({
  type,
  leftNode,
  icon,
  bordered,
  label,
  rightNode,
  children,
  inQueue,
  executionInfo,
  themeName,
}: SafeListItemProps) {
  return (
    <Container
      bordered={bordered}
      gap={12}
      themeName={themeName}
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

      {inQueue && executionInfo && isMultisigExecutionInfo(executionInfo) ? (
        <View alignItems="center" flexDirection="row">
          <Theme
            name={
              executionInfo?.confirmationsRequired === executionInfo?.confirmationsSubmitted ? 'success' : 'warning'
            }
          >
            <View
              alignItems="center"
              flexDirection="row"
              backgroundColor="$badgeBackground"
              paddingVertical="$1"
              paddingHorizontal="$3"
              gap="$1"
              borderRadius={50}
            >
              <SafeFontIcon size={12} name="owners" />

              <Text fontWeight={600}>
                {executionInfo?.confirmationsRequired}/{executionInfo?.confirmationsSubmitted}
              </Text>
            </View>
          </Theme>

          <SafeFontIcon name="arrow-right" />
        </View>
      ) : (
        rightNode
      )}

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
