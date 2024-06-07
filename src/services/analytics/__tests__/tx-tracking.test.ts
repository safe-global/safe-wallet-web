import type { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import { SettingsInfoType, TransactionInfoType, TransactionTokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { getTransactionTrackingType } from '../tx-tracking'
import * as txDetailsModule from '@/services/transactions'
import { TX_TYPES } from '../events/transactions'

const getMockTxType = (txDetails: unknown) => {
  jest.spyOn(txDetailsModule, 'getTxDetails').mockImplementation(() => Promise.resolve(txDetails as TransactionDetails))
  return getTransactionTrackingType('1', '0x123')
}

describe('getTransactionTrackingType', () => {
  it('should return transfer_token for native token transfers', async () => {
    const txType = await getMockTxType({
      txInfo: {
        type: TransactionInfoType.TRANSFER,
        transferInfo: {
          type: TransactionTokenType.NATIVE_COIN,
        },
      },
    } as unknown)

    expect(txType).toEqual(TX_TYPES.transfer_token)
  })

  it('should return transfer_token for ERC20 token transfers', async () => {
    const txType = await getMockTxType({
      txInfo: {
        type: TransactionInfoType.TRANSFER,
        transferInfo: {
          type: TransactionTokenType.ERC20,
        },
      },
    } as unknown)

    expect(txType).toEqual(TX_TYPES.transfer_token)
  })

  it('should return transfer_nft for ERC721 token transfers', async () => {
    const txType = await getMockTxType({
      txInfo: {
        type: TransactionInfoType.TRANSFER,
        transferInfo: {
          type: TransactionTokenType.ERC721,
        },
      },
    } as unknown)

    expect(txType).toEqual(TX_TYPES.transfer_nft)
  })

  it('should return owner_add for add owner settings changes', async () => {
    const txType = await getMockTxType({
      txInfo: {
        type: TransactionInfoType.SETTINGS_CHANGE,
        settingsInfo: {
          type: SettingsInfoType.ADD_OWNER,
        },
      },
    } as unknown)

    expect(txType).toEqual(TX_TYPES.owner_add)
  })

  it('should return owner_remove for remove owner settings changes', async () => {
    const txType = await getMockTxType({
      txInfo: {
        type: TransactionInfoType.SETTINGS_CHANGE,
        settingsInfo: {
          type: SettingsInfoType.REMOVE_OWNER,
        },
      },
    } as unknown)

    expect(txType).toEqual(TX_TYPES.owner_remove)
  })

  it('should return owner_swap for swap owner settings changes', async () => {
    const txType = await getMockTxType({
      txInfo: {
        type: TransactionInfoType.SETTINGS_CHANGE,
        settingsInfo: {
          type: SettingsInfoType.SWAP_OWNER,
        },
      },
    } as unknown)

    expect(txType).toEqual(TX_TYPES.owner_swap)
  })

  it('should return owner_threshold_change for change threshold settings changes', async () => {
    const txType = await getMockTxType({
      txInfo: {
        type: TransactionInfoType.SETTINGS_CHANGE,
        settingsInfo: {
          type: SettingsInfoType.CHANGE_THRESHOLD,
        },
      },
    } as unknown)

    expect(txType).toEqual(TX_TYPES.owner_threshold_change)
  })

  it('should return module_remove for disable module settings changes', async () => {
    const txType = await getMockTxType({
      txInfo: {
        type: TransactionInfoType.SETTINGS_CHANGE,
        settingsInfo: {
          type: SettingsInfoType.DISABLE_MODULE,
        },
      },
    } as unknown)

    expect(txType).toEqual(TX_TYPES.module_remove)
  })

  it('should return guard_remove for delete guard settings changes', async () => {
    const txType = await getMockTxType({
      txInfo: {
        type: TransactionInfoType.SETTINGS_CHANGE,
        settingsInfo: {
          type: SettingsInfoType.DELETE_GUARD,
        },
      },
    } as unknown)

    expect(txType).toEqual(TX_TYPES.guard_remove)
  })

  it('should return rejection for rejection transactions', async () => {
    const txType = await getMockTxType({
      txInfo: {
        type: TransactionInfoType.CUSTOM,
        isCancellation: true,
      },
    } as unknown)

    expect(txType).toEqual(TX_TYPES.rejection)
  })

  it('should return walletconnect for transactions w/o safeAppInfo', async () => {
    const txType = await getMockTxType({
      txInfo: {
        type: TransactionInfoType.CUSTOM,
      },
      safeAppInfo: null,
    } as unknown)

    expect(txType).toEqual(TX_TYPES.walletconnect)
  })

  it('should return safeapps for safeapps transactions', async () => {
    const txType = await getMockTxType({
      txInfo: {
        type: TransactionInfoType.CUSTOM,
      },
      safeAppInfo: {
        url: 'https://gnosis-safe.io/app',
      },
    } as unknown)

    expect(txType).toEqual('https://gnosis-safe.io/app')
  })

  it('should return batch for multisend transactions', async () => {
    const txType = await getMockTxType({
      txInfo: {
        type: TransactionInfoType.CUSTOM,
        methodName: 'multiSend',
        actionCount: 2,
      },
    } as unknown)

    expect(txType).toEqual(TX_TYPES.batch)
  })
})
