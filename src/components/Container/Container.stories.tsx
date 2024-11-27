import type { StoryObj, Meta } from '@storybook/react'
import { Container } from '@/src/components/Container'
import { Text } from 'tamagui'

const meta: Meta<typeof Container> = {
  title: 'Container',
  component: Container,
  args: {
    children: 'Some text',
  },
}

export default meta

type Story = StoryObj<typeof Container>

export const Default: Story = {
  render: (args) => (
    <Container {...args}>
      <Text>Some text</Text>
    </Container>
  ),
}
