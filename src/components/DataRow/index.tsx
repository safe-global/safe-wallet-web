import React from 'react'
import { XStack, Text, Theme, XStackProps } from 'tamagui'

type Props = {
  children: string
}

type ValueProps = {
  children: string | React.ReactElement
}

export const DataRow: React.FC<XStackProps> & {
  Label: React.FC<Props>
  Value: React.FC<ValueProps>
  Header: React.FC<Props>
} = (props: XStackProps) => {
  const { children, ...rest } = props
  return (
    <XStack justifyContent="space-between" alignItems="center" padding="$2" {...rest}>
      {children}
    </XStack>
  )
}

const Label = ({ children }: Props) => (
  <Theme name={'label'}>
    <Text fontWeight="bold">{children}</Text>
  </Theme>
)

const Value = ({ children }: { children: string | React.ReactElement }) => {
  if (typeof children === 'string') {
    return <Text>{children}</Text>
  }

  return children
}

const Header = ({ children }: Props) => (
  <Text fontWeight="600" marginVertical="$2">
    {children}
  </Text>
)

DataRow.Label = Label
DataRow.Value = Value
DataRow.Header = Header
