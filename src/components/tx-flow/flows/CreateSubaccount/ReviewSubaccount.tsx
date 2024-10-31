import { useContext, useEffect } from 'react'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { createSubaccount } from '@/components/tx-flow/flows/CreateSubaccount/create-subaccount-tx'
import useSafeInfo from '@/hooks/useSafeInfo'
import useBalances from '@/hooks/useBalances'
import { useCurrentChain } from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
import { useAppDispatch } from '@/store'
import { upsertAddressBookEntries } from '@/store/addressBookSlice'
import { getLatestSafeVersion } from '@/utils/chains'
import { getReadOnlyFallbackHandlerContract } from '@/services/contracts/safeContracts'
import useAsync from '@/hooks/useAsync'
import { computeNewSafeAddress } from '@/components/new-safe/create/logic'
import type { SetupSubaccountForm } from '@/components/tx-flow/flows/CreateSubaccount/SetupSubaccount'

export function ReviewSubaccount({ params }: { params: SetupSubaccountForm }) {
  const dispatch = useAppDispatch()
  const wallet = useWallet()
  const { safeAddress, safe } = useSafeInfo()
  const chain = useCurrentChain()
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)
  const { balances } = useBalances()
  const safeVersion = getLatestSafeVersion(chain)

  const [safeAccountConfig] = useAsync(async () => {
    const fallbackHandler = await getReadOnlyFallbackHandlerContract(safeVersion)
    const owners = [safeAddress]
    return {
      owners,
      threshold: owners.length,
      fallbackHandler: fallbackHandler?.contractAddress,
    }
  }, [safeVersion, safeAddress])

  const [predictedSafeAddress] = useAsync(async () => {
    if (!wallet?.provider || !safeAccountConfig || !chain || !safeVersion) {
      return
    }
    return computeNewSafeAddress(
      wallet.provider,
      {
        safeAccountConfig,
      },
      chain,
      safeVersion,
    )
  }, [wallet?.provider, safeAccountConfig, chain, safeVersion])

  useEffect(() => {
    if (!wallet?.provider || !safeAccountConfig || !predictedSafeAddress) {
      return
    }
    createSubaccount({
      provider: wallet.provider,
      assets: params.assets,
      safeAccountConfig,
      predictedSafeAddress,
      balances,
    })
      .then(setSafeTx)
      .catch(setSafeTxError)
  }, [wallet?.provider, params.assets, safeAccountConfig, predictedSafeAddress, balances, setSafeTx, setSafeTxError])

  const onSubmit = () => {
    if (!predictedSafeAddress) {
      return
    }
    dispatch(
      upsertAddressBookEntries({
        chainIds: [safe.chainId],
        address: predictedSafeAddress,
        name: params.name,
      }),
    )
  }

  return <SignOrExecuteForm onSubmit={onSubmit} />
}
