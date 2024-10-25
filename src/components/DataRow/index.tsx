import React, { ReactNode } from 'react'
import { XStack, Text, Theme } from 'tamagui'

interface Props {
  children: ReactNode
}

export const DataRow: React.FC<Props> & {
  Label: React.FC<Props>
  Value: React.FC<Props>
  Header: React.FC<Props>
} = ({ children }: Props) => {
  return (
    <XStack justifyContent="space-between" alignItems="center" padding="$2">
      {children}
    </XStack>
  )
}

const Label = ({ children }: Props) => (
  <Theme name={'label'}>
    <Text fontWeight="bold">{children}</Text>
  </Theme>
)

const Value = ({ children }: Props) => <Text>{children}</Text>

const Header = ({ children }: Props) => (
  <Text fontWeight="600" marginVertical="$2">
    {children}
  </Text>
)

DataRow.Label = Label
DataRow.Value = Value
DataRow.Header = Header
