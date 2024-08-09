import { type ReactElement, useContext, useEffect } from 'react'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { createTx } from '@/services/tx/tx-sender'
import { SafeTxContext } from '../../SafeTxProvider'
import { ComposableCowInterface } from '@/features/swap/helpers/composableCowInterface'
import { COMPOSABLE_COW_ADDRESS } from '@/features/swap/constants'

const CancelCoWOrder = ({ singleOrderHash }: { singleOrderHash: string }): ReactElement => {
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)

  useEffect(() => {
    createTx({
      to: COMPOSABLE_COW_ADDRESS,
      data: ComposableCowInterface.encodeFunctionData('remove', [singleOrderHash]),
      value: '0',
      operation: 0,
    })
      .then(setSafeTx)
      .catch(setSafeTxError)
  }, [setSafeTx, setSafeTxError, singleOrderHash])
  return <SignOrExecuteForm showToBlock></SignOrExecuteForm>
}

export default CancelCoWOrder
