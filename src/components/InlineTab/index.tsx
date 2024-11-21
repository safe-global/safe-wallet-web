import { Href, router, usePathname } from 'expo-router'
import React from 'react'
import { StyledTransactionsTabs, StyledTransactionTabItem, StyledTransactionTabText } from './styles'

interface InlineTabProps {
  items: {
    path: Href
    label: string
  }[]
}

function InlineTab({ items }: InlineTabProps) {
  const path = usePathname()

  const onTabItemClick = (screenPath: Href) => () => {
    router.replace(screenPath)
  }

  return (
    <StyledTransactionsTabs>
      {items.map((item) => (
        <StyledTransactionTabItem
          key={item.path as string}
          selected={path === item.path}
          onPress={onTabItemClick(item.path)}
        >
          <StyledTransactionTabText selected={path === item.path}>{item.label}</StyledTransactionTabText>
        </StyledTransactionTabItem>
      ))}
    </StyledTransactionsTabs>
  )
}

export default InlineTab
