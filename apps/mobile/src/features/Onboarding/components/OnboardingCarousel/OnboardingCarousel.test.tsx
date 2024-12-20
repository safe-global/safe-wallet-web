import React from 'react'
import { OnboardingCarousel } from './OnboardingCarousel'
import { Text, View } from 'tamagui'
import { render } from '@/src/tests/test-utils'

describe('OnboardingCarousel', () => {
  const items = [
    { name: 'Item1', title: <Text>Item1 Title</Text> },
    { name: 'Item2', title: <Text>Item2 Title</Text> },
    { name: 'Item3', title: <Text>Item3 Title</Text> },
  ]

  // react-native-collapsible-tab-view does not returns any information about the tabs children
  // that is why we only test the children component here =/
  it('renders without crashing', () => {
    const { getByTestId } = render(
      <OnboardingCarousel items={items}>
        <View testID="child-element">Child Element</View>
      </OnboardingCarousel>,
    )

    expect(getByTestId('child-element')).toBeTruthy()
  })
})
