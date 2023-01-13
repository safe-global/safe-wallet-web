import type { SafeBalanceResponse, SafeInfo, TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import type { AddedSafesState } from '../addedSafesSlice'
import { addOrUpdateSafe, removeSafe, addedSafesSlice, updateAddedSafeBalance } from '../addedSafesSlice'

describe('addedSafesSlice', () => {
  it('should add a Safe to the store', () => {
    const safe0 = { chainId: '1', address: { value: '0x0' }, threshold: 1, owners: [{ value: '0x123' }] } as SafeInfo
    const state = addedSafesSlice.reducer(undefined, addOrUpdateSafe({ safe: safe0 }))
    expect(state).toEqual({
      '1': { ['0x0']: { owners: [{ value: '0x123' }], threshold: 1 } },
    })

    const safe1 = { chainId: '4', address: { value: '0x1' }, threshold: 1, owners: [{ value: '0x456' }] } as SafeInfo
    const stateB = addedSafesSlice.reducer(state, addOrUpdateSafe({ safe: safe1 }))
    expect(stateB).toEqual({
      '1': { ['0x0']: { owners: [{ value: '0x123' }], threshold: 1 } },
      '4': { ['0x1']: { threshold: 1, owners: [{ value: '0x456' }] } },
    })

    const safe2 = { chainId: '1', address: { value: '0x2' }, threshold: 1, owners: [{ value: '0x789' }] } as SafeInfo
    const stateC = addedSafesSlice.reducer(stateB, addOrUpdateSafe({ safe: safe2 }))
    expect(stateC).toEqual({
      '1': {
        ['0x0']: { owners: [{ value: '0x123' }], threshold: 1 },
        ['0x2']: { owners: [{ value: '0x789' }], threshold: 1 },
      },
      '4': { ['0x1']: { threshold: 1, owners: [{ value: '0x456' }] } },
    })
  })

  it('should add the Safe balance to the store', () => {
    const balances: SafeBalanceResponse = {
      fiatTotal: '',
      items: [
        {
          tokenInfo: {
            type: 'NATIVE_TOKEN' as TokenType,
            address: '',
            decimals: 18,
            symbol: '',
            name: '',
            logoUri: '',
          },
          balance: '8000000000000000000',
          fiatBalance: '',
          fiatConversion: '',
        },
        {
          tokenInfo: {
            type: 'ERC20' as TokenType,
            address: '',
            decimals: 18,
            symbol: '',
            name: '',
            logoUri: '',
          },
          balance: '9000000000000000000',
          fiatBalance: '',
          fiatConversion: '',
        },
      ],
    }
    const state: AddedSafesState = {
      '4': { ['0x1']: { threshold: 1, owners: [{ value: '0x456' }] } },
    }

    const result = addedSafesSlice.reducer(state, updateAddedSafeBalance({ chainId: '4', address: '0x1', balances }))
    expect(result).toEqual({
      '4': { ['0x1']: { threshold: 1, owners: [{ value: '0x456' }], ethBalance: '8' } },
    })
  })

  it("shouldn't add the balance if the Safe isn't added", () => {
    const balances: SafeBalanceResponse = {
      fiatTotal: '',
      items: [
        {
          tokenInfo: {
            type: 'NATIVE_TOKEN' as TokenType,
            address: '',
            decimals: 18,
            symbol: '',
            name: '',
            logoUri: '',
          },
          balance: '123',
          fiatBalance: '',
          fiatConversion: '',
        },
        {
          tokenInfo: {
            type: 'ERC20' as TokenType,
            address: '',
            decimals: 18,
            symbol: '',
            name: '',
            logoUri: '',
          },
          balance: '456',
          fiatBalance: '',
          fiatConversion: '',
        },
      ],
    }
    const state: AddedSafesState = {}

    const result = addedSafesSlice.reducer(state, updateAddedSafeBalance({ chainId: '4', address: '0x1', balances }))
    expect(result).toStrictEqual({})
  })

  it('should remove a Safe from the store', () => {
    const state = addedSafesSlice.reducer(
      { '1': { ['0x0']: {} as SafeInfo, ['0x1']: {} as SafeInfo }, '4': { ['0x0']: {} as SafeInfo } },
      removeSafe({ chainId: '1', address: '0x1' }),
    )
    expect(state).toEqual({ '1': { ['0x0']: {} as SafeInfo }, '4': { ['0x0']: {} as SafeInfo } })
  })

  it('should remove the chain from the store', () => {
    const state = addedSafesSlice.reducer(
      { '1': { ['0x0']: {} as SafeInfo }, '4': { ['0x0']: {} as SafeInfo } },
      removeSafe({ chainId: '1', address: '0x0' }),
    )
    expect(state).toEqual({ '4': { ['0x0']: {} as SafeInfo } })
  })
})
