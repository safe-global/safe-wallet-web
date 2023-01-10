import { hexZeroPad } from 'ethers/lib/utils'
import { setHiddenTokensForChain, settingsSlice } from '../settingsSlice'

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
})
