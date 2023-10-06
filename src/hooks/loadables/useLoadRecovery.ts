import { SENTINEL_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import type { Delay } from '@gnosis.pm/zodiac'

import { getDelayModifiers, MODULE_PAGE_SIZE } from '@/services/recovery/delay-modifier'
import useAsync from '../useAsync'
import useSafeInfo from '../useSafeInfo'
import { useWeb3ReadOnly } from '../wallets/web3'
import type { AsyncResult } from '../useAsync'
import type { RecoveryState } from '@/store/recoverySlice'

const getRecoveryState = async (delayModifier: Delay): Promise<RecoveryState[number]> => {
  const transactionAddedFilter = delayModifier.filters.TransactionAdded()

  const [[modules], txNonce, transactionsAdded] = await Promise.all([
    delayModifier.getModulesPaginated(SENTINEL_ADDRESS, MODULE_PAGE_SIZE),
    delayModifier.txNonce(),
    delayModifier.queryFilter(transactionAddedFilter),
  ])

  return {
    address: delayModifier.address,
    modules,
    txNonce: txNonce.toString(),
    transactionsAdded: transactionsAdded.filter(({ args }) => args.queueNonce.gte(txNonce)),
  }
}

// TODO: Polling
const useLoadRecovery = (): AsyncResult<RecoveryState> => {
  const { safe } = useSafeInfo()
  const web3ReadOnly = useWeb3ReadOnly()

  const [delayModifiers, delayModifiersError, delayModifiersLoading] = useAsync<Array<Delay>>(() => {
    if (!web3ReadOnly || safe.modules?.length === 0) {
      return
    }

    return getDelayModifiers(safe.chainId, safe.modules, web3ReadOnly)
    // Need to check length of modules array to prevent new request every time Safe info polls
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safe.chainId, safe.modules?.length, web3ReadOnly])

  const [recoveryState, recoveryStateError, recoveryStateLoading] = useAsync<RecoveryState>(() => {
    if (!delayModifiers || delayModifiers.length === 0) {
      return
    }

    return Promise.all(delayModifiers.map(getRecoveryState))
  }, [delayModifiers])

  return [recoveryState, delayModifiersError || recoveryStateError, delayModifiersLoading || recoveryStateLoading]
}

export default useLoadRecovery
