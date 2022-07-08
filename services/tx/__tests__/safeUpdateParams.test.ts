import { sameAddress } from '@/utils/addresses'
import {
  getFallbackHandlerDeployment,
  getSafeL2SingletonDeployment,
  getSafeSingletonDeployment,
} from '@gnosis.pm/safe-deployments'
import { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { ethers } from 'ethers'
import { CHANGE_FALLBACK_HANDLER_ABI, CHANGE_MASTER_COPY_ABI, createUpdateSafeTxs } from '../safeUpdateParams'

const MOCK_SAFE_ADDRESS = '0x0000000000000000000000000000000000005AFE'

describe('safeUpgradeParams', () => {
  it('Should upgrade L1 safe to L1 1.3.0', () => {
    const txs = createUpdateSafeTxs(MOCK_SAFE_ADDRESS, { chainId: '4', l2: false } as ChainInfo)
    // Safe upgrades mastercopy and fallbackhandler
    expect(txs).toHaveLength(2)
    const [masterCopyTx, fallbackHandlerTx] = txs
    // Check change masterCopy
    expect(sameAddress(masterCopyTx.to, MOCK_SAFE_ADDRESS)).toBeTruthy()
    expect(masterCopyTx.value).toEqual('0')
    expect(
      sameAddress(
        decodeChangeMasterCopyAddress(masterCopyTx.data),
        getSafeSingletonDeployment({ version: '1.3.0', network: '4' })?.defaultAddress,
      ),
    ).toBeTruthy()

    // Check setFallbackHandler
    expect(sameAddress(fallbackHandlerTx.to, MOCK_SAFE_ADDRESS)).toBeTruthy()
    expect(fallbackHandlerTx.value).toEqual('0')
    expect(
      sameAddress(
        decodeSetFallbackHandlerAddress(fallbackHandlerTx.data),
        getFallbackHandlerDeployment({ version: '1.3.0', network: '4' })?.defaultAddress,
      ),
    ).toBeTruthy()
  })

  it('Should upgrade L2 safe to L2 1.3.0', () => {
    const txs = createUpdateSafeTxs(MOCK_SAFE_ADDRESS, { chainId: '100', l2: true } as ChainInfo)
    // Safe upgrades mastercopy and fallbackhandler
    expect(txs).toHaveLength(2)
    const [masterCopyTx, fallbackHandlerTx] = txs
    // Check change masterCopy
    expect(sameAddress(masterCopyTx.to, MOCK_SAFE_ADDRESS)).toBeTruthy()
    expect(masterCopyTx.value).toEqual('0')
    expect(
      sameAddress(
        decodeChangeMasterCopyAddress(masterCopyTx.data),
        getSafeL2SingletonDeployment({ version: '1.3.0', network: '100' })?.defaultAddress,
      ),
    ).toBeTruthy()

    // Check setFallbackHandler
    expect(sameAddress(fallbackHandlerTx.to, MOCK_SAFE_ADDRESS)).toBeTruthy()
    expect(fallbackHandlerTx.value).toEqual('0')
    expect(
      sameAddress(
        decodeSetFallbackHandlerAddress(fallbackHandlerTx.data),
        getFallbackHandlerDeployment({ version: '1.3.0', network: '100' })?.defaultAddress,
      ),
    ).toBeTruthy()
  })
})

const decodeChangeMasterCopyAddress = (data: string): string => {
  const multiSendInterface = new ethers.utils.Interface([CHANGE_MASTER_COPY_ABI])
  const decodedAddress = multiSendInterface.decodeFunctionData('changeMasterCopy', data)[0]
  return decodedAddress.toString()
}

const decodeSetFallbackHandlerAddress = (data: string): string => {
  const multiSendInterface = new ethers.utils.Interface([CHANGE_FALLBACK_HANDLER_ABI])
  const decodedAddress = multiSendInterface.decodeFunctionData('setFallbackHandler', data)[0]
  return decodedAddress.toString()
}
