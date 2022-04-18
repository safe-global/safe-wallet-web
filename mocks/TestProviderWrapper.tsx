import { type ReactNode } from 'react'
import { Provider } from 'react-redux'

const TestProviderWrapper = ({ children }: { children: ReactNode }) => {
  const { store } = require('@/store') // require dynamically to reset the store

  return <Provider store={store}>{children}</Provider>
}

export default TestProviderWrapper
