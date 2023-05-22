import { hexZeroPad } from 'ethers/lib/utils'
import { setHiddenTokensForChain, settingsSlice, isEnvInitialState, initialState } from '../settingsSlice'
import type { SettingsState } from '../settingsSlice'
import type { RootState } from '..'

describe('settingsSlice', () => {
  it('handle hiddenTokens', () => {
    const token1 = hexZeroPad('0x1', 20)
    const token2 = hexZeroPad('0x2', 20)
    const token3 = hexZeroPad('0x3', 20)

    let state = settingsSlice.reducer(undefined, setHiddenTokensForChain({ chainId: '1', assets: [token1] }))
    expect(state.hiddenTokens).toEqual({
      ['1']: [token1],
    })

    state = settingsSlice.reducer(state, setHiddenTokensForChain({ chainId: '1', assets: [token1, token2] }))
    expect(state.hiddenTokens).toEqual({
      ['1']: [token1, token2],
    })

    state = settingsSlice.reducer(state, setHiddenTokensForChain({ chainId: '5', assets: [token3] }))
    expect(state.hiddenTokens).toEqual({
      ['1']: [token1, token2],
      ['5']: [token3],
    })
  })

  describe('setRpc', () => {
    it('should set the RPC for the specified chain', () => {
      const state = settingsSlice.reducer(
        initialState,
        settingsSlice.actions.setRpc({ chainId: '1', rpc: 'https://example.com' }),
      )

      expect(state.env.rpc).toEqual({
        ['1']: 'https://example.com',
      })
    })

    it('should delete the RPC for the specified chain', () => {
      const initialState = {
        env: {
          rpc: {
            ['1']: 'https://example.com',
            ['5']: 'https://other-example.com',
          },
        },
      } as unknown as SettingsState

      const state = settingsSlice.reducer(initialState, settingsSlice.actions.setRpc({ chainId: '1', rpc: '' }))

      expect(state.env.rpc).toEqual({
        ['5']: 'https://other-example.com',
      })
    })
  })

  describe('setTenderly', () => {
    it('should set the Tenderly URL and access token', () => {
      const state = settingsSlice.reducer(
        undefined,
        settingsSlice.actions.setTenderly({ url: 'https://example.com', accessToken: 'test123' }),
      )

      expect(state.env.tenderly).toEqual({
        url: 'https://example.com',
        accessToken: 'test123',
      })
    })

    it('should delete the Tenderly URL and access token', () => {
      const initialState = {
        env: {
          tenderly: {
            url: '',
            accessToken: '',
          },
        },
      } as unknown as SettingsState

      const state = settingsSlice.reducer(initialState, settingsSlice.actions.setTenderly({ url: '', accessToken: '' }))

      expect(state.env.tenderly).toEqual({
        url: '',
        accessToken: '',
      })
    })
  })

  describe('isEnvInitialState', () => {
    it('should return true if the env is the initial state', () => {
      const state = {
        settings: {
          env: {
            rpc: {},
            tenderly: { url: '', accessToken: '' },
          },
        },
      } as unknown as RootState

      expect(isEnvInitialState(state, '5')).toEqual(true)
    })

    it('should return true if the env does not have a custom RPC set on the current chain', () => {
      const state = {
        settings: {
          env: {
            rpc: { ['1']: 'https://example.com' },
            tenderly: { url: '', accessToken: '' },
          },
        },
      } as unknown as RootState

      expect(isEnvInitialState(state, '5')).toEqual(true)
    })

    it('should return false if the env is has a custom RPC set on the current chain', () => {
      const state = {
        settings: {
          env: {
            rpc: { ['5']: 'https://other-example.com' },
            tenderly: { url: '', accessToken: '' },
          },
        },
      } as unknown as RootState

      expect(isEnvInitialState(state, '5')).toEqual(false)
    })

    it('should return false if the env is has a custom Tenderly set', () => {
      const state = {
        settings: {
          env: {
            rpc: {},
            tenderly: {
              url: 'https://example.com',
              accessToken: 'test123',
            },
          },
        },
      } as unknown as RootState

      expect(isEnvInitialState(state, '5')).toEqual(false)
    })
  })
})
