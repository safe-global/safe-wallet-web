import { useState, type ReactElement, SyntheticEvent } from 'react'
import { type TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Tooltip } from '@mui/material'

import useSafeInfo from '@/hooks/useSafeInfo'
import { isMultisigExecutionInfo } from '@/utils/transaction-guards'
import ExecuteTxModal from '@/components/tx/modals/ExecuteTxModal'
import useIsPending from '@/hooks/useIsPending'

const ExecuteTxButton = ({
  txSummary,
  children,
}: {
  txSummary: TransactionSummary
  children: (onClick: (e: SyntheticEvent) => void, isDisabled: boolean) => ReactElement
}): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)
  const { safe } = useSafeInfo()
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined
  const isPending = useIsPending({ txId: txSummary.id })

  const isNext = !!txNonce && !!safe.nonce && txNonce === safe.nonce
  const isDisabled = !isNext || isPending

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    setOpen(true)
  }

  return (
    <>
      <Tooltip title="Execute" arrow placement="top">
        {children(onClick, isDisabled)}
      </Tooltip>

      {open && <ExecuteTxModal onClose={() => setOpen(false)} initialData={[txSummary]} />}
    </>
  )
}

export default ExecuteTxButton
