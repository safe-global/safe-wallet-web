import React from 'react'
import { OnboardingHeader } from './OnboardingHeader'
import { render } from '@testing-library/react-native'

test('renders the OnboardingHeader component with the Safe Wallet image', () => {
  const { getByLabelText } = render(<OnboardingHeader />)

  const image = getByLabelText(/Safe Wallet/i)
  expect(image).toBeTruthy()
})
