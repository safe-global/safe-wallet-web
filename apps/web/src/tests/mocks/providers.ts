import type { Eip1193Provider } from 'ethers'

export const MockEip1193Provider = {
  request: jest.fn(),
} as unknown as Eip1193Provider
