import type { SafeBalanceResponse, SafeInfo, TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { hexZeroPad } from 'ethers/lib/utils'
import type { AddedSafesState } from '../addedSafesSlice'
import { addOrUpdateSafe, removeSafe, addedSafesSlice, updateAddedSafeBalance } from '../addedSafesSlice'

describe('addedSafesSlice', () => {
  describe('addOrUpdateSafe', () => {
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
  })

  describe('updateAddedSafeBalance', () => {
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
  })

  describe('removeSafe', () => {
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

  describe('migrateLegacyOwners', () => {
    const ADDRESS_1 = hexZeroPad('0x1', 20)
    const ADDRESS_2 = hexZeroPad('0x2', 20)

    it('should fix legacy owners', () => {
      const state = addedSafesSlice.reducer(
        {
          '1': {
            ['0x0']: {
              owners: [
                {
                  value: ADDRESS_1,
                  name: true,
                } as unknown as SafeInfo['owners'][number],
              ],
            } as SafeInfo,
            ['0x1']: {
              owners: [
                {
                  value: { address: ADDRESS_1 },
                },
                { value: ADDRESS_2 },
              ],
            } as unknown as SafeInfo,
          },
          '4': {
            ['0x0']: {
              owners: [
                {
                  value: { address: ADDRESS_1, name: 'Test' },
                },
              ],
            } as unknown as SafeInfo,
          },
        },
        addedSafesSlice.actions.migrateLegacyOwners(),
      )
      expect(state).toEqual({
        '1': {
          ['0x0']: {
            owners: [
              {
                value: ADDRESS_1,
              },
            ],
          } as SafeInfo,
          ['0x1']: {
            owners: [
              {
                value: ADDRESS_1,
              },
              { value: ADDRESS_2 },
            ],
          } as SafeInfo,
        },
        '4': {
          ['0x0']: {
            owners: [
              {
                value: ADDRESS_1,
                name: 'Test',
              },
            ],
          } as SafeInfo,
        },
      })
    })

    it('should remove corrupt owners', () => {
      const state = addedSafesSlice.reducer(
        {
          '1': {
            ['0x0']: {
              owners: [
                {
                  value: ADDRESS_1,
                },
              ],
            } as SafeInfo,
            ['0x1']: {
              owners: [
                {
                  value: { address: true },
                },
                { value: ADDRESS_2 },
              ],
            } as unknown as SafeInfo,
          },
          '4': {
            ['0x0']: {
              owners: [
                {
                  value: { address: ADDRESS_1, name: 'Test' },
                },
                {
                  value: { address: null, name: 'Test' } as unknown as SafeInfo['owners'][number],
                },
              ],
            } as unknown as SafeInfo,
          },
        },
        addedSafesSlice.actions.migrateLegacyOwners(),
      )
      expect(state).toEqual({
        '1': {
          ['0x0']: {
            owners: [
              {
                value: ADDRESS_1,
              },
            ],
          } as SafeInfo,
          ['0x1']: {
            owners: [{ value: ADDRESS_2 }],
          } as SafeInfo,
        },
        '4': {
          ['0x0']: {
            owners: [
              {
                name: 'Test',
                value: ADDRESS_1,
              },
            ],
          } as SafeInfo,
        },
      })
    })

    it('should remove added Safe if all owners are corrupt', () => {
      const state = addedSafesSlice.reducer(
        {
          '1': {
            ['0x0']: {
              owners: [
                {
                  value: ADDRESS_1,
                },
              ],
            } as SafeInfo,
            ['0x1']: {
              owners: [
                {
                  value: { address: 123 },
                },
                { value: null },
                { value: '0x123' },
              ],
            } as unknown as SafeInfo,
          },
          '4': {
            ['0x0']: {
              owners: [
                {
                  value: {
                    address: ADDRESS_1,
                    name: 'Test',
                  },
                },
              ],
            } as unknown as SafeInfo,
          },
        },
        addedSafesSlice.actions.migrateLegacyOwners(),
      )
      expect(state).toEqual({
        '1': {
          ['0x0']: {
            owners: [
              {
                value: ADDRESS_1,
              },
            ],
          } as SafeInfo,
        },
        '4': {
          ['0x0']: {
            owners: [
              {
                value: ADDRESS_1,
                name: 'Test',
              },
            ],
          } as SafeInfo,
        },
      })
    })

    it('should remove the chain if all Safes are removed due to all corrupt owners', () => {
      const state = addedSafesSlice.reducer(
        {
          '1': {
            ['0x0']: {
              owners: [
                {
                  value: 1234,
                } as unknown as SafeInfo['owners'][number],
              ],
            } as SafeInfo,
            ['0x1']: {
              owners: [
                {
                  value: { address: 123 },
                },
                { value: null },
                { value: '0x123' },
              ],
            } as unknown as SafeInfo,
          },
          '4': {
            ['0x0']: {
              owners: [
                {
                  value: {
                    address: true,
                    name: 'Test',
                  },
                },
              ],
            } as unknown as SafeInfo,
          },
        },
        addedSafesSlice.actions.migrateLegacyOwners(),
      )

      expect(state).toEqual({})
    })
  })
})
