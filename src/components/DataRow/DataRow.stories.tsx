import React from 'react'
import { Container } from '@/src/components/Container'
import { DataRow } from '@/src/components/DataRow'
import { XStack, Text } from 'tamagui'

export default {
  title: 'DataRow',
  component: DataRow,
  decorators: [
    (Story: React.ComponentType) => (
      <Container>
        <Story />
      </Container>
    ),
  ],
}

// Basic usage of DataRow with Label and Value
export const Default = () => (
  <DataRow>
    <DataRow.Label>Send</DataRow.Label>
    <DataRow.Value>0.05452 ETH</DataRow.Value>
  </DataRow>
)

// DataRow with a Header and values below it
export const WithHeader = () => (
  <>
    <DataRow.Header>Transaction Details</DataRow.Header>
    <DataRow>
      <DataRow.Label>Recipient</DataRow.Label>
      <DataRow.Value>0x13d91...4589</DataRow.Value>
    </DataRow>
    <DataRow>
      <DataRow.Label>Network</DataRow.Label>
      <DataRow.Value>Ethereum</DataRow.Value>
    </DataRow>
  </>
)

// DataRow showcasing more complex ReactNode as Value
export const ComplexValue = () => (
  <DataRow>
    <DataRow.Label>Recipient</DataRow.Label>
    <DataRow.Value>
      <XStack alignItems="center">
        <Text>0x13d91...4589</Text>
        <Text color="green" marginLeft="$3">
          (Verified)
        </Text>
      </XStack>
    </DataRow.Value>
  </DataRow>
)
