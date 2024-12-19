import { makeStore } from '@/store'
import { Provider } from 'react-redux'
import { type ReactNode } from 'react'

type StoreDecoratorProps = {
  initialState: Record<string, any>
  children: ReactNode
}

export const StoreDecorator = ({ initialState, children }: StoreDecoratorProps) => {
  const store = makeStore(initialState)
  return <Provider store={store}>{children}</Provider>
}
