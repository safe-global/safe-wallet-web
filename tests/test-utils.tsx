import { render } from '@testing-library/react'

// Add in any providers here if necessary:
// (ReduxProvider, ThemeProvider, etc)
const Providers: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  return children
}

const customRender = (ui: React.ReactElement, options = {}) => render(ui, { wrapper: Providers, ...options })

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }
