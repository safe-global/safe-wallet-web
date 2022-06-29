import React from 'react'
import { render, screen } from '../test-utils'
import AppsPage from '@/pages/safe/apps'

describe('AppsPage', () => {
  it('should display safe apps', () => {
    render(<AppsPage />)

    const heading = screen.getByText(/Testing Next.js With Jest and React Testing Library/i)

    // we can only use toBeInTheDocument because it was imported
    // in the jest.setup.js and configured in jest.config.js
    expect(heading).toBeInTheDocument()
  })
})
