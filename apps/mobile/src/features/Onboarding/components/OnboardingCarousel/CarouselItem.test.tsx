import React from 'react'
import { CarouselItem } from './CarouselItem' // adjust the import path as necessary
import { Text } from 'tamagui'
import { render } from '@/src/tests/test-utils'

describe('CarouselItem Component', () => {
  it('renders correctly with all props', () => {
    const item = {
      title: <Text>Test Title</Text>,
      description: 'Test Description',
      image: <Text>Test Image</Text>,
      name: 'nevinha',
    }

    const { getByText } = render(<CarouselItem item={item} />)

    expect(getByText('Test Title')).toBeTruthy()
    expect(getByText('Test Description')).toBeTruthy()
    expect(getByText('Test Image')).toBeTruthy()
  })

  it('renders correctly without optional props', () => {
    const item = {
      title: <Text>Test Title</Text>,
      name: 'Test Name',
    }

    const { getByText, queryByText } = render(<CarouselItem item={item} />)

    expect(getByText('Test Title')).toBeTruthy()
    expect(queryByText('Test Description')).toBeNull() // Description is optional and not provided
  })
})
