import { useContext } from 'react'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { createUpdateSafeTxs } from '@/services/tx/safeUpdateParams'
import { createMultiSendCallOnlyTx, createTx } from '@/services/tx/tx-sender'
import { SafeTxContext } from '../../SafeTxProvider'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import useAsync from '@/hooks/useAsync'

export const UpdateSafeReview = () => {
  const { safe, safeLoaded } = useSafeInfo()
  const chain = useCurrentChain()
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)

  useAsync(async () => {
    if (!chain || !safeLoaded) return

    const txs = await createUpdateSafeTxs(safe, chain)
    const safeTxPromise = txs.length > 1 ? createMultiSendCallOnlyTx(txs) : createTx(txs[0])

    safeTxPromise.then(setSafeTx).catch(setSafeTxError)
  }, [safe, safeLoaded, chain, setSafeTx, setSafeTxError])

  return <SignOrExecuteForm />
}
