import React from 'react'
import { render } from '@testing-library/react-native'
import { Container } from './index'
import { Text } from 'react-native'

describe('Container', () => {
  it('renders correctly with children', () => {
    const { getByText } = render(
      <Container>
        <Text>Test Child</Text>
      </Container>,
    )
    expect(getByText('Test Child')).toBeTruthy()
  })

  it('applies the correct styles', () => {
    const { getByTestId } = render(
      <Container testID="container">
        <Text>Test Child</Text>
      </Container>,
    )
    const container = getByTestId('container')
    expect(container.props.style).toMatchObject({
      borderBottomLeftRadius: 5,
      borderBottomRightRadius: 5,
      borderTopLeftRadius: 5,
      borderTopRightRadius: 5,
      flexDirection: 'column',
      paddingBottom: 4,
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 4,
    })
  })
})
