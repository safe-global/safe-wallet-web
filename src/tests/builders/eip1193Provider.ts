import { Builder } from '../Builder'

export const eip1193ProviderBuilder = () =>
  Builder.new<any>().with({
    disconnect: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
    request: jest.fn(),
  })
