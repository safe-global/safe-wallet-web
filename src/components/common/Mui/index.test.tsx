import React from 'react'
import { render } from '@/tests/test-utils'
import { Box } from './index'

jest.mock('@mui/material/index.js', () => ({}))

describe('Box Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<Box />)
    expect(container).toBeInTheDocument()
  })

  it('applies margin and padding props correctly', () => {
    const { getByTestId } = render(<Box m={2} p={3} data-testid="box" />)
    const box = getByTestId('box')
    expect(box).toHaveStyle('margin: 16px')
    expect(box).toHaveStyle('padding: 24px')
  })

  it('applies flex props correctly', () => {
    const { getByTestId } = render(<Box data-testid="box" />)
    const box = getByTestId('box')
    expect(box).toHaveStyle('display: flex')
    expect(box).toHaveStyle('flex-direction: column')
  })

  it('applies text alignment props correctly', () => {
    const { getByTestId } = render(<Box color="primary.main" textAlign="center" data-testid="box" />)
    const box = getByTestId('box')
    expect(box).toHaveStyle('text-align: center')
  })
})
